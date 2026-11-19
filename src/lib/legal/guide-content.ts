/**
 * Educational copy for the Legal Guide. General information only, not legal
 * advice, and not reviewed by a lawyer. Kept as plain data so it is easy to
 * review, edit and (ideally) have a lawyer check line by line.
 */

export interface Principle {
  title: string
  body: string
}

export const BINDING_ESSENTIALS: Principle[] = [
  {
    title: 'Offer and acceptance',
    body: 'One side proposes terms and the other agrees to them. Agreement can be a signature, a click on “accept”, or sometimes simply doing the work. But relying on conduct makes a dispute much harder to prove.',
  },
  {
    title: 'Something of value on both sides',
    body: 'In many legal systems each side must give something of value, usually work in exchange for payment. A bare promise to work for nothing is often not enforceable as a contract.',
  },
  {
    title: 'Capacity and intent',
    body: 'Everyone signing must be legally able to (an adult, or someone authorised to act for a company) and must intend to be bound by the agreement.',
  },
  {
    title: 'A lawful purpose',
    body: 'Courts will not enforce illegal terms, and in many places can strike out terms they consider unreasonable or unfair.',
  },
  {
    title: 'Clear terms',
    body: 'A court cannot enforce what it cannot understand. Vague scope, a missing price or no deadline is where most freelance disputes start.',
  },
]

export const BINDING_VS_NOT = {
  usuallyBinding: [
    'A written agreement both sides have signed, with clear terms.',
    'A written quote or proposal that the client accepted in writing.',
    'Electronic acceptance (a signature, a typed name or a click) where electronic signatures are valid. See “By location”.',
  ],
  oftenNotBinding: [
    'A letter of intent or memorandum of understanding that says it is non-binding.',
    'A term sheet marked non-binding, or one that leaves out the key terms.',
    'A casual chat or message such as “let’s work together” with no price, scope or timeline.',
  ],
  caution:
    'Labels do not decide this. Courts look at what the parties meant and did. A document called a “draft” that both sides act on can still bind you, and many agreements can be binding even if spoken, though they are hard to prove. Some types of contract must be in writing to be enforceable.',
}

export const COMMON_MISTAKES: string[] = [
  'Starting work before anything is signed.',
  'Vague scope: “a website” instead of a list of pages and features.',
  'No payment date, deposit or consequence for paying late.',
  'Unlimited revisions, or no process for extra work.',
  'Not saying who owns the finished work, or when ownership transfers.',
  'No way for either side to end the contract.',
  'Naming the wrong legal entity, or having someone without authority sign.',
  'Agreeing to changes by chat or phone and never writing them down.',
]

export interface ChecklistItem {
  name: string
  what: string
  lookFor: string
}
export interface ChecklistGroup {
  id: string
  title: string
  items: ChecklistItem[]
}

