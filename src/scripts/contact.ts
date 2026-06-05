// Progressive-enhancement handler for the contact form on /about#contact.
// Posts JSON to the /api/contact Pages Function. If JS is unavailable, the
// visible mailto link beside the form is the fallback.

interface TurnstileApi {
  reset?: (widget?: string) => void;
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("#contact-form");
  if (!form) return;

  const status = document.querySelector<HTMLElement>("#contact-status");
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const setStatus = (kind: "ok" | "error" | "", msg: string) => {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (kind ? ` form-status--${kind}` : "");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!submit) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      company: String(data.get("company") ?? ""), // honeypot — must stay empty
      token: String(data.get("cf-turnstile-response") ?? ""),
    };

    setStatus("", "");
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = "Sending…";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (res.ok && body.ok) {
        form.reset();
        setStatus("ok", "Thanks — your message is on its way. I’ll get back to you shortly.");
      } else {
        setStatus("error", body.error || "Something went wrong. Please email onur@meemur.com directly.");
      }
    } catch {
      setStatus("error", "Network error. Please email onur@meemur.com directly.");
    } finally {
      submit.disabled = false;
      submit.textContent = label;
      (window as unknown as { turnstile?: TurnstileApi }).turnstile?.reset?.();
    }
  });
}
