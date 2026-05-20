import toolsData from '../data/tools.json';
import categoriesData from '../data/categories.json';

export interface ToolPricing {
  starting_at_usd: number | null;
  tiers: string[];
  tier_prices_usd: (number | null)[] | null;
  pricing_note?: string;
  verified_date: string;
  free_trial_days?: number;
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
}

export interface Vertical {
  slug: string;
  name: string;
  search_volume_estimate: string;
  buyer_intent: string;
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
