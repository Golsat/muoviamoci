// Muoviamoci! – interfaccia: Oggi, Calendario, Esercizi, Il mio piano, Progressi, lettore della seduta.
(() => {
  const P = PROGRAM;
  const KEY = "muoviamoci-v1";
  const DEF = {
    settings: { yoga: 3, focus: [], intensity: "normale", minutes: 45, guide: "completa", volume: 1, reminder: "17:30" },
    excluded: [], knee: [], tweak: {}, done: {}, moves: {}, votes: [], plans: [], history: [], checksSeen: []
  };
  let S;
  try { S = { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; S.settings = { ...DEF.settings, ...S.settings }; } catch (e) { S = structuredClone(DEF); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const app = $("#app");
  const mins = sec => Math.round(sec / 60);
  const ZN = { risc: "Riscaldamento", glu: "Glutei", cos: "Cosce", add: "Addome", bra: "Braccia e schiena", yoga: "Yoga" };
  const FOCUS = [["glu", "Glutei"], ["add", "Addome"], ["bra", "Braccia"], ["cos", "Cosce"]];
  const REASONS = [["difficile", "Troppo difficile"], ["facile", "Troppo facile"], ["ginocchio", "Fastidio al ginocchio"], ["nonpiace", "Non mi piace / poco chiaro"]];

  const I = {
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
    container.querySelectorAll("canvas, svg.fig").forEach(n => n.remove());
    const e = BY[id] || {};
    let f = has3D ? FIG3D.mount(container, id, { label: e.n, ...opts }) : null;
    if (!f) f = FIG.mount(container, id, { label: e.n, dumbbells: !!e.m, forceMotion: true, ...opts });
    return f;
  }

  // ---------- Calendario e seduta del giorno ----------
  function sessions() {
    return P.plan().map(s => ({ ...s, date: S.moves[s.i] || s.date, done: !!S.done[s.i] })).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.i - b.i);
  }
  function nextSession() {
    const all = sessions();
    return all.find(s => !s.done) || null;
  }
  function stFor() { return { ...S.settings, excluded: S.excluded, knee: S.knee, tweak: S.tweak }; }
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
  function renderOggi() {
    const s = nextSession(), t = P.today(), st = S.settings;
    const d = new Date(), hello = d.getHours() < 13 ? "Buongiorno" : d.getHours() < 18 ? "Buon pomeriggio" : "Buonasera";
    let hero = "";
    if (s) {
      const sess = P.build(s, stFor()), steps = P.steps(sess), when = s.date === t ? "Oggi" : s.date < t ? "Da recuperare" : "Prossima seduta";
      const late = s.date < P.addDays(t, -7);
      hero = `<section class="card hero" aria-label="Seduta">
        <div class="between"><span class="lbl">${when} · ${esc(P.fmt(s.date, true))}</span><span class="pill ${s.type.toLowerCase()}">${s.type}</span></div>
        <h2>${esc(P.TITLE[s.type])}</h2>
        <div class="session-meta"><span>${esc(P.blockName(s.block))}</span><span>${esc(weekLabel(s))}</span>${s.note ? `<span>${esc(s.note)}</span>` : ""}</div>
        <div class="between"><div><div class="est num">${mins(P.totalSec(steps))}<small style="font-size:1rem"> min</small></div><span class="muted">${new Set(steps.filter(x => x.kind === "work").map(x => x.ex.id)).size} esercizi · ${sess.work}" lavoro / ${sess.rest}" recupero</span></div></div>
        <button class="btn primary big" id="start">${I.play} Inizia</button>
        ${late ? `<button class="btn ghost" id="reschedule" style="color:inherit;border-color:currentColor">Riprogramma da oggi</button>` : ""}
      </section>`;
    } else hero = `<section class="card hero"><h2>Programma completato</h2><p>Bravissima! Chiedi a Claude il programma dei prossimi mesi.</p></section>`;

    const chk = P.CHECKS.find(c => c.date <= t && !S.checksSeen.includes(c.date));
    const prevList = s ? previewList(P.build(s, stFor())) : "";
    app.innerHTML = `<main class="screen">
      <div class="top"><div><div class="brand">Muoviamoci!</div><span class="muted">${hello}! ${esc(P.fmt(t, true))}</span></div>
        <button class="icon" id="settings" aria-label="Impostazioni">${I.gear}</button></div>
      ${chk ? `<section class="card" style="border-color:var(--accent)"><span class="lbl">${esc(chk.n)} con Claude</span><p>${esc(chk.t)} Apri <b>Progressi</b> e premi «Copia il riepilogo per Claude».</p><div class="row"><button class="btn small primary" data-gotab="progressi">Vai a Progressi</button><button class="btn small ghost" data-seen="${chk.date}">Fatto</button></div></section>` : ""}
      ${hero}
      ${s ? `<details class="card fold" open><summary>Gli esercizi di questa seduta</summary><p class="muted" style="margin:4px 0 0">Tocca un esercizio per vedere il manichino e ascoltare la spiegazione.</p>${prevList}</details>` : ""}
      <section class="card" aria-label="Regolazioni">
        <h3>Regola la seduta</h3>
        <div><div class="between"><span class="lbl">Yoga</span><span class="lbl">Tonificazione</span></div>
          <input type="range" id="yoga" min="0" max="4" step="1" value="${st.yoga}" aria-label="Equilibrio tra yoga e tonificazione">
          <div class="range-labels"><span>Più yoga</span><span>Metà e metà</span><span>Più forza</span></div></div>
        <div><span class="lbl">Insisti su</span><div class="chips" id="focus" style="margin-top:6px">${FOCUS.map(([k, n]) => `<button class="chip" data-f="${k}" aria-pressed="${st.focus.includes(k)}">${n}</button>`).join("")}</div></div>
        <div><span class="lbl">Intensità</span><div class="seg" id="intensity" style="margin-top:6px">${["leggera", "normale", "sfidante"].map(k => `<button data-v="${k}" aria-pressed="${st.intensity === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join("")}</div></div>
        <div><span class="lbl">Durata massima</span><div class="seg" id="minutes" style="margin-top:6px">${[20, 30, 45].map(k => `<button data-v="${k}" aria-pressed="${st.minutes === k}">${k} min</button>`).join("")}</div></div>
      </section>
    </main>`;
    if (s) {
      $("#start").onclick = () => startSession(s);
      const rs = $("#reschedule"); if (rs) rs.onclick = () => reschedule(s);
    }
    $("#settings").onclick = openSettings;
    $("#yoga").oninput = e => { st.yoga = +e.target.value; save(); };
    $("#yoga").onchange = () => renderOggi();
    $("#focus").onclick = e => { const b = e.target.closest("button"); if (!b) return; const k = b.dataset.f; st.focus = st.focus.includes(k) ? st.focus.filter(x => x !== k) : [...st.focus, k]; save(); renderOggi(); };
    $("#intensity").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.intensity = b.dataset.v; save(); renderOggi(); };
    $("#minutes").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.minutes = +b.dataset.v; save(); renderOggi(); };
    app.querySelectorAll("[data-gotab]").forEach(b => b.onclick = () => go(b.dataset.gotab));
    app.querySelectorAll("[data-seen]").forEach(b => b.onclick = () => { S.checksSeen.push(b.dataset.seen); save(); renderOggi(); });
  }
  function previewList(sess) {
    return `<div class="preview-list">${sess.blocks.map(b => `<div class="blk">${esc(b.n || { risc: "Riscaldamento", allung: "Allungamento", yoga: "Yoga flow", finale: "Finale" }[b.k] || "")}${b.giri > 1 ? ` · ${b.giri} giri` : ""}</div>` +
      b.items.map(x => { const [id, sx] = x.split(" "); return `<button type="button" class="pv-ex" data-ex="${id}"><span>${esc(BY[id].n)}${sx ? ' <span class="muted">destra e sinistra</span>' : ""}</span><span class="muted" aria-hidden="true">›</span></button>`; }).join("")).join("")}</div>`;
  }
  function reschedule(s) {
    const all = sessions().filter(x => !x.done), weeks = Math.ceil((P.parse(P.today()) - P.parse(s.date)) / 864e5 / 7);
    all.forEach(x => { S.moves[x.i] = P.addDays(x.date, weeks * 7); });
    save(); toast(`Programma spostato avanti di ${weeks} settimane`); renderOggi();
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
        <p class="muted">Scarica le sedute nel calendario del telefono, con un avviso all'ora che scegli.</p>
        <div class="row"><label for="remt" class="lbl">Ora</label><input type="time" id="remt" value="${esc(S.settings.reminder)}" style="font:inherit;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
        <button class="btn primary small" id="ics">Aggiungi al calendario</button></div></section>
      ${n && n.date < P.addDays(t, -7) ? `<button class="btn" id="resched">Riprogramma da oggi le sedute rimaste</button>` : ""}
    </main>`;
    app.querySelectorAll("button.day").forEach(b => b.onclick = () => openDay(b.dataset.date, byDate[b.dataset.date]));
    $("#remt").onchange = e => { S.settings.reminder = e.target.value; save(); };
    $("#ics").onclick = downloadIcs;
    const rs = $("#resched"); if (rs) rs.onclick = () => { reschedule(n); go("calendario"); };
  }
  function openDay(date, ss) {
    const body = ss.map(s => {
      const sess = P.build(s, stFor()), steps = P.steps(sess);
      return `<section class="card"><div class="between"><span class="pill ${s.type.toLowerCase()}">Seduta ${s.type}</span>${s.done ? '<span class="pill ok">Fatta</span>' : ""}</div>
        <h3>${esc(P.TITLE[s.type])}</h3><p class="muted">${esc(P.blockName(s.block))} · ${esc(weekLabel(s))} · circa ${mins(P.totalSec(steps))} min</p>${s.note ? `<p>${esc(s.note)}</p>` : ""}
        <details class="fold"><summary>Esercizi</summary>${previewList(sess)}</details>
        <div class="row"><button class="btn primary small" data-start="${s.i}">${I.play} Inizia ora</button>
        <label class="lbl" for="mv${s.i}">Sposta al</label><input type="date" id="mv${s.i}" data-move="${s.i}" value="${s.date}" style="font:inherit;padding:6px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)"></div></section>`;
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
      return ["BEGIN:VEVENT", `UID:muoviamoci-${s.i}-${d}@app`, `DTSTAMP:${d}T000000`, `DTSTART:${d}T${pad(hh)}${pad(mm)}00`, `DTEND:${d}T${pad(end.getHours())}${pad(end.getMinutes())}00`,
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
        <div><div class="est num">${S.votes.length}</div><span class="muted">pollici dati</span></div></div></section>
      ${proposals.length ? `<section class="card" style="border-color:var(--warn)"><h3>Da sostituire?</h3>${proposals.map(([id]) => `<div class="between"><span>«${esc(BY[id].n)}» non ti piace (3 volte)</span><button class="btn small" data-repl="${id}">Sostituisci</button></div>`).join("")}</section>` : ""}
      <section class="card"><h3>Controlli con Claude</h3>
        ${P.CHECKS.map(c => `<div class="between"><span><b>${esc(P.fmt(c.date))}</b> · ${esc(c.t)}</span></div>`).join("")}
        <button class="btn primary" id="copy">Copia il riepilogo per Claude</button>
        <textarea id="out" hidden readonly style="width:100%;min-height:160px;font:inherit;font-size:.85rem;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:8px"></textarea></section>
      <section class="card"><h3>Pollici per esercizio</h3>
        ${Object.keys(vs).length ? `<div class="list">${Object.entries(vs).sort((a, b) => b[1].down - a[1].down).map(([id, x]) => `<div class="item"><span class="sw" style="background:var(--z-${BY[id].z})"></span><div class="grow"><b>${esc(BY[id].n)}</b><span class="muted">${Object.entries(x.r).map(([k, n]) => `${REASONS.find(r => r[0] === k)[1]} ×${n}`).join(" · ")}</span></div><span class="pill ok">${x.up} su</span><span class="pill" style="background:var(--no-bg);color:var(--no)">${x.down} giù</span></div>`).join("")}</div>` : '<p class="muted">Dopo ogni esercizio, durante il recupero, tocca il pollice verde o rosso. Qui vedrai il riepilogo.</p>'}
        ${S.knee.length || S.excluded.length || Object.keys(S.tweak).length ? `<p class="muted">Modifiche automatiche: ${[...S.knee.map(id => BY[id].n + " (ginocchio)"), ...S.excluded.map(id => BY[id].n + " (escluso)"), ...Object.entries(S.tweak).map(([id, v]) => `${BY[id].n} (${v > 0 ? "+" : ""}${v}")`)].map(esc).join(", ")}</p><button class="btn small ghost" id="resetauto">Annulla le modifiche automatiche</button>` : ""}
      </section>
      <section class="card"><h3>Sedute fatte</h3>${S.history.length ? `<div class="list">${S.history.slice().reverse().map(h => `<div class="between"><span>${esc(P.fmt(h.date))} · ${esc(h.title)}</span><span class="muted num">${h.min} min · ${esc(h.rating || "")}</span></div>`).join("")}</div>` : '<p class="muted">Ancora nessuna.</p>'}</section>
      <section class="card"><h3>Copia di sicurezza</h3><p class="muted">Salva i tuoi dati in un file, per non perderli se cambi telefono.</p>
        <div class="row"><button class="btn small" id="exp">Salva copia</button><label class="btn small ghost" for="imp">Ripristina</label><input type="file" id="imp" accept="application/json" hidden></div></section>
    </main>`;
    $("#copy").onclick = () => {
      const txt = summaryText(), out = $("#out"); out.value = txt;
      const fb = () => { out.hidden = false; out.focus(); out.select(); toast("Seleziona il testo e copialo"); };
      try { navigator.clipboard.writeText(txt).then(() => toast("Riepilogo copiato: incollalo nella chat con Claude"), fb); } catch (e) { fb(); }
    };
    app.querySelectorAll("[data-repl]").forEach(b => b.onclick = () => { S.excluded.push(b.dataset.repl); save(); toast("Sostituito con un esercizio equivalente"); renderProg(); });
    const ra = $("#resetauto"); if (ra) ra.onclick = () => { S.knee = []; S.excluded = []; S.tweak = {}; save(); renderProg(); };
    $("#exp").onclick = () => saveFile(`muoviamoci-copia-${P.today()}.json`, JSON.stringify(S, null, 1), "application/json");
    $("#imp").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { const d = JSON.parse(t); if (!d.settings) throw new Error(); S = { ...DEF, ...d }; save(); toast("Dati ripristinati"); go("oggi"); }).catch(() => toast("Il file non è una copia di Muoviamoci!"));
    };
  }
  function summaryText() {
    const vs = voteStats(), L = ["RIEPILOGO MUOVIAMOCI! – " + P.fmt(P.today(), true), ""];
    L.push(`Sedute fatte: ${S.history.length}`);
    S.history.forEach(h => L.push(`- ${h.date} ${h.title}: ${h.min} min, giudizio: ${h.rating || "-"}`));
    L.push("", "Regolazioni: " + JSON.stringify(S.settings));
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

  // ---------- Impostazioni ----------
  function openSettings() {
    const st = S.settings;
    const sh = sheet(`<h2>Impostazioni</h2>
      <div><span class="lbl">Guida della voce</span><div class="seg" id="guide" style="margin-top:6px">${[["completa", "Completa"], ["essenziale", "Essenziale"], ["tempo", "Solo tempo"]].map(([k, n]) => `<button data-v="${k}" aria-pressed="${st.guide === k}">${n}</button>`).join("")}</div>
        <p class="muted" style="margin-top:6px">Completa: posizione, respiro e consigli. Essenziale: respiro e conto alla rovescia. Solo tempo: solo il conto, con un bip.</p></div>
      <div><label class="lbl" for="vol">Volume della voce</label><input type="range" id="vol" min="0.2" max="1" step="0.1" value="${st.volume}"></div>
      <button class="btn" id="tryv">${I.sound} Prova la voce</button>
      <p class="muted">Puoi ascoltare la tua musica da un'altra app: la voce di Isabella si sente sopra.</p>
      <p class="muted">Figure: ${has3D ? "manichino 3D" : "disegno 2D (questo telefono non supporta il 3D)"}.</p>`);
    $("#guide", sh).onclick = e => { const b = e.target.closest("button"); if (!b) return; st.guide = b.dataset.v; save(); sh.querySelectorAll("#guide button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
    $("#vol", sh).oninput = e => { st.volume = +e.target.value; VOICE.setVolume(st.volume); save(); };
    $("#tryv", sh).onclick = () => { VOICE.unlock(); VOICE.setVolume(st.volume); VOICE.say("g_prova.mp3"); };
  }

  // ---------- Fogli a comparsa ----------
  let sheetBack = null;
  function sheet(html) {
    closeSheet();
    sheetBack = document.createElement("div"); sheetBack.className = "sheet-back";
    sheetBack.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}<button class="btn ghost" data-close>Chiudi</button></div>`;
    document.body.appendChild(sheetBack);
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
  function startPlan(p) { runPlayer(P.fromPlan(p), { title: p.name }); }

  function runPlayer(sess, meta) {
    VOICE.unlock(); VOICE.setVolume(S.settings.volume);
    const steps = P.steps(sess), total = P.totalSec(steps), guide = S.settings.guide;
    const el = document.createElement("div"); el.className = "player is-intro"; el.setAttribute("role", "region"); el.setAttribute("aria-label", "Seduta in corso");
    el.innerHTML = `<div class="p-top"><button class="icon" id="pclose" aria-label="Esci dalla seduta">${I.x}</button>
        <div class="grow"><div class="between"><b id="pblock"></b><span class="muted num" id="pleft"></span></div><div class="p-prog"><i id="pbar"></i></div></div></div>
      <div class="p-stage" id="pstage"><span class="p-phase" id="pphase"></span><span class="p-side" id="pside" hidden></span></div>
      <div class="p-info"><div class="grow"><div class="lbl" id="pnextlbl"></div><div class="p-name" id="pname"></div><div class="muted" id="pnext"></div></div>
        <div class="ring"><svg viewBox="0 0 100 100"><circle class="bgc" cx="50" cy="50" r="44"/><circle class="fgc" id="pring" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><span id="ptime">0</span></div></div>
      <div id="pvote"></div>
      <p class="caption" id="pcap" aria-live="polite"></p>
      <div class="p-ctrl"><button class="btn" id="pprev" aria-label="Indietro">${I.prev}</button><button class="btn primary" id="ppause" aria-label="Pausa">${I.pause}</button><button class="btn" id="pnextb" aria-label="Avanti">${I.next}</button></div>`;
    document.body.appendChild(el);
    document.body.style.overflow = "hidden";
    const q = id => el.querySelector("#" + id);
    VOICE.onText(t => { q("pcap").textContent = t; });

    let idx = -1, t = 0, last = performance.now(), paused = false, fig = null, figId = null, cues = [], fired = new Set(), timer = null, lock = null, lastWork = null;
    const seen = new Set();
    const elapsedBefore = i => steps.slice(0, i).reduce((a, x) => a + x.dur, 0);
    const wake = async () => { try { if ("wakeLock" in navigator) lock = await navigator.wakeLock.request("screen"); } catch (e) { } };
    wake();
    const onVis = () => { if (document.visibilityState === "visible" && !lock) wake(); };
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
          if (st.block.k === "forza" || st.block.k === "finale") c.push({ t: 0.1, fn: () => say(st.dur > 10 ? "g_recupero.mp3" : "g_recupero_calmo.mp3", { prio: "l" }) });
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
      el.className = "player is-" + st.kind;
      q("pblock").textContent = st.label || st.block.n || { risc: "Riscaldamento", allung: "Allungamento", yoga: "Yoga flow", finale: "Finale", forza: "Circuito" }[st.block.k];
      const nw = st.kind === "work" ? st : nextWork(i);
      if (nw) showFig(nw.ex.id);
      q("pphase").textContent = st.kind === "work" ? "LAVORO" : st.kind === "rest" ? "RECUPERO" : "SI PARTE";
      q("pside").hidden = !(nw && nw.side); q("pside").textContent = nw && nw.side === "dx" ? "Lato destro" : "Lato sinistro";
      q("pnextlbl").textContent = st.kind === "work" ? (st.giro > 1 ? `Giro ${st.giro}` : "Ora") : "Prossimo";
      q("pname").textContent = nw ? nw.ex.n : "";
      const after = st.kind === "work" ? nextWork(i + 1) : null;
      q("pnext").textContent = after ? "Poi: " + after.ex.n : st.kind === "rest" && nw ? (st.first ? `${nw.dur}" di lavoro` : "Cambia lato") : "";
      q("pcap").textContent = "";
      // Pollice per l'esercizio appena finito
      const v = q("pvote");
      if (st.kind === "rest" && st.first && lastWork && st.dur >= 8) voteBox(v, lastWork.ex); else v.innerHTML = "";
      if (st.kind === "work") lastWork = null;
      draw();
    }
    function voteBox(box, e) {
      const date = P.today();
      box.innerHTML = `<div class="vote-box"><span class="muted">Com'era «${esc(e.n)}»?</span><div class="thumbs"><button class="thumb up" aria-label="Mi è piaciuto" aria-pressed="false">${I.up}</button><button class="thumb down" aria-label="Non mi è piaciuto" aria-pressed="false">${I.down}</button></div><div class="reasons" hidden>${REASONS.map(([k, n]) => `<button data-r="${k}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
      let vote = null;
      const up = box.querySelector(".up"), dn = box.querySelector(".down"), rs = box.querySelector(".reasons");
      const store = () => { S.votes = S.votes.filter(x => x !== vote); vote = { id: e.id, date, ...vote }; S.votes.push(vote); applyVoteRules(e.id); save(); };
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
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      if (paused || idx < 0) return;
      t += dt;
      const st = steps[idx];
      for (const c of cues) if (!fired.has(c) && t >= c.t) { fired.add(c); try { c.fn(); } catch (e) { } }
      if (t >= st.dur) { enter(idx + 1); return; }
      draw();
    }
    function finish() {
      clearInterval(timer); VOICE.stop(); say("g_fine.mp3");
      if (fig && fig.stop) fig.stop();
      const minDone = Math.round((elapsedBefore(Math.min(idx, steps.length)) + 0) / 60) || Math.round(total / 60);
      el.className = "player is-rest";
      el.innerHTML = `<div class="screen" style="padding-top:calc(30px + env(safe-area-inset-top,0px))"><h1>Seduta completata!</h1>
        <p class="muted">${esc(meta.title)} · ${minDone} minuti</p>
        <section class="card"><h3>Com'era la seduta?</h3><div class="seg" id="rate">${["Facile", "Giusta", "Dura"].map(k => `<button data-v="${k}" aria-pressed="false">${k}</button>`).join("")}</div></section>
        <button class="btn primary big" id="fsave">Salva e chiudi</button></div>`;
      let rating = "";
      el.querySelector("#rate").onclick = e => { const b = e.target.closest("button"); if (!b) return; rating = b.dataset.v; el.querySelectorAll("#rate button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
      el.querySelector("#fsave").onclick = () => {
        S.history.push({ date: P.today(), title: meta.title, min: minDone, rating, type: meta.planned ? meta.planned.type : "P" });
        if (meta.planned) S.done[meta.planned.i] = { date: P.today(), rating };
        save(); close(); toast("Seduta salvata. Brava!"); go("oggi");
      };
    }
    function close() {
      clearInterval(timer); VOICE.stop(); VOICE.onText(null);
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
    q("pprev").onclick = () => { if (t > 3) enter(idx); else { let k = idx - 1; while (k > 0 && steps[k].kind !== "work") k--; enter(Math.max(0, k - 1)); } };
    q("pclose").onclick = () => {
      const was = paused; paused = true; VOICE.pauseAll();
      const box = document.createElement("div"); box.className = "sheet-back";
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
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => { });
})();
