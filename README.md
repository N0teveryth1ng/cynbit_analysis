# Cynbit: Backend Technical Audit (Passive, Public-Surface Review)

**Prepared by:** Soham Das, Backend Developer Intern assessment
**Date of review:** 20 November 2026
**Target:** https://www.cynbit.in/ (public marketing site only)
**Method:** passive observation only. Everything here is what any visitor's browser or a free public scanner can see.

> I only have the outside view. Where I describe how the backend works, that is an inference from observable behaviour, and each claim is labelled with how confident I am.

## Executive summary

The site looks like a statically prerendered **Next.js (App Router)** application hosted on **Vercel**, served over HTTP/2 with a valid TLS certificate, HSTS (2 years) and edge caching. I saw no first-party session or auth cookies, no first-party JSON API calls on the homepage, and custom error/not-found boundaries are shipped. **No critical or high-severity issue was observed.**

The gaps fall into four groups:

1. **HTTP hardening.** No `Content-Security-Policy`, clickjacking protection, `nosniff`, `Referrer-Policy` or `Permissions-Policy`. MDN HTTP Observatory scores the site **50/100 (C), 9 of 12 tests passed**.
2. **Third-party and privacy handling.** The homepage calls a third-party auth service (`auth.service.tealhq.com`) for visitors who are not logged in, and Google Analytics loads on first view. Whether it waits for consent still needs checking.
3. **Real-user performance.** Chrome field data shows Core Web Vitals **failing on mobile for the homepage** and **poor across the wider site** (mobile LCP 5 s, CLS 0.32), even though the homepage itself is fast on desktop.
4. **Frontend issues with backend and SEO impact.** Icon-font names leak into page text, `og:image` is an SVG, canonical host is inconsistent, and some responses are not cacheable at the edge.

The most important backend surfaces, the **contact and newsletter endpoints**, cannot be assessed passively without submitting data, so I did not test them. [`docs/05-recommendations.md`](docs/05-recommendations.md) and [`snippets/app-api-contact-route.ts`](snippets/app-api-contact-route.ts) show how I would build and harden them.

## Findings at a glance

| ID | Finding | Severity | Confidence |
|---|---|---|---|
| SEC-01 | No Content-Security-Policy | Medium | Verified |
| SEC-02 | No clickjacking protection (`X-Frame-Options` / `frame-ancestors`) | Low | Verified |
| SEC-03 | No `X-Content-Type-Options: nosniff` | Low | Verified |
| SEC-04 | `Referrer-Policy` and `Permissions-Policy` not set | Low | Verified |
| SEC-05 | `Access-Control-Allow-Origin: *` on the HTML document | Low | Verified (scope limited) |
| SEC-06 | HSTS lacks `includeSubDomains` / `preload` | Informational | Verified |
| SEC-07 | Third-party auth-service request from public pages | Low | Request verified, purpose unverified |
| SEC-08 | Analytics may fire before consent | Medium if confirmed | Needs verification |
| PERF-01 | Homepage fails Core Web Vitals on mobile | Medium | Verified (field data) |
| PERF-02 | Site-wide LCP and CLS are poor | Medium | Verified (field data), cause hypothesised |
| PERF-03 | Cache policy gaps on RSC/blog responses and static assets | Low | Partially verified |
| PERF-04 | Homepage prefetches about 10 routes | Low | Verified |
| PERF-05 | Full Material Symbols font loaded from Google | Low | Verified |
| A11Y-01 | Icon ligature names exposed as page text | Medium | Verified |
| A11Y-02 | Client-logo marquee duplicated in the DOM | Low | Verified |
| SEO-01 | `og:image` / `twitter:image` is an SVG | Low | Verified |
| SEO-02 | `og:url` and `og:image` use the apex host while the site serves on `www` | Low | Verified |
| SEO-03 | Brand name duplicated in `<title>` | Informational | Verified |
| CNT-01 | Unverifiable claims and static "live" indicators | Low | Text verified, interpretation unverified |

Totals: 0 critical, 0 high, 5 medium (one conditional), 12 low, 2 informational.

## What the site already does well

HSTS with a 2-year lifetime, valid Let's Encrypt certificate, HTTP/2, prerendered homepage served from the edge cache, a 15.8 kB gzipped HTML document, no first-party auth cookies on the marketing site, and custom `error`, `not-found` and `global-error` boundaries. See [`docs/03-security-findings.md`](docs/03-security-findings.md#positive-controls).

## Repository map

| Path | Contents |
|---|---|
| [`docs/01-scope-and-methodology.md`](docs/01-scope-and-methodology.md) | Scope, rules of engagement, tools, severity scale, limitations |
| [`docs/02-architecture-observations.md`](docs/02-architecture-observations.md) | Stack inference, request flow, routes, caching, third parties |
| [`docs/03-security-findings.md`](docs/03-security-findings.md) | Security and data-handling findings |
| [`docs/04-performance-and-quality-findings.md`](docs/04-performance-and-quality-findings.md) | Performance, accessibility, SEO and content findings |
| [`docs/05-recommendations.md`](docs/05-recommendations.md) | Prioritised roadmap, hardened endpoint design, open questions |
| [`evidence/`](evidence/) | Scan outputs and observations the findings rely on |
| [`snippets/`](snippets/) | Tested code for the recommended fixes |

## Reading order

1. This page, then `docs/03` and `docs/04` for the findings.
2. `docs/05` and `snippets/` for the fixes.
3. `docs/01` and `docs/02` for method and architecture detail.
