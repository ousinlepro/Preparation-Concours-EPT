// Logique du quiz — équivalent de la partie "Quiz" de concours-ept/app.py
// (_begin_fresh_attempt, quiz_question, quiz_report), mais appelée depuis les
// vues plutôt que déclenchée par des routes POST : il n'y a pas de serveur,
// juste Storage (localStorage) comme état persistant.
const Quiz = {
  /** Une progression sauvegardée dans un format incohérent (ancienne version
   * du site, données corrompues...) est ignorée proprement plutôt que de
   * planter dessus — même principe que InProgressAttempt.isUsable côté Flutter. */
  isProgressUsable(progress) {
    return !!progress
      && Array.isArray(progress.questionIds) && progress.questionIds.length > 0
      && Array.isArray(progress.answers) && progress.answers.length === progress.questionIds.length;
  },

  /** Tire un nouvel ordre de questions et sauvegarde tout de suite cet état
   * comme tentative "en cours". */
  beginFreshAttempt(exam) {
    const questionIds = shuffled(exam.questions.map((q) => q.id));
    const answers = new Array(questionIds.length).fill(null);
    Storage.saveProgress(exam.id, questionIds, 0, answers);
  },

  /** Enregistre la réponse à la question affichée puis avance d'une question.
   * Si l'épreuve est terminée, calcule le rapport, sauvegarde la tentative et
   * retourne { finished: true, attemptId }. */
  async answerAndAdvance(examId, choice) {
    const progress = Storage.getProgress(examId);
    if (!this.isProgressUsable(progress)) return { finished: false };

    const { questionIds, qIndex, answers } = progress;
    answers[qIndex] = choice;
    const nextIndex = qIndex + 1;

    if (nextIndex >= questionIds.length) {
      const exam = await ExamRepo.getExam(examId);
      const { attemptId, isNewRecord } = this._finish(exam, questionIds, answers);
      Storage.deleteProgress(examId);
      sessionStorage.setItem("justFinished", JSON.stringify({ attemptId, isNewRecord }));
      return { finished: true, attemptId };
    }

    Storage.saveProgress(examId, questionIds, nextIndex, answers);
    return { finished: false };
  },

  /** Revient à la question précédente sans toucher aux réponses déjà données. */
  goBack(examId) {
    const progress = Storage.getProgress(examId);
    if (!this.isProgressUsable(progress)) return;
    Storage.saveProgress(
      examId, progress.questionIds,
      Math.max(0, progress.qIndex - 1), progress.answers
    );
  },

  _finish(exam, questionIds, answers) {
    let score = 0;
    const detailed = questionIds.map((qid, i) => {
      const q = exam.questions.find((q) => q.id === qid);
      const isCorrect = answers[i] === q.correct;
      if (isCorrect) score++;
      return { questionId: qid, given: answers[i], correct: q.correct, isCorrect };
    });
    // Comparaison faite AVANT l'enregistrement, comme _save_attempt_and_check_record côté Flask.
    const { best: previousBest } = Storage.getBestScore(exam.id);
    const isNewRecord = previousBest !== null && score > previousBest;
    const attemptId = Storage.saveAttempt(exam, score, questionIds.length, detailed);
    return { attemptId, isNewRecord };
  },

  /** Lit puis efface immédiatement le marqueur "cette tentative vient d'être
   * terminée à l'instant" (sessionStorage, à usage unique) : permet à la vue
   * Rapport d'afficher les boutons "Recommencer"/confettis seulement juste
   * après avoir fini le quiz, jamais en revisitant la même tentative depuis
   * l'historique — équivalent du flag `report_saved` de la session Flask. */
  consumeJustFinished(attemptId) {
    try {
      const raw = sessionStorage.getItem("justFinished");
      if (!raw) return { isJustFinished: false, isNewRecord: false };
      const data = JSON.parse(raw);
      if (data.attemptId !== attemptId) return { isJustFinished: false, isNewRecord: false };
      sessionStorage.removeItem("justFinished");
      return { isJustFinished: true, isNewRecord: !!data.isNewRecord };
    } catch {
      return { isJustFinished: false, isNewRecord: false };
    }
  },
};
