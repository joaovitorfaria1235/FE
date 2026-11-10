
const $ = (s) => document.querySelector(s);

const KEY = "quizEventoV1";

/* Tempo fixo por pergunta (segundos). */
const TIME = 30;

/* Pontos por rapidez: até 10s = 3, até 20s = 2, até 30s = 1. */
const pointsFor = (elapsed) => (elapsed <= 10 ? 3 : elapsed <= 20 ? 2 : 1);
const makeMatchId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }));

/*
 * Categorias disponíveis.
 */
const CATS = [
  "História",
  "Geografia",
  "Brasil",
  "Ciências",
  "Biologia",
  "Matemática",
  "Português",
  "Literatura",
  "Tecnologia",
  "Informática",
  "Cultura Geral",
  "Esportes",
  "Artes",
  "Meio Ambiente",
  "Curiosidades"
];

/*
 * Séries dos alunos.
 */
const GRADES = [
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
  "1º ano (EM)",
  "2º ano (EM)",
  "3º ano (EM)"
];

/*
 * Banco de perguntas de cada série: o sorteio só acontece dentro dele.
 * As três séries do Ensino Médio compartilham o banco do Ensino Médio.
 */
const SERIES_LEVELS = {
  "6º ano": ["6ano"],
  "7º ano": ["7ano"],
  "8º ano": ["8ano", "moderada"],
  "9º ano": ["9ano"],
  "1º ano (EM)": ["em", "avancada"],
  "2º ano (EM)": ["em", "avancada"],
  "3º ano (EM)": ["em", "avancada"]
};

const gradeOptions = (first) =>
  `<option value="">${first}</option>` +
  GRADES.map((g) => `<option value="${g}">${g}</option>`).join("");

/*
 * Estado salvo no navegador.
 */
/*
 * Cópia de segurança somente leitura dos dados existentes.
 * A chave original e o formato do ranking permanecem inalterados.
 */
const BACKUP_KEY = `${KEY}.backup-premium`;
const storedState = localStorage.getItem(KEY);
if (storedState && !localStorage.getItem(BACKUP_KEY)) {
  try {
    localStorage.setItem(BACKUP_KEY, storedState);
  } catch (error) {
    console.error("Não foi possível criar a cópia de segurança local:", error);
  }
}

let S = (() => {
  if (!storedState) return { participants: [], match: null };
  try {
    const parsed = JSON.parse(storedState);
    if (!parsed || !Array.isArray(parsed.participants)) {
      throw new Error("Formato de dados inesperado.");
    }
    if (!Object.prototype.hasOwnProperty.call(parsed, "match")) parsed.match = null;
    return parsed;
  } catch (error) {
    console.error("Os dados salvos não puderam ser lidos. O conteúdo original foi preservado.", error);
    return { participants: [], match: null };
  }
})();

window.FEQuizSetParticipants = (participants) => {
  /* Mantém o participante da partida em andamento (ainda não está no banco). */
  const current = S.match ? S.participants.find((p) => p.id === S.match.a) : null;
  S.participants = current && !participants.some((p) => p.id === current.id) ? participants.concat(current) : participants;
  save(); if (document.getElementById("rank")?.classList.contains("active")) renderRank(); };

/*
 * Salvar estado.
 */
const save = () => {
  localStorage.setItem(KEY, JSON.stringify(S));
};

/*
 * Escapar texto para evitar problemas no HTML.
 */
const esc = (t) =>
  String(t).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));

/*
 * Encontrar participante pelo ID.
 */
const P = (id) =>
  S.participants.find((p) => p.id === id);

/*
 * =========================
 * NAVEGAÇÃO ENTRE TELAS
 * =========================
 */

/* ===== Cronômetro por pergunta ===== */
let tmrId = null;
let tmrFor = null;

function stopTimer() {
  clearInterval(tmrId);
  tmrId = null;
  tmrFor = null;

  const el = $("#timer");

  if (el) el.hidden = true;
}

