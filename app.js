const STORAGE_KEY = "ingenium-prep-v1";
const LEGACY_STORAGE_KEY = "metodista-prep-v1"; // One-time migration for existing learners.

let mathLessons = [];
let physicsLessons = [];
let testQuestions = [];
const lessonDetails = {};
let triExplain = {};
let atalhosData = { items: [] };
let atalhoFiltro = "all";
const loadedChunks = { catalog:false, math:false, physics:false, test:false, triangles:false, atalhos:false };
const loadingChunks = {};

const subjects = {
  math: { label:"Matemática", tone:"math", lessons:mathLessons },
  physics: { label:"Física", tone:"physics", lessons:physicsLessons }
};

/* Interface is bilingual; lesson content is bilingual too (content/en/*.json mirrors content/*.json).
   PT strings are the source of truth, so a missing key degrades to Portuguese instead of breaking. */
const EN = {
  "Início":"Home","Rota":"Path","Triângulos":"Triangles","Mini-teste":"Quiz","Perfil":"Profile",
  "Por Rafael Bulezi":"By Rafael Bulezi","Começa aqui.":"Start here.","Bom ritmo.":"Good pace.","Rota completa.":"Path complete.",
  "lições feitas":"lessons done","Continuar":"Continue","Rever":"Review","10 fórmulas":"10 formulas","20 min":"20 min","Toda a rota":"Full path",
  "lições":"lessons","Matemática":"Mathematics","Física":"Physics","concluídas":"completed",
  "A tua rota":"Your path","Constrói a base.":"Build the base.","feitas":"done","por fazer":"to do","prep · tudo aberto":"prep · all open",
  "Triângulos de fórmulas":"Formula triangles","Tapa para descobrir. Arrasta para aprofundar.":"Cover to discover. Drag to go deeper.",
  "min":"min","prioridade IE":"IE priority","concluída":"completed",
  "Ideia-chave":"Key idea","Fórmula em triângulo":"Formula triangle",
  "Tapa a grandeza que queres descobrir — como se tapasses com o dedo.":"Cover the quantity you want to find — as if you covered it with your finger.",
  "Exemplo guiado":"Worked example","quadro · passo a passo":"board · step by step",
  "Sair do ecrã inteiro":"Exit fullscreen","Ver em ecrã inteiro":"View fullscreen",
  "Mostrar passo":"Show step","← Voltar ao passo":"← Back to step","Repetir passo":"Repeat step","Ver tudo":"Show all",
  "Solução completa ✓":"Full solution ✓","Voz: ligada":"Voice: on","Voz: desligada":"Voice: off",
  "Ouve só este passo":"Listen to just this step","Ir para o passo":"Go to step","Ouvir o passo":"Listen to step","Rever um passo":"Review a step",
  "Agora tu":"Now you","Prática rápida":"Quick practice","Pergunta":"Question","de":"of",
  "Verificar":"Check","Verificar escolha":"Check answer","Dar uma pista":"Give me a hint","Mostrar resposta":"Show answer",
  "Próxima pergunta":"Next question","← Anterior":"← Back","Ladder completa ✓":"Ladder complete ✓",
  "Escreve a resposta":"Write your answer","A tua resposta":"Your answer","Fácil":"Easy","Médio":"Medium","Escrever":"Type","Escolha múltipla":"Multiple choice",
  "Escolher dificuldade":"Choose difficulty","Escolher formato de resposta":"Choose answer format",
  "Marcar esta lição como concluída":"Mark this lesson as complete","Próxima lição →":"Next lesson →","Voltar à rota":"Back to path",
  "Experimentar o mini-teste →":"Try the quiz →","Progresso":"Progress","Nota do coach":"Coach note","Mostra o trabalho.":"Show your work.",
  "Mesmo quando a resposta parece óbvia, escreve a fórmula. É assim que evitas perder pontos por distração.":"Even when the answer looks obvious, write the formula. That is how you stop losing points to carelessness.",
  "Mini-teste de 20 min":"20-minute quiz","Formulário visual":"Formula sheet","Triângulos.":"Triangles.",
  "Tapa a grandeza que queres descobrir. Arrasta o puxador para a explicação crescer.":"Cover the quantity you want to find. Drag the handle to grow the explanation.",
  "fórmulas":"formulas","Lição completa →":"Full lesson →","arrasta para aprofundar":"drag to go deeper",
  "arrasta para saber mais":"drag for more","arrasta para fechar":"drag to close","triângulos":"triangles",
  "Avaliação rápida":"Quick check","Mini-teste.":"Quiz.","Vinte minutos para medir o que já sabes.":"Twenty minutes to see what you know.",
  "São {count} perguntas de escolha múltipla. No fim, recebes a pontuação, as respostas certas e uma revisão curta de cada raciocínio.":"{count} multiple-choice questions. At the end you get your score, the right answers and a short review of each reasoning.",
  "perguntas":"questions","contagem":"countdown","tentativa guiada":"guided try","Começar agora":"Start now","tempo":"time","restante":"left",
  "Escolhe com método.":"Choose with method.","pontuação":"score","Resultado guardado":"Result saved","Boa revisão.":"Good review.",
  "Tentar novamente":"Try again","Resposta certa:":"Correct answer:","Compara cada resposta com o raciocínio. A explicação vale tanto quanto o ponto.":"Compare every answer with the reasoning. The explanation is worth as much as the point.",
  "Área de foco":"Focus area","Preparação para Engenharia":"Engineering prep","O teu progresso fica guardado neste navegador.":"Your progress is saved in this browser.",
  "último teste":"last quiz","Modo preparação":"Prep mode","Tudo aberto.":"Everything open.",
  "Ligado, podes abrir qualquer lição sem completar as anteriores — ideal para revisões rápidas antes do exame.":"When on, you can open any lesson without finishing the previous ones — ideal for quick reviews before the exam.",
  "Preferência de estudo":"Study preference","Consistência vence pressa.":"Consistency beats hurry.",
  "Faz uma lição por sessão, escreve as unidades e volta aos erros do mini-teste. O exame fica mais pequeno quando o método fica automático.":"Do one lesson per session, write the units, and go back to your quiz mistakes. The exam gets smaller when the method becomes automatic.",
  "Continuar a estudar →":"Keep studying →","Limpar progresso":"Clear progress","Recomeçar progresso":"Restart progress",
  "Lição concluída. Mais um nó na rota.":"Lesson complete. One more node on the path.","Lição reaberta para revisão.":"Lesson reopened for review.",
  "Modo preparação ligado. Todas as lições estão abertas.":"Prep mode on. Every lesson is open.","Modo preparação desligado. A rota volta ao normal.":"Prep mode off. The path is back to normal.",
  "Progresso limpo. A rota está pronta de novo.":"Progress cleared. The path is ready again.","Escreve a tua resposta primeiro.":"Write your answer first.",
  "Escreve a resposta":"Write the answer","Não foi possível carregar esta parte.":"We could not load this part.",
  "Verifica a ligação e tenta novamente.":"Check your connection and try again.","Recarregar":"Reload",
  "A carregar o mini-teste…":"Loading the quiz…","A preparar os triângulos…":"Preparing the triangles…","A preparar a tua rota…":"Preparing your path…",
  "A preparar a próxima etapa…":"Getting the next step ready…","Cobrir":"Cover","idioma":"language",
  "da rota":"of the path","passo a passo":"step by step","próximo movimento":"next move","Ir para a pergunta":"Go to question",
  "Deu bom, demais.":"Nailed it.","Pista:":"Hint:","Resposta:":"Answer:","lição":"lesson",
  "Calma, sem drama. Vê a pista ou revela a resposta e reescreve o passo.":"No drama. Take the hint or reveal the answer, then rewrite the step.",
  "Calma, sem drama. Vê a pista ou revela a resposta e reescreve os passos.":"No drama. Take the hint or reveal the answer, then rewrite the steps.",
  "Deu bom, demais. Resposta certa — agora relê o quadro para fixar o método.":"Nailed it. Correct answer — now re-read the board to lock in the method.",
  "Progresso da matéria":"Subject progress","Progresso do teste":"Quiz progress","Terminar teste":"Finish quiz","Próxima":"Next",
  "Base forte. Agora transforma acerto em consistência.":"Strong base. Now turn accuracy into consistency.",
  "Bom começo. Revê os erros e repete as lições marcadas.":"Good start. Review the mistakes and repeat the marked lessons.",
  "Sem drama: os erros mostram exactamente onde estudar a seguir.":"No drama: the mistakes show you exactly what to study next.",
  "Atalhos":"Shortcuts","Atalhos.":"Shortcuts.","40 truques":"40 tricks","construído por":"built by",
  "Referência rápida":"Quick reference","atalhos":"shortcuts","Filtrar atalhos":"Filter shortcuts","Tudo":"All",
  "Atalhos e truques →":"Shortcuts & tricks →","Triângulos de fórmulas →":"Formula triangles →",
  "A preparar os atalhos…":"Loading the shortcuts…"
};
function lang() { return state.lang === "en" ? "en" : "pt"; }
function t(str) { return lang() === "en" ? (EN[str] || str) : str; }
function contentUrl(name) { return `/content/${lang() === "pt" ? "" : "en/"}${name}.json`; }
function audioUrl(...parts) { return `/audio/${lang() === "pt" ? "" : "en/"}${parts.join("-")}.mp3`; }

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
      if (name === "triangles") triExplain = data;
      if (name === "atalhos") atalhosData = data;
      loadedChunks[name] = true;
    })
    .catch(error => { delete loadingChunks[name]; throw error; });
  return loadingChunks[name];
}
function ensureCatalog() { return loadChunk("catalog", contentUrl("catalog")); }
function ensureLessonDetails(key) { return ensureCatalog().then(() => loadChunk(key, contentUrl(key))); }
function ensureTestData() { return loadChunk("test", contentUrl("test")); }
function ensureTriData() { return ensureCatalog().then(() => Promise.all([ensureLessonDetails("math"), ensureLessonDetails("physics"), loadChunk("triangles", contentUrl("triangles"))])); }
function ensureAtalhosData() { return loadChunk("atalhos", contentUrl("atalhos")); }
function applyStaticLang() {
  document.documentElement.lang = lang();
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  const reset = document.querySelector("#reset-progress");
  if (reset) { reset.title = t("Recomeçar progresso"); reset.setAttribute("aria-label", t("Recomeçar progresso")); }
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang())));
}
function reloadLang() {
  Object.keys(lessonDetails).forEach(k => delete lessonDetails[k]);
  Object.keys(loadedChunks).forEach(k => { loadedChunks[k] = false; });
  Object.keys(loadingChunks).forEach(k => delete loadingChunks[k]);
  mathLessons = []; physicsLessons = [];
  subjects.math.lessons = mathLessons; subjects.physics.lessons = physicsLessons;
  testQuestions = []; triExplain = {}; atalhosData = { items: [] };
  document.documentElement.lang = lang();
  applyStaticLang();
  render();
}

