// First-visit locale routing. Visitors whose Cloudflare edge country is Turkey
// are sent to the Turkish (/tr) version of the page they requested, unless they
// already have a locale preference cookie. The redirect sets that cookie so it
// fires at most once and leaves an escape hatch: anyone with the cookie passes
// through untouched (e.g. a TR visitor who navigates back to / gets English).
//
// Runs only for top-level HTML navigations; static assets, /api routes, and
// pages already under /tr pass through. A future language switcher should write
// the same `locale` cookie to lock the user's choice.

const LOCALE_COOKIE = "locale";
const GEO_LOCALE = "tr";
const GEO_COUNTRY = "TR";

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);
  const { pathname } = url;

  // Only nudge real document navigations.
  const wantsHtml = request.headers.get("Accept")?.includes("text/html");
  if (request.method !== "GET" || !wantsHtml) return next();

  // Leave already-localized pages, API routes, and the like alone.
  if (pathname === "/tr" || pathname.startsWith("/tr/") || pathname.startsWith("/api/")) {
    return next();
  }

  // Respect an existing locale choice — geo only nudges first-time visitors.
  if (readCookie(request.headers.get("Cookie"), LOCALE_COOKIE)) return next();

  // Cloudflare adds CF-IPCountry at the edge; only Turkish visitors get moved.
  if (request.headers.get("CF-IPCountry") !== GEO_COUNTRY) return next();

  const target = new URL(url);
  target.pathname = pathname === "/" ? "/tr" : `/tr${pathname}`;

  const response = new Response(null, {
    status: 302,
    headers: { Location: target.toString(), "Cache-Control": "no-store" },
  });
  response.headers.append(
    "Set-Cookie",
    `${LOCALE_COOKIE}=${GEO_LOCALE}; Path=/; Max-Age=31536000; SameSite=Lax`,
  );
  return response;
};