export const CLAUSE_CHECKLIST: ChecklistGroup[] = [
  {
    id: 'scope',
    title: 'Parties and scope',
    items: [
      { name: 'Parties', what: 'Full legal names, roles and contact details for both sides.', lookFor: 'Is the right legal entity named (a person or a company, not just a brand)? Does the signer have authority?' },
      { name: 'Services and deliverables', what: 'An itemized list of what you will deliver and in what format.', lookFor: 'Could a stranger tell whether the work is finished?' },
      { name: 'Acceptance and revisions', what: 'How the client approves work, how many revision rounds are included and what happens after.', lookFor: 'A review window after which the work counts as accepted.' },
      { name: 'Change requests', what: 'A written process for extra work, with its own price and timeline.', lookFor: 'Nothing extra happens on a chat message alone.' },
      { name: 'Client responsibilities', what: 'What you need from the client (feedback, materials, access) and by when.', lookFor: 'What happens to the deadline if the client is late.' },
    ],
  },
  {
    id: 'money',
    title: 'Money',
    items: [
      { name: 'Fees and schedule', what: 'The total or rate, the currency, any deposit and milestone payments.', lookFor: 'Amounts add up and match what you agreed.' },
      { name: 'Payment due date', what: 'A specific number of days after each invoice.', lookFor: 'Some places require a stated payment date, or default to 30 days, for freelance work. See “By location”.' },
      { name: 'Late payment', what: 'Interest on overdue amounts and the right to pause work.', lookFor: 'Interest written as the lesser of a percentage or the legal maximum, not as a flat penalty.' },
      { name: 'Expenses and taxes', what: 'Who pays expenses, and who is responsible for sales tax, VAT or GST, or withholding.', lookFor: 'Tax treatment matches your country and your client’s.' },
      { name: 'Kill fee', what: 'What the client pays if they cancel after you have started.', lookFor: 'A fair estimate of your lost time, not a punishment.' },
    ],
  },
  {
    id: 'ip',
    title: 'Ownership and confidentiality',
    items: [
      { name: 'Who owns the work', what: 'When ownership of the finished work passes to the client, commonly only on full payment.', lookFor: 'Be careful with “work made for hire” wording: in some places it has employment consequences.' },
      { name: 'Your tools and earlier work', what: 'You keep what you brought to the project and license the client to use it inside the deliverables.', lookFor: 'Third-party and open-source materials are covered.' },
      { name: 'Portfolio rights', what: 'Your right to show the work in your portfolio.', lookFor: 'Does not conflict with confidentiality.' },
      { name: 'Confidentiality', what: 'What counts as private, for how long, and the usual exceptions.', lookFor: 'Mutual where possible, with a sensible end date.' },
    ],
  },
  {
    id: 'risk',
    title: 'Risk and liability',
    items: [
      { name: 'Independent contractor status', what: 'You run your own business: no employee benefits, and you handle your own taxes.', lookFor: 'The contract should match how the work is actually done. Some places apply strict tests.' },
      { name: 'Limit of liability', what: 'A cap on what either side can owe the other, often the fees paid.', lookFor: 'Mutual and reasonable. Some liabilities cannot legally be limited.' },
      { name: 'Indemnities and warranties', what: 'Who covers third-party claims, and promises about originality.', lookFor: 'Not unlimited, and not one-sided.' },
    ],
  },
  {
    id: 'ending',
    title: 'Ending the agreement',
    items: [
      { name: 'Termination', what: 'How either side can end the contract, how much notice, and payment for work already done.', lookFor: 'A way out for convenience and for serious breach.' },
      { name: 'What survives', what: 'The clauses that keep applying afterwards, such as payment, ownership and confidentiality.', lookFor: 'Payment obligations survive.' },
    ],
  },
  {
    id: 'mechanics',
    title: 'Legal mechanics',
    items: [
      { name: 'Governing law and venue', what: 'Which place’s law applies and where disputes are heard.', lookFor: 'A place you can realistically use. It can change which freelancer protections apply.' },
      { name: 'Resolving disputes', what: 'Talk first, then mediation, then court or arbitration.', lookFor: 'Cost and distance of the chosen forum.' },
      { name: 'Entire agreement and changes', what: 'Only this document counts, and changes must be in writing.', lookFor: 'Earlier promises you relied on are written into the contract.' },
      { name: 'Notices, assignment, severability, force majeure', what: 'The housekeeping that decides what happens when something goes wrong.', lookFor: 'Email addresses for notices are correct.' },
      { name: 'Electronic signatures', what: 'A statement that electronic signatures count.', lookFor: 'Valid in most places, but not everywhere. See “By location”.' },
    ],
  },
]

export const AI_DOES: string[] = [
  'Drafts from the details you give it, using a drafting standard that asks for consistent defined terms, correct cross-references, fair and enforceable terms, and no penalty clauses.',
  'Applies extra rules for the governing law you choose, where we have them (see “By location”).',
  'Marks anything it was not told as a [placeholder] instead of inventing it, and gives you a short “before you send” checklist.',
]

export const AI_CANNOT: string[] = [
  'It cannot verify any fact you give it, or know your full situation.',
  'It cannot guarantee a contract is complete, correct, enforceable or suitable for the laws that apply to you.',
  'It can make mistakes, leave things out or phrase things badly. It may not reflect recent changes in the law.',
  'It is not a lawyer and nothing it produces is legal advice. Nobody at FreelanceFlow reviews what it writes.',
]

export const REVIEW_CHECKLIST: string[] = [
  'Read every clause, start to finish. If you do not understand something, do not send it.',
  'Fill in or delete every [placeholder].',
  'Check names, addresses, amounts, currencies, dates and deadlines against what you agreed.',
  'Check the scope: does it describe exactly the work you will do, and nothing you will not?',
  'Check the payment terms: amounts, due dates, deposit, late fees and what happens if they do not pay.',
  'Check ownership and confidentiality match what you intend.',
  'Check the governing law and any location-specific rules in this guide. Some places require specific contents.',
  'Make sure you can actually live with the termination, liability and dispute terms.',
  'Agree changes in writing, and keep a signed copy somewhere safe.',
]

export const WHEN_TO_SEE_A_LAWYER: string[] = [
  'The contract is high in value, or you could lose more than you could comfortably afford.',
  'It transfers significant intellectual property, or includes revenue share, equity or royalties.',
  'The work is long-term, exclusive, or restricts who else you can work for.',
  'You or your client are in different countries, or in a heavily regulated industry.',
  'The client is a consumer rather than a business, or you handle personal or sensitive data.',
  'You are unsure whether the person you are working with is an employee or a contractor.',
  'There is already a dispute, or a client asks you to sign something you do not understand.',
]

export const RESPONSIBILITY_POINTS: string[] = [
  'FreelanceFlow provides software and general information. We do not review, verify, approve or guarantee any contract.',
  'We are not responsible for contracts you create, edit, generate, send or sign, or for the outcome of relying on them.',
  'Using the app or this guide does not create an attorney–client relationship.',
  'You decide whether a contract is right for you, and whether to get professional advice first.',
]
