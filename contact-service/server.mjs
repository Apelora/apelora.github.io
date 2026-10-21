// Receives the contact form of the website and sends it as an email through an SMTP server.
// Everything that varies (SMTP server, credentials, recipient, allowed website origins) is an
// environment variable: see README.md. Nothing secret is in this repository or in the web page.
import http from "node:http";
import { pathToFileURL } from "node:url";
import nodemailer from "nodemailer";

export const TYPES = {
  demo: "Request a demo",
  deployment: "Quote: deployment",
  support: "Quote: support",
  custom: "Quote: integration, training or a larger deployment",
  other: "Something else",
};
const MAX_BODY = 32 * 1024;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

const bool = (v, d) => (v === undefined || v === "" ? d : /^(1|true|yes|on)$/i.test(v));
const int = (v, d) => (v === undefined || v === "" ? d : Number.parseInt(v, 10));

/** Reads and checks the settings. Throws one error that lists everything that is wrong. */
export function readConfig(env = process.env) {
  const c = {
    port: int(env.PORT, 8787),
    host: env.HOST || "127.0.0.1",
    smtp: {
      host: env.SMTP_HOST,
      port: int(env.SMTP_PORT, 587),
      secure: bool(env.SMTP_SECURE, false), // true: TLS from the first byte (usually port 465); false: STARTTLS (587)
      requireTLS: !bool(env.SMTP_INSECURE, false), // refuse to send the password or the message unencrypted
      user: env.SMTP_USER || undefined,
      pass: env.SMTP_PASS || undefined,
    },
    to: env.MAIL_TO,
    from: env.MAIL_FROM || env.SMTP_USER,
    origins: (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean),
    perHour: int(env.RATE_PER_HOUR, 5),
    trustProxy: bool(env.TRUSTED_PROXY, false),
  };
  const bad = [];
  if (!c.smtp.host) bad.push("SMTP_HOST is required");
  if (!c.to) bad.push("MAIL_TO is required (who receives the messages)");
  if (!c.from) bad.push("MAIL_FROM is required (or SMTP_USER, which is then used)");
  if (!c.origins.length) bad.push("ALLOWED_ORIGINS is required (the website's address, for example https://apelora.github.io)");
  if (Boolean(c.smtp.user) !== Boolean(c.smtp.pass)) bad.push("SMTP_USER and SMTP_PASS go together");
  if (!Number.isInteger(c.port) || !Number.isInteger(c.smtp.port)) bad.push("PORT and SMTP_PORT must be numbers");
  if (bad.length) throw new Error(`Settings are not complete:\n- ${bad.join("\n- ")}`);
  return c;
}

