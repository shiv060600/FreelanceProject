'use client'

import { useState } from "react"
import { createClient } from "../../../supabase/client"
import { useRouter } from "next/navigation"
import { useEditClient } from "@/hooks/use-clients"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Client } from "@/types/client"

interface EditClientDialogProps {
  client: Client;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditClientDialog({ client, children, open: controlledOpen, onOpenChange }: EditClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  // Controlled when `open` is passed (one dialog per page); otherwise self-managed with `children` as trigger.
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const editClientMutation = useEditClient({clientId:client.id,userId:client.user_id as any})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const name = (formData.get('name') as string) || ''
    const email = (formData.get('email') as string) || ''
    const phone = (formData.get('phone') as string) || ''
    const company = (formData.get('company') as string) || ''
    const address = (formData.get('address') as string) || ''
    const notes = (formData.get('notes') as string) || ''
    editClientMutation.mutate({ name,email,phone,company,address,notes },{
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
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update client information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={client.name} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={client.email || ''} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={client.phone || ''} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={client.company || ''} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={client.address || ''} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={client.notes || ''} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || editClientMutation.isPending}>
              {loading || editClientMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 