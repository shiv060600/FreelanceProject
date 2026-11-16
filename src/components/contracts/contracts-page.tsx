'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Pencil, Trash2, Download, AwardIcon, RefreshCw, Mail, Info, Eye} from 'lucide-react'
import { ContractPDF } from './contract-pdf'
import { PDFDownloadLink } from '@react-pdf/renderer'
import CreateContractDialog from './create-contract-dialog'
import { EditContractDialog } from './edit-contract-dialog'
import { DeleteContractDialog } from './delete-contract-dialog'
import { useContracts, useCanCreateContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-user'
import { SearchInput } from '../ui/search-input'
import ContractInfo from './contract-info'
import { useMemo } from 'react'
import ContractPreview from './contract-preview'
import { stripContractMarkup } from '@/lib/contracts/parse'

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
  const [currentSearch, setCurrentSearch] = useState("")
  const debouncedCurrentSearch = useDebounce(currentSearch, 300)
  const [contractsInfoOpen, setContractsInfoOpen] = useState(false);
  const [contractPreviewOpen, setContractPreviewOpen] = useState(false);
  
  const { data: user , isLoading: userLoading, error: userError } = useUser();
  const { data: contracts , isLoading: contractsLoading, isFetching: contractsFetching, error: contractsError } = useContracts(user?.id || '');
  const { canCreate, currentCount, maxContracts, subscriptionStatus } = useCanCreateContract(user?.id || '');

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const filteredContracts = useMemo(()=>{
    if (!contracts) return [];
    return contracts.filter((contract)=> {
      return (contract?.clients?.name.toLowerCase().includes(debouncedCurrentSearch.toLowerCase()) ||
              contract?.title.toLowerCase().includes(debouncedCurrentSearch.toLowerCase()))
    })
  },[contracts,debouncedCurrentSearch]);

  const handleDeleteContract = (contract: any) => {
    setSelectedContract(contract)
    setDeleteDialogOpen(true)
  }

  const handleSendContract = async (contract: any) => {
    try {
      const { pdf } = await import('@react-pdf/renderer')
      
      // Create the PDF document component
      const contractPdf = <ContractPDF
                              contract={{
                                ...contract,
                                clients: contract.clients ? [{
                                  ...contract.clients,
                                  company: contract.clients.company || undefined
                                }] : []
                              }}
                              userName={user?.user_metadata?.full_name || user?.email || 'Unknown User'}
                              userEmail={user?.email || ''}
                            />
      
      // Generate blob from PDF component
      const contractPdfBlob = await pdf(contractPdf).toBlob()
      
      // Create a blob URL that can be clicked to view the PDF
      const blobUrl = URL.createObjectURL(contractPdfBlob)
      
      // Create mailto link with the blob URL in the body
      const subject = encodeURIComponent(`Contract for ${contract.title}`)
      const body = encodeURIComponent(`Please review the contract by clicking this link:\n\n${blobUrl}\n\nBest regards`)
      const to = contract.clients?.email || ''
      const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`
      
      // Open default email client with the blob URL in the body
      window.location.href = mailtoLink
      
      // Note: DO NOT revoke the URL - it needs to stay valid for the recipient to click
    } catch (error) {
      console.error('Error sending contract:', error)
      alert('Failed to send contract')
    }
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

  if (contracts?.length === 0){
    return(
      <div>
        <Card className="border-2 border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">No contracts yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first contract to get started and protect your freelance business.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={!canCreate}
              className="shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
            {!canCreate && 
              <p className='text-sm font-bold text-red-500 mt-5 flex items-center gap-2'>
                <AwardIcon className='h-4 w-4'/>
                Your current subscription does not allow for contract creation
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
    <div className="relative flex gap-0">
      {/* Main Content - 75% when panel open, 100% when closed */}
      <div className={`transition-all duration-500 ease-in-out ${
        contractsInfoOpen ? 'w-[75%] pr-5 pl-4' : 'w-full pl-10'
      }`}>
        <div className="space-y-6">
          <div className='flex justify-between items-center pb-2'>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>Contracts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and organize your client contracts
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {!canCreate && 
                <p className='text-sm font-semibold text-red-500 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-500/30'>
                  <AwardIcon className='h-4 w-4'/>
                  Contract limit reached ({currentCount}/{maxContracts}) - upgrade to add more
                </p>
              }
              <Button
                variant="outline"
                size="icon"
                onClick={() => setContractsInfoOpen(!contractsInfoOpen)}
                className={contractsInfoOpen? `h-9 w-9 bg-blue-200` : `h-9 w-9 hover:bg-primary/10 hover:text-blue-900 dark:hover:text-blue-400 hover:border-primary/20 transition-colors`}
                title="Contract Information"
              >
                <Info className="h-4 w-4 " />
              </Button>
              <Button 
                disabled = {!canCreate}
                onClick={() => {setCreateDialogOpen(true)}}
                className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >          
                <Plus className='h-4 w-4 mr-2'/>
                Add Contract
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-purple-50/50 dark:to-purple-500/10 rounded-lg p-4 border border-primary/20">
            <SearchInput 
              placeholder='Search contracts by name or client...' 
              value={currentSearch} 
              onChange={setCurrentSearch} 
              className='max-w-md bg-card shadow-sm'
            />
            {currentSearch && (
              <span className="text-sm font-medium text-foreground/80 bg-card px-3 py-1.5 rounded-md shadow-sm">
                {filteredContracts.length} of {contracts?.length || 0} contracts
              </span>
            )}
          </div>
          <div className="grid gap-4">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="border border-border/60 hover:shadow-lg transition-all duration-200 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold text-foreground mb-3">{contract.title}</CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-semibold">
                      {contract.clients?.name || `Unknown Client (${contract.client_id})`}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">
                      {new Date(contract.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
                          className="h-10 w-10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSendContract(contract)}
                    className="h-10 w-10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                  >
                    <Mail className='h-4 w-4'/>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditContract(contract)}
                    className="h-10 w-10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteContract(contract)}
                    className="h-10 w-10 hover:bg-red-100 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedContract(contract)
                      setContractPreviewOpen(true)
                    }}
                    className="h-10 w-10 hover:bg-green-100 dark:hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 transition-colors"
                    title="Quick Preview"
                  >
                    <Eye className="h-4 w-4" />
                </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground max-h-24 overflow-hidden bg-muted/50 rounded-lg p-4 border border-border">
                {contract.content ? (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed">
                    {/* Strip markup (HTML from older contracts, Markdown from AI drafts) for the preview */}
                    {(() => {
                      const plainText = stripContractMarkup(contract.content)
                      return plainText.length > 200 
                        ? `${plainText.substring(0, 200)}...` 
                        : plainText
                    })()}
                  </div>
                ) : (
                  <em className="text-muted-foreground">No content</em>
                )}
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>

      {/* Contract Info Side Panel - 30% */}
      <ContractInfo open={contractsInfoOpen} setOpen={setContractsInfoOpen} />

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

      <ContractPreview
        selectedContract={selectedContract}
        previewOpen= {contractPreviewOpen}
        setPreviewOpen= {setContractPreviewOpen}
        user = {user}
      />

    </div>
  )

}
