import toolsData from '../data/tools.json';
import categoriesData from '../data/categories.json';
import awardsData from '../data/awards.json';
import reviewsData from '../data/reviews.json';
import leadGenData from '../data/lead_gen.json';
import insuranceData from '../data/insurance.json';
import payrollData from '../data/payroll.json';
import agenciesData from '../data/agencies.json';
import aiToolsData from '../data/ai_tools.json';

export interface ToolPricing {
  starting_at_usd: number | null;
  tiers: string[];
  tier_prices_usd: (number | null)[] | null;
  pricing_note?: string;
  verified_date: string;
  free_trial_days?: number;
}

export interface ProConItem {
  title: string;
  explanation: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  vendor_url: string;
  affiliate_url: string;
  tagline: string;
  verticals: string[];
  vertical_fit?: Record<string, number>;
  pricing: ToolPricing;
  key_features: string[];
  integrations: string[];
  best_for: string;
  best_team_size?: string;
  weaknesses: string;
  g2_rating?: number;
  capterra_rating?: number;
  founded?: number;
  headquartered?: string;
  // --- Phase 2 custom content (optional; per-tool deep content for
  // flagship tools that get full reviews. Template falls back to
  // generated content when these are absent.) ---
  long_description?: string;        // 200-300 word product narrative
  pros_detail?: ProConItem[];        // 5-7 detailed pros with explanations
  cons_detail?: ProConItem[];        // 5-7 detailed cons with explanations
  implementation_notes?: string;    // 150-250 word tool-specific implementation detail
  tool_faqs?: ToolFaq[];             // 5+ tool-specific FAQs
}

export interface Vertical {
  slug: string;
  name: string;
  search_volume_estimate: string;
  buyer_intent: string;
  // --- Phase 3 custom content (optional; per-vertical deep content
  // for flagship verticals. Template falls back to generated content
  // when these are absent.) ---
  industry_context?: string;     // 300-400 word industry overview
  buying_personas?: string;      // 200-300 word buyer profiles
  feature_priorities?: string;   // 200-300 word feature priorities for this trade
  regulatory_notes?: string;     // 100-200 word industry compliance/certifications
  seasonality?: string;          // 100-150 word seasonal patterns
  vertical_faqs?: ToolFaq[];     // 5+ vertical-specific FAQs (replaces generic templated ones)
}

export const tools: Tool[] = toolsData.tools as Tool[];
export const verticals: Vertical[] = categoriesData.verticals as Vertical[];

export function verticalToUrl(slug: string): string {
  return slug.replace(/_/g, '-');
}

export function urlToVertical(url: string): string {
  return url.replace(/-/g, '_');
}

export function toolsForVertical(verticalSlug: string): Tool[] {
  return tools.filter((t) => t.verticals.includes(verticalSlug));
}

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getVertical(slug: string): Vertical | undefined {
  return verticals.find((v) => v.slug === slug);
}

export function aggregateRating(t: Tool): number | null {
  const ratings: number[] = [];
  if (t.g2_rating) ratings.push(t.g2_rating);
  if (t.capterra_rating) ratings.push(t.capterra_rating);
  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export function verticalFitScore(t: Tool, verticalSlug: string): number {
  return t.vertical_fit?.[verticalSlug] ?? 5;
}

export function rankToolsForVertical(verticalSlug: string): Tool[] {
  const matched = toolsForVertical(verticalSlug);
  return matched.sort((a, b) => {
    const fitDiff = verticalFitScore(b, verticalSlug) - verticalFitScore(a, verticalSlug);
    if (fitDiff !== 0) return fitDiff;
    const rA = aggregateRating(a) ?? 0;
    const rB = aggregateRating(b) ?? 0;
    return rB - rA;
  });
}

export function formatPrice(t: Tool): string {
  const p = t.pricing;
  if (p.starting_at_usd === null) return 'Custom quote';
  if (p.starting_at_usd === 0) return 'Free tier available';
  return `From $${p.starting_at_usd}/mo`;
}

export function wrenchStackScore(t: Tool, verticalSlug?: string): number {
  // Composite editorial score 0-10
  // 40% vertical fit, 30% aggregate user rating, 10% pricing transparency,
  // 10% feature richness, 10% integration richness.
  const fit = verticalSlug ? verticalFitScore(t, verticalSlug) : 7;
  const rating = aggregateRating(t);
  const ratingNormalized = rating !== null ? rating * 2 : 5;
  const transparency = t.pricing.starting_at_usd !== null ? 10 : 5;
  const featureScore = Math.min(t.key_features.length, 10);
  const integrationScore = Math.min(t.integrations.length, 10);

  const score =
    fit * 0.4 +
    ratingNormalized * 0.3 +
    transparency * 0.1 +
    featureScore * 0.1 +
    integrationScore * 0.1;

  return Math.min(10, Math.round(score * 10) / 10);
}

export function getLogoUrl(t: Tool, size = 64): string {
  // Use Clearbit Logo API (free, no auth required) with the vendor's domain.
  try {
    const url = new URL(t.vendor_url);
    return `https://logo.clearbit.com/${url.hostname}?size=${size}`;
  } catch {
    return '';
  }
}

export function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 220));
}

