/* ==========================================================================
   NEXERA · js/forms.js
   --------------------------------------------------------------------------
   Business-enquiry form and career-application form (contact page).

   What it does
     - Checks each field that has data-rule="required|email|consent".
     - Shows an error under the field and marks it aria-invalid.
     - Blocks bots with a hidden "honeypot" field.
     - Sends each form to your inbox by email (Web3Forms, no database needed).
     - Supabase (database) support is still here for later: set
       delivery: 'supabase' in CONFIG and re-add the resume file field.
     - Until the chosen service is configured it runs in DEMO MODE: the form
       works and says so, but nothing is sent.

   SECURITY: only PUBLIC keys belong in this file (the Web3Forms access key
   and the Supabase "anon" key). Never put a Supabase service_role key or any
   password in front-end code.
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$ } = NX;

  /* ---------- EDIT: your settings ---------- */
  const CONFIG = {
    delivery: 'email',                                   // 'email' (inbox) or 'supabase' (database, for later)

    /* Email delivery: create a free access key at web3forms.com using the inbox that should receive messages. */
    emailAccessKey: 'f0e1abe0-8593-4987-b084-ac4df88bfd8a',
    emailEndpoint: 'https://api.web3forms.com/submit',

    /* Database delivery (not used right now): */
    supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
    resumeBucket: 'resumes',
    fallbackEmail: 'nexerasupport01@gmail.com',     // shown if sending fails
    maxResumeBytes: 5 * 1024 * 1024,                // 5 MB
  };
  const isConfigured = CONFIG.delivery === 'email'
    ? !CONFIG.emailAccessKey.includes('YOUR_WEB3FORMS')
    : !CONFIG.supabaseUrl.includes('YOUR-PROJECT');

  /* ---------- Validation rules (return true, or the error message) ---------- */
  const RULES = {
    required: (v) => !!v.trim() || 'This field is required.',
    email:    (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Enter a valid email address.',
    consent:  (v) => !!v || 'Please accept the privacy policy.',
  };

  /* Check every field with data-rule. Returns true when all pass. */
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

  /* ---------- Tiny Supabase REST helper ---------- */
  async function supabase(path, options) {
    const response = await fetch(CONFIG.supabaseUrl + path, {
      ...options,
      headers: { apikey: CONFIG.supabaseAnonKey, Authorization: 'Bearer ' + CONFIG.supabaseAnonKey, ...(options.headers || {}) },
    });
    if (!response.ok) throw new Error(await response.text());
    return response;
  }
  const JSON_HEADERS = { 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  const insert = (table, row) => supabase('/rest/v1/' + table, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(row) });

  /* ---------- Email helper: sends one message to your inbox ---------- */
  async function sendEmail(subject, replyTo, fields) {
    const response = await fetch(CONFIG.emailEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: CONFIG.emailAccessKey, subject, from_name: 'NEXERA website', email: replyTo, ...fields }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) throw new Error(result.message || 'Email service error');
  }

  /* ---------- What each form sends: by email ---------- */
  const EMAIL_SENDERS = {
    'enquiry-form': (f) => sendEmail('New enquiry from ' + f.name.value, f.email.value, {
      name: f.name.value, company: f.company.value, service: f.service.value, message: f.message.value,
    }),
    'career-form': (f) => sendEmail('New job application from ' + f.name.value, f.email.value, {
      name: f.name.value, role: f.role.value, portfolio_link: f.portfolio.value,
      resume_link: f.resumeLink ? f.resumeLink.value : '', message: f.message.value,
    }),
  };

  /* ---------- What each form sends: to the database (for later) ---------- */
  const SUPABASE_SENDERS = {
    'enquiry-form': (f) => insert('enquiries', {
      name: f.name.value, email: f.email.value, company: f.company.value,
      service: f.service.value, message: f.message.value,
    }),

    'career-form': async (f) => {
      const file = f.resume ? f.resume.files[0] : null;          // needs the resume file field back in contact.html
      if (file && (file.size > CONFIG.maxResumeBytes || file.type !== 'application/pdf')) throw new Error('PDF under 5 MB only');
      let resumePath = null;
      if (file) {                                                  // upload the PDF to the private bucket first
        resumePath = crypto.randomUUID() + '.pdf';
        await supabase(`/storage/v1/object/${CONFIG.resumeBucket}/${resumePath}`, { method: 'POST', headers: { 'Content-Type': 'application/pdf' }, body: file });
      }
      return insert('applications', {
        name: f.name.value, email: f.email.value, role: f.role.value,
        portfolio_url: f.portfolio.value, message: f.message.value, resume_path: resumePath,
      });
    },
  };

  const SENDERS = CONFIG.delivery === 'email' ? EMAIL_SENDERS : SUPABASE_SENDERS;

  /* ---------- Wire each form up ---------- */
  function wire(form) {
    const send = SENDERS[form.id];
    const status = $('.form-status', form);
    const button = $('button[type="submit"]', form);
    const idleLabel = button.textContent;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.elements.website.value) return;                     // honeypot filled: it's a bot, do nothing

      if (!validate(form)) {
        status.className = 'form-status is-bad';
        status.textContent = 'Please fix the highlighted fields.';
        return;
      }

      button.disabled = true;
      button.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';

      try {
        if (isConfigured) await send(form);
        else await new Promise((resolve) => setTimeout(resolve, 900));     // demo mode
        status.className = 'form-status is-ok';
        status.textContent = isConfigured
          ? 'Thank you. We received your message and will reply by email.'
          : 'Demo mode: the form works, but delivery is not configured yet, so nothing was sent.';
        form.reset();
      } catch (error) {
        console.error(error);
        status.className = 'form-status is-bad';
        status.textContent = 'We could not send that. Please email ' + CONFIG.fallbackEmail + '.';
      }

      button.disabled = false;
      button.textContent = idleLabel;
    });
  }

  NX.onReady(() => { Object.keys(SENDERS).forEach((id) => { const form = document.getElementById(id); if (form) wire(form); }); });
})();
