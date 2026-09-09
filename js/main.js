// Point d'entrée : délégation d'événements pour toutes les actions qui ne
// sont pas de simples liens (#href) + démarrage du routeur. Le thème est
// géré par js/theme.js ; le sélecteur clair/sombre/système vit dans la vue
// Réglages (voir data-set-theme ci-dessous), pas dans l'en-tête — comme
// l'application, qui n'a pas de bascule rapide non plus.

const app = document.getElementById("app");

app.addEventListener("click", async (e) => {
  const startBtn = e.target.closest("[data-start-exam]");
  if (startBtn) {
    startBtn.disabled = true;
    await startExamFlow(startBtn.dataset.startExam);
    return;
  }

  const resumeBtn = e.target.closest("[data-resume-exam]");
  if (resumeBtn) {
    navTo(`quiz/${resumeBtn.dataset.resumeExam}`);
    return;
  }

  const restartBtn = e.target.closest("[data-restart-exam]");
  if (restartBtn) {
    const examId = restartBtn.dataset.restartExam;
    const confirmed = confirm("Recommencer effacera ta progression actuelle sur cette épreuve. Continuer ?");
    if (!confirmed) return;
    Storage.deleteProgress(examId);
    const exam = await ExamRepo.getExam(examId);
    if (exam) {
      Quiz.beginFreshAttempt(exam);
      navTo(`quiz/${examId}`);
    }
    return;
  }

  const navToBtn = e.target.closest("[data-nav-to]");
  if (navToBtn) {
    navTo(navToBtn.dataset.navTo);
    return;
  }

  const resetBtn = e.target.closest("[data-reset-all]");
  if (resetBtn) {
    const confirmed = confirm(
      "Ton historique, tes meilleurs scores et toute épreuve en cours seront définitivement supprimés. Continuer ?"
    );
    if (!confirmed) return;
    Storage.resetAllData();
    renderRoute();
    return;
  }

  const themeBtn = e.target.closest("[data-set-theme]");
  if (themeBtn) {
    setThemeMode(themeBtn.dataset.setTheme);
    renderRoute();
    return;
  }
});

// Active le bouton "Valider et continuer" dès qu'un choix est sélectionné
// (il démarre désactivé, comme côté Flutter), sans attendre un re-rendu complet.
app.addEventListener("change", (e) => {
  const radio = e.target.closest('.question-form input[type="radio"][name="choice"]');
  if (!radio) return;
  const form = radio.closest("[data-quiz-form]");
  const nextBtn = form && form.querySelector('button[name="action"][value="next"]');
  if (nextBtn) nextBtn.disabled = false;
});

app.addEventListener("submit", async (e) => {
  const form = e.target.closest("[data-quiz-form]");
  if (!form) return;
  e.preventDefault();

  const examId = form.dataset.quizForm;
  const action = (e.submitter && e.submitter.value) || "next";

  if (action === "back") {
    Quiz.goBack(examId);
    renderRoute();
    return;
  }

  const choice = new FormData(form).get("choice");
  if (!choice) return; // filet de sécurité : le radio est déjà `required` côté HTML
  const result = await Quiz.answerAndAdvance(examId, choice);
  if (result.finished) {
    navTo(`historique/tentative/${result.attemptId}`);
  } else {
    renderRoute();
  }
});

// --- Démarrage ---
renderRoute();
