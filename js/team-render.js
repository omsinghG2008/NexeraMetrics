/* ==========================================================================
   NEXERA · js/team-render.js
   --------------------------------------------------------------------------
   Draws the team from js/team-data.js. Used in two places with the SAME code:
     1. In the browser: fills every  <ul data-team>  on the page.
     2. In Node (tools/prerender-team.mjs): writes the same HTML into the page
        files, so crawlers and AI tools see the team without running JavaScript.

   Nothing here needs editing to add, remove or reorder people: edit
   js/team-data.js instead.
   ========================================================================== */
(function (root) {
  'use strict';

  /* Escape text so nothing typed into the data file can become live HTML. */
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* Only plain https/http links are allowed. */
  const safeUrl = (url) => (/^https?:\/\//i.test(url) ? url : '');

  const isPlaceholder = (text) => /^\s*\[ADD/i.test(text);

  /* "Om Singh" → "OS". Placeholders show "+". */
  function initials(name) {
    if (isPlaceholder(name)) return '+';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2);
    return letters.toUpperCase();
  }

  /* "aliza.jpg" → "assets/team/aliza.jpg". A full path is used as given. */
  const photoPath = (p) => (/[\/]/.test(p) ? p : 'assets/team/' + p);

  /* One member → one <li>, in the site's card design. Missing optional fields
     (photo, skills, links) produce no markup, so cards never show gaps. */
  function memberHtml(m) {
    const id = 'member-' + esc(m.id);
    const photo = m.photo
      ? `<img class="member__photo" src="${esc(photoPath(m.photo))}" alt="Photo of ${esc(m.name)}" width="400" height="400" loading="lazy" decoding="async">`
      : `<span class="member__avatar" aria-hidden="true">${esc(initials(m.name))}</span>`;
    const skills = (m.skills || []).length
      ? `<ul class="chip-list">${m.skills.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>` : '';
    const links = (m.links || [])
      .filter((l) => safeUrl(l.url))
      .map((l) => `<a href="${esc(safeUrl(l.url))}" rel="noopener" target="_blank">${esc(l.label)}</a>`)
      .join(' · ');
    return `<li class="team__item${m.featured ? ' team__item--lead' : ''}"><article class="member" aria-labelledby="${id}">`
      + photo
      + `<h3 id="${id}">${esc(m.name)}</h3>`
      + `<p class="member__role">${esc(m.role)}</p>`
      + (m.bio ? `<p class="member__bio">${esc(m.bio)}</p>` : '')
      + skills
      + (links ? `<p class="member__link">${links}</p>` : '')
      + `</article></li>`;
  }

  /* Visible members, sorted by "order". */
  function renderTeam(list) {
    return list
      .filter((m) => m && m.visible !== false)
      .slice()
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map(memberHtml)
      .join('\n');
  }

  root.NXTeamRender = { renderTeam };
  if (typeof module !== 'undefined' && module.exports) module.exports = { renderTeam };

  /* Browser: fill every <ul data-team>. */
  if (typeof document !== 'undefined' && root.NX_TEAM) {
    const fill = () => document.querySelectorAll('[data-team]').forEach((el) => {
      el.innerHTML = renderTeam(root.NX_TEAM);
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
    else fill();
  }
})(typeof window !== 'undefined' ? window : globalThis);
