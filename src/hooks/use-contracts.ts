import { ReactQueryDevtools} from "@tanstack/react-query-devtools";
import { useQuery,useQueryClient,useMutation } from "@tanstack/react-query";
import { createClient } from "../../supabase/client";

const supabase = createClient();

interface Contract {
    id: string;
    client_id:string;
    user_id:string;
    title:string;
    content:string;
    created_at:string;
    // Joined data (not in DB but added)
    clients?: {
      id: string;
      name: string;
      email: string;
      company: string;
    } | null;
}

interface CreateContractData {
    user_id: string;
    client_id: string;
    title: string;
    content: string;
}

interface UpdateContractData {
    id: string;
    user_id: string;
    title?: string;
    content?: string;
    client_id: string;
}

// 1. Fetch contracts with client data
export function useContracts (userId:string) {
    return useQuery({
        queryKey: ['contracts',userId],
        queryFn: async() : Promise<Contract[]> =>{
            if (!userId){
                throw new Error('User ID required')
            }

            const {data : contracts ,error :contractsError} = await supabase
            .from('contracts')
            .select(`
                id,
                client_id,
                user_id,
                title,
                content,
                created_at,
                clients!contracts_client_id_fkey(id, name, email, company)
            `)
            .eq('user_id',userId)
            .order('created_at', { ascending: false })

            if (contractsError){
                console.error('Error fetching contracts:', contractsError);
                throw new Error(`Error fetching contracts: ${contractsError.message}`)
            }

            // Transform the data to match our interface
            return contracts?.map(contract => ({
                ...contract,
                clients: Array.isArray(contract.clients) 
                    ? contract.clients[0] || null  // If array, take first item
                    : contract.clients              // If single object, use as is
            })) || [];
        },
        enabled: !!userId
    })
}

export function useUserSubscription(userId: string) {
    return useQuery({
        queryKey: ['user-subscription', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required')

            // Check for Stripe subscription - if none found, default to free tier
            // Only get subscriptions with stripe_price_id (Stripe subscriptions, not free ones)
            const { data: allSubscriptions, error: dbError } = await supabase
                .from('subscriptions')
                .select('stripe_price_id, status, current_period_end, cancel_at_period_end, stripe_id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            // If error, default to free tier
            if (dbError) {
                return { maxContracts: 100, maxInvoices: 100, status: 'free' }
            }

            // Find Stripe subscription (has stripe_price_id and doesn't start with 'free_')
            const subscriptionData = allSubscriptions?.find(sub => 
                sub.stripe_price_id && sub.stripe_id && !sub.stripe_id.startsWith('free_')
            ) || null;

            // If no Stripe subscription found, default to free tier
            if (!subscriptionData) {
                return { maxContracts: 100, maxInvoices: 100, status: 'free' }
            }
            
            const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
            
            // Check if Stripe subscription is active OR cancelled but still in billing period
            const now = Math.floor(Date.now() / 1000); 
            const hasAccess = status === 'active' || 
                            (status === 'canceled' && cancel_at_period_end && current_period_end > now);
            
            if (!hasAccess) {
                // Subscription expired, return free tier
                return { maxContracts: 100, maxInvoices: 100, status: 'free' }
            }
            
            // Map price IDs to plan limits
            switch (stripe_price_id) {
                case 'price_1Ri13NDuVswTohZkIWvJp0x9':
                    return { maxContracts: 999999, maxInvoices: 999999, status: 'active' }; // Unlimited Freelancer
                case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
                    return { maxContracts: 999999, maxInvoices: 999999, status: 'active' }; // Legacy → Unlimited Freelancer
                // Backwards compatibility with legacy price IDs - all now map to Unlimited
                case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
                case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
                case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
                case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
                case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
                    return { maxContracts: 999999, maxInvoices: 999999, status: 'active' }; // Legacy → Unlimited
                default:
                    // Unknown price ID, default to free tier
                    return { maxContracts: 100, maxInvoices: 100, status: 'free' }
            }
        },
        enabled: !!userId,
        refetchInterval: 30000,
    })
}


export function useContractCount(userId: string) {
    return useQuery({
        queryKey: ['contract-count', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('User ID required')
            }

            const { count, error: dbError } = await supabase
                .from('contracts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)

            if (dbError) {
                console.error('Error fetching contract count:', dbError)
                throw dbError
            }

            return count || 0
        },
        enabled: !!userId,
    })
}

export function useCreateContract() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (contractData: CreateContractData) => {
            const { data, error } = await supabase
                .from('contracts')
                .insert(contractData)
                .select(`
                    id,
                    client_id,
                    user_id,
                    title,
                    content,
                    created_at,
                    clients!contracts_client_id_fkey(id, name, email, company)
                `)
                .single()
            
            if (error) throw error
            return data
        },
        onSuccess: (newContract, variables) => {
            // refresh data onSucces
            queryClient.invalidateQueries({ queryKey: ['contracts', variables.user_id] })
            queryClient.invalidateQueries({ queryKey: ['contract-count', variables.user_id] })
        },
        onError: () => {
            throw new Error('error creating contract')
        }
    })
}

