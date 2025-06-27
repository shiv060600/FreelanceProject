'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../supabase/client'

interface UserInfo {
  name?: string
  email?: string
  address?: string
}

export function useInvoicePDF() {
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserInfo()
  }, [])

  async function fetchUserInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // For now, we'll use basic user info
      // You can extend this to fetch from a user_profiles table if you have one
      setUserInfo({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Your Company',
        email: user.email || 'your@email.com',
        address: 'Your Business Address' // You can make this configurable later
      })
    } catch (error) {
      console.error('Error fetching user info:', error)
    } finally {
      setLoading(false)
    }
  }

  return { userInfo, loading }
} 