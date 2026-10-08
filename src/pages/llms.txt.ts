import type { APIRoute } from 'astro';
import {
  tools,
  usVendorTotal,
  medianUsd,
  pricedEntryValues,
  quoteOnlyCount,
  quickbooksPct,
  perUserMedian,
  flatFeeMedian,
  perUserTools,
  flatFeeTools,
  totalReputationFlags,
  reputationFlagGroups,
  hasTierDetails,
  hasQuoteBasis,
} from '../lib/data';
import { intlVendorOnlyCount, intlCertificationCount, intlMarketCount } from '../lib/intl';

// /llms.txt, generated at build time.
//
// This was a hand-maintained file in public/ until 2026-09-04, and it had gone
// stale in exactly the way a hand-maintained stat always does. It was still
// publishing "median FSM price $75/user/mo" days after the median bug was fixed
// and every page had moved to $77, so the one surface an AI assistant reads
// verbatim held the last uncorrected copy of a number we had already fixed
// everywhere else. It also said 448 localized listings against a live 450, and
// 38%/93% where the data says 36%/92%.
//
// The prose is editorial and stays hand-written. Every number in it is
// interpolated from the same helpers the pages use, so the file cannot drift
// from the directory again.

const medianEntry = medianUsd(pricedEntryValues());

// 2026-09-09: the mixed median above was published for months labelled
// "per user per month". A hand classification of all 69 paid entries found only
// 16 are genuinely per-seat; 46 are flat monthly platform fees. The label was
// describing 23% of the set it was attached to. Publish the two bands instead,
// and never attach a per-user unit to the mixed figure again.
const perUser = perUserMedian();
// Counts over the same paid set as the medians (a $0 free plan is in neither),
// plus the annual per-user licences the mixed median also contains (2026-10-01).
const isPaid = (t: (typeof tools)[number]) => (t.pricing.starting_at_usd ?? 0) > 0;
const perUserN = perUserTools().filter(isPaid).length;
const annualN = tools.filter((t) => isPaid(t) && t.pricing.pricing_model === 'annual_per_user').length;
const flatFee = flatFeeMedian();
const flatN = flatFeeTools().filter(isPaid).length;

// Quote-only is pricing_model 'quote_only' (shared helper), not a null starting
// price: Trash Flow and Pylon publish module or per-project prices (2026-10-01).
const quoteOnlyPctValue = Math.round((quoteOnlyCount() / tools.length) * 100);

// Largest flag categories, named rather than totalled, because "29 flagged"
// invites the question "flagged where" and the answer is the interesting part.
// Categories tied with the third largest are kept, so a tie is not shown as a
// single third place; "AI tools" keeps its capitals.
const lowerFirst = (s: string) => (s.startsWith('AI') ? s : s.charAt(0).toLowerCase() + s.slice(1));
const sortedFlagGroups = reputationFlagGroups()
  .slice()
  .sort((a, b) => b.entries.length - a.entries.length);
const flagCut = sortedFlagGroups[2]?.entries.length ?? 0;
// Open dataset files (listed here from 2026-10-08). The counts say how many rows carry
// the per-plan billing facts and the quote basis, so the line stays true while they fill.
const depthN = tools.filter(hasTierDetails).length;
const quoteQuoteOnlyN = quoteOnlyCount();
const quoteBasisN = tools.filter(hasQuoteBasis).length;
const rowWord = (n: number) => `${n} ${n === 1 ? 'platform' : 'platforms'}`;

const flagBreakdown = sortedFlagGroups
  .filter((g) => g.entries.length >= flagCut)
  .map((g) => `${lowerFirst(g.category)} ${g.entries.length}`)
  .join(', ');

