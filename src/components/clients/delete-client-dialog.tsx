'use client'

import { useState } from "react"
import { createClient } from "../../../supabase/client"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Client } from "@/types/client"

interface DeleteClientDialogProps {
  client: Client;
  children: React.ReactNode;
}

export default function DeleteClientDialog({ client, children }: DeleteClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)

    // First check if client has any related time logs or invoices
    const { data: relatedData, error: checkError } = await supabase
      .from('time_logs')
      .select('id')
      .eq('client_id', client.id)
      .limit(1);

    if (checkError) {
      console.error('Error checking for related data:', checkError);
      setLoading(false);
      return;
    }

    // If client has related data, don't allow deletion
    if (relatedData && relatedData.length > 0) {
      alert('Cannot delete client because they have time logs or invoices. Remove those first.');
      setLoading(false);
      setOpen(false);
      return;
    }

    // If no related data, proceed with deletion
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', client.id);

    setLoading(false)

    if (error) {
      console.error('Error deleting client:', error)
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {client.name} and remove all their data from our servers.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Client'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 