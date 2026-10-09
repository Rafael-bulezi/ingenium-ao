const STORAGE_KEY = "metodista-prep-v1";

let mathLessons = [];
let physicsLessons = [];
let testQuestions = [];
const lessonDetails = {};
const loadedChunks = { catalog:false, math:false, physics:false, test:false };
const loadingChunks = {};

const subjects = {
  math: { label:"Matemática", tone:"math", lessons:mathLessons },
  physics: { label:"Física", tone:"physics", lessons:physicsLessons }
};

function loadChunk(name, url) {
  if (loadedChunks[name]) return Promise.resolve();
  if (loadingChunks[name]) return loadingChunks[name];
  loadingChunks[name] = fetch(url, { headers:{ "Accept":"application/json" } })
    .then(response => { if (!response.ok) throw new Error(`Não foi possível carregar ${name}`); return response.json(); })
    .then(data => {
      if (name === "catalog") {
        mathLessons = data.math; physicsLessons = data.physics;
        subjects.math.lessons = mathLessons; subjects.physics.lessons = physicsLessons;
      }
      if (name === "math" || name === "physics") data.forEach(lesson => { lessonDetails[lesson.id] = lesson; });
      if (name === "test") testQuestions = data;
      loadedChunks[name] = true;
    })
    .catch(error => { delete loadingChunks[name]; throw error; });
  return loadingChunks[name];
}
function ensureCatalog() { return loadChunk("catalog", "/content/catalog.json"); }
function ensureLessonDetails(key) { return ensureCatalog().then(() => loadChunk(key, `/content/${key}.json`)); }
function ensureTestData() { return loadChunk("test", "/content/test.json"); }

let state = loadState();
let route = { view:"home", subject:"math", lessonId:null };
let testSession = null;
let toastTimer;

function loadingMarkup(label="A preparar a próxima etapa…") {
  return `<div class="loading-state"><span class="loading-mark"></span><p>${label}</p><span class="loading-line"></span><span class="loading-line short"></span></div>`;
}
async function ensureDataForView() {
  if (route.view === "home" || route.view === "path" || route.view === "profile" || route.view === "lesson") await ensureCatalog();
  if (route.view === "lesson") await ensureLessonDetails(route.lessonId.startsWith("p-") ? "physics" : "math");
  if (route.view === "test") await ensureTestData();
}

