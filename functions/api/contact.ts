// POST /api/contact — validates the contact form, checks the honeypot and a
// Cloudflare Turnstile token, then emails the message via Resend.
//
// Required env vars / secrets (set in the Cloudflare Pages dashboard):
//   RESEND_API_KEY        Resend API key (secret)
//   TURNSTILE_SECRET_KEY  Cloudflare Turnstile secret (secret)
// Optional:
//   CONTACT_TO            recipient (default: onur@meemur.com)
//   CONTACT_FROM          verified sender (default: meemur <contact@send.meemur.com>)

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot
  token?: string; // Turnstile response
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const isEmail = (v: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real users never fill this in.
  if (body.company && body.company.trim() !== "") {
    return json({ ok: true }); // silently accept, drop the spam
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return json({ ok: false, error: "Please fill in your name, email, and message." }, 422);
  }
  if (!isEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 422);
  }
  if (message.length > 5000) {
    return json({ ok: false, error: "That message is a little too long." }, 422);
  }

  // Spam protection
  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      body.token ?? "",
      request.headers.get("CF-Connecting-IP"),
    );
    if (!ok) {
      return json({ ok: false, error: "Spam check failed. Please try again." }, 403);
    }
  }

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "Email is not configured yet. Please email onur@meemur.com." }, 503);
  }

  const to = env.CONTACT_TO ?? "onur@meemur.com";
  const from = env.CONTACT_FROM ?? "meemur <contact@send.meemur.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `New meemur enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    return json({ ok: false, error: "Couldn't send right now. Please email onur@meemur.com." }, 502);
  }

  return json({ ok: true });
};
