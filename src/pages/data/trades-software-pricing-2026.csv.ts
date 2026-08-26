import type { APIRoute } from 'astro';
import { tools } from '../../lib/data';

// Static endpoint: Astro generates /data/trades-software-pricing-2026.csv at
// build time from tools.json, so the published dataset can never drift from
// the live directory. This is the open-data companion to /trends-2026/.
// License: CC BY 4.0 (attribution: WrenchStack, wrenchstack.com).

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
    'g2_rating',
    'capterra_rating',
  ];

  const rows = tools.map((t) => {
    const p = t.pricing;
    const quoteOnly = p.starting_at_usd === null;
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
      t.g2_rating,
      t.capterra_rating,
    ]
      .map(csvField)
      .join(',');
  });

  const preamble = [
    '# WrenchStack Trades Software Pricing Dataset 2026',
    '# License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
    '# Attribution: WrenchStack, https://wrenchstack.com/trends-2026/',
    '# Every price was checked by a human against the vendor pricing page on the pricing_verified_date shown per row.',
    '# quote_only=true means the vendor publishes no price at all (contact-sales only).',
    `# Rows: ${tools.length}. Generated at build time from the live directory; re-download for the current version.`,
  ].join('\n');

  const body = preamble + '\n' + header.join(',') + '\n' + rows.join('\n') + '\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="wrenchstack-trades-software-pricing-2026.csv"',
    },
  });
};
