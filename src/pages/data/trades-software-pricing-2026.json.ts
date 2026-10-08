import type { APIRoute } from 'astro';
import { tools, medianUsd, perUserMedian, flatFeeMedian, perUserTools, flatFeeTools, hasTierDetails, hasQuoteBasis, TIER_DETAIL_KEYS } from '../../lib/data';
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
  // other terms (by module, per project); those are counted apart.
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
        'Entry pricing, tier structure, verticals served, and verification dates for software platforms listed in the WrenchStack directory for US trades and construction businesses; some vendors are headquartered outside the US, and rows with an empty verticals list are maintenance-management (CMMS) tools that name no contractor trade. Every price comes from the vendor\'s own website, checked on the pricing_verified_date recorded per platform; where a vendor prices only in another currency, the USD figures are approximate conversions. Third-party price estimates are not in any price field here and are not used in any summary figure. quote_only is true when pricing_model is quote_only: the vendor publishes no entry price and sells by custom quote. starting_price_usd_month is null for those rows and for rows with pricing_model unclear, which price their core product on other terms, such as by module or per project. pricing_model says what starting_price_usd_month measures: per_user is a per-seat monthly rate (a seat is a user, driver, route or application, as each vendor defines it), annual_per_user is an annual per-seat price shown as a monthly equivalent, flat is a fixed monthly platform fee (which may include seats), flat_plus_seat is a flat base plus per-seat overage, and free_tier is a free entry plan. Count free entry plans with starting_price_usd_month = 0, not with pricing_model, which can describe a row\'s paid plans. starting_price_usd_month is a monthly equivalent, and its billing term (annual or month-to-month) varies by row. Do not average across models. tier_prices_usd follows the order of tier_names and shows each tier price as the vendor lists it, so its billing period can differ from starting_price_usd_month (per year for annual_per_user rows); null means no price is recorded for that tier. The g2_rating and capterra_rating fields were removed on 2026-09-30 because those third-party review scores could not be verified; read current reviews on G2 and Capterra directly. tier_details (added 2026-10-08) is null unless the row\'s plans were read for billing facts and are published; then it lists each plan as read on depth_read_date from depth_source_url: price_annual_billed is the price a month when billed annually and price_monthly_billed the price a month when paid monthly (some vendors require a 12-month contract for it; a limited-time promotional price is not recorded), in USD, null when the page shows no such price, shows only a starting price for the plan (such as \'starting at $89 per user per month\', kept in the pricing note), or shows a price without saying whether it is billed monthly or annually (unclear is then billing_term); price_basis says what the price is charged for (per_account, per_user or per_technician), or is not_published when the price cannot be priced per user or per account from the page: the page does not say what it is charged for, it is an account price with no stated user rule, or it is charged per route, location or application, or as an add-on; included_users is the number of users an account price includes, or the minimum number of users a per-user price is charged for (null when none is stated); extra_user_price is the fee for each user above included_users on an account price, for the user named in extra_user_unit, a month unless unclear is extra_user_period (the page gives no period); max_users is the most users the plan allows (null when the page states no cap); usage_limit is a job, appointment, project or other usage cap the page states for the plan (null when none is recorded, which does not mean the plan has none); field_user_rule is the page\'s rule when it prices or limits users by role, such as office users and crew members (null when none is recorded); unclear names what the page leaves unclear for that plan: billing_term, extra_user_period, or user_count (the page gives the plan\'s user count two ways, as a count that does not read as one number, or not at all for a priced plan that could be the cheapest, such as a free plan with no stated user limit; included_users then holds the lower count, or null when none is stated). quote_basis, for quote-only rows, is what the vendor says its quote depends on, as read on quote_basis_read_date from quote_basis_source_url (null when not recorded).',
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
      // 2026-10-08: rows carrying per-plan billing facts, and quote-only rows
      // carrying what the quote depends on.
      tier_details_count: tools.filter(hasTierDetails).length,
      quote_basis_count: tools.filter(hasQuoteBasis).length,
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
      // 2026-10-08: only the documented keys, in a fixed order, null for a missing one.
      tier_details: hasTierDetails(t)
        ? t.pricing.tier_details!.map((d) => Object.fromEntries(TIER_DETAIL_KEYS.map((k) => [k, d[k] ?? null])))
        : null,
      depth_source_url: hasTierDetails(t) ? (t.pricing.depth_source_url ?? null) : null,
      depth_read_date: hasTierDetails(t) ? (t.pricing.depth_read_date ?? null) : null,
      quote_basis: hasQuoteBasis(t) ? t.pricing.quote_basis : null,
      quote_basis_source_url: hasQuoteBasis(t) ? (t.pricing.quote_basis_source_url ?? null) : null,
      quote_basis_read_date: hasQuoteBasis(t) ? (t.pricing.quote_basis_read_date ?? null) : null,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
