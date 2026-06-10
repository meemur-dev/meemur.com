// POST /api/subscribe — validates a newsletter signup, checks the honeypot,
// then notifies the team of the new subscriber via Resend.
//
// Required env vars / secrets (set in the Cloudflare Pages dashboard):
//   RESEND_API_KEY        Resend API key (secret)
// Optional:
//   SUBSCRIBE_TO          recipient (default: onur@meemur.com)
//   CONTACT_FROM          verified sender (default: meemur <contact@send.meemur.com>)

interface Env {
  RESEND_API_KEY: string;
  SUBSCRIBE_TO?: string;
  CONTACT_FROM?: string;
}

interface SubscribePayload {
  email?: string;
  company?: string; // honeypot
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const isEmail = (v: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

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

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "Subscriptions aren’t configured yet. Please try again later." }, 503);
  }

  const to = env.SUBSCRIBE_TO ?? "onur@meemur.com";
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
