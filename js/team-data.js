/* ==========================================================================
   NEXERA · js/team-data.js          ← THE ONLY FILE YOU EDIT TO CHANGE THE TEAM
   --------------------------------------------------------------------------
   Every team card on the site (home page and company page) is drawn from the
   list below. No member is written into any HTML file by hand.

   ADD A PHOTO (3 steps)
     1. Put the image in the folder  assets/team/   (square works best).
     2. Write just the file name in  photo:  e.g.  photo: 'aliza.jpg'
     3. Save. No photo? An initials tile is shown instead.

   ADD A PERSON      Copy one { ... } block, paste it before the closing ],
                     give it a new id and fill in the fields.
   EDIT A PERSON     Change the text between the quotes.
   REMOVE / HIDE     Delete the block, or set  visible: false.
   REORDER           Change  order  (smallest number shows first).

   FIELDS
     id        unique short name, lower case, no spaces              (required)
     name      full name as shown                                    (required)
     role      job title                                             (required)
     skills    ['Research', 'Design']  small tags under the role     (optional)
     links     [{ label: "Portfolio", url: "https://..." }]          (optional)
               Add as many links as you like (LinkedIn, Behance ...).
     bio       one or two sentences                                  (optional)
     photo     file name inside assets/team/                         (optional)
     featured  true = wider card (used for the founders)             (optional)
     order     number, smallest first                                (required)
     visible   true to show, false to hide                           (required)

   RULES
     · Only PUBLIC details here: never personal phone numbers, home addresses
       or private emails.
     · Portfolio links marked "example.com" are placeholders: replace them
       with the real address.

   AFTER EDITING
     The browser updates by itself. To also refresh the plain-HTML copy that
     search engines read, run once:   node tools/prerender-team.mjs
   ========================================================================== */
(function (root) {
  'use strict';

  const TEAM = [
    {
      id: 'om-singh',
      name: 'Om Singh',
      role: 'Founder',
      skills: ['Full-stack development', 'Research', 'Data analysis', 'Trading & Investments', 'Market and financial analytics', 'Prompt engineering', 'UI & UX Designing'],
      links: [{ label: "Om's portfolio", url: 'https://omsinghportfolio.web.app/' }],
      photo: 'om-singh.jpeg',
      featured: true,
      order: 1,
      visible: true,
    },
    {
      id: 'aliza',
      name: 'Aliza (Zuz)',
      role: 'Co-founder',
      skills: ['Frontend development', 'Research', 'Prompt engineering'],
      links: [{ label: "Aliza's portfolio", url: 'https://alizafatima.netlify.app/' }],
      photo: 'aliza.jpg',
      featured: true,
      order: 2,
      visible: true,
    },
    {
      id: 'lakshay',
      name: 'Lakshay',
      role: 'Manager',
      skills: ['Research', 'Task handling', 'Basic development'],
      links: [{ label: "Lakshay's portfolio", url: 'https://example.com/lakshay' }],
      photo: 'lakshay.jpeg',
      order: 3,
      visible: true,
    },
    {
      id: 'anand',
      name: 'Anand',
      role: 'Motion & UIX Designer',
      skills: ['Motion graphics', 'UI designing', 'Video editing'],
      links: [{ label: "Anand's portfolio", url: 'https://example.com/anand' }],
      photo: 'anand.jpeg',
      order: 4,
      visible: true,
    },
  ];

  /* Make the list available to the page script and to tools/prerender-team.mjs */
  root.NX_TEAM = TEAM;
  if (typeof module !== 'undefined' && module.exports) module.exports = TEAM;
})(typeof window !== 'undefined' ? window : globalThis);
