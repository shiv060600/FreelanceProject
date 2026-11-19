/**
 * Jurisdiction knowledge used in two places, so they can never drift apart:
 *   1. the Legal Guide page (what we tell freelancers), and
 *   2. the contract-drafting prompt (what we tell the AI to do).
 *
 * This is general, educational information, NOT legal advice, and it has not
 * been reviewed by a lawyer. Laws change; wording below is deliberately hedged
 * ("generally", "can") and every entry should be re-checked periodically.
 *
 * Pure data + helpers: no imports, so it can be unit-tested with plain Node.
 */

export const LEGAL_INFO_UPDATED = 'November 2026'

export type EsignStatus = 'valid' | 'conditional' | 'restricted'

export interface Jurisdiction {
  id: string
  label: string
  group: 'United States' | 'United Kingdom' | 'European Union' | 'Asia' | 'Europe (other)' | 'Americas'
  /** Matches free-text input such as "California, USA" or "Dublin, Ireland". */
  match: RegExp
  /** A broader jurisdiction that also applies (e.g. California -> United States). */
  parent?: string
  esign: { status: EsignStatus; summary: string }
  language: string
  /** Plain-English points for freelancers, shown in the Legal Guide. */
  rules: string[]
  /** Instructions given to the drafting AI when this jurisdiction applies. */
  drafting: string[]
  /** Things worth flagging to the user in the draft's "before you send" notes. */
  watch: string[]
}

// US states (Georgia is left out on purpose: it is far likelier to mean the country).
const US_STATES =
  'alabama|alaska|arizona|arkansas|colorado|connecticut|delaware|florida|hawaii|idaho|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|district of columbia'

