# rashidnisarkhan.com

Memorial website for Rashid Nisar Khan (1952–2013) — poet, entrepreneur, and founder of Sintech Inc. and Ultimus Inc.

---

## Architecture

Single-file static site (`index.html`) deployed on **Cloudflare Pages** from this GitHub repository. No build step, no framework, no dependencies.

```
/
├── index.html              # Entire site — HTML, CSS, and JS in one file
├── wrangler.toml           # Cloudflare Pages + KV binding config
├── _headers                # Cloudflare HTTP response headers
├── robots.txt
├── sitemap.xml
├── files/
│   └── In_The_Gardens_of_My_Heart_Rashid_ Khan.pdf   # Memoir PDF (1.5 MB)
├── photos/
│   └── rashid-wedding-2009.jpg
└── functions/
    └── api/
        ├── memory.js       # GET approved memories / POST submit memory
        ├── approve.js      # GET approve a pending memory (email link)
        └── subscribe.js    # Email signup handler
```

---

## Third-Party Services

### Cloudflare Pages
- **Purpose:** Static site hosting and serverless functions
- **Repo connected:** `github.com/ahmada/rashid-nisar-khan`
- **Branch:** `main` — every push auto-deploys
- **Custom domain:** `rashidnisarkhan.com` (configured in Pages → Custom Domains)
- **KV namespace:** `MEMORIES` — stores pending and approved visitor memories
  - Namespace ID: `a2093c962eee43a097f34bae61a608c9`
  - Binding name used in code: `env.MEMORIES`
- **Environment variables** (set in Pages → Settings → Environment Variables):
  - `ADMIN_EMAIL` — receives moderation emails for new memory submissions
  - `RESEND_API_KEY` — API key for sending email via Resend

### Namecheap (Domain Registrar)
- **Domain:** `rashidnisarkhan.com`
- **Nameservers:** Pointed to Cloudflare (set in Namecheap → Domain → Nameservers → Custom DNS)
- DNS is fully managed in Cloudflare DNS, not Namecheap

### GitHub
- **Account:** `ahmada`
- **Repo:** `https://github.com/ahmada/rashid-nisar-khan`
- **Auth:** SSH key (`~/.ssh/id_ed25519`) added to GitHub account
- Cloudflare Pages pulls from this repo automatically on push

### Resend
- **Purpose:** Transactional email — sends moderation emails to admin when a memory is submitted
- **Sending address:** `memories@rashidnisarkhan.com`
- **API key location:** Cloudflare Pages environment variable `RESEND_API_KEY`
- DNS records required (add in Cloudflare DNS):
  - SPF record on `rashidnisarkhan.com`
  - DKIM record provided by Resend dashboard

---

## Memories Feature

Visitors can submit a memory of Rashid on the site. The flow:

1. Visitor submits name, relationship, and memory text via the form
2. `POST /api/memory` stores the submission as `pending:{token}` in KV (30-day TTL)
3. Admin receives a moderation email via Resend with an **Approve** link
4. Clicking the link calls `GET /api/approve?token={token}`
5. Memory moves from `pending:{token}` → `approved:{id}` in KV (no expiry)
6. `GET /api/memory` returns all approved memories, sorted newest-first

**Rate limiting:** 3 submissions per IP per 10 minutes (enforced in KV).

**KV key prefixes:**
- `pending:{uuid}` — awaiting moderation
- `approved:{timestamp_random}` — live on site
- `ratelimit:{ip}` — rate limit counter (TTL 600s)

---

## Site Structure

The site is a full-page scroll divided into named slides, navigated by JS:

| Slide ID    | Content                          |
|-------------|----------------------------------|
| `home`      | Opening quote, hero              |
| `life`      | Pakistan map, biographical intro |
| `stories`   | Three illustrated stories        |
| `poem`      | His poem — rose illustration     |
| `legacy`    | Business legacy                  |
| `gallery`   | Photo gallery                    |
| `books`     | Memoir PDF + BPM book            |
| `farewell`  | Closing slide                    |

The **Memories / Voices from the Garden** section is rendered below the farewell slide and is hidden until the user reaches the farewell slide.

---

## SVG Illustrations

Each story has an inline animated SVG (`float: right` within the story body):

- **Story 1 (tank):** hull rumbles continuously; barrel kicks back every 5s
- **Story 2 (rocket):** body wobbles and tips every 4s; three flames flicker independently
- **Story 3 (terminal):** cursor blinks at 1s; scan-line sweeps down the screen on a 3s loop

Background section illustrations slide in from the right as each slide becomes active (`.section-art` + `.art-visible` CSS class toggled by JS).

---

## Local Development

```bash
npm install -g wrangler
wrangler pages dev . --kv MEMORIES
```

Requires a local KV binding. For full email testing, set `RESEND_API_KEY` and `ADMIN_EMAIL` as environment variables or in a `.dev.vars` file (not committed).

```
# .dev.vars  (gitignored)
RESEND_API_KEY=re_...
ADMIN_EMAIL=you@example.com
```

---

## Deployment

```bash
git add .
git commit -m "your message"
git push origin main
```

Cloudflare Pages builds and deploys automatically. Typical deploy time: 30–60 seconds.
