# NEXERA website

Pure HTML, CSS and JavaScript. No build step needed to view or deploy.
Open `index.html`, or run `python3 -m http.server` and visit http://localhost:8000.
Deploy the folder as-is to Netlify, Cloudflare Pages, GitHub Pages or any web host.

## Project map

```
index.html services.html projects.html company.html contact.html privacy.html 404.html
partials/    header.html + footer.html  (edit here, then run the sync script)
css/
  tokens.css       colours, fonts, spacing, radius: re-skin the site here
  base.css         reset, typography, focus, accessibility helpers
  layout.css       container, sections, grids
  components.css   header, buttons, cards, chips, forms, tables, footer ...
  pages/*.css      one small file per page
js/
  core.js nav.js                      every page
  bg-webgl.js motion.js               every page (live 3D background, hover and reveal effects)
  counters.js charts.js               home page
  calculator.js                       services page
  skills-filter.js                    company page
  forms.js                            contact page
assets/img/  logo, favicon, contour art, placeholders, social image
sql/supabase.sql   database + storage rules for the forms
tools/       sync-partials.py, build-images.sh
```

## Set-up checklist

1. **Domain.** Replace `nexera.example` everywhere (canonical links, sitemap, robots, social tags, structured data):
   `grep -rl nexera.example . | xargs sed -i 's/nexera.example/yourdomain.com/g'`
2. **Business details.** Search the project for `EDIT:` (address, phone, hours, registration, portfolio links, privacy dates).
   Header and footer live in `partials/`; after editing them run `python3 tools/sync-partials.py`.
3. **Forms.** Create a Supabase project, run `sql/supabase.sql`, then put the Project URL and the PUBLIC anon key at the top of `js/forms.js`.
   Never put the `service_role` key in front-end code. Until then the forms run in demo mode.
4. **Analytics and Search Console.** Paste the GA4 snippet and verification tag where the `<head>` comments say so.
5. **Images.** Replace the placeholders in `assets/img/`. `tools/build-images.sh` creates responsive AVIF/WebP/JPG sets and prints the `<picture>` tag.
6. **Hindi (optional).** Duplicate the pages into `/hi/`, translate, then add `hreflang="hi"` links and sitemap entries.

## How to edit common things

| I want to change... | Edit |
| --- | --- |
| Brand colours, fonts, spacing | `css/tokens.css` |
| Navigation links or footer | `partials/*.html`, then `python3 tools/sync-partials.py` |
| Motion speed (hover, reveal, page changes) | `--dur-fast`, `--dur-med`, `--dur-slow` and `--ease` in `css/tokens.css`; page-change timing in `css/base.css` ("Page-to-page transitions") |
| Background map speed, line count, 3D relief, calm-down on scroll | `CONFIG` at the top of `js/bg-webgl.js` |
| Background map colours | colour constants inside `js/bg-webgl.js` (match `tokens.css`) |
| Hover lift, tilt, glow and reveal behaviour | `SELECTORS` and `SETTINGS` in `js/motion.js`; the look is in `css/components.css` section 13 |
| Sample chart numbers | `DATA` in `js/charts.js` (and the hidden table in `index.html`) |
| Calculator formulas | `model()` in `js/calculator.js` (and the formula table in `services.html`) |
| Tools on the company page (Technology ecosystem) | the `skill-group` blocks in `company.html` |

## Notes on the structure

- Cascade layers (`@layer`) in `tokens.css` set the order: reset, base, layout, components, pages, utilities. A page rule always beats a component rule, so there are no specificity fights and no `!important`.
- Every page uses landmarks (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`), one `h1`, and a skip link.
- Structured data: Organization, WebSite and FAQ on the home page; Breadcrumb on inner pages; Service list on Services; ContactPage and AboutPage.
- The WebGL background (one fixed canvas behind every page) falls back to a static contour image without WebGL, pauses when the tab is hidden, calms down as you scroll so text stays readable, and stops moving when the visitor prefers reduced motion.
- Page sections are slightly see-through (`--c-glass-*` tokens) so the map shows behind them. Cards stay solid.
