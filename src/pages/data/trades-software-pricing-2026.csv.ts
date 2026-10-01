import type { APIRoute } from 'astro';
import { tools } from '../../lib/data';

// Static endpoint: Astro generates /data/trades-software-pricing-2026.csv at
// build time from tools.json, so the published dataset can never drift from
// the live directory. This is the open-data companion to /trends-2026/.
// License: CC BY 4.0 (attribution: WrenchStack, wrenchstack.com).
// 2026-10-01: the file is plain CSV, header on line 1. The eight '#' comment
// lines that used to open it broke standard parsers (pandas, the Hugging Face
// viewer): line 1 was read as a one-column header. The license, attribution
// and field notes now live in the JSON's `dataset` block and the dataset card
// (docs/hf-dataset-card.md).

function csvField(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export const GET: APIRoute = () => {
  const header = [
    'slug',
    'name',
    'vendor_url',
    'verticals',
    'quote_only',
    'starting_price_usd_month',
    'tier_names',
    'tier_prices_usd',
    'free_trial_days',
    'pricing_verified_date',
    'best_team_size',
    'founded',
    'headquartered',
    // 2026-09-26: appended last so existing column positions do not move. Without it,
    // per-user and flat-fee entry prices cannot be told apart.
    // 2026-09-30: the g2_rating and capterra_rating columns before it were removed
    // (third-party review scores could not be verified), so it moved up two places.
    'pricing_model',
  ];

  const rows = tools.map((t) => {
    const p = t.pricing;
    // 2026-10-01: quote_only follows pricing_model (the vendor publishes no entry
    // price). A null starting price alone also covers the 'unclear' rows, which
    // publish one-time or per-project prices.
    const quoteOnly = p.pricing_model === 'quote_only';
    return [
      t.slug,
      t.name,
      t.vendor_url,
      (t.verticals ?? []).join('|'),
      quoteOnly ? 'true' : 'false',
      p.starting_at_usd,
      (p.tiers ?? []).join('|'),
      (p.tier_prices_usd ?? []).join('|'),
      p.free_trial_days,
      p.verified_date,
      t.best_team_size,
      t.founded,
      t.headquartered,
      p.pricing_model ?? 'unclear',
    ]
      .map(csvField)
      .join(',');
  });

  const body = header.join(',') + '\n' + rows.join('\n') + '\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="wrenchstack-trades-software-pricing-2026.csv"',
    },
  });
};
