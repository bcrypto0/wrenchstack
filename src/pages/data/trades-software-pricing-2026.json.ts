import type { APIRoute } from 'astro';
import { tools, medianUsd, perUserMedian, flatFeeMedian, perUserTools, flatFeeTools } from '../../lib/data';
import type { Tool } from '../../lib/data';

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
  // 2026-10-01: quote_only follows pricing_model === 'quote_only' (the vendor
  // publishes no entry price). Until then it meant "starting price is null",
  // which also counted the 'unclear' rows that price their core product on
  // other terms (a one-time license, per project); those are counted apart.
  const quoteOnly = tools.filter((t) => t.pricing.pricing_model === 'quote_only').length;
  const noMonthlyPrice = tools.filter((t) => t.pricing.starting_at_usd === null).length;
  const unclearModel = tools.filter((t) => t.pricing.pricing_model === 'unclear').length;
  const freeTier = tools.filter((t) => t.pricing.starting_at_usd === 0).length;
  // Each count below is the set its median is taken over (paid rows only), so a
  // free entry plan on a flat-priced row does not inflate the flat-fee count.
  const isPaid = (t: Tool) => (t.pricing.starting_at_usd ?? 0) > 0;
  const perUserPaid = perUserTools().filter(isPaid).length;
  const flatFeePaid = flatFeeTools().filter(isPaid).length;
  const annualPerUserPaid = tools.filter(
    (t) => t.pricing.pricing_model === 'annual_per_user' && isPaid(t)
  ).length;

  const payload = {
    dataset: {
      name: 'WrenchStack Trades Software Pricing Dataset 2026',
      description:
        'Entry pricing, tier structure, verticals served, and verification dates for software platforms listed in the WrenchStack directory for US trades and construction businesses; some vendors are headquartered outside the US, and rows with an empty verticals list are maintenance-management (CMMS) tools that name no contractor trade. Every price comes from the vendor\'s own website, checked on the pricing_verified_date recorded per platform; where a vendor prices only in another currency, the USD figures are approximate conversions. Third-party price estimates are not in any price field here and are not used in any summary figure. quote_only is true when pricing_model is quote_only: the vendor publishes no entry price and sells by custom quote. starting_price_usd_month is null for those rows and for rows with pricing_model unclear, which price their core product on other terms, such as a one-time license or per project. pricing_model says what starting_price_usd_month measures: per_user is a per-seat monthly rate (a seat is a user, driver, route or application, as each vendor defines it), annual_per_user is an annual per-seat price shown as a monthly equivalent, flat is a fixed monthly platform fee (which may include seats), flat_plus_seat is a flat base plus per-seat overage, and free_tier is a free entry plan. Count free entry plans with starting_price_usd_month = 0, not with pricing_model, which can describe a row\'s paid plans. starting_price_usd_month is a monthly equivalent, and its billing term (annual or month-to-month) varies by row. Do not average across models. tier_prices_usd follows the order of tier_names and shows each tier price as the vendor lists it, so its billing period can differ from starting_price_usd_month (per year for annual_per_user rows); null means no price is recorded for that tier. The g2_rating and capterra_rating fields were removed on 2026-09-30 because those third-party review scores could not be verified; read current reviews on G2 and Capterra directly.',
      license: 'CC-BY-4.0',
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: 'WrenchStack (https://wrenchstack.com)',
      homepage: 'https://wrenchstack.com/trends-2026/',
      citation:
        'WrenchStack. Trades Software Pricing Dataset 2026. https://wrenchstack.com/trends-2026/ (CC BY 4.0).',
      methodology: 'https://wrenchstack.com/methodology/',
      note: 'Generated at build time from the live directory. Re-download for the current version; per-row verification dates tell you exactly how fresh each price is.',
      row_count: tools.length,
    },
    summary_stats: {
      platforms_tracked: tools.length,
      quote_only_count: quoteOnly,
      quote_only_pct: Math.round((quoteOnly / tools.length) * 100),
      no_monthly_entry_price_count: noMonthlyPrice,
      no_monthly_entry_price_pct: Math.round((noMonthlyPrice / tools.length) * 100),
      pricing_model_unclear_count: unclearModel,
      // Rows with a paid entry price (above 0); free entry plans are in free_tier_count.
      publicly_priced_count: priced.length,
      // 2026-09-09: median_entry_price_usd_month BLENDS pricing models and must
      // not be cited as a per-seat rate (that day, 16 of 69 paid entries were
      // per-user; the current split is in per_user_platform_count). Cite the split instead.
      median_entry_price_usd_month: medianPrice,
      median_entry_price_is_blended: true,
      per_user_platform_count: perUserPaid,
      median_per_user_price_usd_month: perUserMedian(),
      flat_fee_platform_count: flatFeePaid,
      median_flat_fee_usd_month: flatFeeMedian(),
      annual_per_user_platform_count: annualPerUserPaid,
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
      quote_only: t.pricing.pricing_model === 'quote_only',
      starting_price_usd_month: t.pricing.starting_at_usd,
      pricing_model: t.pricing.pricing_model ?? 'unclear',
      tier_names: t.pricing.tiers ?? [],
      tier_prices_usd: t.pricing.tier_prices_usd ?? [],
      free_trial_days: t.pricing.free_trial_days ?? null,
      pricing_verified_date: t.pricing.verified_date ?? null,
      best_team_size: t.best_team_size ?? null,
      founded: t.founded ?? null,
      headquartered: t.headquartered ?? null,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
