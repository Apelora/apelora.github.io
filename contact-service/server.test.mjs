import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { createHandler, readConfig, validate, limiter, start } from "./server.mjs";

const env = { SMTP_HOST: "smtp.invalid", MAIL_TO: "owner@example.org", MAIL_FROM: "site@example.org", ALLOWED_ORIGINS: "https://site.example/" };
const config = readConfig(env);
const ORIGIN = "https://site.example";

const post = (fields, headers = {}) => {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return new Request("http://svc/contact", { method: "POST", body, headers: { origin: ORIGIN, ...headers } });
};
const good = { name: "Alex", email: "alex@example.org", organisation: "Org", type: "demo", message: "Hello\nthere" };
const quiet = { error() {} };

test("settings: everything missing is listed at once, and a lone SMTP user is refused", () => {
  assert.throws(() => readConfig({}), /SMTP_HOST[\s\S]*MAIL_TO[\s\S]*ALLOWED_ORIGINS/);
  assert.throws(() => readConfig({ ...env, SMTP_USER: "u" }), /go together/);
  assert.deepEqual(config.origins, ["https://site.example"]);
});

test("a valid message is sent once, with the visitor as reply-to and no header injection", async () => {
  const sent = [];
  const h = createHandler(config, async (m) => sent.push(m), { log: quiet });
  const res = await h(post({ ...good, name: "Alex\r\nBcc: evil@example.org" }), "1.1.1.1");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "owner@example.org");
  assert.equal(sent[0].replyTo.address, "alex@example.org");
  assert.ok(!/[\r\n]/.test(sent[0].subject));
  assert.match(sent[0].text, /Hello\nthere/);
});

test("a robot that fills the hidden field is told it worked and nothing is sent", async () => {
  const sent = [];
  const h = createHandler(config, async (m) => sent.push(m), { log: quiet });
  const res = await h(post({ ...good, website: "http://spam" }), "2.2.2.2");
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test("other websites, bad input and wrong methods are refused", async () => {
  const sent = [];
  const h = createHandler(config, async (m) => sent.push(m), { log: quiet });
  assert.equal((await h(post(good, { origin: "https://evil.example" }), "3.3.3.3")).status, 403);
  assert.equal((await h(post({ ...good, email: "nope" }), "3.3.3.3")).status, 400);
  assert.equal((await h(post({ ...good, type: "x" }), "3.3.3.3")).status, 400);
  assert.equal((await h(post({ ...good, message: "x".repeat(5001) }), "3.3.3.3")).status, 400);
  assert.equal((await h(new Request("http://svc/contact", { method: "GET", headers: { origin: ORIGIN } }), "3.3.3.3")).status, 405);
  const pre = await h(new Request("http://svc/contact", { method: "OPTIONS", headers: { origin: ORIGIN } }), "3.3.3.3");
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(sent.length, 0);
});

test("a caller is limited per hour and told when to retry", async () => {
  const h = createHandler({ ...config, perHour: 2 }, async () => {}, { log: quiet });
  assert.equal((await h(post(good), "4.4.4.4")).status, 200);
  assert.equal((await h(post(good), "4.4.4.4")).status, 200);
  const third = await h(post(good), "4.4.4.4");
  assert.equal(third.status, 429);
  assert.ok(Number(third.headers.get("retry-after")) > 0);
  assert.equal((await h(post(good), "5.5.5.5")).status, 200);
  let t = 0;
  const l = limiter(1, () => t);
  assert.equal(l("a"), 0);
  assert.ok(l("a") > 0);
  t = 3_600_001;
  assert.equal(l("a"), 0);
});

test("a failing mail server gives 502 and the error text never reaches the visitor", async () => {
  const h = createHandler(config, async () => { throw new Error("auth failed for secret-pass"); }, { log: quiet });
  const res = await h(post(good), "6.6.6.6");
  assert.equal(res.status, 502);
  assert.ok(!(await res.text()).includes("secret-pass"));
});

test("validate trims and rejects an empty name", () => {
  const f = new FormData(); f.set("name", "  "); f.set("email", "a@b.co"); f.set("type", "demo"); f.set("message", "m");
  assert.match(validate(f).error, /Name/);
});

test("end to end: the real service hands the message to a real SMTP server", async () => {
  // A minimal SMTP server that records what it is given (no TLS, local only).
  const got = { data: "" };
  const smtp = net.createServer((s) => {
    let inData = false;
    s.write("220 sink ESMTP\r\n");
    s.on("data", (b) => {
      for (const line of b.toString().split("\r\n")) {
        if (inData) { if (line === ".") { inData = false; s.write("250 queued\r\n"); } else got.data += line + "\n"; continue; }
        if (/^EHLO/i.test(line)) s.write("250 sink\r\n");
        else if (/^(MAIL|RCPT|RSET)/i.test(line)) s.write("250 ok\r\n");
        else if (/^DATA/i.test(line)) { inData = true; s.write("354 go\r\n"); }
        else if (/^QUIT/i.test(line)) { s.write("221 bye\r\n"); s.end(); }
      }
    });
  });
  await new Promise((r) => smtp.listen(0, "127.0.0.1", r));
  const svc = start({ ...env, SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.address().port), SMTP_INSECURE: "1", PORT: "0", HOST: "127.0.0.1" });
  await new Promise((r) => svc.server.once("listening", r));
  const body = new FormData();
  for (const [k, v] of Object.entries(good)) body.set(k, v);
  const res = await fetch(`http://127.0.0.1:${svc.server.address().port}/contact`, { method: "POST", body, headers: { origin: ORIGIN } });
  assert.equal(res.status, 200);
  assert.match(got.data, /Subject: \[Website\] Request a demo: Alex/);
  assert.match(got.data, /Reply-To: .*alex@example.org/);
  assert.match(got.data, /Hello/);
  svc.transport.close(); svc.server.close(); smtp.close();
});
