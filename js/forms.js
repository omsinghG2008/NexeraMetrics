/* ==========================================================================
   NEXERA · js/forms.js
   --------------------------------------------------------------------------
   The qualification form on the contact page.

   What it does
     1. Checks every field with data-rule="required|email|phone|consent",
        shows the error under the field and marks it aria-invalid.
     2. Cleans the text before sending (control characters and HTML tags are
        removed, lengths are capped). Nothing typed here is ever inserted into
        the page as HTML; messages are written with textContent only.
     3. Blocks simple bots: a hidden honeypot field, a minimum fill time, and
        Web3Forms' own bot check.
     4. Rate-limits this browser (cooldown + hourly cap).
     5. Pre-selects "Current stage" from ?stage=live|idea|launch|exploring,
        which the service buttons add to the link.
     6. Sends the message to the inbox through Web3Forms (no database needed).

   Limits (be honest about them)
     Browser-side checks make mistakes easy to fix and stop casual spam, but a
     determined attacker can skip a browser. The real server-side checks are
     the ones Web3Forms performs. For stronger protection (App Check, server
     rate limits) see docs/SECURITY.md.

   SECURITY: only PUBLIC values belong in this file. The Web3Forms access key
   is public by design; restrict it to this domain in the Web3Forms dashboard.
   Never put a password, token or private key here.
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$ } = NX;

  /* ---------- EDIT: your settings ---------- */
  const CONFIG = {
    accessKey: 'f0e1abe0-8593-4987-b084-ac4df88bfd8a',   // public Web3Forms key
    endpoint: 'https://api.web3forms.com/submit',
    minFillMs: 3000,           // faster than this = probably a bot
    cooldownMs: 30 * 1000,     // wait between sends from one browser
    maxPerHour: 3,             // sends per hour from one browser
    storageKey: 'nx-form-sends',
    maxLength: { name: 100, email: 150, whatsapp: 20, product: 150, budget: 60, message: 2000 },
  };

  /* ---------- Validation rules (return true, or the error message) ---------- */
  const RULES = {
    required: (v) => !!v.trim() || 'This field is required.',
    email:    (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) || 'Enter a valid email address.',
    phone:    (v) => !v.trim() || /^\+?[0-9\s-]{8,18}$/.test(v.trim()) || 'Enter a valid phone number, or leave it empty.',
    consent:  (v) => !!v || 'Please accept the privacy policy.',
  };

  function validate(form) {
    let allValid = true;
    $$('[data-rule]', form).forEach((field) => {
      const raw = field.type === 'checkbox' ? (field.checked ? 'yes' : '') : field.value;
      const result = RULES[field.dataset.rule](raw);
      const message = document.getElementById(field.id + '-error');
      field.setAttribute('aria-invalid', String(result !== true));
      if (message) message.textContent = result === true ? '' : result;
      if (result !== true) allValid = false;
    });
    return allValid;
  }

  /* Remove control characters and HTML tags, collapse spaces, cap the length. */
  function clean(value, max) {
    return String(value)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim()
      .slice(0, max);
  }

  /* ---------- Per-browser rate limit ---------- */
  function readSends() {
    try {
      const list = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
      return Array.isArray(list) ? list.filter((n) => Number.isFinite(n) && Date.now() - n < 3600 * 1000) : [];
    } catch (e) { return []; }
  }
  function rateLimitMessage() {
    const sends = readSends();
    if (sends.length && Date.now() - sends[sends.length - 1] < CONFIG.cooldownMs) return 'Please wait a few seconds before sending another message.';
    if (sends.length >= CONFIG.maxPerHour) return 'You have sent several messages recently. Please try again later.';
    return '';
  }
  function recordSend() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify([...readSends(), Date.now()])); } catch (e) { /* storage blocked: fine */ }
  }

  /* ---------- Send ---------- */
  async function send(payload) {
    const response = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) throw new Error('send failed');
  }

  NX.onReady(() => {
    const form = $('#enquiry-form');
    if (!form) return;
    const status = $('.form-status', form);
    const submit = $('button[type="submit"]', form);
    const fallbackEmail = form.dataset.fallbackEmail || '';
    const loadedAt = Date.now();

    /* Pre-select the stage from ?stage=... */
    const stage = new URLSearchParams(location.search).get('stage');
    const stageField = $('#e-stage', form);
    if (stage && stageField && $$('option', stageField).some((o) => o.value === stage)) stageField.value = stage;

    const say = (text, ok) => {
      status.textContent = text;                       // textContent: never parsed as HTML
      status.classList.toggle('is-error', !ok);
      status.classList.toggle('is-success', !!ok);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = '';
      if (!validate(form)) { say('Please fix the highlighted fields.', false); return; }

      /* Bots: pretend it worked, send nothing. */
      const honeypot = form.elements.website;
      if ((honeypot && honeypot.value) || Date.now() - loadedAt < CONFIG.minFillMs) { say('Thank you. We usually reply within 1 business day.', true); form.reset(); return; }

      const limited = rateLimitMessage();
      if (limited) { say(limited, false); return; }

      const f = form.elements;
      const text = (name) => clean(f[name] ? f[name].value : '', CONFIG.maxLength[name] || 150);
      const payload = {
        access_key: CONFIG.accessKey,
        subject: 'New NEXERA Metrics enquiry',
        from_name: 'NEXERA Metrics website',
        botcheck: '',
        name: text('name'),
        email: text('email'),
        whatsapp: text('whatsapp'),
        product_or_niche: text('product'),
        marketplace: clean(f.marketplace.value, 60),
        current_stage: clean(f.stage.selectedOptions[0] ? f.stage.selectedOptions[0].text : '', 80),
        main_problem: clean(f.problem.value, 80),
        budget: text('budget'),
        message: text('message'),
      };

      submit.disabled = true;
      say('Sending…', true);
      try {
        await send(payload);
        recordSend();
        form.reset();
        say('Thank you. Your message has been sent. We usually reply within 1 business day.', true);
      } catch (error) {
        say(fallbackEmail ? 'Sorry, that did not send. Please email us at ' + fallbackEmail + '.' : 'Sorry, that did not send. Please try again.', false);
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
