# Changelog

All notable changes to rashidnisarkhan.com are recorded here.

---

## [Unreleased]

---

## 2026-03-17

### Added
- Animated SVG illustrations for all three story sections
  - Story 1 (tank): hull rumble loop + barrel recoil kick every 5s
  - Story 2 (rocket): full-body wobble/tip every 4s + three independently flickering flames
  - Story 3 (terminal): cursor block blink at 1s + scan-line sweep on 3s loop
- README.md with full architecture, third-party service configuration, and deployment instructions
- CHANGELOG.md (this file)

---

## 2026-03-16

### Added
- Per-story inline SVG illustrations (line-drawing style, floated right within each story)
  - Story 1: Pakistani tank, Chawinda 1965 (hull, turret, barrel, 5 road wheels, track)
  - Story 2: Apollo Plum Jam rocket (6 stacked jam tins, nosecone, fins, launch stand, flames)
  - Story 3: IBM 3270 COBOL terminal (CRT monitor, code lines, cursor, keyboard)
- Background section illustrations that slide in from the right on section entry
  - Home: placeholder (photo of Rashid, TBC)
  - A Life: line-drawn map of Pakistan with mountain hatching, Indus river, 5 city markers
  - Stories: covered by per-story illustrations (no section-level art)
  - Poem: rose illustration
  - Books: open book illustration
- CSS `@keyframes artSlideIn` animation triggered by JS when each slide becomes active

### Removed
- Section-level background illustrations from Gallery and Books slides

---

## 2026-03-15

### Added
- Mobile bottom navigation bar (`.mobile-nav`) — appears after user first reaches the farewell slide and persists
- "Share a Memory" added as last item in side navigation menu
- Email signup box at bottom of Publications/Books slide ("Share your email to receive excerpts")
- Responsive design pass — layout tested and adjusted for mobile viewports

### Changed
- Increased quote size on Home slide and Farewell slide for visual impact
- Next-section arrow buttons styled as green boxes (Pakistan flag green `#1c5c38`)
- "Share a Memory" heading text size increased for legibility

---

## 2026-03-14

### Added
- Voices from the Garden (Memories) section — appears below the farewell slide
  - Visitor submission form (name, relationship, memory text)
  - Moderation flow: submission → pending KV entry → admin email → approve link → live
  - Memory cards displayed in a grid, sorted newest-first
  - Rate limiting: 3 submissions per IP per 10 minutes
- Cloudflare Pages Functions
  - `functions/api/memory.js` — GET approved memories, POST submit memory
  - `functions/api/approve.js` — approve a pending memory via token link
- Cloudflare KV namespace `MEMORIES` bound in `wrangler.toml`
- Moderation email via Resend API (replaced initial MailChannels approach)
- `wrangler.toml` with KV namespace ID `a2093c962eee43a097f34bae61a608c9`

### Fixed
- Memories section was visible on initial page load — now hidden until farewell slide is active

---

## 2026-03-13

### Added
- GitHub repository created at `github.com/ahmada/rashid-nisar-khan`
- SSH key authentication configured (ed25519, added to `ahmada` GitHub account)
- Cloudflare Pages project connected to GitHub repo, auto-deploy on push to `main`
- Custom domain `rashidnisarkhan.com` configured in Cloudflare Pages
- Namecheap nameservers pointed to Cloudflare

### Fixed
- Site returning 404 — file was named `rashid-nisar-khan.html`, renamed to `index.html`
- Cloudflare build error — `wrangler.toml` had placeholder KV namespace ID, replaced with real ID

---

## 2026-03-12

### Added
- Initial single-file site (`index.html`) with full-page scroll navigation
- Eight slides: Home, A Life, Stories (×3), Poem, Legacy, Gallery, Books, Farewell
- Side navigation with slide links
- Memoir PDF linked in Books slide — Read PDF and Download buttons
  - File: `files/In_The_Gardens_of_My_Heart_Rashid_ Khan.pdf`
- BPM book card with Amazon link
- Photo gallery with 6 items, hover captions
- Wedding photo: `photos/rashid-wedding-2009.jpg`
- His poem displayed in the Poem slide
- `robots.txt` and `sitemap.xml`
- `_headers` file for Cloudflare HTTP security headers