let state = loadState();
let route = { view:"home", subject:"math", lessonId:null };
let testSession = null;
let toastTimer;

function loadingMarkup(label=t("A preparar a próxima etapa…")) {
  return `<div class="loading-state"><span class="loading-mark"></span><p>${label}</p><span class="loading-line"></span><span class="loading-line short"></span></div>`;
}
async function ensureDataForView() {
  if (route.view === "home" || route.view === "path" || route.view === "profile" || route.view === "lesson" || route.view === "triangles" || route.view === "atalhos") await ensureCatalog();
  if (route.view === "lesson") await ensureLessonDetails(route.lessonId.startsWith("p-") ? "physics" : "math");
  if (route.view === "test") await ensureTestData();
  if (route.view === "triangles") await ensureTriData();
  if (route.view === "atalhos") await ensureAtalhosData();
}

function defaultState() { return { completed: [], practice: {}, test: null, voiceOff: false, prep: false, triDeep: {}, time: {}, lang: "pt" }; }
function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) { try { localStorage.setItem(STORAGE_KEY, raw); } catch {} }
    }
    return { ...defaultState(), ...JSON.parse(raw || "{}") };
  } catch { return defaultState(); }
}
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
// Programmatic navigations (back button, subject tabs) never touch location.hash, so an
// <a href="#lesson/x"> to the route you just left fires no hashchange and silently does nothing.
function syncHash() { const want = `#/${route.view}${route.view === "lesson" ? "/" + route.lessonId : route.view === "path" ? "/" + route.subject : ""}`; if (location.hash !== want) history.replaceState(null, "", want); }
function subjectButton(key, label, active) { return `<button class="tab ${active ? "active" : ""}" data-subject="${key}">${label}</button>`; }
function progressBar(value, label="") { return `<div class="progress-track" aria-label="${label}"><span style="width:${value}%"></span></div>`; }
function progressDots(lessons) { return `<span class="mini-progress">${lessons.slice(0, Math.min(8, lessons.length)).map(l => `<i class="${isDone(l.id) ? "done" : ""}"></i>`).join("")}</span>`; }

function renderHome() {
  const next = getNextLesson();
  const math = subjectProgress("math"); const physics = subjectProgress("physics");
  const nextKey = next.id.startsWith("p-") ? "physics" : "math";
  return `<div class="home-top">
    <div class="home-hello"><p class="eyebrow">${t("Por Rafael Bulezi")}</p><h1>${t(completedCount() === 0 ? "Começa aqui." : completedCount() === totalCount() ? "Rota completa." : "Bom ritmo.")}</h1><p class="home-count"><strong>${completedCount()}/${totalCount()}</strong> ${t("lições feitas")}</p></div>
    <div class="home-ring" style="--score:${pct()}%" role="img" aria-label="${pct()}% ${t("da rota")}"><strong>${pct()}%</strong></div>
  </div>
  <a class="continue-card" href="#lesson/${next.id}"><p class="eyebrow">${t(isDone(next.id) ? "Rever" : "Continuar")} · ${t(subjects[nextKey].label)}</p><h2>${escapeHtml(next.title)}</h2><div class="continue-foot"><span class="tag">${next.minutes} ${t("min")}</span>${progressDots(subjects[nextKey].lessons)}<span class="node-cta">→</span></div></a>
  <div class="quick-grid">
    <a class="quick-tile" href="#triangles"><span class="quick-icon" aria-hidden="true">△</span><strong>${t("Triângulos")}</strong><small>${t("10 fórmulas")}</small></a>
    <a class="quick-tile" href="#atalhos"><span class="quick-icon" aria-hidden="true">✧</span><strong>${t("Atalhos")}</strong><small>${t("40 truques")}</small></a>
    <a class="quick-tile" href="#test"><span class="quick-icon" aria-hidden="true">▣</span><strong>${t("Mini-teste")}</strong><small>${t("20 min")}</small></a>
    <a class="quick-tile" href="#path"><span class="quick-icon" aria-hidden="true">✦</span><strong>${t("Toda a rota")}</strong><small>${totalCount()} ${t("lições")}</small></a>
  </div>
  <div class="subject-rows">
    <a href="#path/math" class="subject-row"><span class="subject-symbol math">x²</span><span class="subject-row-copy"><strong>${t("Matemática")}</strong><small>${math.done}/${math.total} ${t("concluídas")}</small></span><span class="node-cta">→</span></a>
    <a href="#path/physics" class="subject-row"><span class="subject-symbol physics">F</span><span class="subject-row-copy"><strong>${t("Física")}</strong><small>${physics.done}/${physics.total} ${t("concluídas")}</small></span><span class="node-cta">→</span></a>
  </div>
  <footer class="sig"><span>${t("construído por")}</span><strong>Rafael Bulezi</strong></footer>`;
}