// --- Smart alternatives: replace the rating-only sort that previously
// surfaced MaintainX/Limble (CMMS tools) as "alternatives" to FSM tools
// like ServiceTitan and Jobber on every page. The new ranking factors in
// (1) tool-type compatibility (FSM vs CMMS vs construction PM), (2) price
// tier proximity, (3) shared vertical fit strength, and (4) team-size
// bucket overlap — with rating as a tiebreaker, not the primary signal.

export type ToolType = 'fsm' | 'cmms' | 'construction_pm' | 'estimating' | 'crm' | 'specialty' | 'unknown';
export type PriceTier = 'free' | 'entry' | 'mid' | 'enterprise';
export type TeamSizeBucket = 'solo' | 'small' | 'mid' | 'large';

// Customer-facing FSM signature features. A tool with these is dispatch /
// scheduling / billing software customers see — i.e. real FSM.
const FSM_CORE_FEATURES = new Set([
  'scheduling',
  'dispatching',
  'invoicing',
  'invoice_automation',
  'automated_billing',
  'billing_automation',
  'online_invoicing',
  'estimates',
  'estimating',
  'quoting',
  'quotes',
  'mobile_quoting',
  'customer_portal',
  'job_management',
  'job_costing',
  'recurring_scheduling',
  'route_optimization',
  'recurring_services',
]);

// CMMS / internal-maintenance signature features. Tools dominated by
// these are facility maintenance platforms, not FSM.
const CMMS_FEATURES = new Set([
  'preventive_maintenance',
  'asset_management',
  'asset_tracking',
  'qr_codes',
  'procedures',
  'incident_tracking',
  'work_orders',
]);

// Construction PM signature features.
const CONSTRUCTION_PM_FEATURES = new Set([
  'selection_management',
  'change_orders',
  'aia_billing',
  'submittals',
  'rfi_management',
  'punchlist',
  'daily_logs',
  'drawings',
]);

export function toolType(t: Tool): ToolType {
  const features = t.key_features ?? [];
  const fsmHits = features.filter((f) => FSM_CORE_FEATURES.has(f)).length;
  const cmmsHits = features.filter((f) => CMMS_FEATURES.has(f)).length;
  const constructionHits = features.filter((f) => CONSTRUCTION_PM_FEATURES.has(f)).length;

  // CMMS dominance: 2+ CMMS-only features AND no customer-facing FSM signal
  if (cmmsHits >= 2 && fsmHits === 0) return 'cmms';

  // Construction PM dominance: selection/change-order/AIA features present
  // AND construction or roofing vertical present
  if (constructionHits >= 2 && fsmHits <= 2) return 'construction_pm';

  // FSM dominance: 3+ customer-facing FSM features
  if (fsmHits >= 3) return 'fsm';

  // Estimating-only specialty (low feature count, has estimating)
  if (features.length <= 5 && features.some((f) => f.includes('estim') || f.includes('quot'))) {
    return 'estimating';
  }

  return 'unknown';
}

export function priceTier(t: Tool): PriceTier {
  const p = t.pricing.starting_at_usd;
  if (p === null) return 'enterprise';
  if (p === 0) return 'free';
  if (p < 100) return 'entry';
  if (p < 250) return 'mid';
  return 'enterprise';
}

export function teamSizeBucket(t: Tool): TeamSizeBucket {
  const ts = t.best_team_size ?? '';
  const match = ts.match(/(\d+)-(\d+)/);
  if (!match) {
    // Fall back to a small operation if unspecified
    return 'small';
  }
  const max = parseInt(match[2], 10);
  if (max <= 3) return 'solo';
  if (max <= 15) return 'small';
  if (max <= 50) return 'mid';
  return 'large';
}

const PRICE_TIER_ORDER: PriceTier[] = ['free', 'entry', 'mid', 'enterprise'];
const TEAM_BUCKET_ORDER: TeamSizeBucket[] = ['solo', 'small', 'mid', 'large'];

export interface ScoredAlternative {
  tool: Tool;
  score: number;
  reason: string;
}

function typesCompatible(sourceType: ToolType, candType: ToolType): boolean {
  // Same type is always compatible
  if (sourceType === candType) return true;
  // CMMS source: only suggest other CMMS. (Unknown specialty tools like
  // SafetyCulture/Connecteam/OptimoRoute share verticals but aren't real
  // CMMS alternatives.)
  if (sourceType === 'cmms') {
    return candType === 'cmms';
  }
  // FSM source: exclude pure CMMS (the original bug); allow construction PM
  // for GC trades; allow estimating since people upgrade from Joist to Jobber;
  // allow unknown specialty (some are credible alts like Coolfront for HVAC).
  if (sourceType === 'fsm') {
    return candType !== 'cmms';
  }
  // Construction PM: allow FSM (some construction operators switch to FSM);
  // exclude CMMS.
  if (sourceType === 'construction_pm') {
    return candType !== 'cmms';
  }
  // Estimating specialty source: allow FSM (people upgrade from Joist to Jobber).
  if (sourceType === 'estimating') {
    return candType !== 'cmms';
  }
  // Unknown source: permissive, but exclude CMMS as a safety net
  if (sourceType === 'unknown') {
    return candType !== 'cmms';
  }
  return true;
}

