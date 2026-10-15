/* =========================================================
   Portfolio script
   1. Theme toggle (dark / light)       - every page
   2. Time-based greeting               - home page
   3. Back-to-top button                - every page
   4. Projects: fetch JSON, build cards, filter, details modal
   ========================================================= */

/* ---------- 1. Theme toggle ---------- */
const THEME_KEY = "portfolio-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  const icon = document.querySelector("#themeToggle i");
  if (icon) {
    icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
  }
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable */ }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }
}

/* ---------- 2. Greeting ---------- */
function initGreeting() {
  const el = document.getElementById("greeting");
  if (!el) return;
  const hour = new Date().getHours();
  let text = "Good evening";
  if (hour < 12) text = "Good morning";
  else if (hour < 18) text = "Good afternoon";
  el.textContent = text + ", and welcome.";
}

/* ---------- 3. Back to top ---------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 400);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0 }));
}

/* ---------- 4. Projects ---------- */
let allProjects = [];

async function loadProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return; // not the projects page

  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    allProjects = await response.json();   // JSON text -> JavaScript objects
    buildFilterButtons(allProjects);
    renderProjects(allProjects);
  } catch (error) {
    grid.innerHTML =
      '<div class="col-12"><div class="alert alert-warning" role="alert">' +
      "Projects could not be loaded. Run this site through a local web server " +
      "(such as VS Code Live Server) instead of opening the file directly." +
      "</div></div>";
    console.error("Could not load projects.json:", error);
  }
}

function buildFilterButtons(projects) {
  const bar = document.getElementById("filter-bar");
  const categories = ["All", ...new Set(projects.map(p => p.category))];

  bar.innerHTML = "";
  categories.forEach((category, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn" + (index === 0 ? " active" : "");
    btn.textContent = category;
    btn.dataset.category = category;
    btn.addEventListener("click", () => filterProjects(category, btn));
    bar.appendChild(btn);
  });
}

function filterProjects(category, clickedBtn) {
  document.querySelectorAll("#filter-bar .btn").forEach(b => b.classList.remove("active"));
  clickedBtn.classList.add("active");

  const filtered = category === "All"
    ? allProjects
    : allProjects.filter(p => p.category === category);
  renderProjects(filtered);
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  grid.innerHTML = "";

  projects.forEach(project => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const badges = project.technologies
      .map(t => `<span class="badge tech-badge">${t}</span>`)
      .join(" ");

    col.innerHTML = `
      <div class="card project-card h-100">
        <div class="card-body d-flex flex-column">
          <span class="category-tag mb-3 align-self-start">${project.category}</span>
          <h3 class="card-title h5">${project.title}</h3>
          <p class="card-text">${project.description}</p>
          <div class="d-flex flex-wrap gap-2 mt-auto mb-3">${badges}</div>
          <button type="button" class="btn btn-outline-ink btn-sm align-self-start">View details</button>
        </div>
      </div>`;

    col.querySelector("button").addEventListener("click", () => showProjectModal(project));
    grid.appendChild(col);
  });
}

function showProjectModal(project) {
  document.getElementById("projectModalTitle").textContent = project.title;
  document.getElementById("projectModalCategory").textContent = project.category;
  document.getElementById("projectModalDescription").textContent = project.description;
  document.getElementById("projectModalTech").innerHTML = project.technologies
    .map(t => `<span class="badge tech-badge">${t}</span>`)
    .join(" ");

  const modal = new bootstrap.Modal(document.getElementById("projectModal"));
  modal.show();
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initGreeting();
  initBackToTop();
  loadProjects();
});
