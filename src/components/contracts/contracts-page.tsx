'use client'
import { useState,useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Pencil, Trash2, Download, AwardIcon, RefreshCw } from 'lucide-react'
import { ContractPDF } from './contract-pdf'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CreateContractDialog } from './create-contract-dialog'
import { EditContractDialog } from './edit-contract-dialog'
import { DeleteContractDialog } from './delete-contract-dialog'
import { useContracts, useCanCreateContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-user'
import { SearchInput } from '../ui/search-input'
import { useMemo } from 'react'

interface CountryInfo {
  e_signature_valid:boolean,
  language_required:string,
  notes:string
} 

interface Contract {
    id: string;
    client_id:string;
    user_id:string;
    title:string;
    content:string;
    created_at:string;
    //joined clients not from db
    clients?: {
      id: string;
      name: string;
      email: string;
      company: string;
    } | null;
}

export default function ContractsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any | null>(null)
  const [currentSearch,setCurrentSearch] = useState("")
  

  
  const { data: user , isLoading: userLoading } = useUser();
  const { data: contracts , isLoading: contractsLoading,isFetching:contractsFetching } = useContracts(user?.id || '');
  const { canCreate, currentCount, maxContracts, subscriptionStatus } = useCanCreateContract(user?.id || '');

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const filteredContracts = useMemo(()=>{
    if (!contracts) return [];

    return contracts.filter((contract)=> {
      return (contract?.clients?.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
              contract?.title.toLowerCase().includes(currentSearch.toLowerCase()))
    })
  },[contracts,currentSearch]);

  const handleDeleteContract = (contract: any) => {
    setSelectedContract(contract)
    setDeleteDialogOpen(true)
  }

  if (userLoading || contractsLoading || contractsFetching || !user || !contracts){
    return(
      <div className="flex flex-col items-center justify-start min-h-screen">
        <div className="mt-16 flex items-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading Contracts</span>
        </div>
    </div>
    )
  }

  if (contracts.length === 0){
    return(
      <div>
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
            {!canCreate && 
              <p className='text-sm font-bold text-red-500 mt-5'>
                Your current subscription does not allow for contact creation
              </p>}
          </CardContent>
        </Card>
        <CreateContractDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        />
      </div>
    
    
    )
  }

  
  return (
    <div className="space-y-6">
      <div className='flex justify-between'>
        <div className='flex items-center gap-4'>
          <h1 className='text-2xl font-bold'>Contracts</h1>
          <SearchInput placeholder='Search contracts by name' value = {currentSearch} onChange={setCurrentSearch} className='h-9'/>
        </div>
        <Button 
          disabled = {!canCreate}
          onClick={() => {setCreateDialogOpen(true)}}>          
          <Plus className='h-4 w-4'/>
          Add Contract
        </Button>
      </div>
      <div className="grid gap-4">
        {filteredContracts.map((contract) => (
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
                  <div className="whitespace-pre-wrap font-sans">
                    {/* Strip HTML for preview */}
                    {(() => {
                      const plainText = contract.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
                      return plainText.length > 200 
                        ? `${plainText.substring(0, 200)}...` 
                        : plainText
                    })()}
                  </div>
                ) : (
                  <em>No content</em>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
