(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("jjbakes-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("jjbakes-theme", next);
    });
  });
})();