function startTimer(m) {
  const el = $("#timer");

  if (!el) return;

  if (m.revealed) {
    stopTimer();
    return;
  }

  /* Início da pergunta (salvo, para o refresh não "reiniciar" o tempo). */
  if (!m.t0) {
    m.t0 = Date.now();
    save();
  }

  const left = () =>
    Math.min(TIME, Math.ceil(TIME - (Date.now() - m.t0) / 1000));

  const paint = () => {
    const t = Math.max(0, left());
    el.hidden = false;
    el.textContent = "⏱ " + t + "s";
    el.classList.toggle("warn", t <= 5);
  };

  /* Já passou do tempo (ex.: voltou depois de um refresh). */
  if (left() <= 0) {
    stopTimer();
    timeUp(m);
    renderQuiz();
    return;
  }

  const key = m.a + "|" + m.idx;

  /* Já está rodando para esta pergunta. */
  if (tmrFor === key && tmrId) {
    paint();
    return;
  }

  stopTimer();

  tmrFor = key;

  paint();

  tmrId = setInterval(() => {
    if (left() > 0) {
      paint();
      return;
    }

    stopTimer();

    const cur = S.match;

    if (cur && !cur.revealed && cur.idx < cur.queue.length) {
      timeUp(cur);
      renderQuiz();
    }
  }, 500);
}

/* Tempo esgotado: conta como erro e revela a resposta. */
function timeUp(m) {
  m.revealed = true;
  m.choice = -1;
  m.got = false;
  m.gain = 0;

  if (!Array.isArray(m.res)) m.res = [];

  m.res[m.idx] = false;

  save();
}

/* ===== Estatísticas da partida ===== */
function calc(m) {
  let hits = 0, miss = 0, run = 0, best = 0;

  for (let i = 0; i < m.queue.length; i++) {
    const v = m.res ? m.res[i] : null;

    if (v === true) {
      hits++;
      run++;
      best = Math.max(best, run);
    } else if (v === false) {
      miss++;
      run = 0;
    } else if (i < m.idx) {
      run = 0;
    }
  }

  return { hits, miss, streak: run, best };
}

function updateContinue() {
  const b = $("#btnContinue");

  if (b) {
    b.hidden = !(S.match && S.match.idx < S.match.queue.length);
  }
}

/* Partida em andamento = não pode sair. */
function inProgress() {
  return !!(S.match && S.match.idx < S.match.queue.length);
}

function show(id) {
  if (inProgress() && id !== "quiz") id = "quiz";

  document
    .querySelectorAll(".screen")
    .forEach((e) => e.classList.remove("active"));

  const screen = $("#" + id);

  if (!screen) {
    console.error("Tela não encontrada:", id);
    return;
  }

  screen.classList.add("active");

  if (id === "home") updateContinue();
  if (id === "setup") renderSetup();
  if (id === "rank") renderRank();
  if (id === "result") renderResult();
  if (id === "quiz") renderQuiz();

  if (id !== "quiz") stopTimer();

  const nav = $(".nav");

  if (nav) nav.hidden = inProgress();

  document
    .querySelectorAll(".nav button")
    .forEach((b) => b.classList.toggle("on", b.dataset.go === id));

  window.scrollTo(0, 0);
}

/*
 * =========================
 * EMBARALHAR
 * =========================
 */