function buildAlternativeRationale(source: Tool, alt: Tool): string {
  const fragments: string[] = [];
  const sourceTier = priceTier(source);
  const altTier = priceTier(alt);
  const sourceTierIdx = PRICE_TIER_ORDER.indexOf(sourceTier);
  const altTierIdx = PRICE_TIER_ORDER.indexOf(altTier);
  const altPrice = alt.pricing.starting_at_usd;

  // 1. Pricing relationship
  if (altTier === 'free' && sourceTier !== 'free') {
    fragments.push('Has a free tier');
  } else if (altTierIdx < sourceTierIdx) {
    if (altPrice !== null && altPrice > 0) {
      fragments.push(`Cheaper at $${altPrice}/mo`);
    } else {
      fragments.push('Lower-tier alternative');
    }
  } else if (altTierIdx > sourceTierIdx) {
    fragments.push('Enterprise-tier upgrade path');
  } else if (sourceTier === 'mid' || sourceTier === 'entry') {
    fragments.push('Similar price point');
  }

  // 2. Vertical specialty advantage
  const sourceVerticals = source.verticals;
  const sharedStrong = sourceVerticals.filter((v) => {
    const sFit = source.vertical_fit?.[v] ?? 5;
    const aFit = alt.vertical_fit?.[v] ?? 5;
    return aFit >= 9 && aFit > sFit;
  });
  if (sharedStrong.length > 0) {
    const vName = verticals.find((v) => v.slug === sharedStrong[0])?.name ?? sharedStrong[0];
    fragments.push(`stronger ${vName.toLowerCase()} specialty fit`);
  } else {
    // Check for shared strong fit (both ≥8)
    const sharedFit = sourceVerticals.filter((v) => {
      const sFit = source.vertical_fit?.[v] ?? 5;
      const aFit = alt.vertical_fit?.[v] ?? 5;
      return sFit >= 8 && aFit >= 8;
    });
    if (sharedFit.length > 0) {
      const vName = verticals.find((v) => v.slug === sharedFit[0])?.name ?? sharedFit[0];
      fragments.push(`also strong for ${vName.toLowerCase()}`);
    }
  }

  // 3. Rating boost
  const altRating = aggregateRating(alt);
  if (altRating !== null && altRating >= 4.7) {
    fragments.push(`top-rated (${altRating.toFixed(1)}/5)`);
  }

  // 4. Free trial advantage
  const altTrial = alt.pricing.free_trial_days ?? 0;
  const srcTrial = source.pricing.free_trial_days ?? 0;
  if (altTrial > 0 && srcTrial === 0) {
    fragments.push(`${altTrial}-day free trial`);
  }

  if (fragments.length === 0) {
    return alt.best_for;
  }

  // Capitalize first fragment
  const joined = fragments[0].charAt(0).toUpperCase() + fragments[0].slice(1) +
    (fragments.length > 1 ? `; ${fragments.slice(1).join('; ')}` : '') + '.';
  return joined;
}

// Same-type bonus prevents construction-PM and specialty tools from
// out-ranking real FSM-to-FSM matches when vertical overlap is high.
const TYPE_MATCH_BONUS = 2.0;
// Penalty for unknown / specialty tools when source is a definite type;
// they can still surface if no better candidates exist, but they don't
// out-rank real category matches.
const TYPE_MISMATCH_PENALTY = 1.0;

export function smartAlternatives(t: Tool, n: number = 6): ScoredAlternative[] {
  const sourceType = toolType(t);
  const sourceTier = priceTier(t);
  const sourceBucket = teamSizeBucket(t);
  const sourceTierIdx = PRICE_TIER_ORDER.indexOf(sourceTier);
  const sourceBucketIdx = TEAM_BUCKET_ORDER.indexOf(sourceBucket);

  // Filter candidates
  const candidates = tools.filter((c) => {
    if (c.slug === t.slug) return false;
    // Must share at least one vertical
    if (!c.verticals.some((v) => t.verticals.includes(v))) return false;
    // Tool-type compatibility check
    if (!typesCompatible(sourceType, toolType(c))) return false;
    return true;
  });

  const scored: ScoredAlternative[] = candidates.map((c) => {
    // 1. Vertical fit overlap (max 10): count verticals where BOTH source and
    // candidate have meaningful fit (≥7). This rewards broad overlap (e.g.
    // Jobber vs Housecall Pro sharing 10 verticals at 7+) over narrow
    // specialty matches (e.g. Jobber vs ZenMaid sharing 1 vertical at 10).
    let strongOverlapCount = 0;
    let weakOverlapCount = 0;
    for (const v of t.verticals) {
      if (!c.verticals.includes(v)) continue;
      const tFit = t.vertical_fit?.[v] ?? 5;
      const cFit = c.vertical_fit?.[v] ?? 5;
      if (tFit >= 7 && cFit >= 7) strongOverlapCount++;
      else if (tFit >= 5 && cFit >= 5) weakOverlapCount++;
    }
    // Strong overlap worth 2 points each (capped at 10), weak worth 0.5
    const vfNormalized = Math.min(10, strongOverlapCount * 2 + weakOverlapCount * 0.5);

    // 2. Price tier proximity (max 10): same tier = 10, 1 away = 5, 2+ = 0
    const candTierIdx = PRICE_TIER_ORDER.indexOf(priceTier(c));
    const tierDistance = Math.abs(sourceTierIdx - candTierIdx);
    const tierScore = Math.max(0, 10 - tierDistance * 5);

    // 3. Team size proximity (max 10): same = 10, 1 away = 7, 2 = 4, 3+ = 0
    const candBucketIdx = TEAM_BUCKET_ORDER.indexOf(teamSizeBucket(c));
    const bucketDistance = Math.abs(sourceBucketIdx - candBucketIdx);
    const bucketScore = Math.max(0, 10 - bucketDistance * 3);

    // 4. Rating (max 10)
    const rating = aggregateRating(c) ?? 3.5;
    const ratingScore = rating * 2;

    // Composite: 40% vertical fit + 30% tier + 15% team size + 15% rating
    let score =
      vfNormalized * 0.4 +
      tierScore * 0.3 +
      bucketScore * 0.15 +
      ratingScore * 0.15;

    // Type-match bonus / penalty: same category wins ties; specialty tools
    // penalized when source is a definite type.
    const candType = toolType(c);
    if (sourceType !== 'unknown' && candType !== 'unknown') {
      if (sourceType === candType) {
        score += TYPE_MATCH_BONUS;
      } else {
        score -= TYPE_MISMATCH_PENALTY;
      }
    } else if (sourceType !== 'unknown' && candType === 'unknown') {
      // Specialty tools surfacing as alternatives to definite-type sources
      // get a penalty so real category matches win.
      score -= TYPE_MISMATCH_PENALTY;
    }

    const reason = buildAlternativeRationale(t, c);
    return { tool: c, score, reason };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, n);
}

// --- Freshness signal: every tool's pricing has a verified_date. Surfacing
// "how fresh is this data?" as a UI pill is our single biggest direct
// attack on competitors' staleness (e.g. Capterra's ServiceTitan profile is
// 9 months out of date). Three tiers: fresh ≤90 days, aging 91-180, stale >180.

export type FreshnessTier = 'fresh' | 'aging' | 'stale';

export function daysSinceVerified(t: Tool): number {
  const verifiedDate = t.pricing.verified_date;
  if (!verifiedDate) return Number.POSITIVE_INFINITY;
  const verified = new Date(verifiedDate);
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - verified.getTime()) / msPerDay);
}

