// Réglages — équivalent de concours_ept_app/lib/screens/settings_screen.dart :
// apparence (thème), données (réinitialiser), à propos.
Views.settings = async function () {
  const mode = getThemeMode();

  const segment = (value, icon, label) => `
    <button type="button" class="segment ${mode === value ? "active" : ""}" data-set-theme="${value}">
      ${iconSpan(icon)}
      <span>${label}</span>
    </button>
  `;

  return `
    <h2 class="section-title">Apparence</h2>
    <div class="card">
      <div class="segmented">
        ${segment("system", "brightness_auto", "Système")}
        ${segment("light", "light_mode", "Clair")}
        ${segment("dark", "dark_mode", "Sombre")}
      </div>
    </div>

    <h2 class="section-title">Données</h2>
    <button type="button" class="card list-tile" data-reset-all>
      <span class="tile-avatar tile-avatar-danger">${iconSpan("delete_forever")}</span>
      <span class="tile-main">
        <span class="tile-title">Réinitialiser mes données</span>
        <span class="tile-subtitle">Efface l'historique, les records et l'épreuve en cours</span>
      </span>
    </button>

    <h2 class="section-title">À propos</h2>
    <div class="card about-card">
      <span class="tile-avatar tile-avatar-primary">${iconSpan("school")}</span>
      <p>
        Concours EPT · Entraînement<br>
        Site autonome, sans compte : toutes tes données restent sur cet
        appareil et ce navigateur (stockage local, jamais envoyé nulle part).
      </p>
    </div>
  `;
};
