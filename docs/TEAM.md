# Editing the team

The whole team lives in ONE file: `js/team-data.js`. Nothing else needs editing.

## Add a photo
1. Put the image in `assets/team/` (square works best).
2. In `js/team-data.js`, set `photo: 'aliza.jpg'` (just the file name).
3. Save. Without a photo an initials tile is shown.

## Other changes
- Add a person: copy a `{ ... }` block, give it a new `id` and `order`.
- Edit: change the text in quotes. Skills are the small tags under the role.
- Portfolio / other links: `links: [{ label: "Portfolio", url: "https://..." }]` (add as many as needed). Lakshay's and Anand's links currently point to `example.com`: replace them.
- Hide or remove: `visible: false`, or delete the block.
- Reorder: change `order`. `featured: true` gives the wider founder-style card.

After any change run `node tools/prerender-team.mjs` so search engines also see the update (browsers update on their own).

Only add details the person agrees to publish. Never add private phone numbers, personal emails or home addresses.
