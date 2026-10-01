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
    intro: 'UK trades vendor selection is shaped by the Gas Safe Register for gas work, competent person schemes such as NICEIC and OFTEC that let installers self-certify building work, payroll duties (HMRC RTI reporting, workplace pension auto enrolment and, in construction, CIS returns), VAT, and lead services such as Checkatrade, MyBuilder and TrustATrader.',
    certContext: 'Gas Safe Register is the register approved by HSE: a business must be on it to legally do gas work within the scope of the Gas Safety (Installation and Use) Regulations 1998, and HSE prosecutes unregistered gas fitters. For electrical work in dwellings, NICEIC (Certsure) is one of several authorised competent person schemes, alongside BESCA, Blue Flame Certification, NAPIT and OFTEC, that let installers self-certify instead of getting building regulations approval, and OFTEC is one of six schemes authorised for oil appliances. The payroll tools listed here are on HMRC’s list of recognised payroll software, while CIS returns may need an add-on or a separate product; insurers such as Hiscox and AXA note that employers’ liability insurance is a legal requirement once you employ staff.',
  },
  au: {
    code: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    noteField: 'au_specific_note',
    intro: 'Australian trades vendor selection is shaped by state-based licensing, Single Touch Payroll (STP) reporting to the ATO, super guarantee payments (due with each pay run under Payday Super from 1 July 2026), GST registration once turnover reaches $75,000 (per business.gov.au), and local lead services such as hipages, Localsearch and Yellow Pages.',
    certContext: 'Trade licensing is run by the states: Building Commission NSW issues NSW building and trade licences, QBCC licenses Queensland builders, plumbers and drainers (electrical work is licensed separately by the Electrical Safety Office), Victoria’s Building and Plumbing Commission registers and licenses plumbers, Building and Energy registers WA builders and licenses electricians, plumbers and gas fitters, and CBS licenses South Australian building and PGE contractors. Automatic Mutual Recognition lets licence holders from participating states work in NSW and, depending on the occupation, in WA, usually after notifying; Queensland does not take part. Employers report pay and super to the ATO through STP-enabled payroll software each payday, and from 1 July 2026 must pay the 12% super guarantee when they pay wages.',
  },
  ca: {
    code: 'ca',
    name: 'Canada',
    flag: '🇨🇦',
    noteField: 'ca_specific_note',
    intro: 'Canadian trades vendor selection is shaped by provincial and territorial trade certification (with the interprovincial Red Seal endorsement), provincial safety regulators and workplace insurance boards such as Ontario’s ESA, TSSA and WSIB, CRA payroll remittances, GST, HST and PST (some provinces charge GST and PST separately), and separate Quebec payroll rules (Revenu Québec, QPP, QPIP). Several software vendors listed here publish prices in US dollars.',
    certContext: 'Provinces and territories are responsible for apprenticeship training and trade certification; a Red Seal endorsement on a provincial or territorial certificate shows the holder passed the Red Seal exam but does not by itself certify anyone to carry on a trade. In Ontario, working in one of the 23 compulsory trades needs a valid Certificate of Qualification from Skilled Trades Ontario (or a provisional certificate or registered training agreement), only ESA-licensed contractors may do electrical work for hire, TSSA registers fuels contractors and certifies gas technicians, and WSIB says people who own or run a construction business must, with some exceptions, have WSIB coverage and register. The Canadian payroll tools listed here say they handle CRA remittances and Records of Employment; Quebec payroll adds Revenu Québec remittances, QPP, QPIP and RL-1 reporting, which not every tool covers.',
  },
  nz: {
    code: 'nz',
    name: 'New Zealand',
    flag: '🇳🇿',
    noteField: 'nz_specific_note',
    intro: 'New Zealand trades vendor selection is shaped by registration and licensing (the EWRB for electrical workers, the PGDB for plumbers, gasfitters and drainlayers, and the LBP scheme for Restricted Building Work on homes), payday filing with Inland Revenue, KiwiSaver deductions, Holidays Act leave calculations, 15% GST, and health and safety duties under the Health and Safety at Work Act 2015.',
    certContext: 'Only EWRB-registered and licensed workers can carry out or supervise prescribed electrical work, with the practising licence renewed every 2 years; the PGDB registers and licenses plumbers, gasfitters and drainlayers and prosecutes unauthorised work; and Restricted Building Work on homes must be done or supervised by a Licensed Building Practitioner. WorkSafe enforces the Health and Safety at Work Act 2015 and says amendments take effect on 1 April 2027. The payroll tools listed here file payday information with Inland Revenue, and some act as PAYE intermediaries that pay PAYE to Inland Revenue for you. Master Builders and Master Plumbers membership is voluntary and does not replace licensing.',
  },
  ie: {
    code: 'ie',
    name: 'Ireland',
    flag: '🇮🇪',
    noteField: 'ie_specific_note',
    intro: 'Irish trades vendor selection is shaped by statutory registration (RGI for gas, Safe Electric for electrical contractors), Revenue payroll reporting under PAYE Modernisation, the My Future Fund auto-enrolment pension scheme that started on 1 January 2026, Relevant Contracts Tax (RCT) on payments to construction subcontractors, and SEAI’s Registered Contractor List for grant-funded home energy upgrades.',
    certContext: 'Since 1 September 2026 it is illegal for anyone who is not a Registered Gas Installer to carry out domestic or non-domestic gas works (S.I. No. 106/2026), and the CRU says Safe Electric registration for electrical contractors is the law; Safe Energy Ireland runs both schemes for the CRU. Principal contractors deduct RCT at 0%, 20% or 35% from subcontractors’ payments and file through ROS. The Irish payroll tools listed here say they send payroll submissions to Revenue and handle My Future Fund auto-enrolment. The statutory Construction Industry Register Ireland (CIRI) is not yet mandatory: the CIF says applications open during 2027, and its Voluntary Construction Register runs until then.',
  },
  sa: {
    code: 'sa',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    noteField: 'sa_specific_note',
    intro: 'Saudi construction and trades software selection is shaped by ZATCA’s mandatory e-invoicing regime (Phase 2 integration with the Fatoora platform, rolled out in turnover waves), contractor classification by the Ministry of Municipalities and Housing for public projects, building permits on Balady checked against the mandatory Saudi Building Code, Saudization ranges under Nitaqat tracked on Qiwa, and government tenders run on Etimad. Several vendors listed here offer Arabic and English interfaces, and some publish SAR prices.',
    certContext: 'The Engineering Professions Practice Law requires Saudi Council of Engineers (SCE) accreditation before anyone practises engineering, with fines of up to SAR 1 million. Under the Contractor Classification Law, government bodies may not accept a bid for a project subject to classification unless the contractor is classified in its field, activity and grade; classification requests and building permits are filed on Balady, where permit plans are checked against the Saudi Building Code and latent defects insurance is a required document. ZATCA’s Phase 2 requires businesses called in by turnover wave to connect their invoicing software to the Fatoora platform (EY reports that Wave 25 reaches taxable turnover above SAR 187,500 and that businesses in it should prepare to comply with Phase 2 starting from 1 February 2027). Nitaqat places each entity in one of five Saudization ranges that decide access to services such as new expatriate visas and work permits, and Argaam reported in 2018 that firms must join the Saudi Contractors Authority before bidding for tenders.',
  },
  ae: {
    code: 'ae',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    noteField: 'ae_specific_note',
    intro: 'UAE construction and trades software selection is shaped by 5% VAT filed with the Federal Tax Authority through EmaraTax, the phased e-invoicing mandate run through accredited Peppol service providers (under Ministry of Finance decisions, businesses with revenue of AED 50 million or more implement it by 1 January 2027 and smaller businesses by 1 July 2027), MOHRE Emiratisation targets, separate regulatory systems in Dubai (Dubai Municipality’s Contractors Register and its BIM requirement for large and specialised buildings) and Abu Dhabi (DMT classification, permits and the Estidama Pearl rating), and AED pricing.',
    certContext: 'Under Dubai Law No. 7 of 2025, contracting work in Dubai needs a trade licence and entry in Dubai Municipality’s Contractors Register, while federal MOEI e-qualification covers only MOEI’s own engineering projects. VAT is 5%, with registration mandatory once taxable supplies and imports exceed AED 375,000 over 12 months. E-invoicing follows a decentralised model based on the OpenPeppol standard: under Ministerial Decision No. 244 of 2025, as amended by Ministerial Resolution No. 66 of 2026, each business appoints an Accredited Service Provider from the Ministry of Finance list (by 30 October 2026 for revenue of AED 50 million or more, implementing by 1 January 2027; by 31 March 2027 for smaller businesses, implementing by 1 July 2027). MOHRE sets Emiratisation targets for companies with 50 or more employees and for companies with 20-49 employees in 14 sectors, and in Abu Dhabi a building permit needs an Estidama Pearl rating (at least one Pearl for private projects, two for government-funded ones).',
  },
  qa: {
    code: 'qa',
    name: 'Qatar',
    flag: '🇶🇦',
    noteField: 'qa_specific_note',
    intro: 'Qatar construction and trades software selection is shaped by Monaqasat classification for government tenders, the Qatar Construction Specifications (QCS 2014), Ashghal’s tendering and prequalification for public works, the Qatarization law (Law No. 12 of 2024), and the tax position: Qatar has not introduced VAT, and a draft e-invoicing law approved on 6 May 2026 had no official go-live date by 30 September 2026.',
    certContext: 'The Ministry of Finance’s Monaqasat portal requires classification, with an audited balance sheet, before a company can take part in government tenders. The General Tax Authority administers income tax (10%), withholding tax and excise tax through its Dhareeba portal; Qatar has no VAT as of September 2026, and EY reports that the GTA will run e-invoicing under the draft law. Law No. 12 of 2024 requires employers to report vacancies and salaries to the Ministry of Labour and to fill designated jobs with Qatari nationals. The Ministry of Municipality issues building permits through an AI-based system launched in October 2025; QCS 2014 applies to all buildings under construction, according to The Peninsula, with Ashghal adding Interim Advice Notes on its own projects; and Kahramaa publishes lists of authorized electrical and water contractors and licenses solar PV contractors.',
  },
  kw: {
    code: 'kw',
    name: 'Kuwait',
    flag: '🇰🇼',
    noteField: 'kw_specific_note',
    intro: 'Kuwait construction and trades software selection is shaped by CAPT’s role in government tenders and its classification of general contractors (with rules changing under Decree-Law No. 94 of 2026, according to Arab Times), Public Authority for Manpower rules and Kuwaiti-hiring conditions on government contracts, Kuwait Fire Force licensing and sprinkler rules, online building permits from Kuwait Municipality, and the tax position: Kuwait has not introduced VAT, while foreign-owned businesses pay 15% corporate income tax and clients retain 5% of contract payments until a tax clearance certificate is shown.',
    certContext: 'The Central Agency for Public Tenders (CAPT) runs and approves government tenders and contract awards, and its classification committee sorts general contractors into four categories by financial and technical capability; Arab Times reported that Decree-Law No. 94 of 2026 amends the Public Tenders Law, taking effect three months after its late-September 2026 gazette publication. The Ministry of Finance levies 15% corporate income tax on foreign entities and on the foreign-owned share of GCC companies, with no VAT in force. The Public Authority for Manpower administers work permits under Labour Law No. 6 of 2010, each tendering body sets the share of Kuwaiti workers on its government contracts (Cabinet Resolution No. 1179 of 2023), and employer social security contributions go to PIFSS. Kuwait Municipality issues building permits and licenses engineering offices online, and the Kuwait Fire Force (formerly the Kuwait Fire Service Directorate) licenses commercial and industrial premises, requires sprinklers in all investment housing buildings and approves firefighting companies.',
  },
  za: {
    code: 'za',
    name: 'South Africa',
    flag: '🇿🇦',
    noteField: 'za_specific_note',
    intro: 'South African trades vendor selection is shaped by certificates issued on each job (electrical Certificates of Compliance from registered persons under the Department of Employment and Labour, SAQCC Gas certificates of conformity, PIRB plumbing CoCs), cidb registration and grading (1-9) for public sector contracts, NHBRC registration for home builders, SARS payroll and VAT obligations (15% VAT, the monthly EMP201 and EMP501 reconciliations, with mandatory e-invoicing proposed from 2030 in a SARS consultation paper of August 2026), and the COIDA Letter of Good Standing checked before site work.',
    certContext: 'Under the Electrical Installation Regulations, 2009, electrical contractors must register with the Department of Employment and Labour, and only registered persons may issue the electrical Certificate of Compliance. Regulation 17 of the Pressure Equipment Regulations bars anyone who is not a registered authorised person (registered through SAQCC Gas) from installing or removing gas appliances and systems. Under PIRB’s rules, only PIRB Licensed Plumbers can issue its plumbing CoC, which is needed for most plumbing work above R1,500 and for electric, solar and heat pump water heating at any cost. Contractors must be cidb-registered to carry out public sector contracts awarded by tender or quotation, and each grade sets a maximum contract value; the NHBRC says anyone in the business of building homes must be registered with it; and under the Construction Regulations, 2014, clients and principal contractors must confirm COIDA good standing before work starts.',
  },
  ba: {
    code: 'ba',
    name: 'Bahrain',
    flag: '🇧🇭',
    noteField: 'ba_specific_note',
    intro: 'Bahrain construction software selection is shaped by 10% VAT administered by the National Bureau for Revenue (NBR), with e-invoicing not yet mandatory according to PwC’s July 2026 review, CRPEP licensing for engineers and engineering offices, Ministry of Works prequalification for its building, roads, sanitary and landscape works, Tender Board registration for larger government tenders, LMRA work permits and Bahrainisation ratios, and building permits through the Benayat system.',
    certContext: 'The National Bureau for Revenue administers VAT at a 10% standard rate, with registration mandatory at BHD 37,500 of annual taxable revenue; PwC’s July 2026 review found e-invoicing not yet mandatory and notes that the market expects a system similar to Saudi Arabia’s, with no confirmed start date. CRPEP licenses engineers and engineering offices under Law No. 51 of 2014, and new-building permits on Benayat are filed through a CRPEP-licensed engineering office. The Ministry of Works prequalifies contractors by category and grade for its building, roads, sanitary and landscape works; the Tender Board oversees government purchases above BHD 50,000, and bidders must register on its eTendering system; LMRA issues work permits for expatriate staff, with a higher fee under the Parallel Bahrainisation System for firms below their ratio; and the General Directorate of Civil Defense gives input on Benayat permits, with its approval letter required for a building’s completion certificate.',
  },
  om: {
    code: 'om',
    name: 'Oman',
    flag: '🇴🇲',
    noteField: 'om_specific_note',
    intro: 'Oman construction software selection is shaped by the Oman Tax Authority’s phased Fawtara e-invoicing rollout through accredited service providers (the Authority’s FAQ says implementation begins in August 2026 for 100 large VAT-registered companies, in February 2027 for all large VAT-registered companies and in August 2027 for all remaining VAT-registered taxpayers), alongside 5% VAT, OSE engineer accreditation (required for work permits since 1 August 2025), registration and classification on the Esnad portal of the Authority for Projects, Tenders and Local Content, Omanisation categories that raise or lower work permit fees, building permits through Muscat Municipality’s e-services, the unified Oman Building Code, and CDAA fire-safety requirements.',
    certContext: 'The Oman Tax Authority administers 5% VAT (registration mandatory above OMR 38,500 of annual supplies) and Fawtara e-invoicing, a 5-corner model in which OTA-accredited service providers exchange invoices and report tax data; other sources give different phase dates, so check your own start date with the Authority. Since 1 August 2025 the Ministry of Labour requires OSE accreditation before an engineer’s work permit is issued or renewed. The Authority for Projects, Tenders and Local Content (Royal Decree 57/2025) registers and classifies suppliers, contractors and consulting offices on Esnad for government work. Under Ministerial Decision 602/2025, firms meeting Omanisation targets get 30% off visa and licensing fees and firms falling short pay double, according to Muscat Daily. Muscat Municipality issues building permits in Muscat governorate; the unified building code from the Ministry of Housing and Urban Planning is optional in 2026 and 2027, enforced in Muscat from 2028 and nationwide by 2030, according to Muscat Daily; and the Civil Defence and Ambulance Authority (CDAA) sets building fire-safety conditions and studies construction plans.',
  },
  fr: {
    code: 'fr',
    name: 'France',
    flag: '🇫🇷',
    noteField: 'fr_specific_note',
    intro: 'French artisan (bâtiment) vendor selection is shaped by facturation électronique (every business must be able to receive e-invoices through a plateforme agréée since 1 September 2026, and PME, TPE and micro-entreprises must issue them by 1 September 2027), compulsory assurance décennale taken out before work starts, multi-rate TVA (20%, 10% and 5.5%), the RGE label that homeowner clients need to claim energy-renovation aid, and the micro-entrepreneur regime with its turnover ceilings and VAT franchise.',
    certContext: 'Since 1 September 2026 every French business must be able to receive B2B e-invoices through a plateforme agréée registered by the State (CGI art. 289 bis), and PME, TPE and micro-entreprises must issue them by 1 September 2027; DGFiP says no sanctions apply in 2026 while businesses adapt. Assurance décennale (Loi Spinetta) must be in place before work starts, and building without it is punishable by 6 months’ imprisonment and/or a 75,000 euro fine, per service-public.fr. TVA on building work on homes is 20% standard, 10% for improvement, transformation, fitting-out and maintenance, and 5.5% for energy renovation, with the reduced rates only for dwellings completed more than two years ago. Clients can only claim MaPrimeRénov’, the éco-PTZ or CEE bonuses if the work is done by an RGE professional. Businesses register through the Guichet des formalités des entreprises, with the CMA advising artisans, and regulated building trades must be carried out or controlled by a qualified person (CAP, BEP or BP, an equivalent RNCP title, or three years’ experience).',
  },
  ma: {
    code: 'ma',
    name: 'Morocco',
    flag: '🇲🇦',
    noteField: 'ma_specific_note',
    intro: 'Moroccan construction and trades software selection is shaped by the DGI’s planned electronic invoicing (due to start in phases from late 2026 with large companies and public-sector suppliers, according to Hespress, with the technical rules not yet published in August 2026), Tous Risques Chantier and RC décennale insurance (reported as mandatory since January 2025), TVA and mandatory invoice mentions such as the ICE, CNSS salary declarations and contributions through Damancom, and the qualification and classification of BTP firms by the Ministère de l’Équipement et de l’Eau for public tenders.',
    certContext: 'The DGI issues the identifiant fiscal (IF), runs SIMPL for TVA, IS and salary declarations, and is preparing e-invoicing in phases from late 2026, large companies and public-sector suppliers first (Hespress, August 2026). Under Décret n° 2-94-223, the Ministère de l’Équipement et de l’Eau qualifies and classifies BTP firms, and a firm’s class sets the maximum contract amount it can bid for; each tender file states the sector, qualification and class it requires. Moroccan press reported in January 2025 that Tous Risques Chantier and RC décennale insurance had become mandatory, and Wafa Assurance says its décennale cover depends on the works being checked by an approved technical-control body. Employers declare salaries and pay contributions through the CNSS Damancom portal, and public tender rules ask bidders for a CNSS certificate issued within the last year; the ICE has been mandatory on official documents since 1 July 2016, and invoices without it can be rejected by the tax administration, per Hespress.',
  },
  jo: {
    code: 'jo',
    name: 'Jordan',
    flag: '🇯🇴',
    noteField: 'jo_specific_note',
    intro: 'Jordanian construction and trades software selection is shaped by JoFotara, the national e-invoicing system run by the Income and Sales Tax Department (ISTD): its invoicing regulation recognises e-invoices issued through JoFotara or software linked to it, and Jordanian press reported that use of the system became mandatory from the start of April 2025. Add 16% general sales tax, Social Security Corporation contributions on insured wages, registration and classification with the Jordan Construction Contractors Association (JCCA) for works contracts, and Jordan Engineers Association (JEA) registration for engineering work.',
    certContext: 'The ISTD administers income tax, 16% general sales tax and the JoFotara e-invoicing system, so contractors issuing invoices should confirm that their accounting software is linked to JoFotara. Under the Construction Contractors Law, no one may practise contracting without registering with the JCCA, and no ministry, municipality, public shareholding company or other entity may sign a works contract with a contractor who is not registered and classified; the Government Tenders Department manages contractor licensing and classification and publishes the Contractor Classification Instructions of 2020. Engineering studies and designs may be prepared only by offices registered with the JEA, companies register with the Companies Control Department (CCD), and employers pay Social Security Corporation contributions of 14.25% of insured wages, with 7.5% from the employee, according to PwC’s tax summary.',
  },
  eg: {
    code: 'eg',
    name: 'Egypt',
    flag: '🇪🇬',
    noteField: 'eg_specific_note',
    intro: 'Egyptian construction and trades software selection is shaped by the Egyptian Tax Authority’s (ETA) e-invoicing and e-receipt systems, made mandatory in phases by ETA decisions, which require electronically signed invoices sent through integration with ETA’s system. Add VAT at a general rate of 14% (which press reports in October 2025 describe being applied to contracting works), membership of the Egyptian Federation for Construction and Building Contractors (EFCBC) for contracting work above EGP 50,000, Engineers Syndicate registration, social insurance contributions under Law 148 of 2019, and NUCA building permits for sites in the new cities. Some tools listed here price in USD, so their EGP cost moves with the exchange rate.',
    certContext: 'The ETA administers income tax and VAT (general rate 14%) and runs the e-invoicing and e-receipt systems; e-invoicing is mandatory for taxpayers named in its phased decisions, and ETA offers an online tool to check whether a business is covered. Under Law 104 of 1992, no contracting work worth more than EGP 50,000 per operation may be assigned to or carried out by anyone who is not a working member of the EFCBC, which classifies members by specialization and capacity. Under Law 66 of 1974, engineering posts and works may only go to engineers or consulting offices registered with the Egyptian Engineers Syndicate. Companies are incorporated through GAFI’s Investor Services Centers or online; employers pay social insurance contributions on each insured worker’s wage under Law 148 of 2019, administered by NOSI; and inside new cities such as New Cairo, NUCA is the competent planning and building-permit body under Law 119/2008.',
  },
  my: {
    code: 'my',
    name: 'Malaysia',
    flag: '🇲🇾',
    noteField: 'my_specific_note',
    intro: 'Malaysian construction and trades software selection is shaped by MyInvois, the national e-invoicing system run by LHDN/IRBM (the Inland Revenue Board), rolled out in phases by turnover from August 2024. Businesses with turnover up to RM5 million entered on 1 January 2026, but under LHDN’s e-Invoice Guideline of 30 August 2026 those below RM3 million are exempt unless a shareholder company, holding company, related company or joint venture has turnover of RM3 million or more, and an interim relaxation for the up-to-RM5 million phase runs to 31 December 2027, allowing consolidated e-invoices for taxpayers who meet its conditions. AutoCount, SQL Account, Bukku and other local accounting and ERP vendors listed here say they submit e-invoices to MyInvois. Add the Ringgit (MYR), SST, CIDB contractor grading from G1 to G7, and monthly EPF, SOCSO, EIS and PCB payroll deductions, with LHDN publishing a list of payroll software whose PCB calculation meets its specification.',
    certContext: 'Under Act 520, every local and foreign contractor must register with CIDB (the Construction Industry Development Board), which grades contractors G1 to G7 with works limits from RM200,000 (G1) to no limit (G7), issues the SPKK certificate for government works and registers construction workers, site supervisors and project managers through the Green Card; working unregistered risks a fine of RM10,000 to RM100,000. LHDN/IRBM runs income tax, employers’ monthly PCB/MTD deductions and the MyInvois e-invoicing system. SSM (the Companies Commission of Malaysia) registers businesses, companies and LLPs; under Act 138 only a Professional Engineer or engineering consultancy practice registered with the Board of Engineers Malaysia (BEM) may submit engineering plans to an authority; and employers must register with and pay monthly contributions to EPF/KWSP and to SOCSO/PERKESO (including EIS), with HRD Corp registration and levy required at 10 or more employees in covered industries.',
  },
};

