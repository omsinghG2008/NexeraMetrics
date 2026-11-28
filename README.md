# NEXERA Metrics website

Static multi-page HTML, CSS and JavaScript, hosted on Firebase Hosting (https://nexerametrics.web.app). No framework and no build step needed to view it.

Preview locally: `python3 -m http.server` then open http://localhost:8000.
Deploy: `firebase deploy --only hosting` (uses `firebase.json`).

## Pages
`index.html` (home), `services.html`, `company.html`, `projects.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html`. Each is a real HTML file, so every route works on direct open and refresh and crawlers read the content without JavaScript. Short paths such as `/services` redirect (301) to `/services.html`.

## Folders
- `partials/` header and footer. Edit there, then run `python3 tools/sync-partials.py`.
- `css/` tokens, base, layout, components, `sections.css` (shared sections), `pages/` (one file per page).
- `js/` scripts. `team-data.js` is the single place to edit the team (see `docs/TEAM.md`).
- `tools/` `sync-partials.py`, `prerender-team.mjs` (writes team HTML for crawlers).
- `security/` deny-all Firebase rules (not deployed). `docs/` team and security notes.
- `_unused/` parked files, never deployed.

## Rules for editing
- Do not change the live background (`js/bg-webgl.js`, the `bg-live` bootstrap script, the canvas styles in `css/base.css`), the hero headline, its supporting paragraph, or the small line above it.
- Do not invent testimonials, results, years, certifications or case studies. Use `[ADD: ...]` placeholders until real facts exist.
- Do not publish client data, private contact details, keys or internal paths. See `docs/SECURITY.md`.
- If you edit an inline `<script>`, update its hash in the CSP in `firebase.json`.
- After editing the team data run `node tools/prerender-team.mjs`.

## Placeholders still to fill
Search the project for `[ADD:` to find them (co-founder name, turnaround, pricing, retention period, payment and refund terms, jurisdiction, and similar).