function shuffle(a) {
  const arr = a.slice();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/*
 * Garante uma permutação válida para cada pergunta.
 * Também mantém compatibilidade com partidas salvas antes desta atualização.
 */
function ensureOptionOrders(m) {
  let changed = false;

  if (!Array.isArray(m.optionOrders)) {
    m.optionOrders = [];
    changed = true;
  }

  for (let i = 0; i < m.queue.length; i++) {
    const order = m.optionOrders[i];
    const valid =
      Array.isArray(order) &&
      order.length === 4 &&
      order.every((value) => Number.isInteger(value) && value >= 0 && value <= 3) &&
      new Set(order).size === 4;

    if (!valid) {
      m.optionOrders[i] = shuffle([0, 1, 2, 3]);
      changed = true;
    }
  }

  /* Persiste apenas quando migra uma partida antiga ou corrige dados inválidos. */
  if (changed) save();

  return m.optionOrders[m.idx] || [0, 1, 2, 3];
}

/*
 * =========================
 * PARTICIPANTES
 * =========================
 */

function findOrCreate(name, grade) {
  name = name.trim();
  grade = grade || "";

  /* Mesmo nome em séries diferentes = alunos diferentes. */
  let p = S.participants.find(
    (x) =>
      x.name.toLowerCase() === name.toLowerCase() &&
      (x.grade || "") === grade
  );

  if (!p) {
    let id;
    do {
      id = Date.now() + Math.floor(Math.random() * 100000);
    } while (P(id));

    p = { id, name, grade, points: 0 };
    S.participants.push(p);
  }

  return p;
}

/*
 * Adicionar/remover pontos.
 */
function adj(pid, d) {
  const p = P(pid);

  if (!p) return 0;

  const before = p.points;

  p.points = Math.max(0, p.points + d);

  const real = p.points - before;

  const m = S.match;

  /* Atualiza também o placar da partida. */
  if (m && pid === m.a) {
    m.sa = Math.max(0, m.sa + real);
  }

  save();

  return real;
}

/*
 * =========================
 * CONFIGURAÇÃO
 * =========================
 */

function balancedQuestionSet(total = 30, grade = "") {
  if (!Array.isArray(questions)) return [];

  // Defesa extra: não deixa registros incompletos entrarem em uma partida.
  const niveis = SERIES_LEVELS[grade];
  if (!niveis) throw new Error("Série inválida: " + grade);
  const valid = questions.filter((q) =>
    q &&
    niveis.includes(q.nivel) &&
    CATS.includes(q.categoria) &&
    typeof q.pergunta === "string" &&
    q.pergunta.trim() &&
    Array.isArray(q.alternativas) &&
    q.alternativas.length === 4 &&
    q.alternativas.every((a) => typeof a === "string" && a.trim()) &&
    new Set(q.alternativas.map((a) => a.trim().toLocaleLowerCase("pt-BR"))).size === 4 &&
    Number.isInteger(q.resposta) &&
    q.resposta >= 0 &&
    q.resposta <= 3
  );

  const perCategory = Math.floor(total / CATS.length);
  const remainder = total % CATS.length;
  const selected = [];
  const categories = shuffle(CATS);

  categories.forEach((category, index) => {
    const needed = perCategory + (index < remainder ? 1 : 0);
    const pool = shuffle(valid.filter((q) => q.categoria === category));
    if (pool.length < needed) {
      throw new Error(`A categoria ${category} possui apenas ${pool.length} perguntas válidas; são necessárias ${needed}.`);
    }
    selected.push(...pool.slice(0, needed));
  });

  return shuffle(selected);
}

function renderSetup() {
  /* Lista de participantes (autocompletar). */
  const plist = $("#plist");

  if (plist) {
    plist.innerHTML = S.participants
      .map((p) => `<option value="${esc(p.name)}">`)
      .join("");
  }

  /* A partida sempre inclui todas as categorias. */
  const categoryInfo = $("#categoryInfo");
  if (categoryInfo) categoryInfo.textContent = `30 perguntas · 2 de cada uma das ${CATS.length} categorias · nível adaptado à série`;

  /* Série. */
  const gr = $("#grade");

  if (gr && !gr.options.length) {
    gr.innerHTML = gradeOptions("Selecione a série");
  }


  const err = $("#setupErr");

  if (err) err.textContent = "";
}

/*
 * =========================
 * INICIAR PARTIDA
 * =========================
 */

let starting = false;

async function startMatch() {
  if (starting) return;
  starting = true;
  try {
    await startMatchChecked();
  } finally {
    starting = false;
  }
}

async function startMatchChecked() {
  const n1 = $("#n1")?.value.trim() || "";

  if (!n1) {
    $("#setupErr").textContent = "Informe o nome do participante.";
    return;
  }

  const grade = $("#grade")?.value || "";

  if (!grade) {
    $("#setupErr").textContent = "Selecione a série do participante.";
    return;
  }

  // A regra de uma única partida é validada no Supabase antes de iniciar.
  // Sem a verificação online, não é possível garantir que o participante não jogou em outro dispositivo.
  try {
    if (!window.FEQuizCloud?.enabled || typeof window.FEQuizCloud.canPlay !== "function") {
      throw new Error("Não foi possível verificar a participação. Conecte o FE QUIZ ao ranking online e tente novamente.");
    }
    await window.FEQuizCloud.ready;
    const canPlay = await window.FEQuizCloud.canPlay(n1, grade);
    if (!canPlay) {
      $("#setupErr").textContent = "Você já participou! Cada aluno pode jogar apenas uma vez.";
      return;
    }
  } catch (error) {
    console.error("Falha ao verificar participação:", error);
    $("#setupErr").textContent = error.message || "Não foi possível verificar se este participante já jogou. Tente novamente.";
    return;
  }

  if (typeof questions === "undefined" || !Array.isArray(questions)) {
    $("#setupErr").textContent = "O banco de perguntas não foi carregado.";
    console.error("questions.js não foi carregado corretamente.");
    return;
  }

  // Acrescenta ao banco em memória as perguntas publicadas pelo administrador no Supabase.
  try {
    if (window.FEQuizSupabase) {
      const { data: remoteQuestions, error: remoteError } = await window.FEQuizSupabase
        .from("fequiz_questions").select("id,grade,category,prompt,alternatives,correct_answer,explanation").eq("grade", grade);
      if (remoteError) throw remoteError;
      if (Array.isArray(remoteQuestions)) {
        for (let i = questions.length - 1; i >= 0; i--) {
          if (String(questions[i].id).startsWith("fequiz-online-")) questions.splice(i, 1);
        }
        const level = SERIES_LEVELS[grade][0];
        remoteQuestions.forEach(q => {
          if (CATS.includes(q.category) && Array.isArray(q.alternatives) && q.alternatives.length === 4) {
            questions.push({ id: `fequiz-online-${q.id}`, nivel: level, categoria: q.category, pergunta: q.prompt, alternativas: q.alternatives, resposta: Number(q.correct_answer), explicacao: q.explanation || "" });
          }
        });
      }
    }
  } catch (error) {
    console.error("Não foi possível carregar perguntas online; será usado o banco local.", error);
  }

  let selectedQuestions;
  try {
    selectedQuestions = balancedQuestionSet(30, grade);
  } catch (error) {
    $("#setupErr").textContent = error.message || "Não foi possível montar 30 perguntas adequadas à série selecionada.";
    return;
  }

  if (selectedQuestions.length !== 30 || new Set(selectedQuestions.map((q) => q.id)).size !== 30) {
    $("#setupErr").textContent = "Não foi possível garantir 30 perguntas diferentes. Verifique o banco de perguntas.";
    return;
  }

  const a = findOrCreate(n1, grade);

  S.match = {
    matchId: makeMatchId(),
    a: a.id,
    pname: a.name,
    pgrade: a.grade,
    sa: 0,
    cat: "Todas",
    queue: selectedQuestions.map((q) => q.id),

    /* Ordem visual das alternativas por pergunta (índices do banco original).
       É salva junto da partida para não mudar ao atualizar ou reabrir o quiz. */
    optionOrders: selectedQuestions.map(() => shuffle([0, 1, 2, 3])),

    idx: 0,
    revealed: false,

    /* null = ainda não marcado, true = acertou, false = errou */
    got: null,

    /* alternativa escolhida (índice), -1 = tempo esgotado */
    choice: null,

    /* resultado de cada pergunta (por índice) */
    res: [],

    /* segundos por pergunta (0 = sem limite) */
    timer: TIME,

    /* quando a pergunta atual começou */
    t0: Date.now(),
    startedAt: Date.now(),

    /* pontos ganhos na pergunta atual */
    gain: 0
  };

  save();

  show("quiz");
}

/*
 * =========================
 * QUIZ
 * =========================
 */

function renderQuiz() {
  const m = S.match;

  if (!m) {
    show("setup");
    return;
  }

  let pa = P(m.a);

  /* Recria o participante local se o ranking online o tiver substituído durante a partida. */
  if (!pa && m.pname && m.pgrade) {
    pa = findOrCreate(m.pname, m.pgrade);
    m.a = pa.id;
    save();
  }

  if (!pa) {
    S.match = null;
    save();
    show("setup");
    return;
  }

  /* Placar. */
  $("#pl1").innerHTML = `
    <small>PARTICIPANTE</small>
    <div class="nm">${esc(pa.name)}</div>
    ${pa.grade ? `<span class="gr">${esc(pa.grade)}</span>` : ""}
    <div class="pt">${m.sa}</div>
  `;

  $("#turn").textContent = `JOGANDO: ${pa.name.toUpperCase()}`;

  const st = calc(m);

  $("#stats").innerHTML =
    `<span>✅ ${st.hits}</span><span>❌ ${st.miss}</span>` +
    (st.streak >= 2
      ? `<span class="fire">🔥 sequência ${st.streak}</span>`
      : "");

  const total = m.queue.length;

  const ended = m.idx >= total;

  $("#endBox").hidden = !ended;

  if ($(".nav")) $(".nav").hidden = !ended;

  const progress = total > 0 ? Math.round((m.idx / total) * 100) : 0;

  $("#barFill").style.width = Math.min(100, progress) + "%";
  const progressBar = $(".bar");
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(m.idx));

  /* ===== PARTIDA TERMINADA ===== */

  if (ended) {
    stopTimer();

    $("#turn").textContent = "PARTIDA FINALIZADA";

    $("#qnum").textContent = `${total} DE ${total} PERGUNTAS CONCLUÍDAS`;

    $("#qcat").textContent = "";

    $("#qtext").textContent = "Fim das perguntas desta partida!";

    $("#opts").innerHTML = "";

    $("#after").hidden = true;

    $("#hint").hidden = true;

    const pct = total ? Math.round((st.hits / total) * 100) : 0;

    $("#endSummary").textContent =
      `${pct >= 80 ? "Excelente! " : pct >= 50 ? "Muito bem! " : "Continue praticando! "}` +
      `${pa.name}${pa.grade ? " (" + pa.grade + ")" : ""} fez ${m.sa} pontos · ${st.hits} de ${total} acertos (${pct}%)` +
      (st.best >= 2 ? ` · melhor sequência: ${st.best}` : "") +
      `. Resultado enviado para o ranking online.`;

    return;
  }

  /* ===== PERGUNTA ATUAL ===== */

  const q = questions.find((x) => x.id === m.queue[m.idx]);

  /* Segurança caso a pergunta não exista: pula. */
  if (!q) {
    console.error("Pergunta não encontrada:", m.queue[m.idx]);
    next(true);
    return;
  }

  const left = total - m.idx - 1;

  /* A ordem é fixa durante esta pergunta e fica salva na partida. */
  const optionOrder = ensureOptionOrders(m);

  $("#qnum").textContent =
    `PERGUNTA ${String(m.idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")} · ${left} restantes`;

  $("#btnNext").textContent =
    left === 0 ? "FINALIZAR PARTIDA ✓" : "PRÓXIMA PERGUNTA →";

  $("#qcat").textContent = q.categoria;

  $("#qtext").textContent = q.pergunta;

  $("#opts").innerHTML = optionOrder
    .map((originalIndex, displayIndex) => {
      const t = q.alternativas[originalIndex];
      const correctDisplayIndex = optionOrder.indexOf(q.resposta);
      let cls = "opt";

      if (m.revealed) {
        if (displayIndex === correctDisplayIndex) cls += " right";
        else if (displayIndex === m.choice) cls += " wrong";
        else cls += " dim";

        if (displayIndex === m.choice) cls += " picked";
      }

      return `
        <button type="button" class="${cls}" data-i="${displayIndex}"${m.revealed ? " disabled" : ""}>
          <b>${"ABCD"[displayIndex]})</b>
          ${esc(t)}
        </button>
      `;
    })
    .join("");

  $("#hint").hidden = m.revealed;

  $("#after").hidden = !m.revealed;

  const correctDisplayIndex = optionOrder.indexOf(q.resposta);
  $("#right").textContent =
    `${"ABCD"[correctDisplayIndex]}) ${q.alternativas[q.resposta]}`;

  const learnMore = $("#learnMore");
  if (learnMore) {
    learnMore.textContent = q.explicacao ||
      `A resposta correta é "${q.alternativas[q.resposta]}". Tente explicar com suas próprias palavras por que ela responde ao enunciado.`;
  }

  startTimer(m);

  const fb = $("#feedback");

  if (fb) {
    fb.className = m.got ? "good" : "bad";

    fb.textContent = m.got
      ? `✅ ACERTOU! +${m.gain || 1} ponto${(m.gain || 1) > 1 ? "s" : ""}`
      : m.choice === -1
        ? "⏰ TEMPO ESGOTADO"
        : "❌ ERROU";
  }

  const nb = $("#btnNext");

  nb.hidden = false;

  nb.disabled = !m.revealed;
}

