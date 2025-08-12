'use client'

import { useState } from "react"
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
import { useUser } from "@/hooks/use-user"

interface CreateInvoiceDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export default function CreateInvoiceDialog({ children, onSuccess }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [taxRate, setTaxRate] = useState('');
  const router = useRouter()
  const supabase = createClient()
  const { data: user } = useUser()
  const { data: clients = [], isLoading: clientsLoading } = useClients(user?.id || '')

  // Calculate subtotal and total in real-time
  const subtotal = quantity * (parseFloat(unitPrice) || 0)
  const taxAmount = subtotal * ((parseFloat(taxRate)||0)/ 100)
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

      // Use state values for calculations
      const finalSubtotal = quantity * (parseFloat(unitPrice) || 0)
      const finalTaxAmount = finalSubtotal * ((parseFloat(taxRate)||0)/ 100)
      const finalTotal = finalSubtotal + finalTaxAmount

      console.log('quantity',quantity);
      console.log('unitPrice',unitPrice);
      console.log('taxrate',taxRate);
      console.log('taxamount',finalTaxAmount);

      // Create new invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: `INV-${Date.now()}`,
          issue_date: formData.get('issue_date'),
          due_date: formData.get('due_date'),
          status: 'draft',
          subtotal: finalSubtotal,
          tax_rate: taxRate,
          tax_amount: finalTaxAmount,
          total: finalTotal,
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
            unit_price: parseFloat(unitPrice) || 0,
            total: finalSubtotal,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the invoice details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pb-6">
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
            <Select name="client_id" required disabled={clientsLoading || clients.length===0}>
              <SelectTrigger>
                <SelectValue placeholder={clientsLoading ? 'Loading clients...' : (clients.length ? 'Select a client' : 'No clients available')} />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading && (
                  <SelectItem disabled value="loading">Loading...</SelectItem>
                )}
                {!clientsLoading && clients.length === 0 && (
                  <SelectItem disabled value="none">No clients found</SelectItem>
                )}
                {!clientsLoading && clients.map((client:any) => (
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
              onChange={(e) => setTaxRate(e.target.value || '')}
              placeholder="0.00"
            />
          </div>

          {/* Display calculated amounts */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {(parseFloat(taxRate)||0) > 0 && (
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