const EU_COUNTRIES =
  'european union|eea|austria|belgium|bulgaria|croatia|cyprus|czechia|czech republic|denmark|estonia|finland|france|germany|greece|hungary|(?<!northern )ireland|italy|latvia|lithuania|luxembourg|malta|netherlands|poland|portugal|romania|slovakia|slovenia|spain|sweden'

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'california',
    label: 'California (USA)',
    group: 'United States',
    match: /\bcalifornia\b|,\s*ca\b/i,
    parent: 'usa',
    esign: { status: 'valid', summary: 'Electronic signatures are generally valid under the federal ESIGN Act and California’s UETA.' },
    language: 'English',
    rules: [
      'California’s Freelance Worker Protection Act (effective January 1, 2025) generally requires a written contract for freelance work worth $250 or more. It must itemize the services, state the rate and method of pay, and give the date payment is due (or how that date is set).',
      'Non-compete clauses that stop a contractor working for others are generally void in California.',
      'California applies a strict “ABC test” to decide whether someone is an employee or an independent contractor. Many freelance arrangements fit an exemption, but the rules are technical.',
      'Describing commissioned deliverables as “work made for hire” can have employment consequences in California. Assigning rights on payment is the safer approach.',
    ],
    drafting: [
      'Do not include a non-compete or any restraint on the contractor working for other clients (generally void in California).',
      'Make sure the contract itemizes the services, states the rate and method of compensation, and gives a payment due date (or the mechanism that sets it).',
      'Do not describe deliverables as "work made for hire". Use an assignment of rights effective on full payment.',
    ],
    watch: [
      'Check the contract itemizes services, compensation and the payment due date: California requires this for freelance work above a small threshold.',
      'Worker-classification rules in California are strict; confirm this really is an independent-contractor relationship.',
    ],
  },
  {
    id: 'new-york',
    label: 'New York (USA)',
    group: 'United States',
    match: /\bnew york\b|\bnyc\b|,\s*ny\b/i,
    parent: 'usa',
    esign: { status: 'valid', summary: 'Electronic signatures are generally valid under the federal ESIGN Act and New York’s Electronic Signatures and Records Act.' },
    language: 'English',
    rules: [
      'New York State’s Freelance Isn’t Free Act (effective August 28, 2024) and New York City’s version (2017) generally require a written contract for freelance work worth $800 or more (alone or combined over 120 days).',
      'The contract should include both parties’ names and mailing addresses, an itemized list of services, the value and the rate and method of compensation, and the date payment is due (or how it is determined). If no date is set, payment is generally due within 30 days of completion.',
      'Keep copies of contracts and payment records for at least six years.',
    ],
    drafting: [
      'Include the full name and mailing address of both parties (use [placeholders] if not provided), an itemized list of services, the total value, the rate and method of compensation, and the payment due date (or the mechanism that sets it).',
      'If no payment date is otherwise given, state that payment is due within 30 days after the work is completed.',
    ],
    watch: [
      'New York requires a written freelance contract with specific contents for work of $800 or more. Check both parties’ mailing addresses, itemized services and payment date are filled in.',
    ],
  },
  {
    id: 'illinois',
    label: 'Illinois (USA)',
    group: 'United States',
    match: /\billinois\b|,\s*il\b/i,
    parent: 'usa',
    esign: { status: 'valid', summary: 'Electronic signatures are generally valid under the federal ESIGN Act and Illinois’ Electronic Commerce Security Act.' },
    language: 'English',
    rules: [
      'Illinois’ Freelance Worker Protection Act (effective July 1, 2024) generally requires a written contract for freelance work worth $500 or more.',
      'The contract should list the parties, itemize the services, give the rate and method of pay and the payment due date. Payment is generally due by that date, or within 30 days of completion if none is stated.',
    ],
    drafting: [
      'Include both parties’ details, an itemized list of services, the rate and method of compensation and the payment due date (or the mechanism that sets it). If no date is given, payment is due within 30 days after completion.',
    ],
    watch: ['Illinois requires a written freelance contract with specific contents for work of $500 or more. Check the payment date and itemized services are present.'],
  },
  {
    id: 'usa',
    label: 'United States (general)',
    group: 'United States',
    match: new RegExp(`\\b(usa|u\\.s\\.a?\\.?|united states|america)\\b|\\b(${US_STATES})\\b`, 'i'),
    esign: { status: 'valid', summary: 'The federal ESIGN Act and state UETA laws generally make electronic signatures valid for business contracts.' },
    language: 'English',
    rules: [
      'Some contracts must be in writing to be enforceable (for example contracts that cannot be performed within a year). A written, signed contract is best practice either way.',
      'Whether someone is an independent contractor depends on how the relationship actually works, not just on what the contract says.',
      'Late-payment interest is limited by state usury laws, which vary. Contracts usually say “the lesser of 1.5% per month or the maximum rate allowed by law”.',
      'Several states and cities (for example New York, California and Illinois) require written freelance contracts with specific contents. Check your own state and city.',
    ],
    drafting: [
      'Do not use "work made for hire" wording for contractor deliverables. Use an assignment of rights effective on full payment, with a licence to use the work until then.',
      'Include a counterparts and electronic signatures clause stating electronic signatures are valid and binding.',
      'Where the contract puts confidentiality obligations on an individual, include a short carve-out for disclosures protected by law, including whistleblower immunity under the Defend Trade Secrets Act.',
      'State late-payment interest as "the lesser of 1.5% per month or the maximum rate permitted by law" because usury limits vary by state.',
    ],
    watch: [
      'Some US states and cities require written freelance contracts with specific contents. Check your own state and city rules.',
    ],
  },
  {
    id: 'uk',
    label: 'United Kingdom',
    group: 'United Kingdom',
    match: /\b(uk|u\.k\.|united kingdom|great britain|britain|england|wales|scotland|northern ireland)\b/i,
    esign: { status: 'valid', summary: 'Electronic signatures are generally valid for most commercial contracts in the UK.' },
    language: 'English',
    rules: [
      'Under the Late Payment of Commercial Debts (Interest) Act 1998, late business-to-business payments can attract statutory interest and fixed compensation unless the contract provides a “substantial remedy” for late payment.',
      'The Unfair Contract Terms Act 1977 requires exclusions and limits of liability to be reasonable, and some liabilities (such as death or personal injury caused by negligence) cannot be excluded at all.',
      'If the client is a consumer rather than a business, the Consumer Rights Act 2015 can make unfair terms unenforceable.',
      'HMRC’s off-payroll (IR35) rules can affect how contractors working through their own company are taxed.',
    ],
    drafting: [
      'Include a substantial contractual late-payment remedy, or expressly preserve statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998.',
      'Keep limitations of liability reasonable and do not purport to exclude liability for death or personal injury caused by negligence, fraud, or anything that cannot lawfully be excluded.',
      'Add a clause excluding third-party rights under the Contracts (Rights of Third Parties) Act 1999.',
      'Use English law and the courts of England and Wales unless the user names Scotland or Northern Ireland.',
    ],
    watch: [
      'If the client is an individual consumer, consumer-protection law may override some terms.',
      'If you work through your own company for a business client, check how the off-payroll (IR35) rules apply.',
    ],
  },
  {
    id: 'eu',
    label: 'European Union',
    group: 'European Union',
    match: new RegExp(`\\b(${EU_COUNTRIES})\\b`, 'i'),
    esign: { status: 'valid', summary: 'The eIDAS Regulation generally recognises electronic signatures; stronger signature types carry more evidentiary weight.' },
    language: 'Often the local language; check local requirements, especially for consumers and courts',
    rules: [
      'If you handle your client’s personal data, the GDPR may apply, which can require data-protection terms or a data processing agreement.',
      'EU consumer-protection rules are mandatory and override contract terms when the client is a consumer.',
      'The Late Payment Directive sets default payment periods and statutory interest for business transactions, as implemented in each member state.',
      'Rules differ between member states. Check the country you and your client are in.',
    ],
    drafting: [
      'If personal data will be processed, add a data protection clause (roles under the GDPR, security measures, sub-processors) or note that a separate data processing agreement may be needed.',
      'State that mandatory consumer-protection law prevails if the client is a consumer.',
      'Refer to statutory late-payment interest for commercial transactions rather than inventing a penalty.',
    ],
    watch: [
      'If personal data is involved, a data processing agreement may also be needed.',
      'The contract may need to be available in the local language, particularly for consumers or for use in court.',
    ],
  },
  {
    id: 'india',
    label: 'India',
    group: 'Asia',
    match: /\bindia\b/i,
    esign: { status: 'conditional', summary: 'The Information Technology Act, 2000 recognises electronic signatures, though certain document types are excluded.' },
    language: 'English accepted',
    rules: [
      'Stamp paper is often used, but not strictly required for every digital freelance agreement. Stamp duty rules vary by state and can affect whether a document is admissible as evidence.',
      'Restrictions on working for others after the contract ends (post-termination non-competes) are generally unenforceable under Section 27 of the Indian Contract Act, 1872.',
      'Clients may need to deduct tax at source (TDS) and charge GST. Contracts usually say which party bears these.',
    ],
    drafting: [
      'Do not include a post-termination non-compete (restraint of trade is generally void under Section 27 of the Indian Contract Act, 1872).',
      'Add a taxes clause: fees are exclusive of GST unless stated, and the client may deduct tax at source where required and will provide the certificate.',
      'If dispute resolution goes beyond negotiation, prefer arbitration under the Arbitration and Conciliation Act, 1996 with a [seat of arbitration] placeholder.',
    ],
    watch: [
      'Check stamp-duty requirements for your state; they can affect whether the document can be used as evidence.',
      'Confirm who bears GST and TDS.',
    ],
  },
  {
    id: 'philippines',
    label: 'Philippines',
    group: 'Asia',
    match: /\bphilippines\b/i,
    esign: { status: 'valid', summary: 'Electronic signatures are generally recognised.' },
    language: 'English accepted',
    rules: ['Freelancer contracts are governed by the Civil Code, and e-signatures are generally valid.'],
    drafting: ['Mandatory local law applies. Use the governing law the user names, and keep terms neutral and widely accepted.'],
    watch: ['Confirm local mandatory rules with a local professional if the amount is significant.'],
  },
  {
    id: 'pakistan',
    label: 'Pakistan',
    group: 'Asia',
    match: /\bpakistan\b/i,
    esign: { status: 'conditional', summary: 'Electronic signatures are generally recognised, though stamp paper or notarization may strengthen enforceability.' },
    language: 'English widely used',
    rules: ['Stamp paper or notarization may strengthen contract enforceability.'],
    drafting: ['Mandatory local law applies. Use the governing law the user names, and keep terms neutral and widely accepted.'],
    watch: ['Consider stamp paper or notarization if the contract may need to be enforced.'],
  },
  {
    id: 'bangladesh',
    label: 'Bangladesh',
    group: 'Asia',
    match: /\bbangladesh\b/i,
    esign: { status: 'valid', summary: 'Legal recognition under the ICT Act.' },
    language: 'English accepted',
    rules: ['Electronic records have legal recognition under the ICT Act, though there is a cultural preference for written copies.'],
    drafting: ['Mandatory local law applies. Use the governing law the user names, and keep terms neutral and widely accepted.'],
    watch: ['A signed paper copy is commonly expected alongside the electronic one.'],
  },
  {
    id: 'ukraine',
    label: 'Ukraine',
    group: 'Europe (other)',
    match: /\bukraine\b/i,
    esign: { status: 'valid', summary: 'Electronic signatures are generally recognised.' },
    language: 'Ukrainian often required',
    rules: ['English may work between the parties, but a Ukrainian translation may be needed in disputes.'],
    drafting: ['Mandatory local law applies. Use the governing law the user names, and keep terms neutral and widely accepted.'],
    watch: ['A Ukrainian translation may be needed if the contract is used in a dispute.'],
  },
  {
    id: 'russia',
    label: 'Russia',
    group: 'Europe (other)',
    match: /\brussia\b/i,
    esign: { status: 'restricted', summary: 'Electronic signatures are only valid with certified Russian providers.' },
    language: 'Russian required',
    rules: ['E-signatures are only valid with certified Russian providers, and a Russian translation is required.'],
    drafting: ['Mandatory local law applies. Use the governing law the user names, and keep terms neutral and widely accepted.'],
    watch: ['Electronic signatures from non-certified providers may not be valid, and a Russian translation is required.'],
  },
  {
    id: 'brazil',
    label: 'Brazil',
    group: 'Americas',
    match: /\bbrazil\b|\bbrasil\b/i,
    esign: { status: 'valid', summary: 'Electronic signatures are generally recognised.' },
    language: 'Portuguese preferred',
    rules: ['English is valid with consent, but local consumer-protection law may override contract terms.'],
    drafting: ['Mandatory local law applies. State that mandatory consumer-protection law prevails if the client is a consumer.'],
    watch: ['A Portuguese version is preferred, and consumer-protection law may override some terms.'],
  },
  {
    id: 'serbia',
    label: 'Serbia',
    group: 'Europe (other)',
    match: /\bserbia\b/i,
    esign: { status: 'valid', summary: 'Electronic signatures are binding.' },
    language: 'Serbian preferred',
    rules: ['Translations may be required for court use; signatures are binding electronically.'],
    drafting: ['Mandatory local law applies. Use the governing law the user names, and keep terms neutral and widely accepted.'],
    watch: ['A Serbian translation may be required if the contract is used in court.'],
  },
]

