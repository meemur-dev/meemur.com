import { trN, localePath } from "../i18n/translations";
import type { Locale } from "../i18n/translations";

type NavKey = "home" | "services" | "work" | "about";

const LINKS: { key: NavKey; href: string }[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "work", href: "/work" },
  { key: "about", href: "/about" },
];

export function header(active = "", locale: Locale = "en"): string {
  const items = LINKS.map(({ key, href }) => {
    const current = key === active ? ' aria-current="page"' : "";
    const label = trN(key, locale);
    return `<li><a class="site-nav__link" href="${localePath(href, locale)}"${current}>${label}</a></li>`;
  }).join("");

  return `<a class="skip-link" href="#main">${trN("skipToContent", locale)}</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="${localePath("/", locale)}" aria-label="meemur, ${trN("home", locale).toLowerCase()}">
      <img src="/logo-wordmark.svg" alt="meemur" width="590" height="165" fetchpriority="high" />
    </a>
    <button
      class="nav-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="site-nav"
    >
      <span class="nav-toggle__box"><span class="nav-toggle__bars"></span></span>
      <span class="nav-toggle__label visually-hidden">${trN("menuLabel", locale)}</span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="${trN("primaryNav", locale)}">
      <ul class="site-nav__list">
        ${items}
        <li><a class="btn btn--primary btn--sm" href="${localePath("/about#contact", locale)}">${trN("getInTouch", locale)}</a></li>
      </ul>
    </nav>
  </div>
</header>`;
}
