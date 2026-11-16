import { useQuery } from "@tanstack/react-query";
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

// Usage is incremented server-side by /api/ai-contract-generate. Do not increment from the browser.
