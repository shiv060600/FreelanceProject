'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Pencil, Trash2, Download, AwardIcon, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ContractPDF } from './contract-pdf'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CreateContractDialog } from './create-contract-dialog'
import { EditContractDialog } from './edit-contract-dialog'
import { DeleteContractDialog } from './delete-contract-dialog'
import { useContracts, useCanCreateContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-user'

export default function ContractsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any | null>(null)
  const { toast } = useToast();
  
  const { data: user } = useUser()
  const { data: contracts = [], isLoading } = useContracts(user?.id || '')
  const { canCreate, currentCount, maxContracts, subscriptionStatus } = useCanCreateContract(user?.id || '')

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const handleDeleteContract = (contract: any) => {
    setSelectedContract(contract)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Contracts</h1>
            <p className="text-muted-foreground">
              Loading contracts...
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
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
            Manage your client contracts ({currentCount}/{maxContracts} used)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          {!canCreate && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
              <AwardIcon className="h-4 w-4" />
              <span>Upgrade to create more contracts</span>
            </div>
          )}
          <Button
            onClick={() => setCreateDialogOpen(true)}
            disabled={!canCreate || isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Contract
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Loading contracts...</span>
            </div>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first contract to get started.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={!canCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contract.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {contract.clients?.name || `Unknown Client (${contract.client_id})`}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(contract.created_at).toLocaleDateString()}
                      </span>
                    </div>

                  </div>
                  <div className="flex items-center gap-2">
                    {user && (
                      <PDFDownloadLink
                        document={
                          <ContractPDF
                            contract={{
                              ...contract,
                              clients: contract.clients ? [{
                                ...contract.clients,
                                company: contract.clients.company || undefined
                              }] : []
                            }}
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
                      onClick={() => handleEditContract(contract)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContract(contract)}
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

      {/* Dialogs */}
      <CreateContractDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <EditContractDialog 
        contract={selectedContract}
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
      
      <DeleteContractDialog 
        contract={selectedContract}
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
      />
    </div>
  )
}
