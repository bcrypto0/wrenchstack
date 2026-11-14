// Indexability gate for /compare/ pages. See SEO audit 2026-05-28.
//
// The site generates ~3,925 head-to-head comparison pages (both word orders
// for every tool pair that shares a vertical). On a young domain that volume
// of templated ~1,200-word pages is an index-bloat / scaled-content risk, so
// we keep only the high-intent comparisons indexable and noindex + drop the
// rest from the sitemap until the domain has the authority to rank more.
//
// This module is the single source of truth, imported by BOTH the comparison
// page template (to set the noindex prop) and astro.config.mjs (to filter the
// sitemap), so the two never drift apart.

// High-demand FSM / contractor brands: the ones with real "X vs Y" search
// volume. A comparison is only worth indexing when BOTH tools are on this
// list. Expand as the domain gains authority and we want to release more.
export const POPULAR_TOOL_SLUGS = new Set([
  'servicetitan', 'jobber', 'housecall-pro', 'workiz', 'fieldedge',
  'fieldpulse', 'servicem8', 'gorilladesk', 'servicefusion', 'mhelpdesk',
  'buildertrend', 'buildops', 'procore', 'knowify', 'jobtread',
  'simpro', 'acculynx', 'jobnimbus', 'contractor-foreman',
]);

// A comparison page is indexable iff it is the canonical (alphabetical) word
// order AND both tools are high-demand. This drops (a) every reverse-order
// duplicate (its canonical already points at the alphabetical version) and
// (b) every pair touching a long-tail tool nobody searches by name.
export function isComparisonIndexable(slugA, slugB) {
  return slugA < slugB
    && POPULAR_TOOL_SLUGS.has(slugA)
    && POPULAR_TOOL_SLUGS.has(slugB);
}

// Gulf markets (added 2026-06): their head-to-head pages are numerous (~266
// templated pages) on a domain still fighting for crawl budget. Same
// young-domain logic as /compare/, so keep them out of the sitemap and
// noindexed (via IntlComparison.astro) until the domain has authority.
// The per-market landings, vendor pages and compare hubs stay indexable.
// The 5 legacy markets (uk/au/ca/nz/ie, 93 pages) stay indexable as decided
// in the 2026-05-28 audit. To release a Gulf market later, remove it here.
export const GATED_INTL_COMPARE_MARKETS = new Set(['sa', 'ae', 'qa', 'kw', 'ba', 'om', 'za', 'fr']);

// --- State pages (added 2026-08-29, launch-day SEO audit) --------------------
// /state/<state>/<vertical>/ generates ~250 pages and /state/<state>/ another
// 50. Measured 2026-08-29: two different states' pages are 98.6% identical
// once the state name is swapped out, i.e. classic doorway pages. On a
// three-month-old domain fighting for crawl budget, advertising 300 near
// duplicates competes with the pages that can actually rank.
//
// So: noindex + drop from the sitemap by default. The one exception worth making
// is a page that has EARNED external links, because a page other sites already
// cite is a real destination regardless of how it was generated.
//
// The list is EMPTY, and that is deliberate (2026-08-30). It previously held
// illinois/general-contractor and nebraska/general-contractor on the strength of
// an external audit's claim that Contractor Foreman's press releases cite those
// two roundups. We tried to verify that on 2026-08-29 and could not: nothing in
// general search, nothing in a site-scoped search of contractorforeman.com, and
// their own press index returns HTTP 403 to automation, so it is UNVERIFIABLE
// rather than proven absent. Measured the same day, those two pages are within
// 200 bytes of Texas's, i.e. they have no state-specific substance of their own
// either. Exempting them satisfied neither half of the rule above, so they are
// out until one half is actually met.
//
// To release a page: give it something that is not a find-replace (real
// licensing-board detail, state-specific permit rules, local pricing), or point
// at a citation you have actually loaded and read, then add its key here.
// Earning the release is the point; do not bulk-add.
export const INDEXABLE_STATE_PAGES = new Set([]);

export function isStatePageIndexable(stateSlug, verticalUrl) {
  return INDEXABLE_STATE_PAGES.has(`${stateSlug}/${verticalUrl}`);
}


