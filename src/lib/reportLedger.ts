// Report ledger: pricing benchmark report sales (added with the report offer).
// "When ordered" figures are frozen in report_ledger.json on the day the invoice
// is sent; "Today" is computed at build time from the site data, like the
// affiliate ledger. as_of is set by hand whenever the ledger is checked or
// changed, so the empty state only asserts a date someone checked.
import ledger from '../data/report_ledger.json';
import {
  tools,
  verticals,
  rankToolsForVertical,
  wrenchStackScore,
  awardsForTool,
  reputationFlagGroups,
  type Tool,
} from './data';

export type ReportStatus =
  | 'Awaiting delivery'
  | 'Delivered'
  | 'Refunded before delivery'
  | 'Refunded after delivery';

const STATUSES: ReportStatus[] = ['Awaiting delivery', 'Delivered', 'Refunded before delivery', 'Refunded after delivery'];

interface LedgerRow {
  slug: string;
  company: string;
  trade: string;
  paid_month: string; // YYYY-MM
  price_usd: number;
  score_at_order: number | null;
  rank_at_order: number | null;
  rank_total_at_order: number | null;
  award_at_order: string;
  flag_at_order: string;
  flag_entries?: string[];
  status: ReportStatus;
  note: string;
}

export interface ReportRow extends LedgerRow {
  tool?: Tool;
  tradeName: string;
  paidLabel: string;
  atOrder: string;
  today: string;
  noteText: string;
}

// A malformed date would otherwise publish "Invalid Date" in the ledger, so the
// build stops instead. The round trip also rejects dates like 2026-02-30.
function utcDate(iso: string, what: string): Date {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) {
    throw new Error(`report_ledger.json: ${what} "${iso}" is not a valid date`);
  }
  return d;
}

export const reportAsOf = utcDate(ledger.as_of, 'as_of').toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function awardLabel(slug: string): string {
  const a = awardsForTool(slug);
  if (a.length === 0) return 'no award';
  return a
    .map((x) => (x.kind === 'winner' ? x.category.label : `${x.category.label}, honorable mention`))
    .join('; ');
}

function flagLabel(urls: string[] = []): string {
  if (urls.length === 0) return 'no flag';
  const flagged = reputationFlagGroups()
    .flatMap((g) => g.entries)
    .filter((e) => urls.includes(e.url));
  return flagged.length === 0 ? 'no flag' : flagged.map((e) => `flag on ${e.name}`).join('; ');
}

export const reportRows: ReportRow[] = (ledger.rows as LedgerRow[]).map((r) => {
  const vertical = verticals.find((v) => v.slug === r.trade);
  if (!vertical) throw new Error(`report_ledger.json: unknown trade "${r.trade}"`);
  if (!STATUSES.includes(r.status)) throw new Error(`report_ledger.json: unknown status "${r.status}" on ${r.slug}`);
  const tool = tools.find((t) => t.slug === r.slug);
  const ranked = rankToolsForVertical(r.trade);
  const idx = tool ? ranked.findIndex((t) => t.slug === r.slug) : -1;
  const atOrder =
    r.score_at_order == null
      ? 'Not listed'
      : `${r.score_at_order.toFixed(1)}, ${r.rank_at_order} of ${r.rank_total_at_order}; ${r.award_at_order}; ${r.flag_at_order}`;
  const today =
    idx >= 0 && tool
      ? `${wrenchStackScore(tool, r.trade).toFixed(1)}, ${idx + 1} of ${ranked.length}; ${awardLabel(tool.slug)}; ${flagLabel(r.flag_entries)}`
      : 'Not listed';
  const noteText = r.note.trim() !== '' ? r.note : atOrder === today ? '' : 'Difference noted; cause not yet recorded.';
  return {
    ...r,
    tool,
    tradeName: vertical.name,
    paidLabel: utcDate(`${r.paid_month}-01`, `paid_month on ${r.slug}`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    atOrder,
    today,
    noteText,
  };
});

export function reportRowsForTool(slug: string): ReportRow[] {
  return reportRows.filter((r) => r.slug === slug);
}

/** Companies listed on a trade page that have ordered a report (any trade, any status). */
export function reportBuyerCount(ranked: Tool[]): number {
  const onPage = new Set(ranked.map((t) => t.slug));
  return new Set(reportRows.filter((r) => onPage.has(r.slug)).map((r) => r.company)).size;
}