function defaultState() { return { completed: [], practice: {}, test: null, voiceOff: false }; }
function loadState() { try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")} } catch { return defaultState(); } }
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function allLessons() { return [...mathLessons, ...physicsLessons]; }
function completedCount() { return state.completed.length; }
function totalCount() { return allLessons().length; }
function pct() { return Math.round((completedCount() / totalCount()) * 100); }
function isDone(id) { return state.completed.includes(id); }
function subjectProgress(key) { const lessons = subjects[key].lessons; return { done: lessons.filter(l => isDone(l.id)).length, total: lessons.length }; }
function getNextLesson() { return allLessons().find(l => !isDone(l.id)) || allLessons()[0]; }
function lessonById(id) { return lessonDetails[id] || allLessons().find(l => l.id === id); }
function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function answersMatch(value, answer) {
  const clean = String(value).trim().toLowerCase().replace(/,/g, ".").replace(/\s+/g, "");
  const expected = String(answer).trim().toLowerCase().replace(/,/g, ".").replace(/\s+/g, "");
  if (clean === expected) return true;
  const numeric = Number(clean.replace(/[^0-9.\-]/g, ""));
  const expectedNumeric = Number(expected.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(numeric) && Number.isFinite(expectedNumeric) && numeric === expectedNumeric;
}
function showToast(message) { const el = document.querySelector("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }
function navigate(hash) { stopSpeaking(); const parts = hash.replace(/^#\/?/, "").split("/"); const view = parts[0] || "home"; if (quadroFull && !(view === "lesson" && parts[1] === route.lessonId)) setQuadroFull(false); route.view = view; if (route.view === "lesson") route.lessonId = parts[1] || getNextLesson().id; if (route.view === "path") route.subject = parts[1] || route.subject; render(); window.scrollTo({top:0, behavior:"smooth"}); showNav(); }
function subjectButton(key, label, active) { return `<button class="tab ${active ? "active" : ""}" data-subject="${key}">${label}</button>`; }
function progressBar(value, label="") { return `<div class="progress-track" aria-label="${label}"><span style="width:${value}%"></span></div>`; }
function progressDots(lessons) { return `<span class="mini-progress">${lessons.slice(0, Math.min(8, lessons.length)).map(l => `<i class="${isDone(l.id) ? "done" : ""}"></i>`).join("")}</span>`; }

function renderHome() {
  const next = getNextLesson();
  const math = subjectProgress("math"); const physics = subjectProgress("physics");
  return `<div class="home-hero">
    <div class="hero-copy"><p class="eyebrow">Rota de acesso · Engenharia</p><h1>Um passo de cada vez.<br><span>Mais confiança.</span></h1><p class="lead">Matemática e Física em pequenas lições, com contas abertas, prática guiada e revisão sem stress.</p><div class="hero-actions"><a class="button button-primary" href="#lesson/${next.id}">Continuar rota <span>→</span></a><a class="button button-ghost" href="#test">Fazer mini-teste</a></div></div>
    <aside class="streak-card"><p class="eyebrow" style="color:#aeb8c6">O teu mapa de hoje</p><div class="streak-number"><strong>${pct()}%</strong><span>da rota concluída</span></div><h3>${completedCount() === 0 ? "Começa pelo primeiro nó." : completedCount() === totalCount() ? "Rota completa." : "A próxima resposta está perto."}</h3><p>${completedCount() === 0 ? "A primeira lição demora menos de 20 minutos e já deixa uma ferramenta contigo." : `${totalCount() - completedCount()} lições ainda esperam por ti. Mantém o ritmo.`}</p>${progressBar(pct(), "Progresso total")}<div class="progress-meta"><span>${completedCount()} concluídas</span><span>${totalCount()} no total</span></div></aside>
  </div>
  <div class="section-head"><h2>Escolhe a matéria</h2><a class="text-link" href="#path">Ver toda a rota →</a></div>
  <div class="subject-grid">
    <a href="#path/math" class="subject-card math"><span class="subject-symbol">x²</span><p class="eyebrow" style="color:var(--blue)">Trilho 01</p><h3>Matemática</h3><p>Da álgebra à probabilidade, com ferramentas para pensar como o exame pede.</p><footer><span>${math.done}/${math.total} lições</span>${progressDots(subjects.math.lessons)}</footer></a>
    <a href="#path/physics" class="subject-card physics"><span class="subject-symbol">F</span><p class="eyebrow" style="color:var(--coral)">Trilho 02</p><h3>Física</h3><p>Movimento, forças, energia e electricidade — sempre com unidades e método.</p><footer><span>${physics.done}/${physics.total} lições</span>${progressDots(subjects.physics.lessons)}</footer></a>
  </div>
  <div class="focus-card"><div class="focus-badge">IE</div><div><h3>Trilho recomendado · Industrial e Sistemas Eléctricos</h3><p>As etiquetas douradas marcam os tópicos que merecem atenção extra: álgebra, trigonometria, vectores, mecânica, electricidade, lei de Ohm, circuitos, potência e unidades.</p></div></div>`;
}

function renderPath() {
  const key = route.subject === "physics" ? "physics" : "math"; const subject = subjects[key]; const prog = subjectProgress(key);
  return `<div class="path-head"><div><p class="eyebrow">A tua rota</p><h1>Constrói a base.</h1></div><div class="path-stats"><span class="stat-pill"><strong>${prog.done}</strong> feitas</span><span class="stat-pill"><strong>${prog.total - prog.done}</strong> por fazer</span></div></div><div class="tabs">${subjectButton("math","Matemática",key === "math")}${subjectButton("physics","Física",key === "physics")}</div><div class="path-wrap">${subject.lessons.map((lesson, index) => {
    const done = isDone(lesson.id); const previousDone = index === 0 || isDone(subject.lessons[index-1].id); const locked = !done && !previousDone;
    return `<article class="lesson-node ${done ? "done" : ""} ${!locked && !done ? "current" : ""} ${locked ? "locked" : ""}"><div class="node-bullet">${done ? "✓" : String(index + 1).padStart(2,"0")}</div><a class="node-card" href="${locked ? "#path/"+key : "#lesson/"+lesson.id}"><div><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.short)}</p><div class="node-meta"><span class="tag">${lesson.minutes} min</span>${lesson.priority ? '<span class="tag priority">prioridade IE</span>' : ""}${done ? '<span class="tag done">concluída</span>' : ""}</div></div><span class="node-cta">${locked ? "•" : "→"}</span></a></article>`;
  }).join("")}</div>`;
}

/* ===== Quadro manuscrito: passo a passo com voz e rabiscos ===== */

const MARK_COLORS = { coral: "#e2604b", blue: "#3e6bdc", lime: "#4c8a3f", ink: "#3a4762" };
let quadroFx = null;
let currentAudio = null;
let preloaded = [];
let quadroFull = false;
let navHideTimer = null;
const EXPAND_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 2H2v4.5M9.5 2H14v4.5M6.5 14H2V9.5M9.5 14H14V9.5"/></svg>';
const COLLAPSE_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5h4.5V2M14 6.5H9.5V2M2 9.5h4.5V14M14 9.5H9.5V14"/></svg>';

function setNavHidden(hidden) { const nav = document.querySelector(".bottom-nav"); if (nav) nav.classList.toggle("nav-hidden", hidden); }
function scheduleNavHide() { clearTimeout(navHideTimer); navHideTimer = setTimeout(() => setNavHidden(true), 4200); }
function showNav() { setNavHidden(false); scheduleNavHide(); }
function setQuadroFull(on) {
  quadroFull = on;
  document.body.classList.toggle("qf-lock", on);
  const card = document.querySelector(".example-card");
  if (card) card.classList.toggle("quadro-full", on);
  document.querySelectorAll("[data-quadro='full']").forEach(btn => {
    btn.innerHTML = on ? COLLAPSE_ICON : EXPAND_ICON;
    btn.title = on ? "Sair do ecrã inteiro" : "Ver em ecrã inteiro";
  });
  requestAnimationFrame(() => requestAnimationFrame(() => { if (route.view === "lesson") afterLessonRender(); }));
}

function stepCount(lesson) { return lesson.walkthrough && lesson.walkthrough.steps ? lesson.walkthrough.steps.length : (lesson.steps ? lesson.steps.length : 0); }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tiltOf(ord) { return ((ord * 37 + 11) % 5 - 2) * 0.16; }
function r0(v) { return Math.round(v * 10) / 10; }

function pickVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = speechSynthesis.getVoices() || [];
  return voices.find(v => v.lang === "pt-PT") || voices.find(v => /^pt/i.test(v.lang)) || null;
}
function stopAudio() { if (!currentAudio) return; currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
function stopSpeaking() { if ("speechSynthesis" in window) speechSynthesis.cancel(); stopAudio(); }
function speakStep(text) {
  if (!text || state.voiceOff || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = "pt-PT";
  utterance.rate = 1.03;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}
function playStepAudio(src, fallbackText) {
  if (state.voiceOff || typeof Audio === "undefined") { speakStep(fallbackText); return; }
  stopSpeaking();
  const audio = new Audio(src);
  currentAudio = audio;
  const fallback = () => { if (currentAudio !== audio) return; currentAudio = null; speakStep(fallbackText); };
  audio.addEventListener("ended", () => { if (currentAudio === audio) currentAudio = null; });
  audio.addEventListener("error", fallback);
  try { const playing = audio.play(); if (playing && playing.catch) playing.catch(fallback); } catch { fallback(); }
}

function quadroModel(lesson, shown) {
  const steps = lesson.walkthrough.steps;
  const lines = [];
  const marks = [];
  steps.forEach((s, i) => {
    if ((i === 0 || i < shown) && s.line) lines.push({ ord: lines.length, step: i, text: s.line });
    if (i < shown && s.marks) s.marks.forEach(m => marks.push({ step: i, mark: m }));
  });
  return { lines, marks };
}

function inlineWrite(text) {
  return String(text).split(/(\{[^{}]*\/[^{}]*\})/g).map(part => {
    const m = part.match(/^\{([^{}]*)\/([^{}]*)\}$/);
    if (m) return `<span class="frac"><span class="fn">${escapeHtml(m[1].trim())}</span><span class="fd">${escapeHtml(m[2].trim())}</span></span>`;
    return escapeHtml(part);
  }).join("");
}

function triExchange(t, cell) {
  const [sTop, , wTop] = t.top;
  const [sLeft, , wLeft] = t.left;
  const [sRight, , wRight] = t.right;
  if (cell === "top") return { line: `${sTop} = ${sLeft} × ${sRight}`, say: `Tapa ${wTop}. Então ${sTop} é ${wLeft} vezes ${wRight}.` };
  if (cell === "left") return { line: `${sLeft} = {${sTop}/${sRight}}`, say: `Tapa ${wLeft}. Para isolar ${sLeft}, divides ${sTop} por ${sRight}.` };
  return { line: `${sRight} = {${sTop}/${sLeft}}`, say: `Tapa ${wRight}. Para isolar ${sRight}, divides ${sTop} por ${sLeft}.` };
}

function triCell(cell, data) {
  const [sym, label] = data;
  const cls = cell === "top" ? "tri-top" : cell === "left" ? "tri-left" : "tri-right";
  return `<button class="tri-cell ${cls}" data-tri="${cell}" aria-pressed="false" aria-label="Cobrir ${escapeHtml(sym)}, ${escapeHtml(label)}"><span class="tri-sym">${escapeHtml(sym)}</span><small>${escapeHtml(label)}</small></button>`;
}

function triCard(lesson) {
  const t = lesson.formulaTri;
  if (!t || !Array.isArray(t.top) || !Array.isArray(t.left) || !Array.isArray(t.right)) return "";
  return `<article class="card tri-card"><p class="eyebrow">Fórmula em triângulo</p><div class="tri-formula">${inlineWrite(`${t.top[0]} = ${t.left[0]} × ${t.right[0]}`)}</div><p class="tri-hint">Tapa a grandeza que queres descobrir — como se tapasses com o dedo.</p><div class="tri-wrap" id="tri"><svg class="tri-ink" aria-hidden="true"></svg>${triCell("top", t.top)}${triCell("left", t.left)}${triCell("right", t.right)}</div><div class="tri-result" aria-live="polite"></div></article>`;
}

function drawTriFrame() {
  const wrap = document.querySelector("#tri");
  if (!wrap) return;
  const svg = wrap.querySelector(".tri-ink");
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const rnd = mulberry32(97);
  const j = a => (rnd() - 0.5) * a;
  const topY = 10, botY = h - 12, sideX = 14;
  const apex = [w / 2 + j(3), topY + j(3)];
  const bl = [sideX + j(3), botY + j(3)];
  const br = [w - sideX + j(3), botY + j(3)];
  const edge = (p, q) => { const mx = (p[0] + q[0]) / 2 + j(3.4), my = (p[1] + q[1]) / 2 + j(3.4); return ` Q${r0(mx)} ${r0(my)} ${r0(q[0])} ${r0(q[1])}`; };
  const outline = `M${r0(apex[0])} ${r0(apex[1])}` + edge(apex, br) + edge(br, bl) + edge(bl, apex) + " Z";
  const frac = 0.40;
  const ybar = topY + (botY - topY) * frac;
  const t = (ybar - topY) / (botY - topY);
  const xL = w / 2 - (w / 2 - sideX) * t, xR = w / 2 + (w / 2 - sideX) * t;
  const bar = smoothOpen([[xL + 7 + j(3), ybar + j(2)], [w / 2, ybar - 2 + j(2)], [xR - 7 + j(3), ybar + j(2)]]);
  svg.innerHTML = "";
  [outline, bar].forEach(d => {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", MARK_COLORS.ink);
    p.setAttribute("stroke-width", "2.4");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    svg.appendChild(p);
  });
  const yCell = (ybar + botY) / 2;
  const t2 = (yCell - topY) / (botY - topY);
  const xLc = w / 2 - (w / 2 - sideX) * t2, xRc = w / 2 + (w / 2 - sideX) * t2;
  const place = {
    top: [w / 2, (topY + ybar) / 2],
    left: [xLc + (w / 2 - xLc) * 0.38, yCell],
    right: [xRc - (xRc - w / 2) * 0.38, yCell]
  };
  wrap.querySelectorAll(".tri-cell").forEach(el => {
    const pos = place[el.dataset.tri];
    if (!pos) return;
    el.style.left = `${r0(pos[0])}px`;
    el.style.top = `${r0(pos[1])}px`;
  });
}

function exampleCard(lesson, shownSteps) {
  if (!lesson.walkthrough || !Array.isArray(lesson.walkthrough.steps) || !lesson.walkthrough.steps.length) return legacyExampleCard(lesson, shownSteps);
  const total = stepCount(lesson);
  const shown = Math.min(shownSteps, total);
  const complete = shown >= total;
  const { lines } = quadroModel(lesson, shown);
  const totalLines = lesson.walkthrough.steps.filter(s => s.line).length;
  const linesHtml = lines.map(l => `<div class="quadro-line ${l.ord === totalLines - 1 ? "final" : ""}" data-line-ord="${l.ord}" data-step-line="${l.step}"><span class="eq" style="transform: rotate(${tiltOf(l.ord)}deg)">${inlineWrite(l.text)}</span></div>`).join("");
  const controls = [
    !complete ? `<button class="button button-lime button-small" data-step="next">Mostrar passo ${shown + 1} <span>→</span></button>` : `<span class="tag done">Solução completa ✓</span>`,
    shown > 0 ? `<button class="button button-ghost button-small" data-step="replay" title="Repete a voz e o desenho deste passo">Repetir passo ${shown}</button>` : "",
    !complete && shown > 0 ? `<button class="button button-ghost button-small" data-step="all">Ver tudo</button>` : "",
    `<button class="button button-ghost button-small" data-voice aria-pressed="${state.voiceOff ? "false" : "true"}">${state.voiceOff ? "Voz: desligada" : "Voz: ligada"}</button>`
  ].join("");
  return `<article class="card example-card${quadroFull ? " quadro-full" : ""}"><div class="example-label"><div><p class="eyebrow">Exemplo guiado</p><h2>${escapeHtml(lesson.example)}</h2></div><span class="example-tools"><span class="tag">quadro · passo a passo</span><button class="icon-button quadro-expand" data-quadro="full" aria-pressed="${quadroFull}" title="${quadroFull ? "Sair do ecrã inteiro" : "Ver em ecrã inteiro"}" aria-label="Ecrã inteiro do quadro">${quadroFull ? COLLAPSE_ICON : EXPAND_ICON}</button></span></div><div class="quadro" id="quadro"><div class="quadro-lines">${linesHtml}</div><svg class="quadro-ink" aria-hidden="true"></svg><div class="quadro-notes" aria-hidden="true"></div></div><div class="solution-controls">${controls}</div></article>`;
}

function legacyExampleCard(lesson, shownSteps) {
  return `<article class="card"><div class="example-label"><div><p class="eyebrow">Exemplo guiado</p><h2>${escapeHtml(lesson.example)}</h2></div><span class="tag">passo a passo</span></div><div class="step-list">${lesson.steps.map((step, i) => `${i > 0 ? `<div class="step-connector" aria-hidden="true"><span>↳</span><small>próximo movimento</small></div>` : ""}<div class="step ${i < shownSteps ? "" : "hidden-step"}"><span class="step-number">${i+1}</span><p>${escapeHtml(step)}</p></div>`).join("")}</div><div class="solution-controls">${shownSteps < lesson.steps.length ? `<button class="button button-lime button-small" data-step="next">Mostrar passo ${shownSteps + 1} <span>→</span></button>` : `<span class="tag done">Solução completa ✓</span>`}${shownSteps > 0 && shownSteps < lesson.steps.length ? `<button class="button button-ghost button-small" data-step="all">Ver tudo</button>` : ""}</div></article>`;
}

function ladderCard(lesson, practice) {
  const ladder = lesson.ladder;
  const total = ladder.length;
  const qi = Math.min(Math.max((practice && practice.qi) || 0, 0), total - 1);
  const item = ladder[qi];
  const results = (practice && Array.isArray(practice.results)) ? practice.results : [];
  const res = results[qi] || {};
  const last = qi === total - 1;
  const done = Boolean(res.correct || res.revealed);
  const dots = ladder.map((_, i) => `<i class="${results[i] && results[i].correct ? "done" : ""}"></i>`).join("");
  return `<article class="card practice-card"><div class="practice-top"><div><p class="eyebrow">Agora tu</p><h2>Prática rápida</h2></div><span class="tag">Pergunta ${qi + 1} de ${total}</span></div><div class="ladder-dots" aria-hidden="true">${dots}</div><p class="question-line">${escapeHtml(item.q)}</p><div class="answer-row"><input id="practice-answer" value="${escapeHtml(res.value || "")}" placeholder="${escapeHtml(item.formatHint || "Escreve a resposta")}" aria-label="A tua resposta" title="${escapeHtml(item.formatHint || "Escreve a resposta")}" /><span class="format-help" title="${escapeHtml(item.formatHint || "Escreve a resposta")}">i</span><button class="button button-primary button-small" data-practice="check">Verificar</button></div><div class="solution-controls">${qi > 0 ? `<button class="button button-ghost button-small" data-practice="prev">← Anterior</button>` : ""}${!done ? `<button class="button button-ghost button-small" data-practice="hint">Dar uma pista</button><button class="button button-ghost button-small" data-practice="reveal">Mostrar resposta</button>` : ""}${done && !last ? `<button class="button button-lime button-small" data-practice="next">Próxima pergunta <span>→</span></button>` : ""}${done && last ? `<span class="tag done">Ladder completa ✓</span>` : ""}</div>${res.correct ? `<div class="practice-feedback good"><strong>Deu bom, demais.</strong> ${escapeHtml(item.explanation)}</div>` : ""}${res.checked && !res.correct && !res.revealed ? `<div class="practice-feedback try">Calma, sem drama. Vê a pista ou revela a resposta e reescreve o passo.</div>` : ""}${res.hintShown && !done ? `<div class="practice-feedback">Pista: ${escapeHtml(item.hint)}</div>` : ""}${res.revealed ? `<div class="practice-feedback good"><strong>Resposta: ${escapeHtml(item.answer)}</strong><br>${escapeHtml(item.explanation)}</div>` : ""}</article>`;
}

function lineBox(quadro, base, l) {
  const line = quadro.querySelector(`.quadro-line[data-line-ord="${l}"]`);
  if (!line) return null;
  const el = line.querySelector(".eq") || line;
  const rect = el.getBoundingClientRect();
  return { x1: rect.left - base.left, y1: rect.top - base.top, x2: rect.right - base.left, y2: rect.bottom - base.top };
}

function queryBox(quadro, base, ref) {
  const line = quadro.querySelector(`.quadro-line[data-line-ord="${ref.l}"]`);
  const eq = line && line.querySelector(".eq");
  if (!eq) return null;
  const walker = document.createTreeWalker(eq, NodeFilter.SHOW_TEXT);
  const chars = [];
  const map = [];
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent;
    for (let i = 0; i < text.length; i++) { if (/\s/.test(text[i])) continue; chars.push(text[i]); map.push([node, i]); }
  }
  const hay = chars.join("");
  const needle = String(ref.q).replace(/\s+/g, "");
  let at = -1;
  let from = 0;
  for (let n = 0; n <= (ref.o || 0); n++) { at = hay.indexOf(needle, from); if (at < 0) return null; from = at + 1; }
  const end = map[at + needle.length - 1];
  if (!end) return null;
  const range = document.createRange();
  range.setStart(map[at][0], map[at][1]);
  range.setEnd(end[0], end[1] + 1);
  const rects = [...range.getClientRects()].filter(r => r.width || r.height);
  if (!rects.length) return null;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  rects.forEach(r => { x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom); });
  const parentEl = map[at][0].parentElement;
  const frac = parentEl && parentEl.classList && parentEl.classList.contains("fn") ? "fn" : parentEl && parentEl.classList && parentEl.classList.contains("fd") ? "fd" : "";
  return { x1: x1 - base.left, y1: y1 - base.top, x2: x2 - base.left, y2: y2 - base.top, frac };
}

function resolveMarkRects(quadro, base, mark) {
  if (mark.k === "sketch") {
    if (mark.q) { const target = queryBox(quadro, base, mark); return target ? { target } : null; }
    const l = lineBox(quadro, base, mark.l);
    return l ? { target: l } : null;
  }
  if (mark.k === "arrow") { const from = queryBox(quadro, base, mark.from); const to = queryBox(quadro, base, mark.to); return from && to ? { from, to } : null; }
  const target = queryBox(quadro, base, mark);
  return target ? { target } : null;
}

function smoothOpen(pts) {
  let d = `M${r0(pts[0][0])} ${r0(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1];
    d += ` Q${r0(p[0])} ${r0(p[1])} ${r0((p[0] + q[0]) / 2)} ${r0((p[1] + q[1]) / 2)}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${r0(last[0])} ${r0(last[1])}`;
}

function smoothClosed(pts) {
  const n = pts.length;
  let d = `M${r0(pts[0][0])} ${r0(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    d += ` Q${r0(p[0])} ${r0(p[1])} ${r0((p[0] + q[0]) / 2)} ${r0((p[1] + q[1]) / 2)}`;
  }
  return d + " Z";
}

function ellipsePoints(cx, cy, rx, ry, turns, from, rnd) {
  const n = 26;
  const pts = [];
  for (let i = 0; i <= n * turns; i++) {
    const a = from + (Math.PI * 2 * i) / n;
    const jr = 1 + (rnd() - 0.5) * 0.05;
    pts.push([cx + Math.cos(a) * rx * jr, cy + Math.sin(a) * ry * jr]);
  }
  return pts;
}

function circlePaths(r, rnd) {
  const cx = (r.x1 + r.x2) / 2, cy = (r.y1 + r.y2) / 2;
  const rx = Math.max(14, (r.x2 - r.x1) / 2 + 7), ry = Math.max(11, (r.y2 - r.y1) / 2 + 6);
  const first = smoothClosed(ellipsePoints(cx, cy, rx, ry, 1, -Math.PI * 0.15, rnd).slice(0, 26));
  const second = smoothOpen(ellipsePoints(cx, cy, rx + 2, ry + 2, 1, Math.PI * 0.55, rnd).slice(0, 19));
  return [first, second];
}

function underlinePath(r, rnd) {
  const pts = [];
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    pts.push([r.x1 - 5 + (r.x2 - r.x1 + 10) * t, r.y2 + 6 + (rnd() - 0.5) * 3 + t * 1.2]);
  }
  return smoothOpen(pts);
}

function strikePath(r, rnd) {
  const ym = (r.y1 + r.y2) / 2;
  return smoothOpen([[r.x1 - 3, ym + 2 + (rnd() - 0.5) * 2], [(r.x1 + r.x2) / 2, ym - 2 + (rnd() - 0.5) * 2], [r.x2 + 3, ym + 2 + (rnd() - 0.5) * 2]]);
}

function arrowPaths(a, b, bow, rnd) {
  const acx = (a.x1 + a.x2) / 2, acy = (a.y1 + a.y2) / 2;
  const bcx = (b.x1 + b.x2) / 2, bcy = (b.y1 + b.y2) / 2;
  const dx = bcx - acx, dy = bcy - acy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const reach = r => Math.abs(ux) * (r.x2 - r.x1) / 2 + Math.abs(uy) * (r.y2 - r.y1) / 2;
  const sx = acx + ux * (reach(a) + 8), sy = acy + uy * (reach(a) + 8);
  const ex = bcx - ux * (reach(b) + 9), ey = bcy - uy * (reach(b) + 9);
  const bend = Math.max(16, dist * 0.26) * (bow === "down" ? 1 : -1);
  let px = -uy, py = ux;
  if ((bow === "up" && py > 0) || (bow === "down" && py < 0)) { px = -px; py = -py; }
  const mx = (sx + ex) / 2 + px * bend, my = (sy + ey) / 2 + py * bend;
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex;
    const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey;
    pts.push([x + (rnd() - 0.5) * 1.7, y + (rnd() - 0.5) * 1.7]);
  }
  const tx = ex - mx, ty = ey - my;
  const tl = Math.hypot(tx, ty) || 1;
  const dxn = tx / tl, dyn = ty / tl;
  const head = angle => {
    const hx = ex - (dxn * Math.cos(angle) - dyn * Math.sin(angle)) * 11;
    const hy = ey - (dyn * Math.cos(angle) + dxn * Math.sin(angle)) * 11;
    return `M${r0(ex)} ${r0(ey)} L${r0(hx)} ${r0(hy)}`;
  };
  return [smoothOpen(pts), head(0.42), head(-0.42)];
}

function sketchPaths(lineRect, quadro, shape, rnd) {
  const w = shape === "triangle" ? 112 : 104;
  const h = shape === "triangle" ? 74 : 60;
  let x0 = Math.min(lineRect.x2 + 26, quadro.clientWidth - w - 14);
  let y0 = lineRect.y1 - 4;
  if (x0 < lineRect.x2 + 6) y0 = lineRect.y2 + 12;
  const j = () => (rnd() - 0.5) * 3;
  const edge = (p, q) => {
    const mx = (p[0] + q[0]) / 2 + j(), my = (p[1] + q[1]) / 2 + j();
    return ` Q${r0(mx)} ${r0(my)} ${r0(q[0])} ${r0(q[1])}`;
  };
  let d;
  if (shape === "triangle") {
    const apex = [x0 + w / 2 + j(), y0 + j()];
    const bl = [x0 + j(), y0 + h + j()];
    const br = [x0 + w + j(), y0 + h + j()];
    d = `M${r0(apex[0])} ${r0(apex[1])}` + edge(apex, br) + edge(br, bl) + edge(bl, apex) + " Z";
  } else {
    const c = [[x0 + j(), y0 + j()], [x0 + w + j(), y0 + j()], [x0 + w + j(), y0 + h + j()], [x0 + j(), y0 + h + j()]];
    d = `M${r0(c[0][0])} ${r0(c[0][1])}` + edge(c[0], c[1]) + edge(c[1], c[2]) + edge(c[2], c[3]) + edge(c[3], c[0]) + " Z";
  }
  return { d, box: { x1: x0, y1: y0, x2: x0 + w, y2: y0 + h } };
}

function boxAround(r, rnd) {
  const p = 9;
  const j = () => (rnd() - 0.5) * 3;
  const c = [[r.x1 - p + j(), r.y1 - p + j()], [r.x2 + p + j(), r.y1 - p + j()], [r.x2 + p + j(), r.y2 + p + j()], [r.x1 - p + j(), r.y2 + p + j()]];
  const edge = (a, b) => { const mx = (a[0] + b[0]) / 2 + j() * 1.4, my = (a[1] + b[1]) / 2 + j() * 1.4; return ` Q${r0(mx)} ${r0(my)} ${r0(b[0])} ${r0(b[1])}`; };
  return [`M${r0(c[0][0])} ${r0(c[0][1])}` + edge(c[0], c[1]) + edge(c[1], c[2]) + edge(c[2], c[3]) + edge(c[3], c[0]) + " Z"];
}

function noteAnchor(rects, mark) {
  if (mark.k === "arrow" && rects.from && rects.to) {
    const bowUp = (mark.bow || "up") === "up";
    const x = (rects.from.x1 + rects.from.x2 + rects.to.x1 + rects.to.x2) / 4;
    const y = bowUp ? Math.min(rects.from.y1, rects.to.y1) - 30 : Math.max(rects.from.y2, rects.to.y2) + 12;
    return { x, y: Math.max(2, y) };
  }
  if (rects.sketch) return { x: (rects.sketch.x1 + rects.sketch.x2) / 2, y: (rects.sketch.y1 + rects.sketch.y2) / 2 - 9 };
  const r = rects.target;
  if (!r) return { x: 40, y: 16 };
  if (r.frac === "fn") return { right: r.x2 + 10, y: (r.y1 + r.y2) / 2 - 9 };
  return { x: (r.x1 + r.x2) / 2, y: r.y2 + 9 };
}

function drawMark(svg, notesLayer, quadro, mark, rects, animate, delay, seed) {
  const rnd = mulberry32((seed >>> 0) * 2654435761 % 4294967296 + 7);
  const color = MARK_COLORS[mark.color] || MARK_COLORS.coral;
  const strokes = [];
  let sketchBox = null;
  if (mark.k === "circle" && rects.target) strokes.push(...circlePaths(rects.target, rnd));
  if (mark.k === "underline" && rects.target) strokes.push(underlinePath(rects.target, rnd));
  if (mark.k === "strike" && rects.target) strokes.push(strikePath(rects.target, rnd));
  if (mark.k === "arrow" && rects.from && rects.to) strokes.push(...arrowPaths(rects.from, rects.to, mark.bow || "up", rnd));
  if (mark.k === "sketch" && rects.target) {
    if (mark.q) strokes.push(...boxAround(rects.target, rnd));
    else { const res = sketchPaths(rects.target, quadro, mark.shape || "rect", rnd); strokes.push(res.d); sketchBox = res.box; }
  }
  strokes.forEach((d, i) => {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", "2.2");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    svg.appendChild(p);
    if (animate) {
      const length = p.getTotalLength();
      p.setAttribute("stroke-dasharray", `${length} ${length}`);
      p.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: Math.min(950, Math.max(320, length * 3.2)), delay: delay + i * 220, easing: "ease-in-out", fill: "backwards" });
    }
  });
  if (mark.note) {
    const note = document.createElement("div");
    note.className = "quadro-note";
    note.textContent = mark.note;
    note.style.color = color;
    note.style.setProperty("--rot", `${(rnd() * 5 - 2.5).toFixed(2)}deg`);
    notesLayer.appendChild(note);
    const anchor = noteAnchor({ ...rects, sketch: sketchBox }, mark);
    const w = note.offsetWidth;
    const nx = anchor.right != null
      ? Math.max(w / 2 + 6, Math.min(anchor.right + w / 2, quadro.clientWidth - w / 2 - 6))
      : Math.min(Math.max(anchor.x, w / 2 + 6), Math.max(w / 2 + 6, quadro.clientWidth - w / 2 - 6));
    note.style.left = `${nx}px`;
    note.style.top = `${anchor.y}px`;
    if (animate) note.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: delay + 480, fill: "backwards" });
  }
}

function decorateQuadro(lesson, shown, animStep) {
  const quadro = document.querySelector("#quadro");
  if (!quadro) return;
  const svg = quadro.querySelector(".quadro-ink");
  const notesLayer = quadro.querySelector(".quadro-notes");
  svg.innerHTML = "";
  notesLayer.innerHTML = "";
  const base = quadro.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${quadro.clientWidth} ${quadro.clientHeight}`);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { marks } = quadroModel(lesson, shown);
  let animated = 0;
  marks.forEach(({ step, mark }, index) => {
    const rects = resolveMarkRects(quadro, base, mark);
    if (!rects) return;
    const animate = !reduce && step === animStep;
    drawMark(svg, notesLayer, quadro, mark, rects, animate, 420 + animated * 430, step * 131 + index * 17);
    if (animate) animated++;
  });
}

function afterLessonRender() {
  const lesson = lessonById(route.lessonId);
  if (!lesson || !lesson.walkthrough) return;
  const total = stepCount(lesson);
  const shown = Math.min(state.activeLesson === lesson.id ? (state.stepsShown || 0) : 0, total);
  const job = quadroFx && quadroFx.lessonId === lesson.id && quadroFx.stepIndex < shown ? quadroFx : null;
  quadroFx = null;
  decorateQuadro(lesson, shown, job ? job.stepIndex : null);
  if (!job) return;
  const step = lesson.walkthrough.steps[job.stepIndex];
  const lineEl = document.querySelector(`.quadro-line[data-step-line="${job.stepIndex}"]`);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lineEl && !reduce) {
    const eq = lineEl.querySelector(".eq");
    const duration = Math.min(1900, Math.max(550, (step.line || "").length * 44));
    eq.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration, easing: "linear", fill: "backwards" });
  }
  if (lineEl) setTimeout(() => lineEl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  setTimeout(() => playStepAudio(`/audio/${lesson.id}-${job.stepIndex}.mp3`, step.say), 300);
  if (typeof Audio !== "undefined" && job.stepIndex + 1 < total) { const pre = new Audio(); pre.preload = "auto"; pre.src = `/audio/${lesson.id}-${job.stepIndex + 1}.mp3`; preloaded.push(pre); if (preloaded.length > 3) preloaded.shift(); }
  if (document.fonts && !document.fonts.check('16px "Kalam"')) document.fonts.ready.then(() => { if (document.querySelector("#quadro") && route.view === "lesson") decorateQuadro(lesson, shown, null); });
}

let quadroResize;
window.addEventListener("resize", () => {
  if (route.view !== "lesson") return;
  cancelAnimationFrame(quadroResize);
  quadroResize = requestAnimationFrame(() => { afterLessonRender(); drawTriFrame(); });
});

function renderLesson() {
  const lesson = lessonById(route.lessonId) || getNextLesson();
  const key = lesson.id.startsWith("m-") ? "math" : "physics";
  const subject = subjects[key];
  const index = subject.lessons.findIndex(l => l.id === lesson.id);
  const next = subject.lessons[index + 1] || allLessons().find(l => !isDone(l.id) && l.id !== lesson.id);
  const practice = state.practice[lesson.id] || {};
  const activeLevel = practice.level === "medium" ? "medium" : "easy";
  const activeMode = practice.mode === "mc" ? "mc" : "typed";
  const activeData = activeLevel === "medium" && lesson.medium ? lesson.medium : lesson;
  const shownSteps = state.activeLesson === lesson.id ? (state.stepsShown || 0) : 0;
  if (!state.activeLesson || state.activeLesson !== lesson.id) { state.activeLesson = lesson.id; state.stepsShown = 0; saveState(); }
  const options = activeData.options || [];
  const optionOrder = options.length ? options.map((_, i) => i).sort((a,b) => ((a + lesson.id.length * 3) % options.length) - ((b + lesson.id.length * 3) % options.length)) : [];
  const currentAnswer = practice.selected || "";
  return `<div class="lesson-head"><button class="back-button" data-back="path/${key}" aria-label="Voltar à rota">←</button><div><p class="eyebrow">${subject.label} · lição ${index + 1} de ${subject.lessons.length}</p><h1>${escapeHtml(lesson.title)}</h1><p class="lead">${escapeHtml(lesson.short)}</p></div></div><div class="lesson-layout"><div class="lesson-main">
    <article class="card concept-card"><p class="eyebrow" style="color:var(--lime)">Ideia-chave</p><h2>${escapeHtml(lesson.concept.split(".")[0])}.</h2><p>${escapeHtml(lesson.concept)}</p><div class="formula">${escapeHtml(lesson.formula)}</div></article>
    ${triCard(lesson)}
    ${exampleCard(lesson, shownSteps)}
    ${lesson.ladder && lesson.ladder.length ? ladderCard(lesson, practice) : `<article class="card practice-card"><div class="practice-top"><div><p class="eyebrow">Agora tu</p><h2>Prática rápida</h2></div><div class="level-switch" aria-label="Escolher dificuldade"><button class="level-button ${activeLevel === "easy" ? "active" : ""}" data-level="easy">Fácil</button><button class="level-button ${activeLevel === "medium" ? "active" : ""}" data-level="medium">Médio</button></div></div><div class="mode-switch" aria-label="Escolher formato de resposta"><button class="mode-button ${activeMode === "typed" ? "active" : ""}" data-mode="typed">Escrever</button><button class="mode-button ${activeMode === "mc" ? "active" : ""}" data-mode="mc">Escolha múltipla</button></div><p class="question-line">${escapeHtml(activeData.practice)}</p>${activeMode === "mc" ? `<div class="practice-options">${optionOrder.map((optionIndex, displayIndex) => `<button class="practice-option ${currentAnswer === options[optionIndex] ? "selected" : ""}" data-choice="${optionIndex}"><span>${String.fromCharCode(65 + displayIndex)}</span>${escapeHtml(options[optionIndex])}</button>`).join("")}</div><button class="button button-primary button-small" data-practice="check">Verificar escolha</button>` : `<div class="answer-row"><input id="practice-answer" value="" placeholder="${escapeHtml(activeData.formatHint || "Escreve a resposta")}" aria-label="A tua resposta" title="${escapeHtml(activeData.formatHint || "Escreve a resposta")}" /><span class="format-help" title="${escapeHtml(activeData.formatHint || "Escreve a resposta")}">i</span><button class="button button-primary button-small" data-practice="check">Verificar</button></div>`}<div class="solution-controls"><button class="button button-ghost button-small" data-practice="hint">Dar uma pista</button><button class="button button-ghost button-small" data-practice="reveal">Mostrar resposta</button></div>${practice?.feedback ? `<div class="practice-feedback ${practice.correct ? "good" : "try"}">${practice.feedback}</div>` : ""}${practice?.hintShown ? `<div class="practice-feedback">Pista: ${escapeHtml(activeData.hint)}</div>` : ""}${practice?.revealed ? `<div class="practice-feedback good"><strong>Resposta: ${escapeHtml(activeData.answer)}</strong><br>${escapeHtml(activeData.explanation)}</div>` : ""}</article>`}
    <article class="card"><label class="check-row"><input type="checkbox" data-complete ${isDone(lesson.id) ? "checked" : ""} /> <span>Marcar esta lição como concluída</span></label>${isDone(lesson.id) && next ? `<div class="hero-actions" style="margin-top:16px"><a class="button button-lime" href="#lesson/${next.id}">Próxima lição →</a><a class="button button-ghost" href="#path/${key}">Voltar à rota</a></div>` : isDone(lesson.id) ? `<div class="hero-actions" style="margin-top:16px"><a class="button button-lime" href="#test">Experimentar o mini-teste →</a></div>` : ""}</article>
  </div><aside class="lesson-side"><div class="card side-card"><p class="eyebrow">Progresso ${subject.label}</p><h3>${subjectProgress(key).done}/${subject.lessons.length} concluídas</h3>${progressBar(Math.round(subjectProgress(key).done / subject.lessons.length * 100), "Progresso da matéria")}<div class="side-progress">${subject.lessons.map(l => `<i class="${isDone(l.id) ? "done" : ""}"></i>`).join("")}</div></div><div class="card side-card"><p class="eyebrow">Nota do coach</p><h3>Mostra o trabalho.</h3><p class="muted">Mesmo quando a resposta parece óbvia, escreve a fórmula. É assim que evitas perder pontos por distração.</p><div class="side-actions"><a class="button button-ghost button-small" href="#test">Mini-teste de 20 min</a></div></div></aside></div>`;
}

function renderTest() {
  if (!testSession) return `<div class="test-header"><div><p class="eyebrow">Avaliação rápida</p><h1>Mini-teste.</h1></div><div class="timer"><small>tempo</small>20:00</div></div><div class="test-card"><div class="test-intro"><p class="eyebrow" style="color:var(--lime)">Matemática + Física</p><h2>Vinte minutos para medir o que já sabes.</h2><p>São 10 perguntas de escolha múltipla. No fim, recebes a pontuação, as respostas certas e uma revisão curta de cada raciocínio.</p><div class="test-rules"><div class="test-rule"><strong>10</strong><span>perguntas</span></div><div class="test-rule"><strong>20′</strong><span>contagem</span></div><div class="test-rule"><strong>1</strong><span>tentativa guiada</span></div></div><button class="button button-lime" data-test="start">Começar agora <span>→</span></button></div></div>`;
  if (testSession.finished) return renderTestResult();
  const q = testQuestions[testSession.index]; const selected = testSession.answers[testSession.index]; const remaining = Math.max(0, testSession.endsAt - Date.now()); const mins = String(Math.floor(remaining/60000)).padStart(2,"0"); const secs = String(Math.floor((remaining%60000)/1000)).padStart(2,"0");
  return `<div class="test-header"><div><p class="eyebrow">Mini-teste · ${q.subject}</p><h1>Escolhe com método.</h1></div><div class="timer"><small>restante</small><span id="test-timer">${mins}:${secs}</span></div></div><div class="test-card"><div class="question-card"><div class="question-progress"><span>${testSession.index + 1} / ${testQuestions.length}</span>${progressBar(Math.round((testSession.index / testQuestions.length)*100), "Progresso do teste")}</div><h2>${escapeHtml(q.prompt)}</h2><div class="option-list">${q.options.map((option, i) => `<button class="option ${selected === i ? "selected" : ""}" data-option="${i}"><span class="option-letter">${String.fromCharCode(65+i)}</span>${escapeHtml(option)}</button>`).join("")}</div><div class="test-actions">${testSession.index > 0 ? `<button class="button button-ghost button-small" data-test="prev">← Anterior</button>` : `<span></span>`}${testSession.index === testQuestions.length - 1 ? `<button class="button button-primary button-small" data-test="finish">Terminar teste</button>` : `<button class="button button-primary button-small" data-test="next">Próxima →</button>`}</div></div></div>`;
}
function renderTestResult() {
  const score = testSession.score; const pctScore = Math.round(score / testQuestions.length * 100); const feedback = pctScore >= 80 ? "Base forte. Agora transforma acerto em consistência." : pctScore >= 50 ? "Bom começo. Revê os erros e repete as lições marcadas." : "Sem drama: os erros mostram exactamente onde estudar a seguir.";
  return `<div class="test-header"><div><p class="eyebrow">Resultado guardado</p><h1>Boa revisão.</h1></div><div class="timer"><small>pontuação</small>${score}/${testQuestions.length}</div></div><div class="test-card"><div class="result-card"><div class="score-ring" style="--score:${pctScore}%"><strong>${pctScore}%</strong></div><h2>${feedback}</h2><p>Compara cada resposta com o raciocínio. A explicação vale tanto quanto o ponto.</p><div class="hero-actions" style="justify-content:center"><button class="button button-lime" data-test="restart">Tentar novamente</button><a class="button button-ghost" style="color:var(--white);border-color:#506076" href="#path">Voltar à rota</a></div></div><div class="review-list">${testQuestions.map((q,i) => { const correct = testSession.answers[i] === q.correct; return `<div class="review-item ${correct ? "correct" : "incorrect"}"><strong>${correct ? "✓" : "×"} ${i+1}. ${escapeHtml(q.prompt)}</strong><p>Resposta certa: <b>${escapeHtml(q.options[q.correct])}</b>. ${escapeHtml(q.explanation)}</p></div>`; }).join("")}</div></div>`;
}

function renderProfile() { const test = state.test; return `<div class="profile-card"><div class="profile-top"><div class="profile-avatar">RB</div><div><p class="eyebrow" style="color:var(--lime)">Área de foco</p><h1>Preparação para Engenharia</h1><p>O teu progresso fica guardado neste navegador.</p></div></div><div class="profile-metrics"><div class="metric"><strong>${completedCount()}</strong><span>lições feitas</span></div><div class="metric"><strong>${pct()}%</strong><span>da rota</span></div><div class="metric"><strong>${test ? `${test.score}/10` : "—"}</strong><span>último teste</span></div></div><div class="card" style="margin-top:16px"><p class="eyebrow">Preferência de estudo</p><h2>Consistência vence pressa.</h2><p class="muted" style="line-height:1.7">Faz uma lição por sessão, escreve as unidades e volta aos erros do mini-teste. O exame fica mais pequeno quando o método fica automático.</p><div class="hero-actions"><a class="button button-primary" href="#lesson/${getNextLesson().id}">Continuar a estudar →</a><button class="button button-ghost" data-profile="reset">Limpar progresso</button></div></div></div>`; }

async function render() {
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("hidden", el.dataset.view !== route.view));
  const target = document.querySelector(`[data-view="${route.view}"]`); if (!target) return;
  const viewAtStart = route.view;
  const needsCatalog = ["home", "path", "profile", "lesson"].includes(route.view) && !loadedChunks.catalog;
  const lessonKey = route.lessonId?.startsWith("p-") ? "physics" : "math";
  const needsLesson = route.view === "lesson" && !loadedChunks[lessonKey];
  const needsTest = route.view === "test" && !loadedChunks.test;
  if (needsCatalog || needsLesson || needsTest) target.innerHTML = loadingMarkup(route.view === "test" ? "A carregar o mini-teste…" : "A preparar a tua rota…");
  try { await ensureDataForView(); } catch (error) { target.innerHTML = `<div class="card load-error"><h2>Não foi possível carregar esta parte.</h2><p class="muted">Verifica a ligação e tenta novamente.</p><button class="button button-primary" data-retry>Recarregar</button></div>`; return; }
  if (route.view !== viewAtStart) return;
  target.innerHTML = route.view === "home" ? renderHome() : route.view === "path" ? renderPath() : route.view === "lesson" ? renderLesson() : route.view === "test" ? renderTest() : renderProfile();
  if (route.view === "lesson") {
    afterLessonRender();
    drawTriFrame();
    if (document.fonts) document.fonts.ready.then(() => { if (route.view === "lesson") drawTriFrame(); });
  }
  document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.dataset.nav === route.view));
  if (route.view === "test" && testSession && !testSession.finished) startTimerLoop();
}


