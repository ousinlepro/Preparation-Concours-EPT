// Écran de question + écran "reprendre ou recommencer" — équivalents de
// concours_ept_app/lib/screens/quiz_screen.dart et resume_or_restart_screen.dart.

Views.resumeOrRestart = async function (examId) {
  const progress = Storage.getProgress(examId);
  const exam = await ExamRepo.getExam(examId);
  if (!exam || !Quiz.isProgressUsable(progress)) {
    navTo("");
    return `<p class="loading-hint">Redirection…</p>`;
  }
  const style = matiereStyle(exam.matiere);
  const total = progress.questionIds.length;
  const currentNum = progress.qIndex + 1;

  return `
    <div class="centered-panel">
      <span class="subject-badge subject-badge-lg" style="--matiere-color: ${style.color}">
        <span class="subject-badge-icon">${iconSpan(style.icon)}</span>
      </span>
      <h1>${escapeHtml(exam.matiere)} — Session ${exam.annee}</h1>
      <p>
        Tu t'étais arrêté à la question <strong>${currentNum} sur ${total}</strong>. Veux-tu
        reprendre où tu en étais, ou repartir de zéro (nouvelles questions dans un ordre aléatoire) ?
      </p>
      <button type="button" class="btn-primary" style="--matiere-color: ${style.color}" data-resume-exam="${escapeHtml(examId)}">
        Reprendre où j'en étais
      </button>
      <button type="button" class="btn-outlined" data-restart-exam="${escapeHtml(examId)}">Recommencer à zéro</button>
      <a href="#/" class="link-muted">Annuler, retour à l'accueil</a>
    </div>
  `;
};

Views.quizQuestion = async function (examId) {
  const progress = Storage.getProgress(examId);
  if (!Quiz.isProgressUsable(progress)) {
    navTo("");
    return `<p class="loading-hint">Redirection…</p>`;
  }
  const exam = await ExamRepo.getExam(examId);
  if (!exam) {
    navTo("");
    return `<p class="loading-hint">Redirection…</p>`;
  }

  const total = progress.questionIds.length;
  const qIndex = progress.qIndex;
  if (qIndex >= total) {
    navTo("");
    return `<p class="loading-hint">Redirection…</p>`;
  }

  const style = matiereStyle(exam.matiere);
  const questionId = progress.questionIds[qIndex];
  const question = exam.questions.find((q) => q.id === questionId);
  const selected = progress.answers[qIndex];
  const hasPrevious = qIndex > 0;

  const choicesHtml = Object.entries(question.choices).map(([letter, label]) => `
    <label class="choice-tile">
      <input type="radio" name="choice" value="${letter}" ${selected === letter ? "checked" : ""} required>
      <span class="choice-letter">${letter}</span>
      <span class="choice-label">${escapeHtml(label)}</span>
      <span class="choice-check">${iconSpan("check_circle")}</span>
    </label>
  `).join("");

  return `
    <div style="--matiere-color: ${style.color}">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(qIndex / total) * 100}%"></div>
      </div>
      <p class="progress-label">
        ${iconSpan(style.icon)} ${escapeHtml(exam.matiere)} Session ${exam.annee} — Question ${qIndex + 1} / ${total}
      </p>

      <form data-quiz-form="${escapeHtml(examId)}" class="question-form">
        <div class="card question-card">
          <p class="question-text">${escapeHtml(question.text)}</p>
        </div>
        <div class="choices">${choicesHtml}</div>
        <div class="question-actions">
          ${hasPrevious ? '<button type="submit" name="action" value="back" formnovalidate class="btn-outlined">← Précédent</button>' : ""}
          <button type="submit" name="action" value="next" class="btn-primary" ${selected ? "" : "disabled"}>
            ${qIndex + 1 === total ? "Voir le rapport" : "Valider et continuer"}
          </button>
        </div>
      </form>
    </div>
  `;
};
