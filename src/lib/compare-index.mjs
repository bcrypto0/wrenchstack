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
// So: noindex + drop from the sitemap by default. The exception is a page that
// has EARNED external links, because a page other sites already cite is a real
// destination regardless of how it was generated. Contractor Foreman's press
// releases cite the Illinois and Nebraska general-contractor roundups, so those
// stay indexable.
//
// To release more: give a page something that is not a find-replace (real
// licensing-board detail, state-specific permit rules, local pricing) and add
// its key here. Earning the release is the point; do not bulk-add.
export const INDEXABLE_STATE_PAGES = new Set([
  'illinois/general-contractor',
  'nebraska/general-contractor',
]);

export function isStatePageIndexable(stateSlug, verticalUrl) {
  return INDEXABLE_STATE_PAGES.has(`${stateSlug}/${verticalUrl}`);
}

// Sitemap filter: keep every non-comparison URL; keep a /compare/<a>-vs-<b>/
// URL only when it is indexable; drop gated intl markets' head-to-heads.
export function shouldKeepInSitemap(urlStr) {
  let path;
  try { path = new URL(urlStr).pathname; } catch { path = urlStr; }
  const intl = path.match(/^\/([a-z]{2})\/compare\/.+-vs-.+\/$/);
  if (intl) return !GATED_INTL_COMPARE_MARKETS.has(intl[1]);
  // State hubs and state-by-trade pages: allowlist only.
  const stateVertical = path.match(/^\/state\/([^/]+)\/([^/]+)\/$/);
  if (stateVertical) return isStatePageIndexable(stateVertical[1], stateVertical[2]);
  if (/^\/state\/[^/]+\/$/.test(path)) return false;
  const m = path.match(/^\/compare\/(.+)-vs-(.+)\/$/);
  if (!m) return true;
  return isComparisonIndexable(m[1], m[2]);
}