/*
 * =========================
 * ATRIBUIR PONTO
 * =========================
 */

function answer(i) {
  const m = S.match;

  if (!m || m.revealed || m.idx >= m.queue.length) return;

  const q = questions.find((x) => x.id === m.queue[m.idx]);

  if (!q) return;

  stopTimer();

  const elapsed = (Date.now() - (m.t0 || Date.now())) / 1000;

  /* Clicou depois do tempo: conta como tempo esgotado. */
  if (elapsed >= TIME) {
    timeUp(m);
    renderQuiz();
    return;
  }

  const optionOrder = ensureOptionOrders(m);
  const originalAnswerIndex = optionOrder[i];

  if (!Number.isInteger(originalAnswerIndex) || originalAnswerIndex < 0 || originalAnswerIndex > 3) {
    console.error("Índice de alternativa inválido:", i, optionOrder);
    return;
  }

  const ok = originalAnswerIndex === q.resposta;

  /* choice guarda a posição exibida (A/B/C/D), usada na correção visual. */
  m.choice = i;

  m.revealed = true;

  m.got = ok;

  m.gain = ok ? pointsFor(elapsed) : 0;

  if (!Array.isArray(m.res)) m.res = [];

  m.res[m.idx] = ok;

  if (ok) adj(m.a, m.gain);

  save();

  renderQuiz();
}

