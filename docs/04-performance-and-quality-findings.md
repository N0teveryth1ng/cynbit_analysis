# 04. Performance, accessibility, SEO and content findings

Data: [`../evidence/crux-field-data.md`](../evidence/crux-field-data.md), [`../evidence/devtools-observations.md`](../evidence/devtools-observations.md).

## Summary

| ID | Finding | Severity | Confidence |
|---|---|---|---|
| PERF-01 | Homepage fails Core Web Vitals on mobile | Medium | Verified (field data) |
| PERF-02 | Site-wide LCP and CLS are poor | Medium | Verified (field data), cause hypothesised |
| PERF-03 | Cache policy gaps on RSC/blog responses and static assets | Low | Partially verified |
| PERF-04 | Homepage prefetches about 10 routes | Low | Verified |
| PERF-05 | Full Material Symbols font loaded from Google | Low | Verified |
| A11Y-01 | Icon ligature names exposed as page text | Medium | Verified |
| A11Y-02 | Client-logo marquee duplicated in the DOM | Low | Verified |
| SEO-01 | `og:image` / `twitter:image` is an SVG | Low | Verified |
| SEO-02 | `og:url` / `og:image` use the apex host while the site serves on `www` | Low | Verified |
| SEO-03 | Brand name duplicated in `<title>` | Informational | Verified |
| CNT-01 | Unverifiable claims and static "live" indicators | Low | Text verified, interpretation unverified |

---

## PERF-01: Homepage fails Core Web Vitals on mobile
**Severity:** Medium. **Confidence:** Verified (real-user data).

**Observed.** Mobile 75th percentile: LCP **3.1 s** (target ≤ 2.5 s), INP **204 ms** (target ≤ 200 ms), CLS 0.01, TTFB 0.9 s. Desktop passes (LCP 2.3 s).

**Why it matters.** Core Web Vitals feed Google's page-experience signals, and most visitors to a business site are on mobile.

**Likely contributors (unconfirmed, lab audits not captured).** Render-blocking Google Fonts CSS for the icon font, many JS chunks on first load, third-party analytics, and hero rendering.

**Fix.** Self-host or replace the icon font, defer non-critical scripts, size the LCP element explicitly. See [`05-recommendations.md`](05-recommendations.md).

## PERF-02: Site-wide LCP and CLS are poor
**Severity:** Medium. **Confidence:** Verified (field data); cause is a hypothesis.

**Observed.** Whole-site mobile: LCP **5.0 s** (42% of loads poor), **CLS 0.32** (37% of loads poor), TTFB 1.2 s. Whole-site desktop: LCP 4.0 s, CLS 0.12. The homepage is much better than the site as a whole, so **other pages are the problem**.

**Hypotheses to test.** (1) The icon font swapping in after text causes layout shift. (2) Images or embeds without reserved dimensions on subpages. (3) Non-homepage responses are not edge-cached (see PERF-03), which fits the higher TTFB.

**Verify.** Run PageSpeed Insights on `/blog`, `/products`, `/services` and `/bitelevate` and compare lab CLS and LCP elements.

## PERF-03: Cache policy gaps
**Severity:** Low. **Confidence:** Partially verified.

**Observed.** A blog RSC response showed `Cache-Control: private, no-cache` (header panel partly cut off). `logo.svg` is revalidated on each visit (304 in 223 ms, slower than the HTML itself).

**Why it matters.** `private` responses cannot be shared by the CDN, so each visitor pays the origin cost. Needless revalidation of static assets adds round trips.

**Fix.** Make blog and marketing routes static or ISR-cached where possible, and give non-fingerprinted public assets an explicit cache lifetime. See [`snippets/next.config.js`](../snippets/next.config.js).

## PERF-04: Aggressive route prefetching
**Severity:** Low. **Confidence:** Verified.

