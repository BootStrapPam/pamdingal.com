const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request body." }, 400);
    }

    const { name, email, message } = body ?? {};

    if (!name || !email || !message) {
      return json({ ok: false, error: "All fields are required." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Invalid email address." }, 400);
    }

    // Send via MailChannels (free on Cloudflare Workers with DKIM configured)
    // Setup guide: https://support.mailchannels.com/hc/en-us/articles/16918954360845
    const payload = {
      personalizations: [
        {
          to: [{ email: env.CONTACT_EMAIL ?? "pamdingal@apiis.org", name: "Pam Dingal" }],
          dkim_domain: env.DKIM_DOMAIN,        // your domain, e.g. "pamdingal.com"
          dkim_selector: env.DKIM_SELECTOR,    // e.g. "mailchannels"
          dkim_private_key: env.DKIM_PRIVATE_KEY,
        },
      ],
      from: { email: "contact@pamdingal.com", name: "Portfolio Contact Form" },
      reply_to: { email, name },
      subject: `New message from ${name} — pamdingal.com`,
      content: [
        {
          type: "text/plain",
          value: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        },
      ],
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (resp.status >= 400) {
      const errText = await resp.text();
      console.error("MailChannels error:", resp.status, errText);
      return json({ ok: false, error: "Could not deliver message. Please try again." }, 500);
    }

    return json({ ok: true, message: "Message sent!" });
  },
};

function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS });
}
