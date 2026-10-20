// Figure animate degli esercizi: scheletro 2D con pose chiave interpolate.
// Angoli in gradi, 0 = verso destra, 90 = verso l'alto. Le pose sono "viste di lato"
// (o "dall'alto" con v:"top"). Ogni arto: [angolo segmento 1, angolo segmento 2, scala 1, scala 2].
const FIG = (() => {
  const L = { T: 40, UA: 22, FA: 20, TH: 30, SH: 28, F: 9, NECK: 13, HR: 8.5 };
  const GROUND = 148;

  const BASE = {
    stand: { t: 90, n: 90, c: 0, aN: [-92, -88], aF: [-88, -92], lN: [-90, -90], lF: [-90, -90] },
    supKB: { t: 180, n: 180, c: 0, aN: [2, 0], aF: [3, 0], lN: [50, -55], lF: [52, -55], fN: 0, fF: 0 },
    supL: { t: 180, n: 180, c: 0, aN: [2, 0], aF: [3, 0], lN: [0, 0], lF: [1, 1], fN: 75, fF: 75 },
    quad: { t: 17, n: 17, c: 0, aN: [-90, -90], aF: [-88, -90], lN: [-90, 180], lF: [-88, 180], fN: 180, fF: 180 },
    prone: { t: 0, n: -5, c: 0, aN: [180, 180], aF: [180, 180], lN: [185, 185], lF: [185, 185], fN: 180, fF: 180 },
    side: { t: 180, n: 172, c: 0, aN: [6, 0], aF: [178, 178], lN: [2, 0], lF: [0, 0], fN: 75, fF: 75 },
    sit: { t: 90, n: 90, c: 0, aN: [-75, -75], aF: [-77, -77], lN: [0, 0], lF: [1, 1], fN: 80, fF: 80 }
  };
  const HIPS = { aN: [-120, -20], aF: [-118, -20] };
  const TABLE = { lN: [90, 0], lF: [92, 0], fN: 90, fF: 90 };
  const BRIDGE = { t: 219, lN: [0, -55], lF: [2, -55] };

  // b: posa base; K: pose chiave (andata e ritorno); an: punto fermo; d: secondi per ciclo; pr: oggetti
  const P = {
    R1: { b: "supKB", K: [{ aN: [40, -60] }, { aN: [44, -58], c: 3 }], d: 5 },
    R2: { b: "supKB", K: [{ c: 1 }, { t: 183, c: -2 }], an: "ankleN", d: 4 },
    R3: { b: "quad", K: [{ c: 8, n: -45 }, { c: -6, n: 40 }], an: "handN", d: 4 },
    R4: { b: "supKB", K: [{}, { lN: [30, -75], lF: [32, -73] }], an: "shoulder", d: 4 },
    R5: { b: "stand", K: [{ lN: [-25, -110], aN: [-125, -115], aF: [-55, -15] }, { lF: [-25, -110], aF: [-125, -115], aN: [-55, -15] }], d: 1.2 },
    R6: { b: "stand", fr: 1, K: [{ aN: [-15, 85], aF: [195, 95] }, { aN: [55, 58], aF: [125, 122] }], d: 4 },
    R7: { b: "top", K: [{}, { aN: [90, 95] }], d: 5, v: "top" },
    R8: { b: "stand", K: [{ ...HIPS, lN: [-93, -88], lF: [-93, -88] }, { t: 38, n: 30, aN: [-150, -110], aF: [-148, -110], lN: [-72, -97], lF: [-72, -97] }], an: "ankleN", d: 4 },

    G1: { b: "supKB", K: [{}, BRIDGE], an: "shoulder", d: 3 },
    G2: { b: "supKB", K: [BRIDGE, { t: 213, lN: [3, -58], lF: [5, -58] }], an: "shoulder", d: 0.8 },
    G3: { b: "supKB", K: [{ lN: [40, 40], fN: 130 }, { t: 219, lN: [0, 0], fN: 90, lF: [2, -55] }], an: "shoulder", d: 3 },
    G4: { b: "side", K: [{ lN: [4, -170], lF: [0, -170], fN: 10, fF: 10 }, { lN: [35, -150], lF: [0, -170], fN: 10, fF: 10 }], d: 2.5 },
    G5: { b: "side", K: [{ lN: [4, 4] }, { lN: [33, 33] }], d: 2.5 },
    G6: { b: "quad", K: [{}, { lN: [-200, 70], fN: 160 }], an: "handN", d: 2.5 },
    G7: { b: "quad", K: [{}, { lN: [-90, 180, 0.3, 1] }], an: "handN", d: 2.5 },
    G8: { b: "quad", K: [{}, { lN: [-182, 180] }], an: "handN", d: 2.5 },
    G9: { b: "supKB", K: [{ lN: [50, -60, 0.7, 0.8], lF: [52, -60, 0.7, 0.8] }, { t: 213, lN: [8, -60, 0.7, 0.8], lF: [10, -60, 0.7, 0.8] }], an: "shoulder", d: 1 },
    G10: { b: "stand", K: [{}, { t: 52, n: 40, lN: [-5, -95], lF: [-5, -95], aN: [0, 0], aF: [2, 2] }], an: "ankleN", d: 3, pr: [{ type: "chair", k: 1, j: "hip", dx: -4, dy: -6 }] },
    G11: { b: "stand", K: [{ ...HIPS, lN: [-78, -95], lF: [-108, -115], fF: -30 }, { ...HIPS, lN: [-38, -100], lF: [-120, -160], fF: -40 }], an: "ankleN", d: 3 },

    C1: { b: "side", K: [{ lN: [40, -60], fN: 0 }, { lN: [40, -60], fN: 0, lF: [12, 12] }], d: 2.5 },
    C2: { b: "supKB", K: [{}, BRIDGE], an: "shoulder", d: 3, pr: [{ type: "cushion", j: "kneeN" }] },
    C3: { b: "supKB", K: [{}, { lN: [52, -55], lF: [50, -55] }], d: 2, pr: [{ type: "cushion", j: "kneeN" }] },
    C4: { b: "stand", fr: 1, K: [{ lN: [-88, -88], lF: [-94, -94], aF: [-135, -95], aN: [-80, -90] }, { lN: [-55, -55], lF: [-94, -94], aF: [-135, -95], aN: [-80, -90] }], d: 2.5, pr: [{ type: "chairBack", k: 0, j: "handF" }] },
    C5: { b: "stand", K: [{ lN: [-50, -87], lF: [-50, -87], aN: [-70, -25], aF: [-68, -25] }, { lN: [-45, -90], lF: [-45, -90], aN: [-70, -25], aF: [-68, -25] }], an: "ankleN", d: 4, pr: [{ type: "wall", k: 1, j: "hip", dx: -7 }] },

    A1: { b: "supKB", K: [{ ...TABLE, aN: [90, 90], aF: [92, 92] }, { ...TABLE, lN: [40, -50], fN: 0, aN: [90, 90], aF: [92, 92] }], d: 3 },
    A2: { b: "supKB", K: [{}, { lN: [4, -4], fN: 70 }], d: 3 },
    A3: { b: "supKB", K: [{ lF: [0, 0], fF: 80 }, { t: 168, n: 150, c: 2, lF: [0, 0], fF: 80 }], d: 3 },
    A4: { b: "quad", K: [{ t: 18, n: 15, aN: [-90, 0], aF: [-88, 0], lN: [198, 180], lF: [198, 180] }, { t: 18, n: 15, c: -2, aN: [-90, 0], aF: [-88, 0], lN: [198, 180], lF: [198, 180] }], d: 4 },
    A5: { b: "quad", K: [{ t: 10, n: 10, aN: [-90, 0], aF: [-88, 0], lN: [190, 170], lF: [190, 170] }, { t: 18, n: 15, aN: [-90, 0], aF: [-88, 0], lN: [198, 180], lF: [198, 180] }], an: "elbowN", d: 3 },
    A6: { b: "quad", K: [{}, { aN: [10, 10], lF: [-182, 180] }], an: "kneeN", d: 3 },
    A7: { b: "sit", fr: 1, K: [{ lN: [-80, -90, 0.3, 0.3], lF: [-100, -90, 0.3, 0.3], aN: [0, 0], aF: [180, 180] }, { lN: [-80, -90, 0.3, 0.3], lF: [-100, -90, 0.3, 0.3], aN: [0, 0, 0.35, 0.35], aF: [180, 180, 0.35, 0.35] }], d: 3 },
    A8: { b: "supKB", K: [{ ...TABLE, aN: [14, 14], aF: [14, 14] }, { ...TABLE, aN: [6, 6], aF: [6, 6] }], d: 0.5 },

    B1: { b: "stand", K: [{ t: 72, n: 72, lN: [-108, -108], lF: [-108, -108], aN: [0, 0], aF: [2, 2] }, { t: 62, n: 62, lN: [-118, -118], lF: [-118, -118], aN: [-40, 30], aF: [-38, 32] }], an: "ankleN", d: 3, pr: [{ type: "wall", k: 0, j: "handN", dx: 3 }] },
    B2: { b: "quad", K: [{ t: 37, n: 30, aN: [-90, -90], aF: [-88, -88], lN: [217, 180], lF: [217, 180] }, { t: 24, n: 18, aN: [-135, -50], aF: [-133, -50], lN: [204, 180], lF: [204, 180] }], an: "kneeN", d: 3 },
    B3: { b: "prone", K: [{ aN: [0, 0], aF: [0, 0], n: -10 }, { aN: [14, 14], aF: [14, 14], n: 0, c: 1 }], d: 2.5 },
    B4: { b: "prone", K: [{ aN: [10, 10], aF: [0, 0], lN: [185, 185], lF: [177, 177] }, { aN: [0, 0], aF: [10, 10], lN: [177, 177], lF: [185, 185] }], d: 0.7 },
    B5: { b: "prone", K: [{ t: 8, aN: [-20, 0], aF: [-20, 0] }, { t: 33, n: 20, aN: [-90, 0], aF: [-88, 0] }], an: "hip", d: 3.5 },
    B6: { b: "stand", K: [{ t: 88, n: 88, aN: [-100, -100], aF: [-98, -98], lN: [0, -90], lF: [2, -90] }, { t: 85, n: 85, aN: [-150, -85], aF: [-148, -85], lN: [20, -102], lF: [22, -102] }], an: "handN", d: 3, pr: [{ type: "chair", k: 0, j: "handN", dx: 4, dy: -2 }] },
    B7: { b: "stand", fr: 1, K: [{ aN: [0, 0], aF: [180, 180] }, { aN: [6, 6], aF: [174, 174] }], d: 0.6 },
    B8: { b: "prone", K: [{ aN: [176, 176], aF: [176, 176] }, { aN: [90, 90, 0.05, 0.05], aF: [90, 90, 0.05, 0.05] }, { aN: [8, 8], aF: [8, 8] }], d: 4 },

    M1: { b: "stand", K: [{}, { aN: [-92, 55], aF: [-88, 57] }], d: 2.5 }, // gomito max ~145° (prima 167°, oltre il possibile)
    M2: { b: "stand", K: [{ aN: [95, 92], aF: [93, 90] }, { aN: [100, 250], aF: [98, 252] }], d: 3 },
    M3: { b: "stand", fr: 1, K: [{ aN: [-85, -87], aF: [-95, -93] }, { aN: [-5, -8], aF: [185, 188] }], d: 2.5 },
    M4: { b: "stand", K: [{ t: 40, n: 20, lN: [-78, -100], lF: [-78, -100], aN: [-90, -90], aF: [-88, -88] }, { t: 40, n: 20, lN: [-78, -100], lF: [-78, -100], aN: [-195, -90], aF: [-197, -90] }], an: "ankleN", d: 2.5 },
    M5: { b: "stand", fr: 1, K: [{ aN: [-10, 88], aF: [190, 92] }, { aN: [78, 85], aF: [102, 95] }], d: 2.5 },
    M6: { b: "supKB", K: [{ aN: [90, 90], aF: [90, 90] }, { aN: [90, 92, 0.4, 0.4], aF: [90, 88, 0.4, 0.4] }], d: 3 },

    Y1: { b: "child", K: [{}, { c: 6 }], d: 5, pr: [{ type: "cushion", j: "hip", dy: -7, dx: 4 }] },
    Y2: { b: "dog", K: [{}, { lN: [-120, -68], lF: [-116, -84] }], an: "handN", d: 2 },
    Y3: { b: "supKB", K: [{ lF: [62, -25], lN: [22, 78], fN: 90, aN: [40, 30], aF: [42, 30] }, { lF: [98, 5], lN: [60, 100], fN: 120, aN: [55, 35], aF: [57, 35] }], d: 4 },
    Y4: { b: "supKB", K: [{ lN: [75, 75], fN: 150, aN: [55, 70], aF: [57, 70] }, { lN: [88, 88], fN: 165, aN: [62, 80], aF: [64, 80] }], d: 5, pr: [{ type: "strap", j: "handN", j2: "ankleN" }] },
    Y5: { b: "supL", K: [{ lN: [60, -30], fN: 0 }, { lN: [25, -60, 0.7, 1], fN: -30 }], an: "shoulder", d: 5 },
    Y6: { b: "lunge", K: [{}, { t: 95, n: 95, lN: [-5, -85], lF: [-118, 180] }], an: "ankleN", d: 4 },
    Y7: { b: "sit", K: [{ lN: [-5, -150, 0.55, 0.6], lF: [-3, -150, 0.55, 0.6], aN: [-65, -40], aF: [-63, -40], fN: -150, fF: -150 }, { t: 62, n: 50, lN: [-5, -150, 0.55, 0.6], lF: [-3, -150, 0.55, 0.6], aN: [-30, -30], aF: [-28, -30], fN: -150, fF: -150 }], d: 4 },
    Y8: { b: "supL", K: [{}, { c: 2 }], d: 6 },
    E1: { b: "stand", K: [{}, { lN: [-35, -100] }], d: 4 },
    E2: { b: "stand", K: [{}, { t: 92, n: 92 }], d: 2.5 },
    E3: { b: "stand", fr: 1, K: [{}, { lN: [-70, -70] }], d: 2 },
    E4: { b: "supKB", K: [{}, { c: 1 }], d: 5 }
  };
  BASE.top = { t: 180, n: 180, c: 0, aN: [-90, -90], aF: [-92, -92], lN: [-90, 0], lF: [-92, 0], fN: 0, fF: 0 };
  BASE.child = { t: -12, n: -25, c: 3, aN: [-8, 0], aF: [-6, 0], lN: [-15, 180], lF: [-13, 180], fN: 180, fF: 180 };
  BASE.dog = { t: -40, n: -65, c: 0, aN: [-40, -40], aF: [-38, -38], lN: [-120, -75], lF: [-118, -75], fN: -10, fF: -10 };
  BASE.lunge = { t: 90, n: 90, c: 0, aN: [-60, -30], aF: [-58, -30], lN: [0, -90], lF: [-110, 180], fN: 0, fF: 180 };

  // Muscolo che lavora (zona evidenziata) e ritmo continuo
  const HL_ZONE = { glu: ["glute"], cos: ["thigh"], add: ["core"], bra: ["arm"] };
  const HL = {
    G10: ["glute", "thigh"], C5: ["thigh"], G11: ["glute", "thigh"], C2: ["glute", "thigh"], A5: ["core"], A6: ["back", "glute"],
    B1: ["chest"], B2: ["chest"], M6: ["chest"], B3: ["back"], B4: ["back"], B5: ["back"], B8: ["back"], M4: ["back"],
    M3: ["shoulder"], M5: ["shoulder"], B7: ["shoulder"], R6: ["back"]
  };
  const CONT = new Set(["R5", "B4", "A8", "B7", "G2", "G9", "Y2", "R1", "Y8", "Y1", "A4"]);
  const ZONE_OF = id => (typeof BY !== "undefined" && BY[id]) ? BY[id].z : "";

  const rad = d => d * Math.PI / 180;
  const pt = (o, len, deg) => [o[0] + len * Math.cos(rad(deg)), o[1] + len * Math.sin(rad(deg))];
  const limb = a => [a[0], a[1], a[2] ?? 1, a[3] ?? 1];

  function full(p, fr) {
    const q = { sw: fr ? 9 : 0, pw: fr ? 6 : 0, ...p };
    for (const k of ["aN", "aF", "lN", "lF"]) q[k] = limb(q[k]);
    if (q.fN === undefined) q.fN = fr ? -20 : q.lN[1] + 90;
    if (q.fF === undefined) q.fF = fr ? 200 : q.lF[1] + 90;
    return q;
  }
  function keyframes(id) {
    const s = P[id];
    return s.K.map(k => full({ ...BASE[s.b], ...k }, s.fr));
  }
  function lerp(a, b, u) {
    const o = {};
    for (const k in a) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => v + (b[k][i] - v) * u) : a[k] + (b[k] - a[k]) * u;
    return o;
  }
  function joints(p) {
    const J = { hip: [0, 0] };
    J.shoulder = pt(J.hip, L.T, p.t);
    J.head = pt(J.shoulder, L.NECK, p.n);
    const side = p.t - 90; // lato "vicino" (destra della figura in vista frontale)
    for (const s of ["N", "F"]) {
      const sg = s === "N" ? 1 : -1, a = p["a" + s], l = p["l" + s];
      const sh = pt(J.shoulder, p.sw * sg, side), hp = pt(J.hip, p.pw * sg, side);
      J["sh" + s] = sh; J["hp" + s] = hp;
      J["elbow" + s] = pt(sh, L.UA * a[2], a[0]);
      J["hand" + s] = pt(J["elbow" + s], L.FA * a[3], a[1]);
      J["knee" + s] = pt(hp, L.TH * l[2], l[0]);
      J["ankle" + s] = pt(J["knee" + s], L.SH * l[3], l[1]);
      J["toe" + s] = pt(J["ankle" + s], L.F * Math.min(1, l[3]), p["f" + s]);
    }
    const m = [(J.hip[0] + J.shoulder[0]) / 2, (J.hip[1] + J.shoulder[1]) / 2];
    J.ctrl = pt(m, p.c, p.t + 90);
    return J;
  }
  const SKIP = new Set(["ctrl", "shN", "shF", "hpN", "hpF"]);
  const R = { hip: 8.5, shoulder: 9, head: L.HR + 1 };
  function minY(J) { let m = Infinity; for (const k in J) if (!SKIP.has(k)) m = Math.min(m, J[k][1] - (R[k] ?? 4.5)); return m; }
  function bbox(J) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const k in J) { if (SKIP.has(k)) continue; x0 = Math.min(x0, J[k][0]); x1 = Math.max(x1, J[k][0]); y0 = Math.min(y0, J[k][1]); y1 = Math.max(y1, J[k][1]); }
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }
  // Punto e raggio della zona muscolare evidenziata
  function hlSpot(kind, J, p) {
    const mid = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    const post = p.t + 90, ant = p.t - 90;
    switch (kind) {
      case "glute": return p.sw ? [pt(J.hpN, 5, ant), 9] : [pt(J.hip, 6, post), 11];
      case "thigh": return [mid(J.hpN, J.kneeN, 0.45), 9];
      case "core": return [pt(mid(J.hip, J.shoulder, 0.32), p.sw ? 0 : 5, ant), 10];
      case "back": return [pt(mid(J.hip, J.shoulder, 0.75), p.sw ? 0 : 5, post), 10];
      case "chest": return [pt(mid(J.hip, J.shoulder, 0.8), 5, ant), 9];
      case "shoulder": return [J.shN, 8];
      case "arm": return [mid(J.shN, J.elbowN, 0.5), 7.5];
    }
  }

  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; };
  const f1 = v => v.toFixed(1);
  // Segmento affusolato (capsula con raggi diversi alle due estremità), coordinate SVG
  function capsule(a, b, r1, r2) {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    if (len < 0.6) return `M${f1(a[0] - r1)} ${f1(a[1])}a${r1} ${r1} 0 1 0 ${f1(2 * r1)} 0a${r1} ${r1} 0 1 0 ${f1(-2 * r1)} 0Z`;
    const nx = -dy / len, ny = dx / len;
    return `M${f1(a[0] + nx * r1)} ${f1(a[1] + ny * r1)}L${f1(b[0] + nx * r2)} ${f1(b[1] + ny * r2)}` +
      `A${f1(r2)} ${f1(r2)} 0 0 0 ${f1(b[0] - nx * r2)} ${f1(b[1] - ny * r2)}` +
      `L${f1(a[0] - nx * r1)} ${f1(a[1] - ny * r1)}A${f1(r1)} ${f1(r1)} 0 0 0 ${f1(a[0] + nx * r1)} ${f1(a[1] + ny * r1)}Z`;
  }
  function torsoPath(h, c, s, rh, rw, rs) {
    const dx = s[0] - h[0], dy = s[1] - h[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const P2 = (q, r, sg) => `${f1(q[0] + nx * r * sg)} ${f1(q[1] + ny * r * sg)}`;
    return `M${P2(h, rh, 1)}Q${P2(c, rw, 1)} ${P2(s, rs, 1)}A${f1(rs)} ${f1(rs)} 0 0 0 ${P2(s, rs, -1)}` +
      `Q${P2(c, rw, -1)} ${P2(h, rh, -1)}A${f1(rh)} ${f1(rh)} 0 0 0 ${P2(h, rh, 1)}Z`;
  }

  let uid = 0;
  function create(container, id, opts = {}) {
    const spec = P[id];
    if (!spec) return null;
    const K = keyframes(id), top = spec.v === "top", zone = ZONE_OF(id);
    const JA = joints(K[0]), bA = bbox(JA);
    const off0 = top ? [-bA.cx, 80 - bA.cy] : [-bA.cx, -minY(JA)];
    const anchorW = spec.an ? [JA[spec.an][0] + off0[0], JA[spec.an][1] + off0[1]] : null;
    const place = J => {
      if (top) return off0;
      if (anchorW) return [anchorW[0] - J[spec.an][0], anchorW[1] - J[spec.an][1]];
      return [off0[0], -minY(J)];
    };
    const S = (p, o) => [p[0] + o[0], top ? 160 - (p[1] + o[1]) : GROUND - (p[1] + o[1])];
    const frameAt = u => { const seg = K.length - 1, x = u * seg, i = Math.min(seg - 1, Math.floor(x)); return lerp(K[i], K[i + 1], x - i); };

    // Inquadratura: riquadro che contiene tutto il movimento, in proporzione 23:16
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = top ? -Infinity : GROUND + 4;
    for (let s = 0; s <= 12; s++) {
      const J = joints(frameAt(s / 12)), o = place(J);
      for (const k in J) {
        if (SKIP.has(k)) continue;
        const r = (R[k] ?? 5) + 1, q = S(J[k], o);
        x0 = Math.min(x0, q[0] - r); x1 = Math.max(x1, q[0] + r); y0 = Math.min(y0, q[1] - r); y1 = Math.max(y1, q[1] + r);
      }
    }
    let w = x1 - x0 + 26, h = y1 - y0 + 22;
    if (w < (opts.minWidth || 120)) w = opts.minWidth || 120;
    if (w / h < 23 / 16) w = h * 23 / 16; else h = w * 16 / 23;
    const cx = (x0 + x1) / 2, vbx = cx - w / 2, vby = top ? (y0 + y1) / 2 - h / 2 : y1 + 7 - h;
    const svg = el("svg", { viewBox: `${f1(vbx)} ${f1(vby)} ${f1(w)} ${f1(h)}`, class: "fig", role: "img", "aria-label": opts.label || "Animazione dell'esercizio" });
    const fid = "fg" + (++uid);
    const defs = el("defs", {}, svg);
    const flt = el("filter", { id: fid + "b", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: 3.2 }, flt);
    const mk = el("marker", { id: fid + "a", viewBox: "0 0 10 10", refX: 6, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 1L9 5L0 9Z", class: "fig-arrowhead" }, mk);

    if (top) el("rect", { x: x0 - 8, y: y0 - 8, width: x1 - x0 + 16, height: y1 - y0 + 16, rx: 10, class: "fig-mat" }, svg);
    else {
      el("ellipse", { cx: f1(cx), cy: GROUND + 1, rx: f1((x1 - x0) / 2 + 6), ry: 3.5, class: "fig-shadow" }, svg);
      el("rect", { x: f1(vbx - 5), y: GROUND, width: f1(w + 10), height: 4, rx: 2, class: "fig-mat" }, svg);
    }
    // Oggetti fissi calcolati sulla posa chiave indicata
    for (const pr of spec.pr || []) {
      if (!["wall", "chair", "chairBack"].includes(pr.type)) continue;
      const Jk = joints(K[pr.k]), o = place(Jk), q = S([Jk[pr.j][0] + (pr.dx || 0), Jk[pr.j][1] + (pr.dy || 0)], o), x = q[0], y = q[1];
      if (pr.type === "wall") el("rect", { x: f1(x - 3), y: f1(vby - 5), width: 6, height: f1(GROUND - vby + 5), rx: 2, class: "fig-prop" }, svg);
      if (pr.type === "chair") el("path", { d: `M${f1(x - 28)} ${f1(y)}H${f1(x + 2)}M${f1(x - 26)} ${f1(y)}V${GROUND}M${f1(x)} ${f1(y)}V${GROUND}M${f1(x - 28)} ${f1(y)}V${f1(y - 38)}`, class: "fig-prop-line" }, svg);
      if (pr.type === "chairBack") el("path", { d: `M${f1(x)} ${f1(y)}V${GROUND}M${f1(x - 4)} ${f1(y)}H${f1(x + 4)}M${f1(x)} ${f1(y + 30)}H${f1(x - 26)}V${GROUND}`, class: "fig-prop-line" }, svg);
    }
    // Freccia del movimento: dal punto di partenza all'arrivo del giunto che si sposta di più
    if (opts.arrow !== false) {
      const Ja = joints(K[0]), Jb = joints(K[K.length > 2 ? 1 : K.length - 1]), oa = place(Ja), ob = place(Jb);
      let best = null, bd = 0;
      for (const k of ["handN", "handF", "ankleN", "ankleF", "kneeN", "kneeF", "hip", "shoulder", "head"]) {
        const a = S(Ja[k], oa), b = S(Jb[k], ob), d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (d > bd) { bd = d; best = [a, b]; }
      }
      if (best && bd > 14) {
        const [a, b] = best, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
        const nx = -dy / bd, ny = dx / bd, sg = (mx - cx) * nx + (my - (vby + h / 2)) * ny > 0 ? 1 : -1, bow = Math.min(18, bd * 0.35) * sg;
        const sx = a[0] + dx * 0.12 + nx * 8 * sg, sy = a[1] + dy * 0.12 + ny * 8 * sg, ex = a[0] + dx * 0.88 + nx * 8 * sg, ey = a[1] + dy * 0.88 + ny * 8 * sg;
        el("path", { d: `M${f1(sx)} ${f1(sy)}Q${f1(mx + nx * (8 * sg + bow))} ${f1(my + ny * (8 * sg + bow))} ${f1(ex)} ${f1(ey)}`, class: "fig-arrow", "marker-end": `url(#${fid}a)` }, svg);
      }
    }
    const hlKinds = opts.highlight === false ? [] : (HL[id] || HL_ZONE[zone] || []);
    const hls = hlKinds.map(() => el("circle", { class: "fig-hl", filter: `url(#${fid}b)` }, svg));
    // Ordine di disegno: parte lontana, gambe, busto, testa, braccio vicino.
    // In vista frontale i due lati hanno lo stesso colore.
    const far = spec.fr ? "" : " far";
    const g = {
      armF: el("path", { class: "fig-skin" + far }, svg),
      legF: el("path", { class: "fig-leg" + far }, svg),
      footF: el("path", { class: "fig-skin" + far }, svg),
      legN: el("path", { class: "fig-leg" }, svg),
      footN: el("path", { class: "fig-skin" }, svg),
      torso: el("path", { class: "fig-top" }, svg),
      bun: el("circle", { r: 4.6, class: "fig-hair" }, svg),
      hairBack: el("circle", { r: L.HR, class: "fig-hair" }, svg),
      head: el("circle", { r: L.HR, class: "fig-skin" }, svg),
      armN: el("path", { class: "fig-skin" }, svg)
    };
    // In vista di lato il braccio lontano va dietro al busto, quello vicino davanti
    const moving = (spec.pr || []).filter(pr => ["cushion", "strap"].includes(pr.type));
    const props = moving.map(pr => pr.type === "cushion" ? el("ellipse", { rx: 7, ry: 5, class: "fig-cushion" }, svg) : el("line", { class: "fig-strap" }, svg));
    const bells = opts.dumbbells ? ["N", "F"].map(s => el("path", { class: "fig-bell" + (s === "F" ? far : "") }, svg)) : [];
    container.appendChild(svg);

    function draw(u, inten) {
      const p = frameAt(u), J = joints(p), o = place(J), s = k => S(J[k], o);
      const arm = sd => capsule(s("sh" + sd), s("elbow" + sd), 4.6, 3.8) + capsule(s("elbow" + sd), s("hand" + sd), 3.8, 3.1);
      const leg = sd => capsule(s("hp" + sd), s("knee" + sd), 7.2, 5) + capsule(s("knee" + sd), s("ankle" + sd), 5, 3.5);
      g.armF.setAttribute("d", arm("F")); g.armN.setAttribute("d", arm("N"));
      g.legF.setAttribute("d", leg("F")); g.legN.setAttribute("d", leg("N"));
      g.footF.setAttribute("d", capsule(s("ankleF"), s("toeF"), 3.2, 2.4));
      g.footN.setAttribute("d", capsule(s("ankleN"), s("toeN"), 3.2, 2.4));
      g.torso.setAttribute("d", torsoPath(s("hip"), S(J.ctrl, o), s("shoulder"), 8 + p.pw, 7 + p.pw * 0.6, 8.8 + p.sw));
      const hd = s("head");
      g.head.setAttribute("cx", f1(hd[0])); g.head.setAttribute("cy", f1(hd[1]));
      const back = rad(p.n + (p.sw ? 0 : 90)), bunA = rad(p.n + (p.sw ? 0 : 40));
      g.hairBack.setAttribute("cx", f1(hd[0] + 1.8 * Math.cos(back))); g.hairBack.setAttribute("cy", f1(hd[1] - 1.8 * Math.sin(back)));
      g.bun.setAttribute("cx", f1(hd[0] + 9 * Math.cos(bunA))); g.bun.setAttribute("cy", f1(hd[1] - 9 * Math.sin(bunA)));
      hlKinds.forEach((k, n) => {
        const [q, r] = hlSpot(k, J, p), z = S(q, o);
        hls[n].setAttribute("cx", f1(z[0])); hls[n].setAttribute("cy", f1(z[1])); hls[n].setAttribute("r", f1(r));
        hls[n].setAttribute("opacity", (0.25 + 0.6 * inten).toFixed(2));
      });
      moving.forEach((pr, n) => {
        const a = J[pr.j], q = S([a[0] + (pr.dx || 0), a[1] + (pr.dy || 0)], o);
        if (pr.type === "cushion") { props[n].setAttribute("cx", f1(q[0])); props[n].setAttribute("cy", f1(q[1])); }
        else { const b = s(pr.j2); props[n].setAttribute("x1", f1(q[0])); props[n].setAttribute("y1", f1(q[1])); props[n].setAttribute("x2", f1(b[0])); props[n].setAttribute("y2", f1(b[1])); }
      });
      bells.forEach((b, n) => {
        const sd = n ? "F" : "N", hnd = s("hand" + sd), e = s("elbow" + sd);
        const ang = Math.atan2(hnd[1] - e[1], hnd[0] - e[0]) + Math.PI / 2, c = Math.cos(ang), sn = Math.sin(ang);
        const a1 = [hnd[0] + 7 * c, hnd[1] + 7 * sn], a2 = [hnd[0] - 7 * c, hnd[1] - 7 * sn];
        b.setAttribute("d", capsule(a1, a2, 3.2, 3.2) + capsule([a1[0] + c, a1[1] + sn], [a1[0] - 1.5 * c, a1[1] - 1.5 * sn], 4.2, 4.2) + capsule([a2[0] - c, a2[1] - sn], [a2[0] + 1.5 * c, a2[1] + 1.5 * sn], 4.2, 4.2));
      });
    }
    // Ritmo: salita, pausa in alto, discesa lenta, pausa in basso (oppure continuo)
    const cont = CONT.has(id) || K.length > 2;
    const tm = zone === "yoga" || zone === "risc" ? [0.4, 0.12, 0.38, 0.1] : [0.32, 0.16, 0.42, 0.1];
    const ease = x => 0.5 - 0.5 * Math.cos(Math.PI * x);
    function profile(ph) {
      if (cont) return 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
      const [up, hold, down] = tm;
      if (ph < up) return ease(ph / up);
      if (ph < up + hold) return 1;
      if (ph < up + hold + down) return 1 - ease((ph - up - hold) / down);
      return 0;
    }
    const fig = { svg, draw, profile, d: spec.d * (cont ? 1 : 1.35), t0: performance.now(), paused: false, visible: true, speed: opts.speed || 1 };
    draw(0, 0);
    return fig;
  }

  // Un solo ciclo di animazione per tutte le figure visibili
  const live = new Set();
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.target._fig) e.target._fig.visible = e.isIntersecting; })) : null;
  function loop(now) {
    for (const f of live) {
      if (f.paused || !f.visible) continue;
      const u = f.profile(((now - f.t0) / 1000 / (f.d / f.speed)) % 1);
      f.draw(u, u);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function mount(container, id, opts = {}) {
    const f = create(container, id, opts);
    if (!f) return null;
    if (reduce && !opts.forceMotion) { f.draw(1, 1); f.paused = true; }
    live.add(f);
    f.svg._fig = f;
    if (io) io.observe(f.svg);
    f.stop = () => { live.delete(f); if (io) io.unobserve(f.svg); f.svg.remove(); };
    return f;
  }
  // Dati per il manichino 3D (figures3d.js)
  const isCont = id => CONT.has(id) || P[id].K.length > 2;
  return {
    mount, has: id => !!P[id], ids: Object.keys(P),
    pose2d: id => P[id] && !P[id].fr && P[id].v !== "top" ? { K: keyframes(id), an: P[id].an, pr: P[id].pr } : null,
    highlights: id => HL[id] || HL_ZONE[ZONE_OF(id)] || [],
    duration: id => P[id] ? P[id].d * (isCont(id) ? 1 : 1.35) : 3,
    continuous: id => P[id] ? isCont(id) : false
  };
})();
