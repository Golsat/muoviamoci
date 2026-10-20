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
  function playNow(item) {
    const token = {};
    cur = { ...item, token, src: null };
    if (onText && item.text) onText(item.text);
    load(item.file).then(b => {
      if (!cur || cur.token !== token) return;
      const s = audio().createBufferSource();
      s.buffer = b; s.connect(gain);
      s.onended = () => { if (cur && cur.token === token) { cur = null; next(); } };
      cur.src = s; s.start();
    }).catch(() => { if (cur && cur.token === token) { cur = null; next(); } });
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
  }
  function busy() { return !!cur; }
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
    say, stop, busy, beep, unlock,
    preload: files => files.forEach(f => { if (have.has(f)) load(f).catch(() => { }); }),
    setVolume: v => { volume = v; if (gain) gain.gain.value = v; },
    setMuted: m => { muted = m; if (m) stop(); },
    isMuted: () => muted,
    onText: fn => { onText = fn; },
    pauseAll: () => { paused = true; if (ctx) ctx.suspend().catch(() => { }); },
    resumeAll: () => { paused = false; if (ctx) ctx.resume().catch(() => { }); }
  };
})();
