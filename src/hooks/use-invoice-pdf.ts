'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../supabase/client'

interface UserInfo {
  name?: string
  email?: string
  address?: string
  venmo_username?:string
  cashapp_username?:string
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
      const { data: userNameInfo, error: userNameInfoError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id',user?.id)
      .single()
      if (!user || userNameInfoError) return
      

      setUserInfo({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Your Company',
        email: user.email || 'your@email.com',
        address: 'Your Business Address',
        cashapp_username : userNameInfo.cash_app_username,
        venmo_username: userNameInfo.venmo_username
      })
    } catch (error) {
      console.error('Error fetching user info:', error)
    } finally {
      setLoading(false)
    }
  }

  return { userInfo, loading }
} 