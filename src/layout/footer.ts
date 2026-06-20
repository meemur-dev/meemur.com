import { trF, trN, localePath } from "../i18n/translations";
import type { Locale } from "../i18n/translations";

const EMAIL = "contact@meemur.com";
const LINKEDIN = "https://www.linkedin.com/company/meemur/";
const GITHUB = "https://github.com/meemur-dev";
const TURNSTILE_SITEKEY =
  import.meta.env?.PUBLIC_TURNSTILE_SITEKEY ?? "";

export function footer(locale: Locale = "en"): string {
  const p = (path: string) => localePath(path, locale);

  return `<footer class="site-footer">
  <div class="container site-footer__top">
    <div class="site-footer__brand">
      <img class="site-footer__logo" src="/logo-wordmark.svg" alt="meemur" width="590" height="165" />
      <p class="site-footer__tagline">${trF("tagline", locale)}</p>
    </div>

    <nav class="site-footer__links" aria-label="${trN("primaryNav", locale)}">
      <div class="site-footer__col">
        <h2 class="site-footer__heading">${trF("servicesHeading", locale)}</h2>
        <ul>
          <li><a href="${p("/services#ecommerce")}">${trF("ecommerce", locale)}</a></li>
          <li><a href="${p("/services#apps")}">${trF("apps", locale)}</a></li>
          <li><a href="${p("/services#analytics")}">${trF("analytics", locale)}</a></li>
          <li><a href="${p("/services#cro")}">${trF("cro", locale)}</a></li>
          <li><a href="${p("/services#performance")}">${trF("performance", locale)}</a></li>
          <li><a href="${p("/services#ads")}">${trF("ads", locale)}</a></li>
        </ul>
      </div>
      <div class="site-footer__col">
        <h2 class="site-footer__heading">${trF("companyHeading", locale)}</h2>
        <ul>
          <li><a href="${p("/work")}">${trF("work", locale)}</a></li>
          <li><a href="${p("/about")}">${trF("about", locale)}</a></li>
          <li><a href="${p("/about#contact")}">${trF("contact", locale)}</a></li>
        </ul>
      </div>
    </nav>

    <div class="site-footer__subscribe">
      <h2 class="site-footer__heading">${trF("stayInLoop", locale)}</h2>
      <p class="site-footer__subscribe-text">${trF("subscribeText", locale)}</p>
      <form class="subscribe-form" id="subscribe-form" novalidate>
        <label class="visually-hidden" for="sub-email">${trF("emailLabel", locale)}</label>
        <input id="sub-email" name="email" type="email" autocomplete="email" placeholder="${trF("emailPlaceholder", locale)}" required />
        <input class="hp" name="company" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="subscribe-turnstile" data-sitekey="${TURNSTILE_SITEKEY}"></div>
        <button class="btn btn--primary" type="submit">${trF("subscribe", locale)}</button>
      </form>
      <p id="subscribe-status" class="form-status" role="status" aria-live="polite"></p>

      <ul class="socials" aria-label="meemur on social">
        <li>
          <a href="${LINKEDIN}" rel="me noopener" target="_blank" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 17v-6.7H6.1V17h2.24Zm-1.12-7.66a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6ZM18 17v-3.67c0-1.96-1.05-2.88-2.45-2.88-1.13 0-1.63.62-1.92 1.06V10.3H11.4c.03.63 0 6.7 0 6.7h2.24v-3.74c0-.2.01-.4.07-.55.16-.39.53-.8 1.14-.8.8 0 1.12.6 1.12 1.5V17H18Z"/></svg>
          </a>
        </li>
        <li>
          <a href="${GITHUB}" rel="me noopener" target="_blank" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
          </a>
        </li>
        <li>
          <a href="mailto:${EMAIL}" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          </a>
        </li>
      </ul>
    </div>
  </div>

  <div class="site-footer__base">
    <div class="container site-footer__base-inner">
      <small>&copy; <span id="year">2026</span> meemur. ${trF("allRights", locale)} &middot; <a href="${p("/privacy")}">${trF("privacy", locale)}</a></small>
      <a class="site-footer__home-link" href="${p("/about#contact")}">${trF("startProject", locale)}</a>
    </div>
  </div>
</footer>`;
}
