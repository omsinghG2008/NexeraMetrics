/* ==========================================================================
   NEXERA · js/skills-filter.js
   --------------------------------------------------------------------------
   Filter buttons for the Technology ecosystem (company page).

   The buttons are BUILT FROM THE HTML, so adding or removing a group never
   needs a change here:

     <div data-skill-filter role="group"></div>            ← empty; buttons go here
     <section data-skill-group="research" data-label="Research"> ... </section>

   Button text comes from data-label (falls back to the group's <h3>).
   Without JavaScript the bar stays hidden and every group stays visible.
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$ } = NX;

  NX.onReady(() => {
    const bar = $('[data-skill-filter]');
    const groups = $$('[data-skill-group]');
    if (!bar || groups.length < 2) return;

    const status = $('[data-filter-status]');

    /* One button per group, plus "All groups" first. */
    const makeButton = (filter, label) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.filter = filter;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = label;
      return button;
    };
    const buttons = [
      makeButton('all', 'All groups'),
      ...groups.map((group) => {
        const heading = $('h3', group);
        return makeButton(group.dataset.skillGroup, group.dataset.label || (heading ? heading.textContent.trim() : group.dataset.skillGroup));
      }),
    ];
    bar.replaceChildren(...buttons);

    function apply(filter) {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
      let shown = 0;
      groups.forEach((group) => {
        const visible = filter === 'all' || group.dataset.skillGroup === filter;
        group.hidden = !visible;
        if (visible) shown += 1;
      });
      if (status) status.textContent = filter === 'all' ? 'Showing all tool groups.' : `Showing ${shown} tool group.`;
    }

    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
    apply('all');
  });
})();
