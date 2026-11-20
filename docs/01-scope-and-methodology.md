# 01. Scope and methodology

## Scope

In scope: the public marketing site at `https://www.cynbit.in/`, as seen by an ordinary visitor.

Out of scope: product applications (TenantEase, Revio, Cynbit Studio), any login or admin area, any third-party domain, and anything that would require sending data to Cynbit's systems.

## Rules I followed

The assignment allows passive and authorized testing only. In practice:

**Done**
- Loaded the homepage as a normal visitor and read what came back.
- Read my own browser's Network tab for the requests that page makes by itself.
- Ran the homepage through free public scanners that perform standard single-page checks.

**Not done**
- No forms were submitted, no payloads were sent, and nothing was fuzzed or brute-forced.
- No path enumeration, no guessing of `.map` files, no requests to hidden or undocumented URLs.
- No requests to `auth.service.tealhq.com` or any other third-party domain beyond what the visitor's browser makes by itself.
- No load or stress testing.
- No credentials, tokens or personal data are included in this repository. Raw browser exports contain session cookies; they were deliberately left out of the evidence.

## Tools and sources

| Source | Used for |
|---|---|
| Chrome DevTools, Network tab | Request list, timings, status codes, request headers |
| securityheaders.com | Response headers and header grading |
| MDN HTTP Observatory | Overall header and configuration score |
| PageSpeed Insights (Chrome UX Report) | Real-user Core Web Vitals, last 28 days |
| Online HTTPS and availability checker | Certificate chain, expiry, response time |
| Public page fetch of the homepage | Rendered text, metadata, links |

## Severity scale

| Level | Meaning |
|---|---|
| Critical / High | Exploitable weakness with serious impact. **None observed.** |
| Medium | Meaningfully raises risk, hurts users or the business, or is a likely compliance concern |
| Low | Hardening gap or quality issue with limited impact on its own |
| Informational | Best-practice note |

## Confidence labels

| Label | Meaning |
|---|---|
| Verified | Directly observed in evidence in this repository |
| Partially verified | Observed in part; one detail still needs confirmation |
| Needs verification | Plausible from indirect signals, not observed |

## Limitations

These were not assessed, and any conclusion about them would be a guess:

- Form markup and behaviour (contact, newsletter), including validation, rate limiting and bot protection.
- Response bodies of the RSC prefetch requests, and any first-party API.
- The names of the 3 failed Observatory tests (only the overall result was captured).
- Lighthouse lab audits (only real-user field data was captured).
- Email-domain records (SPF, DKIM, DMARC), `robots.txt`, `sitemap.xml`, `security.txt`, source-map exposure, and the 404 page.
- Whether analytics wait for consent (needs a clean incognito session).
- Subpages other than the homepage: contact, privacy, products, blog and the rest were not retrieved.
- Everything about server-side code, databases and infrastructure behind Vercel.

Because of this, statements about the backend use words like "suggests" and "consistent with".
