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