/*
 * =========================
 * CORRIGIR PONTO
 * =========================
 */



/*
 * =========================
 * PRÓXIMA PERGUNTA
 * =========================
 */

function next(force) {
  const m = S.match;

  if (!m) return;

  if (m.idx >= m.queue.length) {
    renderQuiz();
    return;
  }

  /* Só avança depois de responder. */
  if (!force && !m.revealed) return;

  m.idx++;

  m.revealed = false;

  m.got = null;

  m.choice = null;

  m.gain = 0;

  m.t0 = Date.now();

  save();

  renderQuiz();
  if (m.idx >= m.queue.length) syncCompletedMatch(m);
}

async function syncCompletedMatch(m) {
  if (!m || m.submitted || m.submitting || !window.FEQuizCloud?.enabled) return;
  m.submitting = true;
  const participant = P(m.a);
  if (!participant) { m.submitting = false; return; }
  const stats = calc(m);
  const started = Number(m.startedAt || Date.now());
  const result = await window.FEQuizCloud.submit({
    matchId: m.matchId || (m.matchId = makeMatchId()),
    name: participant.name, grade: participant.grade, points: Number(m.sa || 0),
    hits: stats.hits, misses: stats.miss,
    durationSeconds: Math.max(0, Math.round((Date.now() - started) / 1000))
  });
  m.submitting = false;
  if (result) { m.submitted = true; save(); }
}

