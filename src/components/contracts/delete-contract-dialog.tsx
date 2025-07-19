'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useDeleteContract } from '@/hooks/use-contracts'

interface Contract {
    id: string
    title: string
    user_id: string
}

interface DeleteContractDialogProps {
    contract: Contract | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteContractDialog({ contract, open, onOpenChange }: DeleteContractDialogProps) {
    const { toast } = useToast()
    const deleteContract = useDeleteContract()

    const handleDelete = async () => {
        if (!contract) {
            toast({
                title: "Error",
                description: "No contract selected",
                variant: "destructive",
            })
            return
        }

        try {
            await deleteContract.mutateAsync({
                contractId: contract.id,
                userId: contract.user_id,
            })

            toast({
                title: "Success",
                description: "Contract deleted successfully",
            })

            onOpenChange(false)
        } catch (error) {
            console.error('Error deleting contract:', error)
            toast({
                title: "Error",
                description: "Failed to delete contract. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (!contract) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Contract</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{contract.title}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteContract.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteContract.isPending}
                    >
                        {deleteContract.isPending ? 'Deleting...' : 'Delete Contract'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 