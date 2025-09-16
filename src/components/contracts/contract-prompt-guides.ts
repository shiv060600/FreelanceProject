export interface PromptGuide {
    title: string;
    prompt: string;
}

export const getPromptGuide = (contractType: string): PromptGuide => {
    const guides: Record<string, PromptGuide> = {
        'freelance-service-agreement': {
            title: 'Freelance Service Agreement',
            prompt: `Include these key details in your prompt:
• Service description and deliverables
• Project timeline and milestones
• Payment terms (amount, schedule, method)
• Revision policy and scope changes
• Intellectual property ownership
• Communication preferences
• Cancellation terms

Example: "Create a freelance web design contract for $5,000, 6-week timeline, 3 revisions included, client owns final design, net-30 payment terms"`
        },
        'employment-contract': {
            title: 'Employment Contract',
            prompt: `Include these essential elements:
• Job title and responsibilities
• Salary/wage and benefits
• Work schedule and location
• Employment duration (permanent/temporary)
• Probationary period
• Confidentiality requirements
• Non-compete/non-solicitation clauses
• Termination conditions

Example: "Create an employment contract for Marketing Manager, $75,000 salary, full-time remote, 90-day probation, standard benefits, 2-week notice period"`
        },
        'rental-lease-agreement': {
            title: 'Rental/Lease Agreement',
            prompt: `Specify these important details:
• Property address and description
• Lease term and renewal options
• Monthly rent and security deposit
• Utilities and maintenance responsibilities
• Pet policy and restrictions
• Guest and subletting policies
• Property condition and inspection
• Early termination clauses

Example: "Create a 12-month residential lease for 2BR apartment at [address], $2,000/month rent, $2,000 security deposit, tenant pays utilities, no pets allowed"`
        },
        'service-provider-contract': {
            title: 'Service Provider Contract',
            prompt: `Include these service details:
• Specific services to be provided
• Service schedule and duration
• Pricing structure and payment terms
• Performance standards and metrics
• Equipment and materials responsibility
• Insurance and liability coverage
• Termination and renewal terms
• Emergency contact procedures

Example: "Create a contract for monthly lawn care service, $200/month, weekly mowing April-October, client provides water access, 30-day cancellation notice"`
        },
        'non-disclosure-agreement': {
            title: 'Non-Disclosure Agreement (NDA)',
            prompt: `Cover these confidentiality aspects:
• Definition of confidential information
• Purpose of information sharing
• Obligations of receiving party
• Permitted uses and exceptions
• Duration of confidentiality
• Return or destruction of information
• Consequences of breach
• Governing law and jurisdiction

Example: "Create a mutual NDA for business partnership discussions, 3-year confidentiality period, includes financial data and business plans, standard exceptions apply"`
        },
        'partnership-agreement': {
            title: 'Partnership Agreement',
            prompt: `Define these partnership terms:
• Partner names and contributions
• Ownership percentages and profit sharing
• Roles and responsibilities
• Decision-making process
• Capital contributions and withdrawals
• Partnership duration or dissolution terms
• Dispute resolution procedures
• Exit strategies and buyout terms

Example: "Create a 50/50 partnership agreement for consulting business, Partner A contributes $50k cash, Partner B contributes expertise, equal decision-making"`
        },
        'sales-contract': {
            title: 'Sales Contract',
            prompt: `Specify these transaction details:
• Product/service being sold
• Purchase price and payment terms
• Delivery/performance schedule
• Quality standards and specifications
• Warranty and return policy
• Risk of loss and title transfer
• Force majeure and cancellation
• Dispute resolution process

Example: "Create a sales contract for custom software, $25,000 total, 50% upfront, delivery in 90 days, 1-year warranty, source code included"`
        },
        'consulting-agreement': {
            title: 'Consulting Agreement',
            prompt: `Include these consulting specifics:
• Scope of consulting services
• Project objectives and deliverables
• Consultant's expertise and qualifications
• Time commitment and schedule
• Fee structure (hourly/project/retainer)
• Expense reimbursement policy
• Confidentiality and non-compete terms
• Work product ownership

Example: "Create a 6-month IT consulting agreement, $150/hour rate, 20 hours/week, cybersecurity assessment and implementation, monthly reporting required"`
        }
    };
    
    return guides[contractType] || guides['freelance-service-agreement'];
};
