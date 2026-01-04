import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../supabase/client";
import { parse } from "path";

const supabase = createClient();

interface Invoice {
    id: string;
    user_id: string;
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'paid';
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
    invoice_name?: string;
    //added from db query
    clients?: {
      id: string;
      name: string;
    } | null;
  }
  

interface CreateInvoiceData {
    user_id: string;
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'paid';
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes?: string;
    // New fields
    description?: string;
    quantity?: number;
    unit_price?: number;
    invoice_name?: string;
  }
  
  interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
    id: string, //Require invoiceId
    user_id: string; //Require user_id
}

export function useInvoices (userId:string){
    return useQuery({
        queryKey:['invoices',userId],
        queryFn: async (): Promise<Invoice[]> => {
            if(!userId){
                throw new Error('User ID is required');
            }
            const { data:invoicesData, error:invoiceError} = await supabase
            .from('invoices')
            .select('id, user_id, invoice_number, client_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes, status, created_at, updated_at, description, quantity, unit_price, invoice_name')
            .eq('user_id',userId)
            .order('created_at',{ascending:false});

            if (invoiceError) {
                throw invoiceError; 
            }
            if(!invoicesData || invoicesData.length === 0){
                return [];
            }

            const clientIds = Array.from(new Set(invoicesData.map(item => item.client_id).filter(Boolean)))

            const clientsResponse = clientIds.length > 0 
                ? await supabase
                    .from('clients')
                    .select('id,name,email,phone')
                    .in('id',clientIds)
                : { data: [], error: null };

            if (clientsResponse.error) {
                console.error('Error fetching clients:', clientsResponse.error)
              }

            const clientsMap = new Map(clientsResponse.data?.map(client => [client.id,client]) || [])

            const enrichedInvoices: Invoice[] = invoicesData.map(invoice => ({
                ...invoice,
                clients: clientsMap.get(invoice.client_id) || null,
              }));

            return enrichedInvoices;
        },
        enabled : !!userId
    })
}

export function useUserSubscription(userId: string) {
  return useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      // Check subscription directly from subscriptions table
      const { data: subscriptionData, error: dbError } = await supabase
        .from('subscriptions')
        .select('stripe_price_id, status, current_period_end, cancel_at_period_end')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (dbError) {
        console.error('Subscription query error:', dbError)
        return { maxInvoices: 100, status: 'free' }
      }
      
      if (subscriptionData) {
        const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
        
        // Check if subscription is active OR cancelled but still in billing period
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const hasAccess = status === 'active' || 
                         (status === 'canceled' && cancel_at_period_end && current_period_end > now);
        
        if (hasAccess) {
          // Map price IDs to invoice limits
          let maxInvoices = 100; // Default to free tier
          switch (stripe_price_id) {
            case 'price_1Ri13NDuVswTohZkIWvJp0x9':
            case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
            case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
            case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
            case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
            case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
            case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
              maxInvoices = 999999; // All map to Unlimited Freelancer
              break;
            default:
              maxInvoices = 100; // Free tier
              break;
          }
          return { maxInvoices, status: 'active' }
        } else {
          return { maxInvoices: 100, status: 'inactive' }
        }
      }
      
      return { maxInvoices: 100, status: 'inactive' }
    },
    enabled: !!userId,
    refetchInterval: 30000, // Check every 30 seconds for subscription changes
  })
}

// Fetch invoice count
export function useInvoiceCount(userId: string) {
  return useQuery({
    queryKey: ['invoice-count', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('invoice_count')
        .eq('user_id', userId)
        .single()

      if (dbError) throw dbError

      return userData?.invoice_count || 0
    },
    enabled: !!userId,
  })
}


export function useCreateInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (invoiceData: CreateInvoiceData) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (newInvoice, variables) => {
      // refetch invoices and invoice count
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.user_id] })
      queryClient.invalidateQueries({ queryKey: ['invoice-count', variables.user_id] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, user_id, ...updates }: UpdateInvoiceData) => {
      // All updates go directly to invoices table
      const invoiceUpdates = {
        due_date: updates.due_date,
        status: updates.status,
        subtotal: updates.subtotal,
        tax_rate: updates.tax_rate,
        tax_amount: updates.tax_amount,
        total: updates.total,
        notes: updates.notes,
        description: updates.description,
        quantity: updates.quantity,
        unit_price: updates.unit_price,
        invoice_name: updates.invoice_name,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values from updates
      const cleanInvoiceUpdates = Object.fromEntries(
        Object.entries(invoiceUpdates).filter(([_, value]) => value !== undefined)
      );

      // Update invoice table
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(cleanInvoiceUpdates)
        .eq('id', id)
        .eq('user_id', user_id)
        .select()
        .single()
      
      if (invoiceError) throw invoiceError

      return updatedInvoice
    },
    onSettled: (_, __, { user_id }) => {
      // refetch since updated
      queryClient.invalidateQueries({ queryKey: ['invoices', user_id] });
      queryClient.invalidateQueries({queryKey : ['client-stats', user_id]});
    },
  })
}
export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // Delete the invoice (no need to delete invoice_items anymore)
      const { data: deletedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (invoiceError) throw invoiceError

      //Get current invoice_count
      const currentCount: number= queryClient.getQueryData(['invoice-count',userId]) || 0

      // Update invoice count
      await supabase
        .from('users')
        .update({ invoice_count: Math.max(0,currentCount - 1) })
        .eq('user_id', userId)

      return deletedInvoice
    },
    //Descructure variables to get userId
    onSettled: (_, __, { userId }) => {
      // refetch after deletion
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-count', userId] });
      queryClient.invalidateQueries({queryKey : ['client-stats', userId]});
    },
  })
}


export function useSendInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // TODO: Implement email sending logic
      
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, { userId }) => {
      // invalidate and refetch invoices
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] })
    },
  })
}


export function useCanCreateInvoice(userId: string) {
  const { data: subscription } = useUserSubscription(userId)
  const { data: invoiceCount } = useInvoiceCount(userId)

  
  return {
    canCreate: (invoiceCount || 0) < (subscription?.maxInvoices || 100),
    currentCount: invoiceCount || 0,
    maxInvoices: subscription?.maxInvoices || 100,
    subscriptionStatus: subscription?.status || 'Free'
  }
}


