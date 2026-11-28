#!/usr/bin/env node
/* ==========================================================================
   NEXERA · tools/prerender-team.mjs
   --------------------------------------------------------------------------
   Writes the team (from js/team-data.js) into every page as plain HTML, so
   search engines and AI tools can read it without running JavaScript.

   Each page marks the spot with:
       <ul class="team" data-team>
         <!-- @team:start --> ...generated... <!-- @team:end -->
       </ul>

   Usage (from the project folder):   node tools/prerender-team.mjs
   ========================================================================== */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const team = require(join(root, 'js', 'team-data.js'));
const { renderTeam } = require(join(root, 'js', 'team-render.js'));

const html = renderTeam(team);
const block = /(<!-- @team:start -->)[\s\S]*?(<!-- @team:end -->)/;
let updated = 0;

for (const file of readdirSync(root).filter((f) => f.endsWith('.html'))) {
  const path = join(root, file);
  const source = readFileSync(path, 'utf8');
  if (!block.test(source)) continue;
  writeFileSync(path, source.replace(block, `$1\n${html}\n$2`));
  updated += 1;
  console.log('team written into', file);
}
console.log(`Done: ${updated} page(s), ${team.filter((m) => m.visible !== false).length} visible member(s).`);
