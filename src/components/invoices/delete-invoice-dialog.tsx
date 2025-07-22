'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useDeleteInvoice } from '@/hooks/use-invoices'
import { useUser } from '@/hooks/use-user'

interface Invoice {
    id: string
    invoice_number: string
    user_id: string
}

interface DeleteInvoiceDialogProps {
    invoice: Invoice | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteInvoiceDialog({ invoice, open, onOpenChange }: DeleteInvoiceDialogProps) {
    const { toast } = useToast()
    const deleteInvoice = useDeleteInvoice()
    const { data: user } = useUser()

    const handleDelete = async () => {
        if (!invoice || !user) {
            toast({
                title: "Error",
                description: "No invoice selected or user not authenticated",
                variant: "destructive",
            })
            return
        }

        try {
            await deleteInvoice.mutateAsync({
                id: invoice.id,
                userId: user.id,
            })

            toast({
                title: "Success",
                description: "Invoice deleted successfully",
            })

            onOpenChange(false)
        } catch (error) {
            console.error('Error deleting invoice:', error)
            toast({
                title: "Error",
                description: "Failed to delete invoice. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (!invoice) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Invoice</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete invoice #{invoice.invoice_number}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteInvoice.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteInvoice.isPending}
                    >
                        {deleteInvoice.isPending ? 'Deleting...' : 'Delete Invoice'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

