export function initTheme() {
var themeToggle = document.querySelector("[data-theme-toggle]");
function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}
function syncThemeToggle() {
  if (!themeToggle) return;
  var light = currentTheme() === "light";
  themeToggle.setAttribute("aria-label", light ? "Ativar modo escuro" : "Ativar modo claro");
  themeToggle.setAttribute("title", light ? "Modo claro" : "Modo escuro");
}
syncThemeToggle();

function applyTheme(next) {
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("prourban-theme", next); } catch (e) {}
  syncThemeToggle();
}

if (themeToggle) {
  themeToggle.addEventListener("click", function (event) {
    var next = currentTheme() === "light" ? "dark" : "light";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var rect = themeToggle.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    if (!reduce && typeof document.startViewTransition === "function") {
      var rootEl = document.documentElement;
      var vt = document.startViewTransition(function () {
        rootEl.style.transition = "none";
        applyTheme(next);
      });
      vt.ready.then(function () {
        document.documentElement.animate(
          [
            { clipPath: "circle(0px at " + x + "px " + y + "px)" },
            { clipPath: "circle(" + radius + "px at " + x + "px " + y + "px)" }
          ],
          {
            duration: 480,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            pseudoElement: "::view-transition-new(root)"
          }
        );
      }).catch(function () {}).then(function () {
        rootEl.style.transition = "";
      });
      return;
    }

    applyTheme(next);
    if (!reduce && typeof document.body.animate === "function") {
      document.body.animate(
        [{ opacity: 0.82 }, { opacity: 1 }],
        { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      );
    }
  });
}
}
