// Il viaggio: ogni minuto di allenamento è strada sul Tōkaidō, da Tokyo a Kyoto.
// Cartoline e mappa disegnate in SVG, in stile stampa giapponese (niente immagini da scaricare).
const VIAGGIO = (() => {
  const TOT = 492;       // km da Nihonbashi (Tokyo) a Sanjō Ōhashi (Kyoto)
  const KM_MIN = 0.6;    // km per minuto di allenamento: a ritmo normale si arriva verso Natale
  const STOPS = [
    { km: 0, k: "日本橋", n: "Nihonbashi · Tokyo", t: "Il «Ponte del Giappone»: da qui, dal 1603, partiva il Tōkaidō, la strada del mare orientale verso Kyoto. 53 stazioni di posta, 492 km a piedi. Si parte!", draw: "ponte" },
    { km: 96, k: "箱根", n: "Hakone", t: "Il lago Ashi e il torii rosso nell'acqua del santuario. Qui i viaggiatori superavano il posto di blocco più temuto di tutta la strada.", draw: "hakone" },
    { km: 150, k: "由比", n: "Yui · passo di Satta", t: "Dal passo di Satta il monte Fuji si specchia nel mare: è una delle stampe più famose di Hiroshige.", draw: "fuji" },
    { km: 180, k: "静岡", n: "Shizuoka", t: "Le colline del tè verde: da qui viene quasi metà del tè giapponese. Una tazza calda come premio.", draw: "te" },
    { km: 265, k: "浜名湖", n: "Lago Hamana", t: "Il lago salato di Hamana si attraversava in barca. Sei a metà del viaggio!", draw: "lago" },
    { km: 350, k: "熱田", n: "Atsuta · Nagoya", t: "Il grande santuario di Atsuta custodisce la spada sacra dell'imperatore. Da qui si prendeva la barca per Kuwana.", draw: "santuario" },
    { km: 410, k: "鈴鹿", n: "Passo di Suzuka", t: "Montagne, pini e nebbia: l'ultima salita prima di Kyoto. Ancora poche sedute!", draw: "suzuka" },
    { km: 492, k: "京都", n: "Kyoto · Sanjō Ōhashi", t: "Fine del Tōkaidō! 492 km percorsi un minuto alla volta. お疲れ様でした (otsukaresama deshita): hai lavorato tanto, brava!", draw: "kyoto" }
  ];
  const C = { washi: "#F4EBD8", sky: "#F6DFC0", ink: "#2B2A28", indigo: "#2E4A7D", indigo2: "#5B78A8", red: "#C8432B", green: "#4F7A55", green2: "#86A86A", snow: "#FFFFFF", sand: "#E3CFA6" };

  const kmOf = minutes => Math.min(TOT, Math.round(minutes * KM_MIN));
  const reached = km => STOPS.filter(s => s.km <= km);

  // ----- Elementi di disegno -----
  // id del gradiente legato ai colori: più cartoline nella stessa pagina non si confondono
  const sky = (a, b) => { const id = "sk" + a.slice(1) + b.slice(1); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="200" fill="url(#${id})"/>`; };
  const sun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.red}" opacity=".9"/>`;
  const cloud = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3.5" fill="#fff" opacity=".75"/><rect x="${x + w * 0.25}" y="${y - 6}" width="${w * 0.5}" height="7" rx="3.5" fill="#fff" opacity=".75"/>`;
  const fuji = (cx, base, w, h) => {
    const l = cx - w / 2, r = cx + w / 2, tl = cx - w * 0.07, tr = cx + w * 0.07, top = base - h;
    const sy = top + h * 0.32;
    return `<path d="M${l} ${base} L${tl} ${top} L${tr} ${top} L${r} ${base}Z" fill="${C.indigo2}"/>` +
      `<path d="M${tl} ${top} L${tr} ${top} L${cx + w * 0.17} ${sy} L${cx + w * 0.1} ${sy - 4} L${cx + w * 0.03} ${sy + 3} L${cx - w * 0.05} ${sy - 3} L${cx - w * 0.12} ${sy + 2} L${cx - w * 0.17} ${sy}Z" fill="${C.snow}"/>`;
  };
  const waves = (y, col = C.indigo) => {
    let s = `<rect x="0" y="${y}" width="300" height="${200 - y}" fill="${col}"/>`;
    for (let row = 0; row * 9 + y < 200; row++) for (let x = (row % 2) * 9 - 9; x < 310; x += 18) {
      const cy = y + 9 + row * 9;
      s += `<path d="M${x - 9} ${cy} A9 9 0 0 1 ${x + 9} ${cy}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/><path d="M${x - 5} ${cy} A5 5 0 0 1 ${x + 5} ${cy}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`;
    }
    return s;
  };
  const torii = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${C.red}"><rect x="-22" y="-40" width="5" height="40"/><rect x="17" y="-40" width="5" height="40"/><path d="M-32 -46 Q0 -52 32 -46 L30 -41 L-30 -41Z"/><rect x="-26" y="-34" width="52" height="4"/><rect x="-2" y="-41" width="4" height="8"/></g>`;
  const pine = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1.5" y="-4" width="3" height="16" fill="${C.ink}"/><ellipse cx="0" cy="-8" rx="14" ry="5" fill="${C.green}"/><ellipse cx="3" cy="-15" rx="10" ry="4" fill="${C.green}"/><ellipse cx="-1" cy="-21" rx="6" ry="3" fill="${C.green}"/></g>`;
  const hills = (y, col, amp = 12) => `<path d="M0 ${y} Q40 ${y - amp} 80 ${y} T160 ${y} T240 ${y} T320 ${y} V200 H0Z" fill="${col}"/>`;
  const pagoda = (x, y, s = 1) => {
    let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
    for (let i = 0; i < 5; i++) { const w = 30 - i * 4, yy = -i * 14; g += `<rect x="${-w / 2 + 4}" y="${yy - 9}" width="${w - 8}" height="9" fill="${C.red}"/><path d="M${-w / 2 - 4} ${yy - 9} Q0 ${yy - 15} ${w / 2 + 4} ${yy - 9} L${w / 2} ${yy - 12} L${-w / 2} ${yy - 12}Z" fill="${C.ink}"/>`; }
    return g + `<rect x="-1" y="-88" width="2" height="18" fill="${C.ink}"/></g>`;
  };
  const traveler = (x, y) => `<g transform="translate(${x} ${y})" fill="${C.ink}"><path d="M-9 -16 Q0 -24 9 -16Z" fill="${C.sand}" stroke="${C.ink}" stroke-width=".8"/><rect x="-3" y="-16" width="6" height="11" rx="2"/><rect x="-3" y="-6" width="2" height="7"/><rect x="1" y="-6" width="2" height="7"/><line x1="5" y1="-12" x2="9" y2="2" stroke="${C.ink}" stroke-width="1"/></g>`;

  const SCENES = {
    ponte: () => sky("#F7E6C8", "#EBD3AE") + sun(232, 52, 20) + cloud(30, 40, 70) + hills(132, C.green2, 8) +
      `<path d="M0 150 H300 V200 H0Z" fill="${C.indigo}"/><path d="M20 150 Q150 92 280 150" fill="none" stroke="${C.ink}" stroke-width="7"/><path d="M20 140 Q150 82 280 140" fill="none" stroke="${C.red}" stroke-width="3"/>` +
      [50, 90, 130, 170, 210, 250].map(x => `<line x1="${x}" y1="${150 - 58 * (1 - Math.pow((x - 150) / 130, 2))}" x2="${x}" y2="${160 - 58 * (1 - Math.pow((x - 150) / 130, 2))}" stroke="${C.ink}" stroke-width="2"/>`).join("") +
      traveler(120, 101) + traveler(170, 100),
    hakone: () => sky("#F6E2C2", "#E9D2A8") + fuji(205, 128, 170, 82) + cloud(40, 60, 60) + hills(130, C.green, 14) + `<rect x="0" y="140" width="300" height="60" fill="${C.indigo2}"/>` + waves(168, C.indigo) + torii(78, 152, 0.9) + pine(30, 130) + pine(268, 132, 0.9),
    fuji: () => sky("#F8E4C4", "#EED9B2") + sun(60, 48, 16) + fuji(180, 140, 210, 100) + waves(140) + `<path d="M0 122 Q40 112 70 135 L70 200 L0 200Z" fill="${C.green}"/>` + pine(32, 120, 1.1) + traveler(52, 128),
    te: () => sky("#F7E7C9", "#EEDCB9") + fuji(240, 110, 110, 52) + sun(70, 44, 14) +
      [0, 1, 2, 3].map(i => hills(108 + i * 24, i % 2 ? C.green : C.green2, 10 - i)).join("") +
      [0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${130 + i * 13} Q150 ${118 + i * 13} 300 ${132 + i * 13}" fill="none" stroke="#3E6343" stroke-width="2" stroke-dasharray="8 5"/>`).join("") +
      `<g transform="translate(150 70)"><ellipse cx="0" cy="14" rx="20" ry="5" fill="${C.ink}" opacity=".2"/><path d="M-16 -6 H16 L12 12 H-12Z" fill="${C.red}"/><path d="M-4 -12 q4 -6 0 -12 M4 -12 q4 -6 0 -12" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></g>`,
    lago: () => sky("#F5DFBF", "#EAD0A6") + sun(150, 72, 26) + hills(112, C.green2, 6) + `<rect x="0" y="112" width="300" height="88" fill="${C.indigo2}"/>` +
      [0, 1, 2, 3, 4].map(i => `<line x1="${40 + i * 50}" y1="${130 + (i % 2) * 22}" x2="${80 + i * 50}" y2="${130 + (i % 2) * 22}" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>`).join("") +
      `<g transform="translate(150 150)"><path d="M-34 0 H34 L26 10 H-26Z" fill="${C.ink}"/><line x1="0" y1="0" x2="0" y2="-40" stroke="${C.ink}" stroke-width="2"/><path d="M2 -38 L26 -6 L2 -6Z" fill="${C.washi}" stroke="${C.ink}" stroke-width="1"/></g>`,
    santuario: () => sky("#F6E1C1", "#EAD3AA") + sun(240, 50, 15) + `<rect x="0" y="150" width="300" height="50" fill="${C.sand}"/>` + pine(40, 150, 1.3) + pine(262, 150, 1.3) +
      `<g transform="translate(150 150)"><rect x="-50" y="-34" width="100" height="34" fill="${C.washi}" stroke="${C.ink}" stroke-width="2"/><path d="M-66 -34 L0 -62 L66 -34Z" fill="${C.ink}"/><rect x="-6" y="-24" width="12" height="24" fill="${C.red}"/></g>` + torii(150, 196, 0.8),
    suzuka: () => sky("#F2E3CC", "#E4D3B8") + `<path d="M0 120 L60 60 L110 110 L170 40 L240 105 L300 70 V200 H0Z" fill="${C.indigo2}" opacity=".7"/>` + cloud(20, 92, 110) + cloud(160, 78, 120) +
      `<path d="M0 150 L80 100 L150 140 L220 95 L300 135 V200 H0Z" fill="${C.green}"/>` + pine(60, 140) + pine(200, 128, 1.1) + pine(250, 150, 0.9) + traveler(130, 150) + traveler(146, 148),
    kyoto: () => sky("#F8DDB8", "#F0C99A") + sun(70, 60, 24) + hills(120, C.green2, 10) + pagoda(220, 128, 0.95) +
      `<path d="M0 150 H300 V200 H0Z" fill="${C.indigo2}"/><rect x="0" y="140" width="300" height="9" fill="${C.ink}"/>` +
      [20, 70, 120, 170, 230, 280].map(x => `<rect x="${x}" y="149" width="4" height="22" fill="${C.ink}"/>`).join("") +
      [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${30 + i * 40}" cy="${30 + (i % 3) * 12}" r="4" fill="#F4B6C2"/>`).join("") + traveler(140, 140)
  };

  // Cartolina: scena + timbro rosso con il nome in giapponese + titolo
  function card(i, locked) {
    const s = STOPS[i];
    if (locked) return `<svg viewBox="0 0 300 200" class="pc" role="img" aria-label="Cartolina ancora chiusa"><rect width="300" height="200" rx="10" fill="${C.washi}"/><rect x="8" y="8" width="284" height="184" rx="6" fill="none" stroke="${C.sand}" stroke-width="2" stroke-dasharray="6 5"/><text x="150" y="98" text-anchor="middle" font-size="40" fill="${C.sand}">${s.k}</text><text x="150" y="132" text-anchor="middle" font-size="13" fill="#9B8A6A">al km ${s.km}</text></svg>`;
    return `<svg viewBox="0 0 300 200" class="pc" role="img" aria-label="Cartolina: ${s.n}"><defs><clipPath id="pc${i}"><rect width="300" height="200" rx="10"/></clipPath></defs>
      <g clip-path="url(#pc${i})">${SCENES[s.draw]()}</g>
      <rect x="4" y="4" width="292" height="192" rx="8" fill="none" stroke="${C.washi}" stroke-width="6"/>
      <g transform="translate(262 18)"><rect width="26" height="${s.k.length * 22 + 8}" rx="3" fill="${C.red}"/>${[...s.k].map((ch, j) => `<text x="13" y="${24 + j * 22}" text-anchor="middle" font-size="19" fill="#fff" font-weight="700">${ch}</text>`).join("")}</g>
      <rect x="14" y="168" width="${s.n.length * 7 + 16}" height="22" rx="4" fill="${C.washi}" opacity=".92"/><text x="22" y="183" font-size="13" fill="${C.ink}" font-weight="700">${s.n}</text></svg>`;
  }

  // Mappa: Tokyo a destra, Kyoto a sinistra (come sulla carta), il Fuji sopra, il mare sotto
  function map(km) {
    const X = k => 318 - 296 * k / TOT, Y = k => 78 + 16 * Math.sin(k / TOT * Math.PI * 2.2);
    let path = ""; for (let k = 0; k <= TOT; k += 6) path += (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(k).toFixed(1);
    let done = ""; for (let k = 0; k <= km; k += 3) done += (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(k).toFixed(1);
    if (km > 0) done += `L${X(km).toFixed(1)} ${Y(km).toFixed(1)}`;
    const dots = STOPS.map(s => `<circle cx="${X(s.km)}" cy="${Y(s.km)}" r="${s.km <= km ? 5 : 4}" fill="${s.km <= km ? C.red : C.washi}" stroke="${C.ink}" stroke-width="1.5"/><text x="${X(s.km)}" y="${Y(s.km) + (STOPS.indexOf(s) % 2 ? 22 : -10)}" text-anchor="middle" font-size="11" fill="${C.ink}">${s.k}</text>`).join("");
    return `<svg viewBox="0 0 340 150" class="trip-map" role="img" aria-label="Mappa del viaggio: ${km} km di ${TOT}">
      <rect width="340" height="150" rx="12" fill="${C.washi}"/>
      ${fuji(210, 58, 70, 40)}<circle cx="300" cy="26" r="10" fill="${C.red}" opacity=".85"/>
      <path d="M0 118 Q85 104 170 118 T340 116 V150 H0Z" fill="${C.indigo2}" opacity=".35"/>
      <path d="${path}" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="3 4" opacity=".5"/>
      <path d="${done}" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>
      ${dots}
      <g transform="translate(${X(km)} ${Y(km) - 8})"><circle r="9" fill="#fff" stroke="${C.red}" stroke-width="2.5"/><circle r="3.5" fill="${C.red}"/></g>
      <text x="12" y="140" font-size="11" fill="${C.ink}">Kyoto</text><text x="328" y="140" text-anchor="end" font-size="11" fill="${C.ink}">Tokyo</text></svg>`;
  }

  return { TOT, KM_MIN, STOPS, kmOf, reached, card, map };
})();
