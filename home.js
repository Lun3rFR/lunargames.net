// Builds the game cards from GAMES (see games.js). Uses textContent only, so game
// names and taglines can never inject HTML.
(function () {
  var LABEL = { live: "Play now", dev: "In development", soon: "Coming soon" };
  var grid = document.getElementById("games-grid");
  if (!grid || typeof GAMES === "undefined") return;

  GAMES.forEach(function (g) {
    var clickable = !!g.url;
    var card = document.createElement(clickable ? "a" : "div");
    card.className = "card";
    if (clickable) card.href = g.url;

    var thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.style.setProperty("--h", String(Number(g.hue) || 220));
    thumb.textContent = (g.name || "?").charAt(0).toUpperCase();
    thumb.setAttribute("aria-hidden", "true");

    var body = document.createElement("div");
    body.className = "body";

    var chip = document.createElement("span");
    chip.className = "chip " + (g.status === "live" || g.status === "dev" ? g.status : "");
    chip.textContent = LABEL[g.status] || "Coming soon";

    var h = document.createElement("h3");
    h.textContent = g.name;
    var p = document.createElement("p");
    p.textContent = g.tagline || "";

    body.append(chip, h, p);
    card.append(thumb, body);
    grid.appendChild(card);
  });
})();
