// Shared site footer, inlined at build time (see vite.config.ts). The
// copyright year is filled in by src/scripts/main.ts so the markup stays
// static and cacheable.
const EMAIL = "onur@meemur.com";
const LINKEDIN = "https://www.linkedin.com/in/oyanar";
const GITHUB = "https://github.com/meemur-dev";

export function footer(): string {
  return `<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__brand">
      <img class="site-footer__logo" src="/logo.svg" alt="meemur" width="700" height="400" />
      <p class="site-footer__tagline">We make the web work for you.</p>
    </div>

    <nav class="site-footer__nav" aria-label="Footer">
      <div class="site-footer__col">
        <h2 class="site-footer__heading">Services</h2>
        <ul>
          <li><a href="/services#ecommerce">Web &amp; E-commerce</a></li>
          <li><a href="/services#apps">Cross-platform Apps</a></li>
          <li><a href="/services#analytics">Analytics &amp; Measurement</a></li>
          <li><a href="/services#cro">CRO &amp; Experimentation</a></li>
          <li><a href="/services#performance">Accessibility &amp; Performance</a></li>
          <li><a href="/services#ads">Social Media Ads</a></li>
        </ul>
      </div>
      <div class="site-footer__col">
        <h2 class="site-footer__heading">Company</h2>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/about#contact">Contact</a></li>
        </ul>
      </div>
      <div class="site-footer__col">
        <h2 class="site-footer__heading">Connect</h2>
        <ul>
          <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          <li><a href="${LINKEDIN}" rel="me noopener" target="_blank">LinkedIn</a></li>
          <li><a href="${GITHUB}" rel="me noopener" target="_blank">GitHub</a></li>
        </ul>
      </div>
    </nav>
  </div>

  <div class="site-footer__base">
    <small>&copy; <span id="year">2026</span> meemur. All rights reserved.</small>
  </div>
</footer>`;
}
