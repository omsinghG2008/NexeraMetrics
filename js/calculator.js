/* ==========================================================================
   NEXERA · js/calculator.js
   --------------------------------------------------------------------------
   Profitability calculator (services page).

   Reads the inputs in <form id="calc">, works out the figures below, and
   writes them into the <output> elements. Numbers glide to new values.

   The formulas are the ones listed in the "How each figure is calculated"
   table on the same page. If you change a formula here, change it there too.
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$, tween } = NX;

  /* ---------- Formatting helpers ---------- */
  const money   = (v) => (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const percent = (v) => v.toFixed(1) + '%';

  /* ---------- The model: all calculator maths lives in this one function ---------- */
  function model(input, units, price) {
    const revenue      = units * price;
    const productCost  = units * (input.cogs + input.ship);          // product + shipping
    const fees         = revenue * input.fee / 100;                  // marketplace fees
    const grossProfit  = revenue - productCost;
    const netProfit    = grossProfit - fees - input.ads - input.fixed;
    const totalCosts   = productCost + fees + input.ads + input.fixed;
    const contribution = price - input.cogs - input.ship - price * input.fee / 100;   // per unit
    return {
      revenue, totalCosts, grossProfit, netProfit, contribution,
      productCost, fees,
      margin:    revenue    ? netProfit / revenue * 100    : 0,
      roi:       totalCosts ? netProfit / totalCosts * 100 : 0,
      roas:      input.ads  ? revenue / input.ads          : 0,
      breakEven: contribution > 0 ? Math.ceil((input.ads + input.fixed) / contribution) : Infinity,
    };
  }

  /* The three scenarios shown in the table (label, units multiplier, price multiplier). */
  const SCENARIOS = [
    ['Pessimistic (-30% units, -10% price)', 0.7, 0.9],
    ['Base case',                            1.0, 1.0],
    ['Optimistic (+30% units, +10% price)',  1.3, 1.1],
  ];

  NX.onReady(() => {
    const form = $('#calc');
    if (!form) return;

    /* Read every numeric input into one object. */
    const read = () => {
      const value = (name) => Number(form.elements[name].value) || 0;
      return {
        price: value('price'), units: value('units'), cogs: value('cogs'), ship: value('ship'),
        fee: value('fee'), ads: value('ads'), fixed: value('fixed'),
      };
    };

    /* Numbers glide from their old value to the new one. */
    const show = (id, value, format) => {
      const el = document.getElementById(id);
      if (el._stop) el._stop();                                   // stop the previous glide so they never fight
      const from = el._shown ?? 0;                                // start from what is on screen right now
      el._stop = tween({ from, to: value, duration: 450, onUpdate: (v) => { el._shown = v; el.textContent = format(v); } });
      el.classList.toggle('is-negative', value < 0);
    };

    /* "Where each dollar goes": a stacked bar of costs and profit. */
    function drawBreakdown(m) {
      const total = Math.max(m.revenue, m.totalCosts) || 1;
      const parts = {
        product: m.productCost, fees: m.fees, ads: Number(form.elements.ads.value) || 0,
        fixed: Number(form.elements.fixed.value) || 0, profit: Math.max(m.netProfit, 0),
      };
      Object.entries(parts).forEach(([key, amount]) => {
        const segment = $(`[data-part="${key}"]`);
        if (!segment) return;
        segment.style.setProperty('--w', (amount / total * 100).toFixed(2) + '%');
        $('.breakdown__value', segment).textContent = money(amount);
      });
    }

    function run() {
      const input = read();
      const base = model(input, input.units, input.price);

      show('o-rev',    base.revenue,      money);
      show('o-cost',   base.totalCosts,   money);
      show('o-gross',  base.grossProfit,  money);
      show('o-net',    base.netProfit,    money);
      show('o-margin', base.margin,       percent);
      show('o-roi',    base.roi,          percent);
      show('o-roas',   base.roas,         (v) => v.toFixed(2) + 'x');
      show('o-cm',     base.contribution, (v) => '$' + v.toFixed(2) + ' / unit');
      $('#o-be').textContent = isFinite(base.breakEven) ? base.breakEven.toLocaleString() + ' units' : 'Not reachable';

      drawBreakdown(base);

      /* Scenario table body */
      $('#scenarios').innerHTML = SCENARIOS.map(([label, unitsX, priceX]) => {
        const s = model(input, input.units * unitsX, input.price * priceX);
        return `<tr><th scope="row">${label}</th><td>${money(s.revenue)}</td>
                <td class="${s.netProfit < 0 ? 'is-negative' : 'is-positive'}">${money(s.netProfit)}</td>
                <td>${percent(s.margin)}</td></tr>`;
      }).join('');
    }

    form.addEventListener('input', run);
    form.addEventListener('submit', (event) => event.preventDefault());   // Enter key must not reload the page
    run();
  });
})();