/*
 * =========================
 * RANKING
 * =========================
 */

function renderRank() {
  const body = $("#rankBody");

  if (!body) return;

  /* Filtro por série. */
  const f = $("#rankFilter");

  if (f && !f.options.length) {
    f.innerHTML = gradeOptions("Todas as séries");
    f.onchange = renderRank;
  }

  const sel = f ? f.value : "";

  const list = S.participants
    .filter((p) => !sel || p.grade === sel)
    .sort(
      (x, y) =>
        y.points - x.points ||
        x.name.localeCompare(y.name)
    );

  body.innerHTML = list.length
    ? list
        .map(
          (p, i) => `
            <tr class="${i < 3 ? `rank-top rank-${i + 1}` : ""}">
              <td class="pos"><span class="rank-position">${i + 1}º</span></td>

              <td class="nm">${esc(p.name)}</td>

              <td>${p.grade ? `<span class="grade">${esc(p.grade)}</span>` : "—"}</td>

              <td>${p.points}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="4">Nenhum participante cadastrado.</td></tr>`;
}

/*
 * =========================
 * RESULTADO
 * =========================
 */

function renderResult() {
  const max = Math.max(0, ...S.participants.map((p) => p.points));

  const tops = S.participants.filter((p) => p.points === max && max > 0);

  if ($("#winName")) {
    $("#winName").textContent = tops.length
      ? tops
          .map((p) => p.name + (p.grade ? ` (${p.grade})` : ""))
          .join(" & ")
      : "Ainda sem pontuação";
  }

  if ($("#winPts")) $("#winPts").textContent = max;

  const latest = S.match;
  const latestBox = $("#latestMatch");
  if (latestBox) {
    if (latest && latest.idx >= latest.queue.length) {
      const participant = P(latest.a);
      const stats = calc(latest);
      const total = latest.queue.length;
      const percent = total ? Math.round((stats.hits / total) * 100) : 0;
      latestBox.hidden = false;
      $("#latestName").textContent = participant ? `${participant.name}${participant.grade ? ` · ${participant.grade}` : ""}` : "Participante";
      $("#latestPoints").textContent = `${latest.sa} pontos`;
      $("#latestHits").textContent = `${stats.hits} acertos`;
      $("#latestMisses").textContent = `${stats.miss} erros`;
      $("#latestPercent").textContent = `${percent}% de aproveitamento`;
    } else {
      latestBox.hidden = true;
    }
  }

  /* Líder de cada série. */
  const box = $("#byGrade");

  if (box) {
    const rows = GRADES.map((g) => {
      const ps = S.participants.filter((p) => p.grade === g);

      const top = Math.max(0, ...ps.map((p) => p.points));

      const leaders = ps.filter((p) => p.points === top && top > 0);

      return leaders.length
        ? `<div><span><span class="grade">${esc(g)}</span> ${leaders
            .map((p) => esc(p.name))
            .join(" & ")}</span><b>${top} pts</b></div>`
        : "";
    }).join("");

    box.innerHTML = rows || '<p class="muted">Ainda sem pontuação por série.</p>';
  }
}

/*
 * =========================
 * EVENTOS
 * =========================
 */

document
  .querySelectorAll("[data-go]")
  .forEach((b) => {
    b.onclick = () =>
      show(b.dataset.go);
  });

/*
 * Botão iniciar.
 */
if ($("#btnStart")) {
  $("#btnStart").onclick = () =>
    show("setup");
}

/*
 * Continuar partida.
 */
if ($("#btnContinue")) {
  $("#btnContinue").onclick = () =>
    show("quiz");
}

/*
 * Nome já cadastrado (e único): preenche a série sozinho.
 */
if ($("#n1")) {
  $("#n1").addEventListener("input", (e) => {
    const nm = e.target.value.trim().toLowerCase();

    const hits = S.participants.filter(
      (p) => p.name.toLowerCase() === nm && p.grade
    );

    if (hits.length === 1 && $("#grade")) {
      $("#grade").value = hits[0].grade;
    }
  });
}

/*
 * Começar partida.
 */
if ($("#btnGo")) {
  $("#btnGo").onclick =
    startMatch;
}

/*
 * Clique em uma alternativa.
 */
if ($("#opts")) {
  $("#opts").onclick = (e) => {
    const b = e.target.closest("[data-i]");

    if (b) answer(Number(b.dataset.i));
  };
}

/*
 * Teclado: A-D / 1-4 escolhem, Enter avança.
 */
document.addEventListener("keydown", (e) => {
  if (!$("#quiz")?.classList.contains("active")) return;

  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;

  const k = e.key.toLowerCase();

  const i = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);

  if (i >= 0 && k.length === 1) {
    answer(i);
  } else if (k === "enter" && S.match?.revealed) {
    e.preventDefault();
    next();
  }
});

