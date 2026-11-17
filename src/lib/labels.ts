/** Display labels for feature and integration slugs (2026-11-18). Chips and lists printed
 *  slugs with only the underscores replaced, so readers saw "quickbooks online", "gaf",
 *  "justifi", "crm" and "aia billing". Display only: never feed a label back into data. */

const ACRONYMS: Record<string, string> = {
  '3d': '3D', ach: 'ACH', ai: 'AI', aia: 'AIA', api: 'API', bim: 'BIM', crm: 'CRM', csv: 'CSV',
  gps: 'GPS', hvac: 'HVAC', ios: 'iOS', kpi: 'KPI', pdf: 'PDF', pv: 'PV', qr: 'QR', rfi: 'RFI',
  sms: 'SMS', sop: 'SOP', voip: 'VoIP', e: 'e', usa: 'USA', us: 'US', uk: 'UK',
};

// Brand spellings that a plain capital per word gets wrong.
const BRANDS: Record<string, string> = {
  '1build': '1build', abc_supply: 'ABC Supply', acculynx: 'AccuLynx', adp: 'ADP', amazon_s3: 'Amazon S3',
  angi: 'Angi', autodesk: 'Autodesk', buildertrend: 'Buildertrend',
  buildops: 'BuildOps', callrail: 'CallRail', calltrackingmetrics: 'CallTrackingMetrics',
  cmic: 'CMiC', companycam: 'CompanyCam', computerease: 'ComputerEase',
  craftjack: 'CraftJack', docusign: 'DocuSign', docusketch: 'DocuSketch', dumpsters_com: 'Dumpsters.com',
  eagleview: 'EagleView', enerflo: 'Enerflo', enphase_enlighten: 'Enphase Enlighten',
  esri: 'Esri', fieldedge: 'FieldEdge', freeagent: 'FreeAgent',
  freshbooks: 'FreshBooks', gaf: 'GAF', gocardless: 'GoCardless', goodleap: 'GoodLeap',
  greensky: 'GreenSky', guildquality: 'GuildQuality', highlevel: 'HighLevel',
  homeadvisor: 'HomeAdvisor', hubspot: 'HubSpot', icloud_calendar: 'iCloud Calendar',
  jobnimbus: 'JobNimbus', jobtread: 'JobTread', justifi: 'JustiFi', lamotte: 'LaMotte',
  landscapehub: 'LandscapeHub', lowes: "Lowe's",
  magicplan: 'magicplan', mailchimp: 'Mailchimp', measuresquare: 'MeasureSquare', microsoft_365: 'Microsoft 365', ms_project: 'MS Project', myob: 'MYOB',
  n8n: 'n8n', netsuite: 'NetSuite', nicejob: 'NiceJob', nmi: 'NMI',
  onedrive: 'OneDrive', opensolar: 'OpenSolar', paypal: 'PayPal', paysimple: 'PaySimple',
  planswift: 'PlanSwift', power_bi: 'Power BI', projectwise: 'ProjectWise',
  qfloors: 'QFloors', quickbooks: 'QuickBooks',
  quickbooks_desktop: 'QuickBooks Desktop', quickbooks_enterprise: 'QuickBooks Enterprise',
  quickbooks_online: 'QuickBooks Online', quickbooks_payroll: 'QuickBooks Payroll',
  quickbooks_time: 'QuickBooks Time', qxo: 'QXO', responsibid: 'ResponsiBid', rfms: 'RFMS',
  ringcentral: 'RingCentral', rollmaster: 'RollMaster', roofr: 'Roofr', sage_100_contractor: 'Sage 100 Contractor', sage_300_cre: 'Sage 300 CRE', salesrabbit: 'SalesRabbit',
  sap: 'SAP', sendgrid: 'SendGrid', servicem8: 'ServiceM8',
  servicemonster: 'ServiceMonster', servicetitan: 'ServiceTitan',
  servicetitan_marketing_pro: 'ServiceTitan Marketing Pro', servicetrade: 'ServiceTrade',
  sharepoint: 'SharePoint', simpro: 'Simpro', siteone: 'SiteOne', solargraf: 'Solargraf',
  solarquotes: 'SolarQuotes', srs_distribution: 'SRS Distribution',
  sumoquote: 'SumoQuote', sumup: 'SumUp', taxcloud: 'TaxCloud', the_home_depot: 'The Home Depot',
  woocommerce: 'WooCommerce', wordpress: 'WordPress',
  xactanalysis: 'XactAnalysis', zoho_crm: 'Zoho CRM',
};

const word = (w: string): string => ACRONYMS[w] ?? w;

/** A feature or other descriptive slug in running text: lower case, acronyms kept
 *  ("job costing", "AIA billing", "GPS tracking", "e signature"). */
// Feature slugs that name a product ("quickbooks_sync", "stripe_payments") keep its spelling.
const FEATURE_WORDS: Record<string, string> = {
  quickbooks: 'QuickBooks', stripe: 'Stripe', shopify: 'Shopify', xactimate: 'Xactimate',
  esignature: 'eSignature',
};
const FEATURE_SLUGS: Record<string, string> = { e_signature: 'eSignature' };

export function featureLabel(slug: string): string {
  if (FEATURE_SLUGS[slug]) return FEATURE_SLUGS[slug];
  return slug.split('_').map((w) => FEATURE_WORDS[w] ?? word(w)).join(' ');
}

/** The same with a capital first letter, for chips and list items; a label that starts
 *  with a name spelled in lower case ("iOS app", "eSignature") is left as it is. */
export function featureChip(slug: string): string {
  const s = featureLabel(slug);
  if (/^(iOS|eSignature)\b/.test(s)) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** An integration slug as the product's name ("QuickBooks Online", "GAF", "JustiFi"). */
export function integrationLabel(slug: string): string {
  if (BRANDS[slug]) return BRANDS[slug];
  return slug
    .split('_')
    .map((w) => ACRONYMS[w] ?? (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}