export const JURISDICTION_LABELS = JURISDICTIONS.map((j) => j.label)

export function getJurisdiction(id: string) {
  return JURISDICTIONS.find((j) => j.id === id)
}

/**
 * Jurisdictions that apply to a free-text governing-law string, most specific
 * first ("California, USA" -> California, then United States). Empty if none.
 */
export function findJurisdictions(input?: string | null): Jurisdiction[] {
  const text = (input ?? '').trim()
  if (!text) return []
  const found: Jurisdiction[] = []
  const add = (j: Jurisdiction) => {
    if (!found.includes(j)) found.push(j)
    const parent = j.parent ? getJurisdiction(j.parent) : undefined
    if (parent) add(parent)
  }
  for (const j of JURISDICTIONS) if (j.match.test(text)) add(j)
  // Order: children before parents, otherwise list order.
  return found.sort((a, b) => Number(!!b.parent) - Number(!!a.parent))
}

const NEUTRAL_GUIDANCE =
  'The governing law was not given or was not recognised. Use neutral, widely accepted terms, avoid statute-specific references, ' +
  'and add a drafting note that the governing-law clause needs confirming and that local mandatory law may apply.'

/** The jurisdiction block that goes into the drafting prompt. */
export function jurisdictionDraftingGuidance(input?: string | null) {
  const matched = findJurisdictions(input)
  if (matched.length === 0) return { matched, text: NEUTRAL_GUIDANCE }
  const text = matched
    .map((j) => `${j.label}:\n${j.drafting.map((d) => `- ${d}`).join('\n')}`)
    .join('\n\n')
  return { matched, text }
}

/** Drafting-note points for the matched jurisdictions (deduplicated). */
export function jurisdictionWatchPoints(input?: string | null) {
  return Array.from(new Set(findJurisdictions(input).flatMap((j) => j.watch)))
}