/*
 * Próxima pergunta.
 */
if ($("#btnNext")) {
  $("#btnNext").onclick = () => next();
}

/* Alterações administrativas são feitas exclusivamente no painel protegido. */

/*
 * Ranking do evento.
 */
if ($("#eRank")) {
  $("#eRank").onclick = () =>
    show("rank");
}

/*
 * Resultado.
 */
if ($("#eRes")) {
  $("#eRes").onclick = () =>
    show("result");
}

/*
 * Nova partida.
 */
if ($("#eNew")) {
  $("#eNew").onclick = () => {
    S.match = null;

    save();

    if ($("#btnContinue")) {
      $("#btnContinue").hidden = true;
    }

    show("setup");
  };
}

/*
 * =========================
 * INICIALIZAÇÃO
 * =========================
 */

/*
 * Migração mínima de uma partida antiga que ainda tivesse mais de 30 itens.
 * Preserva participante, pontos já registrados e respostas existentes.
 * Nenhuma pontuação histórica é recalculada ou removida.
 */
if (S.match && Array.isArray(S.match.queue) && S.match.queue.length > 30) {
  S.match.queue = S.match.queue.slice(0, 30);
  S.match.idx = Math.min(Number(S.match.idx) || 0, 30);
  if (S.match.res && S.match.res.length > 30) S.match.res = S.match.res.slice(0, 30);
  if (S.match.idx >= 30) {
    S.match.revealed = false;
    S.match.got = null;
    S.match.choice = null;
    S.match.gain = 0;
  }
  save();
}

