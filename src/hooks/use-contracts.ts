import { ReactQueryDevtools} from "@tanstack/react-query-devtools";
import { useQuery,useQueryClient,useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

interface Contract {
    id: string;
    client_id:string;
    user_id:string;
    title:string;
    content:string;
    created_at:string;
    // Joined data (not in DB but added by your code)
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
    client_id?: string;
}

// 1. Fetch contracts with client data
export function useContracts (userId:string) {
    return useQuery({
        queryKey: ['contracts',userId],
        queryFn: async() : Promise<Contract[]> =>{
            if (!userId){
                throw new Error('must include userId')
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
                throw new Error ('error fetching contracts')
            }
            if (!contracts || contracts.length === 0){
                return [];
            }

            // Transform the data to match our interface
            return contracts.map(contract => ({
                ...contract,
                clients: Array.isArray(contract.clients) 
                    ? contract.clients[0] || null  // If array, take first item
                    : contract.clients              // If single object, use as is
            }));
        },
        enabled: !!userId
    })
}

// 2. Fetch user subscription limits (reuse from use-invoices)
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
                return { maxContracts: 0, status: 'free' }
            }
            
            if (subscriptionData) {
                const { stripe_price_id, status, current_period_end, cancel_at_period_end } = subscriptionData;
                
                // Check if subscription is active OR cancelled but still in billing period
                const now = Math.floor(Date.now() / 1000); 
                const hasAccess = status === 'active' || 
                                (status === 'canceled' && cancel_at_period_end && current_period_end > now);
                
                if (hasAccess) {
                    // Map price IDs to contract limits
                    let maxContracts = 0; // free tier 
                    switch (stripe_price_id) {
                        case 'price_1RaQ0KDBPJVWy5Mhrf7REir7':
                            maxContracts = 8; // Expert Freelancer
                            break;
                        case 'price_1RaPzpDBPJVWy5Mh7TS53Heu':
                            maxContracts = 4; // Seasoned Freelancer
                            break;
                        case 'price_1RTCfJDBPJVWy5MhqB5gMwWZ':
                            maxContracts = 2; // New Freelancer
                            break;
                        // Backwards compatibility with prod_id
                        case 'price_1OqYLgDNtZHzJBITKyRoXhOD':
                            maxContracts = 8; // Expert Freelancer
                            break;
                        case 'price_1OqYLFDNtZHzJBITXVYfHbXt':
                            maxContracts = 4; // Seasoned Freelancer
                            break;
                        case 'price_1OqYKgDNtZHzJBITvDLbA6Vz':
                            maxContracts = 2; // New Freelancer
                            break;
                    }
                    return { maxContracts, status: 'active' }
                } else {
                    return { maxContracts: 0, status: 'expired' }
                }
            }
            
            return { maxContracts: 0, status: 'free' }
        },
        enabled: !!userId,
        refetchInterval: 300000,
    })
}


export function useContractCount(userId: string) {
    return useQuery({
        queryKey: ['contract-count', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required')

            const { count, error: dbError } = await supabase
                .from('contracts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)

            if (dbError) throw dbError

            return count || 0
        },
        enabled: !!userId,
    })
}

export function useCreateContract() {
    const queryClient = useQueryClient()
    
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
        }
    })
}

export function useDeleteContract() {
    const queryClient = useQueryClient()
    
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
            // cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['contracts', userId] })
            await queryClient.cancelQueries({ queryKey: ['contract-count', userId] })
            
            // get previous contract data
            const previousContracts = queryClient.getQueryData(['contracts', userId])
            const previousCount = queryClient.getQueryData(['contract-count', userId])
            
            // optimistically update 
            queryClient.setQueryData(['contracts', userId], (old: Contract[] = []) => 
                old.filter(contract => contract.id !== contractId)
            )
            
            // Optimistically update count
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

// 7. Helper function to check if user can create more contracts
export function useCanCreateContract(userId: string) {
    const { data: subscription } = useUserSubscription(userId)
    const { data: contractCount } = useContractCount(userId)
    
    return {
        canCreate: subscription && (contractCount || 0) < (subscription?.maxContracts || 0),
        currentCount: contractCount || 0,
        maxContracts: subscription?.maxContracts || 0,
        subscriptionStatus: subscription?.status || 'free'
    }
}