// 'software' is shared by every international market, whose software lists include field-service
// apps, document control, scheduling, design, accounting and e-invoicing tools, and
// whose hubs label the category differently (2026-10-01). "Field service software"
// was false for most of them, so the shared label is the one true for every market.
export const INTL_CATEGORY_LABELS: Record<string, string> = {
  'software': 'Software',
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
  if (tier === 'S') return { label: 'Published prices', badge: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-300' };
  if (tier === 'F') return { label: 'Reputation warning', badge: 'bg-rose-100 text-rose-900', border: 'border-rose-300' };
  return { label: 'Listed', badge: 'bg-blue-100 text-blue-900', border: 'border-blue-300' };
}

// Hreflang cluster for the parallel English-market homepages. Shared, self-
// referential set (each page lists every alternate including itself, per
// Google's reciprocity rules) - signals these are regional variants of one
// directory, not duplicate content competing against each other.
export const EN_MARKET_HREFLANG: { hreflang: string; href: string }[] = [
  { hreflang: 'en-US', href: 'https://wrenchstack.com/' },
  { hreflang: 'en-GB', href: 'https://wrenchstack.com/uk/' },
  { hreflang: 'en-CA', href: 'https://wrenchstack.com/ca/' },
  { hreflang: 'en-AU', href: 'https://wrenchstack.com/au/' },
  { hreflang: 'en-NZ', href: 'https://wrenchstack.com/nz/' },
  { hreflang: 'en-IE', href: 'https://wrenchstack.com/ie/' },
  { hreflang: 'en-ZA', href: 'https://wrenchstack.com/za/' },
  { hreflang: 'en-MY', href: 'https://wrenchstack.com/my/' },
  { hreflang: 'x-default', href: 'https://wrenchstack.com/' },
];

// Total international listings, computed from the market data files at build
// time so homepage/press counts can never drift from the data (added
// 2026-08-27 after an audit found four different vendor totals on public
// surfaces).
const _intlModules = import.meta.glob('../data/international/*.json', { eager: true }) as Record<
  string,
  { default?: { vendors?: unknown[] }; vendors?: unknown[] }
>;
export const intlVendorCount = Object.values(_intlModules).reduce((n, m) => {
  const mod = m.default ?? m;
  return n + (Array.isArray(mod.vendors) ? mod.vendors.length : 0);
}, 0);
// 'certification' entries are licensing bodies, tax offices, regulators, codes and
// schemes, not vendors (2026-10-01: the homepage counted them in "vendors tracked").
export const intlCertificationCount = Object.values(_intlModules).reduce((n, m) => {
  const mod = m.default ?? m;
  return n + (Array.isArray(mod.vendors)
    ? (mod.vendors as Array<{ category?: string }>).filter((v) => v?.category === 'certification').length
    : 0);
}, 0);
export const intlVendorOnlyCount = intlVendorCount - intlCertificationCount;
export const intlMarketCount = Object.keys(INTL_MARKETS).length;

/**
 * Every international vendor as {name, url}, for surfaces that need to offer a
 * vendor their own page (the badge picker). Derives the market code from the
 * data filename so a new market file appears here without a code change.
 */
export function intlVendorIndex(): Array<{ name: string; url: string }> {
  const out: Array<{ name: string; url: string }> = [];
  for (const [path, m] of Object.entries(_intlModules)) {
    const code = path.split('/').pop()?.replace('.json', '') ?? '';
    if (!INTL_MARKETS[code]) continue;
    const mod = (m.default ?? m) as { vendors?: Array<{ name?: string; slug?: string }> };
    for (const v of mod.vendors ?? []) {
      if (!v?.name || !v?.slug) continue;
      out.push({ name: `${v.name} (${code.toUpperCase()})`, url: `https://wrenchstack.com/${code}/${v.slug}/` });
    }
  }
  return out;
}
