import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-browser'

const supabase = createClient()

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    },
    staleTime: Infinity, // User data doesn't change often
  })
} 