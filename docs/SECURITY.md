# Security notes: NEXERA Metrics site

## What is public by design
- Firebase web config keys and the Web3Forms access key are public identifiers, not secrets. Protect them by restricting the Web3Forms key to `nexerametrics.web.app` in its dashboard and, if you add Firebase services, by Security Rules and App Check.
- Never put passwords, service-account JSON, admin tokens or `.env` files in this folder. `firebase.json` ignores dotfiles, `docs/`, `tools/`, `partials/`, `security/` and `_unused/` so they are not deployed.

## Headers (firebase.json)
CSP (scripts limited to `self` plus hashed inline scripts), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options plus `frame-ancestors 'none'`, HSTS, COOP.
If you edit an inline `<script>`, its SHA-256 hash changes: recompute it and update the CSP, or the script will be blocked. Prefer moving code to `js/` files.

## Firebase rules
This site uses Hosting only. `security/*.rules` deny all access. Do not enable Firestore, Realtime Database or Storage unless needed. If you do, deploy these first, then add narrow rules, require sign-in, and give admin roles through custom claims.

## Contact form: what is and is not protected
In the browser: required-field and format checks, text cleaning, length caps, honeypot, minimum fill time, per-browser rate limit. Nothing typed is inserted as HTML (`textContent` only).
These checks can be bypassed by someone who skips the browser. Server-side protection is provided by Web3Forms (spam filtering, key restriction). For stronger control, send the form to a Cloud Function (Blaze plan) that validates, rate-limits by IP, verifies a Firebase App Check token (reCAPTCHA Enterprise) and then emails you. Not set up yet.
Form submissions go to the Web3Forms inbox. Nothing is stored on this site.

## Private pages
There are none. If you add an admin or thank-you page: add `<meta name="robots" content="noindex">`, an `X-Robots-Tag: noindex` header in `firebase.json`, keep it out of `sitemap.xml` and `llms.txt`, and protect admin pages with Firebase Authentication plus a role check on the server.

## Maintenance
No npm runtime dependencies. Third parties used: Google Fonts and Web3Forms only. Re-check before launch and after any change.
