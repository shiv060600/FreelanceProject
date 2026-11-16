import { redirect } from 'next/navigation'
import { createClient } from '../../../../supabase/server'
import ClientsPage from '@/components/clients/clients-page'

export default async function Clients() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientsPage />
    </div>
  )
}
