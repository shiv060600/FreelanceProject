/**
 * Contract types the generator supports. `mustCover` is fed to the model so
 * each type reliably includes the clauses that matter for it, instead of
 * relying on whatever the user happened to type.
 */
export interface ContractTypeDef {
  id: string
  label: string
  description: string
  /** What "party A / party B" are called in the document. */
  partyRoles: { provider: string; client: string }
  mustCover: string[]
}

export const CONTRACT_TYPES: ContractTypeDef[] = [
  {
    id: 'freelance-service-agreement',
    label: 'Freelance Service Agreement',
    description: 'Scope, milestones, payment and IP for client work',
    partyRoles: { provider: 'Freelancer', client: 'Client' },
    mustCover: [
      'Scope of services and deliverables, with a clear definition of what is out of scope',
      'Timeline and milestones, and what happens if the client delays feedback or materials',
      'Fees, invoicing schedule, payment due dates, late-payment interest and kill fee',
      'Revisions policy and the change-request process for scope changes',
      'Intellectual property: ownership transfers only on full payment; freelancer keeps pre-existing tools and may show the work in a portfolio unless confidentiality applies',
      'Independent contractor status (no employment, taxes are the freelancer\'s responsibility)',
      'Confidentiality',
      'Termination for convenience and for cause, with payment for work completed',
      'Limitation of liability and indemnity',
    ],
  },
  {
    id: 'consulting-agreement',
    label: 'Consulting Agreement',
    description: 'Advisory work, retainers and hourly engagements',
    partyRoles: { provider: 'Consultant', client: 'Client' },
    mustCover: [
      'Description of consulting services and objectives',
      'Fee structure (hourly, fixed or retainer), expense reimbursement and invoicing terms',
      'Time commitment and availability',
      'Independent contractor status',
      'Confidentiality and handling of client data',
      'Ownership of work product and of consultant\'s pre-existing materials',
      'Non-solicitation (reasonable scope only) rather than broad non-compete language',
      'Term, renewal and termination',
      'No-guarantee-of-results and limitation of liability',
    ],
  },
  {
    id: 'non-disclosure-agreement',
    label: 'Non-Disclosure Agreement (NDA)',
    description: 'Mutual or one-way confidentiality',
    partyRoles: { provider: 'Disclosing Party', client: 'Receiving Party' },
    mustCover: [
      'Definition of Confidential Information, with standard exclusions (public, already known, independently developed, lawfully received)',
      'Permitted purpose and permitted recipients',
      'Obligations of the receiving party and standard of care',
      'Compelled disclosure procedure',
      'Term of the agreement and how long confidentiality survives',
      'Return or destruction of materials',
      'Remedies, including injunctive relief',
      'No licence granted and no warranty of accuracy',
    ],
  },
  {
    id: 'service-provider-contract',
    label: 'Service Provider Contract',
    description: 'Recurring or on-site services (e.g. maintenance, events)',
    partyRoles: { provider: 'Service Provider', client: 'Client' },
    mustCover: [
      'Detailed description of services, schedule and service standards',
      'Pricing, payment terms and treatment of materials and equipment',
      'Access, safety and cooperation obligations of the client',
      'Insurance and liability',
      'Cancellation and rescheduling terms',
      'Term, renewal and termination',
      'Force majeure',
    ],
  },
  {
    id: 'sales-contract',
    label: 'Sales Contract',
    description: 'One-off sale of goods or a productised service',
    partyRoles: { provider: 'Seller', client: 'Buyer' },
    mustCover: [
      'Description of the goods or deliverable and specifications',
      'Price, deposit, payment schedule and taxes',
      'Delivery or performance timeline, acceptance and inspection',
      'Title and risk of loss',
      'Warranty, remedies and returns',
      'Cancellation, force majeure and limitation of liability',
    ],
  },
  {
    id: 'partnership-agreement',
    label: 'Partnership Agreement',
    description: 'Collaboration or profit-sharing between two parties',
    partyRoles: { provider: 'Partner A', client: 'Partner B' },
    mustCover: [
      'Purpose of the partnership and each partner\'s contributions',
      'Ownership percentages and profit/loss sharing',
      'Roles, responsibilities and decision-making, including deadlock resolution',
      'Capital contributions, withdrawals and expenses',
      'Intellectual property created by the partnership',
      'Term, exit, buy-out and dissolution',
      'Dispute resolution',
    ],
  },
  {
    id: 'employment-contract',
    label: 'Employment Contract',
    description: 'Hiring an employee (check local law)',
    partyRoles: { provider: 'Employee', client: 'Employer' },
    mustCover: [
      'Position, duties and reporting line',
      'Compensation, benefits, leave and expenses',
      'Working hours and location',
      'Probationary period and term',
      'Confidentiality and intellectual property assignment',
      'Reasonable restrictive covenants only where lawful in the jurisdiction',
      'Termination and notice',
      'Statement that mandatory local employment law prevails over the contract',
    ],
  },
  {
    id: 'rental-lease-agreement',
    label: 'Rental / Lease Agreement',
    description: 'Residential or commercial lease (check local law)',
    partyRoles: { provider: 'Landlord', client: 'Tenant' },
    mustCover: [
      'Premises description, term and renewal',
      'Rent, due date, late fees and security deposit handling',
      'Utilities, maintenance and repairs',
      'Use restrictions, pets, guests and subletting',
      'Entry and inspection rights with notice',
      'Default, termination and move-out condition',
      'Statement that mandatory local tenancy law prevails over the contract',
    ],
  },
]

export const DEFAULT_CONTRACT_TYPE = 'freelance-service-agreement'

export function getContractType(id: string): ContractTypeDef {
  return CONTRACT_TYPES.find((t) => t.id === id) ?? CONTRACT_TYPES[0]
}

export const TONES = [
  { id: 'formal', label: 'Formal legal', hint: 'Traditional contract language' },
  { id: 'plain', label: 'Plain English', hint: 'Clear, friendly, still enforceable' },
] as const
export type ToneId = (typeof TONES)[number]['id']

export const LENGTHS = [
  { id: 'concise', label: 'Concise', hint: '~1 page · simple projects', maxTokens: 2200 },
  { id: 'standard', label: 'Standard', hint: '2–3 pages · most projects', maxTokens: 4000 },
  { id: 'comprehensive', label: 'Comprehensive', hint: '4+ pages · high-value work', maxTokens: 6500 },
] as const
export type LengthId = (typeof LENGTHS)[number]['id']
