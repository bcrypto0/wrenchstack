import type { APIRoute } from 'astro';
import { tools, verticals, getTool, verticalToUrl, priceTier, freshnessTier, leadGenPlatforms, leadGenTier, insuranceProviders, insuranceTier, payrollServices, payrollTier, marketingAgencies, agencyTier, aiTools, paymentProcessors } from '../lib/data';
import featuresData from '../data/features.json';
import migrationsData from '../data/migrations.json';

interface FeatureRecord {
  name: string;
  definition?: string;
  description?: string;
}

interface MigrationRecord {
  from: string;
  to: string;
  intent?: string;
}

// Static endpoint — Astro generates /search-index.json at build time.
// Client-side search fetches this once on first focus.
export const GET: APIRoute = () => {
  const items: Array<Record<string, unknown>> = [];

  // Tools (59) — richest entries with all searchable text
  for (const t of tools) {
    items.push({
      type: 'tool',
      name: t.name,
      slug: t.slug,
      url: `/tools/${t.slug}/`,
      tagline: t.tagline,
      bestFor: t.best_for,
      features: t.key_features,
      verticals: t.verticals,
      price: t.pricing.starting_at_usd,
      tier: priceTier(t),
      freshness: freshnessTier(t),
    });
  }

  // Verticals (13)
  for (const v of verticals) {
    items.push({
      type: 'vertical',
      name: `${v.name} software`,
      slug: v.slug,
      url: `/${verticalToUrl(v.slug)}/`,
      tagline: `Best ${v.name.toLowerCase()} software compared`,
    });
  }

  // Lead-gen platforms (13)
  for (const p of leadGenPlatforms) {
    items.push({
      type: 'leadgen',
      name: p.name,
      slug: p.slug,
      url: `/lead-gen/${p.slug}/`,
      tagline: p.tagline,
      bestFor: p.best_for,
      verticals: p.verticals,
      tier: leadGenTier(p),
    });
  }

  // Insurance providers (13)
  for (const p of insuranceProviders) {
    items.push({
      type: 'insurance',
      name: p.name,
      slug: p.slug,
      url: `/insurance/${p.slug}/`,
      tagline: p.tagline,
      bestFor: p.best_for,
      verticals: p.verticals,
      tier: insuranceTier(p),
    });
  }

  // Payroll services (10)
  for (const s of payrollServices) {
    items.push({
      type: 'payroll',
      name: s.name,
      slug: s.slug,
      url: `/payroll/${s.slug}/`,
      tagline: s.tagline,
      bestFor: s.best_for,
      verticals: s.verticals_supported,
      tier: payrollTier(s),
    });
  }

  // Marketing agencies (10)
  for (const a of marketingAgencies) {
    items.push({
      type: 'agency',
      name: a.name,
      slug: a.slug,
      url: `/agencies/${a.slug}/`,
      tagline: a.tagline,
      bestFor: a.best_for,
      verticals: a.verticals_specialty,
      tier: agencyTier(a),
    });
  }

  // AI tools
  for (const t of aiTools) {
    items.push({
      type: 'ai',
      name: t.name,
      slug: t.slug,
      url: `/ai-tools/${t.slug}/`,
      tagline: t.tagline,
      bestFor: t.best_for,
      verticals: t.verticals_supported,
    });
  }

  // Payment processors
  for (const p of paymentProcessors) {
    items.push({
      type: 'payment',
      name: p.name,
      slug: p.slug,
      url: `/payments/${p.slug}/`,
      tagline: p.tagline,
      bestFor: p.best_for,
      verticals: p.verticals_supported,
    });
  }

  // Features (20)
  const features = (featuresData as { features: Record<string, FeatureRecord> }).features;
  for (const [slug, f] of Object.entries(features)) {
    items.push({
      type: 'feature',
      name: f.name,
      slug,
      url: `/features/${slug.replace(/_/g, '-')}/`,
      tagline: (f.description ?? f.definition ?? '').slice(0, 120),
    });
  }

  // Migration guides (15)
  const migrations = (migrationsData as { migrations: MigrationRecord[] }).migrations;
  for (const m of migrations) {
    const fromTool = getTool(m.from);
    const toTool = getTool(m.to);
    if (!fromTool || !toTool) continue;
    items.push({
      type: 'migration',
      name: `${fromTool.name} → ${toTool.name} migration`,
      url: `/migrate/from-${m.from}-to-${m.to}/`,
      tagline: m.intent ?? `Switch from ${fromTool.name} to ${toTool.name}`,
    });
  }

  // Utility / interactive pages
  const utilityPages = [
    { name: 'Get Matched Quiz', url: '/quiz/', tagline: 'Find your perfect tool in 60 seconds based on trade and team size' },
    { name: 'ROI Calculator', url: '/roi-calculator/', tagline: 'Calculate your annual savings and payback period from new field service software' },
    { name: 'Cost-of-Switch Calculator', url: '/cost-of-switch/', tagline: 'Calculate the real 12-month cost of switching between trades software platforms' },
    { name: 'Glossary', url: '/glossary/', tagline: 'Plain-English definitions for FSM, CMMS, AIA billing, dispatching, and other trades software jargon' },
    { name: 'Trades Software Market Report 2026', url: '/trends-2026/', tagline: '15 data findings from analysis of 59 platforms — pricing distribution, integration prevalence, founded-year cohorts, vertical density' },
    { name: 'Methodology', url: '/methodology/', tagline: 'How WrenchStack scores and ranks tools — formula, sources, and affiliate disclosure' },
    { name: 'All Tools', url: '/tools/', tagline: `Browse all ${tools.length} trades software tools` },
    { name: 'Compare Tools', url: '/compare/', tagline: 'Head-to-head pairings of every shared-vertical tool combination' },
    { name: 'Build Custom Comparison', url: '/compare-builder/', tagline: 'Interactive builder — pick any 2-5 tools and see them compared instantly' },
    { name: 'Pricing Comparison', url: '/pricing/', tagline: 'Pricing tables and per-tool tier breakdowns by trade' },
    { name: 'Buyer Guides', url: '/best-software-for/', tagline: 'Best software for specific trade + team size combinations' },
    { name: 'Migration Guides', url: '/migrate/', tagline: 'Practical guides for switching between tools' },
    { name: 'Multi-tool Comparisons', url: '/multi-compare/', tagline: 'Three-way tool comparisons for specific buyer segments' },
    { name: 'Features', url: '/features/', tagline: 'Browse tools by specific feature (QuickBooks, GPS tracking, etc.)' },
    { name: 'About WrenchStack', url: '/about/', tagline: 'Who we are and why this directory exists' },
    { name: 'Contact', url: '/contact/', tagline: 'Get in touch — vendor corrections, partnership inquiries' },
  ];

  for (const p of utilityPages) {
    items.push({ type: 'page', ...p });
  }

  return new Response(JSON.stringify({ items }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
