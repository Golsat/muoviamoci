// Specchio intelligente: la fotocamera frontale guarda gli esercizi in piedi con il ginocchio,
// conta le ripetizioni e avvisa a voce se il ginocchio va verso l'interno o troppo avanti.
// Tutto sul telefono (MediaPipe Pose, cartella vision/): nessuna immagine viene salvata o inviata.
// Libreria e modello (~15 MB) si scaricano solo la prima volta che lo specchio si accende.
const MIRROR = (() => {
  // Esercizi seguiti: rep = conta le ripetizioni (angolo del ginocchio sotto/sopra le soglie), hold = tenuta
  const EXS = {
    G10: { mode: "rep", down: 118, up: 155 },
    G11: { mode: "rep", down: 125, up: 155 },
    C5: { mode: "hold", min: 100 }
  };
  let land = null, loading = null, video = null, stream = null, box = null, canvas = null, raf = 0;
  let ex = null, st = null, say = () => { }, lastT = 0, failed = false;
  const base = () => new URL("vision/", document.baseURI).href;

  function load() {
    if (land) return Promise.resolve(land);
    if (loading) return loading;
    loading = import(base() + "vision_bundle.mjs").then(async V => {
      const files = await V.FilesetResolver.forVisionTasks(base() + "wasm");
      const opts = d => ({ baseOptions: { modelAssetPath: base() + "pose_landmarker_lite.task", delegate: d }, runningMode: "VIDEO", numPoses: 1 });
      try { land = await V.PoseLandmarker.createFromOptions(files, opts("GPU")); }
      catch (e) { land = await V.PoseLandmarker.createFromOptions(files, opts("CPU")); }
      return land;
    });
    loading.catch(() => { loading = null; });
    return loading;
  }

  let opening = null;
  function open(host, sayFn) {
    if (failed) return Promise.resolve(false);
    if (opening) return opening;
    opening = openNow(host, sayFn).finally(() => { opening = null; });
    return opening;
  }
  async function openNow(host, sayFn) {
    say = sayFn || say;
    if (!box) {
      box = document.createElement("div"); box.className = "mirror";
      box.innerHTML = `<video playsinline muted autoplay></video><canvas></canvas><span class="m-count"></span><span class="m-msg">Accendo lo specchio…</span>`;
      video = box.querySelector("video"); canvas = box.querySelector("canvas");
    }
    if (box.parentNode !== host) host.appendChild(box);
    if (stream) return true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 640 } }, audio: false });
      video.srcObject = stream; await video.play().catch(() => { });
      await load();
      msg("");
      say("g_sp_vedo.mp3");
      loop();
      return true;
    } catch (e) {
      failed = true; close();
      return false;
    }
  }
  function close() {
    cancelAnimationFrame(raf); raf = 0;
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null; ex = null;
    if (box) box.remove();
  }
  // Esercizio da seguire adesso (null = solo anteprima, nessun conteggio)
  function track(id) {
    ex = id && EXS[id] ? id : null;
    st = { reps: 0, phase: "up", ang: null, hold: 0, warn: {}, lost: 0 };
    if (box) { box.querySelector(".m-count").textContent = ex ? (EXS[ex].mode === "rep" ? "0" : "0\"") : ""; box.classList.toggle("on", !!ex); }
  }
  const msg = t => { if (box) box.querySelector(".m-msg").textContent = t; };
  const ang = (a, b, c) => {
    const v1 = [a.x - b.x, a.y - b.y], v2 = [c.x - b.x, c.y - b.y];
    const d = Math.hypot(...v1) * Math.hypot(...v2) || 1;
    return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / d))) * 180 / Math.PI;
  };
  function warn(k, file, text, now) {
    if (st.warn[k] && now - st.warn[k] < 6000) return;
    st.warn[k] = now; msg(text); say(file);
    setTimeout(() => { if (st && now === st.warn[k]) msg(""); }, 3000);
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    if (!land || !video || video.readyState < 2 || now - lastT < 80) return; // ~12 analisi al secondo
    lastT = now;
    let res; try { res = land.detectForVideo(video, now); } catch (e) { return; }
    const L = res && res.landmarks && res.landmarks[0];
    draw(L);
    if (!ex || !st) return;
    const cfg = EXS[ex];
    const ok = L && [23, 24, 25, 26, 27, 28].filter(i => (L[i].visibility ?? 1) > 0.5).length >= 4;
    if (!ok) { st.lost++; if (st.lost === 25) warn("lost", "g_sp_nonvedo.mp3", "Non ti vedo: allontana il telefono", now); return; }
    st.lost = 0;
    // Gamba più visibile e angolo del ginocchio (smussato)
    const legs = [[23, 25, 27, 31], [24, 26, 28, 32]].map(([h, k, a, f]) => ({ h: L[h], k: L[k], a: L[a], f: L[f], v: (L[k].visibility ?? 1) + (L[a].visibility ?? 1) }));
    const leg = legs[0].v >= legs[1].v ? legs[0] : legs[1];
    const raw = Math.min(...legs.filter(l => l.v > 1).map(l => ang(l.h, l.k, l.a)).concat([ang(leg.h, leg.k, leg.a)]));
    st.ang = st.ang == null ? raw : st.ang * 0.6 + raw * 0.4;
    const side = Math.abs(L[11].x - L[12].x) < 0.35 * Math.abs((L[11].y + L[12].y) / 2 - (L[23].y + L[24].y) / 2);
    // Ginocchia verso l'interno (di fronte) / oltre la punta del piede (di lato), solo da piegate
    if (st.ang < 155) {
      if (!side) {
        const kd = Math.abs(L[25].x - L[26].x), ad = Math.abs(L[27].x - L[28].x);
        if (ad > 0.04 && kd < 0.72 * ad) warn("valgo", "g_sp_valgo.mp3", "Ginocchia in fuori", now);
      } else {
        const dir = Math.sign(leg.f.x - leg.a.x) || 1, shin = Math.hypot(leg.k.x - leg.a.x, leg.k.y - leg.a.y);
        if ((leg.k.x - leg.f.x) * dir > 0.18 * shin) warn("avanti", "g_sp_avanti.mp3", "Ginocchio troppo avanti", now);
      }
    }
    const cnt = box.querySelector(".m-count");
    if (cfg.mode === "rep") {
      if (st.phase === "up" && st.ang < cfg.down) st.phase = "down";
      else if (st.phase === "down" && st.ang > cfg.up) { st.phase = "up"; st.reps++; cnt.textContent = st.reps; if (st.reps <= 20) say(`g_n${st.reps}.mp3`); }
    } else {
      if (st.ang < cfg.min) warn("basso", "g_sp_basso.mp3", "Scendi meno", now);
      if (st.ang < 165) { st.hold += 0.08; cnt.textContent = Math.floor(st.hold) + '"'; }
    }
  }

  // Scheletro semplice sopra il video (immagine a specchio, come guardarsi)
  function draw(L) {
    const w = canvas.width = canvas.clientWidth * 1.5, h = canvas.height = canvas.clientHeight * 1.5;
    const c = canvas.getContext("2d"); c.clearRect(0, 0, w, h);
    if (!L) return;
    const P = i => [L[i].x * w, L[i].y * h];
    c.lineWidth = 4; c.lineCap = "round"; c.strokeStyle = "rgba(255,255,255,.9)";
    for (const [a, b] of [[11, 12], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [11, 13], [13, 15], [12, 14], [14, 16], [27, 31], [28, 32]]) {
      if ((L[a].visibility ?? 1) < 0.4 || (L[b].visibility ?? 1) < 0.4) continue;
      c.beginPath(); c.moveTo(...P(a)); c.lineTo(...P(b)); c.stroke();
    }
    c.fillStyle = "#FF6B3D";
    for (const i of [25, 26]) if ((L[i].visibility ?? 1) > 0.4) { c.beginPath(); c.arc(...P(i), 7, 0, 7); c.fill(); }
  }

  return { supports: id => !!EXS[id], open, close, track, available: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !failed };
})();
