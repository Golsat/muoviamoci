// Muoviamoci! – interfaccia: Oggi, Calendario, Esercizi, Il mio piano, Progressi, lettore della seduta.
(() => {
  const P = PROGRAM;
  const KEY = "muoviamoci-v1";
  const DEF = {
    settings: { yoga: 3, focus: [], intensity: "normale", minutes: 45, guide: "completa", volume: 1, reminder: "17:30", restExtra: 0, music: true, musicVol: 0.35 },
    excluded: [], knee: [], tweak: {}, restBonus: {}, restUse: {}, done: {}, moves: {}, skipped: {}, offlineReady: false, votes: [], plans: [], history: [], checksSeen: [],
    name: "", welcomed: false, look: {}, prog: { A: 0, B: 0 }, progMark: { A: -1, B: -1 }, tests: [], testSnooze: "", cards: [], mirror: null
  };
  let S;
  try { S = { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; S.settings = { ...DEF.settings, ...S.settings }; } catch (e) { S = structuredClone(DEF); }
  // Sedute registrate con l'indice (prima del 20/10/2026): si passano alla chiave stabile settimana+seduta (es. "3B")
  { const pl = P.plan(); for (const m of ["done", "moves", "skipped"]) for (const n of Object.keys(S[m] || {})) if (/^\d+$/.test(n) && pl[n]) { S[m][pl[n].k] = S[m][n]; delete S[m][n]; } }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  window.FIG_LOOK = S.look;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const app = $("#app");
  const mins = sec => Math.round(sec / 60);
  const ZN = { risc: "Riscaldamento", glu: "Glutei", cos: "Cosce", add: "Addome", bra: "Braccia e schiena", yoga: "Yoga", eq: "Equilibrio e ossa" };
  const FOCUS = [["glu", "Glutei"], ["add", "Addome"], ["bra", "Braccia"], ["cos", "Cosce"]];
  const REASONS = [["difficile", "Troppo difficile"], ["facile", "Troppo facile"], ["ginocchio", "Fastidio al ginocchio"], ["nonpiace", "Non mi piace / poco chiaro"]];

  const I = {
    // Icone giapponesi (stile «medio», 20/10/2026): torii, onde, monte Fuji
    torii: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--shu)" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 6c6 1 12 1 18 0M5 10h14M7 6v15M17 6v15"/></svg>',
    wave: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 16c3-3 5-3 7 0s5 3 7 0 4-3 6-1"/><path d="M2 20c3-3 5-3 7 0s5 3 7 0 4-3 6-1"/></svg>',
    fuji: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M2 20l7-12 3 4 2-3 8 11z"/><path d="M7.5 10.5l1.5 1 1.5-1"/></svg>',
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 8v6M8 21l4-7 4 7M6 11l6-2 6 2"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    lib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.4"/><circle cx="4.5" cy="12" r="1.4"/><circle cx="4.5" cy="18" r="1.4"/></svg>',
    prog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4.5" height="16" rx="1.5"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.5"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.5v13a1 1 0 0 0 1.6.8l8.5-6.5a1 1 0 0 0 0-1.6L6.6 4.7A1 1 0 0 0 5 5.5z"/><rect x="16.5" y="5" width="3" height="14" rx="1.2"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5.5v13a1 1 0 0 1-1.6.8l-8.5-6.5a1 1 0 0 1 0-1.6l8.5-6.5A1 1 0 0 1 19 5.5z"/><rect x="4.5" y="5" width="3" height="14" rx="1.2"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3c0-.4-.2-.8-.4-1.1L13.2 1 6.6 7.6C6.2 8 6 8.5 6 9v10a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7v-2z"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3h-4v12h4V3zM2 14a2 2 0 0 0 2 2h6.3l-1 4.6v.3c0 .4.2.8.4 1.1l1.1 1 6.6-6.6c.4-.4.6-.9.6-1.4V5a2 2 0 0 0-2-2H7c-.8 0-1.5.5-1.8 1.2l-3 7.1c-.1.2-.2.5-.2.7v2z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
  };

  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  }

  // Figura: manichino 3D, oppure figura 2D se il telefono non supporta il 3D
  const has3D = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; } })();
  function figure(container, id, opts = {}) {
    container.querySelectorAll(":scope > canvas, :scope > svg.fig").forEach(n => n.remove());
    const e = BY[id] || {};
    let f = has3D ? FIG3D.mount(container, id, { label: e.n, ...opts }) : null;
    if (!f) f = FIG.mount(container, id, { label: e.n, dumbbells: !!e.m, forceMotion: true, ...opts });
    return f;
  }

  // ---------- Calendario e seduta del giorno ----------
  function sessions() {
    return P.plan().map(s => ({ ...s, date: S.moves[s.k] || s.date, note: S.moves[s.k] ? "" : s.note, done: !!S.done[s.k] })).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.i - b.i);
  }
  // Seduta proposta: quella di oggi; altrimenti una saltata da non più di 2 giorni (recupero);
  // altrimenti la prossima. Le sedute più vecchie non fatte restano indietro: il programma va avanti.
  function nextSession() {
    const t = P.today(), all = sessions().filter(s => !s.done && !S.skipped[s.k]);
    return all.find(s => s.date === t) || all.filter(s => s.date < t && s.date >= P.addDays(t, -2)).pop() || all.find(s => s.date > t) || null;
  }
  // Ferma da più di 10 giorni con sedute non fatte: si può ripartire da dove era rimasta
  function stalled() {
    const t = P.today();
    if (S.history.some(h => h.date >= P.addDays(t, -10))) return null;
    return sessions().find(s => !s.done && !S.skipped[s.k] && s.date < P.addDays(t, -2)) || null;
  }
  function stFor() { return { ...S.settings, excluded: S.excluded, knee: S.knee, tweak: S.tweak, prog: S.prog, restBonus: S.restBonus }; }
  const sessTitle = s => s.type === "P" ? s.name : `Seduta ${s.type} · ${P.TITLE[s.type]}`;
  const weekLabel = s => s.week === "F" ? "Settimana delle feste" : `Settimana ${s.week} · ${P.WEEK[s.week].n}`;

  // ---------- Navigazione ----------
  const TABS = [["oggi", "Oggi", I.today], ["calendario", "Calendario", I.cal], ["esercizi", "Esercizi", I.lib], ["piani", "Il mio piano", I.plan], ["progressi", "Progressi", I.prog]];
  let tab = "oggi";
  const tabsEl = $("#tabs");
  function renderTabs() {
    tabsEl.innerHTML = TABS.map(([k, n, ic]) => `<button type="button" data-tab="${k}" ${k === tab ? 'aria-current="page"' : ""}>${ic}<span>${n}</span></button>`).join("");
  }
  tabsEl.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; go(b.dataset.tab); });
  let figs = [];
  function clearFigs() { figs.forEach(f => f && f.stop && f.stop()); figs = []; }
  function go(t) { tab = t; clearFigs(); renderTabs(); render(); window.scrollTo(0, 0); }
  function render() {
    clearFigs();
    ({ oggi: renderOggi, calendario: renderCal, esercizi: renderLib, piani: renderPlans, progressi: renderProg })[tab]();
  }

  // ---------- OGGI ----------
  let regOpen = false;
  function renderOggi() {
    const s = nextSession(), t = P.today(), st = S.settings;
    const d = new Date(), hello = d.getHours() < 13 ? "Buongiorno" : d.getHours() < 18 ? "Buon pomeriggio" : "Buonasera";
    let hero = "";
    if (s) {
      const sess = P.build(s, stFor()), steps = P.steps(sess), when = s.date === t ? "Oggi" : s.date < t ? "Da recuperare" : "Prossima seduta";
      const late = s.date < t;
      hero = `<section class="card hero" aria-label="Seduta">
        <div class="between"><span class="lbl">${I.wave}${when} · ${esc(P.fmt(s.date, true))}</span><span class="pill ${s.type.toLowerCase()}">${s.type}</span></div>
        <h2>${esc(P.TITLE[s.type])}</h2>
        <div class="session-meta"><span>${esc(P.blockName(s.block))}</span><span>${esc(weekLabel(s))}</span>${s.note ? `<span>${esc(s.note)}</span>` : ""}</div>
        <div class="between"><div><div class="est num">${mins(P.totalSec(steps))}<small style="font-size:1rem"> min</small></div><span class="muted">${new Set(steps.filter(x => x.kind === "work").map(x => x.ex.id)).size} esercizi · ${sess.work}" lavoro / ${sess.rest}" recupero${S.prog[s.type] > 0 ? ` · +${S.prog[s.type]}" per i tuoi progressi` : ""}</span></div></div>
        <button class="btn primary big" id="start">${I.play} Inizia</button>
        ${late ? `<button class="btn ghost" id="skip" style="color:inherit;border-color:currentColor">Salta questa seduta</button>` : ""}
      </section>`;
    } else hero = `<section class="card hero"><h2>Programma completato</h2><p>Bravissima! Chiedi a Claude il programma dei prossimi mesi.</p></section>`;

    const chk = P.CHECKS.find(c => c.date <= t && !S.checksSeen.includes(c.date));
    const km = tripKm(), next = VIAGGIO.STOPS.find(x => x.km > km);
    const tripCard = `<button class="card trip-card" id="trip" aria-label="Il tuo viaggio sul Tōkaidō"><div class="between"><span class="lbl">${I.fuji}Il tuo viaggio · <span class="jp">東海道</span></span><span class="muted num">${km} / ${VIAGGIO.TOT} km</span></div>${VIAGGIO.map(km)}<div class="trip-row">${VIAGGIO.card(VIAGGIO.STOPS.indexOf(VIAGGIO.reached(km).slice(-1)[0]))}<span class="muted">${next ? `Prossima cartolina: <b>${esc(next.n)}</b> fra ${next.km - km} km (circa ${Math.ceil((next.km - km) / VIAGGIO.KM_MIN)} minuti di allenamento)` : "Sei arrivata a Kyoto! Tocca per rivedere le cartoline."}</span></div></button>`;
    const testDue = testIsDue() && S.testSnooze !== t;
    const stSum = `${st.intensity[0].toUpperCase() + st.intensity.slice(1)} · ${st.minutes} min · ${["solo yoga", "più yoga", "metà e metà", "più forza", "solo forza"][st.yoga]}${st.restExtra ? ` · recupero +${st.restExtra} s` : ""}${st.focus.length ? " · " + st.focus.map(k => FOCUS.find(f => f[0] === k)[1]).join(", ") : ""}`;
    const prevList = s ? previewList(P.build(s, stFor())) : "";
    app.innerHTML = `<main class="screen">
      <div class="top"><div><div class="brand">${I.torii}Muoviamoci!</div><span class="muted">${hello}${S.name ? ", " + esc(S.name) : ""}! ${esc(P.fmt(t, true))}</span></div>
        <button class="icon" id="settings" aria-label="Impostazioni">${I.gear}</button></div>
      ${chk ? `<section class="card" style="border-color:var(--accent)"><span class="lbl">${esc(chk.n)} con Claude</span><p>${esc(chk.t)} Apri <b>Progressi</b> e premi «Copia il riepilogo per Claude».</p><div class="row"><button class="btn small primary" data-gotab="progressi">Vai a Progressi</button><button class="btn small ghost" data-seen="${chk.date}">Fatto</button></div></section>` : ""}
      ${testDue ? `<section class="card" style="border-color:var(--accent)"><span class="lbl">${S.tests.length ? "Mini-test di fine blocco" : "Mini-test di partenza"}</span><p>${S.tests.length ? "Rifai le 3 prove: vedrai quanto sei migliorata." : "3 prove semplici, 5 minuti: servono a vedere i tuoi progressi nelle prossime settimane."}</p><div class="row"><button class="btn small primary" id="dotest">Fai il mini-test</button><button class="btn small ghost" id="snooze">Più tardi</button></div></section>` : ""}
      ${hero}
      ${s ? `<details class="card fold" open><summary>Gli esercizi di questa seduta</summary><p class="muted" style="margin:4px 0 0">Tocca un esercizio per vedere il manichino e ascoltare la spiegazione.</p>${prevList}</details>` : ""}
      <details class="card fold" id="regbox" aria-label="Regolazioni" ${regOpen ? "open" : ""}>
        <summary><span>Regola la seduta<br><span class="muted" style="font-weight:500;font-size:.88rem">${esc(stSum)}</span></span></summary>
        <div><div class="between"><span class="lbl">Yoga</span><span class="lbl">Tonificazione</span></div>
          <input type="range" id="yoga" min="0" max="4" step="1" value="${st.yoga}" aria-label="Equilibrio tra yoga e tonificazione">
          <div class="range-labels"><span>Più yoga</span><span>Metà e metà</span><span>Più forza</span></div></div>
        <div><span class="lbl">Insisti su</span><div class="chips" id="focus" style="margin-top:6px">${FOCUS.map(([k, n]) => `<button class="chip" data-f="${k}" aria-pressed="${st.focus.includes(k)}">${n}</button>`).join("")}</div></div>
        <div><span class="lbl">Intensità</span><div class="seg" id="intensity" style="margin-top:6px">${["leggera", "normale", "sfidante"].map(k => `<button data-v="${k}" aria-pressed="${st.intensity === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join("")}</div></div>
        <div><span class="lbl">Durata massima</span><div class="seg" id="minutes" style="margin-top:6px">${[20, 30, 45].map(k => `<button data-v="${k}" aria-pressed="${st.minutes === k}">${k} min</button>`).join("")}</div></div>
        <div><span class="lbl">Recupero per prepararsi</span><div class="seg" id="restx" style="margin-top:6px">${[[0, "Normale"], [10, "+10 s"], [20, "+20 s"]].map(([k, n]) => `<button data-v="${k}" aria-pressed="${(st.restExtra || 0) === k}">${n}</button>`).join("")}</div><span class="muted" style="font-size:.85rem">Più tempo fra un esercizio e l'altro; gli esercizi restano gli stessi.</span></div>
        <div><button class="btn small ghost" id="regreset">Reset: torna ai valori iniziali</button></div>
      </details>
      ${tripCard}
    </main>`;
    if (s) {
      $("#start").onclick = () => startSession(s);
      const sk = $("#skip"); if (sk) sk.onclick = () => { S.skipped[s.k] = P.today(); save(); toast("Seduta saltata: si va avanti con il programma"); renderOggi(); };
    }
    $("#settings").onclick = openSettings;
    $("#regbox").ontoggle = e => { regOpen = e.target.open; };
    $("#trip").onclick = openTrip;
    if (testDue) { $("#dotest").onclick = openTests; $("#snooze").onclick = () => { S.testSnooze = t; save(); renderOggi(); }; }
    $("#yoga").oninput = e => { st.yoga = +e.target.value; save(); };
    $("#yoga").onchange = () => renderOggi();
    $("#focus").onclick = e => { const b = e.target.closest("button"); if (!b) return; const k = b.dataset.f; st.focus = st.focus.includes(k) ? st.focus.filter(x => x !== k) : [...st.focus, k]; save(); renderOggi(); };
    $("#intensity").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.intensity = b.dataset.v; save(); renderOggi(); };
    $("#minutes").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.minutes = +b.dataset.v; save(); renderOggi(); };
    $("#restx").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.restExtra = +b.dataset.v; save(); renderOggi(); };
    $("#regreset").onclick = () => { for (const k of ["yoga", "focus", "intensity", "minutes", "restExtra"]) st[k] = structuredClone(DEF.settings[k]); save(); renderOggi(); toast("Regolazioni riportate ai valori iniziali"); };
    app.querySelectorAll("[data-gotab]").forEach(b => b.onclick = () => go(b.dataset.gotab));
    app.querySelectorAll("[data-seen]").forEach(b => b.onclick = () => { S.checksSeen.push(b.dataset.seen); save(); renderOggi(); });
  }
  function previewList(sess) {
    return `<div class="preview-list">${sess.blocks.map(b => `<div class="blk">${esc(b.n || { risc: "Riscaldamento", allung: "Allungamento", yoga: "Yoga flow", finale: "Finale" }[b.k] || "")}${b.giri > 1 ? ` · ${b.giri} giri` : ""}</div>` +
      b.items.map(x => { const [id, sx] = x.split(" "); return `<button type="button" class="pv-ex" data-ex="${id}"><span>${esc(BY[id].n)}${sx ? ' <span class="muted">destra e sinistra</span>' : ""}</span><span class="muted" aria-hidden="true">›</span></button>`; }).join("")).join("")}</div>`;
  }
  // Sposta tutte le sedute non fatte (da quella in cui si è fermata) di settimane intere:
  // la prima cade nel suo stesso giorno della settimana, da oggi in poi
  function reschedule(s) {
    const all = sessions().filter(x => !x.done && !S.skipped[x.k] && x.date >= s.date), weeks = Math.ceil((P.parse(P.today()) - P.parse(s.date)) / 864e5 / 7);
    all.forEach(x => { S.moves[x.k] = P.addDays(x.date, weeks * 7); });
    save(); toast(`Ripartiamo: programma spostato avanti di ${weeks} ${weeks === 1 ? "settimana" : "settimane"}`); render();
  }

  // ---------- CALENDARIO ----------
  function renderCal() {
    const all = sessions(), byDate = {};
    all.forEach(s => (byDate[s.date] = byDate[s.date] || []).push(s));
    const t = P.today(), first = P.parse(all[0].date), months = [];
    for (let k = 0; k < 9; k++) months.push(new Date(first.getFullYear(), first.getMonth() + k, 1));
    const monthHtml = m => {
      const y = m.getFullYear(), mo = m.getMonth(), days = new Date(y, mo + 1, 0).getDate(), off = (m.getDay() + 6) % 7;
      let cells = ["L", "M", "M", "G", "V", "S", "D"].map(x => `<div class="dow">${x}</div>`).join("") + "<div></div>".repeat(off);
      for (let d = 1; d <= days; d++) {
        const ds = P.iso(new Date(y, mo, d)), ss = byDate[ds], isSat = new Date(y, mo, d).getDay() === 6;
        if (ss) cells += `<button class="day s-${ss[0].type} ${ds === t ? "today" : ""} ${ss.every(x => x.done) ? "done" : ""}" data-date="${ds}" aria-label="${esc(P.fmt(ds, true))}, seduta ${ss.map(x => x.type).join(" e ")}">${d}<small>${ss.map(x => x.type).join("")}</small></button>`;
        else cells += `<div class="day ${isSat ? "s-R" : ""} ${ds === t ? "today" : ""}">${d}${isSat ? "<small>Ref</small>" : ""}</div>`;
      }
      return `<section class="card"><h3>${P.MM[mo][0].toUpperCase() + P.MM[mo].slice(1)} ${y}</h3><div class="grid7">${cells}</div></section>`;
    };
    const n = nextSession();
    app.innerHTML = `<main class="screen">
      <h1>Calendario</h1>
      <div class="legend"><span><i style="background:var(--cal-a)"></i>A · glutei, cosce, addome</span><span><i style="background:var(--cal-b)"></i>B · braccia, schiena, yoga</span><span><i style="background:var(--cal-r)"></i>Reformer</span></div>
      <p class="muted">Tocca un giorno colorato per vedere la seduta, spostarla o farla subito.</p>
      <div class="months">${months.map(monthHtml).join("")}</div>
      <section class="card"><h3>Promemoria sul telefono</h3>
        <p class="muted">Aggiunge al tuo calendario un appuntamento ogni martedì e giovedì, con un avviso all'ora che scegli. Si apre Google Calendar: premi «Salva».</p>
        <div class="row"><label for="remt" class="lbl">Ora</label><input type="time" id="remt" value="${esc(S.settings.reminder)}" style="font:inherit;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
        <button class="btn primary small" id="gcal">Aggiungi a Google Calendar</button></div>
        <button class="btn ghost small" id="ics">Altro calendario (file .ics)</button></section>
      ${stalled() ? `<section class="card"><h3>Ripartire da dove eri rimasta?</h3><p class="muted">Sei ferma da più di 10 giorni. Puoi spostare in avanti tutte le sedute non fatte, così riprendi dal punto del programma in cui eri (oppure lasciare tutto com'è e continuare dal calendario).</p><button class="btn primary small" id="resched">Riparti da ${esc(P.fmt(stalled().date))}</button></section>` : ""}
    </main>`;
    app.querySelectorAll("button.day").forEach(b => b.onclick = () => openDay(b.dataset.date, byDate[b.dataset.date]));
    $("#remt").onchange = e => { S.settings.reminder = e.target.value; save(); };
    $("#ics").onclick = downloadIcs;
    $("#gcal").onclick = () => {
      const [hh, mm] = (S.settings.reminder || "17:30").split(":").map(Number), first = sessions().find(x => !x.done && x.date >= P.today()) || sessions()[0];
      const pad = x => String(x).padStart(2, "0"), d = first.date.replace(/-/g, ""), end = new Date(2000, 0, 1, hh, mm + 45);
      const q = new URLSearchParams({ action: "TEMPLATE", text: "Muoviamoci! Seduta", dates: `${d}T${pad(hh)}${pad(mm)}00/${d}T${pad(end.getHours())}${pad(end.getMinutes())}00`, ctz: "Europe/Rome", recur: "RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20270630", details: "Martedì seduta A, giovedì seduta B. Apri Muoviamoci! e premi Inizia. Il 24 e il 31 dicembre la seduta è anticipata al mercoledì." });
      window.open("https://calendar.google.com/calendar/render?" + q.toString(), "_blank");
    };
    const rs = $("#resched"); if (rs) rs.onclick = () => { reschedule(stalled()); go("calendario"); };
  }
  function openDay(date, ss) {
    const body = ss.map(s => {
      const sess = P.build(s, stFor()), steps = P.steps(sess);
      return `<section class="card"><div class="between"><span class="pill ${s.type.toLowerCase()}">Seduta ${s.type}</span>${s.done ? '<span class="pill ok">Fatta</span>' : ""}</div>
        <h3>${esc(P.TITLE[s.type])}</h3><p class="muted">${esc(P.blockName(s.block))} · ${esc(weekLabel(s))} · circa ${mins(P.totalSec(steps))} min</p>${s.note ? `<p>${esc(s.note)}</p>` : ""}
        <details class="fold"><summary>Esercizi</summary>${previewList(sess)}</details>
        <div class="row"><button class="btn primary small" data-start="${s.i}">${I.play} Inizia ora</button>
        <label class="lbl" for="mv${s.i}">Sposta al</label><input type="date" id="mv${s.i}" data-move="${s.k}" value="${s.date}" style="font:inherit;padding:6px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)"></div></section>`;
    }).join("");
    const sh = sheet(`<h2>${esc(P.fmt(date, true))}</h2>${body}`);
    sh.querySelectorAll("[data-start]").forEach(b => b.onclick = () => { closeSheet(); startSession(ss.find(x => x.i == b.dataset.start)); });
    sh.querySelectorAll("[data-move]").forEach(inp => inp.onchange = () => { if (!inp.value) return; S.moves[inp.dataset.move] = inp.value; save(); closeSheet(); toast("Seduta spostata al " + P.fmt(inp.value, true)); renderCal(); });
  }
  function downloadIcs() {
    const [hh, mm] = (S.settings.reminder || "17:30").split(":");
    const pad = n => String(n).padStart(2, "0");
    const ev = sessions().filter(s => !s.done && s.date >= P.today()).map(s => {
      const d = s.date.replace(/-/g, ""), end = new Date(P.parse(s.date).getTime()); end.setHours(+hh, +mm + 45);
      return ["BEGIN:VEVENT", `UID:muoviamoci-${s.k}-${d}@app`, `DTSTAMP:${d}T000000`, `DTSTART:${d}T${pad(hh)}${pad(mm)}00`, `DTEND:${d}T${pad(end.getHours())}${pad(end.getMinutes())}00`,
        `SUMMARY:Muoviamoci! Seduta ${s.type}`, `DESCRIPTION:${P.TITLE[s.type]}`, "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Muoviamoci!", "END:VALARM", "END:VEVENT"].join("\r\n");
    });
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Muoviamoci//IT", ...ev, "END:VCALENDAR"].join("\r\n");
    saveFile("muoviamoci-sedute.ics", ics, "text/calendar");
    toast("File del calendario scaricato: aprilo per aggiungere le sedute");
  }
  function saveFile(name, text, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ---------- ESERCIZI ----------
  let libZone = "all";
  function renderLib() {
    const list = EX.filter(e => libZone === "all" || e.z === libZone);
    app.innerHTML = `<main class="screen">
      <h1>Esercizi</h1>
      <div class="chips" id="zf">${[["all", "Tutti"], ...Object.entries(ZN)].map(([k, n]) => `<button class="chip" data-z="${k}" aria-pressed="${k === libZone}">${n}</button>`).join("")}</div>
      <div class="ex-grid">${list.map(e => `<button class="ex-tile" data-id="${e.id}" style="background:var(--z-${e.z})">
        <b>${esc(e.n)}</b><small>${esc(ZN[e.z])} · ${e.id}</small>
        <span class="flags">${e.m ? '<span class="pill">Manubri</span>' : ""}${e.k === "att" ? '<span class="pill warn">Ginocchio</span>' : ""}${S.excluded.includes(e.id) ? '<span class="pill">Escluso</span>' : ""}${S.knee.includes(e.id) ? '<span class="pill warn">Fastidio</span>' : ""}</span></button>`).join("")}</div>
    </main>`;
    $("#zf").onclick = e => { const b = e.target.closest("button"); if (!b) return; libZone = b.dataset.z; renderLib(); };
    app.querySelectorAll(".ex-tile").forEach(b => b.onclick = () => openEx(b.dataset.id));
  }
  function openEx(id) {
    const e = BY[id];
    const sh = sheet(`<div class="between"><h2>${esc(e.n)}</h2><span class="pill">${e.id}</span></div>
      <div class="stage" id="exstage" style="background:var(--z-${e.z})"><span class="hint">${has3D ? "trascina per girare" : ""}</span></div>
      <button class="btn" id="listen">${I.sound} Ascolta la spiegazione</button>
      <p>${esc(e.d)}</p>
      ${e.kn ? `<p class="knee"><b>Ginocchio:</b> ${esc(e.kn)}</p>` : ""}
      <div><span class="lbl">Respiro</span><p>${esc(e.r)}</p></div>
      <div><span class="lbl">Cosa dice la voce</span><p class="voice">«${esc(e.v)}»</p></div>
      <div><span class="lbl">Errore da evitare</span><p>${esc(e.e)}</p></div>
      ${e.x ? `<div><span class="lbl">Varianti</span><p>${esc(e.x)}</p></div>` : ""}
      ${PERCHE[id] ? `<details class="card fold"><summary>Perché, insieme al reformer</summary><p>${esc(PERCHE[id])}</p></details>` : ""}
      <div class="row">
        <button class="chip" id="exc" aria-pressed="${S.excluded.includes(id)}">Non mi piace: escludilo</button>
        <button class="chip" id="kn" aria-pressed="${S.knee.includes(id)}">Mi dà fastidio al ginocchio</button>
      </div>
      <button class="btn" id="addplan">${I.plus} Aggiungi a un mio piano</button>`);
    figs.push(figure($("#exstage", sh), id));
    $("#listen", sh).onclick = () => { VOICE.unlock(); VOICE.stop(); VOICE.say(`ex_${id}_desc.mp3`); VOICE.say(`ex_${id}_guida.mp3`); };
    $("#exc", sh).onclick = ev => { toggle(S.excluded, id); ev.currentTarget.setAttribute("aria-pressed", S.excluded.includes(id)); save(); toast(S.excluded.includes(id) ? "Escluso: verrà sostituito nelle sedute" : "Di nuovo nelle sedute"); if (tab === "oggi") renderOggi(); };
    $("#kn", sh).onclick = ev => { toggle(S.knee, id); ev.currentTarget.setAttribute("aria-pressed", S.knee.includes(id)); save(); toast(S.knee.includes(id) ? "Segnato: verrà sostituito con un'alternativa senza carico" : "Segnalazione tolta"); if (tab === "oggi") renderOggi(); };
    $("#addplan", sh).onclick = () => { closeSheet(); pickPlanFor(id); };
  }
  const toggle = (arr, v) => { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); };

  // ---------- IL MIO PIANO ----------
  function renderPlans() {
    app.innerHTML = `<main class="screen">
      <h1>Il mio piano</h1>
      <p class="muted">Se il programma proposto non ti va, costruisci una seduta tua: scegli gli esercizi, l'ordine e i tempi. La voce e le figure funzionano allo stesso modo.</p>
      <div class="list">${S.plans.map(p => `<div class="item"><span class="sw" style="background:var(--accent)"></span><div class="grow"><b>${esc(p.name)}</b><span class="muted">${p.items.length} esercizi · circa ${mins(P.totalSec(P.steps(P.fromPlan(p))))} min</span></div>
        <button class="icon" data-run="${p.id}" aria-label="Inizia ${esc(p.name)}">${I.play}</button><button class="btn small ghost" data-edit="${p.id}">Modifica</button></div>`).join("") || '<p class="muted">Nessun piano ancora.</p>'}</div>
      <button class="btn primary" id="newplan">${I.plus} Nuovo piano</button>
    </main>`;
    $("#newplan").onclick = () => editPlan(null);
    app.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => editPlan(S.plans.find(p => p.id === b.dataset.edit)));
    app.querySelectorAll("[data-run]").forEach(b => b.onclick = () => { const p = S.plans.find(x => x.id === b.dataset.run); startPlan(p); });
  }
  function pickPlanFor(id) {
    if (!S.plans.length) { editPlan({ id: "p" + Date.now(), name: "Il mio piano", items: [{ id, work: 40 }], rest: 20, giri: 1, isNew: true }); return; }
    const sh = sheet(`<h2>Aggiungi «${esc(BY[id].n)}» a…</h2><div class="list">${S.plans.map(p => `<button class="item" data-p="${p.id}" style="cursor:pointer;text-align:left"><div class="grow"><b>${esc(p.name)}</b></div></button>`).join("")}</div><button class="btn" id="np">Nuovo piano</button>`);
    sh.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const p = S.plans.find(x => x.id === b.dataset.p); p.items.push({ id, work: 40 }); save(); closeSheet(); toast("Aggiunto a " + p.name); });
    $("#np", sh).onclick = () => { closeSheet(); editPlan({ id: "p" + Date.now(), name: "Il mio piano", items: [{ id, work: 40 }], rest: 20, giri: 1, isNew: true }); };
  }
  function editPlan(p) {
    const d = p ? structuredClone(p) : { id: "p" + Date.now(), name: "", items: [], rest: 20, giri: 1, isNew: true };
    const sh = sheet("");
    const draw = () => {
      sh.innerHTML = `<div class="grab"></div><h2>${d.isNew ? "Nuovo piano" : "Modifica piano"}</h2>
        <label class="lbl" for="pn">Nome</label><input id="pn" value="${esc(d.name)}" placeholder="Es. Glutei veloce" style="font:inherit;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
        <div class="row"><span class="lbl">Recupero</span><div class="seg" id="prest">${[10, 15, 20, 30].map(v => `<button data-v="${v}" aria-pressed="${d.rest === v}">${v}"</button>`).join("")}</div></div>
        <div class="row"><span class="lbl">Giri</span><div class="seg" id="pgiri">${[1, 2, 3].map(v => `<button data-v="${v}" aria-pressed="${d.giri === v}">${v}</button>`).join("")}</div></div>
        <span class="lbl">Esercizi (${d.items.length}) · circa ${mins(P.totalSec(P.steps(P.fromPlan(d))))} min</span>
        <div class="list">${d.items.map((x, n) => `<div class="item"><span class="sw" style="background:var(--z-${BY[x.id].z})"></span><div class="grow"><b>${esc(BY[x.id].n)}</b>
          <div class="row" style="gap:6px;margin-top:4px"><div class="seg">${[30, 40, 45, 60].map(v => `<button data-w="${n}" data-v="${v}" aria-pressed="${(x.work || 40) === v}">${v}"</button>`).join("")}</div>
          <button class="chip" data-both="${n}" aria-pressed="${!!x.both}">Destra e sinistra</button></div></div>
          <div style="display:flex;flex-direction:column;gap:4px"><button class="icon" data-up="${n}" aria-label="Sposta su">${I.arrowUp}</button><button class="icon" data-dn="${n}" aria-label="Sposta giù">${I.arrowDown}</button><button class="icon" data-rm="${n}" aria-label="Togli">${I.x}</button></div></div>`).join("")}</div>
        <details class="card fold"><summary>Aggiungi esercizi</summary><div class="list">${EX.map(e => `<button class="item" data-add="${e.id}" style="cursor:pointer;text-align:left"><span class="sw" style="background:var(--z-${e.z})"></span><div class="grow"><b>${esc(e.n)}</b><span class="muted">${esc(ZN[e.z])}</span></div>${I.plus}</button>`).join("")}</div></details>
        <div class="row"><button class="btn primary" id="psave">Salva</button>${d.isNew ? "" : '<button class="btn danger" id="pdel">Elimina</button>'}<button class="btn ghost" id="pcancel">Annulla</button></div>`;
      $("#pn", sh).oninput = e => { d.name = e.target.value; };
      $("#prest", sh).onclick = e => { const b = e.target.closest("button"); if (b) { d.rest = +b.dataset.v; draw(); } };
      $("#pgiri", sh).onclick = e => { const b = e.target.closest("button"); if (b) { d.giri = +b.dataset.v; draw(); } };
      sh.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { d.items[b.dataset.w].work = +b.dataset.v; draw(); });
      sh.querySelectorAll("[data-both]").forEach(b => b.onclick = () => { const it = d.items[b.dataset.both]; it.both = !it.both; draw(); });
      sh.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { const n = +b.dataset.up; if (n > 0) { [d.items[n - 1], d.items[n]] = [d.items[n], d.items[n - 1]]; draw(); } });
      sh.querySelectorAll("[data-dn]").forEach(b => b.onclick = () => { const n = +b.dataset.dn; if (n < d.items.length - 1) { [d.items[n + 1], d.items[n]] = [d.items[n], d.items[n + 1]]; draw(); } });
      sh.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { d.items.splice(+b.dataset.rm, 1); draw(); });
      sh.querySelectorAll("[data-add]").forEach(b => b.onclick = () => { d.items.push({ id: b.dataset.add, work: 40 }); draw(); toast("Aggiunto: " + BY[b.dataset.add].n); });
      $("#psave", sh).onclick = () => {
        if (!d.items.length) { toast("Aggiungi almeno un esercizio"); return; }
        d.name = d.name.trim() || "Il mio piano"; delete d.isNew;
        const i = S.plans.findIndex(x => x.id === d.id); if (i >= 0) S.plans[i] = d; else S.plans.push(d);
        save(); closeSheet(); go("piani"); toast("Piano salvato");
      };
      const del = $("#pdel", sh); if (del) del.onclick = () => { S.plans = S.plans.filter(x => x.id !== d.id); save(); closeSheet(); go("piani"); toast("Piano eliminato"); };
      $("#pcancel", sh).onclick = closeSheet;
    };
    draw();
  }

  // ---------- PROGRESSI ----------
  function voteStats() {
    const m = {};
    for (const v of S.votes) {
      const x = m[v.id] = m[v.id] || { up: 0, down: 0, r: {} };
      x[v.v]++; if (v.r) x.r[v.r] = (x.r[v.r] || 0) + 1;
    }
    return m;
  }
  function renderProg() {
    const vs = voteStats(), done = S.history.length, minTot = S.history.reduce((a, h) => a + (h.min || 0), 0);
    const proposals = Object.entries(vs).filter(([id, x]) => (x.r.nonpiace || 0) >= 3 && !S.excluded.includes(id));
    app.innerHTML = `<main class="screen">
      <h1>Progressi</h1>
      <section class="card"><div class="row" style="gap:28px">
        <div><div class="est num">${done}</div><span class="muted">sedute fatte</span></div>
        <div><div class="est num">${minTot}</div><span class="muted">minuti in tutto</span></div>
        <div><div class="est num">${weekStreak()}</div><span class="muted">settimane complete di fila</span></div></div></section>
      <button class="card trip-card" id="trip2"><div class="between"><span class="lbl">Il tuo viaggio · 東海道</span><span class="muted num">${tripKm()} / ${VIAGGIO.TOT} km</span></div>${VIAGGIO.map(tripKm())}<span class="muted">Tocca per vedere le cartoline (${S.cards.length} di ${VIAGGIO.STOPS.length}).</span></button>
      <section class="card"><h3>Mini-test</h3>${testsTable()}</section>
      ${proposals.length ? `<section class="card" style="border-color:var(--warn)"><h3>Da sostituire?</h3>${proposals.map(([id]) => `<div class="between"><span>«${esc(BY[id].n)}» non ti piace (3 volte)</span><button class="btn small" data-repl="${id}">Sostituisci</button></div>`).join("")}</section>` : ""}
      <section class="card"><h3>Controlli con Claude</h3>
        ${P.CHECKS.map(c => `<div class="between"><span><b>${esc(P.fmt(c.date))}</b> · ${esc(c.t)}</span></div>`).join("")}
        <button class="btn primary" id="copy">Copia il riepilogo per Claude</button>
        <textarea id="out" hidden readonly style="width:100%;min-height:160px;font:inherit;font-size:.85rem;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:8px"></textarea></section>
      <section class="card"><h3>Pollici per esercizio</h3>
        ${Object.keys(vs).length ? `<div class="list">${Object.entries(vs).sort((a, b) => b[1].down - a[1].down).map(([id, x]) => `<div class="item"><span class="sw" style="background:var(--z-${BY[id].z})"></span><div class="grow"><b>${esc(BY[id].n)}</b><span class="muted">${Object.entries(x.r).map(([k, n]) => `${REASONS.find(r => r[0] === k)[1]} ×${n}`).join(" · ")}</span></div><span class="pill ok">${x.up} su</span><span class="pill" style="background:var(--no-bg);color:var(--no)">${x.down} giù</span></div>`).join("")}</div>` : '<p class="muted">Dopo ogni esercizio, durante il recupero, tocca il pollice verde o rosso. Qui vedrai il riepilogo.</p>'}
        ${S.knee.length || S.excluded.length || Object.keys(S.tweak).length || Object.keys(S.restBonus).length ? `<p class="muted">Modifiche automatiche: ${[...S.knee.map(id => BY[id].n + " (ginocchio)"), ...S.excluded.map(id => BY[id].n + " (escluso)"), ...Object.entries(S.tweak).map(([id, v]) => `${BY[id].n} (${v > 0 ? "+" : ""}${v}")`), ...Object.entries(S.restBonus).map(([id, v]) => `${BY[id].n} (recupero +${v}")`)].map(esc).join(", ")}</p><button class="btn small ghost" id="resetauto">Annulla le modifiche automatiche</button>` : ""}
      </section>
      <section class="card"><h3>Sedute fatte</h3>${S.history.length ? `<div class="list">${S.history.slice().reverse().map(h => `<div class="between"><span>${esc(P.fmt(h.date))} · ${esc(h.title)}</span><span class="muted num">${h.min} min · ${esc(h.rating || "")}</span></div>`).join("")}</div>` : '<p class="muted">Ancora nessuna.</p>'}</section>
      <section class="card"><h3>App</h3><p class="muted">Versione: <b id="ver">…</b></p><p class="muted" id="updmsg" hidden></p>
        <div class="row"><button class="btn small" id="chkupd">Controlla aggiornamenti</button></div>
        <p class="muted" style="font-size:.8rem;margin:0">Musica: «Life of Riley», «Kawai Kitsune», «Ishikari Lore», «Meditation Impromptu 02» di Kevin MacLeod (incompetech.com), licenza Creative Commons BY 4.0.</p></section>
      <section class="card"><h3>Copia di sicurezza</h3><p class="muted">Salva i tuoi dati in un file, per non perderli se cambi telefono.</p>
        <div class="row"><button class="btn small" id="exp">Salva copia</button><label class="btn small ghost" for="imp">Ripristina</label><input type="file" id="imp" accept="application/json,.json" hidden></div></section>
    </main>`;
    $("#trip2").onclick = openTrip;
    $("#retest").onclick = openTests;
    $("#copy").onclick = () => {
      const txt = summaryText(), out = $("#out"); out.value = txt;
      const fb = () => { out.hidden = false; out.focus(); out.select(); toast("Seleziona il testo e copialo"); };
      try { navigator.clipboard.writeText(txt).then(() => toast("Riepilogo copiato: incollalo nella chat con Claude"), fb); } catch (e) { fb(); }
    };
    app.querySelectorAll("[data-repl]").forEach(b => b.onclick = () => { S.excluded.push(b.dataset.repl); save(); toast("Sostituito con un esercizio equivalente"); renderProg(); });
    const ra = $("#resetauto"); if (ra) ra.onclick = () => { S.knee = []; S.excluded = []; S.tweak = {}; S.restBonus = {}; S.restUse = {}; save(); renderProg(); };
    showVersion();
    $("#chkupd").onclick = checkUpdate;
    $("#exp").onclick = () => saveFile(`muoviamoci-copia-${P.today()}.json`, JSON.stringify(S, null, 1), "application/json");
    $("#imp").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { const d = JSON.parse(t); if (!d.settings) throw new Error(); if (!confirm("Sostituire i dati di questo telefono con quelli della copia?")) return; S = { ...DEF, ...d }; S.settings = { ...DEF.settings, ...d.settings }; save(); window.FIG_LOOK = S.look; toast("Dati ripristinati"); go("oggi"); }).catch(() => toast("Il file non è una copia di Muoviamoci!"));
    };
  }
  function summaryText() {
    const vs = voteStats(), L = ["RIEPILOGO MUOVIAMOCI! – " + P.fmt(P.today(), true), ""];
    L.push(`Sedute fatte: ${S.history.length}`);
    S.history.forEach(h => L.push(`- ${h.date} ${h.title}: ${h.min} min, giudizio: ${h.rating || "-"}`));
    L.push("", "Regolazioni: " + JSON.stringify(S.settings));
    if (Object.keys(S.restBonus).length) L.push("Recupero allungato da sola (+15 s usato più volte): " + Object.entries(S.restBonus).map(([id, v]) => `${BY[id].n} +${v}"`).join(", "));
    L.push(`Progressione automatica: A ${S.prog.A >= 0 ? "+" : ""}${S.prog.A}", B ${S.prog.B >= 0 ? "+" : ""}${S.prog.B}" di lavoro · settimane complete di fila: ${weekStreak()} · viaggio: ${tripKm()} km`);
    L.push("", "MINI-TEST (sedia = alzate in 30\", plank e equilibrio = secondi)");
    S.tests.forEach(r => L.push(`- ${r.date}: sedia ${r.sedia ?? "-"}, plank ${r.plank ?? "-"}, equilibrio ${r.equi ?? "-"}`));
    if (!S.tests.length) L.push("- nessuno");
    L.push("", "POLLICI PER ESERCIZIO");
    Object.entries(vs).forEach(([id, x]) => L.push(`${id} ${BY[id].n}: ${x.up} su, ${x.down} giù${Object.keys(x.r).length ? " (" + Object.entries(x.r).map(([k, n]) => `${k} ×${n}`).join(", ") + ")" : ""}`));
    L.push("", "Fastidio al ginocchio: " + (S.knee.join(", ") || "nessuno"));
    L.push("Esclusi: " + (S.excluded.join(", ") || "nessuno"));
    L.push("Tempi modificati: " + (Object.entries(S.tweak).map(([k, v]) => `${k} ${v}"`).join(", ") || "nessuno"));
    if (S.plans.length) L.push("Piani personali: " + S.plans.map(p => `${p.name} (${p.items.map(i => i.id).join(" ")})`).join("; "));
    return L.join("\n");
  }

  // Regole sui pollici
  function applyVoteRules(id) {
    const x = voteStats()[id]; if (!x) return;
    if (x.r.ginocchio && !S.knee.includes(id)) { S.knee.push(id); toast("Dalla prossima seduta: alternativa senza carico sul ginocchio"); }
    if ((x.r.difficile || 0) >= 2 && !(S.tweak[id] < 0)) { S.tweak[id] = -10; toast("Dalla prossima volta: 10 secondi in meno"); }
    if ((x.r.facile || 0) >= 2 && !(S.tweak[id] > 0)) { S.tweak[id] = 10; toast("Dalla prossima volta: 10 secondi in più"); }
  }

  // ---------- VIAGGIO SUL TŌKAIDŌ ----------
  const totalMin = () => S.history.reduce((a, h) => a + (h.min || 0), 0);
  const tripKm = () => VIAGGIO.kmOf(totalMin());
  // Cartoline appena raggiunte e non ancora viste
  function newCards() {
    const got = VIAGGIO.reached(tripKm()).map(x => VIAGGIO.STOPS.indexOf(x));
    const fresh = got.filter(i => !S.cards.includes(i));
    S.cards = got; save();
    return fresh;
  }
  function openTrip() {
    const km = tripKm();
    const sh = sheet(`<div class="between"><h2>Il viaggio sul Tōkaidō</h2><span class="pill">東海道</span></div>
      <p class="muted">Ogni minuto di allenamento è strada: da Tokyo a Kyoto lungo l'antica «strada del mare orientale», 492 km. Hai fatto <b>${km} km</b>.</p>
      ${VIAGGIO.map(km)}
      <div class="pc-list">${VIAGGIO.STOPS.map((x, i) => x.km <= km ? `<figure class="pc-fig">${VIAGGIO.card(i)}<figcaption><b>${esc(x.n)}</b> · km ${x.km}<br>${esc(x.t)}</figcaption></figure>` : `<figure class="pc-fig">${VIAGGIO.card(i, true)}</figure>`).join("")}</div>`);
    sh.classList.add("washi");
  }

  // ---------- MINI-TEST ----------
  const TESTS = [
    { k: "sedia", n: "Alzate dalla sedia in 30 secondi", u: "volte", dur: 30, mode: "down", d: "Seduta a metà della sedia, braccia incrociate sul petto. Al via alzati in piedi del tutto e risiediti, più volte che puoi in 30 secondi, con calma e bene. Conta tu le alzate." },
    { k: "plank", n: "Plank dalle ginocchia", u: "secondi", dur: 60, mode: "up", d: "Sugli avambracci, ginocchia a terra sull'asciugamano, corpo in linea. Tieni finché la posizione è buona, al massimo 60 secondi: ferma il tempo quando cedi." },
    { k: "equi", n: "Equilibrio su una gamba", u: "secondi", dur: 60, mode: "up", d: "Vicino alla sedia ma senza appoggiarti, solleva un piede. Ferma il tempo quando appoggi il piede o la mano. Massimo 60 secondi: fai il lato più difficile." }
  ];
  // Dovuto: la prima volta, poi dopo ogni controllo di fine blocco
  function testIsDue() {
    if (!S.tests.length) return true;
    const last = S.tests[S.tests.length - 1].date, t = P.today();
    return P.CHECKS.slice(1).some(c => c.date <= t && last < c.date);
  }
  function openTests() {
    const vals = {};
    const sh = sheet(`<h2>Mini-test</h2><p class="muted">Tre prove semplici. Per ognuna: leggi, premi <b>Avvia</b>, poi scrivi il risultato. Si rifanno a fine di ogni blocco per vedere i progressi.</p>
      ${TESTS.map(x => `<section class="card" data-t="${x.k}"><h3>${esc(x.n)}</h3><p>${esc(x.d)}</p>
        <div class="between"><button class="btn small primary" data-go="${x.k}">Avvia</button><span class="est num" data-clock="${x.k}">${x.mode === "down" ? x.dur : 0}</span></div>
        <label class="row"><span class="lbl">Risultato (${x.u})</span><input type="number" inputmode="numeric" min="0" max="200" data-v="${x.k}" class="num-in"></label></section>`).join("")}
      <button class="btn primary big" id="tsave">Salva i risultati</button>`);
    let run = null;
    const stop = () => { if (run) { clearInterval(run.iv); run.btn.textContent = "Avvia"; run = null; } };
    sh.querySelectorAll("[data-go]").forEach(btn => btn.onclick = () => {
      const x = TESTS.find(y => y.k === btn.dataset.go), clock = sh.querySelector(`[data-clock="${x.k}"]`), inp = sh.querySelector(`[data-v="${x.k}"]`);
      if (run && run.k === x.k) { if (x.mode === "up") inp.value = Math.floor(run.t); stop(); return; }
      stop(); VOICE.unlock(); VOICE.say("g_via.mp3");
      const t0 = performance.now();
      run = { k: x.k, btn, t: 0, iv: setInterval(() => {
        run.t = (performance.now() - t0) / 1000;
        const left = x.dur - run.t;
        clock.textContent = x.mode === "down" ? Math.max(0, Math.ceil(left)) : Math.min(x.dur, Math.floor(run.t));
        if (left <= 0) { VOICE.beep(660, 400); if (x.mode === "up") inp.value = x.dur; stop(); toast(x.mode === "down" ? "Tempo! Scrivi quante alzate hai fatto" : "60 secondi: bravissima!"); inp.focus(); }
      }, 200) };
      btn.textContent = "Ferma";
    });
    sh.querySelector("#tsave").onclick = () => {
      TESTS.forEach(x => { const v = sh.querySelector(`[data-v="${x.k}"]`).value; vals[x.k] = v === "" ? null : +v; });
      if (TESTS.every(x => vals[x.k] == null)) { toast("Scrivi almeno un risultato"); return; }
      stop(); S.tests.push({ date: P.today(), ...vals }); save(); closeSheet(); toast("Mini-test salvato");
      render();
    };
  }
  function testsTable() {
    if (!S.tests.length) return '<p class="muted">Ancora nessun mini-test. Lo trovi in «Oggi» a inizio programma e a fine di ogni blocco.</p><button class="btn small ghost" id="retest">Fai il mini-test</button>';
    const f = S.tests[0];
    return `<div class="tbl"><div class="tr th"><span>Data</span><span>Sedia</span><span>Plank</span><span>Equilibrio</span></div>${S.tests.map(r => `<div class="tr"><span>${esc(P.fmt(r.date))}</span>${TESTS.map(x => { const v = r[x.k], d = v != null && f[x.k] != null && r !== f ? v - f[x.k] : null; return `<span class="num">${v ?? "–"}${d ? ` <small class="${d > 0 ? "up" : "dn"}">${d > 0 ? "+" : ""}${d}</small>` : ""}</span>`; }).join("")}</div>`).join("")}</div><button class="btn small ghost" id="retest">Rifai il mini-test</button>`;
  }

  // ---------- SETTIMANE COMPLETE E PROGRESSIONE ----------
  // Settimane (da lunedì) con almeno 2 sedute del programma: la serie conta all'indietro dall'ultima completa
  function weekStreak() {
    const wk = d => { const x = P.parse(d); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return P.iso(x); };
    const n = {}; S.history.filter(h => h.type === "A" || h.type === "B").forEach(h => { const k = wk(h.date); n[k] = (n[k] || 0) + 1; });
    let cur = wk(P.today()), streak = 0;
    if (!(n[cur] >= 2)) cur = P.addDays(cur, -7);
    while (n[cur] >= 2) { streak++; cur = P.addDays(cur, -7); }
    return streak;
  }
  // Due sedute dello stesso tipo «Facile» di fila: +5" di lavoro (max +15). Due «Dura»: -5" (min -10).
  function updateProg(type) {
    if (type !== "A" && type !== "B") return "";
    const mine = S.history.map((h, i) => ({ ...h, i })).filter(h => h.type === type && h.i > S.progMark[type]);
    const last2 = mine.slice(-2);
    if (last2.length < 2) return "";
    const r = last2.map(h => h.rating);
    if (r.every(x => x === "Facile") && S.prog[type] < 15) { S.prog[type] += 5; S.progMark[type] = S.history.length - 1; return `Due volte «facile»: dalla prossima seduta ${type} ogni esercizio dura 5 secondi in più.`; }
    if (r.every(x => x === "Dura") && S.prog[type] > -10) { S.prog[type] -= 5; S.progMark[type] = S.history.length - 1; return `Due volte «dura»: dalla prossima seduta ${type} ogni esercizio dura 5 secondi in meno.`; }
    return "";
  }

  // ---------- BENVENUTO ----------
  const LOOK = {
    hair: [["#2B211C", "Neri"], ["#4A3428", "Castani"], ["#8A5A3B", "Castano chiaro"], ["#C9A063", "Biondi"], ["#9A3B22", "Rossi"], ["#A9A6A2", "Grigi"]],
    body: [["donna", "Donna"], ["uomo", "Uomo"]],
    style: [["chignon", "Chignon"], ["coda", "Coda"], ["sciolti", "Sciolti"]],
    styleM: [["corti", "Corti"], ["rasati", "Rasati"]],
    top: [["#7B4F80", "Prugna"], ["#C8432B", "Corallo"], ["#2D6E68", "Verde"], ["#2E4A7D", "Blu"], ["#E7A6B6", "Rosa"], ["#F2F2F2", "Bianco"]],
    leg: [["#34444C", "Grafite"], ["#1F1F24", "Neri"], ["#5B78A8", "Jeans"], ["#7B4F80", "Prugna"]],
    skin: [["#F1C7A8", "Chiara"], ["#E3AE8F", "Media"], ["#C68E6B", "Ambrata"], ["#8D5B3F", "Scura"]]
  };
  function welcome(start = 0) {
    const w = document.createElement("div"); w.className = "welcome"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true");
    document.body.appendChild(w); document.body.style.overflow = "hidden";
    let step = start, fig = null;
    const look = { body: "donna", skin: "#E3AE8F", top: "#7B4F80", leg: "#34444C", hair: "#4A3428", style: "chignon", ...S.look };
    const dots = n => `<div class="w-dots">${[0, 1, 2, 3, 4].map(i => `<i class="${i === n ? "on" : ""}"></i>`).join("")}</div>`;
    const pick = (k, label) => `<div><span class="lbl">${label}</span><div class="swatches" data-k="${k}">${LOOK[k === "style" && look.body === "uomo" ? "styleM" : k].map(([v, n]) => k === "style" || k === "body" ? `<button class="chip" data-v="${v}" aria-pressed="${look[k] === v}">${n}</button>` : `<button class="swatch" data-v="${v}" aria-label="${n}" aria-pressed="${look[k] === v}" style="background:${v}"></button>`).join("")}</div></div>`;
    const done = () => { if (fig && fig.stop) fig.stop(); S.welcomed = true; save(); w.remove(); document.body.style.overflow = ""; render(); };
    const STEPS = [
      () => `<div class="w-hero">👋</div><h1>Ciao! Benvenuta in Muoviamoci!</h1><p>Il tuo allenamento di casa, pensato per accompagnare il reformer del sabato: due sedute a settimana, guidate dalla voce di Isabella.</p>
        <label class="w-name"><span class="lbl">Come ti chiami?</span><input id="wname" value="${esc(S.name)}" autocomplete="given-name" placeholder="Il tuo nome"></label>`,
      () => `<div class="w-hero">🗓️</div><h1>Come funziona</h1><ul class="w-list"><li><b>Martedì e giovedì</b> una seduta di circa 40 minuti. La trovi già pronta in «Oggi».</li><li><b>Tocca un esercizio</b> per vederlo girare e ascoltare la spiegazione, prima di iniziare.</li><li><b>Premi «Inizia»</b>: Isabella ti guida con la voce e il telefono resta acceso. Puoi lasciarlo sul pavimento.</li></ul><button class="btn" id="wvoice">${I.sound} Ascolta Isabella</button>`,
      () => `<div class="w-hero">👍</div><h1>L'app impara da te</h1><ul class="w-list"><li>Dopo ogni esercizio tocca il <b>pollice verde o rosso</b>: se qualcosa non va, l'esercizio cambia da solo.</li><li>Se il <b>ginocchio</b> dà fastidio, dillo con un tocco: arriva subito un'alternativa senza carico.</li><li>A fine seduta dimmi se è stata <b>facile o dura</b>: le sedute crescono con te.</li><li>Ogni minuto di allenamento ti porta avanti in un <b>viaggio in Giappone</b>, da Tokyo a Kyoto, con le sue cartoline.</li></ul>`,
      () => `<h1>Il tuo manichino</h1><p class="muted">Fallo somigliare a te: sarà lui a mostrarti gli esercizi.</p><div class="stage w-stage" id="wstage" style="background:var(--z-glu)"></div>${pick("body", "Figura")}${pick("hair", "Capelli")}${pick("style", "Pettinatura")}${pick("top", "Maglietta")}${pick("leg", look.body === "uomo" ? "Pantaloni" : "Leggings")}${pick("skin", "Carnagione")}`,
      () => `<div class="w-hero">🪞</div><h1>Specchio intelligente</h1><p>Durante alcuni esercizi in piedi (sedia, affondo, seduta al muro) il telefono può <b>guardarti con la fotocamera</b>: conta le ripetizioni e ti avvisa a voce se il ginocchio va verso l'interno o troppo in avanti.</p><p class="muted">Le immagini restano sul telefono: non vengono salvate né inviate. Puoi cambiare idea quando vuoi nelle Impostazioni.</p><div class="row"><button class="btn ${S.mirror === true ? "primary" : ""}" id="wmy">Sì, attivalo</button><button class="btn ${S.mirror === false ? "primary" : ""}" id="wmn">No, grazie</button></div>`
    ];
    function draw() {
      if (fig && fig.stop) { fig.stop(); fig = null; }
      w.innerHTML = `<div class="w-body">${STEPS[step]()}</div><div class="w-foot">${dots(step)}<div class="row">${step ? `<button class="btn ghost" id="wback">Indietro</button>` : ""}<button class="btn primary" id="wnext">${step === STEPS.length - 1 ? "Iniziamo!" : "Avanti"}</button></div></div>`;
      const nm = w.querySelector("#wname"); if (nm) nm.oninput = () => { S.name = nm.value.trim().slice(0, 30); save(); };
      const vb = w.querySelector("#wvoice"); if (vb) vb.onclick = () => { VOICE.unlock(); VOICE.setVolume(S.settings.volume); VOICE.say("g_prova.mp3"); };
      const stg = w.querySelector("#wstage");
      if (stg) {
        const mount = () => { if (fig && fig.stop) fig.stop(); stg.innerHTML = ""; window.FIG_LOOK = look; fig = figure(stg, "R5"); };
        mount();
        w.querySelectorAll(".swatches").forEach(g => g.onclick = e => { const b = e.target.closest("button"); if (!b) return; look[g.dataset.k] = b.dataset.v;
          // Cambiando figura si passa alla pettinatura di partenza adatta e si ridisegnano le scelte
          if (g.dataset.k === "body") { look.style = b.dataset.v === "uomo" ? "corti" : "chignon"; S.look = { ...look }; save(); draw(); return; }
          g.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); S.look = { ...look }; save(); mount(); });
      }
      const my = w.querySelector("#wmy"), mn = w.querySelector("#wmn");
      if (my) { my.onclick = () => { S.mirror = true; save(); draw(); }; mn.onclick = () => { S.mirror = false; save(); draw(); }; }
      w.querySelector("#wnext").onclick = () => { if (step < STEPS.length - 1) { step++; draw(); } else done(); };
      const bk = w.querySelector("#wback"); if (bk) bk.onclick = () => { step--; draw(); };
      w.scrollTop = 0;
    }
    draw();
  }

  // ---------- Impostazioni ----------
  function openSettings() {
    const st = S.settings;
    const sh = sheet(`<h2>Impostazioni</h2>
      <label><span class="lbl">Il tuo nome</span><input id="sname" class="txt-in" value="${esc(S.name)}" autocomplete="given-name"></label>
      <div class="row"><button class="btn small" id="slook">Cambia il manichino</button><button class="btn small ghost" id="swel">Rivedi il benvenuto</button></div>
      <div><span class="lbl">Specchio intelligente (fotocamera)</span><div class="seg" id="mirror" style="margin-top:6px"><button data-v="1" aria-pressed="${S.mirror === true}">Attivo</button><button data-v="0" aria-pressed="${S.mirror !== true}">Spento</button></div>
        <p class="muted" style="margin-top:6px">Negli esercizi in piedi con il ginocchio (sedia, affondo, seduta al muro) conta le ripetizioni e avvisa se il ginocchio va verso l'interno. Le immagini restano sul telefono.</p></div>
      <div><span class="lbl">Guida della voce</span><div class="seg" id="guide" style="margin-top:6px">${[["completa", "Completa"], ["essenziale", "Essenziale"], ["tempo", "Solo tempo"]].map(([k, n]) => `<button data-v="${k}" aria-pressed="${st.guide === k}">${n}</button>`).join("")}</div>
        <p class="muted" style="margin-top:6px">Completa: posizione, respiro e consigli. Essenziale: respiro e conto alla rovescia. Solo tempo: solo il conto, con un bip.</p></div>
      <div><label class="lbl" for="vol">Volume della voce</label><input type="range" id="vol" min="0.2" max="1" step="0.1" value="${st.volume}"></div>
      <div><span class="lbl">Musica di sottofondo</span><div class="seg" id="mus" style="margin-top:6px"><button data-v="1" aria-pressed="${st.music !== false}">Accesa</button><button data-v="0" aria-pressed="${st.music === false}">Spenta</button></div>
        <label class="lbl" for="mvol" style="display:block;margin-top:8px">Volume della musica</label><input type="range" id="mvol" min="0.1" max="0.8" step="0.05" value="${st.musicVol ?? 0.35}">
        <span class="muted" style="font-size:.85rem">Ritmata per riscaldamento e circuiti, calma per yoga e allungamento. Si abbassa da sola quando parla Isabella.</span></div>
      <button class="btn" id="tryv">${I.sound} Prova la voce</button>
      <p class="muted">Puoi ascoltare la tua musica da un'altra app: la voce di Isabella si sente sopra, senza fermarla.</p>
      <p class="muted">Figure: ${has3D ? "manichino 3D" : "disegno 2D (questo telefono non supporta il 3D)"}.</p>`);
    $("#sname", sh).oninput = e => { S.name = e.target.value.trim().slice(0, 30); save(); };
    $("#slook", sh).onclick = () => { closeSheet(); welcome(3); };
    $("#swel", sh).onclick = () => { closeSheet(); welcome(0); };
    $("#mirror", sh).onclick = e => { const b = e.target.closest("button"); if (!b) return; S.mirror = b.dataset.v === "1"; save(); sh.querySelectorAll("#mirror button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
    $("#guide", sh).onclick = e => { const b = e.target.closest("button"); if (!b) return; st.guide = b.dataset.v; save(); sh.querySelectorAll("#guide button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
    $("#vol", sh).oninput = e => { st.volume = +e.target.value; VOICE.setVolume(st.volume); save(); };
    $("#mus", sh).onclick = e => { const b = e.target.closest("button"); if (!b) return; st.music = b.dataset.v === "1"; $("#mus", sh).querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); save(); };
    $("#mvol", sh).oninput = e => { st.musicVol = +e.target.value; VOICE.setMusicVol(st.musicVol); save(); };
    $("#tryv", sh).onclick = () => { VOICE.unlock(); VOICE.setVolume(st.volume); VOICE.say("g_prova.mp3"); };
  }

  // ---------- Fogli a comparsa ----------
  let sheetBack = null, playerBack = null;
  // Tasto «Indietro» di Android: chiude la scheda aperta; durante la seduta chiede se uscire
  window.addEventListener("popstate", () => {
    if (playerBack) { try { history.pushState({ m: "player" }, ""); } catch (e) { } playerBack(); }
    else if (sheetBack) closeSheet();
  });
  function sheet(html) {
    closeSheet();
    sheetBack = document.createElement("div"); sheetBack.className = "sheet-back";
    sheetBack.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}<button class="btn ghost" data-close>Chiudi</button></div>`;
    document.body.appendChild(sheetBack);
    try { history.pushState({ m: "sheet" }, ""); } catch (e) { }
    sheetBack.addEventListener("click", e => { if (e.target === sheetBack || e.target.closest("[data-close]")) closeSheet(); });
    return sheetBack.querySelector(".sheet");
  }
  function closeSheet() {
    if (!sheetBack) return;
    // Le figure si aprono solo nei fogli: alla chiusura si fermano tutte
    clearFigs();
    sheetBack.remove(); sheetBack = null; VOICE.stop();
  }

  // ---------- LETTORE DELLA SEDUTA ----------
  function startSession(s) { runPlayer(P.build(s, stFor()), { title: sessTitle(s), planned: s }); }
  function startPlan(p) { runPlayer({ ...P.fromPlan(p), restExtra: S.settings.restExtra || 0, restBonus: S.restBonus }, { title: p.name }); }

  function runPlayer(sess, meta) {
    VOICE.unlock(); VOICE.setVolume(S.settings.volume);
    VOICE.setMusicVol(S.settings.musicVol ?? 0.35); VOICE.setMusicOn(S.settings.music !== false);
    const steps = P.steps(sess), guide = S.settings.guide;
    let total = P.totalSec(steps);
    // Le presentazioni (benvenuto, inizio blocco) durano quanto la frase di Isabella: prima il conto
    // arrivava a 1 e restava fermo finché la voce non finiva
    if (guide !== "tempo") steps.forEach((st, i) => {
      if (st.kind !== "intro" || !st.clip) return;
      const files = (i === 0 ? ["g_benvenuta.mp3"] : []).concat(st.clip + ".mp3");
      Promise.all(files.map(f => VOICE.durationOf(f))).then(ds => {
        const need = Math.ceil(ds.reduce((a, b) => a + b, 0) + 1);
        if (need > st.dur) { total += need - st.dur; st.dur = need; }
      }).catch(() => { });
    });
    const el = document.createElement("div"); el.className = "player is-intro"; el.setAttribute("role", "region"); el.setAttribute("aria-label", "Seduta in corso");
    el.innerHTML = `<div class="p-top"><button class="icon" id="pclose" aria-label="Esci dalla seduta">${I.x}</button>
        <button class="icon p-mus" id="pmus" aria-label="Musica di sottofondo" aria-pressed="${S.settings.music !== false}">♪</button>
        <div class="grow"><div class="between"><b id="pblock"></b><span class="muted num" id="pleft"></span></div><div class="p-prog"><i id="pbar"></i></div></div></div>
      <div class="p-stage" id="pstage"><span class="p-phase" id="pphase"></span><span class="p-side" id="pside" hidden></span></div>
      <div class="p-info"><div class="grow"><div class="lbl" id="pnextlbl"></div><div class="p-name" id="pname"></div><div class="muted" id="pnext"></div></div>
        <div class="ring"><svg viewBox="0 0 100 100"><circle class="bgc" cx="50" cy="50" r="44"/><circle class="fgc" id="pring" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><span id="ptime">0</span></div></div>
      <div id="pvote"></div>
      <p class="caption" id="pcap" aria-live="polite"></p>
      <button class="btn p-more" id="pmore" hidden>+15 s per prepararmi</button>
      <div class="p-ctrl"><button class="btn" id="pprev" aria-label="Indietro">${I.prev}</button><button class="btn primary" id="ppause" aria-label="Pausa">${I.pause}</button><button class="btn" id="pnextb" aria-label="Avanti">${I.next}</button></div>`;
    document.body.appendChild(el);
    document.body.style.overflow = "hidden";
    try { history.pushState({ m: "player" }, ""); } catch (e) { }
    const q = id => el.querySelector("#" + id);
    VOICE.onText(t => { q("pcap").textContent = t; });

    let finished = false, active = 0;
    const sid = Date.now();
    let idx = -1, t = 0, last = performance.now(), paused = false, fig = null, figId = null, cues = [], fired = new Set(), timer = null, lock = null, lastWork = null;
    const seen = new Set();
    const elapsedBefore = i => steps.slice(0, i).reduce((a, x) => a + x.dur, 0);
    const wake = async () => { try { if ("wakeLock" in navigator) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } } catch (e) { } };
    wake();
    // Uscita dall'app (telefonata, altra app): pausa automatica; al ritorno schermo di nuovo sempre acceso
    const onVis = () => {
      if (document.visibilityState === "hidden") { if (!paused && !finished) q("ppause").click(); }
      else if (!lock && !finished) wake();
    };
    document.addEventListener("visibilitychange", onVis);

    const say = (file, opts) => { if (guide === "tempo" && !/g_(tre|due|uno)/.test(file)) return; VOICE.say(file, { text: CLIP_TEXT[file], ...opts }); };
    function count(at) {
      return [[at - 3, "g_tre.mp3"], [at - 2, "g_due.mp3"], [at - 1, "g_uno.mp3"]].map(([tt, f]) => ({ t: tt, fn: () => guide === "tempo" ? VOICE.beep(tt === at - 1 ? 660 : 880) : say(f, { prio: "h" }) }));
    }
    function buildCues(st) {
      const c = [], e = st.ex, d = st.dur;
      if (st.kind === "intro") { c.push({ t: 0.2, fn: () => say(st.clip + ".mp3") }); if (idx === 0) c.unshift({ t: 0, fn: () => say("g_benvenuta.mp3") }); }
      if (st.kind === "rest") {
        if (st.first) {
          if ((st.block.k === "forza" || st.block.k === "finale") && st.n !== 0) c.push({ t: 0.1, fn: () => say(st.dur > 10 ? "g_recupero.mp3" : "g_recupero_calmo.mp3", { prio: "l" }) });
          c.push({ t: 0.6, fn: () => say(`ex_${e.id}_nome.mp3`) });
          if (guide === "completa" && !seen.has(e.id) && d >= 8) c.push({ t: 1.2, fn: () => say(`ex_${e.id}_desc.mp3`, { maxDelay: Math.max(1, d - 6) }) });
          if (st.side) c.push({ t: 1.0, fn: () => say("g_lato_dx.mp3", { maxDelay: 4 }) });
        } else c.push({ t: 0.1, fn: () => say("g_cambia_lato.mp3") });
        if (d >= 5) c.push(...count(d));
      }
      if (st.kind === "work") {
        c.push({ t: 0, fn: () => say("g_via.mp3", { prio: "h" }) });
        const first = !seen.has(e.id) || st.giro === 1 && st.side !== "sx";
        if (guide === "completa") {
          if (st.side === "sx") c.push({ t: 0.8, fn: () => say("g_lato_sx.mp3") });
          if (first && st.side !== "sx") c.push({ t: 0.9, fn: () => say(`ex_${e.id}_guida.mp3`, { maxDelay: 6 }) });
          else c.push({ t: 1, fn: () => say(`ex_${e.id}_respiro.mp3`, { maxDelay: 6 }) });
          if (d >= 35) c.push({ t: Math.round(d * 0.5), fn: () => say(`ex_${e.id}_respiro.mp3`, { prio: "l" }) });
          if (d >= 40 && first) c.push({ t: Math.round(d * 0.66), fn: () => say(`ex_${e.id}_errore.mp3`, { prio: "l", maxDelay: 3 }) });
          if (st.slow && e.m) c.push({ t: 3, fn: () => say("g_lento.mp3", { prio: "l" }) });
          if (d >= 30) c.push({ t: Math.round(d * 0.8), fn: () => say(st.calm ? `g_calmo${1 + Math.floor(Math.random() * 4)}.mp3` : `g_forza${1 + Math.floor(Math.random() * 6)}.mp3`, { prio: "l" }) });
          if (d >= 25) c.push({ t: Math.round(d * 0.3), fn: () => say(st.calm ? "g_calmo2.mp3" : `g_respira${1 + Math.floor(Math.random() * 3)}.mp3`, { prio: "l" }) });
        } else if (guide === "essenziale") {
          c.push({ t: 0.8, fn: () => say(`ex_${e.id}_respiro.mp3`, { maxDelay: 4 }) });
        } else c.push({ t: 0, fn: () => VOICE.beep(990, 220) });
        if (d >= 30 && !st.calm) c.push({ t: d - 10, fn: () => say("g_ultimi10.mp3", { prio: "h" }) });
        c.push(...count(d));
      }
      return c.sort((a, b) => a.t - b.t);
    }
    function showFig(id) {
      if (figId === id) return;
      if (fig && fig.stop) fig.stop();
      figId = id; fig = figure(q("pstage"), id);
      q("pstage").style.background = `var(--z-${BY[id].z})`;
    }
    function nextWork(i) { for (let k = i; k < steps.length; k++) if (steps[k].kind === "work") return steps[k]; return null; }
    function enter(i) {
      if (i >= steps.length) { finish(); return; }
      if (i < 0) i = 0;
      const prev = steps[idx];
      if (prev && prev.kind === "work") { seen.add(prev.ex.id); if (prev.last) lastWork = prev; }
      idx = i; t = 0; fired = new Set(); VOICE.stop();
      const st = steps[i];
      cues = buildCues(st);
      VOICE.music(["allung", "yoga"].includes(st.block.k) ? "yoga" : "mov");
      el.className = "player is-" + st.kind;
      q("pblock").textContent = st.label || st.block.n || { risc: "Riscaldamento", allung: "Allungamento", yoga: "Yoga flow", finale: "Finale", forza: "Circuito" }[st.block.k];
      const nw = st.kind === "work" ? st : nextWork(i);
      if (nw) showFig(nw.ex.id);
      // Specchio intelligente: fotocamera accesa dal recupero prima dell'esercizio seguito, spenta dopo
      if (S.mirror && MIRROR.available()) {
        const target = nw && MIRROR.supports(nw.ex.id) ? nw.ex.id : null;
        if (target) {
          MIRROR.open(q("pstage"), f => say(f, { maxDelay: 2 })).then(ok => { if (!ok) toast("Fotocamera non disponibile: specchio spento per questa seduta"); });
          MIRROR.track(st.kind === "work" ? target : null);
        } else MIRROR.close();
      }
      q("pphase").textContent = st.kind === "work" ? "LAVORO" : st.kind === "rest" ? "RECUPERO" : "SI PARTE";
      q("pside").hidden = !(nw && nw.side); q("pside").textContent = nw && nw.side === "dx" ? "Lato destro" : "Lato sinistro";
      q("pnextlbl").textContent = st.kind === "work" ? (st.giro > 1 ? `Giro ${st.giro}` : "Ora") : "Prossimo";
      q("pname").textContent = nw ? nw.ex.n : "";
      const after = st.kind === "work" ? nextWork(i + 1) : null;
      q("pnext").textContent = after ? "Poi: " + after.ex.n : st.kind === "rest" && nw ? (st.first ? `${nw.dur}" di lavoro` : "Cambia lato") : "";
      q("pcap").textContent = "";
      q("pmore").hidden = st.kind !== "rest";
      // Pollice per l'esercizio appena finito
      const v = q("pvote");
      if (st.kind === "rest" && st.first && lastWork && st.dur >= 8) voteBox(v, lastWork.ex); else v.innerHTML = "";
      if (st.kind === "work") lastWork = null;
      draw();
    }
    function voteBox(box, e) {
      const date = P.today();
      box.innerHTML = `<div class="vote-box"><span class="muted">Com'era «${esc(e.n)}»?</span><div class="thumbs"><button class="thumb up" aria-label="Mi è piaciuto" aria-pressed="false">${I.up}</button><button class="thumb down" aria-label="Non mi è piaciuto" aria-pressed="false">${I.down}</button></div><div class="reasons" hidden>${REASONS.map(([k, n]) => `<button data-r="${k}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
      let vote = null, saved = null;
      const up = box.querySelector(".up"), dn = box.querySelector(".down"), rs = box.querySelector(".reasons");
      const store = () => { S.votes = S.votes.filter(x => x !== saved && !(x.sid === sid && x.id === e.id)); saved = { id: e.id, date, sid, ...vote }; S.votes.push(saved); applyVoteRules(e.id); save(); };
      up.onclick = () => { up.setAttribute("aria-pressed", "true"); dn.setAttribute("aria-pressed", "false"); rs.hidden = true; vote = { ...(vote || {}), v: "up", r: undefined }; store(); };
      dn.onclick = () => { dn.setAttribute("aria-pressed", "true"); up.setAttribute("aria-pressed", "false"); rs.hidden = false; vote = { ...(vote || {}), v: "down" }; store(); };
      rs.onclick = ev => { const b = ev.target.closest("button"); if (!b) return; rs.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); vote = { ...vote, r: b.dataset.r }; store(); };
    }
    function draw() {
      const st = steps[idx]; if (!st) return;
      const left = Math.max(0, Math.ceil(st.dur - t));
      q("ptime").textContent = left;
      q("pring").setAttribute("stroke-dashoffset", (276.5 * (t / st.dur)).toFixed(1));
      const done = elapsedBefore(idx) + t;
      q("pbar").style.width = (100 * done / total).toFixed(1) + "%";
      q("pleft").textContent = `${Math.max(0, Math.ceil((total - done) / 60))} min alla fine`;
    }
    function tick() {
      const now = performance.now(), dt = Math.min(1, (now - last) / 1000); last = now;
      if (paused || idx < 0) return;
      t += dt; active += dt;
      const st = steps[idx];
      for (const c of cues) if (!fired.has(c) && t >= c.t) { fired.add(c); try { c.fn(); } catch (e) { } }
      // Le frasi di apertura (benvenuto, inizio blocco) finiscono sempre prima di passare oltre
      if (t >= st.dur && st.kind === "intro" && VOICE.busy() && t < st.dur + 12) return;
      if (t >= st.dur) { enter(idx + 1); return; }
      draw();
    }
    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(timer); VOICE.stop(); VOICE.music(null); say("g_fine.mp3");
      if (fig && fig.stop) fig.stop();
      try { if (lock) lock.release(); } catch (e) { }
      try { MIRROR.close(); } catch (e) { }
      // Salvata subito, con i minuti davvero fatti: il giudizio si aggiunge dopo
      const minDone = Math.max(1, Math.round(active / 60));
      const kmBefore = tripKm();
      const entry = { date: P.today(), title: meta.title, min: minDone, rating: "", type: meta.planned ? meta.planned.type : "P" };
      S.history.push(entry);
      if (meta.planned) S.done[meta.planned.k] = { date: P.today(), rating: "" };
      save();
      const km = tripKm(), fresh = newCards(), streak = weekStreak(), tot = S.history.length;
      el.className = "player is-party";
      el.innerHTML = `<div class="confetti" aria-hidden="true">${Array.from({ length: 36 }, (_, k) => `<i style="left:${(k * 97) % 100}%;animation-delay:${(k % 9) * 0.25}s;background:${["#C8432B", "#2D6E68", "#E7A6B6", "#F2C14E", "#5B78A8"][k % 5]}"></i>`).join("")}</div>
        <div class="screen party"><div class="party-hero">🎉</div><h1>Brava${S.name ? ", " + esc(S.name) : ""}!</h1>
        <p class="muted">${esc(meta.title)}</p>
        <div class="tiles"><div><b class="num">${minDone}</b><span>minuti oggi</span></div><div><b class="num">${tot}</b><span>${tot === 1 ? "seduta fatta" : "sedute fatte"}</span></div><div><b class="num">${streak}</b><span>${streak === 1 ? "settimana completa" : "settimane complete"} di fila</span></div></div>
        <section class="card"><h3>Com'è andata?</h3><div class="faces" id="rate">${[["Facile", "😌", "Facile"], ["Giusta", "🙂", "Giusta"], ["Dura", "😅", "Dura"]].map(([k, f, n]) => `<button data-v="${k}" aria-pressed="false"><span>${f}</span>${n}</button>`).join("")}</div><p class="muted" id="progmsg">Le sedute si adattano: due volte «facile» di fila e la prossima sarà un po' più lunga.</p></section>
        <section class="card trip-mini"><div class="between"><span class="lbl">Viaggio sul Tōkaidō</span><span class="num">+${km - kmBefore} km · ${km} / ${VIAGGIO.TOT}</span></div>${VIAGGIO.map(km)}
          ${fresh.map(i => `<div class="newcard"><span class="lbl">Nuova cartolina!</span>${VIAGGIO.card(i)}<p><b>${esc(VIAGGIO.STOPS[i].n)}</b> · ${esc(VIAGGIO.STOPS[i].t)}</p></div>`).join("")}</section>
        <button class="btn primary big" id="fsave">Chiudi</button></div>`;
      el.querySelector("#rate").onclick = e => {
        const b = e.target.closest("button"); if (!b) return;
        el.querySelectorAll("#rate button").forEach(x => x.setAttribute("aria-pressed", x === b));
        entry.rating = b.dataset.v; if (meta.planned) S.done[meta.planned.k].rating = entry.rating; save();
      };
      el.querySelector("#fsave").onclick = () => {
        const msg = entry.rating ? updateProg(entry.type) : "";
        save(); close(); toast(msg || "Seduta salvata. Brava!"); go("oggi");
      };
    }
    function close() {
      playerBack = null;
      try { MIRROR.close(); } catch (e) { }
      clearInterval(timer); VOICE.stop(); VOICE.music(null); VOICE.onText(null);
      if (fig && fig.stop) fig.stop();
      document.removeEventListener("visibilitychange", onVis);
      try { if (lock) lock.release(); } catch (e) { }
      el.remove(); document.body.style.overflow = "";
    }
    q("ppause").onclick = () => {
      paused = !paused; last = performance.now();
      q("ppause").innerHTML = paused ? I.play : I.pause; q("ppause").setAttribute("aria-label", paused ? "Riprendi" : "Pausa");
      if (paused) { VOICE.pauseAll(); if (fig) fig.paused = true; } else { VOICE.resumeAll(); if (fig) fig.paused = false; }
    };
    q("pnextb").onclick = () => enter(idx + 1);
    q("pmus").onclick = () => { S.settings.music = S.settings.music === false; save(); VOICE.setMusicOn(S.settings.music); q("pmus").setAttribute("aria-pressed", S.settings.music); toast(S.settings.music ? "Musica accesa" : "Musica spenta"); };
    // «+15 s»: più tempo per prepararsi a questo esercizio. Usato in 2 sedute diverse → la volta dopo il recupero è già più lungo (max +30")
    q("pmore").onclick = () => {
      const st = steps[idx]; if (!st || st.kind !== "rest") return;
      st.dur += 15; total += 15;
      cues = buildCues(st); fired = new Set(cues.filter(c => c.t <= t));
      const id = st.ex.id, u = S.restUse[id] = (S.restUse[id] || []).filter(x => x !== sid).concat(sid);
      if (u.length >= 2 && (S.restBonus[id] || 0) < 30) { S.restBonus[id] = (S.restBonus[id] || 0) + 15; S.restUse[id] = []; toast(`Imparato: da ora ${S.restBonus[id]}" in più prima di «${st.ex.n}»`); }
      save(); draw();
    };
    q("pprev").onclick = () => { if (t > 3) enter(idx); else { let k = idx - 1; while (k > 0 && steps[k].kind !== "work") k--; enter(Math.max(0, k - 1)); } };
    q("pclose").onclick = playerBack = () => {
      if (finished) { el.querySelector("#fsave").click(); return; }
      if (document.querySelector(".exit-ask")) return;
      const was = paused; paused = true; VOICE.pauseAll();
      const box = document.createElement("div"); box.className = "sheet-back exit-ask";
      box.innerHTML = `<div class="sheet"><h2>Vuoi uscire?</h2><p class="muted">La seduta non verrà segnata come fatta.</p><div class="row"><button class="btn danger" id="yes">Esci</button><button class="btn primary" id="no">Continua</button></div></div>`;
      document.body.appendChild(box);
      box.querySelector("#yes").onclick = () => { box.remove(); close(); go("oggi"); };
      box.querySelector("#no").onclick = () => { box.remove(); paused = was; last = performance.now(); if (!paused) VOICE.resumeAll(); };
    };
    enter(0);
    timer = setInterval(tick, 200);
  }

  // Elenco esercizi di una seduta: tocco → scheda dell'esercizio
  document.addEventListener("click", e => { const b = e.target.closest(".pv-ex"); if (b) openEx(b.dataset.ex); });

  // ---------- Avvio ----------
  renderTabs(); render();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
  if (!S.welcomed) welcome(0);
  // Ritorno all'app un altro giorno: la schermata si aggiorna con la data nuova
  let shownDay = P.today();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && P.today() !== shownDay) { shownDay = P.today(); if (!document.querySelector(".player")) render(); } });
  let swReg = null, hadController = false;
  if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.tipo === "versione") { const v = $("#ver"); if (v) v.textContent = `${e.data.v} (${e.data.built})`; } });
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").then(reg => {
      swReg = reg;
      if (reg.installing) watchWorker(reg.installing); // aggiornamento già partito all'apertura: prima andava perso
      reg.addEventListener("updatefound", () => { if (reg.installing) watchWorker(reg.installing); });
      // Controlla gli aggiornamenti ogni volta che l'app torna in primo piano
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => { }); });
    }).catch(() => { });
  }
  function watchWorker(w) {
    if (w.watched) return; w.watched = true;
    w.addEventListener("statechange", () => {
      if (w.state === "redundant") { const m = $("#updmsg"); if (m) m.textContent = "Aggiornamento non riuscito: riprova con internet."; }
      if (w.state !== "activated") return;
      if (hadController) updateBanner();
      else if (!S.offlineReady) { S.offlineReady = true; save(); toast("Pronta: da ora funziona anche senza internet"); }
    });
  }
  function showVersion() {
    const v = $("#ver"); if (!v) return;
    const c = "serviceWorker" in navigator && navigator.serviceWorker.controller;
    if (c) c.postMessage("versione"); else v.textContent = "non ancora installata (apri con internet)";
  }
  function checkUpdate() {
    const m = $("#updmsg"); m.hidden = false;
    if (!swReg) { m.textContent = "Controllo possibile solo dall'app installata, con internet."; return; }
    m.textContent = "Controllo…";
    swReg.update().then(() => {
      const w = swReg.installing || swReg.waiting;
      if (w) { watchWorker(w); m.textContent = "Nuova versione trovata: la sto scaricando (la prima volta può volerci qualche minuto). Poi compare «Nuova versione pronta»."; }
      else m.textContent = "Hai già l'ultima versione.";
    }).catch(() => { m.textContent = "Nessuna connessione: riprova con internet."; });
  }
  function updateBanner() {
    if (document.querySelector(".upd")) return;
    const b = document.createElement("button"); b.className = "upd"; b.textContent = "Nuova versione pronta · tocca per aggiornare";
    b.onclick = () => { if (document.querySelector(".player")) { toast("Finisci la seduta, poi aggiorna"); return; } location.reload(); };
    document.body.appendChild(b);
  }
})();