/*
 * Se houver uma partida salva,
 * permitir continuar depois de
 * atualizar a página.
 */
updateContinue();

/* Se havia partida em andamento, volta direto para ela. */
if (inProgress()) show("quiz");

/* Avisa ao tentar fechar/atualizar e bloqueia o botão "voltar". */
window.addEventListener("beforeunload", (e) => {
  if (inProgress()) {
    e.preventDefault();
    e.returnValue = "";
  }
});

history.pushState(null, "", location.href);

window.addEventListener("popstate", () => {
  if (inProgress()) history.pushState(null, "", location.href);
});

/* Saída do apresentador: Ctrl + Shift + X. */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "x" && inProgress()) {
    if (confirm("APRESENTADOR: encerrar a partida em andamento? Os pontos já feitos ficam no ranking.")) {
      S.match = null;
      save();
      show("setup");
    }
  }
});

/*
 * Verificação do banco de perguntas.
 */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    if (
      typeof questions !==
        "undefined" &&
      Array.isArray(questions)
    ) {
      console.log(
        `Banco carregado: ${questions.length} perguntas.`
      );

    } else {
      console.error(
        "ERRO: questions.js não foi carregado."
      );
    }

    /*
     * Atualizar tela inicial.
     */
    renderSetup();
    if (window.FEQuizCloud?.ready) window.FEQuizCloud.ready.then(() => {
      try { const cloudState = JSON.parse(localStorage.getItem(KEY) || "{}"); if (Array.isArray(cloudState.participants)) window.FEQuizSetParticipants(cloudState.participants); } catch (_) {}
      if (document.getElementById("rank")?.classList.contains("active")) renderRank();
    });
  }
);