function renderPath() {
  const key = route.subject === "physics" ? "physics" : "math"; const subject = subjects[key]; const prog = subjectProgress(key);
  return `<div class="path-head"><div><p class="eyebrow">${t("A tua rota")}</p><h1>${t("Constrói a base.")}</h1></div><div class="path-stats"><span class="stat-pill"><strong>${prog.done}</strong> ${t("feitas")}</span><span class="stat-pill"><strong>${prog.total - prog.done}</strong> ${t("por fazer")}</span>${state.prep ? `<span class="stat-pill prep">${t("prep · tudo aberto")}</span>` : ""}</div></div><div class="tabs">${subjectButton("math",t("Matemática"),key === "math")}${subjectButton("physics",t("Física"),key === "physics")}</div><a class="tri-shortcut" href="#triangles"><span class="tri-shortcut-tri" aria-hidden="true">△</span><div><strong>${t("Triângulos de fórmulas")}</strong><small>${t("Tapa para descobrir. Arrasta para aprofundar.")}</small></div><span class="node-cta">→</span></a><div class="path-wrap">${subject.lessons.map((lesson, index) => {
    const done = isDone(lesson.id); const previousDone = index === 0 || isDone(subject.lessons[index-1].id); const locked = !state.prep && !done && !previousDone;
    return `<article class="lesson-node ${done ? "done" : ""} ${!locked && !done ? "current" : ""} ${locked ? "locked" : ""}"><div class="node-bullet">${done ? "✓" : String(index + 1).padStart(2,"0")}</div><a class="node-card" href="${locked ? "#path/"+key : "#lesson/"+lesson.id}"><div><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.short)}</p><div class="node-meta"><span class="tag">${lesson.minutes} ${t("min")}</span>${lesson.priority ? `<span class="tag priority">${t("prioridade IE")}</span>` : ""}${done ? `<span class="tag done">${t("concluída")}</span>` : ""}</div></div><span class="node-cta">${locked ? "•" : "→"}</span></a></article>`;
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
const SPEAKER_ICON = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 3 4 5.8H2v4.4h2L7.5 13z"/><path d="M10.4 6.1a2.6 2.6 0 0 1 0 3.8M12.6 4a5.6 5.6 0 0 1 0 8"/></svg>';

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
    btn.title = t(on ? "Sair do ecrã inteiro" : "Ver em ecrã inteiro");
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

function triExchange(t0, cell) {
  const [sTop, , wTop] = t0.top;
  const [sLeft, , wLeft] = t0.left;
  const [sRight, , wRight] = t0.right;
  const en = lang() === "en";
  const bare = s => s.replace(/^(the|a|an)\s+/i, "");
  if (cell === "top") return { line: `${sTop} = ${sLeft} × ${sRight}`, say: en ? `Cover ${wTop}. So ${sTop} is ${bare(wLeft)} times ${bare(wRight)}.` : `Tapa ${wTop}. Então ${sTop} é ${wLeft} vezes ${wRight}.` };
  if (cell === "left") return { line: `${sLeft} = {${sTop}/${sRight}}`, say: en ? `Cover ${wLeft}. To isolate ${sLeft}, divide ${sTop} by ${bare(wRight)}.` : `Tapa ${wLeft}. Para isolar ${sLeft}, divides ${sTop} por ${sRight}.` };
  return { line: `${sRight} = {${sTop}/${sLeft}}`, say: en ? `Cover ${wRight}. To isolate ${sRight}, divide ${sTop} by ${bare(wLeft)}.` : `Tapa ${wRight}. Para isolar ${sRight}, divides ${sTop} por ${sLeft}.` };
}

function triCell(cell, data) {
  const [sym, label] = data;
  const cls = cell === "top" ? "tri-top" : cell === "left" ? "tri-left" : "tri-right";
  return `<button class="tri-cell ${cls}" data-tri="${cell}" aria-pressed="false" aria-label="${t("Cobrir")} ${escapeHtml(sym)}, ${escapeHtml(label)}"><span class="tri-sym">${escapeHtml(sym)}</span><small>${escapeHtml(label)}</small></button>`;
}

function triCard(lesson) {
  const t0 = lesson.formulaTri;
  if (!t0 || !Array.isArray(t0.top) || !Array.isArray(t0.left) || !Array.isArray(t0.right)) return "";
  return `<article class="card tri-card" data-lesson="${lesson.id}"><p class="eyebrow">${t("Fórmula em triângulo")}</p><div class="tri-formula">${inlineWrite(`${t0.top[0]} = ${t0.left[0]} × ${t0.right[0]}`)}</div><p class="tri-hint">${t("Tapa a grandeza que queres descobrir — como se tapasses com o dedo.")}</p><div class="tri-wrap"><svg class="tri-ink" aria-hidden="true"></svg>${triCell("top", t0.top)}${triCell("left", t0.left)}${triCell("right", t0.right)}</div><div class="tri-result" aria-live="polite"></div></article>`;
}

function drawTriFrame() {
  document.querySelectorAll(".tri-wrap").forEach(wrap => {
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
  });
}

/* ===== Página dos triângulos: todos os triângulos + explicação que cresce ===== */

function triPageCard(lesson) {
  const formulaTri = lesson.formulaTri;
  const info = triExplain[lesson.id] || {};
  const deep = Array.isArray(info.deep) ? info.deep : [];
  const level = Math.min(Math.max((state.triDeep && state.triDeep[lesson.id]) || 0, 0), deep.length);
  const key = lesson.id.startsWith("p-") ? "physics" : "math";
  return `<article class="card tri-card tri-page-card" data-lesson="${lesson.id}" data-tri-level="${level}"><div class="tri-page-head"><div><p class="eyebrow" style="color:var(--${key === "physics" ? "coral" : "blue"})">${t(subjects[key].label)}</p><h2>${escapeHtml(lesson.title)}</h2></div><a class="text-link" href="#lesson/${lesson.id}">${t("Lição completa →")}</a></div><div class="tri-formula">${inlineWrite(`${formulaTri.top[0]} = ${formulaTri.left[0]} × ${formulaTri.right[0]}`)}</div><p class="tri-hint">${t("Tapa a grandeza que queres descobrir — como se tapasses com o dedo.")}</p><div class="tri-wrap"><svg class="tri-ink" aria-hidden="true"></svg>${triCell("top", formulaTri.top)}${triCell("left", formulaTri.left)}${triCell("right", formulaTri.right)}</div><div class="tri-result" aria-live="polite"></div><p class="tri-base">${escapeHtml(info.base || "")}</p><div class="tri-deep-extra">${deep.map(d => `<div class="tri-deep-block"><strong>${escapeHtml(d.t)}</strong><p>${escapeHtml(d.p)}</p></div>`).join("")}</div><button type="button" class="tri-drag" data-tri-drag aria-expanded="${level > 0}"><span class="tri-drag-grip" aria-hidden="true"></span><span class="tri-drag-label"></span></button></article>`;
}

function renderTriangles() {
  const tris = allLessons().map(l => lessonDetails[l.id]).filter(l => l && l.formulaTri && triExplain[l.id]);
  const math = tris.filter(l => !l.id.startsWith("p-"));
  const physics = tris.filter(l => l.id.startsWith("p-"));
  const section = (title, list) => list.length ? `<div class="section-head"><h2>${t(title)}</h2><span class="muted tri-count">${list.length} ${t("triângulos")}</span></div><div class="tri-grid">${list.map(triPageCard).join("")}</div>` : "";
  return `<div class="path-head"><div><p class="eyebrow">${t("Formulário visual")}</p><h1>${t("Triângulos.")}</h1><p class="lead">${t("Tapa a grandeza que queres descobrir. Arrasta o puxador para a explicação crescer.")}</p></div><div class="path-stats"><span class="stat-pill"><strong>${tris.length}</strong> ${t("fórmulas")}</span><a class="text-link" href="#atalhos">${t("Atalhos e truques →")}</a></div></div>${section("Matemática", math)}${section("Física", physics)}`;
}

function renderAtalhos() {
  const items = Array.isArray(atalhosData.items) ? atalhosData.items : [];
  const kinds = [...new Set(items.map(i => i.k))];
  const shown = atalhoFiltro === "all" ? items : atalhoFiltro === "math" ? items.filter(i => i.s === "math") : atalhoFiltro === "physics" ? items.filter(i => i.s === "physics") : items.filter(i => i.k === atalhoFiltro);
  const chip = (val, label) => `<button type="button" class="filter-chip${atalhoFiltro === val ? " active" : ""}" data-atalho="${escapeHtml(val)}" aria-pressed="${atalhoFiltro === val}">${escapeHtml(label)}</button>`;
  const card = i => `<article class="atalho-card ${i.s}"><span class="atalho-kind">${escapeHtml(i.k)}</span><h2>${escapeHtml(i.t)}</h2><p class="atalho-formula">${escapeHtml(i.f)}</p><p class="atalho-note">${escapeHtml(i.n)}</p></article>`;
  return `<div class="path-head"><div><p class="eyebrow">${t("Referência rápida")}</p><h1>${t("Atalhos.")}</h1><p class="lead">${escapeHtml(atalhosData.intro || "")}</p></div><div class="path-stats"><span class="stat-pill"><strong>${items.length}</strong> ${t("atalhos")}</span></div></div>
  <div class="filter-row" role="group" aria-label="${t("Filtrar atalhos")}">${chip("all", t("Tudo"))}${chip("math", t("Matemática"))}${chip("physics", t("Física"))}${kinds.map(k => chip(k, k)).join("")}</div>
  <div class="atalho-grid">${shown.map(card).join("")}</div>
  <p class="atalho-foot"><a class="text-link" href="#triangles">${t("Triângulos de fórmulas →")}</a></p>`;
}

function triDets(card) {
  const extra = card.querySelector(".tri-deep-extra");
  const blocks = [...extra.querySelectorAll(".tri-deep-block")];
  const dets = [0];
  let acc = 0;
  blocks.forEach(b => { acc += b.offsetHeight + 14; dets.push(acc); });
  return dets;
}
function syncTriDeep(animate = false) {
  document.querySelectorAll(".tri-page-card").forEach(card => {
    if (triDrag && triDrag.card === card) return;
    const extra = card.querySelector(".tri-deep-extra");
    if (!extra) return;
    const dets = triDets(card);
    const max = dets.length - 1;
    const level = Math.min(Math.max(Number(card.dataset.triLevel) || 0, 0), max);
    card._dets = dets; card.dataset.triLevel = level;
    extra.classList.remove("dragging");
    if (!animate) { extra.classList.add("no-anim"); extra.style.height = `${dets[level]}px`; void extra.offsetHeight; extra.classList.remove("no-anim"); }
    else extra.style.height = `${dets[level]}px`;
    const drag = card.querySelector("[data-tri-drag]");
    if (drag) {
      drag.setAttribute("aria-expanded", String(level > 0));
      drag.querySelector(".tri-drag-label").textContent = t(level === max ? "arrasta para fechar" : level > 0 ? "arrasta para saber mais" : "arrasta para aprofundar");
    }
  });
}
function setTriLevel(card, level) {
  const max = ((card._dets && card._dets.length) || 1) - 1;
  const next = Math.min(Math.max(level, 0), max);
  card.dataset.triLevel = next;
  state.triDeep = state.triDeep || {};
  if (next) state.triDeep[card.dataset.lesson] = next; else delete state.triDeep[card.dataset.lesson];
  saveState();
  syncTriDeep(true);
}
let triDrag = null;
document.addEventListener("pointerdown", event => {
  const drag = event.target.closest("[data-tri-drag]");
  if (!drag) return;
  const card = drag.closest(".tri-page-card");
  const extra = card && card.querySelector(".tri-deep-extra");
  if (!extra || !card._dets) return;
  triDrag = { card, extra, startY: event.clientY, startH: extra.offsetHeight, moved: false };
  extra.classList.add("dragging");
  if (drag.setPointerCapture) { try { drag.setPointerCapture(event.pointerId); } catch {} }
});
document.addEventListener("pointermove", event => {
  if (!triDrag) return;
  const dy = triDrag.startY - event.clientY;
  if (Math.abs(dy) > 4) triDrag.moved = true;
  const maxH = triDrag.card._dets[triDrag.card._dets.length - 1];
  const h = Math.min(Math.max(triDrag.startH + dy, 0), maxH);
  triDrag.extra.style.height = `${Math.round(h)}px`;
});
function endTriDrag() {
  if (!triDrag) return;
  const { card, extra, moved } = triDrag;
  triDrag = null;
  extra.classList.remove("dragging");
  const level = Number(card.dataset.triLevel) || 0;
  if (!moved) { setTriLevel(card, level >= card._dets.length - 1 ? 0 : level + 1); return; }
  const h = extra.offsetHeight;
  let best = 0, bestD = Infinity;
  card._dets.forEach((d, i) => { const dist = Math.abs(d - h); if (dist < bestD) { bestD = dist; best = i; } });
  setTriLevel(card, best);
}
document.addEventListener("pointerup", endTriDrag);
document.addEventListener("pointercancel", endTriDrag);
let triResizeTimer;
window.addEventListener("resize", () => { clearTimeout(triResizeTimer); triResizeTimer = setTimeout(() => { if (route.view === "triangles") syncTriDeep(); }, 160); });


function exampleCard(lesson, shownSteps) {
  if (!lesson.walkthrough || !Array.isArray(lesson.walkthrough.steps) || !lesson.walkthrough.steps.length) return legacyExampleCard(lesson, shownSteps);
  const total = stepCount(lesson);
  const shown = Math.min(shownSteps, total);
  const complete = shown >= total;
  const { lines } = quadroModel(lesson, shown);
  const totalLines = lesson.walkthrough.steps.filter(s => s.line).length;
  const linesHtml = lines.map(l => `<div class="quadro-line ${l.ord === totalLines - 1 ? "final" : ""}" data-line-ord="${l.ord}" data-step-line="${l.step}"><span class="step-badge" aria-hidden="true">${l.step + 1}</span><span class="eq" style="transform: rotate(${tiltOf(l.ord)}deg)">${inlineWrite(l.text)}</span><button type="button" class="step-voice" data-say="${l.step}" title="${t("Ouve só este passo")}" aria-label="${t("Ouvir o passo")} ${l.step + 1}">${SPEAKER_ICON}</button></div>`).join("");
  const chips = total > 1 ? `<div class="step-chips" role="group" aria-label="${t("Rever um passo")}">${Array.from({ length: total }, (_, i) => `<button type="button" class="step-chip" data-step-goto="${i}" aria-current="${shown === i + 1 ? "true" : "false"}" title="${t("Ir para o passo")} ${i + 1}">${i + 1}</button>`).join("")}</div>` : "";
  const controls = [
    !complete ? `<button class="button button-lime button-small" data-step="next">${t("Mostrar passo")} ${shown + 1} <span>→</span></button>` : `<span class="tag done">${t("Solução completa ✓")}</span>`,
    shown > 1 ? `<button class="button button-ghost button-small" data-step="prev">${t("← Voltar ao passo")} ${shown - 1}</button>` : "",
    shown > 0 ? `<button class="button button-ghost button-small" data-step="replay" title="${lang() === "en" ? "Replays the voice and the drawing of this step" : "Repete a voz e o desenho deste passo"}">${t("Repetir passo")} ${shown}</button>` : "",
    !complete && shown > 0 ? `<button class="button button-ghost button-small" data-step="all">${t("Ver tudo")}</button>` : "",
    `<button class="button button-ghost button-small" data-voice aria-pressed="${state.voiceOff ? "false" : "true"}">${state.voiceOff ? t("Voz: desligada") : t("Voz: ligada")}</button>`,
    chips
  ].join("");
  return `<article class="card example-card${quadroFull ? " quadro-full" : ""}"><div class="example-label"><div><p class="eyebrow">${t("Exemplo guiado")}</p><h2>${escapeHtml(lesson.example)}</h2></div><span class="example-tools"><span class="tag">${t("quadro · passo a passo")}</span><button class="icon-button quadro-expand" data-quadro="full" aria-pressed="${quadroFull}" title="${quadroFull ? t("Sair do ecrã inteiro") : t("Ver em ecrã inteiro")}" aria-label="${lang() === "en" ? "Board fullscreen" : "Ecrã inteiro do quadro"}">${quadroFull ? COLLAPSE_ICON : EXPAND_ICON}</button></span></div><div class="quadro" id="quadro"><div class="quadro-lines">${linesHtml}</div><svg class="quadro-ink" aria-hidden="true"></svg><div class="quadro-notes" aria-hidden="true"></div></div><div class="solution-controls">${controls}</div></article>`;
}

function legacyExampleCard(lesson, shownSteps) {
  return `<article class="card"><div class="example-label"><div><p class="eyebrow">${t("Exemplo guiado")}</p><h2>${escapeHtml(lesson.example)}</h2></div><span class="tag">${t("passo a passo")}</span></div><div class="step-list">${lesson.steps.map((step, i) => `${i > 0 ? `<div class="step-connector" aria-hidden="true"><span>↳</span><small>${t("próximo movimento")}</small></div>` : ""}<div class="step ${i < shownSteps ? "" : "hidden-step"}"><span class="step-number">${i+1}</span><p>${escapeHtml(step)}</p></div>`).join("")}</div><div class="solution-controls">${shownSteps < lesson.steps.length ? `<button class="button button-lime button-small" data-step="next">${t("Mostrar passo")} ${shownSteps + 1} <span>→</span></button>` : `<span class="tag done">${t("Solução completa ✓")}</span>`}${shownSteps > 0 && shownSteps < lesson.steps.length ? `<button class="button button-ghost button-small" data-step="all">${t("Ver tudo")}</button>` : ""}</div></article>`;
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
  const dots = ladder.map((_, i) => `<button type="button" class="${results[i] && results[i].correct ? "done" : ""}" data-practice="goto" data-qi="${i}" aria-current="${i === qi ? "true" : "false"}" aria-label="${t("Ir para a pergunta")} ${i + 1}" title="${t("Pergunta")} ${i + 1}"></button>`).join("");
  return `<article class="card practice-card"><div class="practice-top"><div><p class="eyebrow">${t("Agora tu")}</p><h2>${t("Prática rápida")}</h2></div><span class="tag">${t("Pergunta")} ${qi + 1} ${t("de")} ${total}</span></div><div class="ladder-dots" aria-hidden="true">${dots}</div><p class="question-line">${escapeHtml(item.q)}</p><div class="answer-row"><input id="practice-answer" value="${escapeHtml(res.value || "")}" placeholder="${escapeHtml(item.formatHint || t("Escreve a resposta"))}" aria-label="${t("A tua resposta")}" title="${escapeHtml(item.formatHint || t("Escreve a resposta"))}" /><span class="format-help" title="${escapeHtml(item.formatHint || t("Escreve a resposta"))}">i</span><button class="button button-primary button-small" data-practice="check">${t("Verificar")}</button></div><div class="solution-controls">${qi > 0 ? `<button class="button button-ghost button-small" data-practice="prev">${t("← Anterior")}</button>` : ""}${!done ? `<button class="button button-ghost button-small" data-practice="hint">${t("Dar uma pista")}</button><button class="button button-ghost button-small" data-practice="reveal">${t("Mostrar resposta")}</button>` : ""}${done && !last ? `<button class="button button-lime button-small" data-practice="next">${t("Próxima pergunta")} <span>→</span></button>` : ""}${done && last ? `<span class="tag done">${t("Ladder completa ✓")}</span>` : ""}</div>${res.correct ? `<div class="practice-feedback good"><strong>${t("Deu bom, demais.")}</strong> ${escapeHtml(item.explanation)}</div>` : ""}${res.checked && !res.correct && !res.revealed ? `<div class="practice-feedback try">${t("Calma, sem drama. Vê a pista ou revela a resposta e reescreve o passo.")}</div>` : ""}${res.hintShown && !done ? `<div class="practice-feedback">${t("Pista:")} ${escapeHtml(item.hint)}</div>` : ""}${res.revealed ? `<div class="practice-feedback good"><strong>${t("Resposta:")} ${escapeHtml(item.answer)}</strong><br>${escapeHtml(item.explanation)}</div>` : ""}</article>`;
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

function inflate(r, pad) { return { x1: r.x1 - pad, y1: r.y1 - pad, x2: r.x2 + pad, y2: r.y2 + pad }; }
function inside(p, r) { return p[0] > r.x1 && p[0] < r.x2 && p[1] > r.y1 && p[1] < r.y2; }
function boxCenter(r) { return { x: (r.x1 + r.x2) / 2, y: (r.y1 + r.y2) / 2 }; }

function pathScore(pts, obstacles, a, b) {
  let hits = 0, len = 0;
  const freeA = inflate(a, 15), freeB = inflate(b, 15);
  pts.forEach((p, i) => {
    if (i) len += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
    if (inside(p, freeA) || inside(p, freeB)) return;
    if (obstacles.some(o => inside(p, o))) hits++;
  });
  return hits * 4000 + len;
}

function samplePolyline(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (step || 7)));
    for (let k = 1; k <= n; k++) out.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]);
  }
  return out;
}

