'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useEditContract } from '@/hooks/use-contracts'
import { useClients } from '@/hooks/use-clients'

interface Contract {
    id: string
    title: string
    content: string
    client_id: string
    user_id: string
}

interface EditContractDialogProps {
    contract: Contract | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditContractDialog({ contract, open, onOpenChange }: EditContractDialogProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [clientId, setClientId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const { toast } = useToast()
    const { clients = [] } = useClients()
    const editContract = useEditContract()

    // Update form when contract changes
    useEffect(() => {
        if (contract) {
            setTitle(contract.title)
            setContent(contract.content)
            setClientId(contract.client_id)
        }
    }, [contract])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!contract) {
            toast({
                title: "Error",
                description: "No contract selected",
                variant: "destructive",
            })
            return
        }

        if (!title.trim() || !content.trim() || !clientId) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            await editContract.mutateAsync({
                id: contract.id,
                user_id: contract.user_id,
                title: title.trim(),
                content: content.trim(),
                client_id: clientId,
            })

            toast({
                title: "Success",
                description: "Contract updated successfully",
            })

            onOpenChange(false)
        } catch (error) {
            console.error('Error updating contract:', error)
            toast({
                title: "Error",
                description: "Failed to update contract. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!contract) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Contract</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Contract Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter contract title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="client">Client</Label>
                        <Select value={clientId} onValueChange={setClientId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name} {client.company && `(${client.company})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Contract Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter contract content..."
                            rows={10}
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Contract'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 