export function useEditContract() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async({ id, ...updates }: UpdateContractData) => {
            const {data : updatedContract, error:updateContractError} = await supabase
            .from('contracts')
            .update(updates)
            .eq('id',id)
            .select(`
                id,
                client_id,
                user_id,
                title,
                content,
                created_at,
                clients!contracts_client_id_fkey(id, name, email, company)
            `)
            .single()

            if (updateContractError) {
                throw new Error('failed to update contract')
            }
            return updatedContract
        },
        onSuccess : (updatedContract) =>{
            queryClient.invalidateQueries({ queryKey: ['contracts', updatedContract.user_id] })
        },
        onError : () => {
            throw new Error('error editing contract in use-contracts hook')
        }
    })
}

export function useDeleteContract() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ contractId, userId }: { contractId: string; userId: string }) => {
            const { data: deletedContract, error: contractError } = await supabase
                .from('contracts')
                .delete()
                .eq('id', contractId)
                .eq('user_id', userId)

            if (contractError) throw contractError

            return deletedContract
        },
        onMutate: async ({ contractId, userId }) => {
            await queryClient.cancelQueries({ queryKey: ['contracts', userId] })
            await queryClient.cancelQueries({ queryKey: ['contract-count', userId] })
            
            const previousContracts = queryClient.getQueryData(['contracts', userId])
            const previousCount = queryClient.getQueryData(['contract-count', userId])
            
            // optimistically update 
            queryClient.setQueryData(['contracts', userId], (old: Contract[] = []) => 
                old.filter(contract => contract.id !== contractId)
            )
            
            // optimistically update count
            queryClient.setQueryData(['contract-count', userId], (old: number = 0) => 
                Math.max(0, old - 1)
            )
            
            return { previousContracts, previousCount }
        },
        onError: (err, { userId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousContracts) {
                queryClient.setQueryData(['contracts', userId], context.previousContracts)
            }
            if (context?.previousCount) {
                queryClient.setQueryData(['contract-count', userId], context.previousCount)
            }
        },
        onSettled: (_, __, { userId }) => {
            // Always refetch after error or success to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['contracts', userId] })
            queryClient.invalidateQueries({ queryKey: ['contract-count', userId] })
        },
    })
}

export function useCanCreateContract(userId: string) {
    const { data: subscription } = useUserSubscription(userId)
    const { data: contractCount } = useContractCount(userId)
    
    // Default to free tier limits if no subscription data
    const maxContracts = subscription?.maxContracts || 100
    const currentCount = contractCount || 0
    
    return {
        canCreate: currentCount < maxContracts,
        currentCount,
        maxContracts,
        subscriptionStatus: subscription?.status || 'free'
    }
}





