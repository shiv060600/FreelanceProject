import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PDFViewer } from '@react-pdf/renderer'
import { ContractPDF } from './contract-pdf'

interface ContractPreviewProps{
    previewOpen : boolean,
    setPreviewOpen : (state: boolean) => void,
    selectedContract : any //sorry god,
    user : any //sorry again
}


export default function ContractPreview ({previewOpen, setPreviewOpen, selectedContract, user} : ContractPreviewProps) {

    // Don't render dialog content if we don't have the necessary data
    if (!selectedContract || !user) {
        return null;
    }

    return(
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Contract Preview - {selectedContract.title}</DialogTitle>
                </DialogHeader>
                <div className="border rounded-lg bg-gray-50 overflow-hidden" style={{ height: '600px' }}>
                    <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                        <ContractPDF
                            contract={{
                                ...selectedContract,
                                clients: selectedContract.clients ? [{
                                    ...selectedContract.clients,
                                    company: selectedContract.clients.company || undefined
                                }] : []
                            }}
                            userName={user.user_metadata?.full_name || user.email || 'Unknown User'}
                            userEmail={user.email || ''}
                        />
                    </PDFViewer>
                </div>
            </DialogContent>
        </Dialog>
    )

}