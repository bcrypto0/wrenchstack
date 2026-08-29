// Per-URL <lastmod> for the sitemap, driven by real verification dates rather
// than build time (added 2026-08-29, launch-day SEO audit).
//
// Why it matters: a sitemap with no lastmod tells Google nothing about what
// changed, so on a young domain with thousands of URLs the crawler has no
// signal for where to spend budget. We already record, per vendor, the date a
// human last verified that entry. Feeding those dates to the sitemap points
// crawlers at genuinely updated pages.
//
// Deliberately honest: we do NOT stamp every URL with today's date to look
// fresh. Pages with no verification date get no lastmod at all, which is the
// truthful signal.

import toolsData from '../data/tools.json' with { type: 'json' };
import aiToolsData from '../data/ai_tools.json' with { type: 'json' };
import leadGenData from '../data/lead_gen.json' with { type: 'json' };
import insuranceData from '../data/insurance.json' with { type: 'json' };
import payrollData from '../data/payroll.json' with { type: 'json' };
import agenciesData from '../data/agencies.json' with { type: 'json' };
import paymentsData from '../data/payments.json' with { type: 'json' };
import financingData from '../data/financing.json' with { type: 'json' };
import accountingData from '../data/accounting.json' with { type: 'json' };
import bankingData from '../data/banking.json' with { type: 'json' };

function iso(d) {
  if (!d || typeof d !== 'string') return null;
  const m = d.match(/^\d{4}-\d{2}-\d{2}$/);
  return m ? new Date(d + 'T00:00:00Z') : null;
}

// path prefix -> [entries, dateField]
const SOURCES = [
  ['/tools/', toolsData.tools, (e) => e.pricing?.verified_date],
  ['/ai-tools/', aiToolsData.ai_tools, (e) => e.verified_date],
  ['/lead-gen/', leadGenData.platforms, (e) => e.verified_date],
  ['/insurance/', insuranceData.providers, (e) => e.verified_date],
  ['/payroll/', payrollData.services, (e) => e.verified_date],
  ['/agencies/', agenciesData.agencies, (e) => e.verified_date],
  ['/payments/', paymentsData.processors, (e) => e.verified_date],
  ['/financing/', financingData.providers, (e) => e.verified_date],
  ['/accounting/', accountingData.software, (e) => e.verified_date],
  ['/banking/', bankingData.providers, (e) => e.verified_date],
];

// Build the lookup once at config-load time.
const BY_PATH = new Map();
let newestOverall = null;
for (const [prefix, entries, getDate] of SOURCES) {
  for (const e of entries ?? []) {
    const d = iso(getDate(e));
    if (!d || !e.slug) continue;
    BY_PATH.set(`${prefix}${e.slug}/`, d);
    if (!newestOverall || d > newestOverall) newestOverall = d;
  }
}

// Category hubs and the data-driven report pages move whenever any entry in
// them moves, so they inherit the newest date in their own category.
const HUB_NEWEST = new Map();
for (const [prefix, entries, getDate] of SOURCES) {
  let newest = null;
  for (const e of entries ?? []) {
    const d = iso(getDate(e));
    if (d && (!newest || d > newest)) newest = d;
  }
  if (newest) HUB_NEWEST.set(prefix, newest);
}

const SITEWIDE_DATA_PAGES = new Set([
  '/trends-2026/',
  '/verification-log/',
  '/reputation-flags/',
  '/methodology/',
  '/awards/2026/',
]);

export function lastmodFor(urlStr) {
  let path;
  try { path = new URL(urlStr).pathname; } catch { path = urlStr; }
  const exact = BY_PATH.get(path);
  if (exact) return exact;
  if (SITEWIDE_DATA_PAGES.has(path) && newestOverall) return newestOverall;
  const hub = HUB_NEWEST.get(path);
  if (hub) return hub;
  return undefined; // no honest date to give
}
