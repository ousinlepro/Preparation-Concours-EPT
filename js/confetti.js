// Animation de confettis sur nouveau record personnel — port direct du petit
// script inline de concours-ept/templates/report.html.
function spawnConfetti() {
  const colors = ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd", "#ff9f43"];
  const count = 70;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    document.body.appendChild(piece);
    piece.addEventListener("animationend", function () { this.remove(); });
  }
}
