// Voce di Isabella: coda di frasi registrate (cartella audio/), con priorità.
// alta = conto alla rovescia, interrompe; normale = in coda; bassa = solo se libera.
// Suona con Web Audio (un solo contesto): niente limite di lettori su Android
// e la musica di un'altra app non viene messa in pausa.
const VOICE = (() => {
  const base = "audio/";
  let cur = null, queue = [], volume = 1, muted = false, onText = null, paused = false;
  const have = new Set(typeof CLIPS !== "undefined" ? CLIPS : []);
  const buf = new Map(); // file -> Promise<AudioBuffer>, al massimo MAXB in memoria
  const MAXB = 40;
  let ctx = null, gain = null;

  function audio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain(); gain.gain.value = volume; gain.connect(ctx.destination);
    }
    return ctx;
  }
  function load(file) {
    if (buf.has(file)) { const p = buf.get(file); buf.delete(file); buf.set(file, p); return p; }
    const p = fetch(base + file).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, ko) => audio().decodeAudioData(ab, ok, ko)));
    p.catch(() => buf.delete(file));
    buf.set(file, p);
    while (buf.size > MAXB) buf.delete(buf.keys().next().value);
    return p;
  }
  // ---- Musica di sottofondo: «mov» (riscaldamento e circuiti) e «yoga» (yoga e allungamento), brani in music/ ----
  const MUS = { mov: ["mov1.mp3", "mov2.mp3"], yoga: ["yoga1.mp3", "yoga2.mp3"] };
  let mGain = null, mood = null, mSrc = null, mOn = true, mVol = 0.35, mTok = 0;
  const mIdx = { mov: Math.floor(Math.random() * 2), yoga: Math.floor(Math.random() * 2) };
  function mLevel() { return mOn && mood ? (cur ? mVol * 0.3 : mVol) : 0; }
  function mRamp(sec = 0.4) {
    if (!mGain || !ctx) return;
    const g = mGain.gain, t = ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(mLevel(), t + sec);
  }
  function mFadeOut() {
    if (!mSrc) return;
    const { s, g } = mSrc; mSrc = null;
    try { const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 1.5); s.onended = null; s.stop(t + 1.6); } catch (e) { }
  }
  function mStart() {
    const my = ++mTok, list = MUS[mood], f = list[mIdx[mood]++ % list.length];
    if (!mGain) { mGain = audio().createGain(); mGain.gain.value = 0; mGain.connect(ctx.destination); }
    fetch("music/" + f).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, ko) => audio().decodeAudioData(ab, ok, ko)))
      .then(b => {
        if (my !== mTok) return;
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = b; g.gain.value = 0; src.connect(g); g.connect(mGain);
        g.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
        src.onended = () => { if (my === mTok && mood && mOn) { mSrc = null; mStart(); } }; // finito un brano parte l'altro
        src.start(); mSrc = { s: src, g }; mRamp();
      }).catch(() => { });
  }
  function music(m) {
    if (m === mood) return;
    mood = m; mTok++; mFadeOut();
    if (m && mOn) mStart(); else mRamp();
  }
  function setMusicOn(on) {
    mOn = !!on;
    if (!mOn) { mTok++; mFadeOut(); } else if (mood && !mSrc) mStart();
    mRamp();
  }

  function playNow(item) {
    const token = {};
    cur = { ...item, token, src: null }; mRamp(0.25);
    if (onText && item.text) onText(item.text);
    load(item.file).then(b => {
      if (!cur || cur.token !== token) return;
      const s = audio().createBufferSource();
      s.buffer = b; s.connect(gain);
      s.onended = () => { if (cur && cur.token === token) { cur = null; next(); mRamp(0.8); } };
      cur.src = s; s.start();
    }).catch(() => { if (cur && cur.token === token) { cur = null; next(); mRamp(0.8); } });
  }
  function next() {
    while (queue.length) {
      const it = queue.shift();
      if (it.until && performance.now() > it.until) continue;
      playNow(it); return;
    }
  }
  function say(file, opts = {}) {
    if (muted || !file || !have.has(file)) return;
    const item = { file, prio: opts.prio || "n", text: opts.text, until: opts.maxDelay ? performance.now() + opts.maxDelay * 1000 : 0 };
    if (item.prio === "h") { stop(); playNow(item); return; }
    if (cur) { if (item.prio === "l") return; queue.push(item); return; }
    playNow(item);
  }
  function stop() {
    queue = [];
    if (cur) { const s = cur.src; cur = null; try { if (s) { s.onended = null; s.stop(); } } catch (e) { } }
    mRamp(0.8);
  }
  // Occupata solo se l'audio sta davvero andando: con l'audio sospeso dal telefono la frase non finirebbe mai
  function busy() { return !!cur && (!ctx || ctx.state === "running"); }
  // Bip per la modalità "solo tempo"
  function beep(freq = 880, ms = 140) {
    if (muted) return;
    try {
      const c = audio(), o = c.createOscillator(), g = c.createGain();
      o.frequency.value = freq; g.gain.value = 0.18 * volume;
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + ms / 1000);
    } catch (e) { /* audio non disponibile */ }
  }
  // Sblocca l'audio al primo tocco (richiesto dai telefoni)
  function unlock() {
    try { audio(); if (ctx.state === "suspended" && !paused) ctx.resume(); } catch (e) { }
  }
  return {
    say, stop, busy, beep, unlock, music, setMusicOn,
    setMusicVol: v => { mVol = v; mRamp(0.2); },
    durationOf: f => have.has(f) ? load(f).then(b => b.duration) : Promise.resolve(0),
    preload: files => files.forEach(f => { if (have.has(f)) load(f).catch(() => { }); }),
    setVolume: v => { volume = v; if (gain) gain.gain.value = v; },
    setMuted: m => { muted = m; if (m) stop(); },
    isMuted: () => muted,
    onText: fn => { onText = fn; },
    pauseAll: () => { paused = true; if (ctx) ctx.suspend().catch(() => { }); },
    resumeAll: () => { paused = false; if (ctx) ctx.resume().catch(() => { }); }
  };
})();