/* The term has to visibly travel to the other side of the "=" and land on its new home, so route
   it through free space: over the top, under the bottom, down the lane between two lines, or around
   the left/right end — whichever candidate touches no glyph. */
function arrowCandidates(a, b, W, H) {
  const ac = boxCenter(a), bc = boxCenter(b);
  const cands = [];
  [18, 34, 54, 78].forEach(k => {
    const top = Math.max(4, Math.min(a.y1, b.y1) - k);
    cands.push([[ac.x, a.y1 - 5], [ac.x, top], [bc.x, top], [bc.x, b.y1 - 5]]);
    const bottom = Math.min(H - 4, Math.max(a.y2, b.y2) + k);
    cands.push([[ac.x, a.y2 + 5], [ac.x, bottom], [bc.x, bottom], [bc.x, b.y2 + 5]]);
    const right = Math.min(W - 4, Math.max(a.x2, b.x2) + k);
    cands.push([[a.x2 + 5, ac.y], [right, ac.y], [right, bc.y], [b.x2 + 5, bc.y]]);
    const left = Math.max(4, Math.min(a.x1, b.x1) - k);
    cands.push([[a.x1 - 5, ac.y], [left, ac.y], [left, bc.y], [b.x1 - 5, bc.y]]);
  });
  if (b.y1 - a.y2 > 26) {
    const lane = (a.y2 + b.y1) / 2;
    cands.push([[ac.x, a.y2 + 5], [ac.x, lane], [bc.x, lane], [bc.x, b.y1 - 5]]);
    cands.push([[ac.x, a.y2 + 5], [ac.x, lane + 13], [bc.x, lane + 13], [bc.x, b.y2 + 5]]);
    cands.push([[ac.x, a.y2 + 5], [(ac.x + bc.x) / 2, lane], [bc.x, b.y1 - 5]]);
  }
  if (a.y1 - b.y2 > 26) {
    const lane = (b.y2 + a.y1) / 2;
    cands.push([[ac.x, a.y1 - 5], [ac.x, lane], [bc.x, lane], [bc.x, b.y2 + 5]]);
    cands.push([[ac.x, a.y1 - 5], [(ac.x + bc.x) / 2, lane], [bc.x, b.y2 + 5]]);
  }
  cands.push([[ac.x, ac.y], [bc.x, bc.y]]);
  return cands;
}

