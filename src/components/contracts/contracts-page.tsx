'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Pencil, Trash2, Download, AwardIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useToast } from '@/components/ui/use-toast'
import { ContractPDF } from './contract-pdf'
import { PDFDownloadLink } from '@react-pdf/renderer'
// import CreateInvoiceDialog from '../invoices/create-invoice-dialog'
// import { CreateContractDialog } from './create-contract-dialog'
// import { EditContractDialog } from './edit-contract-dialog'
// import { DeleteContractDialog } from './delete-contract-dialog'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [subscription, setSubscription] = useState<string>('Free')
  const [maxContracts, setMaxContracts] = useState<number>(2)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load user first to get userId
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (!user) return
      
      setUser(user)
      setUserId(user.id)
      
      // Get user subscription data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription, max_contracts')
        .eq('user_id', user.id)
        .single()

      if (userData) {
        setSubscription(userData.subscription || 'Free')
        setMaxContracts(userData.max_contracts || 0)
      }

      // Now load other data with the userId
      await Promise.all([
        loadContracts(user.id),
        loadClients(user.id)
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }



  const canCreateContract = contracts.length < maxContracts
  console.log(`can create contract : ${canCreateContract}`)

  const loadContracts = async (userIdParam?: string) => {
    try {
      const userIdToUse = userIdParam || userId
      if (!userIdToUse) return
      
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          title,
          content,
          created_at,
          client_id,
          clients!contracts_client_id_fkey(id, name, email, company)
        `)
        .eq('user_id', userIdToUse)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContracts(data || [])
    } catch (error) {
      console.error('Error loading contracts:', error)
      toast({
        title: "Error loading contracts",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () =>{
    setLoading(true);
    loadContracts();
  }

  const loadClients = async (userIdParam?: string) => {
    try {
      const userIdToUse = userIdParam || userId
      if (!userIdToUse) return
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, company')
        .eq('user_id', userIdToUse)
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleCreateContract = async (contractData: any) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert([{
          ...contractData,
          user_id: userId
        }])
        .select(`
          id,
          title,
          content,
          created_at,
          clients!contracts_client_id_fkey(id, name, email, company)
        `)
        .single()

      if (error) throw error

      setContracts([data, ...contracts])
      setCreateDialogOpen(false)
      toast({
        title: "Contract created",
        description: "Your contract has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating contract:', error)
      toast({
        title: "Error creating contract",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditContract = async (contractData: any) => {
    if (!selectedContract) return

    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({
          title: contractData.title,
          content: contractData.content
        })
        .eq('id', selectedContract.id)
        .select(`
          id,
          title,
          content,
          created_at,
          clients!contracts_client_id_fkey(id, name, email, company)
        `)
        .single()

      if (error) throw error

      setContracts(contracts.map(c => c.id === selectedContract.id ? data : c))
      setEditDialogOpen(false)
      setSelectedContract(null)
      toast({
        title: "Contract updated",
        description: "Your contract has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating contract:', error)
      toast({
        title: "Error updating contract",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContract = async () => {
    if (!selectedContract) return

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', selectedContract.id)

      if (error) throw error

      setContracts(contracts.filter(c => c.id !== selectedContract.id))
      setDeleteDialogOpen(false)
      setSelectedContract(null)
      toast({
        title: "Contract deleted",
        description: "Your contract has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting contract:', error)
      toast({
        title: "Error deleting contract",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">
            Manage your client contracts ({contracts.length}/{maxContracts} used)
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={!canCreateContract}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Contract
        </Button>
      </div>

      {/* Subscription limit warning */}
      {!canCreateContract && subscription === 'Free' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free Plan</Badge>
              <span className="text-sm text-amber-800">
                You've reached your contract limit. Upgrade to create more contracts.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first contract to get started.
            </p>
            {canCreateContract && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contract.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Client: {contract.clients?.[0]?.name || 'Unknown'}
                      {contract.clients?.[0]?.company && ` (${contract.clients[0].company})`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* PDF Download */}
                    {user && (
                      <PDFDownloadLink
                        document={
                          <ContractPDF
                            contract={contract}
                            userName={user.user_metadata?.full_name || user.email || 'Unknown User'}
                            userEmail={user.email || ''}
                          />
                        }
                        fileName={`contract-${contract.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${contract.id.slice(0, 8)}.pdf`}
                      >
                        {({ loading }) => (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loading}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContract(contract)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContract(contract)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground max-h-20 overflow-hidden">
                  {contract.content ? (
                    <pre className="whitespace-pre-wrap font-sans">
                      {contract.content.length > 200 
                        ? `${contract.content.substring(0, 200)}...` 
                        : contract.content}
                    </pre>
                  ) : (
                    <em>No content</em>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TODO: Add dialogs when components are ready */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create Contract</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateContract({
                title: formData.get('title'),
                content: formData.get('content'),
                client_id: formData.get('client_id')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Contract title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <select name="client_id" required className="w-full border rounded-md px-3 py-2">
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  rows={10}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Contract content..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Contract</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {editDialogOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Edit Contract</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleEditContract({
                title: formData.get('title'),
                content: formData.get('content')
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={selectedContract.title}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Contract title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  rows={10}
                  defaultValue={selectedContract.content}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Contract content..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false)
                    setSelectedContract(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Contract</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {deleteDialogOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Contract</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedContract.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setSelectedContract(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteContract}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
