// WebMCP (Web Model Context Protocol) integration for the newsletter form.
//
// Exposes one client-side tool so an in-browser AI agent can subscribe the
// visitor to the newsletter. Unlike the contact tool (contact-mcp.ts), the
// subscribe form lives in the footer on *every* page, so this tool is
// effectively global: it registers wherever the footer renders.
//
// This tool *submits* the form. Rather than POST to /api/subscribe directly —
// which would fail the server's Turnstile check and require duplicating the
// fetch logic — it fills the email field and calls form.requestSubmit(), which
// drives the existing submit handler in subscribe.ts. That reuses the lazily
// mounted Cloudflare Turnstile token, the spam honeypot ("company"), the status
// messaging, and the button state. We then observe #subscribe-status to report
// the real outcome (success or the server's error) back to the agent.
//
// We use the imperative API (document.modelContext.registerTool) rather than
// annotating the <form> declaratively: the form carries a honeypot field
// ("company") that must stay empty, and a synthesized declarative schema would
// expose it to the agent. The imperative schema lists only the email.
//
// Progressive enhancement: the whole thing is feature-detected, so browsers
// without WebMCP simply skip it and the form keeps working as normal.

interface SubscribeToolInput {
  email?: string;
}

interface SubscribeTool {
  name: string;
  description: string;
  inputSchema: unknown;
  execute: (input: SubscribeToolInput) => string | Promise<string>;
  annotations?: Record<string, unknown>;
}

interface ModelContext {
  registerTool: (tool: SubscribeTool, options?: { signal?: AbortSignal }) => void;
}

// `navigator.modelContext` is deprecated in favour of `document.modelContext`;
// check the new home first and fall back for older preview builds.
function getModelContext(): ModelContext | null {
  const ctx =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;
  return ctx && typeof ctx.registerTool === "function" ? ctx : null;
}

const isEmail = (v: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

// Max time to wait for the submit handler to resolve. It polls Turnstile for up
// to ~4s before POSTing, so give the network some headroom on top of that.
const RESULT_TIMEOUT_MS = 20_000;

export function initSubscribeMcp(): void {
  const modelContext = getModelContext();
  if (!modelContext) return;

  const form = document.querySelector<HTMLFormElement>("#subscribe-form");
  if (!form) return;

  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
  const status = document.querySelector<HTMLElement>("#subscribe-status");
  if (!emailInput) return;

  // No unregisterTool() exists, so abort the signal to tear the tool down when
  // the page goes away, so it can't leak or collide on a back/forward restore.
  const controller = new AbortController();
  window.addEventListener("pagehide", () => controller.abort(), { once: true });

  const setField = (el: HTMLInputElement, value: string) => {
    el.value = value;
    // Mirror a real edit so any listeners (and form state) stay in sync.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // Resolve once the submit handler reports a result by toggling the status
  // element to its ok/error modifier class. Falls back after a timeout so the
  // tool never hangs the agent.
  const waitForResult = (): Promise<string> =>
    new Promise((resolve) => {
      if (!status) {
        resolve("Submitted the newsletter form. Could not read the result on this page.");
        return;
      }

      let settled = false;
      const finish = (msg: string) => {
        if (settled) return;
        settled = true;
        observer.disconnect();
        clearTimeout(timer);
        resolve(msg);
      };

      const check = () => {
        const msg = status.textContent?.trim() || "";
        if (status.classList.contains("form-status--ok")) {
          finish(msg || "Subscribed the visitor to the meemur newsletter.");
        } else if (status.classList.contains("form-status--error")) {
          finish(`Couldn't subscribe: ${msg || "the request failed. Please try again."}`);
        }
      };

      const observer = new MutationObserver(check);
      observer.observe(status, {
        attributes: true,
        attributeFilter: ["class"],
        childList: true,
        characterData: true,
        subtree: true,
      });
      const timer = setTimeout(
        () => finish("Submitted the newsletter form, but the result didn't come back in time. Ask the visitor to check the form."),
        RESULT_TIMEOUT_MS,
      );
    });

  modelContext.registerTool(
    {
      name: "subscribe_to_newsletter",
      description:
        "Subscribe a visitor's email to the meemur newsletter by submitting the footer subscribe form on their behalf. Confirm the visitor wants to subscribe before calling this.",
      inputSchema: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The visitor's email address to subscribe to the meemur newsletter.",
          },
        },
        required: ["email"],
      },
      // This sends data to the server, so it isn't read-only; hosts should treat
      // it as a side-effecting action and confirm with the visitor first.
      annotations: { readOnlyHint: false, openWorldHint: true },
      execute(input: SubscribeToolInput): Promise<string> {
        const email = (input?.email ?? "").trim();

        // Validate before touching the form and return a descriptive error so
        // the agent can correct the input and retry.
        if (!email) {
          return Promise.resolve("Couldn't subscribe: an email address is required.");
        }
        if (!isEmail(email)) {
          return Promise.resolve(`Couldn't subscribe: "${email}" doesn't look like a valid email address.`);
        }

        setField(emailInput, email);
        form.scrollIntoView({ behavior: "smooth", block: "center" });

        const result = waitForResult();
        // requestSubmit() runs the real submit handler (Turnstile, honeypot,
        // fetch) and fires submit validation, unlike form.submit().
        form.requestSubmit();
        return result;
      },
    },
    { signal: controller.signal },
  );
}