function routeArrow(a, b, obstacles, W, H) {
  let best = null, bestScore = Infinity;
  arrowCandidates(a, b, W, H).forEach(c => {
    const s = pathScore(samplePolyline(c, 6), obstacles, a, b);
    if (s < bestScore) { bestScore = s; best = c; }
  });
  const ac = boxCenter(a);
  return { pts: best || [[ac.x, a.y1], [boxCenter(b).x, b.y1]], clear: bestScore < 4000 };
}

function arrowPaths(route, rnd) {
  const pts = route.pts;
  const dense = samplePolyline(pts, 9).map(p => [p[0] + (rnd() - 0.5) * 1.7, p[1] + (rnd() - 0.5) * 1.7]);
  const n = dense.length;
  const ex = dense[n - 1], prev = dense[Math.max(0, n - 4)];
  const tx = ex[0] - prev[0], ty = ex[1] - prev[1];
  const tl = Math.hypot(tx, ty) || 1;
  const dxn = tx / tl, dyn = ty / tl;
  const head = angle => {
    const hx = ex[0] - (dxn * Math.cos(angle) - dyn * Math.sin(angle)) * 11;
    const hy = ex[1] - (dyn * Math.cos(angle) + dxn * Math.sin(angle)) * 11;
    return `M${r0(ex[0])} ${r0(ex[1])} L${r0(hx)} ${r0(hy)}`;
  };
  return { strokes: [smoothOpen(dense), head(0.42), head(-0.42)], apex: dense[Math.floor(n / 2)] };
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
  if (rects.sketch) return { x: (rects.sketch.x1 + rects.sketch.x2) / 2, y: (rects.sketch.y1 + rects.sketch.y2) / 2 - 9 };
  const r = rects.target;
  if (!r) return { x: 40, y: 16 };
  if (r.frac === "fn") return { right: r.x2 + 10, y: (r.y1 + r.y2) / 2 - 9 };
  return { x: (r.x1 + r.x2) / 2, y: r.y2 + 9 };
}

/* Notes are the loudest collision source: they used to be pinned at a fixed offset from their
   mark and landed on the next line's equation. Try the free spots around the mark (or the arrow's
   apex) and take the one that touches nothing. */
function placeNote(note, scene, anchor, apex) {
  const w = note.offsetWidth, h = note.offsetHeight;
  const spots = [];
  const add = (x, y) => spots.push([Math.min(Math.max(x, w / 2 + 6), Math.max(w / 2 + 6, scene.W - w / 2 - 6)), Math.min(Math.max(y, 4), Math.max(4, scene.H - h - 4))]);
  if (apex) { add(apex[0], apex[1] - h - 9); add(apex[0], apex[1] + 9); add(apex[0] - w / 2 - 14, apex[1] - h / 2); add(apex[0] + w / 2 + 14, apex[1] - h / 2); }
  if (anchor.right != null) { add(anchor.right + w / 2 + 8, anchor.y); add(anchor.right - w * 1.1, anchor.y - h - 6); add(anchor.right - w * 1.1, anchor.y + 6); }
  const cx = anchor.x != null ? anchor.x : scene.W / 2;
  add(cx, anchor.y); add(cx, anchor.y - h - 8); add(cx, anchor.y + h + 8);
  add(cx - w * 0.7, anchor.y - 4); add(cx + w * 0.7, anchor.y - 4);
  const ref = apex ? { x: apex[0], y: apex[1] } : { x: cx, y: anchor.y };
  let best = null, bestScore = Infinity;
  spots.forEach(([x, y]) => {
    const rect = { x1: x - w / 2, y1: y, x2: x + w / 2, y2: y + h };
    const ir = inflate(rect, 4);
    let hits = 0;
    scene.obstacles.forEach(o => { if (ir.x1 < o.x2 && ir.x2 > o.x1 && ir.y1 < o.y2 && ir.y2 > o.y1) hits++; });
    scene.placed.forEach(p => { if (ir.x1 < p.x2 && ir.x2 > p.x1 && ir.y1 < p.y2 && ir.y2 > p.y1) hits += 3; });
    const score = hits * 4000 + Math.hypot(x - ref.x, y - ref.y);
    if (score < bestScore) { bestScore = score; best = { x, y, rect }; }
  });
  scene.placed.push(best.rect);
  return best;
}

