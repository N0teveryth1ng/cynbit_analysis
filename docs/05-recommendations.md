# 05. Recommended improvements

Every item links back to the finding it fixes. Code is in [`../snippets/`](../snippets/) and has been syntax-checked; the contact handler was also run against a local test of each branch.

## Prioritised roadmap

| Priority | Effort | Change | Fixes | Snippet |
|---|---|---|---|---|
| P1 | S | Add security headers; start CSP in report-only mode | SEC-01 to SEC-04 | [`next.config.js`](../snippets/next.config.js) |
| P1 | M | Confirm and harden the contact and newsletter endpoints (validation, rate limit, honeypot, uniform errors) | Hypotheses in `03` | [`app-api-contact-route.ts`](../snippets/app-api-contact-route.ts) |
| P1 | S | Check whether analytics fire before consent; gate GA behind opt-in | SEC-08 | [`consent-analytics.tsx`](../snippets/consent-analytics.tsx) |
| P2 | M | Replace the Material Symbols font with inline SVGs (also hides ligature text) | PERF-05, A11Y-01 | [`icon-a11y.tsx`](../snippets/icon-a11y.tsx) |
| P2 | M | Find the pages with poor CLS and LCP using PageSpeed on each subpage; reserve image dimensions | PERF-01, PERF-02 | n/a |
| P2 | S | Make blog and marketing routes static or ISR so responses are edge-cacheable; set a cache lifetime on `/public` assets | PERF-03 | [`next.config.js`](../snippets/next.config.js) |
| P2 | S | Explain or remove the `tealhq.com` request on public pages | SEC-07 | n/a |
| P3 | S | Fix metadata: raster `og:image`, single canonical host, title template | SEO-01 to SEO-03 | [`metadata.ts`](../snippets/metadata.ts) |
| P3 | S | `prefetch={false}` on low-priority links | PERF-04 | below |
| P3 | S | Publish `security.txt` and create the reporting mailbox | Disclosure | [`security.txt`](../snippets/security.txt) |
| P3 | S | Substantiate or relabel claims and static "live" indicators | CNT-01 | n/a |

Effort: S under half a day, M one to two days.

## Design notes for the public write endpoints

The contact and newsletter forms are the only places where visitors send data to Cynbit, so they deserve the most attention. The reference handler in [`app-api-contact-route.ts`](../snippets/app-api-contact-route.ts) applies these ideas in order, cheapest check first:

1. **Origin check.** Reject browser posts that do not come from the site.
2. **Content type and body size.** Fail early on the wrong format or oversized bodies.
3. **Rate limiting** by client IP. The demo uses memory; production needs a shared store because serverless instances do not share state.
4. **Honeypot** field. Bots that fill it get a fake success, which gives them nothing to adapt to.
5. **Schema validation** with length limits and trimming, returning field errors only.
6. **Uniform error format** (`application/problem+json`) with a request id and no stack traces or library messages.
7. **Safe logging.** Record the request id and error class, never message contents or email addresses.
8. **Newsletter specifics.** Use double opt-in, one-click unsubscribe, and never confirm whether an address is already subscribed.

Add CAPTCHA (Turnstile or hCaptcha) if bot traffic appears; verify the token on the server.

## Small code changes

**Reduce prefetching (PERF-04)**

```tsx
import Link from 'next/link';

// Low-priority destinations: skip the automatic prefetch.
<Link href="/careers" prefetch={false}>Careers</Link>
```

**Mark the duplicated marquee copy as decorative (A11Y-02)**

```tsx
<ul className="marquee-track">{clients.map(renderLogo)}</ul>
<ul className="marquee-track" aria-hidden="true">{clients.map(renderLogo)}</ul>
```

**Redirect the non-canonical host (SEO-02).** The simplest route is the hosting dashboard's domain settings: add `cynbit.in` and set it to redirect permanently (301) to `www.cynbit.in`. Check first whether this is already configured.

## How to verify each fix

| Change | Check |
|---|---|
| Headers | Rescan with securityheaders.com and MDN Observatory; target is no missing headers and a higher score |
| CSP | Browser console shows no violation reports on key pages before enforcing |
| Endpoint hardening | Test in a staging environment you own: valid, invalid, oversized, and repeated requests |
| Consent | Incognito session, Network tab: no `collect` request before a choice |
| Performance | Re-run PageSpeed on `/`, `/blog`, `/products`; compare CLS and LCP; then watch field data for 28 days |
| Metadata | Paste the URL into the LinkedIn Post Inspector and Facebook Sharing Debugger |

## Limitations and next steps

This audit covers the public homepage and traffic its own prefetching generates. To make it complete, a future pass (with the owner's permission) should cover: the contact and newsletter endpoints end to end, the names of the failed Observatory tests, Lighthouse lab audits for slow subpages, SPF/DKIM/DMARC records, `robots.txt` and `sitemap.xml`, the 404 page, and a clean-session consent test.