const oneLine = (s, max) => String(s ?? "").replace(/[\r\n\t\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/** Checks the submitted form. Returns { value } or { error }. */
export function validate(form) {
  const get = (k) => (typeof form.get(k) === "string" ? form.get(k) : "");
  const name = oneLine(get("name"), 200);
  const email = oneLine(get("email"), 254);
  const organisation = oneLine(get("organisation"), 200);
  const type = get("type");
  const message = get("message").replace(/\r\n?/g, "\n").trim();
  if (!name) return { error: "Name is required." };
  if (!EMAIL.test(email)) return { error: "A valid email address is required." };
  if (!Object.hasOwn(TYPES, type)) return { error: "Choose what the message is about." };
  if (!message) return { error: "A message is required." };
  if (message.length > 5000) return { error: "The message is too long (5000 characters at most)." };
  return { value: { name, email, organisation, type, message } };
}

export function compose(v, c) {
  return {
    from: c.from,
    to: c.to,
    replyTo: { name: v.name, address: v.email },
    subject: oneLine(`[Website] ${TYPES[v.type]}: ${v.name}`, 200),
    text: [`From: ${v.name} <${v.email}>`, `Organisation: ${v.organisation || "-"}`, `About: ${TYPES[v.type]}`, "", v.message, ""].join("\n"),
  };
}

/** A sliding window per caller: at most `limit` messages in an hour. */
export function limiter(limit, now = () => Date.now()) {
  const seen = new Map();
  return (key) => {
    const t = now();
    const recent = (seen.get(key) ?? []).filter((x) => t - x < 3_600_000);
    if (limit > 0 && recent.length >= limit) {
      seen.set(key, recent);
      return Math.ceil((3_600_000 - (t - recent[0])) / 1000);
    }
    recent.push(t);
    seen.set(key, recent);
    if (seen.size > 10_000) for (const [k, v] of seen) if (!v.some((x) => t - x < 3_600_000)) seen.delete(k);
    return 0;
  };
}

/** The request handler: a web-standard Request in, a Response out. `send(mail)` delivers one email. */
export function createHandler(config, send, { log = console, now } = {}) {
  const allowed = new Set(config.origins);
  const wait = limiter(config.perHour, now);
  const json = (status, body, headers = {}) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });

  return async (req, client) => {
    const url = new URL(req.url);
    if (url.pathname === "/healthz") return json(200, { ok: true });
    if (url.pathname !== "/" && url.pathname !== "/contact") return json(404, { error: "Not found." });

    const origin = (req.headers.get("origin") || "").replace(/\/$/, "");
    const cors = allowed.has(origin) ? { "access-control-allow-origin": origin, vary: "Origin" } : { vary: "Origin" };
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...cors, "access-control-allow-methods": "POST", "access-control-allow-headers": "content-type", "access-control-max-age": "600" } });
    }
    if (req.method !== "POST") return json(405, { error: "Use POST." }, { ...cors, allow: "POST, OPTIONS" });
    if (!allowed.has(origin)) return json(403, { error: "This website is not allowed to send messages here." }, cors);

    const type = req.headers.get("content-type") || "";
    if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)/i.test(type)) return json(415, { error: "Send a form." }, cors);
    if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return json(413, { error: "That is too large." }, cors);

    let form;
    try {
      form = await req.formData();
    } catch {
      return json(400, { error: "The form could not be read." }, cors);
    }

    // A person never sees or fills this field. A robot that does is told it worked, and nothing is sent.
    if (oneLine(form.get("website"), 10)) return json(200, { ok: true }, cors);

    const retry = wait(client);
    if (retry) return json(429, { error: "Too many messages from your address. Try again later." }, { ...cors, "retry-after": String(retry) });

    const checked = validate(form);
    if (checked.error) return json(400, { error: checked.error }, cors);
    try {
      await send(compose(checked.value, config));
    } catch (e) {
      log.error(`mail not sent: ${oneLine(e?.message, 300)}`); // the message never includes the password
      return json(502, { error: "The message could not be sent. Try again later." }, cors);
    }
    return json(200, { ok: true }, cors);
  };
}

/** Wraps the handler for Node's http server. */
export function listener(handle, config) {
  return async (req, res) => {
    try {
      const forwarded = String(req.headers["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
      const client = (config.trustProxy && forwarded.at(-1)) || req.socket.remoteAddress || "unknown";
      const chunks = [];
      let size = 0;
      let tooBig = false;
      if (req.method === "POST") {
        for await (const chunk of req) {
          size += chunk.length;
          if (size > MAX_BODY) { tooBig = true; break; }
          chunks.push(chunk);
        }
      }
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
      if (tooBig) headers.set("content-length", String(MAX_BODY + 1));
      const request = new Request(`http://${req.headers.host || "localhost"}${req.url}`, {
        method: req.method,
        headers,
        body: req.method === "POST" && !tooBig ? Buffer.concat(chunks) : undefined,
      });
      const response = await handle(request, client);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (e) {
      console.error(`unexpected: ${oneLine(e?.message, 300)}`);
      if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Something went wrong." }));
    }
  };
}

export function start(env = process.env) {
  const config = readConfig(env);
  const transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    requireTLS: config.smtp.requireTLS && !config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    connectionTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const server = http.createServer(listener(createHandler(config, (mail) => transport.sendMail(mail)), config));
  server.listen(config.port, config.host, () => console.log(`contact service on http://${config.host}:${config.port}, sending to ${config.to} through ${config.smtp.host}:${config.smtp.port}`));
  return { server, transport, config };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    start();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
