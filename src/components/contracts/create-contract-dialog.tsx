'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Info, X, Loader2, Bot, FileText, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useCreateContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-user'
import { useClients } from '@/hooks/use-clients'
import { Stars } from 'lucide-react'
import { Switch } from '../ui/switch'
import { getPromptGuide } from './contract-prompt-guides'
import { useAiContractGenerate } from '@/hooks/use-ai-contract-generate'



interface CreateContractDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateContractDialog({ open, onOpenChange }: CreateContractDialogProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [clientId, setClientId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contractMode, setContractMode] = useState<'ai-prompt' | 'manual'>('manual');
    const [contractType, setContractType] = useState<string>('freelance-service-agreement')
    const [showPromptGuide, setShowPromptGuide] = useState(false)
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
    
    const { toast } = useToast()
    const { data: user } = useUser()
    const createContract = useCreateContract()
    const { data: clients = [], isLoading: clientsLoading } = useClients(user?.id || '')
    const { generateAiContract, loading: aiLoading, error: aiError } = useAiContractGenerate()

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
                content: content
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

    const handleAiGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.id) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            });
            return;
        }

        if (!title.trim() || !content.trim() || !clientId) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const selectedClient = clients.find(c => c.id === clientId);
            const generatedContract = await generateAiContract({
                title: title.trim(),
                contractType,
                prompt: content.trim(),
                clientName: selectedClient?.name || '',
            });

            // Set the generated contract as content and switch to manual mode
            setContent(generatedContract);
            setContractMode('manual');
            
            toast({
                title: "Success",
                description: "Contract generated successfully! Review and save when ready.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: aiError || "Failed to generate contract",
                variant: "destructive",
            });
        }
    };

    const handleModeSwitch = (toAiMode: boolean) => {
        if (toAiMode) {
            // Switching to AI mode
            if (content.trim() && contractMode !== 'ai-prompt') {
                // Show confirmation if there's content that will be wiped
                setShowSwitchConfirm(true);
            } else {
                setContractMode('ai-prompt');
            }
        } else {
            // Switching to manual mode
            setContractMode('manual');
        }
    };

    const confirmSwitchToAi = () => {
        setContractMode('ai-prompt');
        setContent('');
        setShowSwitchConfirm(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <DialogTitle>
                                    {contractMode === 'ai-prompt' ? 'Generate AI Contract' : 'Create New Contract'}
                                </DialogTitle>
                                
                                {/* Mode Toggle */}
                                <div className="flex items-center gap-2 ml-auto">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        Manual
                                    </div>
                                    <Switch
                                        checked={contractMode === 'ai-prompt'}
                                        onCheckedChange={(checked) => handleModeSwitch(checked)}
                                        disabled={aiLoading || isSubmitting}
                                    />
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mr-5">
                                        <Bot className="h-4 w-4" />
                                        AI
                                    </div>
                                </div>
                            </div>
                            <DialogDescription>
                                {contractMode === 'ai-prompt' ? 'Provide details to generate a professional contract with AI' :
                                 'Fill out the form below to create a new contract for your client.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                <form onSubmit={contractMode === 'ai-prompt' ? handleAiGenerate : handleSubmit} className="space-y-4">
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
                    {contractMode === 'ai-prompt' && 
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
                            <Label htmlFor="content">
                                {contractMode === 'ai-prompt' ? 'Prompt To Create Contract' : 'Contract Content'}
                            </Label>
                            {contractMode === 'ai-prompt' && (
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
                            placeholder={contractMode === 'ai-prompt' ? "Enter prompt for AI to generate contract..." : "Enter contract content..."}
                            className="min-h-[300px] font-mono text-sm"
                            style={{ whiteSpace: 'pre-wrap' }}
                            disabled={aiLoading}
                        />
                        {contractMode !== 'ai-prompt' && (
                            <p className="text-xs text-muted-foreground">
                                Use line breaks and spacing as needed. Formatting will be preserved in the PDF.
                            </p>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting || aiLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={aiLoading || (!title || !contractType || !content)}
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                contractMode === 'ai-prompt' ? 'Generate With AI' : 'Create Contract'
                            )}
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

                {/* Switch Mode Confirmation Dialog */}
                {showSwitchConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                        <div className="bg-white rounded-lg p-6 max-w-md m-4 shadow-xl border">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Switch to AI Mode?
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Switching to AI mode will clear your current contract content. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSwitchConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmSwitchToAi}
                                >
                                    Clear & Switch
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
} 
