export function initNav() {
var nav = document.querySelector(".nav");
var toggle = document.querySelector("[data-nav-toggle]");
var menu = document.getElementById("nav-menu");
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function onScroll() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 8);
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function setMenuOpen(open) {
  if (!toggle || !menu) return;
  menu.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  var sr = toggle.querySelector(".sr-only");
  if (sr) sr.textContent = open ? "Fechar menu" : "Abrir menu";
}

if (toggle && menu) {
  toggle.addEventListener("click", function () {
    setMenuOpen(!menu.classList.contains("is-open"));
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
}
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}