// --- International section (added 2026-09-07, thin-page audit) --------------
// Measured 2026-09-07 across all 1,821 indexable pages: the 17 international
// markets account for 1,089 of them (60% of the site), generated from vendor
// records averaging 1,191 bytes against 8,843 for the US records. Same pages
// per vendor as the US (2.4 vs 2.6), one seventh the substance behind each.
//
// Sibling overlap confirms it: international compare pairs 64%, international
// vendor pages 69%. Search Console's crawled-and-declined list is full of
// exactly these URLs (/uk/powered-now/, /uk/joblogic/, /au/aroflo/,
// /ca/compare/...). The press kit had already recorded the same weakness from
// the other direction, declining to pitch UK trade press on 22 UK vendors
// against 280 US ones.
//
// So the whole international section is noindexed and dropped from the
// sitemap: not deleted, not unlinked, still served to anyone who lands on it.
// This supersedes the narrower GATED_INTL_COMPARE_MARKETS gate above, which
// covered 8 markets' head-to-heads only and is kept for reference.
//
// This is ONE flag to reverse. If the keep rate does not improve, or if a
// market earns real coverage depth, undo it here rather than per template.
export const INTL_MARKET_CODES = new Set([
  'ae', 'au', 'ba', 'ca', 'eg', 'fr', 'ie', 'jo', 'kw',
  'ma', 'my', 'nz', 'om', 'qa', 'sa', 'uk', 'za',
]);

/** True for any path inside an international market, at any depth. */
export function isInternationalPath(pathname) {
  const seg = String(pathname || '').split('/').filter(Boolean)[0];
  return seg !== undefined && INTL_MARKET_CODES.has(seg);
}

// --- Core index (added 2026-10-14, indexing diagnosis) -----------------------
// Search Console on 2026-10-14: 1 page indexed (the home page) of 742 in the
// sitemap; 620 never crawled, 121 crawled and declined (mostly /compare/
// pairs); about 5 crawl requests a day; 2 external links. Indexed sitemap pages
// fell 11 -> 7 -> 1 between late August and early October.
// See docs/indexing-diagnosis-2026-10-14.md and docs/core-index-list-2026-10-14.md
// (owner approved the list 2026-10-14).
//
// So the index is cut to the core: home, trade hubs, section hubs, tool
// reviews and the editorial/trust pages (182 URLs). Everything below is
// noindex,follow and out of the sitemap: still served, still linked, links on
// it still followed. Templated sections (compare pairs, multi-compare,
// pricing, migrate, features, best-software-for) measured 31-70% shared text
// between sibling pages; /tools/<slug>/alternatives/ pages have about a third
// of the unique text of the reviews; the non-software vendor entries are off
// the core topic (their section hubs stay indexable).
//
// ONE switch to reverse: release a section by removing it here once the core
// is indexed and the domain has links.
export const CORE_GATED_SECTIONS = new Set([
  'compare', 'multi-compare', 'compare-builder', 'pricing', 'migrate', 'features',
  'best-software-for', 'state', 'software-by-country',
  'insurance', 'lead-gen', 'payroll', 'agencies', 'ai-tools',
  'accounting', 'financing', 'payments', 'banking',
]);
// Section hubs that stay indexable although their entries are gated.
export const CORE_KEPT_SECTION_HUBS = new Set([
  'insurance', 'lead-gen', 'payroll', 'agencies', 'ai-tools',
  'accounting', 'financing', 'payments', 'banking',
]);

/** True for a page outside the core index (noindex,follow; not in the sitemap). */
export function isCoreGatedPath(pathname) {
  const segs = String(pathname || '').split('/').filter(Boolean);
  if (segs.length === 0) return false;
  if (segs[0] === 'tools' && segs.length === 3 && segs[2] === 'alternatives') return true;
  if (!CORE_GATED_SECTIONS.has(segs[0])) return false;
  if (segs.length === 1 && CORE_KEPT_SECTION_HUBS.has(segs[0])) return false;
  return true;
}

// --- Archived pages (added 2026-11-14, trust batch) -------------------------
// Kept so outside links still work; not in site navigation; noindex,follow for
// every engine and out of the sitemap. Undo: remove the path.
export const ARCHIVED_PATHS = new Set(['/awards/', '/awards/2026/']);

export function isArchivedPath(pathname) {
  let p = String(pathname || '/');
  if (!p.endsWith('/')) p += '/';
  return ARCHIVED_PATHS.has(p);
}

/** True when the page carries robots noindex, i.e. no engine may index it. */
export function isNoindexedForAllEngines(pathname) {
  return isInternationalPath(pathname) || isCoreGatedPath(pathname) || isArchivedPath(pathname);
}

