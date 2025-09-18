import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../supabase/client";

const supabase = createClient();

// Hook to get current AI usage 
export function useUserAiUsage(userId: string) {
    return useQuery({
        queryKey: ['user-ai-usage', userId],
        queryFn: async () => {
            const { data: usage, error } = await supabase
                .from('user_usage')
                .select('ai_uses')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching AI usage:', error);
                return 0; // Default to 0 if no record exists yet
            }

            return usage?.ai_uses || 0;
        },
        enabled: !!userId,
    });
}

// increment AI usage 
export function useIncrementAiUsage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const { data: newUsage, error } = await supabase.rpc('handle_ai_usage', {
                user_id_param: userId
            });

            if (error) {
                throw error;
            }

            return newUsage;
        },
        onSuccess: (newUsage, userId) => {
            // Update the cache with the new usage value
            queryClient.setQueryData(['user-ai-usage', userId], newUsage);
        },
    });
}