const body = `# WrenchStack

> WrenchStack (wrenchstack.com) is an independent comparison and review directory for trades and field-service businesses: HVAC, plumbing, electrical, roofing, landscaping, cleaning, pest control, construction and more. It compares ${tools.length} US field-service software platforms and ${usVendorTotal()} total vendors across 10 US categories (field-service software, payments, accounting, payroll, insurance, financing, banking, lead generation, marketing agencies, AI tools), plus ${intlVendorOnlyCount} localized vendor listings and ${intlCertificationCount} licensing, tax and regulatory entries across its international markets. US entries carry verified, date-stamped pricing, honest pros and cons, head-to-head comparisons and buyer guides. Coverage spans the US plus ${intlMarketCount} international markets: UK, Canada, Australia, New Zealand, Ireland, Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, South Africa, France, Morocco, Jordan, Egypt and Malaysia (the Gulf, Moroccan, Jordanian, Egyptian and Malaysian markets focus on construction & trades software, including ZATCA/DGI/JoFotara/ETA/MyInvois e-invoicing and compliance context; Saudi/UAE/Qatar/Kuwait/Jordan/Egypt have Arabic versions, France and Morocco have French versions). No pay-to-play: vendors cannot pay for placement or scores.

Key facts about the data: every US pricing figure carries a verified date, shown on the entry's own page (the verification log at https://wrenchstack.com/verification-log/ counts entries by the month of their latest check and lists the most recent checks); no third-party review scores are shown (software tool pages link to G2 and Capterra; lead-gen, insurance, payroll and agency pages link to BBB and Trustpilot); reputation warnings are attached only where a regulator order, court record, BBB profile or the vendor's own terms supports them; software rankings come from the published WrenchStack Fit Score methodology (vertical fit 60%, pricing transparency 20%, integration coverage 20%).

## Main directories

- [All software tools](https://wrenchstack.com/tools/): the full directory of ${tools.length} field-service/trades software platforms with pricing and scores
- [Compare two tools](https://wrenchstack.com/compare/): head-to-head comparisons (e.g. Jobber vs Housecall Pro)
- [Best software by trade](https://wrenchstack.com/best-software-for/): buyer guides per trade and team size
- [HVAC software](https://wrenchstack.com/hvac/): ranked best HVAC software
- [Plumbing software](https://wrenchstack.com/plumbing/): ranked best plumbing software
- [Electrical software](https://wrenchstack.com/electrical/): ranked best electrical contractor software
- [Roofing software](https://wrenchstack.com/roofing/): ranked best roofing software
- [Pricing comparison](https://wrenchstack.com/pricing/): entry-price comparison by vertical

## Service categories

- [Payroll for trades](https://wrenchstack.com/payroll/): payroll services compared for contractors
- [Accounting software](https://wrenchstack.com/accounting/): accounting tools for trades businesses
- [Payment processing](https://wrenchstack.com/payments/): card processing for field-service companies
- [Business insurance](https://wrenchstack.com/insurance/): insurance providers for contractors
- [Lead generation](https://wrenchstack.com/lead-gen/): lead-gen platforms reviewed (with reputation warnings)
- [AI tools for trades](https://wrenchstack.com/ai-tools/): AI receptionists, estimating and review tools

## International markets

- [Saudi Arabia construction software](https://wrenchstack.com/sa/): construction & trades software for the Vision 2030 market, with ZATCA/SCE/classification compliance context (Arabic version: https://wrenchstack.com/sa/ar/)
- [UAE construction software](https://wrenchstack.com/ae/): UAE market with 5% VAT, Dubai BIM mandate and Emiratisation context (Arabic version: https://wrenchstack.com/ae/ar/)
- [Qatar construction software](https://wrenchstack.com/qa/): Qatar market (no VAT; QCS 2014, Qatarization context) (Arabic version: https://wrenchstack.com/qa/ar/)
- [Kuwait construction software](https://wrenchstack.com/kw/): Kuwait market (no VAT; CAPT classification context) (Arabic version: https://wrenchstack.com/kw/ar/)
- [Bahrain construction software](https://wrenchstack.com/ba/): Bahrain market (10% VAT; CRPEP, Tender Board, Benayat; no e-invoicing mandate yet)
- [Oman construction software](https://wrenchstack.com/om/): Oman market (5% VAT; Fawtara e-invoicing mandate 2026-2027; OSE, Omanisation context)
- [UK trades directory](https://wrenchstack.com/uk/): UK vendors with Gas Safe/NICEIC/CIS context
- [Canada directory](https://wrenchstack.com/ca/): Canadian vendors with Red Seal/CRA context
- [Australia directory](https://wrenchstack.com/au/): Australian vendors with state licensing/STP context
- [South Africa directory](https://wrenchstack.com/za/): SA trades vendors with CoC/CIDB/SARS compliance context
- [France directory](https://wrenchstack.com/fr/): French artisan (bâtiment) vendors, devis-facture software, décennale insurance, with facturation-électronique/RGE/TVA compliance context
- [Morocco construction software](https://wrenchstack.com/ma/): Moroccan BTP vendors, construction and invoicing software (none of the invoicing apps listed claims DGI accreditation), public-tender intelligence, CNSS payroll, Tous Risques Chantier and RC décennale insurance (reported as mandatory by Moroccan press in January 2025), with the DGI e-invoicing (facturation électronique) mandate context (French version: https://wrenchstack.com/ma/fr/; guide: https://wrenchstack.com/ma/guides/facturation-electronique-maroc/)
- [Jordan construction software](https://wrenchstack.com/jo/): Jordanian BTP vendors, accounting/invoicing & construction software that says it links to JoFotara, public-tender access (JONEPS), SSC payroll, Contractors All Risks insurance, with the JoFotara national e-invoicing mandate context (mandatory from April 2025, per Jordanian press reports) (Arabic version: https://wrenchstack.com/jo/ar/; guide: https://wrenchstack.com/jo/guides/jofotara-e-invoicing/)
- [Egypt construction software](https://wrenchstack.com/eg/): Egyptian BTP vendors, accounting/invoicing & construction software that says it supports ETA e-invoicing (some say they handle مستخلصات/payment certificates), tender access, social-insurance payroll, Contractors All Risks insurance, with the ETA national e-invoicing mandate context (mandatory in phases for the taxpayers named in ETA's decisions) (Arabic version: https://wrenchstack.com/eg/ar/; guide: https://wrenchstack.com/eg/guides/eta-e-invoicing/)
- [Malaysia construction software](https://wrenchstack.com/my/): Malaysian contractor vendors, accounting software that says it submits e-invoices to MyInvois, construction/QS software (tendering, takeoff, estimating, progress claims), government tender access (ePerolehan, CIDB e-Tender), EPF/SOCSO payroll, Contractor's All Risks insurance, with the MyInvois e-invoicing mandate context (run by LHDN/IRBM, phasing in by turnover through 2026-2027; construction treated as a special case for individual progress-claim e-invoicing) and CIDB G1-G7 grading (guide: https://wrenchstack.com/my/guides/myinvois-e-invoicing/)
- [Certifications by country](https://wrenchstack.com/certifications/): licensing bodies across markets
- [Software listings by country](https://wrenchstack.com/software-by-country/): a matrix of the trades/construction platforms we list in two or more of our ${intlMarketCount + 1} markets (US, UK, CA, AU, NZ, IE, ZA, SA, AE, QA, KW, BA, OM, FR, MA, JO, EG, MY); a tick is a listing, not a statement that the platform is available there

## Research & data

- [ZATCA Phase 2 e-invoicing for construction companies](https://wrenchstack.com/sa/guides/zatca-e-invoicing-contractors/): Saudi compliance guide, Wave 24 (taxable turnover above SAR 375,000) closed 30 June 2026; EY reports that Wave 25 (above SAR 187,500, integration from 1 February 2027) was announced in July 2026; which construction software says it is ZATCA-ready (Arabic version: https://wrenchstack.com/sa/ar/guides/zatca-e-invoicing-contractors/)
- [Making Tax Digital for tradespeople](https://wrenchstack.com/uk/guides/making-tax-digital-tradespeople/): UK compliance guide, MTD for Income Tax mandatory since 6 April 2026 over £50k (then £30k in 2027, £20k in 2028), what sole traders and CIS subcontractors must change, and what the software in our UK directory says about MTD
- [Payday super for Australian trades businesses](https://wrenchstack.com/au/guides/payday-super-payroll-software/): AU compliance guide, payday super in effect since 1 July 2026, super with every pay run received by the fund within 7 business days of payday (per Treasury), the super guarantee charge for late contributions (including an administrative uplift of up to 60% of the shortfall, per Treasury's September 2024 factsheet), payroll readiness checklist
- [Oman e-invoicing (Fawtara) for construction companies](https://wrenchstack.com/om/guides/oman-e-invoicing-contractors/): Oman compliance guide, Peppol-based VAT e-invoicing mandate, 100 large VAT-registered companies from August 2026, all large ones from February 2027 and all remaining VAT-registered taxpayers from August 2027, per the Oman Tax Authority's FAQ, and what accounting software says about Fawtara
- [Facturation électronique (e-invoicing) for French artisans](https://wrenchstack.com/fr/guides/facturation-electronique-artisans/): France compliance guide, e-invoice reception for all from 1 Sept 2026, issuance for SMEs and micro-entreprises from 1 Sept 2027, the plateforme agréée model, and the e-invoicing route each software in our France directory names
- [2026 Trades Software Market Report](https://wrenchstack.com/trends-2026/): original research across the full ${usVendorTotal()}-vendor US stack (10 categories) and ${intlMarketCount} international markets. Median published entry price across the directory $${medianEntry}/month, which mixes pricing models and should not be quoted as a per-seat rate: ${perUserN} platforms charge per user (median $${perUser} per user/month), ${flatN} charge a flat monthly fee (median $${flatFee}/month) and ${annualN} ${annualN === 1 ? 'sells' : 'sell'} annual per-user licences. ${quoteOnlyPctValue}% of platforms publish no price at all, ${quickbooksPct()}% integrate with QuickBooks, plus a reputation-flag ledger (${totalReputationFlags()} flagged vendors; largest categories: ${flagBreakdown}) and the international markets, six of them with Arabic pages. Free to cite.
- [Pricing dataset, CSV](https://wrenchstack.com/data/trades-software-pricing-2026.csv): one row per field-service software platform (${tools.length} rows), CC BY 4.0, regenerated from the directory on every build. Columns: entry price, tier names and prices, pricing model, free-trial days and the date each price was verified; per-plan billing basis (price billed annually and paid monthly, per account or per user), included users, extra-user price, user cap, recorded usage limits, user-role rules and what the page leaves unclear, with the source URL and read date (published for ${rowWord(depthN)}); and, for quote-only platforms, what the quote depends on, with its source URL and read date (recorded for ${quoteBasisN} of ${quoteQuoteOnlyN}).
- [Pricing dataset, JSON](https://wrenchstack.com/data/trades-software-pricing-2026.json): the same rows and fields (per-plan details as a tier_details list), plus field definitions, license and summary statistics.
- [Reputation ledger](https://wrenchstack.com/reputation-flags/): all ${totalReputationFlags()} documented vendor warnings on one page, each with its evidence. No vendor can pay to have one removed.
- [Research hub](https://wrenchstack.com/research/): citable statistics computed from the directory data
- [2026 Awards](https://wrenchstack.com/awards/2026/): editorial awards by category

## Company

- [Methodology](https://wrenchstack.com/methodology/): the WrenchStack Fit Score, its weights, data sourcing and verification process
- [Editorial standards](https://wrenchstack.com/editorial-standards/): verification, sourcing and correction policy
- [About](https://wrenchstack.com/about/): what WrenchStack is and how it works
- [For vendors](https://wrenchstack.com/for-vendors/): how vendors get listed or submit factual corrections. Listings are free.
`;

// Static endpoint: Astro emits /llms.txt at build time, same path the
// hand-maintained public/llms.txt used to occupy.
export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
