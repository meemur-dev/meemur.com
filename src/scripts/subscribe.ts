// Progressive-enhancement handler for the newsletter subscribe form in the
// footer. Posts JSON to the /api/subscribe Pages Function. Without JS the form
// does nothing useful, so it stays hidden behind this enhancement.
//
// The footer renders on every page, so Turnstile is NOT loaded up front;
// its script and widget are lazy-initialised the first time the visitor
// touches the form, keeping every page free of third-party weight until then.

interface TurnstileApi {
  render: (
    container: Element | string,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    },
  ) => string;
  getResponse: (widget?: string) => string | undefined;
  reset: (widget?: string) => void;
}

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const getTurnstile = (): TurnstileApi | undefined =>
  (window as unknown as { turnstile?: TurnstileApi }).turnstile;

// Load the Turnstile script once. If another widget (e.g. the contact page)
// already pulled it in, reuse that instead of injecting a second copy.
let scriptPromise: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (getTurnstile()) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    if (existing) {
      // Script tag present but window.turnstile not ready yet, so poll for it.
      const poll = setInterval(() => {
        if (getTurnstile()) {
          clearInterval(poll);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function initSubscribeForm(): void {
  const form = document.querySelector<HTMLFormElement>("#subscribe-form");
  if (!form) return;

  const status = document.querySelector<HTMLElement>("#subscribe-status");
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const widgetEl = form.querySelector<HTMLElement>(".subscribe-turnstile");
  const emailEl = form.querySelector<HTMLInputElement>('input[name="email"]');

  const setStatus = (kind: "ok" | "error" | "", msg: string) => {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (kind ? ` form-status--${kind}` : "");
  };

  // Lazily mount the Turnstile widget the first time the visitor engages with
  // the form. Resolves once the widget exists; the token arrives via callback.
  let widgetId: string | undefined;
  let mountPromise: Promise<void> | null = null;
  function mountWidget(): Promise<void> {
    if (!widgetEl) return Promise.resolve();
    if (mountPromise) return mountPromise;
    mountPromise = loadTurnstile().then(() => {
      const turnstile = getTurnstile();
      const sitekey = widgetEl.dataset.sitekey;
      if (!turnstile || !sitekey) return;
      widgetId = turnstile.render(widgetEl, { sitekey });
    });
    return mountPromise;
  }

  if (emailEl) {
    emailEl.addEventListener("focus", () => void mountWidget(), { once: true });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!submit) return;

    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    if (!email) {
      setStatus("error", "Please enter your email address.");
      return;
    }

    setStatus("", "");
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = "Subscribing…";

    try {
      // Make sure the widget is mounted, then wait briefly for its token.
      await mountWidget();
      const turnstile = getTurnstile();
      let token = (widgetEl && turnstile?.getResponse(widgetId)) || "";
      for (let i = 0; !token && widgetEl && turnstile && i < 40; i++) {
        await new Promise((r) => setTimeout(r, 100));
        token = turnstile.getResponse(widgetId) || "";
      }

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          company: String(data.get("company") ?? ""), // honeypot, must stay empty
          token,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (res.ok && body.ok) {
        form.reset();
        setStatus("ok", "You’re in, thanks for subscribing!");
      } else {
        setStatus("error", body.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error", "Network error. Please try again.");
    } finally {
      submit.disabled = false;
      submit.textContent = label;
      getTurnstile()?.reset(widgetId);
    }
  });
}
