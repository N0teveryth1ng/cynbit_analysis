# Real-user performance (Chrome UX Report via PageSpeed Insights)

Report date: 20 Nov 2026. Collection period: 22 Oct to 18 Nov 2026 (28 days). 75th-percentile values.

"Good" thresholds: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, FCP ≤ 1.8 s, TTFB ≤ 0.8 s.

| Scope | Device | LCP | INP | CLS | FCP | TTFB | Core Web Vitals |
|---|---|---|---|---|---|---|---|
| Homepage (URL) | Mobile | 3.1 s | 204 ms | 0.01 | 2.0 s | 0.9 s | **Failed** |
| Whole site (origin) | Mobile | 5.0 s | 178 ms | 0.32 | 3.0 s | 1.2 s | **Failed** |
| Homepage (URL) | Desktop | 2.3 s | 114 ms | 0.01 | 1.1 s | 0.5 s | Passed |
| Whole site (origin) | Desktop | 4.0 s | 77 ms | 0.12 | 2.1 s | 0.8 s | **Failed** |

## Share of page loads rated "poor"

| Scope | LCP poor (> 4 s) | CLS poor (> 0.25) |
|---|---|---|
| Homepage, mobile | 17% | 0% |
| Whole site, mobile | 42% | 37% |
| Homepage, desktop | 10% | 3% |
| Whole site, desktop | 25% | 14% |

## Reading these numbers

- The homepage is the best-performing page; the rest of the site pulls the origin numbers down.
- Mobile is worse than desktop everywhere except INP.
- These are field data for real visitors, so they are stronger evidence than a single lab run.
- Lighthouse lab audits (opportunities and diagnostics) were not captured, so the causes in the findings are hypotheses.
