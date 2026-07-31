export const meta = {
  name: 'wrenchstack-adjacent-categories-verification',
  description: 'Web-verify the 8 adjacent US category files (insurance, lead-gen, payroll, agencies, accounting, banking, financing, payments): URLs, pricing drift, shutdowns/rebrands, and reputation-flag accuracy',
  whenToUse: 'Data-freshness audit for the non-tools categories on wrenchstack.com. These are NOT covered by the monthly tools-verification task, so they rot silently. Pass args: { today: "YYYY-MM-DD", lastVerified: "YYYY-MM-DD" }.',
  phases: [
    { title: 'Extract', detail: 'read the prepared checklist' },
    { title: 'Sweep', detail: 'agents web-verify ~12 entries each against provider sites' },
    { title: 'Verify', detail: 'adversarially confirm every flagged change on a primary source' },
    { title: 'Synthesize', detail: 'compile confirmed edits' },
  ],
}

const TODAY = (args && args.today) || 'UNKNOWN-DATE'
const LAST_VERIFIED = (args && args.lastVerified) || 'the last verification pass'
const LIST_PATH = 'C:/Users/b39cr/Projects/trades_directory/site/_adjacent_checklist.json'

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    entries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cat: { type: 'string' },
          slug: { type: 'string' },
          name: { type: 'string' },
          vendor_url: { type: 'string' },
          price: { type: 'string' },
          reputation_flag: { type: ['string', 'null'] },
        },
        required: ['cat', 'slug', 'name', 'vendor_url'],
      },
    },
  },
  required: ['entries'],
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
          cat: { type: 'string' },
          status: { type: 'string', enum: ['confirmed_current', 'issue_found', 'unverifiable'] },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['dead_or_moved_url', 'price_changed', 'rebrand', 'acquired', 'shutdown', 'pricing_model_changed', 'reputation_flag_stale', 'reputation_flag_needed', 'other'] },
                current_value: { type: 'string' },
                found_value: { type: 'string' },
                suggested_fix: { type: 'string', description: 'exact new value for the data file' },
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
          cat: { type: 'string' },
          issue_type: { type: 'string' },
          confirmed: { type: 'boolean' },
          final_fix: { type: 'string', description: 'exact value for the data file, empty if not confirmed' },
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
  `Read the JSON file ${LIST_PATH}. It is a flat array of directory entries, each with: cat, slug, name, vendor_url, price, reputation_flag, verified_date. Return ALL of them as "entries" with the fields cat, slug, name, vendor_url, price, reputation_flag. Do not truncate or sample. This is a mechanical file read — do not browse the web.`,
  { label: 'extract:checklist', phase: 'Extract', schema: EXTRACT_SCHEMA, effort: 'low' }
)
const all = extracted.entries
log(`Extracted ${all.length} entries across the adjacent categories`)

// ---------- Phase 2: Sweep ----------
phase('Sweep')
const BATCH = 12
const batches = []
for (let i = 0; i < all.length; i += BATCH) batches.push(all.slice(i, i + BATCH))

const sweep = (await parallel(batches.map((batch, i) => () =>
  agent(
    `You are auditing data accuracy for wrenchstack.com, an INDEPENDENT directory for trades/construction businesses (no vendor pays for placement). Today is ${TODAY}. This data was last verified ${LAST_VERIFIED} — about 9 weeks ago, so real drift is expected.

These entries are NOT field-service software. They are business services across categories: insurance (contractor liability carriers), lead_gen (lead-generation platforms), payroll, agencies (marketing agencies), accounting, banking (business banking/fintech), financing (consumer/contractor financing), payments (payment processors).

For EACH entry below, use web search and page fetches to check FOUR things:
1. VENDOR URL — does vendor_url still reach the provider's site (redirects to their canonical domain are fine)? If the domain moved or 404s, find the correct current URL.
2. PRICING — our "price" field is a descriptive STRING (not a number). Does it still match what the provider publishes NOW? Check the provider's OWN pricing page. Report a price_changed issue only for a REAL, material change (a rate, fee, or plan price that is now different), and give the corrected descriptive string as suggested_fix. If the page is bot-blocked or you cannot confirm on a primary source, mark that entry 'unverifiable' — do NOT guess from third-party sites. NOTE: insurance is legitimately quote-only (no flat rates) — absence of a public price there is EXPECTED, not an issue.
3. COMPANY NEWS since ${LAST_VERIFIED} — shutdown, acquisition, rebrand, or pricing-model change (e.g. went quote-only, dropped a free tier, changed fee structure).
4. REPUTATION FLAG ACCURACY — this is the most important check, because our independence is the whole brand.
   - If reputation_flag is NOT null: is the documented concern still accurate and current? If it has been RESOLVED (e.g. an FTC action settled and practices demonstrably changed, a rebrand fixed it), raise a 'reputation_flag_stale' issue with the corrected/removed wording. Do NOT remove a flag merely because the vendor disputes it or time has passed.
   - If reputation_flag IS null: has a NEW documented problem emerged since ${LAST_VERIFIED} — an FTC/CFPB/state-AG action, a lawsuit, a mass-complaint pattern (BBB/Trustpilot/Reddit), deceptive-pricing findings, or an account-freeze pattern? If YES, raise 'reputation_flag_needed' with proposed flag wording and the documented source. Require DOCUMENTED evidence (regulator, court, credible press, or a clear volume pattern) — not isolated angry reviews.

Rules: report ONLY real deviations as issues; an entry that checks out = status 'confirmed_current'. For every issue give an exact suggested_fix value and a primary source_url. Be precise and evidence-driven, never alarmist — a false reputation flag is as damaging as a missing one.

ENTRIES TO CHECK (our current data):
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
const flatIssues = flagged.flatMap((r) => (r.issues || []).map((iss) => ({ slug: r.slug, cat: r.cat, ...iss })))
const vChunks = []
const VCH = 6
for (let i = 0; i < flatIssues.length; i += VCH) vChunks.push(flatIssues.slice(i, i + VCH))

const verdicts = (await parallel(vChunks.map((chunk, i) => () =>
  agent(
    `You are an adversarial fact-checker for an independent directory. Today is ${TODAY}. Another agent claims these data changes. For EACH claim, try to REFUTE it: fetch the provider's OWN site/pricing page (the primary source) and check whether the claimed change is really true RIGHT NOW.

Mark confirmed=true ONLY when a primary source clearly supports the change. If evidence is ambiguous, third-party-only, or the page is unreachable, mark confirmed=false.

EXTRA SCRUTINY on reputation-flag claims, in BOTH directions:
- 'reputation_flag_needed': confirm the documented action/pattern actually exists and names THIS company (regulator/court/credible press). Reject vague or single-review claims. Publishing a false accusation is the worst outcome here.
- 'reputation_flag_stale': confirm the concern is genuinely resolved with evidence. The passage of time, a vendor's own PR, or a marketing page is NOT sufficient to clear a documented flag. Default to KEEPING the flag when in doubt.

For confirmed changes, give the exact final_fix value for our data file.

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
  totalEntries: all.length,
  confirmedCurrent,
  unverifiable,
  rejectedClaims: verdicts.filter((v) => !v.confirmed).map((v) => ({ slug: v.slug, issue: v.issue_type, why: v.reasoning })),
  confirmedChanges,
}
