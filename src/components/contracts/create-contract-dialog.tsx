'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Info, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useCreateContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-user'
import { useClients } from '@/hooks/use-clients'
import { Stars } from 'lucide-react'
import { Switch } from '../ui/switch'
import { getPromptGuide } from './contract-prompt-guides'



interface CreateContractDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateContractDialog({ open, onOpenChange }: CreateContractDialogProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [clientId, setClientId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [regularContract,setRegularContract] = useState(true);
    const [contractType,setContractType] = useState<string>('freelance-service-agreement')
    const [showPromptGuide, setShowPromptGuide] = useState(false)
    
    const { toast } = useToast()
    const { data: user } = useUser()
    const createContract = useCreateContract()
    const { data: clients = [], isLoading: clientsLoading } = useClients(user?.id || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!user?.id) {
            toast({
                title: "Error",
                description: "User not authenticated",
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
            await createContract.mutateAsync({
                user_id: user.id,
                client_id: clientId,
                title: title.trim(),
                content: content.trim(), // Store plain text
            })

            toast({
                title: "Success",
                description: "Contract created successfully",
            })

            
            setTitle('')
            setContent('')
            setClientId('')
            onOpenChange(false)
        } catch (error) {
            console.error('Error creating contract:', error)
            toast({
                title: "Error",
                description: "Failed to create contract. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAiGenerate = async(e : React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.id){
            toast({
                title: "Error",
                description: "User not authenticated",
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

    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] mx-auto max-h-[90vh] overflow-y-auto">
                <div className='flex justify-between'>
                    <DialogHeader>
                        
                        <DialogTitle>Create New Contract</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new contract for your client.
                        </DialogDescription>
                        
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            checked={regularContract} 
                            onCheckedChange={setRegularContract}
                        />
                        <Stars className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                            {regularContract ? 'Manual' : 'AI'}
                        </span>
                    </div>
                </div>
                
                <form onSubmit={regularContract? handleSubmit : handleAiGenerate} className="space-y-4">
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
                        <Select value={clientId} onValueChange={setClientId} required disabled={clientsLoading || clients.length===0}>
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
                                {!clientsLoading && clients.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}{client.company ? ` (${client.company})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {!regularContract && 
                    <div className='space-y-2'>
                        <Label> Contract Type </Label>
                        <Select value={contractType} onValueChange={setContractType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectItem value="freelance-service-agreement">
                                    Freelance Service Agreement
                                </SelectItem>
                                <SelectItem value="employment-contract">
                                    Employment Contract
                                </SelectItem>
                                <SelectItem value="rental-lease-agreement">
                                    Rental/Lease Agreement
                                </SelectItem>
                                <SelectItem value="service-provider-contract">
                                    Service Provider Contract
                                </SelectItem>
                                
                                {/* Tier 2 - Business-Focused */}
                                <SelectItem value="non-disclosure-agreement">
                                    Non-Disclosure Agreement (NDA)
                                </SelectItem>
                                <SelectItem value="partnership-agreement">
                                    Partnership Agreement
                                </SelectItem>
                                <SelectItem value="sales-contract">
                                    Sales Contract
                                </SelectItem>
                                <SelectItem value="consulting-agreement">
                                    Consulting Agreement
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>}
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="content">{regularContract? 'Contract Content' : 'Prompt To Create Contract'}</Label>
                            {!regularContract && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPromptGuide(true)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Info className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={regularContract? "Enter contract content..." : "Enter prompt for AI generate"}
                            className="min-h-[300px] font-mono text-sm"
                            style={{ whiteSpace: 'pre-wrap' }}
                        />
                        { regularContract &&
                        <p className="text-xs text-muted-foreground">
                            Use line breaks and spacing as needed. Formatting will be preserved in the PDF.
                        </p>
                        }
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
                            {regularContract? 'Create Contract' : 'Generate With AI'}
                        </Button>
                    </div>
                </form>

                {/* Prompt Guide Popup */}
                {showPromptGuide && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto m-4 shadow-lg border">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold">
                                    Prompt Guide: {getPromptGuide(contractType).title}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPromptGuide(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 whitespace-pre-line">
                                    {getPromptGuide(contractType).prompt}
                                </div>
                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={() => setShowPromptGuide(false)}
                                        className="w-full"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
} 
