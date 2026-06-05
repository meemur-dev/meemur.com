// Shared page bootstrap: loads the global stylesheet, wires the mobile nav
// toggle, and fills in the copyright year. Loaded as a module on every page.
import "../styles/main.css";
import { initContactForm } from "./contact";

// ---- Mobile nav toggle ----
const header = document.querySelector<HTMLElement>(".site-header");
const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");

if (header && toggle) {
  const setOpen = (open: boolean) => {
    header.classList.toggle("site-header--open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(!header.classList.contains("site-header--open"));
  });

  // Close the menu after navigating or pressing Escape.
  header.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

// ---- Copyright year (founding year, expanding to a range) ----
const yearEl = document.getElementById("year");
if (yearEl) {
  const founded = 2026;
  const now = new Date().getFullYear();
  yearEl.textContent = now > founded ? `${founded}–${now}` : String(founded);
}

// ---- Contact form (no-op on pages without one) ----
initContactForm();
