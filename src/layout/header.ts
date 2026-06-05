// Shared site header, inlined into every page at build time by the partials
// plugin in vite.config.ts. `active` is the current page key so the matching
// nav link gets aria-current="page".
type NavKey = "home" | "services" | "about";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "services", href: "/services", label: "Services" },
  { key: "about", href: "/about", label: "About" },
];

export function header(active = ""): string {
  const items = LINKS.map(({ key, href, label }) => {
    const current = key === active ? ' aria-current="page"' : "";
    return `<li><a class="site-nav__link" href="${href}"${current}>${label}</a></li>`;
  }).join("");

  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="/" aria-label="meemur — home page">
      <img src="/logo.svg" alt="meemur" width="700" height="400" />
    </a>
    <button
      class="nav-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="site-nav"
    >
      <span class="nav-toggle__box"><span class="nav-toggle__bars"></span></span>
      <span class="nav-toggle__label">Menu</span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Primary">
      <ul class="site-nav__list">
        ${items}
        <li><a class="btn btn--primary btn--sm" href="/about#contact">Get in touch</a></li>
      </ul>
    </nav>
  </div>
</header>`;
}
