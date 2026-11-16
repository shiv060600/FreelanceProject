'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-browser'
import { useUserAiUsage } from '@/hooks/use-user-ai-usage'
import { getAiDailyLimit } from '@/lib/contracts/limits'

const supabase = createClient()

/** Today's AI-generation allowance for a user: plan, used, limit and remaining. */
export function useAiAllowance(userId: string) {
  const plan = useQuery({
    queryKey: ['user-plan', userId],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('subscription').eq('user_id', userId).maybeSingle()
      return (data?.subscription as string | null) || 'Free'
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
  const { data: used = 0 } = useUserAiUsage(userId)
  const limit = getAiDailyLimit(plan.data)

  return {
    plan: plan.data ?? 'Free',
    used,
    limit,
    remaining: Math.max(0, limit - used),
    loading: plan.isLoading,
  }
}
