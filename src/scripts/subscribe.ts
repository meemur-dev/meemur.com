// Progressive-enhancement handler for the newsletter subscribe form in the
// footer. Posts JSON to the /api/subscribe Pages Function. Without JS the form
// does nothing useful, so it stays hidden behind this enhancement.

export function initSubscribeForm(): void {
  const form = document.querySelector<HTMLFormElement>("#subscribe-form");
  if (!form) return;

  const status = document.querySelector<HTMLElement>("#subscribe-status");
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
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? ""), // honeypot — must stay empty
    };

    if (!payload.email) {
      setStatus("error", "Please enter your email address.");
      return;
    }

    setStatus("", "");
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = "Subscribing…";

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (res.ok && body.ok) {
        form.reset();
        setStatus("ok", "You’re in — thanks for subscribing!");
      } else {
        setStatus("error", body.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error", "Network error. Please try again.");
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}
