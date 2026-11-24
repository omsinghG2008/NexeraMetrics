/* ==========================================================================
   NEXERA · js/charts.js
   --------------------------------------------------------------------------
   The "Sample analytics" bar chart on the home page.

   - Draws an accessible SVG (no chart library needed).
   - The three buttons switch the metric; bars glide to their new heights.
   - All numbers are DEMONSTRATION data. Edit DATA below to change them,
     and keep the hidden <table> in index.html in sync.
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$, tween, ease } = NX;

  /* ---------- Demonstration data (index values, 0 to 100) ---------- */
  const DATA = {
    demand:      { values: [30, 45, 40, 62, 78, 70, 92], summary: 'Demand index rises from 30 to 92 across the seven periods.' },
    competition: { values: [80, 74, 70, 60, 58, 50, 44], summary: 'Competition index falls from 80 to 44 across the seven periods, so the market gets easier to enter.' },
    margin:      { values: [22, 28, 35, 33, 41, 46, 52], summary: 'Margin index climbs from 22 to 52 across the seven periods.' },
  };

  /* ---------- Chart geometry (matches the SVG viewBox 0 0 560 300) ---------- */
  const SIZE = { width: 560, height: 300 };
  const PAD  = { left: 38, right: 8, top: 26, bottom: 34 };
  const PLOT = { width: SIZE.width - PAD.left - PAD.right, height: SIZE.height - PAD.top - PAD.bottom };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  NX.onReady(() => {
    const root = $('[data-chart]');
    if (!root) return;

    const svg = $('.chart__svg', root);
    const summary = $('#chart-summary', root);
    const buttons = $$('[data-metric]', $('.segmented', root));
    const periods = DATA.demand.values.length;
    const slot = PLOT.width / periods;
    const barWidth = slot * 0.56;

    /* Small helper: create an SVG element with attributes. */
    const make = (name, attrs, text) => {
      const node = document.createElementNS(SVG_NS, name);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      if (text !== undefined) node.textContent = text;
      return node;
    };

    /* ---------- Build the static parts: grid lines, axis labels ---------- */
    [0, 25, 50, 75, 100].forEach((tick) => {
      const y = PAD.top + PLOT.height * (1 - tick / 100);
      svg.append(make('line', { class: 'chart__grid', x1: PAD.left, x2: SIZE.width - PAD.right, y1: y, y2: y }));
      svg.append(make('text', { class: 'chart__label', x: PAD.left - 8, y: y + 4, 'text-anchor': 'end' }, tick));
    });

    /* ---------- Build the bars and value labels (start at zero height) ---------- */
    const bars = [];
    const labels = [];
    for (let i = 0; i < periods; i += 1) {
      const x = PAD.left + slot * i + (slot - barWidth) / 2;
      const base = PAD.top + PLOT.height;
      const bar = make('rect', { class: 'chart__bar', x, y: base, width: barWidth, height: 0, rx: 4 });
      const value = make('text', { class: 'chart__value', x: x + barWidth / 2, y: base - 6, 'text-anchor': 'middle' }, '');
      const axis = make('text', { class: 'chart__label', x: x + barWidth / 2, y: SIZE.height - 10, 'text-anchor': 'middle' }, 'P' + (i + 1));
      svg.append(bar, value, axis);
      bars.push(bar);
      labels.push(value);
    }

    /* ---------- Show one metric (animated) ---------- */
    let current = bars.map(() => 0);               // heights currently on screen (0..100)

    function show(metric) {
      const target = DATA[metric].values;
      const from = current.slice();
      svg.dataset.metric = metric;
      summary.textContent = DATA[metric].summary;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.metric === metric)));

      tween({
        from: 0, to: 1, duration: 650, ease: ease.outCubic,
        onUpdate: (progress) => {
          bars.forEach((bar, i) => {
            const value = from[i] + (target[i] - from[i]) * progress;
            const height = PLOT.height * value / 100;
            const y = PAD.top + PLOT.height - height;
            bar.setAttribute('y', y);
            bar.setAttribute('height', height);
            labels[i].setAttribute('y', y - 6);
            labels[i].textContent = Math.round(value);
          });
          current = target.map((t, i) => from[i] + (t - from[i]) * progress);
        },
      });
    }

    buttons.forEach((button) => button.addEventListener('click', () => show(button.dataset.metric)));

    /* First reveal: grow the bars when the chart scrolls into view. */
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { show('demand'); observer.disconnect(); }
      }, { threshold: 0.35 });
      observer.observe(root);
    } else {
      show('demand');
    }
  });
})();
