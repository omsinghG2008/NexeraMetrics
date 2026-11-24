/* ==========================================================================
   NEXERA · js/skills-filter.js
   --------------------------------------------------------------------------
   Filter buttons for the Technology ecosystem (company page).

   Markup contract
     <div data-skill-filter>
        <button data-filter="all" aria-pressed="true">All</button>
        <button data-filter="research" aria-pressed="false">Research</button> ...
     </div>
     <section data-skill-group="research"> ... </section>

   Without JavaScript every group simply stays visible.
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$ } = NX;

  NX.onReady(() => {
    const bar = $('[data-skill-filter]');
    if (!bar) return;

    const buttons = $$('[data-filter]', bar);
    const groups = $$('[data-skill-group]');
    const status = $('[data-filter-status]');

    function apply(filter) {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
      let shown = 0;
      groups.forEach((group) => {
        const visible = filter === 'all' || group.dataset.skillGroup === filter;
        group.hidden = !visible;
        if (visible) shown += 1;
      });
      if (status) status.textContent = filter === 'all' ? 'Showing all skill groups.' : `Showing ${shown} skill group.`;
    }

    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  });
})();
