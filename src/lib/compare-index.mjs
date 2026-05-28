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

// Sitemap filter: keep every non-comparison URL; keep a /compare/<a>-vs-<b>/
// URL only when it is indexable.
export function shouldKeepInSitemap(urlStr) {
  let path;
  try { path = new URL(urlStr).pathname; } catch { path = urlStr; }
  const m = path.match(/^\/compare\/(.+)-vs-(.+)\/$/);
  if (!m) return true;
  return isComparisonIndexable(m[1], m[2]);
}
