// Shared metadata + types for the international markets (Phase 4).
// Each market has a single landing page plus per-vendor detail pages.

export interface IntlVendor {
  slug: string;
  name: string;
  category: string;
  vendor_url: string;
  tagline: string;
  market_position: string;
  tier: 'S' | 'A' | 'F';
  reputation_flag: string | null;
  pros: string[];
  cons: string[];
  typical_pricing: string;
  is_cross_market: boolean;
  cross_market_link: string | null;
  // market-specific note lives under a per-market key (uk_specific_note, au_specific_note, ...)
  [key: string]: unknown;
}

export interface IntlMarket {
  code: string;
  name: string;
  flag: string;
  noteField: string;
  /** plain-language summary of what makes vendor selection different in this market */
  intro: string;
  /** the legally-relevant certification/compliance bodies for trades in this market */
  certContext: string;
}

export const INTL_MARKETS: Record<string, IntlMarket> = {
  uk: {
    code: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    noteField: 'uk_specific_note',
    intro: 'UK trades vendor selection is shaped by mandatory certification (Gas Safe, NICEIC, OFTEC), compressed compliance (HMRC RTI, CIS deductions, auto-enrolment pensions, VAT), and directory-led consumer behavior (Checkatrade, MyBuilder).',
    certContext: 'Gas Safe Register (gas), NICEIC (electrical / Part P), and OFTEC (oil heating) are legal requirements — unlicensed work is a criminal offense, and software/insurance must handle RTI, CIS, and VAT natively.',
  },
  au: {
    code: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    noteField: 'au_specific_note',
    intro: 'Australian trades vendor selection is shaped by state-based licensing, Single Touch Payroll (STP) reporting to the ATO, superannuation obligations, and GST handling — plus local lead-gen platforms like hipages.',
    certContext: 'Licensing is state-administered (e.g., electrical and plumbing licenses per state/territory), and payroll software must lodge Single Touch Payroll (STP) to the ATO and handle superannuation and GST.',
  },
  ca: {
    code: 'ca',
    name: 'Canada',
    flag: '🇨🇦',
    noteField: 'ca_specific_note',
    intro: 'Canadian trades vendor selection is shaped by provincial trade certification (often Red Seal), CRA payroll remittances, GST/HST/PST handling, and bilingual (English/French) requirements in some provinces.',
    certContext: 'Trade certification is provincial (with the interprovincial Red Seal endorsement), and payroll/accounting software must handle CRA source deductions, GST/HST/PST, and — for Quebec — French-language and Revenu Québec requirements.',
  },
  nz: {
    code: 'nz',
    name: 'New Zealand',
    flag: '🇳🇿',
    noteField: 'nz_specific_note',
    intro: 'New Zealand trades vendor selection is shaped by registration/licensing regimes (registered electricians, certifying plumbers/gasfitters), IRD payday filing, KiwiSaver, and GST.',
    certContext: 'Trades are registered/licensed (e.g., the Plumbers, Gasfitters and Drainlayers Board; the Electrical Workers Registration Board), and payroll software must handle IRD payday filing, KiwiSaver, and GST.',
  },
  ie: {
    code: 'ie',
    name: 'Ireland',
    flag: '🇮🇪',
    noteField: 'ie_specific_note',
    intro: 'Irish trades vendor selection is shaped by statutory registration (RGI for gas, Safe Electric for electrical), Revenue PAYE Modernisation real-time reporting, RCT for construction subcontractors, and VAT.',
    certContext: 'Gas work requires Registered Gas Installer (RGI) status and electrical work requires Safe Electric registration, while payroll/accounting must handle Revenue PAYE Modernisation (real-time reporting), RCT, and VAT.',
  },
  sa: {
    code: 'sa',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    noteField: 'sa_specific_note',
    intro: 'Saudi construction & trades software selection is shaped by Vision 2030\'s giga-project boom (NEOM, Red Sea, Qiddiya, ROSHN), mandatory ZATCA e-invoicing (Fatoora), Arabic/RTL and Saudi-Riyal requirements, contractor classification (Grades 1–6), Saudi Building Code compliance, and Saudization (Nitaqat) labour rules.',
    certContext: 'Engineering practice requires Saudi Council of Engineers (SCE) registration; contractors need a MOMRAH classification grade to bid public work; permits run through Balady under the mandatory Saudi Building Code; and accounting/invoicing must integrate with ZATCA\'s Fatoora e-invoicing — so local software has to handle Arabic, SAR and 15% VAT.',
  },
  ae: {
    code: 'ae',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    noteField: 'ae_specific_note',
    intro: 'UAE construction & trades software selection is shaped by Dubai\'s BIM mandate, a 5% VAT (Federal Tax Authority), the upcoming Peppol e-invoicing model, Emiratisation labour quotas, a Dubai-vs-Abu-Dhabi regulatory split (Dubai Municipality contractor classification vs Abu Dhabi DMT + Estidama), and AED pricing.',
    certContext: 'Dubai Municipality (reshaped by Dubai Law No. 7 of 2025) and federal MOEI handle contractor registration/classification; VAT is 5% via the Federal Tax Authority; e-invoicing follows a decentralised Peppol model (mandatory for large taxpayers from 2027); Emiratisation (MOHRE/Nafis) governs labour; and Abu Dhabi adds the mandatory Estidama Pearl rating.',
  },
  qa: {
    code: 'qa',
    name: 'Qatar',
    flag: '🇶🇦',
    noteField: 'qa_specific_note',
    intro: 'Qatar construction & trades software selection is shaped by a post-World-Cup, LNG-funded pipeline, the Ashghal QCS 2014 construction standard, Monaqasat contractor classification, Qatarization (Law No. 12 of 2024), Qatari-Riyal pricing, and — unlike Saudi — no VAT and no mandatory e-invoicing yet.',
    certContext: 'Government work is gated by a Monaqasat (Ministry of Finance) classification certificate; the General Tax Authority administers tax (no VAT yet, with a draft e-invoicing law); Qatarization governs labour; Baladiya issues permits to the QCS 2014 code maintained by Ashghal; and Kahramaa accredits MEP/utility contractors.',
  },
  kw: {
    code: 'kw',
    name: 'Kuwait',
    flag: '🇰🇼',
    noteField: 'kw_specific_note',
    intro: 'Kuwait construction & trades software selection is shaped by the New Kuwait 2035 / Silk City pipeline, CAPT contractor classification, Kuwaitization labour quotas, the mandatory KFSD fire code, Kuwaiti-Dinar pricing, and — like Qatar — no VAT and no e-invoicing mandate.',
    certContext: 'The Central Agency for Public Tenders (CAPT) classifies contractors and gates public work; the Ministry of Finance levies 15% corporate income tax on foreign-owned entities (no VAT); the Public Authority for Manpower enforces Kuwaitization; Kuwait Municipality issues permits; and the Kuwait Fire Force owns the mandatory KFSD fire-safety code.',
  },
  za: {
    code: 'za',
    name: 'South Africa',
    flag: '🇿🇦',
    noteField: 'za_specific_note',
    intro: 'South African trades vendor selection is shaped by Certificate-of-Compliance culture (electrical CoCs via DoEL-registered persons, SAQCC Gas, PIRB plumbing CoCs), CIDB contractor grading (1–9) gating public work, NHBRC registration for home builders, SARS compliance (15% VAT, monthly EMP201, e-invoicing phasing in ~2026–28), the COIDA Letter of Good Standing — and the solar-installation boom the load-shedding era created.',
    certContext: 'Electrical work legally requires Department of Employment & Labour registration (registered persons issue the mandatory Certificate of Compliance); gas work requires SAQCC Gas registration (unregistered work voids home insurance); PIRB plumbing CoCs are required for geysers and solar water heaters; CIDB grading gates public construction; NHBRC registration is mandatory for home builders; and employers need a current COIDA Letter of Good Standing for site access.',
  },
};

export const INTL_CATEGORY_LABELS: Record<string, string> = {
  'software': 'Field service software',
  'lead-gen': 'Lead generation',
  'insurance': 'Business insurance',
  'payroll': 'Payroll software',
  'certification': 'Required certification',
};

export function intlNote(vendor: IntlVendor, market: IntlMarket): string {
  const v = vendor[market.noteField];
  if (typeof v === 'string' && v.length > 0) return v;
  // fallback: any *_specific_note field present
  for (const k of Object.keys(vendor)) {
    if (k.endsWith('_specific_note') && typeof vendor[k] === 'string') return vendor[k] as string;
  }
  return '';
}

export function intlTierMeta(tier: 'S' | 'A' | 'F'): { label: string; badge: string; border: string } {
  if (tier === 'S') return { label: 'Recommended', badge: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-300' };
  if (tier === 'F') return { label: 'Reputation warning', badge: 'bg-rose-100 text-rose-900', border: 'border-rose-300' };
  return { label: 'Workable', badge: 'bg-blue-100 text-blue-900', border: 'border-blue-300' };
}
