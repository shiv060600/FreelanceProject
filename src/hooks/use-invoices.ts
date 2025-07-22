import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";
import { createClient} from "@/lib/supabase-browser";

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
    //added from db query
    clients?: {
      id: string;
      name: string;
    } | null; 
    //same
    invoice_items?: Array<{
      id: string;
      invoice_id: string;
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
      invoice_name?: string;
    }>;
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
  }
  
  interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
    id: string;
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
            .select('id, user_id, invoice_number, client_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes, status, created_at, updated_at')
            .eq('user_id',userId)
            .order('created_at',{ascending:false});

            if (invoiceError) {
                throw invoiceError; // Let React Query handle the error
            }
            if(!invoicesData || invoicesData.length === 0){
                return [];
            }

            const clientIds = Array.from(new Set(invoicesData.map(item => item.client_id).filter(Boolean)))
            const invoiceIds = invoicesData.map(item => item.id)

            const [clientsResponse, itemsResponse] = await Promise.all([
                clientIds.length > 0 ? supabase
                .from('clients')
                .select('id,name')
                .in('id',clientIds) : Promise.resolve({ data: [], error: null }),

                supabase
                    .from('invoice_items')
                    .select('invoice_id,id,invoice_name,description,quantity,unit_price,amount')
                    .in('invoice_id',invoiceIds)
            ]);

            if (clientsResponse.error) {
                console.error('Error fetching clients:', clientsResponse.error)
              }
              
            if (itemsResponse.error) {
                console.error('Error fetching invoice items:', itemsResponse.error)
              }

            const clientsMap = new Map(clientsResponse.data?.map(client => [client.id,client]) || [])
            const itemsMap = new Map()

            itemsResponse.data?.forEach(item => {
                if(!itemsMap.has(item.invoice_id)){
                    itemsMap.set(item.invoice_id,[])
                }
                itemsMap.get(item.invoice_id).push(item)
            });

            const enrichedInvoices: Invoice[] = invoicesData.map(invoice => ({
                ...invoice,
                clients: clientsMap.get(invoice.client_id) || null,
                invoice_items: itemsMap.get(invoice.id) || []
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
        .single()

      if (dbError) {
        // No active subscription found
        return { maxInvoices: 2, status: 'free' }
      }
      
      if (subscriptionData) {
        const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
        
        // Check if subscription is active OR cancelled but still in billing period
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const hasAccess = status === 'active' || 
                         (status === 'canceled' && cancel_at_period_end && current_period_end > now);
        
        if (hasAccess) {
          // Map price IDs to invoice limits
          let maxInvoices = 2; // Default to free tier
          switch (stripe_price_id) {
            case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
              maxInvoices = 40; // Expert Freelancer
              break;
            case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
              maxInvoices = 20; // Seasoned Freelancer
              break;
            case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
              maxInvoices = 10; // New Freelancer
              break;
            // Legacy price IDs (keep for backwards compatibility)
            case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
              maxInvoices = 40; // Expert Freelancer
              break;
            case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
              maxInvoices = 20; // Seasoned Freelancer
              break;
            case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
              maxInvoices = 10; // New Freelancer
              break;
          }
          return { maxInvoices, status: 'active' }
        } else {
          return { maxInvoices: 2, status: 'expired' }
        }
      }
      
      return { maxInvoices: 2, status: 'free' }
    },
    enabled: !!userId,
    refetchInterval: 30000, // Check every 30 seconds for subscription changes
  })
}

// 3. Fetch invoice count
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
    mutationFn: async ({ id, ...updates }: UpdateInvoiceData) => {
      const { data: updatedInvoice, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return updatedInvoice
    },
    onMutate: async ({ id, ...updates }) => {
      const userId = updates.user_id
      
      await queryClient.cancelQueries({ queryKey: ['invoices', userId] })
      
      // Snapshot the previous value
      const previousInvoices = queryClient.getQueryData(['invoices', userId])
      
      // Optimistically update the invoice
      queryClient.setQueryData(['invoices', userId], (old: Invoice[] = []) => 
        old.map(invoice => 
          invoice.id === id 
            ? { ...invoice, ...updates, updated_at: new Date().toISOString() }
            : invoice
        )
      )
      
      // Return context with the snapshotted value
      return { previousInvoices }
    },
    onError: (err, { id }, context) => {
      // use the prevInovoice data returned from onMutate to roll back
      if (context?.previousInvoices) {
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
      }
    },
    onSettled: (_, __, { id }) => {
      // refetch since updated
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // First, delete all invoice items for this invoice
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)

      if (itemsError) throw itemsError

      // Then, delete the invoice
      const { data: deletedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (invoiceError) throw invoiceError

      // Update invoice count
      await supabase
        .from('users')
        .update({ invoice_count: (await supabase
          .from('users')
          .select('invoice_count')
          .eq('user_id', userId)
          .single()).data?.invoice_count - 1 })
        .eq('user_id', userId)

      return deletedInvoice
    },
    onMutate: async ({ id, userId }) => {
      // stop any outgoing refetches 
      await queryClient.cancelQueries({ queryKey: ['invoices', userId] })
      await queryClient.cancelQueries({ queryKey: ['invoice-count', userId] })
      
      // save current data
      const previousInvoices = queryClient.getQueryData(['invoices', userId])
      const previousCount = queryClient.getQueryData(['invoice-count', userId])
      
      // optimistically update invoices
      queryClient.setQueryData(['invoices', userId], (old: Invoice[] = []) => 
        old.filter(invoice => invoice.id !== id)
      )
      
      // optimistically update count
      queryClient.setQueryData(['invoice-count', userId], (old: number = 0) => 
        Math.max(0, old - 1)
      )
      
      //  context with the snapshotted values
      return { previousInvoices, previousCount }
    },
    onError: (err, { userId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInvoices) {
        queryClient.setQueryData(['invoices', userId], context.previousInvoices)
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['invoice-count', userId], context.previousCount)
      }
    },
    onSettled: (_, __, { userId }) => {
      // refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] })
      queryClient.invalidateQueries({ queryKey: ['invoice-count', userId] })
    },
  })
}


export function useSendInvoice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // TODO: Implement email sending logic
      console.log('Sending invoice:', id)
      
      // For now, just update the status to 'sent'
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
    canCreate: (invoiceCount || 0) < (subscription?.maxInvoices || 2),
    currentCount: invoiceCount || 0,
    maxInvoices: subscription?.maxInvoices || 2,
    subscriptionStatus: subscription?.status || 'free'
  }
}


