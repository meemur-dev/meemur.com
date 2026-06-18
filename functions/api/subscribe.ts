// POST /api/subscribe — validates a newsletter signup, checks the honeypot,
// then notifies the team of the new subscriber via Resend.
//
// Required env vars / secrets (set in the Cloudflare Pages dashboard):
//   RESEND_API_KEY        Resend API key (secret)
// Optional:
//   TURNSTILE_SECRET_KEY  Cloudflare Turnstile secret (secret) — spam check is
//                         skipped when unset
//   SUBSCRIBE_TO          recipient (default: contact@meemur.com)
//   CONTACT_FROM          verified sender (default: meemur <contact@send.meemur.com>)

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  SUBSCRIBE_TO?: string;
  CONTACT_FROM?: string;
}

interface SubscribePayload {
  email?: string;
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
  let body: SubscribePayload;
  try {
    body = (await request.json()) as SubscribePayload;
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real users never fill this in.
  if (body.company && body.company.trim() !== "") {
    return json({ ok: true }); // silently accept, drop the spam
  }

  const email = (body.email ?? "").trim();

  if (!email) {
    return json({ ok: false, error: "Please enter your email address." }, 422);
  }
  if (!isEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 422);
  }

  // Spam protection (skipped when no secret is configured)
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
    return json({ ok: false, error: "Subscriptions aren’t configured yet. Please try again later." }, 503);
  }

  const to = env.SUBSCRIBE_TO ?? "contact@meemur.com";
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
      subject: "New meemur newsletter subscriber",
      text: `New subscriber: ${email}`,
    }),
  });

  if (!res.ok) {
    return json({ ok: false, error: "Couldn’t subscribe right now. Please try again later." }, 502);
  }

  return json({ ok: true });
};
