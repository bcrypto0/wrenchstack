export const meta = {
  name: 'wrenchstack-tools-verification',
  description: 'Web-verify every tool in tools.json: URL validity, entry-price drift, shutdowns/acquisitions/rebrands',
  whenToUse: 'Monthly data-freshness audit for wrenchstack.com — run via the scheduled task, or on demand after a long gap between verifications. Pass args: { today: "YYYY-MM-DD", lastVerified: "YYYY-MM-DD" }.',
  phases: [
    { title: 'Extract', detail: 'read tools.json into a compact checklist' },
    { title: 'Sweep', detail: 'agents web-verify ~12 tools each against vendor sites' },
    { title: 'Verify', detail: 'adversarially confirm every flagged change on the vendor own page' },
    { title: 'Synthesize', detail: 'compile confirmed edits list' },
  ],
}

// Dates come in via args because workflow scripts cannot call Date.now().
const TODAY = (args && args.today) || 'UNKNOWN-DATE'
const LAST_VERIFIED = (args && args.lastVerified) || 'the last verification pass'
const TOOLS_PATH = 'C:/Users/b39cr/Projects/trades_directory/site/src/data/tools.json'

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    tools: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          name: { type: 'string' },
          vendor_url: { type: 'string' },
          starting_at_usd: { type: ['number', 'null'] },
          pricing_note: { type: 'string' },
        },
        required: ['slug', 'name', 'vendor_url'],
      },
    },
  },
  required: ['tools'],
}

const SWEEP_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          status: { type: 'string', enum: ['confirmed_current', 'issue_found', 'unverifiable'] },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['dead_or_moved_url', 'price_changed', 'rebrand', 'acquired', 'shutdown', 'pricing_model_changed', 'other'] },
                current_value: { type: 'string' },
                found_value: { type: 'string' },
                suggested_fix: { type: 'string', description: 'exact new value for tools.json' },
                source_url: { type: 'string' },
                confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              },
              required: ['type', 'current_value', 'found_value', 'suggested_fix', 'source_url', 'confidence'],
            },
          },
          note: { type: 'string' },
        },
        required: ['slug', 'status'],
      },
    },
  },
  required: ['results'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          issue_type: { type: 'string' },
          confirmed: { type: 'boolean' },
          final_fix: { type: 'string', description: 'exact value for tools.json, empty if not confirmed' },
          evidence_url: { type: 'string' },
          reasoning: { type: 'string' },
        },
        required: ['slug', 'issue_type', 'confirmed', 'final_fix', 'reasoning'],
      },
    },
  },
  required: ['verdicts'],
}

// ---------- Phase 1: Extract ----------
phase('Extract')
const extracted = await agent(
  `Read the file ${TOOLS_PATH} (a JSON file with a "tools" array of field-service software tools). For EVERY tool, return: slug, name, vendor_url, pricing.starting_at_usd (as starting_at_usd), and pricing.pricing_note (as pricing_note, empty string if absent). Return ALL tools — do not truncate or sample. This is a mechanical extraction; do not browse the web.`,
  { label: 'extract:tools.json', phase: 'Extract', schema: EXTRACT_SCHEMA, effort: 'low' }
)
const all = extracted.tools
log(`Extracted ${all.length} tools from tools.json`)

// ---------- Phase 2: Sweep ----------
phase('Sweep')
const BATCH = 12
const batches = []
for (let i = 0; i < all.length; i += BATCH) batches.push(all.slice(i, i + BATCH))

const sweep = (await parallel(batches.map((batch, i) => () =>
  agent(
    `You are auditing the data accuracy of wrenchstack.com, a directory of field-service/trades software. Today is ${TODAY}. Our data was last verified around ${LAST_VERIFIED}.

For EACH tool below, use web search and page fetches to check THREE things:
1. VENDOR URL — does our vendor_url still reach the vendor's site (allowing redirects to their canonical domain)? If the domain moved or 404s, find the correct current URL.
2. ENTRY PRICE — does our starting_at_usd still match the vendor's CURRENT cheapest published monthly plan (annual-billing price if that's what they headline)? Check the vendor's OWN pricing page when possible. Small differences matter. If the pricing page is bot-blocked or you cannot confirm on a primary source, mark the tool 'unverifiable' — do NOT guess from third-party sites alone.
3. COMPANY NEWS since ${LAST_VERIFIED} — shutdown, acquisition, rebrand, or pricing-model change (e.g. went quote-only, dropped free tier).

Rules: report ONLY real deviations as issues; a tool that checks out = status 'confirmed_current'. For every issue give the exact suggested_fix value and a primary source_url. Be precise, not alarmist.

TOOLS TO CHECK (our current data):
${JSON.stringify(batch)}`,
    { label: `sweep:${i + 1}/${batches.length}`, phase: 'Sweep', schema: SWEEP_SCHEMA }
  )
))).filter(Boolean).flatMap((r) => r.results || [])

const flagged = sweep.filter((r) => r.status === 'issue_found' && (r.issues || []).length)
const confirmedCurrent = sweep.filter((r) => r.status === 'confirmed_current').map((r) => r.slug)
const unverifiable = sweep.filter((r) => r.status === 'unverifiable').map((r) => r.slug)
log(`Sweep done: ${confirmedCurrent.length} confirmed current, ${flagged.length} flagged, ${unverifiable.length} unverifiable`)

// ---------- Phase 3: Verify (adversarial) ----------
phase('Verify')
const flatIssues = flagged.flatMap((r) => (r.issues || []).map((iss) => ({ slug: r.slug, ...iss })))
const vChunks = []
const VCH = 6
for (let i = 0; i < flatIssues.length; i += VCH) vChunks.push(flatIssues.slice(i, i + VCH))

const verdicts = (await parallel(vChunks.map((chunk, i) => () =>
  agent(
    `You are an adversarial fact-checker. Today is ${TODAY}. Another agent claims these data changes for tools listed on wrenchstack.com. For EACH claim, try to REFUTE it: fetch the vendor's OWN site/pricing page (the primary source) and check whether the claimed change is really true RIGHT NOW. Mark confirmed=true ONLY when the primary source clearly supports the change. If the evidence is ambiguous, third-party-only, or the page is unreachable, mark confirmed=false. For confirmed changes, give the exact final_fix value for our data file.

CLAIMS TO CHECK:
${JSON.stringify(chunk)}`,
    { label: `verify:${i + 1}/${vChunks.length}`, phase: 'Verify', schema: VERDICT_SCHEMA }
  )
))).filter(Boolean).flatMap((v) => v.verdicts || [])

const confirmedChanges = verdicts.filter((v) => v.confirmed)
log(`Verify done: ${confirmedChanges.length} of ${verdicts.length} claimed changes survived adversarial checking`)

// ---------- Phase 4: Synthesize ----------
phase('Synthesize')
return {
  totalTools: all.length,
  confirmedCurrent,
  unverifiable,
  rejectedClaims: verdicts.filter((v) => !v.confirmed).map((v) => ({ slug: v.slug, issue: v.issue_type, why: v.reasoning })),
  confirmedChanges,
}
