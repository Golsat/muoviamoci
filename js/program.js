// Programma: calendario delle sedute, schemi A/B per blocco e settimana, regolazioni.
const PROGRAM = (() => {
  const START = "2026-10-20"; // primo martedì (anticipato al 20/10 su richiesta)
  const UNTIL = "2027-06-30"; // il calendario prosegue da solo fino a qui
  const MOVED = { "2026-12-24": "2026-12-23", "2026-12-31": "2026-12-30" };
  const NOTES = {
    "2026-10-20": "Prima seduta: guida voce completa",
    "2026-10-22": "Prima volta con i manubri: cura della forma",
    "2026-10-29": "Controllo 1 dei pollici con Claude",
    "2026-11-12": "Controllo 2: fine blocco 1",
    "2026-12-08": "Immacolata: se serve, spostala",
    "2026-12-10": "Controllo 3: fine blocco 2",
    "2026-12-23": "Anticipata da giovedì 24 (Vigilia)",
    "2026-12-30": "Anticipata da giovedì 31"
  };
  const CHECKS = [
    { date: "2026-10-29", n: "Controllo 1", t: "Dopo 4 sedute: prima lettura dei pollici e dei testi della voce." },
    { date: "2026-11-12", n: "Controllo 2", t: "Fine blocco 1: si decidono esercizi e carichi del blocco 2." },
    { date: "2026-12-10", n: "Controllo 3", t: "Fine blocco 2: si prepara il programma di gennaio." }
  ];
  const WEEK = {
    1: { n: "Tecnica", work: 40, rest: 20, giri: 2, finale: false },
    2: { n: "Volume", work: 45, rest: 15, giri: 2, finale: false },
    3: { n: "Intensità", work: 45, rest: 15, giri: 2, finale: true },
    4: { n: "Scarico", work: 30, rest: 30, giri: 1, finale: false },
    F: { n: "Feste", work: 40, rest: 20, giri: 1, finale: false }
  };
  const BLOCKS = { 1: "Blocco 1 · Basi", 2: "Blocco 2 · Forza", 3: "Blocco 3 · Feste" };
  const TITLE = { A: "Glutei, cosce, addome", B: "Braccia, schiena alta, addome, yoga" };

  // Utilità date (sempre in ora locale, formato AAAA-MM-GG)
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const today = () => iso(new Date());
  const GG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const MM = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const fmt = (s, long) => { const d = parse(s); return long ? `${GG[d.getDay()]} ${d.getDate()} ${MM[d.getMonth()]}` : `${GG[d.getDay()].slice(0, 3)} ${d.getDate()} ${MM[d.getMonth()].slice(0, 3)}`; };

  // Elenco delle sedute pianificate: martedì A, giovedì B
  function plan() {
    const out = [];
    let tue = START, wk = 0;
    while (tue <= UNTIL) {
      wk++;
      let block, week;
      if (wk <= 4) { block = 1; week = wk; }
      else if (wk <= 8) { block = 2; week = wk - 4; }
      else if (wk <= 10) { block = 3; week = "F"; }
      else { block = 4 + Math.floor((wk - 11) / 4); week = ((wk - 11) % 4) + 1; }
      for (const [type, off] of [["A", 0], ["B", 2]]) {
        let date = addDays(tue, off);
        if (MOVED[date]) date = MOVED[date];
        out.push({ i: out.length, date, type, block, week, note: NOTES[date] || "" });
      }
      tue = addDays(tue, 7);
    }
    return out;
  }
  const blockName = b => BLOCKS[b] || `Blocco ${b} · Forza`;

  // Schemi delle sedute. "x2" = esercizio da fare lato destro e sinistro.
  function template(type, block, week) {
    const b2 = block === 2 || block >= 4, w = WEEK[week];
    let T;
    if (type === "A") {
      T = [
        { k: "risc", clip: "blocco_risc", items: ["R1", "R2", "R4", "R8", "R5", "G1"] },
        { k: "forza", clip: "blocco_c1", n: "Circuito 1 · glutei", items: [b2 ? "G9" : "G1", "G4 x2", "G5 x2", b2 ? "G11 x2" : "G10"] },
        { k: "forza", clip: "blocco_c2", n: "Circuito 2 · cosce e addome", items: ["C1 x2", "C2", "A1", "A4", "A5 x2"] },
        { k: "allung", clip: "blocco_allung", items: ["Y3 x2", "Y4 x2", "Y7", "Y5 x2", "Y8"] }
      ];
      if (week === 2 || week === 3) { T[1].items[1] = "G7 x2"; T[2].items[0] = "C4 x2"; }
      if (week === 3) { T[1].items[0] = "G3 x2"; T[1].items.splice(3, 0, "G6 x2"); }
      if (w.finale) T.splice(3, 0, { k: "finale", clip: "blocco_finale", items: ["G2"], dur: 120 });
    } else {
      T = [
        { k: "risc", clip: "blocco_risc", items: ["R1", "R6", "R7 x2", "R3", "R5"] },
        { k: "forza", clip: "blocco_c1", n: "Circuito 1 · braccia e postura", items: b2 ? ["B2", "M4", "M3", "M1", "B6", "M6", "B3"] : ["B1", "M4", "M3", "M1", "M2", "B3", "B4"] },
        { k: "forza", clip: "blocco_c2", n: "Circuito 2 · addome", items: ["A6", "A3", "A7", "A8", "A2"] },
        { k: "yoga", clip: "blocco_yoga", items: ["R3", "Y2", "Y1", "Y6 x2", "Y5 x2", "Y8"] }
      ];
      if (week === 2 || week === 3) T[1].items.splice(3, 0, "M5");
      if (week === 3) T[1].slow = true;
      if (w.finale) T.splice(3, 0, { k: "finale", clip: "blocco_finale", items: ["B7"], dur: 90 });
    }
    return T;
  }

  // Esercizi disponibili in un blocco (campo b di EX: "1", "1 (sett. 2)", "2")
  const availableIn = (e, block) => parseInt(e.b, 10) <= Math.min(block, 2) || block >= 4;
  function replacement(id, sess, st, block) {
    const e = BY[id], used = new Set(sess);
    const ok = x => x.z === e.z && x.id !== id && !used.has(x.id) && !st.excluded.includes(x.id) && availableIn(x, block) &&
      (!st.knee.includes(x.id)) && (!st.knee.length || x.k === "ok" || !st.kneeStrict);
    const cands = EX.filter(ok);
    return (cands.find(x => x.k === "ok" && x.s.includes(e.s.split(" ")[0])) || cands.find(x => x.k === "ok") || cands[0] || e).id;
  }

  // Costruisce la seduta finale applicando le regolazioni di lei
  // st: { yoga 0-4, focus [], intensity "leggera|normale|sfidante", minutes 20|30|45, excluded [], knee [], tweak {id: +-sec} }
  function build(s, st) {
    const w = WEEK[s.week];
    let T = template(s.type, s.block, s.week).map(b => ({ ...b, items: [...b.items] }));
    let work = w.work, rest = w.rest, giri = w.giri;
    if (st.intensity === "leggera") { work -= 10; rest += 10; T = T.filter(b => b.k !== "finale"); }
    if (st.intensity === "sfidante") { work += 5; rest = Math.max(10, rest - 5); if (!T.some(b => b.k === "finale")) T.splice(T.length - 1, 0, { k: "finale", clip: "blocco_finale", items: [s.type === "A" ? "G2" : "B7"], dur: 60 }); }
    const forza = T.filter(b => b.k === "forza");
    const stretch = T.find(b => b.k === "allung" || b.k === "yoga");
    // Cursore yoga <-> tonificazione (3 = più tonificazione, valore di partenza)
    const extraYoga = ["Y1", "Y2", "Y6 x2", "R3", "Y7"];
    if (st.yoga === 4) stretch.items = [...stretch.items.slice(0, 2), "Y8"];
    if (st.yoga <= 2) { forza[1].giri = 1; stretch.items.splice(-1, 0, ...extraYoga.filter(x => !stretch.items.includes(x)).slice(0, 2)); }
    if (st.yoga <= 1) { forza[0].giri = 1; stretch.items.splice(-1, 0, ...extraYoga.filter(x => !stretch.items.includes(x))); }
    if (st.yoga === 0) { forza[1].items = forza[1].items.slice(0, 2); }
    // Zone su cui insistere: un esercizio in più per zona
    const used = () => T.flatMap(b => b.items.map(x => x.split(" ")[0]));
    for (const z of st.focus || []) {
      const c = EX.find(e => e.z === z && !used().includes(e.id) && availableIn(e, s.block) && !st.excluded.includes(e.id) && !st.knee.includes(e.id) && (z !== "bra" || s.type === "B" || !e.m));
      if (c) (z === "glu" || z === "bra" ? forza[0] : forza[1]).items.push(c.id + (/(G4|G5|G6|G7|G11|C1|C4|A5)$/.test(c.id) ? " x2" : ""));
    }
    // Durata
    if (st.minutes <= 30) giri = 1;
    if (st.minutes <= 20) { T.forEach(b => { b.items = b.items.slice(0, b.k === "allung" || b.k === "yoga" ? 3 : 4); }); T = T.filter(b => b.k !== "finale"); }
    // Esclusi e fastidio al ginocchio: sostituiti con un equivalente
    for (const b of T) b.items = b.items.map(x => {
      const [id, sx] = x.split(" ");
      if (!st.excluded.includes(id) && !st.knee.includes(id)) return x;
      const r = replacement(id, used(), { ...st, kneeStrict: st.knee.includes(id) }, s.block);
      return r + (sx ? " x2" : "");
    });
    return { s, blocks: T.map(b => ({ ...b, giri: b.k === "forza" ? (b.giri || giri) : 1 })), work, rest, tweak: st.tweak || {} };
  }

  // Seduta da un piano personale
  function fromPlan(p) {
    return { s: { type: "P", name: p.name }, blocks: [{ k: "forza", clip: "blocco_piano", n: p.name, items: p.items.map(x => x.id + (x.both ? " x2" : "")), giri: p.giri || 1, custom: p.items }], work: p.work || 40, rest: p.rest || 20, tweak: {} };
  }

  // Sequenza dei passi a tempo per il lettore
  function steps(sess) {
    const out = [];
    const timed = { risc: 60, allung: 60, yoga: 60 };
    for (const b of sess.blocks) {
      out.push({ kind: "intro", block: b, dur: 6, clip: "g_" + b.clip });
      for (let g = 1; g <= b.giri; g++) {
        if (g === 2) out.push({ kind: "intro", block: b, dur: 5, clip: "g_giro2", label: "Secondo giro" });
        b.items.forEach((x, n) => {
          const [id, sx] = x.split(" "), e = BY[id];
          if (!e) return;
          const cust = b.custom ? b.custom[n] : null;
          let work = b.dur || (timed[b.k] ? (id === "Y8" ? 120 : timed[b.k]) : sess.work);
          if (cust && cust.work) work = cust.work;
          work = Math.max(15, work + (sess.tweak[id] || 0));
          const rest = timed[b.k] ? 8 : (n === 0 ? 12 : sess.rest);
          const sides = sx ? ["dx", "sx"] : [null];
          sides.forEach((side, k) => {
            out.push({ kind: "rest", block: b, ex: e, side, dur: k ? 6 : rest, first: k === 0, giro: g, slow: b.slow });
            out.push({ kind: "work", block: b, ex: e, side, dur: sx && timed[b.k] ? Math.round(work * 0.75) : work, giro: g, slow: b.slow, calm: !!timed[b.k], last: k === sides.length - 1 });
          });
        });
      }
    }
    return out;
  }
  const totalSec = st => st.reduce((a, x) => a + x.dur, 0);

  return { plan, build, fromPlan, steps, totalSec, template, WEEK, TITLE, CHECKS, blockName, iso, parse, addDays, today, fmt, GG, MM };
})();
