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

function defaultState() { return { completed: [], practice: {}, test: null }; }
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
function showToast(message) { const el = document.querySelector("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }
function navigate(hash) { const parts = hash.replace(/^#/, "").split("/"); route.view = parts[0] || "home"; if (route.view === "lesson") route.lessonId = parts[1] || getNextLesson().id; if (route.view === "path") route.subject = parts[1] || route.subject; render(); window.scrollTo({top:0, behavior:"smooth"}); }
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

function renderLesson() {
  const lesson = lessonById(route.lessonId) || getNextLesson(); const key = lesson.id.startsWith("m-") ? "math" : "physics"; const subject = subjects[key]; const index = subject.lessons.findIndex(l => l.id === lesson.id); const next = subject.lessons[index + 1] || allLessons().find(l => !isDone(l.id) && l.id !== lesson.id); const practice = state.practice[lesson.id];
  const shownSteps = lesson.id === state.activeLesson && state.stepsShown ? state.stepsShown : 0;
  if (!state.activeLesson || state.activeLesson !== lesson.id) { state.activeLesson = lesson.id; state.stepsShown = 0; saveState(); }
  const actualShown = state.stepsShown || 0;
  return `<div class="lesson-head"><button class="back-button" data-back="path/${key}" aria-label="Voltar à rota">←</button><div><p class="eyebrow">${subject.label} · lição ${index + 1} de ${subject.lessons.length}</p><h1>${escapeHtml(lesson.title)}</h1><p class="lead">${escapeHtml(lesson.short)}</p></div></div><div class="lesson-layout"><div class="lesson-main">
    <article class="card concept-card"><p class="eyebrow" style="color:var(--lime)">Ideia-chave</p><h2>${escapeHtml(lesson.concept.split(".")[0])}.</h2><p>${escapeHtml(lesson.concept)}</p><div class="formula">${escapeHtml(lesson.formula)}</div></article>
    <article class="card"><div class="example-label"><div><p class="eyebrow">Exemplo guiado</p><h2>${escapeHtml(lesson.example)}</h2></div><span class="tag">passo a passo</span></div><div class="step-list">${lesson.steps.map((step, i) => `<div class="step ${i < actualShown ? "" : "hidden-step"}"><span class="step-number">${i+1}</span><p>${escapeHtml(step)}</p></div>`).join("")}</div><div class="solution-controls">${actualShown < lesson.steps.length ? `<button class="button button-lime button-small" data-step="next">Mostrar passo ${actualShown + 1}</button>` : `<span class="tag done">Solução completa ✓</span>`}${actualShown > 0 && actualShown < lesson.steps.length ? `<button class="button button-ghost button-small" data-step="all">Ver tudo</button>` : ""}</div></article>
    <article class="card practice-card"><p class="eyebrow">Agora tu</p><h2>Prática rápida</h2><p class="question-line">${escapeHtml(lesson.practice)}</p><div class="answer-row"><input id="practice-answer" value="" placeholder="Escreve a resposta" aria-label="A tua resposta" /><button class="button button-primary button-small" data-practice="check">Verificar</button></div><div class="solution-controls"><button class="button button-ghost button-small" data-practice="hint">Dar uma pista</button><button class="button button-ghost button-small" data-practice="reveal">Mostrar resposta</button></div>${practice?.feedback ? `<div class="practice-feedback ${practice.correct ? "good" : "try"}">${practice.feedback}</div>` : ""}${practice?.hintShown ? `<div class="practice-feedback">Pista: ${escapeHtml(lesson.hint)}</div>` : ""}${practice?.revealed ? `<div class="practice-feedback good"><strong>Resposta: ${escapeHtml(lesson.answer)}</strong><br>${escapeHtml(lesson.explanation)}</div>` : ""}</article>
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
  document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.dataset.nav === route.view));
  if (route.view === "test" && testSession && !testSession.finished) startTimerLoop();
}


let timerLoop;
function startTimerLoop() { clearInterval(timerLoop); timerLoop = setInterval(() => { if (!testSession || testSession.finished) return clearInterval(timerLoop); if (Date.now() >= testSession.endsAt) { finishTest(); } else { const el = document.querySelector("#test-timer"); if (el) { const r = Math.max(0, testSession.endsAt-Date.now()); el.textContent = `${String(Math.floor(r/60000)).padStart(2,"0")}:${String(Math.floor((r%60000)/1000)).padStart(2,"0")}`; } } }, 500); }
function startTest() { testSession = { index:0, answers:Array(testQuestions.length).fill(null), endsAt:Date.now()+20*60*1000, finished:false, score:0 }; render(); }
function finishTest() { if (!testSession || testSession.finished) return; testSession.score = testSession.answers.reduce((n, answer, i) => n + (answer === testQuestions[i].correct ? 1 : 0), 0); testSession.finished = true; state.test = {score:testSession.score, at:new Date().toISOString()}; saveState(); clearInterval(timerLoop); render(); }
function resetAll() { state = defaultState(); testSession = null; saveState(); showToast("Progresso limpo. A rota está pronta de novo."); navigate("#home"); }

document.addEventListener("click", event => {
  if (event.target.closest("[data-retry]")) { loadedChunks.catalog = false; render(); return; }
  const subject = event.target.closest("[data-subject]"); if (subject) { route.subject = subject.dataset.subject; render(); return; }
  const back = event.target.closest("[data-back]"); if (back) { navigate("#"+back.dataset.back); return; }
  const step = event.target.closest("[data-step]"); if (step) { if (step.dataset.step === "next") state.stepsShown = Math.min((state.stepsShown || 0) + 1, lessonById(route.lessonId).steps.length); else state.stepsShown = lessonById(route.lessonId).steps.length; saveState(); render(); return; }
  const practice = event.target.closest("[data-practice]"); if (practice) { const lesson = lessonById(route.lessonId); state.practice[lesson.id] = {...(state.practice[lesson.id] || {})}; if (practice.dataset.practice === "hint") state.practice[lesson.id].hintShown = true; if (practice.dataset.practice === "reveal") state.practice[lesson.id].revealed = true; if (practice.dataset.practice === "check") { const value = (document.querySelector("#practice-answer")?.value || "").trim().toLowerCase(); const answer = lesson.answer.toLowerCase(); const correct = value === answer || value.replace(",", ".") === answer.replace(",", "."); state.practice[lesson.id].correct = correct; state.practice[lesson.id].feedback = correct ? "Boa. A resposta está certa — agora lê a sequência para fixar o método." : "Ainda não. Repara na pista ou revela a resposta e tenta reescrever os passos."; } saveState(); render(); return; }
  const complete = event.target.closest("[data-complete]"); if (complete) { const id = route.lessonId; if (complete.checked && !isDone(id)) state.completed.push(id); if (!complete.checked) state.completed = state.completed.filter(x => x !== id); saveState(); showToast(complete.checked ? "Lição concluída. Mais um nó na rota." : "Lição reaberta para revisão."); render(); return; }
  const test = event.target.closest("[data-test]"); if (test) { const action=test.dataset.test; if (action === "start") startTest(); if (action === "next") { testSession.index = Math.min(testSession.index + 1, testQuestions.length-1); render(); } if (action === "prev") { testSession.index = Math.max(testSession.index - 1, 0); render(); } if (action === "finish") finishTest(); if (action === "restart") startTest(); return; }
  const option = event.target.closest("[data-option]"); if (option && testSession) { testSession.answers[testSession.index] = Number(option.dataset.option); render(); return; }
  const profile = event.target.closest("[data-profile]"); if (profile?.dataset.profile === "reset") resetAll();
  if (event.target.closest("#reset-progress")) resetAll();
});
window.addEventListener("hashchange", () => navigate(location.hash));
navigate(location.hash || "#home");