**Observed.** The homepage fires about ten RSC prefetch requests on load (story, team, careers, impact, services, products, case-studies, a blog post, contact, bitelevate). This contributes to 45 requests per load.

**Fix.** Use `prefetch={false}` on low-priority links, or prefetch on hover.

## PERF-05: Full Material Symbols font from Google
**Severity:** Low. **Confidence:** Verified.

**Observed.** The page requests `Material+Symbols+Outlined:wght,FILL@100..700,0..1` from `fonts.googleapis.com`, the full variable font with every axis, to render a few dozen icons.

**Why it matters.** It is render-blocking third-party CSS, a heavy download, and a connection to Google for every visitor.

**Fix.** Replace with inline SVG icons (for example `lucide-react`, which tree-shakes), or self-host a subset of the font.

## A11Y-01: Icon ligature names exposed as page text
**Severity:** Medium. **Confidence:** Verified.

**Observed.** The extracted page text contains raw icon names such as `expand_more`, `history_edu`, `groups`, `arrow_forward` and `volunteer_activism` mixed into headings and links.

**Why it matters.** Material Symbols render icons from text ligatures. Without `aria-hidden="true"`, screen readers read the names aloud, and crawlers and link previews may pick the names up as content. If the font fails to load, users see the words instead of icons.

**Fix.** `aria-hidden="true"` fixes screen readers; switching to SVG icons fixes crawlers too. See [`snippets/icon-a11y.tsx`](../snippets/icon-a11y.tsx).

## A11Y-02: Client-logo marquee duplicated in the DOM
**Severity:** Low. **Confidence:** Verified.

**Observed.** The client-name strip appears about four times in the page text, the usual pattern for an infinite CSS marquee.

**Why it matters.** Unless the duplicates are hidden, screen readers read the same list repeatedly. It also adds DOM weight.

**Fix.** Mark the duplicate copies `aria-hidden="true"` and respect `prefers-reduced-motion`.

## SEO-01: `og:image` / `twitter:image` is an SVG
**Severity:** Low. **Confidence:** Verified.

**Observed.** Both point to `https://cynbit.in/logo.svg`.

**Why it matters.** Facebook, LinkedIn and X generally do not render SVG link previews, so shared links will show no image.

**Fix.** Provide a 1200×630 PNG or JPG. See [`snippets/metadata.ts`](../snippets/metadata.ts).

## SEO-02: Apex vs `www` inconsistency
**Severity:** Low. **Confidence:** Verified for the metadata; redirect behaviour and canonical tag not checked.

**Observed.** The site serves on `www.cynbit.in`, but `og:url` and `og:image` use `cynbit.in`.

**Why it matters.** Mixed hosts can split link equity and make canonical signals ambiguous.

**Fix.** Pick one canonical host (for example `www`), 301 the other, and set `metadataBase` and `alternates.canonical`.

## SEO-03: Brand duplicated in `<title>`
**Severity:** Informational. **Confidence:** Verified.

The title reads "Cynbit Technologies | AI Automation & Software Solutions Jaipur | Cynbit Technologies". Use a title template so the brand appears once. The `meta keywords` tag is also ignored by search engines and can be removed.

## CNT-01: Unverifiable claims and static "live" indicators
**Severity:** Low. **Confidence:** Text verified; interpretation unverified.

**Observed.**
- Dashboard-style indicators ("Runtime: Active now", "Efficiency 95%", "System Stability 99.9%") look live but appear to be static decoration. No metrics request was observed on the homepage.
- Claims such as "25k+ newsletter subscribers", "50k+ users" and an ISO 9001:2015 badge cannot be checked from outside. Public company profiles list Cynbit as founded in 2024 with roughly 10 to 50 employees, which makes some figures worth substantiating.

**Why it matters.** Unsupported or misleading figures are a trust and legal risk, and "live" labels on static values can mislead.

**Fix.** Label static figures as illustrative or source them, and keep certificate claims linkable to the certificate.
