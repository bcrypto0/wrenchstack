// Indexability gate for /compare/ pages.
//
// Head-to-head comparison pages exist in both word orders for every tool pair
// that shares a vertical. Only the high-intent comparisons are indexable; the
// rest are noindex and out of the sitemap.
//
// This module is the single source of truth, imported by BOTH the comparison
// page template (to set the noindex prop) and astro.config.mjs (to filter the
// sitemap), so the two never drift apart.

// High-demand FSM / contractor brands: the ones with real "X vs Y" search
// volume. A comparison is only worth indexing when BOTH tools are on this
// list. Expand to release more.
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
// noindexed (via IntlComparison.astro).
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


// --- International section ---------------------------------------------------
// Country pages are noindex,follow for every engine and out of the sitemap,
// except the paths listed in INTL_OPEN_PATHS below. They are still served and
// still linked. The narrower GATED_INTL_COMPARE_MARKETS gate above is kept for
// reference.
export const INTL_MARKET_CODES = new Set([
  'ae', 'au', 'ba', 'ca', 'eg', 'fr', 'ie', 'jo', 'kw',
  'ma', 'my', 'nz', 'om', 'qa', 'sa', 'uk', 'za',
]);

/** True for any path inside an international market, at any depth. */
export function isInternationalPath(pathname) {
  const seg = String(pathname || '').split('/').filter(Boolean)[0];
  return seg !== undefined && INTL_MARKET_CODES.has(seg);
}

// --- Core index --------------------------------------------------------------
// The core is: home, trade hubs, section hubs, tool reviews and the editorial
// and trust pages. The sections below are noindex,follow and out of the
// sitemap: still served, still linked, links on them still followed.
// To release a section, remove it here.
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

// --- Vendor entries ----------------------------------------------------------
// The vendor entries (insurance, lead-gen, payroll, agencies, ai-tools,
// accounting, financing, payments, banking, including their /trade/ pages)
// carry no robots noindex. They are not on GOOGLE_VISIBLE_PATHS, so
// Layout.astro gives them the googlebot-only noindex like every other page
// outside that list. They stay out of the sitemap (isCoreGatedPath is still
// the sitemap rule); the /trade/ pages are linked from their section hubs
// (TradeGuideLinks.astro).
//
// The templated sections listed here keep the robots noindex for every engine,
// as do /tools/<slug>/alternatives/, /state/, /software-by-country/ and
// /compare-builder/.
// Undo: add the nine vendor section names to this set.
export const CORE_GATED_ALL_ENGINES = new Set([
  'compare', 'multi-compare', 'compare-builder', 'pricing', 'migrate', 'features',
  'best-software-for', 'state', 'software-by-country',
]);

/** True for a core-gated page that no engine may index (robots noindex). */
export function isCoreGatedForAllEngines(pathname) {
  if (!isCoreGatedPath(pathname)) return false;
  const segs = String(pathname || '').split('/').filter(Boolean);
  if (segs[0] === 'tools') return true; // /tools/<slug>/alternatives/
  return CORE_GATED_ALL_ENGINES.has(segs[0]);
}

// Country pages open to non Google engines.
// Exact paths only, lowercase with a leading and a trailing slash. A listed path
// has no robots noindex and is in the sitemap; Layout.astro still gives it the
// googlebot only noindex because it is not on GOOGLE_VISIBLE_PATHS. Every other
// country path keeps the robots noindex. Add a path here only after its record
// has been checked against the vendor's own pages.
export const INTL_OPEN_PATHS = new Set([
  '/uk/',
  '/uk/bigchange/', '/uk/joblogic/', '/uk/tradify-uk/',
]);

/** True for a country path that is open to non Google engines. */
export function isInternationalOpenPath(pathname) {
  return INTL_OPEN_PATHS.has(toListedPath(pathname));
}

/** True when the page carries robots noindex, i.e. no engine may index it. */
export function isNoindexedForAllEngines(pathname) {
  return (isInternationalPath(pathname) && !isInternationalOpenPath(pathname))
    || isCoreGatedForAllEngines(pathname) || isArchivedPath(pathname);
}

// Sitemap filter: keep every non-comparison URL; keep a /compare/<a>-vs-<b>/
// URL only when it is indexable; drop gated intl markets' head-to-heads.
export function shouldKeepInSitemap(urlStr) {
  let path;
  try { path = new URL(urlStr).pathname; } catch { path = urlStr; }
  // Whole international section is out of the sitemap (2026-09-07 thin-page audit).
  // Except the country pages listed in INTL_OPEN_PATHS (2026-11-24).
  if (isInternationalPath(path) && !isInternationalOpenPath(path)) return false;
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

// --- Google-visible set ------------------------------------------------------
// Google is shown only the pages below: trust and utility pages, the editorial
// and data pages no template repeats, and a set of tool reviews.
//
// Every other page that is indexable STAYS indexable for every other engine
// and for AI crawlers: Layout.astro adds
//   <meta name="googlebot" content="noindex,follow">
// only when the page has no robots noindex of its own and is not on this list.
// The general robots meta, the sitemap, llms.txt and the search index do NOT
// read this list.
//
// Single source of truth: Layout.astro and scripts/index-states.mjs read it.
// Entries are lowercase paths with a leading and a trailing slash ('/' is home).
//
// To release one page to Google: add its path here and rebuild.
// To undo the whole gate: set GOOGLE_ONLY_GATE to false, rebuild.
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

// Fail the build on a malformed or non country entry.
for (const p of INTL_OPEN_PATHS) {
  if (!/^\/(?:[a-z0-9-]+\/)*$/.test(p) || !isInternationalPath(p)) {
    throw new Error(`INTL_OPEN_PATHS: bad entry "${p}" (lowercase, leading and trailing slash, inside a country)`);
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