function drawMark(svg, notesLayer, quadro, mark, rects, animate, delay, seed, scene) {
  const rnd = mulberry32((seed >>> 0) * 2654435761 % 4294967296 + 7);
  const color = MARK_COLORS[mark.color] || MARK_COLORS.coral;
  const strokes = [];
  let sketchBox = null;
  let apex = null;
  if (mark.k === "circle" && rects.target) strokes.push(...circlePaths(rects.target, rnd));
  if (mark.k === "underline" && rects.target) strokes.push(underlinePath(rects.target, rnd));
  if (mark.k === "strike" && rects.target) strokes.push(strikePath(rects.target, rnd));
  if (mark.k === "arrow" && rects.from && rects.to) {
    const route = routeArrow(rects.from, rects.to, scene.obstacles, scene.W, scene.H);
    const res = arrowPaths(route, rnd);
    strokes.push(...res.strokes);
    apex = res.apex;
  }
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
    const spot = placeNote(note, scene, noteAnchor({ ...rects, sketch: sketchBox }, mark), apex);
    note.style.left = `${r0(spot.x)}px`;
    note.style.top = `${r0(spot.y)}px`;
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
  const scene = {
    W: quadro.clientWidth,
    H: quadro.clientHeight,
    placed: [],
    obstacles: [...quadro.querySelectorAll(".quadro-line .eq")].map(el => {
      const r = el.getBoundingClientRect();
      return inflate({ x1: r.left - base.left, y1: r.top - base.top, x2: r.right - base.left, y2: r.bottom - base.top }, 5);
    })
  };
  const { marks } = quadroModel(lesson, shown);
  let animated = 0;
  marks.forEach(({ step, mark }, index) => {
    const rects = resolveMarkRects(quadro, base, mark);
    if (!rects) return;
    const animate = !reduce && step === animStep;
    drawMark(svg, notesLayer, quadro, mark, rects, animate, 420 + animated * 430, step * 131 + index * 17, scene);
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
  setTimeout(() => playStepAudio(audioUrl(lesson.id, job.stepIndex), step.say), 300);
  if (typeof Audio !== "undefined" && job.stepIndex + 1 < total) { const pre = new Audio(); pre.preload = "auto"; pre.src = audioUrl(lesson.id, job.stepIndex + 1); preloaded.push(pre); if (preloaded.length > 3) preloaded.shift(); }
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
  return `<div class="lesson-head"><button class="back-button" data-back="path/${key}" aria-label="${t("Voltar à rota")}">←</button><div><p class="eyebrow">${t(subject.label)} · ${t("lição")} ${index + 1} ${t("de")} ${subject.lessons.length}</p><h1>${escapeHtml(lesson.title)}</h1><p class="lead">${escapeHtml(lesson.short)}</p></div>${timerMarkup(lesson)}</div><div class="lesson-layout"><div class="lesson-main">
    <article class="card concept-card"><p class="eyebrow" style="color:var(--lime)">${t("Ideia-chave")}</p><h2>${escapeHtml(lesson.concept.split(".")[0])}.</h2><p>${escapeHtml(lesson.concept)}</p><div class="formula">${escapeHtml(lesson.formula)}</div></article>
    ${triCard(lesson)}
    ${exampleCard(lesson, shownSteps)}
    ${lesson.ladder && lesson.ladder.length ? ladderCard(lesson, practice) : `<article class="card practice-card"><div class="practice-top"><div><p class="eyebrow">${t("Agora tu")}</p><h2>${t("Prática rápida")}</h2></div><div class="level-switch" aria-label="${t("Escolher dificuldade")}"><button class="level-button ${activeLevel === "easy" ? "active" : ""}" data-level="easy">${t("Fácil")}</button><button class="level-button ${activeLevel === "medium" ? "active" : ""}" data-level="medium">${t("Médio")}</button></div></div><div class="mode-switch" aria-label="${t("Escolher formato de resposta")}"><button class="mode-button ${activeMode === "typed" ? "active" : ""}" data-mode="typed">${t("Escrever")}</button><button class="mode-button ${activeMode === "mc" ? "active" : ""}" data-mode="mc">${t("Escolha múltipla")}</button></div><p class="question-line">${escapeHtml(activeData.practice)}</p>${activeMode === "mc" ? `<div class="practice-options">${optionOrder.map((optionIndex, displayIndex) => `<button class="practice-option ${currentAnswer === options[optionIndex] ? "selected" : ""}" data-choice="${optionIndex}"><span>${String.fromCharCode(65 + displayIndex)}</span>${escapeHtml(options[optionIndex])}</button>`).join("")}</div><button class="button button-primary button-small" data-practice="check">${t("Verificar escolha")}</button>` : `<div class="answer-row"><input id="practice-answer" value="" placeholder="${escapeHtml(activeData.formatHint || t("Escreve a resposta"))}" aria-label="${t("A tua resposta")}" title="${escapeHtml(activeData.formatHint || t("Escreve a resposta"))}" /><span class="format-help" title="${escapeHtml(activeData.formatHint || t("Escreve a resposta"))}">i</span><button class="button button-primary button-small" data-practice="check">${t("Verificar")}</button></div>`}<div class="solution-controls"><button class="button button-ghost button-small" data-practice="hint">${t("Dar uma pista")}</button><button class="button button-ghost button-small" data-practice="reveal">${t("Mostrar resposta")}</button></div>${practice?.feedback ? `<div class="practice-feedback ${practice.correct ? "good" : "try"}">${practice.feedback}</div>` : ""}${practice?.hintShown ? `<div class="practice-feedback">${t("Pista:")} ${escapeHtml(activeData.hint)}</div>` : ""}${practice?.revealed ? `<div class="practice-feedback good"><strong>${t("Resposta:")} ${escapeHtml(activeData.answer)}</strong><br>${escapeHtml(activeData.explanation)}</div>` : ""}</article>`}
    <article class="card"><label class="check-row"><input type="checkbox" data-complete ${isDone(lesson.id) ? "checked" : ""} /> <span>${t("Marcar esta lição como concluída")}</span></label>${isDone(lesson.id) && next ? `<div class="hero-actions" style="margin-top:16px"><a class="button button-lime" href="#lesson/${next.id}">${t("Próxima lição →")}</a><a class="button button-ghost" href="#path/${key}">${t("Voltar à rota")}</a></div>` : isDone(lesson.id) ? `<div class="hero-actions" style="margin-top:16px"><a class="button button-lime" href="#test">${t("Experimentar o mini-teste →")}</a></div>` : ""}</article>
  </div><aside class="lesson-side"><div class="card side-card"><p class="eyebrow">${t("Progresso")} ${t(subject.label)}</p><h3>${subjectProgress(key).done}/${subject.lessons.length} ${t("concluídas")}</h3>${progressBar(Math.round(subjectProgress(key).done / subject.lessons.length * 100), t("Progresso da matéria"))}<div class="side-progress">${subject.lessons.map(l => `<i class="${isDone(l.id) ? "done" : ""}"></i>`).join("")}</div></div><div class="card side-card"><p class="eyebrow">${t("Nota do coach")}</p><h3>${t("Mostra o trabalho.")}</h3><p class="muted">${t("Mesmo quando a resposta parece óbvia, escreve a fórmula. É assim que evitas perder pontos por distração.")}</p><div class="side-actions"><a class="button button-ghost button-small" href="#test">${t("Mini-teste de 20 min")}</a></div></div></aside></div>`;
}

function renderTest() {
  if (!testSession) return `<div class="test-header"><div><p class="eyebrow">${t("Avaliação rápida")}</p><h1>${t("Mini-teste.")}</h1></div><div class="timer"><small>${t("tempo")}</small>20:00</div></div><div class="test-card"><div class="test-intro"><p class="eyebrow" style="color:var(--lime)">${t("Matemática")} + ${t("Física")}</p><h2>${t("Vinte minutos para medir o que já sabes.")}</h2><p>${t("São {count} perguntas de escolha múltipla. No fim, recebes a pontuação, as respostas certas e uma revisão curta de cada raciocínio.").replace("{count}", String(testQuestions.length))}</p><div class="test-rules"><div class="test-rule"><strong>${testQuestions.length}</strong><span>${t("perguntas")}</span></div><div class="test-rule"><strong>20′</strong><span>${t("contagem")}</span></div><div class="test-rule"><strong>1</strong><span>${t("tentativa guiada")}</span></div></div><button class="button button-lime" data-test="start">${t("Começar agora")} <span>→</span></button></div></div>`;
  if (testSession.finished) return renderTestResult();
  const q = testQuestions[testSession.index]; const selected = testSession.answers[testSession.index]; const remaining = Math.max(0, testSession.endsAt - Date.now()); const mins = String(Math.floor(remaining/60000)).padStart(2,"0"); const secs = String(Math.floor((remaining%60000)/1000)).padStart(2,"0");
  return `<div class="test-header"><div><p class="eyebrow">${t("Mini-teste")} · ${t(q.subject)}</p><h1>${t("Escolhe com método.")}</h1></div><div class="timer"><small>${t("restante")}</small><span id="test-timer">${mins}:${secs}</span></div></div><div class="test-card"><div class="question-card"><div class="question-progress"><span>${testSession.index + 1} / ${testQuestions.length}</span>${progressBar(Math.round((testSession.index / testQuestions.length)*100), t("Progresso do teste"))}</div><h2>${escapeHtml(q.prompt)}</h2><div class="option-list">${q.options.map((option, i) => `<button class="option ${selected === i ? "selected" : ""}" data-option="${i}"><span class="option-letter">${String.fromCharCode(65+i)}</span>${escapeHtml(option)}</button>`).join("")}</div><div class="test-actions">${testSession.index > 0 ? `<button class="button button-ghost button-small" data-test="prev">${t("← Anterior")}</button>` : `<span></span>`}${testSession.index === testQuestions.length - 1 ? `<button class="button button-primary button-small" data-test="finish">${t("Terminar teste")}</button>` : `<button class="button button-primary button-small" data-test="next">${t("Próxima")} →</button>`}</div></div></div>`;
}
function renderTestResult() {
  const score = testSession.score; const pctScore = Math.round(score / testQuestions.length * 100); const feedback = pctScore >= 80 ? t("Base forte. Agora transforma acerto em consistência.") : pctScore >= 50 ? t("Bom começo. Revê os erros e repete as lições marcadas.") : t("Sem drama: os erros mostram exactamente onde estudar a seguir.");
  return `<div class="test-header"><div><p class="eyebrow">${t("Resultado guardado")}</p><h1>${t("Boa revisão.")}</h1></div><div class="timer"><small>${t("pontuação")}</small>${score}/${testQuestions.length}</div></div><div class="test-card"><div class="result-card"><div class="score-ring" style="--score:${pctScore}%"><strong>${pctScore}%</strong></div><h2>${feedback}</h2><p>${t("Compara cada resposta com o raciocínio. A explicação vale tanto quanto o ponto.")}</p><div class="hero-actions" style="justify-content:center"><button class="button button-lime" data-test="restart">${t("Tentar novamente")}</button><a class="button button-ghost" style="color:var(--white);border-color:#506076" href="#path">${t("Voltar à rota")}</a></div></div><div class="review-list">${testQuestions.map((q,i) => { const correct = testSession.answers[i] === q.correct; return `<div class="review-item ${correct ? "correct" : "incorrect"}"><strong>${correct ? "✓" : "×"} ${i+1}. ${escapeHtml(q.prompt)}</strong><p>${t("Resposta certa:")} <b>${escapeHtml(q.options[q.correct])}</b>. ${escapeHtml(q.explanation)}</p></div>`; }).join("")}</div></div>`;
}

function renderProfile() { const test = state.test; return `<div class="profile-card"><div class="profile-top"><div class="profile-avatar">RB</div><div><p class="eyebrow" style="color:var(--lime)">${t("Área de foco")}</p><h1>${t("Preparação para Engenharia")}</h1><p>${t("O teu progresso fica guardado neste navegador.")}</p></div></div><div class="profile-metrics"><div class="metric"><strong>${completedCount()}</strong><span>${t("lições feitas")}</span></div><div class="metric"><strong>${pct()}%</strong><span>${t("da rota")}</span></div><div class="metric"><strong>${test ? `${test.score}/${test.total || 10}` : "—"}</strong><span>${t("último teste")}</span></div></div><div class="card" style="margin-top:16px"><div class="prep-row"><div><p class="eyebrow">${t("Modo preparação")}</p><h2>${t("Tudo aberto.")}</h2><p class="muted">${t("Ligado, podes abrir qualquer lição sem completar as anteriores — ideal para revisões rápidas antes do exame.")}</p></div><button class="switch ${state.prep ? "on" : ""}" data-prep aria-pressed="${state.prep}" aria-label="${t("Modo preparação")}"><span></span></button></div></div><div class="card" style="margin-top:16px"><p class="eyebrow">${t("Preferência de estudo")}</p><h2>${t("Consistência vence pressa.")}</h2><p class="muted" style="line-height:1.7">${t("Faz uma lição por sessão, escreve as unidades e volta aos erros do mini-teste. O exame fica mais pequeno quando o método fica automático.")}</p><div class="hero-actions"><a class="button button-primary" href="#lesson/${getNextLesson().id}">${t("Continuar a estudar →")}</a><button class="button button-ghost" data-profile="reset">${t("Limpar progresso")}</button></div></div></div>`; }

async function render() {
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("hidden", el.dataset.view !== route.view));
  syncHash();
  const target = document.querySelector(`[data-view="${route.view}"]`); if (!target) return;
  const viewAtStart = route.view;
  const needsCatalog = ["home", "path", "profile", "lesson", "triangles", "atalhos"].includes(route.view) && !loadedChunks.catalog;
  const lessonKey = route.lessonId?.startsWith("p-") ? "physics" : "math";
  const needsLesson = route.view === "lesson" && !loadedChunks[lessonKey];
  const needsTest = route.view === "test" && !loadedChunks.test;
  const needsTri = route.view === "triangles" && !loadedChunks.triangles;
  const needsAtalhos = route.view === "atalhos" && !loadedChunks.atalhos;
  if (needsCatalog || needsLesson || needsTest || needsTri || needsAtalhos) target.innerHTML = loadingMarkup(t(route.view === "test" ? "A carregar o mini-teste…" : route.view === "triangles" ? "A preparar os triângulos…" : route.view === "atalhos" ? "A preparar os atalhos…" : "A preparar a tua rota…"));
  try { await ensureDataForView(); } catch (error) { target.innerHTML = `<div class="card load-error"><h2>${t("Não foi possível carregar esta parte.")}</h2><p class="muted">${t("Verifica a ligação e tenta novamente.")}</p><button class="button button-primary" data-retry>${t("Recarregar")}</button></div>`; return; }
  if (route.view !== viewAtStart) return;
  target.innerHTML = route.view === "home" ? renderHome() : route.view === "path" ? renderPath() : route.view === "lesson" ? renderLesson() : route.view === "test" ? renderTest() : route.view === "triangles" ? renderTriangles() : route.view === "atalhos" ? renderAtalhos() : renderProfile();
  if (route.view === "lesson") {
    afterLessonRender();
    drawTriFrame();
    startLessonTimer();
    if (document.fonts) document.fonts.ready.then(() => { if (route.view === "lesson") drawTriFrame(); });
  }
  if (route.view === "triangles") {
    drawTriFrame();
    syncTriDeep();
    if (document.fonts) document.fonts.ready.then(() => { if (route.view === "triangles") { drawTriFrame(); syncTriDeep(); } });
  }
  document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.dataset.nav === route.view));
  if (route.view === "test" && testSession && !testSession.finished) startTimerLoop();
}


