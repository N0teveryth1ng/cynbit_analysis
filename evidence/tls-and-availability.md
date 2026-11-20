# TLS certificate and availability check

Source: online HTTPS certificate and availability checker, 20 Nov 2026.

## Certificate chain

| Level | Common name | Issuer | Valid from | Valid to | Algorithm |
|---|---|---|---|---|---|
| Leaf | www.cynbit.in | YR2 (Let's Encrypt intermediate) | 24 Sep 2026 | 23 Dec 2026 | sha256RSA |
| Intermediate | YR2 | Root YR | 2 Sep 2025 | 2 Sep 2028 | sha256RSA |
| Cross-signed root | Root YR | ISRG Root X1 | 12 May 2026 | 2 Sep 2032 | sha256RSA |
| Root | ISRG Root X1 | ISRG Root X1 | 4 Jun 2015 | 4 Jun 2035 | sha256RSA |

The leaf certificate had **34 days** remaining at the time of the check. This is normal for a 90-day Let's Encrypt certificate that renews automatically.

## Availability tests

| Test | Result |
|---|---|
| HTTP connect | 200 OK |
| HTTP delay check | Success, 82 ms response |
| HTTPS certificate check | OK |
| HTTPS certificate expiration | OK |

## Takeaway

TLS is correctly configured and healthy. The only operational note is to monitor renewal, since a failed auto-renewal would show up as an expiry in about a month.
