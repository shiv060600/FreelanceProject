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
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [taxRate, setTaxRate] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const { clients, loading: clientsLoading } = useClients()

  // Initialize form with current invoice data
  useEffect(() => {
    if (invoice && invoice.invoice_items?.[0]) {
      const item = invoice.invoice_items[0]
      setQuantity(item.quantity || 1)
      setUnitPrice(item.unit_price ? item.unit_price.toString() : '')
      setTaxRate(invoice.tax_rate || 0)
    }
  }, [invoice])

  // Calculate subtotal and total
  const subtotal = quantity * (parseFloat(unitPrice) || 0);
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

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
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total: total,
          subtotal: subtotal,
          notes: formData.get('notes') as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError)
        return
      }

      // Update invoice item with new pricing details
      const newInvoiceName = formData.get('invoice_name') as string
      if (invoice.invoice_items?.[0]) {
        const { error: itemError } = await supabase
          .from('invoice_items')
          .update({
            description: newInvoiceName,
            quantity: quantity,
            unit_price: parseFloat(unitPrice) || 0,
            total: subtotal,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update the invoice details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="invoice_name">Invoice Name</Label>
            <Input
              id="invoice_name"
              name="invoice_name"
              defaultValue={invoice.invoice_items?.[0]?.invoice_name}
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
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder="1.00"
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
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
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
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          {/* Display calculated amounts */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Tax ({taxRate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
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