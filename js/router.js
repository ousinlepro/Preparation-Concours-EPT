// Routeur — associe le hash de l'URL (#/...) à une vue. Le hash-routing
// évite toute config serveur (GitHub Pages ne fait que servir des fichiers
// statiques, il ne peut pas réécrire des URLs comme /historique/Anglais vers
// index.html) : #/historique/Anglais reste toujours la même page index.html,
// seul le fragment après # change, et le navigateur ne fait jamais de requête
// serveur pour ça.
const ROUTES = [
  { pattern: /^$/, section: "", title: "Concours EPT", handler: () => Views.home() },
  { pattern: /^statistiques$/, section: "statistiques", title: "Mes statistiques", handler: () => Views.stats() },
  { pattern: /^reglages$/, section: "reglages", title: "Réglages", handler: () => Views.settings() },
  { pattern: /^historique$/, section: "historique", title: "Historique", handler: () => Views.historiqueMatieres() },
  { pattern: /^historique\/tentative\/(\d+)$/, section: "historique", title: "Résultat", handler: (m) => Views.report(Number(m[1])) },
  { pattern: /^historique\/([^/]+)$/, section: "historique", title: (m) => decodeURIComponent(m[1]), handler: (m) => Views.historiqueMatiere(decodeURIComponent(m[1])) },
  { pattern: /^quiz\/([^/]+)\/resume$/, section: "", title: "Épreuve en cours", handler: (m) => Views.resumeOrRestart(decodeURIComponent(m[1])) },
  { pattern: /^quiz\/([^/]+)$/, section: "", title: "Question", handler: (m) => Views.quizQuestion(decodeURIComponent(m[1])) },
];

function _currentHashPath() {
  // "#/historique/Anglais" -> "historique/Anglais" ; "#" ou "" -> ""
  return location.hash.replace(/^#\/?/, "");
}

function _updateChrome(section, title) {
  document.querySelectorAll("[data-nav-section]").forEach((link) => {
    link.classList.toggle("active", link.dataset.navSection === section);
  });
  const titleEl = document.getElementById("app-title");
  if (titleEl) titleEl.textContent = title;
}

async function renderRoute() {
  const path = _currentHashPath();
  const app = document.getElementById("app");
  const route = ROUTES.find((r) => r.pattern.test(path));

  if (!route) {
    // Aucune route ne correspond (lien cassé, ancienne URL...) : accueil.
    if (path !== "") { navTo(""); return; }
    app.innerHTML = `<p class="loading-hint">Aucun contenu à afficher.</p>`;
    return;
  }

  const match = path.match(route.pattern);
  try {
    const html = await route.handler(match);
    if (html !== undefined) app.innerHTML = html;
  } catch (err) {
    console.error(err);
    app.innerHTML = `
      <h1>Oups</h1>
      <p>Une erreur est survenue : ${escapeHtml(err && err.message ? err.message : String(err))}</p>
      <a href="#/" class="btn-primary">Retour à l'accueil</a>
    `;
  }

  const title = typeof route.title === "function" ? route.title(match) : route.title;
  typesetMath(app);
  _updateChrome(route.section, title);
  app.scrollTop = 0;

  const confettiMarker = app.querySelector("[data-confetti]");
  if (confettiMarker) spawnConfetti();
}

window.addEventListener("hashchange", renderRoute);
