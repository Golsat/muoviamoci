// Manichino 3D degli esercizi (three.js r128).
// La figura in piedi guarda verso +Z, il lato sinistro è +X. Rotazioni in gradi [x, y, z].
// Anca e spalla: x negativo = flessione in avanti, z = apertura laterale (sinistra +, destra -),
// y = rotazione attorno all'asse del corpo. Ginocchio: x positivo = flessione. Gomito: x negativo.
// Gli esercizi "di lato" riusano le pose 2D di figures.js (FIG.pose2d), convertite in automatico.
const FIG3D = (() => {
  const U = 0.0147; // metri per unità del disegno 2D
  const SAG_CAM = [70, 14];

  // Pose costruite direttamente in 3D (movimenti laterali e rotazioni)
  const SIDE = { root: [0, 0, -90], neck: [0, 0, 8], shL: [-175, 0, 0], elL: [-20, 0, 0], shR: [-60, 0, 0], elR: [-40, 0, 0] };
  const SUP = { root: [-90, 0, 0], hpL: [-45, 0, 0], hpR: [-45, 0, 0], knL: [100, 0, 0], knR: [100, 0, 0], anL: [35, 0, 0], anR: [35, 0, 0], shL: [0, 0, 6], shR: [0, 0, -6] };
  const SUPL = { root: [-90, 0, 0], shL: [0, 0, 6], shR: [0, 0, -6], anL: [-15, 0, 0], anR: [-15, 0, 0] };
  const EQ_TOE = 40; // alzata sui talloni: rotazione della caviglia
  const HANDS_HIPS = { shL: [0, 0, 35], elL: [-95, 0, 0], shR: [0, 0, -35], elR: [-95, 0, 0] };
  const N = {
    R4: { cam: [15, 32], K: [SUP, { ...SUP, hpL: [-45, 42, 0], hpR: [-45, 42, 0] }] },
    R6: { cam: [12, 8], pr: [{ type: "wall3", z: -0.2 }], K: [
      { shL: [-90, 90, 0], elL: [-90, 0, 0], shR: [-90, -90, 0], elR: [-90, 0, 0] },
      { shL: [-160, 40, 0], elL: [-15, 0, 0], shR: [-160, -40, 0], elR: [-15, 0, 0] }] },
    R7: { cam: [10, 55], mat: 90, K: [
      { ...SIDE, hpL: [-90, 0, 0], hpR: [-90, 0, 0], knL: [90, 0, 0], knR: [90, 0, 0], shL: [-90, 0, 0], elL: [0, 0, 0], shR: [-90, 0, 0], elR: [0, 0, 0] },
      { ...SIDE, hpL: [-90, 0, 0], hpR: [-90, 0, 0], knL: [90, 0, 0], knR: [90, 0, 0], shL: [-90, 0, 0], elL: [0, 0, 0], shR: [-90, -165, 0], elR: [0, 0, 0], spine: [0, -35, 0], neck: [0, -35, 8] }] },
    G4: { cam: [8, 38], mat: 90, K: [
      { ...SIDE, hpL: [-45, 0, 0], hpR: [-45, 0, 0], knL: [90, 0, 0], knR: [90, 0, 0], anL: [20, 0, 0], anR: [20, 0, 0] },
      { ...SIDE, hpL: [-45, 0, 0], hpR: [-45, -40, 0], knL: [90, 0, 0], knR: [90, 0, 0], anL: [20, 0, 0], anR: [20, 0, 0] }] },
    G5: { cam: [6, 30], mat: 90, K: [
      { ...SIDE, hpL: [-30, 0, 0], knL: [60, 0, 0], hpR: [-8, 0, -3], anR: [10, 0, 0] },
      { ...SIDE, hpL: [-30, 0, 0], knL: [60, 0, 0], hpR: [-8, 0, -38], anR: [10, 0, 0] }] },
    C1: { cam: [6, 30], mat: 90, K: [
      { ...SIDE, hpR: [-80, 0, 0], knR: [85, 0, 0], hpL: [-5, 0, 0] },
      { ...SIDE, hpR: [-80, 0, 0], knR: [85, 0, 0], hpL: [-5, 0, -16] }] },
    C4: { cam: [10, 8], pr: [{ type: "chairSide", j: "haR", k: 0 }], K: [
      { ...HANDS_HIPS, shR: [-15, 0, -28], elR: [-30, 0, 0], hpL: [0, 0, 3] },
      { ...HANDS_HIPS, shR: [-15, 0, -28], elR: [-30, 0, 0], hpL: [0, 0, 35], hpR: [0, 0, 4] }] },
    A5: { cam: [6, 22], mat: 90, an: "elL", K: [
      { root: [0, 0, -86], shL: [0, 0, 70], elL: [-90, 0, 0], shR: [0, 0, -10], knL: [90, 0, 0], knR: [90, 0, 0], neck: [0, 0, -6] },
      { root: [0, 0, -68], shL: [0, 0, 75], elL: [-90, 0, 0], shR: [0, 0, -10], knL: [90, 0, 0], knR: [90, 0, 0], neck: [0, 0, -10] }] },
    A7: { cam: [20, 18], K: [
      { hpL: [-90, 0, 0], hpR: [-90, 0, 0], anL: [-20, 0, 0], anR: [-20, 0, 0], shL: [0, 0, 88], shR: [0, 0, -88], spine: [0, -40, 0], neck: [0, -10, 0] },
      { hpL: [-90, 0, 0], hpR: [-90, 0, 0], anL: [-20, 0, 0], anR: [-20, 0, 0], shL: [0, 0, 88], shR: [0, 0, -88], spine: [0, 40, 0], neck: [0, 10, 0] }] },
    B7: { cam: [12, 8], loop: true, K: [
      { shL: [10, 0, 88], shR: [10, 0, -88] }, { shL: [0, 0, 98], shR: [0, 0, -98] },
      { shL: [-10, 0, 88], shR: [-10, 0, -88] }, { shL: [0, 0, 78], shR: [0, 0, -78] }] },
    B8: { cam: [60, 28], K: [
      { root: [90, 0, 0], neck: [-10, 0, 0], shL: [12, 0, 0], shR: [12, 0, 0] },
      { root: [90, 0, 0], neck: [-10, 0, 0], shL: [12, 0, 90], shR: [12, 0, -90] },
      { root: [90, 0, 0], neck: [-10, 0, 0], shL: [12, 0, 172], shR: [12, 0, -172] }] },
    M3: { cam: [12, 8], K: [
      { shL: [0, 0, 8], shR: [0, 0, -8], elL: [-10, 0, 0], elR: [-10, 0, 0] },
      { shL: [0, 0, 84], shR: [0, 0, -84], elL: [-15, 0, 0], elR: [-15, 0, 0] }] },
    M5: { cam: [14, 8], K: [
      { shL: [-90, 90, 0], elL: [-90, 0, 0], shR: [-90, -90, 0], elR: [-90, 0, 0] },
      { shL: [-172, 25, 0], elL: [-8, 0, 0], shR: [-172, -25, 0], elR: [-8, 0, 0] }] },
    M6: { cam: [35, 25], K: [
      { ...SUP, shL: [-90, 0, 0], elL: [-12, 0, 0], shR: [-90, 0, 0], elR: [-12, 0, 0] },
      { ...SUP, shL: [-90, 72, 0], elL: [-18, 0, 0], shR: [-90, -72, 0], elR: [-18, 0, 0] }] },
    E1: { cam: [10, 8], pr: [{ type: "chairSide", j: "haR", k: 0 }], K: [
      { ...HANDS_HIPS, shR: [-15, 0, -28], elR: [-30, 0, 0] },
      { ...HANDS_HIPS, shR: [-15, 0, -28], elR: [-30, 0, 0], hpL: [-70, 0, 0], knL: [85, 0, 0], knR: [5, 0, 0] }] },
    E2: { cam: [45, 10], pr: [{ type: "chairSide", j: "haR", k: 0 }], K: [
      { ...HANDS_HIPS, shR: [-15, 0, -28], elR: [-30, 0, 0] },
      { ...HANDS_HIPS, shR: [-15, 0, -28], elR: [-30, 0, 0], anL: [EQ_TOE, 0, 0], anR: [EQ_TOE, 0, 0] }] },
    E3: { cam: [12, 8], an: "anR", K: [
      { ...HANDS_HIPS, hpL: [-8, 0, 0], hpR: [-8, 0, 0], knL: [14, 0, 0], knR: [14, 0, 0] },
      { ...HANDS_HIPS, hpL: [-8, 0, 24], hpR: [-8, 0, -4], knL: [14, 0, 0], knR: [14, 0, 0] }] },
    E4: { cam: [35, 25], K: [SUP, { ...SUP, root: [-93, 0, 0], spine: [-2, 0, 0] }] },
    Y5: { cam: [20, 40], K: [
      { ...SUPL, shL: [0, 0, 85], shR: [0, 0, -85], hpR: [-75, 0, 0], knR: [95, 0, 0] },
      { ...SUPL, root: [-90, -28, 0], shL: [0, 0, 85], shR: [0, 0, -85], hpR: [-75, -45, 0], knR: [95, 0, 0], neck: [0, 30, 0] }] }
  };
  // Correzioni sulle pose convertite: punto fermo
  const EXTRA = {
    G1: { an: "shL" }, G2: { an: "shL" }, G3: { an: "shL" }, C2: { an: "shL" }, G9: { an: "shL" },
    A6: { an: "knR" }, Y2: { an: "haL" }, B2: { an: "knL" }, A4: { an: "knL" }, R3: { an: "haL" }, G6: { an: "haL" }, G7: { an: "haL" }, G8: { an: "haL" },
    G10: { an: "anL" }, C5: { an: "anL" }, G11: { an: "anL" }, R8: { an: "anL" }, M4: { an: "anL" }, B1: { an: "anL" }, Y6: { an: "anL" }, B6: { an: "haL" }
  };
  const JMAP = { hip: "root", shoulder: "shL", head: "neck", handN: "haL", handF: "haR", elbowN: "elL", elbowF: "elR", kneeN: "knL", kneeF: "knR", ankleN: "anL", ankleF: "anR" };

  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const norm = a => { a = ((a + 180) % 360 + 360) % 360 - 180; return a === -180 ? 180 : a; };

  // Conversione di una posa 2D vista di lato in rotazioni dei giunti 3D
  function fromSag(p) {
    const sp = -1.5 * (p.c || 0), tr = 90 - p.t - sp / 2, ts = tr + sp;
    const o = { root: [tr, 0, 0], spine: [sp, 0, 0], neck: [norm(90 - p.n - ts), 0, 0] };
    for (const [s, k] of [["L", "N"], ["R", "F"]]) {
      const a = p["a" + k], l = p["l" + k], sg = s === "L" ? 1 : -1;
      o["sh" + s] = [norm(-90 - a[0] - ts), 0, a[2] < 1 ? sg * deg(Math.acos(a[2])) : 0];
      o["el" + s] = [norm(a[0] - a[1]), 0, 0];
      o["hp" + s] = [norm(-90 - l[0] - tr), 0, l[2] < 1 ? sg * deg(Math.acos(l[2])) : 0];
      o["kn" + s] = [norm(l[0] - l[1]), 0, 0];
      o["an" + s] = [norm(90 + l[1] - p["f" + k]), 0, 0];
    }
    return o;
  }
  // Evita giri lunghi tra una posa chiave e l'altra
  function unwrap(K) {
    for (let i = 1; i < K.length; i++) for (const j in K[i]) {
      if (!K[i - 1][j]) continue;
      K[i][j] = K[i][j].map((v, c) => { const prev = K[i - 1][j][c]; let x = v; while (x - prev > 180) x -= 360; while (x - prev < -180) x += 360; return x; });
    }
    return K;
  }
  function specOf(id) {
    const e = (typeof BY !== "undefined" && BY[id]) || {};
    const hl = FIG.highlights(id);
    if (N[id]) return { d: FIG.duration(id), cont: FIG.continuous(id), hl, bells: !!e.m, mat: 0, ...N[id], K: unwrap(N[id].K.map(k => ({ ...k }))) };
    const s2 = FIG.pose2d(id);
    if (!s2) return null;
    const pr = (s2.pr || []).map(p => ({ ...p, j3: JMAP[p.j] || "root", j23: JMAP[p.j2] }));
    return { d: FIG.duration(id), cont: FIG.continuous(id), hl, bells: !!e.m, mat: 0, cam: SAG_CAM, an: JMAP[s2.an], pr, K: unwrap(s2.K.map(fromSag)), ...EXTRA[id] };
  }

  const C = hex => new THREE.Color(hex).convertSRGBToLinear();
  function mats(hl) {
    const m = (hex, rough = 0.62) => new THREE.MeshStandardMaterial({ color: C(hex), roughness: rough, metalness: 0, emissive: C("#FF6B3D"), emissiveIntensity: 0 });
    // Aspetto scelto da lei nel benvenuto (FIG_LOOK), altrimenti i colori di partenza
    const LK = { skin: "#E3AE8F", top: "#7B4F80", leg: "#34444C", hair: "#4A3428", ...(window.FIG_LOOK || {}) };
    const M = { skin: m(LK.skin, 0.55), top: m(LK.top), leg: m(LK.leg, 0.7), hair: m(LK.hair, 0.8), bell: m("#2D6E68", 0.4), wood: m("#B9A98F", 0.8), cush: m("#E7A6B6", 0.9) };
    M.gluteHl = hl.includes("glute") ? m(LK.leg, 0.7) : M.leg;
    M.thighHl = hl.includes("thigh") ? m(LK.leg, 0.7) : M.leg;
    M.torsoHl = ["core", "back", "chest"].some(k => hl.includes(k)) ? m(LK.top) : M.top;
    M.deltHl = hl.includes("shoulder") ? m(LK.top) : M.top;
    M.armHl = hl.includes("arm") ? m(LK.skin, 0.55) : M.skin;
    M.glow = [M.gluteHl, M.thighHl, M.torsoHl, M.deltHl, M.armHl].filter(x => x !== M.leg && x !== M.top && x !== M.skin);
    M.style = LK.style || "chignon";
    return M;
  }
  function seg(parent, len, r1, r2, mat) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len, 20), mat);
    g.position.y = -len / 2; parent.add(g);
    parent.add(new THREE.Mesh(new THREE.SphereGeometry(r1, 20, 14), mat));
  }
  function ball(parent, r, mat, pos, scale) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
    if (pos) b.position.set(...pos); if (scale) b.scale.set(...scale); parent.add(b); return b;
  }
  const grp = (parent, pos) => { const g = new THREE.Group(); g.rotation.order = "YXZ"; if (pos) g.position.set(...pos); if (parent) parent.add(g); return g; };

  function body(M, bells) {
    const J = {};
    J.root = grp(null); J.root.rotation.order = "XYZ";
    ball(J.root, 0.078, M.gluteHl, [0.062, -0.035, -0.055]); ball(J.root, 0.078, M.gluteHl, [-0.062, -0.035, -0.055]);
    ball(J.root, 1, M.leg, [0, 0, 0], [0.15, 0.1, 0.11]);
    J.spine = grp(J.root, [0, 0.04, 0]);
    const lathe = new THREE.LatheGeometry([[0.001, 0], [0.122, 0.0], [0.112, 0.12], [0.13, 0.28], [0.135, 0.38], [0.1, 0.47], [0.001, 0.5]].map(p => new THREE.Vector2(p[0], p[1])), 28);
    const torso = new THREE.Mesh(lathe, M.torsoHl); torso.scale.z = 0.68; J.spine.add(torso);
    J.neck = grp(J.spine, [0, 0.48, 0]);
    const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.09, 16), M.skin); nk.position.y = 0.04; J.neck.add(nk);
    ball(J.neck, 0.105, M.skin, [0, 0.16, 0.005], [0.92, 1.08, 1]);
    ball(J.neck, 0.11, M.hair, [0, 0.175, -0.018], [0.95, 1.04, 0.97]);
    // Capelli: chignon, coda o sciolti (scelta nel benvenuto)
    if (M.style === "chignon") ball(J.neck, 0.052, M.hair, [0, 0.24, -0.1]);
    if (M.style === "coda") { ball(J.neck, 0.04, M.hair, [0, 0.22, -0.11]); ball(J.neck, 1, M.hair, [0, 0.13, -0.14], [0.035, 0.1, 0.035]); }
    if (M.style === "sciolti") ball(J.neck, 1, M.hair, [0, 0.12, -0.05], [0.105, 0.14, 0.075]);
    for (const [s, x] of [["L", 1], ["R", -1]]) {
      J["sh" + s] = grp(J.spine, [0.165 * x, 0.42, 0]);
      ball(J["sh" + s], 0.056, M.deltHl);
      seg(J["sh" + s], 0.29, 0.046, 0.038, M.armHl);
      J["el" + s] = grp(J["sh" + s], [0, -0.29, 0]);
      seg(J["el" + s], 0.26, 0.037, 0.03, M.skin);
      J["ha" + s] = grp(J["el" + s], [0, -0.26, 0]);
      ball(J["ha" + s], 0.04, M.skin, [0, -0.035, 0], [0.75, 1.2, 0.6]);
      if (bells) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 12), M.bell); bar.rotation.x = Math.PI / 2; bar.position.y = -0.04; J["ha" + s].add(bar);
        for (const z of [-0.09, 0.09]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.05, 18), M.bell); w.rotation.x = Math.PI / 2; w.position.set(0, -0.04, z); J["ha" + s].add(w); }
      }
      J["hp" + s] = grp(J.root, [0.085 * x, -0.05, 0]);
      seg(J["hp" + s], 0.44, 0.08, 0.055, M.thighHl);
      J["kn" + s] = grp(J["hp" + s], [0, -0.44, 0]);
      seg(J["kn" + s], 0.42, 0.055, 0.036, M.leg);
      J["an" + s] = grp(J["kn" + s], [0, -0.42, 0]);
      ball(J["an" + s], 1, M.skin, [0, -0.03, 0.06], [0.045, 0.034, 0.11]);
    }
    J.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return J;
  }

  function chair(M, scene, x, y, z, dir, backH = 0.42) {
    // Sedia con il sedile alla quota y; dir: verso in cui si allunga il sedile (+1 / -1 su Z); backH: altezza schienale
    const g = new THREE.Group(), w = 0.42, d = 0.42;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, d), M.wood); seat.position.set(0, y - 0.018, dir * d / 2); g.add(seat);
    for (const [lx, lz] of [[-1, 0.03], [1, 0.03], [-1, d - 0.03], [1, d - 0.03]]) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, y, 8), M.wood); l.position.set(lx * (w / 2 - 0.03), y / 2, dir * lz); g.add(l);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, backH, 0.03), M.wood); back.position.set(0, y + backH / 2, dir * (d - 0.015)); g.add(back);
    g.position.set(x, 0, z); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
  }

  const live = new Set();
  function mount(container, id, opts = {}) {
    const spec = specOf(id);
    if (!spec || typeof THREE === "undefined") return null;
    const M = mats(spec.hl || []);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1)); // meno calore e batteria
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const cv = renderer.domElement;
    cv.className = "fig3d";
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", opts.label || "Animazione 3D dell'esercizio");
    container.appendChild(cv);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a99a8, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(1.6, 3.2, 2.2); sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8, near: 0.5, far: 9 });
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 4;
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.2 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.008, 1.85), new THREE.MeshStandardMaterial({ color: C("#9FC3B8"), roughness: 0.9 }));
    mat.position.y = -0.002; mat.rotation.y = rad(spec.mat || 0); mat.receiveShadow = true; scene.add(mat);

    const J = body(M, spec.bells);
    scene.add(J.root);
    const keys = ["root", "spine", "neck", "shL", "elL", "shR", "elR", "hpL", "knL", "anL", "hpR", "knR", "anR"];
    const K = spec.loop ? [...spec.K, spec.K[0]] : spec.K;
    const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), box = new THREE.Box3();
    let anchor0 = null;
    function pose(u) {
      const seg = K.length - 1, x = u * seg, i = Math.min(seg - 1, Math.floor(x)), f = x - i, A = K[i], B = K[i + 1];
      for (const k of keys) {
        const a = A[k] || [0, 0, 0], b = B[k] || [0, 0, 0];
        J[k].rotation.set(rad(a[0] + (b[0] - a[0]) * f), rad(a[1] + (b[1] - a[1]) * f), rad(a[2] + (b[2] - a[2]) * f));
      }
      J.root.position.set(0, 0, 0);
      J.root.updateMatrixWorld(true);
      box.setFromObject(J.root);
      J.root.position.y = -box.min.y;
      if (spec.an) {
        J.root.updateMatrixWorld(true);
        J[spec.an].getWorldPosition(tmp);
        if (!anchor0) anchor0 = tmp.clone();
        J.root.position.x += anchor0.x - tmp.x; J.root.position.z += anchor0.z - tmp.z;
      }
      J.root.updateMatrixWorld(true);
    }
    pose(0);
    // Oggetti: fissi (calcolati sulla posa chiave) e mobili (cuscino, asciugamano)
    const movers = [];
    for (const p of spec.pr || []) {
      if (p.type === "wall3") {
        const w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 0.05), M.wood); w.position.set(0, 0.95, p.z); w.receiveShadow = true; scene.add(w);
        continue;
      }
      if (["chair", "wall", "chairSide"].includes(p.type)) {
        pose(p.k === 1 ? 1 : 0);
        J[p.j3 || p.j].getWorldPosition(tmp);
        const z = tmp.z + (p.dx || 0) * U, y = tmp.y + (p.dy || 0) * U;
        if (p.type === "chair") chair(M, scene, tmp.x, Math.max(0.3, y), z, -1);
        if (p.type === "wall") { const w = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.9, 0.05), M.wood); w.position.set(tmp.x, 0.95, z + 0.05); w.receiveShadow = true; scene.add(w); }
        // Schienale proprio sotto la mano (seduta davanti, lontano dal corpo), alto fino al palmo
        if (p.type === "chairSide") chair(M, scene, tmp.x - 0.05, 0.46, tmp.z + 0.43, -1, Math.min(0.6, Math.max(0.3, tmp.y - 0.083 - 0.46)));
        continue;
      }
      if (p.type === "cushion") movers.push({ p, m: ball(scene, 1, M.cush, null, [0.08, 0.06, 0.07]) });
      if (p.type === "strap") { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 8), M.wood); scene.add(s); movers.push({ p, m: s }); }
    }
    const up = new THREE.Vector3(0, 1, 0);
    function moveProps() {
      for (const { p, m } of movers) {
        if (p.type === "cushion") {
          if (p.j3 === "knL") { J.knL.getWorldPosition(tmp); J.knR.getWorldPosition(tmp2); m.position.copy(tmp).add(tmp2).multiplyScalar(0.5); }
          else { J.root.getWorldPosition(tmp); m.position.set(tmp.x, Math.max(0.06, tmp.y + (p.dy || 0) * U), tmp.z + (p.dx || 0) * U); }
        } else {
          J[p.j3].getWorldPosition(tmp); J[p.j23].getWorldPosition(tmp2);
          const d = tmp2.clone().sub(tmp), len = d.length();
          m.position.copy(tmp).addScaledVector(d, 0.5); m.scale.set(1, len, 1); m.quaternion.setFromUnitVectors(up, d.normalize());
        }
      }
    }
    // Inquadratura automatica sul movimento completo
    const fr = new THREE.Box3();
    for (let s = 0; s <= 6; s++) { pose(s / 6); fr.union(new THREE.Box3().setFromObject(J.root)); }
    const center = fr.getCenter(new THREE.Vector3()), size = fr.getSize(new THREE.Vector3());
    const camera = new THREE.PerspectiveCamera(30, 23 / 16, 0.05, 30);
    let az = rad((spec.cam || SAG_CAM)[0]), el = rad((spec.cam || SAG_CAM)[1]);
    const dist = Math.max(size.x, size.y * 1.3, size.z) * 1.6 + 0.45;
    function placeCam() {
      camera.position.set(center.x + dist * Math.sin(az) * Math.cos(el), center.y + dist * Math.sin(el), center.z + dist * Math.cos(az) * Math.cos(el));
      camera.lookAt(center);
    }
    placeCam();
    function resize() {
      const w = container.clientWidth || 300, h = container.clientHeight || Math.round(w * 16 / 23);
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    const ro = "ResizeObserver" in window ? new ResizeObserver(resize) : null; if (ro) ro.observe(container);
    // Trascinando con il dito si gira intorno alla figura
    let drag = null;
    cv.style.touchAction = "pan-y";
    cv.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, az, el }; });
    cv.addEventListener("pointermove", e => { if (!drag) return; az = drag.az - (e.clientX - drag.x) * 0.01; el = Math.max(0.02, Math.min(1.25, drag.el + (e.clientY - drag.y) * 0.006)); placeCam(); });
    const end = () => { drag = null; };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end); cv.addEventListener("pointerleave", end);

    const ease = x => 0.5 - 0.5 * Math.cos(Math.PI * x);
    const profile = ph => {
      if (spec.loop) return ph;
      if (spec.cont || spec.K.length > 2) return 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
      if (ph < 0.32) return ease(ph / 0.32); if (ph < 0.48) return 1; if (ph < 0.9) return 1 - ease((ph - 0.48) / 0.42); return 0;
    };
    const f = { t0: performance.now(), visible: true, paused: false, speed: opts.speed || 1,
      frame(now) {
        const u = profile(((now - f.t0) / 1000 / (spec.d / f.speed)) % 1);
        pose(u); moveProps();
        for (const g of M.glow) g.emissiveIntensity = 0.1 + 0.75 * (spec.loop ? 0.6 : u);
        renderer.render(scene, camera);
      },
      at(u) { pose(u); moveProps(); renderer.render(scene, camera); },
      stop() { live.delete(f); if (ro) ro.disconnect(); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); cv.remove(); } };
    if ("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => { f.visible = e.isIntersecting; })).observe(cv);
    live.add(f);
    f.frame(performance.now());
    return f;
  }
  // 30 fotogrammi al secondo bastano per movimenti lenti: metà consumo in una seduta di 45 minuti
  let lastF = 0;
  function loop(now) { requestAnimationFrame(loop); if (now - lastF < 32) return; lastF = now; for (const f of live) if (f.visible && !f.paused) f.frame(now); }
  requestAnimationFrame(loop);
  return { mount, available: () => typeof THREE !== "undefined" };
})();
