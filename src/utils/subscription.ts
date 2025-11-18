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
      invoiceLimit: 100,
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
      invoiceLimit: 100,
      status: status
    };
  }

  // Map price IDs to plan details
  switch (stripe_price_id) {
    // Current price IDs being used
    case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
      return {
        hasAccess: true,
        planName: 'Unlimited Freelancer',
        invoiceLimit: 999999,
        status: status
      };
    case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
    case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
    case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
    case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
    case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
      return {
        hasAccess: true,
        planName: 'Unlimited Freelancer',
        invoiceLimit: 999999,
        status: status
      };
    default:
      return {
        hasAccess: false,
        planName: 'Free',
        invoiceLimit: 100,
        status: status
      };
  }
}

/**
 * Get subscription limits based on plan name
 */
export function checkSubscriptionLimits(planName: string): { subscription: string; maxContracts: SubscriptionLimits } {
  switch (planName) {
    case 'Unlimited Freelancer':
    case 'Expert Freelancer': // Legacy mapping
    case 'Seasoned Freelancer': // Legacy mapping
    case 'New Freelancer': // Legacy mapping
      return {
        subscription: 'Unlimited Freelancer',
        maxContracts: {
          invoices: 999999,
          contracts: 999999
        }
      };
    default:
      return {
        subscription: 'Free',
        maxContracts: {
          invoices: 100,
          contracts: 100
        }
      };
  }
}
