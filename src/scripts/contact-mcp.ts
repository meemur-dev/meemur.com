// WebMCP (Web Model Context Protocol) integration for the contact form.
//
// Exposes one client-side tool so an in-browser AI agent can fill in a
// visitor's contact details for them. The tool *fills* the form — it does not
// send it. The visitor still reviews the draft and presses "Send message"
// themselves. That's deliberate:
//   * Sending a message to a real person is a high-impact action; the WebMCP
//     guidance is to keep a human in the loop rather than auto-submit.
//   * Leaving the actual submit to the visitor means the Cloudflare Turnstile
//     token and the spam honeypot stay valid for a genuine submission.
//
// We use the imperative API (document.modelContext.registerTool) rather than
// annotating the <form> declaratively: the form carries a honeypot field
// ("company") that must stay empty, and a synthesized declarative schema would
// expose it to the agent — every agent-assisted message would then be dropped
// as spam. The imperative schema lists only name, email, and message.
//
// Progressive enhancement: the whole thing is feature-detected, so browsers
// without WebMCP simply skip it and the form keeps working as normal.

interface ContactToolInput {
  name?: string;
  email?: string;
  message?: string;
}

interface ContactTool {
  name: string;
  description: string;
  inputSchema: unknown;
  execute: (input: ContactToolInput) => string;
  annotations?: Record<string, unknown>;
}

interface ModelContext {
  registerTool: (tool: ContactTool, options?: { signal?: AbortSignal }) => void;
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

export function initContactMcp(): void {
  const modelContext = getModelContext();
  if (!modelContext) return;

  const form = document.querySelector<HTMLFormElement>("#contact-form");
  if (!form) return;

  const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
  const messageInput = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  if (!nameInput || !emailInput || !messageInput) return;

  // No unregisterTool() exists — abort the signal to tear the tool down when
  // the page goes away, so it can't leak or collide on a back/forward restore.
  const controller = new AbortController();
  window.addEventListener("pagehide", () => controller.abort(), { once: true });

  const setField = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    el.value = value;
    // Mirror a real edit so any listeners (and form state) stay in sync.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  modelContext.registerTool(
    {
      name: "fill_contact_message",
      description:
        "Fill the meemur contact form with a visitor's name, email, and message so they can review and send it. This does NOT send the message — the visitor submits it themselves after reviewing.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "The visitor's full name." },
          email: {
            type: "string",
            description: "The visitor's email address, so meemur can reply.",
          },
          message: { type: "string", description: "The message to send to meemur." },
        },
        required: ["name", "email", "message"],
      },
      execute(input: ContactToolInput): string {
        const name = (input?.name ?? "").trim();
        const email = (input?.email ?? "").trim();
        const message = (input?.message ?? "").trim();

        // Validate before touching the form and return a descriptive error so
        // the agent can correct the input and retry.
        if (!name || !email || !message) {
          return "Couldn't fill the form: name, email, and message are all required. Please provide all three.";
        }
        if (!isEmail(email)) {
          return `Couldn't fill the form: "${email}" doesn't look like a valid email address.`;
        }
        if (message.length > 5000) {
          return "Couldn't fill the form: the message is too long (5000 characters max). Please shorten it.";
        }

        setField(nameInput, name);
        setField(emailInput, email);
        setField(messageInput, message);
        form.scrollIntoView({ behavior: "smooth", block: "center" });

        return "Filled the contact form with the provided name, email, and message. Ask the visitor to review the details and press the “Send message” button — meemur only sends the message once the visitor confirms.";
      },
    },
    { signal: controller.signal },
  );
}
