import type { APIRoute } from 'astro';
import { tools, medianUsd, perUserMedian, flatFeeMedian, perUserTools, flatFeeTools } from '../../lib/data';

// Static endpoint: /data/trades-software-pricing-2026.json, generated at build
// time from tools.json. Machine-readable companion to the CSV, with dataset
// metadata and the summary statistics computed the same way /trends-2026/
// computes them (so the dataset and the report can never disagree).
// License: CC BY 4.0 (attribution: WrenchStack, wrenchstack.com).

export const GET: APIRoute = () => {
  const priced = tools.filter(
    (t) => t.pricing.starting_at_usd !== null && t.pricing.starting_at_usd > 0
  );
  const prices = priced
    .map((t) => t.pricing.starting_at_usd as number)
    .sort((a, b) => a - b);
  const medianPrice = medianUsd(prices);
  const quoteOnly = tools.filter((t) => t.pricing.starting_at_usd === null).length;
  const freeTier = tools.filter((t) => t.pricing.starting_at_usd === 0).length;

  const payload = {
    dataset: {
      name: 'WrenchStack Trades Software Pricing Dataset 2026',
      description:
        'Entry pricing, tier structure, verticals served, and verification dates for US field-service software platforms serving trades and construction businesses. Every price was checked by a human against the vendor pricing page on the pricing_verified_date recorded per platform. quote_only means the vendor publishes no price at all. pricing_model says what starting_price_usd_month actually measures: per_user is a per-seat monthly rate, flat is a fixed monthly platform fee (which may include seats), flat_plus_seat is a flat base plus per-seat overage. Do not average across models.',
      license: 'CC-BY-4.0',
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: 'WrenchStack (https://wrenchstack.com)',
      homepage: 'https://wrenchstack.com/trends-2026/',
      citation:
        'WrenchStack. Trades Software Pricing Dataset 2026. https://wrenchstack.com/data/trades-software-pricing-2026.json (CC BY 4.0).',
      methodology: 'https://wrenchstack.com/methodology/',
      note: 'Generated at build time from the live directory. Re-download for the current version; per-row verification dates tell you exactly how fresh each price is.',
      row_count: tools.length,
    },
    summary_stats: {
      platforms_tracked: tools.length,
      quote_only_count: quoteOnly,
      quote_only_pct: Math.round((quoteOnly / tools.length) * 100),
      publicly_priced_count: priced.length,
      // 2026-09-09: median_entry_price_usd_month BLENDS pricing models and must
      // not be cited as a per-seat rate. A hand classification of all 69 paid
      // entries found only 16 are genuinely per-user. Cite the split instead.
      median_entry_price_usd_month: medianPrice,
      median_entry_price_is_blended: true,
      per_user_platform_count: perUserTools().length,
      median_per_user_price_usd_month: perUserMedian(),
      flat_fee_platform_count: flatFeeTools().length,
      median_flat_fee_usd_month: flatFeeMedian(),
      min_entry_price_usd_month: prices[0],
      max_entry_price_usd_month: prices[prices.length - 1],
      free_tier_count: freeTier,
      free_tier_pct: Math.round((freeTier / tools.length) * 100),
    },
    platforms: tools.map((t) => ({
      slug: t.slug,
      name: t.name,
      vendor_url: t.vendor_url,
      review_url: `https://wrenchstack.com/tools/${t.slug}/`,
      verticals: t.verticals ?? [],
      quote_only: t.pricing.starting_at_usd === null,
      starting_price_usd_month: t.pricing.starting_at_usd,
      pricing_model: t.pricing.pricing_model ?? 'unclear',
      tier_names: t.pricing.tiers ?? [],
      tier_prices_usd: t.pricing.tier_prices_usd ?? [],
      free_trial_days: t.pricing.free_trial_days ?? null,
      pricing_verified_date: t.pricing.verified_date ?? null,
      best_team_size: t.best_team_size ?? null,
      founded: t.founded ?? null,
      headquartered: t.headquartered ?? null,
      g2_rating: t.g2_rating ?? null,
      capterra_rating: t.capterra_rating ?? null,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