let timerLoop;
function fmtTime(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
function timerMarkup(lesson) {
  const secs = (state.time && state.time[lesson.id]) || 0;
  return `<span class="lesson-timer${secs && secs < lesson.minutes * 60 ? " under-par" : ""}" id="lesson-timer" title="${lang() === "en" ? "Time on this lesson · par " + lesson.minutes + " min" : "Tempo nesta lição · meta " + lesson.minutes + " min"}">◷ ${fmtTime(secs)}<small>/${lesson.minutes}′</small></span>`;
}
let lessonTimer, timerTicks = 0;
function startLessonTimer() {
  clearInterval(lessonTimer);
  lessonTimer = setInterval(() => {
    if (route.view !== "lesson") { clearInterval(lessonTimer); return; }
    if (document.hidden) return;
    const lesson = lessonById(route.lessonId);
    if (!lesson || isDone(lesson.id)) return;
    state.time = state.time || {};
    const secs = (state.time[lesson.id] || 0) + 1;
    state.time[lesson.id] = secs;
    const el = document.querySelector("#lesson-timer");
    if (el) { el.innerHTML = `◷ ${fmtTime(secs)}<small>/${lesson.minutes}′</small>`; el.classList.toggle("under-par", secs < lesson.minutes * 60); }
    if (++timerTicks % 5 === 0) saveState();
  }, 1000);
}
function startTimerLoop() { clearInterval(timerLoop); timerLoop = setInterval(() => { if (!testSession || testSession.finished) return clearInterval(timerLoop); if (Date.now() >= testSession.endsAt) { finishTest(); } else { const el = document.querySelector("#test-timer"); if (el) { const r = Math.max(0, testSession.endsAt-Date.now()); el.textContent = `${String(Math.floor(r/60000)).padStart(2,"0")}:${String(Math.floor((r%60000)/1000)).padStart(2,"0")}`; } } }, 500); }
function startTest() { testSession = { index:0, answers:Array(testQuestions.length).fill(null), endsAt:Date.now()+20*60*1000, finished:false, score:0 }; render(); }
function finishTest() { if (!testSession || testSession.finished) return; testSession.score = testSession.answers.reduce((n, answer, i) => n + (answer === testQuestions[i].correct ? 1 : 0), 0); testSession.finished = true; state.test = {score:testSession.score, total:testQuestions.length, at:new Date().toISOString()}; saveState(); clearInterval(timerLoop); render(); }
function resetAll() { state = defaultState(); testSession = null; saveState(); showToast(t("Progresso limpo. A rota está pronta de novo.")); navigate("#home"); }

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
    else if (action === "prev") { state.stepsShown = Math.max(1, (state.stepsShown || 1) - 1); if (lesson.walkthrough) quadroFx = { lessonId: lesson.id, stepIndex: state.stepsShown - 1 }; }
    else if (action === "replay") { if (lesson.walkthrough) quadroFx = { lessonId: lesson.id, stepIndex: Math.max(0, (state.stepsShown || 1) - 1) }; }
    else { state.stepsShown = total; quadroFx = null; }
    saveState(); render(); return;
  }
  const gotoStep = event.target.closest("[data-step-goto]"); if (gotoStep) {
    const lesson = lessonById(route.lessonId);
    const upto = Number(gotoStep.dataset.stepGoto) + 1;
    state.stepsShown = Math.min(Math.max(upto, 1), stepCount(lesson));
    if (lesson.walkthrough) quadroFx = { lessonId: lesson.id, stepIndex: upto - 1 };
    saveState(); render(); return;
  }
  const say = event.target.closest("[data-say]"); if (say) {
    const lesson = lessonById(route.lessonId);
    const step = lesson?.walkthrough?.steps?.[Number(say.dataset.say)];
    if (!step) return;
    document.querySelectorAll(".step-voice").forEach(b => b.classList.remove("speaking"));
    say.classList.add("speaking");
    playStepAudio(audioUrl(lesson.id, say.dataset.say), step.say);
    return;
  }
  const voice = event.target.closest("[data-voice]"); if (voice) { state.voiceOff = !state.voiceOff; stopSpeaking(); saveState(); render(); return; }
  const qf = event.target.closest("[data-quadro='full']"); if (qf) { setQuadroFull(!quadroFull); return; }
  const prep = event.target.closest("[data-prep]"); if (prep) { state.prep = !state.prep; saveState(); showToast(state.prep ? t("Modo preparação ligado. Todas as lições estão abertas.") : t("Modo preparação desligado. A rota volta ao normal.")); render(); return; }
  const langBtn = event.target.closest("[data-lang]"); if (langBtn) { if (state.lang !== langBtn.dataset.lang) { state.lang = langBtn.dataset.lang; saveState(); reloadLang(); } return; }
  const filtro = event.target.closest("[data-atalho]"); if (filtro) { atalhoFiltro = filtro.dataset.atalho; render(); return; }
  const triGrip = event.target.closest("[data-tri-drag]"); if (triGrip && event.detail === 0) {
    const card = triGrip.closest(".tri-page-card");
    if (card) { const level = Number(card.dataset.triLevel) || 0; setTriLevel(card, level >= card._dets.length - 1 ? 0 : level + 1); }
    return;
  }
  const tri = event.target.closest("[data-tri]"); if (tri) {
    const card = tri.closest(".tri-card");
    const lesson = lessonById(card?.dataset.lesson || route.lessonId);
    const formulaTri = lesson?.formulaTri;
    if (!formulaTri || !card) return;
    const result = card.querySelector(".tri-result");
    const was = tri.classList.contains("covered");
    card.querySelectorAll(".tri-cell").forEach(c => { c.classList.remove("covered"); c.setAttribute("aria-pressed", "false"); });
    if (was) { result.innerHTML = ""; stopSpeaking(); return; }
    tri.classList.add("covered");
    tri.setAttribute("aria-pressed", "true");
    const { line, say } = triExchange(formulaTri, tri.dataset.tri);
    result.innerHTML = `<span class="tri-eq">${inlineWrite(line)}</span>`;
    playStepAudio(audioUrl(lesson.id, "tri", tri.dataset.tri), say);
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
        if (!value.trim()) { showToast(t("Escreve a tua resposta primeiro.")); return; }
        results[qi] = { ...res, value, checked: true, correct: answersMatch(value, item.answer) };
      } else if (action === "hint") results[qi] = { ...res, hintShown: true };
      else if (action === "reveal") results[qi] = { ...res, revealed: true };
      state.practice[lesson.id] = { ...saved, results, qi: action === "next" ? Math.min(qi + 1, total - 1) : action === "prev" ? Math.max(qi - 1, 0) : action === "goto" ? Math.min(Math.max(Number(practice.dataset.qi) || 0, 0), total - 1) : qi };
      saveState(); render(); return;
    }
    const levelData = saved.level === "medium" && lesson.medium ? lesson.medium : lesson;
    state.practice[lesson.id] = {...saved};
    if (practice.dataset.practice === "hint") state.practice[lesson.id].hintShown = true;
    if (practice.dataset.practice === "reveal") state.practice[lesson.id].revealed = true;
    if (practice.dataset.practice === "check") { const value = saved.mode === "mc" ? (saved.selected || "") : (document.querySelector("#practice-answer")?.value || ""); const correct = answersMatch(value, levelData.answer); state.practice[lesson.id].correct = correct; state.practice[lesson.id].feedback = correct ? t("Deu bom, demais. Resposta certa — agora relê o quadro para fixar o método.") : t("Calma, sem drama. Vê a pista ou revela a resposta e reescreve os passos."); }
    saveState(); render(); return;
  }
  const complete = event.target.closest("[data-complete]"); if (complete) { const id = route.lessonId; if (complete.checked && !isDone(id)) state.completed.push(id); if (!complete.checked) state.completed = state.completed.filter(x => x !== id); saveState(); showToast(t(complete.checked ? "Lição concluída. Mais um nó na rota." : "Lição reaberta para revisão.")); render(); return; }
  const test = event.target.closest("[data-test]"); if (test) { const action=test.dataset.test; if (action === "start") startTest(); if (action === "next") { testSession.index = Math.min(testSession.index + 1, testQuestions.length-1); render(); } if (action === "prev") { testSession.index = Math.max(testSession.index - 1, 0); render(); } if (action === "finish") finishTest(); if (action === "restart") startTest(); return; }
  const option = event.target.closest("[data-option]"); if (option && testSession) { testSession.answers[testSession.index] = Number(option.dataset.option); render(); return; }
  const profile = event.target.closest("[data-profile]"); if (profile?.dataset.profile === "reset") resetAll();
  if (event.target.closest("#reset-progress")) resetAll();
});
window.addEventListener("hashchange", () => navigate(location.hash));
document.addEventListener("keydown", event => { if (event.key === "Escape" && quadroFull) setQuadroFull(false); });
applyStaticLang();
navigate(location.hash || "#home");