// Sitemap filter: keep every non-comparison URL; keep a /compare/<a>-vs-<b>/
// URL only when it is indexable; drop gated intl markets' head-to-heads.
export function shouldKeepInSitemap(urlStr) {
  let path;
  try { path = new URL(urlStr).pathname; } catch { path = urlStr; }
  // Whole international section is out of the sitemap (2026-09-07 thin-page audit).
  if (isInternationalPath(path)) return false;
  // Core index only (2026-10-14 indexing diagnosis).
  if (isCoreGatedPath(path)) return false;
  // Archived pages (2026-11-14 trust batch).
  if (isArchivedPath(path)) return false;
  // State hubs and state-by-trade pages: allowlist only.
  const stateVertical = path.match(/^\/state\/([^/]+)\/([^/]+)\/$/);
  if (stateVertical) return isStatePageIndexable(stateVertical[1], stateVertical[2]);
  if (/^\/state\/[^/]+\/$/.test(path)) return false;
  const m = path.match(/^\/compare\/(.+)-vs-(.+)\/$/);
  if (!m) return true;
  return isComparisonIndexable(m[1], m[2]);
}

// --- Google-visible set (added 2026-11-14, site and search review) -----------
// Search Console on 10 Nov 2026: 1 page indexed (the home page); the US core has
// been "Crawled, currently not indexed" since late May. The 14 Nov review
// (docs/site-and-money-review-2026-11-14.md, docs/site-audit-2026-11-14.json,
// "search" findings 1, 3 and 6) reads this as a site-level judgement of mass
// produced content, not a domain-age delay. Owner approved 2026-11-14.
//
// So Google is shown only the pages below: trust and utility pages, the
// editorial and data pages no template repeats, and 12 tool reviews with a high
// share of text unique to the page (8 word shingles, 10 Nov build, measured in
// verification/2026-11-14/site-batch/spec_index.md; below rank 9 the cut is
// within measurement noise, and /tools/responsibid/ (rank 13) takes the place
// of /tools/contractor-plus/ (rank 3), whose main links are affiliate links).
//
// Every other page that is indexable today STAYS indexable for every other
// engine and for AI crawlers: Layout.astro adds
//   <meta name="googlebot" content="noindex,follow">
// only when the page has no robots noindex of its own and is not on this list.
// The general robots meta, the sitemap, llms.txt and the search index do NOT
// read this list. Vendors and AI assistants find the trade pages through other
// engines, and that flow must not be cut.
//
// Single source of truth: Layout.astro and scripts/index-states.mjs read it.
// Entries are lowercase paths with a leading and a trailing slash ('/' is home).
//
// To release one page to Google: add its path here and rebuild.
// To undo the whole gate: set GOOGLE_ONLY_GATE to false (every page that is not
// robots-noindexed becomes visible to Google again), rebuild, push.
export const GOOGLE_ONLY_GATE = true;

export const GOOGLE_VISIBLE_PATHS = new Set([
  // Trust and utility (12)
  '/', '/about/', '/methodology/', '/editorial-standards/', '/verification-log/',
  '/reputation-flags/', '/contact/', '/disclosure/', '/privacy/', '/terms/',
  '/for-vendors/', '/for-vendors/listing-requirements/',
  // Editorial and data (4)
  '/cost-of-switch/', '/trends-2026/', '/research/hvac-software-published-prices/', '/research/index/',
  // Tool reviews, high unique share (12)
  '/tools/safetyculture/', '/tools/solea/', '/tools/responsibid/', '/tools/knowhow/',
  '/tools/albi/', '/tools/coolfront/', '/tools/moversdesk/', '/tools/calday/',
  '/tools/fasite/', '/tools/companycam/', '/tools/estimate-rocket/', '/tools/gorilladesk/',
]);

// Fail the build on a malformed entry.
for (const p of GOOGLE_VISIBLE_PATHS) {
  if (!/^\/(?:[a-z0-9-]+\/)*$/.test(p)) {
    throw new Error(`GOOGLE_VISIBLE_PATHS: bad entry "${p}" (lowercase, leading and trailing slash)`);
  }
}

/** Normalise a request or build path to the form used in GOOGLE_VISIBLE_PATHS. */
export function toListedPath(pathname) {
  let p = String(pathname || '/').split(/[?#]/)[0];
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/{2,}/g, '/').replace(/\/index\.html$/i, '/');
  if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/';
  return p.toLowerCase();
}

/** True when Google may index this page (it still needs no robots noindex). */
export function isGoogleVisible(pathname) {
  if (!GOOGLE_ONLY_GATE) return true;
  return GOOGLE_VISIBLE_PATHS.has(toListedPath(pathname));
}
