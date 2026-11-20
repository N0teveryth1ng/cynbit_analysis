# MDN HTTP Observatory result

Scan target: `https://www.cynbit.in/`
Scan date: 20 Nov 2026

| Metric | Value |
|---|---|
| Grade | **C** |
| Score | **50 / 100** |
| Tests passed | **9 / 12** |

## What was and was not captured

Only the summary panel was captured. The names of the 3 failed tests were **not** recorded, so I do not attribute the failures to specific tests here.

The result is consistent with the header gaps in [`headers-securityheaders.txt`](headers-securityheaders.txt), most likely the missing Content-Security-Policy. To close this gap, rerun the scan and record the list of failed tests.
