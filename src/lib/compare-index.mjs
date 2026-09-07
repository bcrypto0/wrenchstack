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

// High-demand FSM / contractor brands — the ones with real "X vs Y" search
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
// duplicate — its canonical already points at the alphabetical version — and
// (b) every pair touching a long-tail tool nobody searches by name.
export function isComparisonIndexable(slugA, slugB) {
  return slugA < slugB
    && POPULAR_TOOL_SLUGS.has(slugA)
    && POPULAR_TOOL_SLUGS.has(slugB);
}

// Gulf markets (added 2026-06): their head-to-head pages are numerous (~266
// templated pages) on a domain still fighting for crawl budget. Same
// young-domain logic as /compare/ — keep them out of the sitemap and
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

// Sitemap filter: keep every non-comparison URL; keep a /compare/<a>-vs-<b>/
// URL only when it is indexable; drop gated intl markets' head-to-heads.
export function shouldKeepInSitemap(urlStr) {
  let path;
  try { path = new URL(urlStr).pathname; } catch { path = urlStr; }
  // Whole international section is out of the sitemap (2026-09-07 thin-page audit).
  if (isInternationalPath(path)) return false;
  // State hubs and state-by-trade pages: allowlist only.
  const stateVertical = path.match(/^\/state\/([^/]+)\/([^/]+)\/$/);
  if (stateVertical) return isStatePageIndexable(stateVertical[1], stateVertical[2]);
  if (/^\/state\/[^/]+\/$/.test(path)) return false;
  const m = path.match(/^\/compare\/(.+)-vs-(.+)\/$/);
  if (!m) return true;
  return isComparisonIndexable(m[1], m[2]);
}