let timerLoop;
function startTimerLoop() { clearInterval(timerLoop); timerLoop = setInterval(() => { if (!testSession || testSession.finished) return clearInterval(timerLoop); if (Date.now() >= testSession.endsAt) { finishTest(); } else { const el = document.querySelector("#test-timer"); if (el) { const r = Math.max(0, testSession.endsAt-Date.now()); el.textContent = `${String(Math.floor(r/60000)).padStart(2,"0")}:${String(Math.floor((r%60000)/1000)).padStart(2,"0")}`; } } }, 500); }
function startTest() { testSession = { index:0, answers:Array(testQuestions.length).fill(null), endsAt:Date.now()+20*60*1000, finished:false, score:0 }; render(); }
function finishTest() { if (!testSession || testSession.finished) return; testSession.score = testSession.answers.reduce((n, answer, i) => n + (answer === testQuestions[i].correct ? 1 : 0), 0); testSession.finished = true; state.test = {score:testSession.score, at:new Date().toISOString()}; saveState(); clearInterval(timerLoop); render(); }
function resetAll() { state = defaultState(); testSession = null; saveState(); showToast("Progresso limpo. A rota está pronta de novo."); navigate("#home"); }

document.addEventListener("click", event => {
  if (event.target.closest(".bottom-nav")) showNav();
  else if (event.target.closest("button, a, input, label, select, textarea")) scheduleNavHide();
  else showNav();
  if (event.target.closest("[data-retry]")) { loadedChunks.catalog = false; render(); return; }
  const subject = event.target.closest("[data-subject]"); if (subject) { route.subject = subject.dataset.subject; render(); return; }
  const back = event.target.closest("[data-back]"); if (back) { navigate("#"+back.dataset.back); return; }
  const step = event.target.closest("[data-step]"); if (step) {
    const lesson = lessonById(route.lessonId);
    const total = stepCount(lesson);
    const action = step.dataset.step;
    if (action === "next") { state.stepsShown = Math.min((state.stepsShown || 0) + 1, total); if (lesson.walkthrough) quadroFx = { lessonId: lesson.id, stepIndex: state.stepsShown - 1 }; }
    else if (action === "replay") { if (lesson.walkthrough) quadroFx = { lessonId: lesson.id, stepIndex: Math.max(0, (state.stepsShown || 1) - 1) }; }
    else { state.stepsShown = total; quadroFx = null; }
    saveState(); render(); return;
  }
  const voice = event.target.closest("[data-voice]"); if (voice) { state.voiceOff = !state.voiceOff; stopSpeaking(); saveState(); render(); return; }
  const qf = event.target.closest("[data-quadro='full']"); if (qf) { setQuadroFull(!quadroFull); return; }
  const tri = event.target.closest("[data-tri]"); if (tri) {
    const lesson = lessonById(route.lessonId);
    const t = lesson?.formulaTri;
    if (!t) return;
    const card = tri.closest(".tri-card");
    const result = card.querySelector(".tri-result");
    const was = tri.classList.contains("covered");
    card.querySelectorAll(".tri-cell").forEach(c => { c.classList.remove("covered"); c.setAttribute("aria-pressed", "false"); });
    if (was) { result.innerHTML = ""; stopSpeaking(); return; }
    tri.classList.add("covered");
    tri.setAttribute("aria-pressed", "true");
    const { line, say } = triExchange(t, tri.dataset.tri);
    result.innerHTML = `<span class="tri-eq">${inlineWrite(line)}</span>`;
    playStepAudio(`/audio/${lesson.id}-tri-${tri.dataset.tri}.mp3`, say);
    return;
  }
  const level = event.target.closest("[data-level]"); if (level) { const lesson = lessonById(route.lessonId); state.practice[lesson.id] = {...(state.practice[lesson.id] || {}), level:level.dataset.level, selected:"", feedback:null, hintShown:false, revealed:false}; saveState(); render(); return; }
  const mode = event.target.closest("[data-mode]"); if (mode) { const lesson = lessonById(route.lessonId); state.practice[lesson.id] = {...(state.practice[lesson.id] || {}), mode:mode.dataset.mode, selected:"", feedback:null, hintShown:false, revealed:false}; saveState(); render(); return; }
  const choice = event.target.closest("[data-choice]"); if (choice) { const lesson = lessonById(route.lessonId); const saved = state.practice[lesson.id] || {}; const levelData = saved.level === "medium" && lesson.medium ? lesson.medium : lesson; state.practice[lesson.id] = {...saved, mode:"mc", selected:levelData.options[Number(choice.dataset.choice)], feedback:null}; saveState(); render(); return; }
  const practice = event.target.closest("[data-practice]");
  if (practice) {
    const lesson = lessonById(route.lessonId);
    const saved = state.practice[lesson.id] || {};
    if (lesson.ladder && lesson.ladder.length) {
      const total = lesson.ladder.length;
      const qi = Math.min(Math.max(saved.qi || 0, 0), total - 1);
      const item = lesson.ladder[qi];
      const results = Array.isArray(saved.results) ? saved.results.slice() : [];
      const res = results[qi] || {};
      const action = practice.dataset.practice;
      if (action === "check") {
        const value = document.querySelector("#practice-answer")?.value || "";
        if (!value.trim()) { showToast("Escreve a tua resposta primeiro."); return; }
        results[qi] = { ...res, value, checked: true, correct: answersMatch(value, item.answer) };
      } else if (action === "hint") results[qi] = { ...res, hintShown: true };
      else if (action === "reveal") results[qi] = { ...res, revealed: true };
      state.practice[lesson.id] = { ...saved, results, qi: action === "next" ? Math.min(qi + 1, total - 1) : action === "prev" ? Math.max(qi - 1, 0) : qi };
      saveState(); render(); return;
    }
    const levelData = saved.level === "medium" && lesson.medium ? lesson.medium : lesson;
    state.practice[lesson.id] = {...saved};
    if (practice.dataset.practice === "hint") state.practice[lesson.id].hintShown = true;
    if (practice.dataset.practice === "reveal") state.practice[lesson.id].revealed = true;
    if (practice.dataset.practice === "check") { const value = saved.mode === "mc" ? (saved.selected || "") : (document.querySelector("#practice-answer")?.value || ""); const correct = answersMatch(value, levelData.answer); state.practice[lesson.id].correct = correct; state.practice[lesson.id].feedback = correct ? "Deu bom, demais. Resposta certa — agora relê o quadro para fixar o método." : "Calma, sem drama. Vê a pista ou revela a resposta e reescreve os passos."; }
    saveState(); render(); return;
  }
  const complete = event.target.closest("[data-complete]"); if (complete) { const id = route.lessonId; if (complete.checked && !isDone(id)) state.completed.push(id); if (!complete.checked) state.completed = state.completed.filter(x => x !== id); saveState(); showToast(complete.checked ? "Lição concluída. Mais um nó na rota." : "Lição reaberta para revisão."); render(); return; }
  const test = event.target.closest("[data-test]"); if (test) { const action=test.dataset.test; if (action === "start") startTest(); if (action === "next") { testSession.index = Math.min(testSession.index + 1, testQuestions.length-1); render(); } if (action === "prev") { testSession.index = Math.max(testSession.index - 1, 0); render(); } if (action === "finish") finishTest(); if (action === "restart") startTest(); return; }
  const option = event.target.closest("[data-option]"); if (option && testSession) { testSession.answers[testSession.index] = Number(option.dataset.option); render(); return; }
  const profile = event.target.closest("[data-profile]"); if (profile?.dataset.profile === "reset") resetAll();
  if (event.target.closest("#reset-progress")) resetAll();
});
window.addEventListener("hashchange", () => navigate(location.hash));
document.addEventListener("keydown", event => { if (event.key === "Escape" && quadroFull) setQuadroFull(false); });
navigate(location.hash || "#home");