export function freshnessTier(t: Tool): FreshnessTier {
  const d = daysSinceVerified(t);
  if (d <= 90) return 'fresh';
  if (d <= 180) return 'aging';
  return 'stale';
}

// Human-readable freshness phrase: "6 days ago" / "3 months ago" / "stale"
export function freshnessLabel(t: Tool): string {
  const d = daysSinceVerified(t);
  if (d === Number.POSITIVE_INFINITY) return 'No verified date';
  if (d === 0) return 'Verified today';
  if (d === 1) return 'Verified yesterday';
  if (d < 14) return `Verified ${d} days ago`;
  if (d < 60) return `Verified ${Math.round(d / 7)} weeks ago`;
  if (d < 365) return `Verified ${Math.round(d / 30)} months ago`;
  return `Verified ${Math.round(d / 365)}+ year(s) ago`;
}

// Sitewide freshness stats — used on homepage widget.
export interface FreshnessStats {
  fresh: number;
  aging: number;
  stale: number;
  verifiedLast30Days: number;
  totalTools: number;
}

export function freshnessStats(): FreshnessStats {
  let fresh = 0;
  let aging = 0;
  let stale = 0;
  let verifiedLast30Days = 0;
  for (const t of tools) {
    const tier = freshnessTier(t);
    if (tier === 'fresh') fresh++;
    else if (tier === 'aging') aging++;
    else stale++;
    if (daysSinceVerified(t) <= 30) verifiedLast30Days++;
  }
  return {
    fresh,
    aging,
    stale,
    verifiedLast30Days,
    totalTools: tools.length,
  };
}

// --- Cross-link audit: convert competitor tool name mentions in prose
// into clickable links to /tools/<slug>/. Used in the tool review template
// to make every Phase 2 narrative section discoverable to crawlers and
// human readers.
//
// Behaviour:
// - Word-boundary, case-sensitive matching (prevents false positives like
//   "joist" the wood beam matching the Joist tool, since brand names are
//   capitalized).
// - Longest-first matching so multi-word names ("Service Autopilot") win
//   over shorter substrings.
// - Excludes the current tool's own name (no self-links).
// - HTML-escapes input before injecting links (safe to use with set:html).
// - Includes optional aliases for tools whose brand name is commonly
//   shortened in prose (e.g. "Limble CMMS" also matched as "Limble").

const TOOL_NAME_ALIASES: Record<string, string> = {
  // alias -> canonical slug
  'Limble': 'limble',
  'Houzz': 'houzz-pro',
  'HCP': 'housecall-pro',
  'STitan': 'servicetitan',
};

