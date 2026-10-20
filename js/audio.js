// Voce di Isabella: coda di frasi registrate (cartella audio/), con priorità.
// alta = conto alla rovescia, interrompe; normale = in coda; bassa = solo se libera.
const VOICE = (() => {
  const base = "audio/";
  let cur = null, queue = [], volume = 1, muted = false, onText = null;
  const cache = new Map();
  const have = new Set(typeof CLIPS !== "undefined" ? CLIPS : []);
  let ctx = null;

  function el(file) {
    if (!cache.has(file)) { const a = new Audio(base + file); a.preload = "auto"; cache.set(file, a); }
    return cache.get(file);
  }
  function playNow(item) {
    const a = el(item.file);
    cur = { ...item, a };
    a.volume = volume; a.currentTime = 0;
    if (onText && item.text) onText(item.text);
    a.onended = a.onerror = () => { if (cur && cur.a === a) { cur = null; next(); } };
    const p = a.play();
    if (p && p.catch) p.catch(() => { cur = null; next(); });
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
  function stop() { queue = []; if (cur) { cur.a.pause(); cur = null; } }
  function busy() { return !!cur; }
  // Bip per la modalità "solo tempo"
  function beep(freq = 880, ms = 140) {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = freq; g.gain.value = 0.18 * volume;
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000);
    } catch (e) { /* audio non disponibile */ }
  }
  // Sblocca l'audio al primo tocco (richiesto dai telefoni)
  function unlock() {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); } catch (e) { }
  }
  return {
    say, stop, busy, beep, unlock,
    setVolume: v => { volume = v; if (cur) cur.a.volume = v; },
    setMuted: m => { muted = m; if (m) stop(); },
    isMuted: () => muted,
    onText: fn => { onText = fn; },
    pauseAll: () => { if (cur) cur.a.pause(); },
    resumeAll: () => { if (cur) cur.a.play().catch(() => { }); }
  };
})();
