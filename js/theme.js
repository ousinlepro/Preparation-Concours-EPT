// Thème clair/sombre/système — équivalent de ThemeProvider côté Flutter
// (lib/state/theme_provider.dart) : trois modes, persistés, avec suivi en
// direct de la préférence système quand le mode choisi est "système".
const THEME_MODE_KEY = "themeMode"; // "system" | "light" | "dark"

function getThemeMode() {
  try {
    const v = localStorage.getItem(THEME_MODE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeMode(mode) {
  document.documentElement.setAttribute("data-theme", resolveTheme(mode));
}

function setThemeMode(mode) {
  try { localStorage.setItem(THEME_MODE_KEY, mode); } catch { /* tant pis, pas grave */ }
  applyThemeMode(mode);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getThemeMode() === "system") applyThemeMode("system");
});
