'use client'

import { useState } from "react"
import { createClient } from "../../../supabase/client"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClients } from "@/hooks/use-clients"

interface CreateInvoiceDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export default function CreateInvoiceDialog({ children, onSuccess }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { clients, loading: clientsLoading } = useClients()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/sign-in')
        return
      }

      // Calculate amounts
      const quantity = parseFloat(formData.get('quantity') as string) || 1
      const unitPrice = parseFloat(formData.get('unit_price') as string) || 0
      const taxRate = parseFloat(formData.get('tax_rate') as string) || 0
      
      const subtotal = quantity * unitPrice
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      // Create new invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: `INV-${Date.now()}`,
          issue_date: formData.get('issue_date'),
          due_date: formData.get('due_date'),
          status: 'draft',
          subtotal: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total: total,
          notes: formData.get('notes') as string,
          client_id: formData.get('client_id') as string
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invoice:', error)
        return
      }

      // Create initial invoice item with the pricing details
      if (newInvoice) {
        const { error: itemError } = await supabase
          .from('invoice_items')
          .insert({
            invoice_id: newInvoice.id,
            description: formData.get('invoice_name') as string,
            quantity: quantity,
            unit_price: unitPrice,
            amount: subtotal,
            invoice_name: formData.get('invoice_name') as string
          })

        if (itemError) {
          console.error('Error creating invoice item:', itemError)
          return
        }
      }

      // Update invoice count
      const { data: userData } = await supabase
        .from('users')
        .select('invoice_count')
        .eq('id', user.id)
        .single()

      if (userData) {
        await supabase
          .from('users')
          .update({ invoice_count: (userData.invoice_count || 0) + 1 })
          .eq('id', user.id)
      }

      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error in createInvoice:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the invoice details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_name">Invoice Name *</Label>
            <Input
              id="invoice_name"
              name="invoice_name"
              required
              placeholder="e.g., Website Development, Gardening Services"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                required
                defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select name="client_id" required disabled={clientsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="1.00"
                defaultValue="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price ($) *</Label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="100.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
            <Input
              id="tax_rate"
              name="tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              defaultValue="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes or terms"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || clientsLoading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 