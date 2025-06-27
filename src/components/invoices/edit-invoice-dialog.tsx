'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
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

interface EditInvoiceDialogProps {
  children: React.ReactNode
  invoice: any
  onSuccess?: () => void
}

export default function EditInvoiceDialog({ children, invoice, onSuccess }: EditInvoiceDialogProps) {
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

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          due_date: formData.get('due_date'),
          status: formData.get('status'),
          tax_rate: parseFloat(formData.get('tax_rate') as string) || 0,
          total: parseFloat(formData.get('total') as string) || 0,
          notes: formData.get('notes') as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError)
        return
      }

      // Update invoice item name only if it was changed
      const newInvoiceName = formData.get('invoice_name') as string
      if (newInvoiceName && newInvoiceName !== invoice.invoice_items[0]?.invoice_name) {
        const { error: itemError } = await supabase
          .from('invoice_items')
          .update({
            invoice_name: newInvoiceName,
          })
          .eq('invoice_id', invoice.id)
          .eq('id', invoice.invoice_items[0].id)

        if (itemError) {
          console.error('Error updating invoice item:', itemError)
          return
        }
      }

      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error in editInvoice:', error)
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
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update the invoice details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_name">Invoice Name</Label>
            <Input
              id="invoice_name"
              name="invoice_name"
              defaultValue={invoice.invoice_items[0]?.invoice_name}
              placeholder="e.g., Website Development, Gardening Services"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              required
              defaultValue={invoice.due_date}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Amount *</Label>
            <Input
              id="total"
              name="total"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={invoice.total}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" required defaultValue={invoice.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
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
              defaultValue={invoice.tax_rate}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={invoice.notes}
              placeholder="Additional notes or terms"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || clientsLoading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 