// Public Cloudflare Turnstile site key for meemur.com.
//
// Safe to commit: Turnstile *site* keys are public (they ship in the page HTML)
// and are bound to the domain. The secret half stays in the TURNSTILE_SECRET_KEY
// Cloudflare secret, used server-side by functions/api/* to verify tokens.
//
// Inlined rather than read from a build-time env var: Astro's import.meta.env
// did not pick up the value from Cloudflare Pages' build environment, leaving
// an empty sitekey in production.
export const TURNSTILE_SITEKEY = "0x4AAAAAADnJOBZSLMjA6cof";