function escapeHtmlForLinkify(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function regexEscape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function linkifyTools(text: string | undefined, currentSlug: string): string {
  if (!text) return '';
  const escaped = escapeHtmlForLinkify(text);

  // Build mapping of display-name -> slug, excluding the current tool
  // and any alias whose target is the current tool.
  const nameToSlug = new Map<string, string>();
  for (const t of tools) {
    if (t.slug === currentSlug) continue;
    nameToSlug.set(t.name, t.slug);
  }
  for (const [alias, targetSlug] of Object.entries(TOOL_NAME_ALIASES)) {
    if (targetSlug === currentSlug) continue;
    if (!tools.some((t) => t.slug === targetSlug)) continue;
    // Don't overwrite if a full tool name already maps to this alias
    if (!nameToSlug.has(alias)) nameToSlug.set(alias, targetSlug);
  }
  if (nameToSlug.size === 0) return linkifyGlossary(escaped);

  // Sort names longest-first so "Service Autopilot" matches before "Service"
  const names = Array.from(nameToSlug.keys()).sort(
    (a, b) => b.length - a.length,
  );
  const pattern = new RegExp(`\\b(${names.map(regexEscape).join('|')})\\b`, 'g');

  // Track positions already wrapped so we don't double-link inside an <a>
  // that a longer name already created. The regex's left-to-right pass with
  // greedy alternation handles ordering, so we only need to guard against
  // post-replacement substring matches — but since we run the regex once
  // against the original escaped text, no double-linking happens.
  const withToolLinks = escaped.replace(pattern, (match) => {
    const slug = nameToSlug.get(match);
    if (!slug) return match;
    return `<a href="/tools/${slug}/" class="font-medium underline decoration-orange-400 decoration-2 underline-offset-2 hover:decoration-orange-600">${match}</a>`;
  });

  // Then layer on glossary cross-references for jargon terms
  return linkifyGlossary(withToolLinks);
}

// --- Glossary cross-reference: links jargon terms in prose to /glossary/
// definitions. Wikipedia-style cross-references. Case-INsensitive matching
// for terms that appear naturally in lowercase prose ("dispatching",
// "service agreement"); abbreviations (FSM, CMMS, AIA) require the exact
// uppercase form. Only the first occurrence per text block gets linked
// to avoid clutter.

// Curated term → slug map. Pulled from /glossary/ categories. Sorted
// longest-first via .length comparator at use time. Each entry: [term,
// glossary-slug, case-sensitivity flag (true = exact case required)].
const GLOSSARY_TERMS: Array<[string, string, boolean]> = [
  // Multi-word terms first (longer = matched first)
  ['custom-quoted pricing', 'custom-quoted', false],
  ['per-company pricing', 'per-company-pricing', false],
  ['per-user pricing', 'per-user-pricing', false],
  ['implementation fee', 'implementation-fee', false],
  ['service agreement', 'service-agreement', false],
  ['service agreements', 'service-agreement', false],
  ['customer portal', 'customer-portal', false],
  ['route optimization', 'route-optimization', false],
  ['membership program', 'membership-program', false],
  ['consumer financing', 'consumer-financing', false],
  ['selection management', 'selection-management', false],
  ['chemical tracking', 'chemical-tracking', false],
  ['asset tracking', 'asset-tracking', false],
  ['preventive maintenance', 'preventive-maintenance', false],
  ['parallel run', 'parallel-run', false],
  ['vendor lockout', 'vendor-lockout', false],
  ['implementation manager', 'implementation-manager', false],
  ['adoption resistance', 'adoption-resistance', false],
  ['change orders', 'change-orders', false],
  ['two-way SMS', 'two-way-sms', false],
  ['AIA billing', 'aia-billing', true],
  ['Google Local Services Ads', 'lsa', true],
  ['QuickBooks Online', 'qbo-vs-desktop', true],
  ['QuickBooks Desktop', 'qbo-vs-desktop', true],
  ['Sage Intacct', 'sage-intacct-netsuite', true],
  // Single-word abbreviations require exact case
  ['FSM', 'fsm', true],
  ['CMMS', 'cmms', true],
  ['LSA', 'lsa', true],
  ['CRM', 'crm', true],
  ['Xero', 'xero', true],
  ['Stripe', 'stripe', true],
  ['Zapier', 'zapier', true],
  ['NetSuite', 'sage-intacct-netsuite', true],
];

function linkifyGlossary(html: string): string {
  // Track which terms we've already linked (first-occurrence-only policy)
  const alreadyLinked = new Set<string>();
  // Sort longest-first
  const sortedTerms = [...GLOSSARY_TERMS].sort((a, b) => b[0].length - a[0].length);

  let result = html;
  for (const [term, slug, caseSensitive] of sortedTerms) {
    if (alreadyLinked.has(slug)) continue;
    const flags = caseSensitive ? '' : 'i';
    const pattern = new RegExp(`\\b(${regexEscape(term)})\\b`, flags);
    // Find a match that isn't already inside an anchor tag.
    let match: RegExpExecArray | null = null;
    let searchFrom = 0;
    while (searchFrom < result.length) {
      const re = new RegExp(`\\b(${regexEscape(term)})\\b`, flags + 'g');
      re.lastIndex = searchFrom;
      const m = re.exec(result);
      if (!m) break;
      // Check if the match is inside an <a> tag: scan backwards from match for
      // an unclosed <a; if found before a </a, skip this match.
      const before = result.slice(0, m.index);
      const lastOpenA = before.lastIndexOf('<a ');
      const lastCloseA = before.lastIndexOf('</a>');
      if (lastOpenA > lastCloseA) {
        // Inside an existing link — skip this occurrence and continue
        searchFrom = m.index + m[0].length;
        continue;
      }
      match = m;
      break;
    }
    if (!match) continue;
    // Replace this single occurrence
    const matchedText = match[0];
    const replacement = `<a href="/glossary/#${slug}" class="border-b border-dotted border-slate-400 hover:border-orange-500 hover:text-orange-700">${matchedText}</a>`;
    result = result.slice(0, match.index) + replacement + result.slice(match.index + matchedText.length);
    alreadyLinked.add(slug);
  }
  return result;
}

// --- WrenchStack Awards 2026 -------------------------------------------------
// Editorial awards (no payment for placement). See /awards/2026/ and
// methodology page for the rubric.

export interface AwardCategory {
  slug: string;
  label: string;
  winner_slug: string;
  why: string;
  honorable_mentions: string[];
  buyer_signal: string;
}

export interface AwardsData {
  year: number;
  published_date: string;
  methodology_summary: string;
  categories: AwardCategory[];
}

export const awards: AwardsData = awardsData as AwardsData;

export interface ToolAward {
  category: AwardCategory;
  kind: 'winner' | 'honorable_mention';
}

/** Returns all awards (wins + HMs) a tool received, in award-list order. */
export function awardsForTool(toolSlug: string): ToolAward[] {
  const result: ToolAward[] = [];
  for (const cat of awards.categories) {
    if (cat.winner_slug === toolSlug) {
      result.push({ category: cat, kind: 'winner' });
    } else if (cat.honorable_mentions.includes(toolSlug)) {
      result.push({ category: cat, kind: 'honorable_mention' });
    }
  }
  return result;
}

/** Returns only outright wins for a tool (used for prominent badges). */
export function winsForTool(toolSlug: string): AwardCategory[] {
  return awards.categories.filter((c) => c.winner_slug === toolSlug);
}

// --- User reviews ------------------------------------------------------------
// Submissions arrive at bilal@wrenchstack.com via Web3Forms (or similar)
// and are added to reviews.json after manual moderation. Display empty state
// when no approved reviews exist for a tool yet.

export interface UserReview {
  id: string;
  tool_slug: string;
  rating: number;
  reviewer_role: 'owner' | 'tech' | 'admin' | 'manager' | 'other';
  team_size: string;
  vertical: string;
  pros: string;
  cons: string;
  would_recommend: boolean;
  verified_buyer: boolean;
  submitted_date: string;
  moderated_date: string;
}

export const reviews: UserReview[] = (reviewsData as { reviews: UserReview[] }).reviews;

export function reviewsForTool(toolSlug: string): UserReview[] {
  return reviews
    .filter((r) => r.tool_slug === toolSlug)
    .sort((a, b) => b.submitted_date.localeCompare(a.submitted_date));
}

export function userRatingForTool(toolSlug: string): { avg: number; count: number } | null {
  const rs = reviewsForTool(toolSlug);
  if (rs.length === 0) return null;
  const avg = rs.reduce((a, r) => a + r.rating, 0) / rs.length;
  return { avg, count: rs.length };
}

// --- Lead-gen platforms (Phase 1 multi-category expansion) -------------------

export type LeadModel =
  | 'exclusive'
  | 'shared'
  | 'pay-per-call'
  | 'marketplace-bid'
  | 'directory-listing'
  | 'display-ads';

export type PricingModel =
  | 'pay-per-lead'
  | 'pay-per-quote'
  | 'pay-per-call'
  | 'pay-per-click'
  | 'subscription'
  | 'marketplace-bid';

export interface LeadGenRatings {
  trustpilot: number | null;
  bbb: string | null;
  reddit_sentiment: string;
}

export interface LeadGenFaq {
  q: string;
  a: string;
}

export interface LeadGenPlatform {
  slug: string;
  name: string;
  vendor_url: string;
  affiliate_url: string;
  tagline: string;
  lead_model: LeadModel;
  pricing_model: PricingModel;
  typical_cost: string;
  exclusivity: string;
  verticals: string[];
  geographic_coverage: string;
  founded: number;
  headquartered: string;
  long_description: string;
  how_it_works: string;
  pros_detail: ProConItem[];
  cons_detail: ProConItem[];
  best_for: string;
  best_team_size: string;
  weaknesses: string;
  reputation_flag: string | null;
  ratings: LeadGenRatings;
  key_features: string[];
  affiliate_program: string;
  affiliate_payout_note: string;
  verified_date: string;
  platform_faqs: LeadGenFaq[];
}

export const leadGenPlatforms: LeadGenPlatform[] = (leadGenData as { platforms: LeadGenPlatform[] }).platforms;

export function getLeadGenPlatform(slug: string): LeadGenPlatform | undefined {
  return leadGenPlatforms.find((p) => p.slug === slug);
}

export function leadGenPlatformsForVertical(verticalSlug: string): LeadGenPlatform[] {
  return leadGenPlatforms.filter((p) => p.verticals.includes(verticalSlug));
}

export function leadGenPlatformsByModel(model: LeadModel): LeadGenPlatform[] {
  return leadGenPlatforms.filter((p) => p.lead_model === model);
}

/** Tier classification based on reputation_flag + ratings. */
export function leadGenTier(p: LeadGenPlatform): 'S' | 'A' | 'F' {
  if (p.reputation_flag) return 'F';
  const tp = p.ratings.trustpilot;
  if (tp !== null && tp < 2.5) return 'F';
  // Tier S: strongly positive sentiment + exclusive/pay-per-call models + real affiliate
  if (
    (p.lead_model === 'exclusive' || p.lead_model === 'pay-per-call' || p.lead_model === 'directory-listing') &&
    p.ratings.reddit_sentiment.toLowerCase().includes('positive')
  ) {
    return 'S';
  }
  return 'A';
}

// --- Insurance providers (Phase 2 multi-category expansion) ------------------

export type ProviderType = 'direct-carrier' | 'broker' | 'mga' | 'mutual-carrier';
export type DistributionModel = 'direct-digital' | 'agent-only' | 'hybrid';

export interface InsuranceRatings {
  trustpilot: number | null;
  bbb: string | null;
  am_best: string | null;
  reddit_sentiment: string;
}

export interface InsuranceProvider {
  slug: string;
  name: string;
  vendor_url: string;
  affiliate_url: string;
  tagline: string;
  provider_type: ProviderType;
  distribution_model: DistributionModel;
  insurance_lines: string[];
  quote_speed: string;
  typical_premium_range: string;
  verticals: string[];
  geographic_coverage: string;
  states_note: string;
  founded: number;
  headquartered: string;
  long_description: string;
  how_it_works: string;
  pros_detail: ProConItem[];
  cons_detail: ProConItem[];
  best_for: string;
  best_team_size: string;
  weaknesses: string;
  reputation_flag: string | null;
  ratings: InsuranceRatings;
  key_features: string[];
  affiliate_program: string;
  affiliate_payout_note: string;
  verified_date: string;
  provider_faqs: LeadGenFaq[];
}

export const insuranceProviders: InsuranceProvider[] = (insuranceData as { providers: InsuranceProvider[] }).providers;

export function getInsuranceProvider(slug: string): InsuranceProvider | undefined {
  return insuranceProviders.find((p) => p.slug === slug);
}

export function insuranceProvidersForVertical(verticalSlug: string): InsuranceProvider[] {
  return insuranceProviders.filter((p) => p.verticals.includes(verticalSlug));
}

/** Tier classification: S (strong reputation + good affiliate or strong recommendation), A (workable),
 *  F (reputation_flag warning required). */
export function insuranceTier(p: InsuranceProvider): 'S' | 'A' | 'F' {
  if (p.reputation_flag) return 'F';
  const tp = p.ratings.trustpilot;
  // Strong sentiment + direct-digital with affiliate → Tier S
  if (
    p.affiliate_program !== 'none' && p.affiliate_program !== 'unknown' &&
    p.distribution_model === 'direct-digital' &&
    tp !== null && tp >= 4.0
  ) return 'S';
  // Agent-only mutual carriers with strongly positive sentiment → Tier S
  if (
    p.provider_type === 'mutual-carrier' &&
    p.ratings.reddit_sentiment.toLowerCase().includes('strongly positive')
  ) return 'S';
  return 'A';
}

// --- Payroll services (Phase 3 multi-category expansion) ---------------------

export type PayrollServiceType = 'modern-saas' | 'embedded' | 'all-in-one-hr' | 'legacy-payroll' | 'peo' | 'specialty';

export interface PayrollRatings {
  g2: number | null;
  capterra: number | null;
  trustpilot: number | null;
  reddit_sentiment: string;
}

export interface PayrollService {
  slug: string;
  name: string;
  vendor_url: string;
  affiliate_url: string;
  tagline: string;
  service_type: PayrollServiceType;
  pricing_model: string;
  starting_price_usd: number | null;
  per_employee_fee_usd: number | null;
  pricing_summary: string;
  free_trial_days: number;
  verticals_supported: string[];
  geographic_coverage: string;
  founded: number;
  headquartered: string;
  long_description: string;
  how_it_works: string;
  pros_detail: ProConItem[];
  cons_detail: ProConItem[];
  best_for: string;
  best_team_size: string;
  weaknesses: string;
  reputation_flag: string | null;
  ratings: PayrollRatings;
  key_features: string[];
  integrations: string[];
  affiliate_program: string;
  affiliate_payout_note: string;
  verified_date: string;
  service_faqs: LeadGenFaq[];
}

export const payrollServices: PayrollService[] = (payrollData as { services: PayrollService[] }).services;

export function getPayrollService(slug: string): PayrollService | undefined {
  return payrollServices.find((s) => s.slug === slug);
}

/** Tier classification for payroll services. */
export function payrollTier(s: PayrollService): 'S' | 'A' | 'B' {
  if (s.reputation_flag) return 'B';
  // Gusto leads on affiliate economics + product strength
  if (s.slug === 'gusto') return 'S';
  // Modern-saas with strong sentiment → Tier S
  if (s.service_type === 'modern-saas' && (s.ratings.g2 ?? 0) >= 4.5) return 'S';
  if (s.service_type === 'specialty' && (s.ratings.g2 ?? 0) >= 4.5) return 'S';
  // Legacy + PEO → Tier B
  if (s.service_type === 'legacy-payroll' || s.service_type === 'peo') return 'B';
  return 'A';
}

/** Pick the right payroll service for a given employee-count bucket. */
export type EmployeeBucket = '1-5' | '6-20' | '20+';
export function payrollPicksForBucket(bucket: EmployeeBucket): PayrollService[] {
  const all = payrollServices;
  switch (bucket) {
    case '1-5':
      // Recommend cheapest tax-filing + Gusto for benefits
      return all.filter((s) => ['patriot-payroll', 'gusto', 'onpay', 'square-payroll', 'hourly'].includes(s.slug));
    case '6-20':
      // Sweet spot for modern SMB payroll
      return all.filter((s) => ['gusto', 'onpay', 'hourly', 'quickbooks-payroll', 'patriot-payroll'].includes(s.slug));
    case '20+':
      // Mid-market — Gusto Plus, Rippling, possibly legacy options
      return all.filter((s) => ['gusto', 'rippling', 'adp-run', 'paychex-flex', 'onpay'].includes(s.slug));
  }
}

// --- Marketing agencies (Phase 4 multi-category expansion) -------------------

export type AgencyType = 'trade-specific' | 'home-services-focus' | 'generalist' | 'lead-gen-hybrid';

export interface AgencyRatings {
  google: number | null;
  trustpilot: number | null;
  bbb: string | null;
  reddit_sentiment: string;
}

export interface MarketingAgency {
  slug: string;
  name: string;
  vendor_url: string;
  affiliate_url: string;
  tagline: string;
  agency_type: AgencyType;
  services_offered: string[];
  pricing_model: string;
  typical_retainer_usd: string;
  minimum_contract_months: number;
  verticals_specialty: string[];
  geographic_coverage: string;
  founded: number;
  headquartered: string;
  long_description: string;
  how_it_works: string;
  pros_detail: ProConItem[];
  cons_detail: ProConItem[];
  best_for: string;
  best_team_size: string;
  weaknesses: string;
  reputation_flag: string | null;
  ratings: AgencyRatings;
  key_features: string[];
  affiliate_program: string;
  affiliate_payout_note: string;
  verified_date: string;
  agency_faqs: LeadGenFaq[];
}

export const marketingAgencies: MarketingAgency[] = (agenciesData as { agencies: MarketingAgency[] }).agencies;

export function getMarketingAgency(slug: string): MarketingAgency | undefined {
  return marketingAgencies.find((a) => a.slug === slug);
}

export function agenciesForVertical(verticalSlug: string): MarketingAgency[] {
  return marketingAgencies.filter((a) => a.verticals_specialty.includes(verticalSlug) || a.agency_type === 'home-services-focus');
}

/** Tier classification for marketing agencies. */
export function agencyTier(a: MarketingAgency): 'S' | 'A' | 'F' {
  if (a.reputation_flag) return 'F';
  // Trade-specific with strong reputation → Tier S
  if (a.agency_type === 'trade-specific' && a.ratings.reddit_sentiment.toLowerCase().includes('strongly positive')) return 'S';
  // Home-services with strong reputation + content credibility → Tier S
  if (a.slug === 'hook-agency' || a.slug === 'plumbing-hvac-seo' || a.slug === 'blue-corona' || a.slug === 'adapt-digital-solutions') return 'S';
  return 'A';
}

// --- AI tools (Phase 1 net-new category: AI front office for trades) ----------
// Distinct from FSM software — AI receptionists, estimating, marketing, etc.
// Many vendors are early-stage with volatile or sales-quoted pricing, so
// starting_price_usd / founded / headquartered are nullable and the template
// renders them conditionally.

export type AiToolCategory =
  | 'ai-receptionist'
  | 'ai-estimating'
  | 'ai-marketing'
  | 'ai-scheduling'
  | 'ai-all-in-one';

export interface AiToolRatings {
  g2: number | null;
  capterra: number | null;
  trustpilot: number | null;
  reddit_sentiment: string;
}

export interface AiTool {
  slug: string;
  name: string;
  vendor_url: string;
  affiliate_url: string;
  tagline: string;
  ai_category: AiToolCategory;
  pricing_summary: string;
  starting_price_usd: number | null;
  free_trial_days: number;
  verticals_supported: string[];
  founded: number | null;
  headquartered: string;
  long_description: string;
  how_it_works: string;
  pros_detail: ProConItem[];
  cons_detail: ProConItem[];
  best_for: string;
  best_team_size: string;
  weaknesses: string;
  reputation_flag: string | null;
  ratings: AiToolRatings;
  key_features: string[];
  integrations: string[];
  affiliate_program: string;
  affiliate_payout_note: string;
  verified_date: string;
  ai_faqs: LeadGenFaq[];
}

export const aiTools: AiTool[] = (aiToolsData as { ai_tools: AiTool[] }).ai_tools;

export function getAiTool(slug: string): AiTool | undefined {
  return aiTools.find((t) => t.slug === slug);
}

export const AI_CATEGORY_META: Record<AiToolCategory, { label: string; blurb: string }> = {
  'ai-receptionist': { label: 'AI Receptionists & Call Answering', blurb: 'AI voice agents that answer inbound calls 24/7, book jobs, and stop missed-call revenue leakage — the highest-ROI AI category for trades, since service businesses miss a large share of inbound calls.' },
  'ai-estimating': { label: 'AI Estimating & Measurement', blurb: 'AI that measures from photos or satellite imagery and generates priced quotes in minutes.' },
  'ai-scheduling': { label: 'AI Scheduling & Dispatch', blurb: 'AI that books appointments against live availability and optimizes crew routes.' },
  'ai-marketing': { label: 'AI Marketing & Reviews', blurb: 'AI for review collection, before/after imagery, and marketing content.' },
  'ai-all-in-one': { label: 'AI All-in-One Assistants', blurb: 'Broad AI assistants spanning calls, follow-up, and back-office tasks.' },
};

export function aiToolsByCategory(): Array<{ category: AiToolCategory; tools: AiTool[] }> {
  const order: AiToolCategory[] = ['ai-receptionist', 'ai-estimating', 'ai-scheduling', 'ai-marketing', 'ai-all-in-one'];
  return order
    .map((category) => ({ category, tools: aiTools.filter((t) => t.ai_category === category) }))
    .filter((g) => g.tools.length > 0);
}



