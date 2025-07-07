interface SubscriptionData {
  stripe_price_id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

interface SubscriptionAccess {
  hasAccess: boolean;
  planName: string;
  invoiceLimit: number;
  status: string;
}

interface SubscriptionLimits {
  invoices: number;
  contracts: number;
}

interface SubscriptionDetails {
  subscription: string;
  maxInvoices: number;
  maxContracts: SubscriptionLimits;
}

/**
 * Check if user has subscription access based on subscription data
 * Handles cancelled subscriptions that are still within billing period
 */
export function getSubscriptionAccess(subscriptionData: SubscriptionData | null): SubscriptionAccess {
  if (!subscriptionData) {
    return {
      hasAccess: false,
      planName: 'Free',
      invoiceLimit: 2,
      status: 'free'
    };
  }

  const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
  
  // Check if subscription is active OR cancelled but still in billing period
  const now = Math.floor(Date.now() / 1000);
  const hasAccess = status === 'active' || 
                   (status === 'canceled' && cancel_at_period_end && current_period_end > now);
  
  if (!hasAccess) {
    return {
      hasAccess: false,
      planName: 'Free',
      invoiceLimit: 2,
      status: status
    };
  }

  // Map price IDs to plan details
  switch (stripe_price_id) {
    // Current price IDs being used
    case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
      return {
        hasAccess: true,
        planName: 'Expert Freelancer',
        invoiceLimit: 40,
        status: status
      };
    case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
      return {
        hasAccess: true,
        planName: 'Seasoned Freelancer',
        invoiceLimit: 20,
        status: status
      };
    case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
      return {
        hasAccess: true,
        planName: 'New Freelancer',
        invoiceLimit: 10,
        status: status
      };
    // Legacy price IDs (keep for backwards compatibility)
    case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
      return {
        hasAccess: true,
        planName: 'Expert Freelancer',
        invoiceLimit: 40,
        status: status
      };
    case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
      return {
        hasAccess: true,
        planName: 'Seasoned Freelancer',
        invoiceLimit: 20,
        status: status
      };
    case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
      return {
        hasAccess: true,
        planName: 'New Freelancer',
        invoiceLimit: 10,
        status: status
      };
    default:
      return {
        hasAccess: false,
        planName: 'Free',
        invoiceLimit: 2,
        status: status
      };
  }
}

/**
 * Get subscription limits based on plan name
 */
export function checkSubscriptionLimits(planName: string): { subscription: string; maxContracts: SubscriptionLimits } {
  switch (planName) {
    case 'Expert Freelancer':
      return {
        subscription: 'Expert Freelancer',
        maxContracts: {
          invoices: 40,
          contracts: 8
        }
      };
    case 'Seasoned Freelancer':
      return {
        subscription: 'Seasoned Freelancer',
        maxContracts: {
          invoices: 20,
          contracts: 4
        }
      };
    case 'New Freelancer':
      return {
        subscription: 'New Freelancer',
        maxContracts: {
          invoices: 10,
          contracts: 1
        }
      };
    default:
      return {
        subscription: 'Free',
        maxContracts: {
          invoices: 2,
          contracts: 0
        }
      };
  }
}