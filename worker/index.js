const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/contact") {
      return new Response("Not Found", { status: 404 });
    }

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

    try {
      await env.DB.prepare(
        "INSERT INTO contacts (name, email, message, submitted_at) VALUES (?, ?, ?, ?)"
      )
        .bind(name, email, message, new Date().toISOString())
        .run();
    } catch (err) {
      console.error("D1 insert error:", err);
      return json({ ok: false, error: "Could not save your message. Please try again." }, 500);
    }

    return json({ ok: true, message: "Message received! I will get back to you soon." });
  },
};

function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS });
}
