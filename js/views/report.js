// Rapport d'une tentative — équivalent de report_view.dart. Une seule vue
// pour les deux cas que Flask séparait (quiz_report / view_attempt) :
// Quiz.consumeJustFinished() dit si CETTE tentative vient d'être terminée à
// l'instant (auquel cas on montre "Recommencer" + d'éventuels confettis) ou
// si c'est une consultation depuis l'historique (bandeau "Tentative passée").
function _scoreColor(ratio) {
  if (ratio >= 0.8) return "#1E8E5A"; // vert
  if (ratio >= 0.5) return "var(--gold)";
  return "var(--danger)";
}

Views.report = async function (attemptId) {
  const attempt = Storage.getAttempt(attemptId);
  if (!attempt) {
    navTo("historique");
    return `<p class="loading-hint">Redirection…</p>`;
  }

  const exam = await ExamRepo.getExam(attempt.examId).catch(() => null);
  const { isJustFinished, isNewRecord } = Quiz.consumeJustFinished(attemptId);
  const ratio = attempt.total ? attempt.score / attempt.total : 0;
  const scoreColor = _scoreColor(ratio);

  const wrongDetail = attempt.answers
    .filter((a) => !a.isCorrect)
    .map((a) => {
      const q = exam ? exam.questions.find((q) => q.id === a.questionId) : null;
      return {
        text: q ? q.text : "(question indisponible)",
        choices: q ? q.choices : {},
        given: a.given,
        correct: a.correct,
        explication: q ? q.explication || "" : "",
      };
    });

  const detailHtml = wrongDetail.length > 0
    ? `
      <h2 class="section-title">Tes erreurs (${wrongDetail.length})</h2>
      ${wrongDetail.map((item) => `
        <div class="card wrong-card">
          <p class="question-text">${escapeHtml(item.text)}</p>
          <div class="answer-row">
            <span class="answer-icon answer-icon-ko">${iconSpan("close")}</span>
            <span>Ta réponse : <strong>${item.given ? escapeHtml(item.given) + ") " + escapeHtml(item.choices[item.given] ?? "") : "(aucune)"}</strong></span>
          </div>
          <div class="answer-row">
            <span class="answer-icon answer-icon-ok">${iconSpan("check")}</span>
            <span>Bonne réponse : <strong>${escapeHtml(item.correct)}) ${escapeHtml(item.choices[item.correct] ?? "")}</strong></span>
          </div>
          ${item.explication ? `<div class="explication-box">${escapeHtml(item.explication)}</div>` : ""}
        </div>
      `).join("")}
    `
    : `
      <div class="card all-correct">
        ${iconSpan("celebration")}
        <span>Bravo, aucune erreur !</span>
      </div>
    `;

  const actionsHtml = isJustFinished
    ? `
      <div class="report-actions">
        <a href="#/" class="btn-primary">Recommencer</a>
        <a href="#/historique/${encodeURIComponent(attempt.matiere)}" class="btn-outlined">Voir mon historique</a>
      </div>
    `
    : `
      <div class="report-actions">
        <a href="#/historique/${encodeURIComponent(attempt.matiere)}" class="btn-primary">Retour à l'historique</a>
      </div>
    `;

  return `
    ${!isJustFinished ? '<p class="history-tag">Tentative passée</p>' : ""}
    <h1 class="centered-title">${escapeHtml(attempt.matiere)} ${attempt.annee === 0 ? "— Session aléatoire" : "— " + attempt.annee}</h1>
    <div class="score-gauge" style="--gauge-color: ${scoreColor}; --ratio: ${Math.round(ratio * 100)}">
      <div class="score-gauge-center">
        <div class="score-gauge-value" style="color: ${scoreColor}">${attempt.score}/${attempt.total}</div>
        <div class="score-gauge-pct">${Math.round(ratio * 100)}%</div>
      </div>
    </div>
    ${isJustFinished && isNewRecord ? `
      <div class="record-banner" data-confetti="1">${iconSpan("emoji_events")}<span>Nouveau record personnel sur cette épreuve !</span></div>
    ` : ""}
    ${detailHtml}
    ${actionsHtml}
  `;
};
