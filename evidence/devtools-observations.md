# Browser (DevTools Network tab) observations

Captured on 20 Nov 2026 from a normal Chrome session on the homepage. Values come from my own connection with a partly warm cache, so absolute timings are indicative only. Personal session cookies present in raw exports are excluded from this repository.

## Load summary

| Item | Value |
|---|---|
| Requests | 45 |
| Transferred | 502 kB |
| Resources (uncompressed) | 3.5 MB |
| `DOMContentLoaded` | about 185 ms |
| HTML document | 200, 15.8 kB, 108 ms |
| `logo.svg` | 304 Not Modified, 0.1 kB, **223 ms** (slower than the HTML itself) |

## First-party requests

- Static assets under `/_next/static/` (CSS, per-route JS chunks, two self-hosted `*-s.p.woff2` fonts).
- Route-group chunks `app/(marketing)/...` for: layout, template, home, story, services, team, impact, contact, products, bitelevate.
- Error-handling chunks: `error-*.js`, `not-found-*.js`, `global-error-*.js`.
- **Ten RSC prefetch requests** (`?_rsc=...`, headers `rsc: 1`, `next-router-prefetch: 1`) to: `/story`, `/team`, `/careers`, `/impact`, `/services`, `/products`, `/case-studies`, `/blog/ai-agents-business-operations`, `/contact`, `/bitelevate`.
- Some RSC requests were revalidated with `If-None-Match` ETags; others were fetched without a validator.
- One RSC response (the blog post) showed `Cache-Control: private, no-cache` and `Age: 0` in the response headers panel. The panel was partly cut off, so the full value should be re-checked.
- First-party cookies sent: only `_ga` and `_ga_<id>` (Google Analytics). No session or auth cookie.

## Third-party requests

| Host | Request | Notes |
|---|---|---|
| `www.googletagmanager.com` | `gtag/js?id=G-...` | Loaded on first view |
| `analytics.google.com` | `g/collect?v=2...` (POST, `en=page_view`) | Fired on first view, with `npa=0` |
| `fonts.googleapis.com` | `css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap` | Full variable icon font |
| `fonts.gstatic.com` | `*.woff2` (icon font file) | |
| `auth.service.tealhq.com` | `GET /jwt_public_key` | No cookies attached; `If-None-Match` present, so the response is cacheable. Purpose and relationship to Cynbit not verified. |

## Not captured

Response bodies of the RSC and `jwt_public_key` requests, the complete cache-control values on all responses, and any request made after a user interaction (forms).
