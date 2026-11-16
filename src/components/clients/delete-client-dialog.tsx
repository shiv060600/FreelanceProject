'use client'

import { useState } from "react"
import { createClient } from "../../../supabase/client"
import { useRouter } from "next/navigation"
import { useDeleteClient } from "@/hooks/use-clients"
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
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DeleteClientDialog({ client, children, open: controlledOpen, onOpenChange }: DeleteClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  // Controlled when `open` is passed (one dialog per page); otherwise self-managed with `children` as trigger.
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const deleteClientMutation = useDeleteClient({clientId:client.id,userId:client.user_id as any})

  async function handleDelete() {
    setLoading(true)
    deleteClientMutation.mutate(undefined,{
      onSuccess: () => {
        setLoading(false)
        setOpen(false)
        router.refresh()
      },
      onError: () => {
        setLoading(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {children && (
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
      )}
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
            disabled={loading || deleteClientMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading || deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 