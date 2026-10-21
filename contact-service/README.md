# Contact service

Receives the website's contact form and sends it to you as an email through your own SMTP server. GitHub Pages serves only files, and an SMTP password must never be in a web page, so this small program runs somewhere you control and the page posts to it.

It has one dependency (`nodemailer`, MIT-0) and needs Node.js 20 or newer. Everything that varies is an environment variable; nothing secret is in this repository.

| Variable | Meaning |
|---|---|
| `SMTP_HOST`, `SMTP_PORT` | Your SMTP server (default port 587, which starts with STARTTLS) |
| `SMTP_SECURE` | `true` for TLS from the first byte (usually port 465) |
| `SMTP_USER`, `SMTP_PASS` | The mailbox login; both or neither |
| `MAIL_FROM` | The sender address (defaults to `SMTP_USER`); your provider usually requires it to be a mailbox you own |
| `MAIL_TO` | Who receives the messages |
| `ALLOWED_ORIGINS` | The website's address, for example `https://apelora.github.io`; a comma-separated list; other sites are refused |
| `PORT`, `HOST` | Where it listens (default `127.0.0.1:8787`) |
| `RATE_PER_HOUR` | Messages per caller address per hour (default 5; 0 turns it off) |
| `TRUSTED_PROXY` | `true` when a reverse proxy sits in front: the caller is then the last address in `X-Forwarded-For` |
| `SMTP_INSECURE` | `true` allows an SMTP server without encryption; for local testing only |

```sh
cd contact-service && npm ci
SMTP_HOST=... SMTP_USER=... SMTP_PASS=... MAIL_TO=... ALLOWED_ORIGINS=https://apelora.github.io node server.mjs
npm test        # includes a real SMTP conversation with a local test server
```

Put it behind HTTPS (a reverse proxy or your platform's TLS), then set `endpoint` in `assets/js/config.js` to its address (`https://…/contact`), rebuild, and update the privacy section of `src/pages/legal.html` to say where the message goes.

What it does with a message: accepts the form (`multipart/form-data` or URL-encoded, 32 KB at most), checks the fields, drops it silently if the hidden `website` field is filled, limits each caller, and sends one plain-text email with the visitor as `Reply-To` so you answer from your mail program. Nothing is stored. A failed send is `502` and the error text, which could mention the server, is only logged.
