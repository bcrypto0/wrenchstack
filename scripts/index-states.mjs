// Print the indexing state of every built HTML page in dist/ (added 2026-11-14).
//   visible  = no robots noindex and no googlebot noindex: every engine may index it
//   g-hidden = googlebot noindex only: Google skips it, other engines may index it
//   noindex  = robots noindex (meta tag, or X-Robots-Tag from dist/_headers): no engine indexes it
// Usage, from site/ after `npm run build`:
//   node scripts/index-states.mjs                 totals and checks only
//   node scripts/index-states.mjs --list          every page with its state
//   node scripts/index-states.mjs --state=visible only pages in that state
// Exit code 1 when a consistency check fails. Reads files only; changes nothing.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteDir = process.env.SITE_DIR || fileURLToPath(new URL('..', import.meta.url));
const dist = join(siteDir, 'dist');
const args = process.argv.slice(2);
const listAll = args.includes('--list');
const onlyState = (args.find((a) => a.startsWith('--state=')) || '').split('=')[1];

let GOOGLE_VISIBLE_PATHS = null;
let GOOGLE_ONLY_GATE = true;
try {
  ({ GOOGLE_VISIBLE_PATHS, GOOGLE_ONLY_GATE } = await import(pathToFileURL(join(siteDir, 'src/lib/compare-index.mjs')).href));
} catch (e) {
  // A broken compare-index.mjs must not pass quietly (a tree without the file skips the list checks).
  if (existsSync(join(siteDir, 'src/lib/compare-index.mjs'))) {
    console.error('compare-index.mjs failed to import: ' + e.message);
    process.exit(1);
  }
}

// X-Robots-Tag noindex rules from dist/_headers ("/prefix/*" or exact path blocks).
const headerRules = [];
if (existsSync(join(dist, '_headers'))) {
  let current = null;
  for (const raw of readFileSync(join(dist, '_headers'), 'utf8').split(/\r?\n/)) {
    if (/^\S/.test(raw) && !raw.startsWith('#')) current = raw.trim();
    else if (current && /^[ \t]+x-robots-tag:.*noindex/i.test(raw)) headerRules.push(current);
  }
}
const headerNoindex = (p) => headerRules.some((r) => (r.endsWith('*') ? p.startsWith(r.slice(0, -1)) : p === r));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const f = join(dir, name);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (name.endsWith('.html')) out.push(f);
  }
  return out;
}
// All <meta name="NAME" content="..."> values in the head (attribute order: name before content).
function metaContent(head, name) {
  const out = [];
  for (const tag of head.match(/<meta[^>]*>/gi) || []) {
    const n = (tag.match(/name=["']([^"']*)["']/i) || [])[1];
    if (n && n.toLowerCase() === name) out.push((tag.match(/content=["']([^"']*)["']/i) || [])[1] || '');
  }
  return out;
}
const sitemap = new Set();
for (const f of readdirSync(dist).filter((n) => /^sitemap-[0-9]+\.xml$/.test(n))) {
  for (const m of readFileSync(join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemap.add(new URL(m[1]).pathname);
}

const rows = [];
const internalHrefs = new Map(); // page path -> set of internal paths it links to
for (const f of walk(dist)) {
  let p = '/' + relative(dist, f).split(sep).join('/');
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length); // /a/index.html -> /a/ ; /404.html stays
  const html = readFileSync(f, 'utf8');
  const end = html.search(/<\/head>/i);
  const head = end === -1 ? html : html.slice(0, end);
  const robots = metaContent(head, 'robots').join(',');
  const gbot = metaContent(head, 'googlebot').join(',');
  const state = /noindex/i.test(robots) || headerNoindex(p) ? 'noindex' : /noindex/i.test(gbot) ? 'g-hidden' : 'visible';
  rows.push({ p, state, robots, gbot, inSitemap: sitemap.has(p) });
  if (state === 'visible') {
    const hrefs = new Set();
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) hrefs.add(m[1]);
    internalHrefs.set(p, hrefs);
  }
}
rows.sort((a, b) => a.p.localeCompare(b.p));

const STATES = ['visible', 'g-hidden', 'noindex'];
const tally = { visible: 0, 'g-hidden': 0, noindex: 0 };
const inMap = { visible: 0, 'g-hidden': 0, noindex: 0 };
for (const r of rows) { tally[r.state]++; if (r.inSitemap) inMap[r.state]++; }
if (listAll || onlyState) {
  for (const r of rows) if (!onlyState || r.state === onlyState) console.log(`${r.state.padEnd(8)}  ${r.inSitemap ? 'sitemap' : '       '}  ${r.p}`);
}
console.log(`\nHTML pages: ${rows.length}`);
console.log('  visible  = all engines may index; g-hidden = hidden from Google only; noindex = no engine');
for (const s of STATES) console.log(`  ${s.padEnd(8)} ${String(tally[s]).padStart(5)}   of which in sitemap: ${inMap[s]}`);
console.log(`Sitemap URLs: ${sitemap.size}`);

const problems = [];
const byPath = new Map(rows.map((r) => [r.p, r]));
for (const p of sitemap) if (!byPath.has(p)) problems.push(`sitemap URL with no built page: ${p}`);
if (inMap.noindex) problems.push(`${inMap.noindex} robots-noindexed page(s) are in the sitemap`);
for (const r of rows) {
  if (r.state !== 'noindex' && !r.inSitemap) problems.push(`indexable page missing from the sitemap: ${r.p}`);
  if (r.gbot && r.state !== 'noindex' && r.gbot !== 'noindex,follow') problems.push(`unexpected googlebot value on ${r.p}: ${r.gbot}`);
  if (r.gbot && /noindex/i.test(r.robots)) problems.push(`googlebot tag on a page already robots-noindexed: ${r.p}`);
}
if (GOOGLE_VISIBLE_PATHS && GOOGLE_ONLY_GATE !== false) {
  for (const p of GOOGLE_VISIBLE_PATHS) {
    const r = byPath.get(p);
    if (!r) problems.push(`on the Google-visible list but not built: ${p}`);
    else if (r.state !== 'visible') problems.push(`on the Google-visible list but state is ${r.state}: ${p}`);
    // Each listed page needs a link from another page Google may index (review M1).
    const linkedFrom = [...internalHrefs.entries()].filter(([from, hrefs]) => from !== p && hrefs.has(p)).length;
    if (r && linkedFrom === 0) problems.push(`on the Google-visible list but no visible page links to it: ${p}`);
  }
  for (const r of rows) if (r.state === 'visible' && !GOOGLE_VISIBLE_PATHS.has(r.p)) problems.push(`visible to Google but not on the list: ${r.p}`);
  console.log(`Google-visible list: ${GOOGLE_VISIBLE_PATHS.size} paths`);
} else if (GOOGLE_ONLY_GATE === false) {
  console.log('Google-only gate: OFF');
  for (const r of rows) if (r.state === 'g-hidden') problems.push(`gate is off but page is hidden from Google: ${r.p}`);
}
if (problems.length) {
  console.log(`\nPROBLEMS (${problems.length}):`);
  for (const x of problems) console.log('  ' + x);
  process.exitCode = 1;
} else console.log('\nChecks passed.');
