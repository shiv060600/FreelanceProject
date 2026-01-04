import InvoicePDF from "./invoice-pdf";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "../ui/dialog";
import { PDFViewer } from "@react-pdf/renderer";

interface InvoicePreviewProps {
    open : boolean,
    setOpen : (state: boolean) => void
    userInfoForPdf : any,
    invoice : any
}

export default function InvoicePreview({open, setOpen, userInfoForPdf, invoice} : InvoicePreviewProps){

    if (!userInfoForPdf || !invoice) {
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle>
                        Invoice Preview - {invoice.invoice_number}
                        {invoice.clients?.name && <span className="text-sm font-normal text-gray-600 ml-2">({invoice.clients.name})</span>}
                    </DialogTitle>
                </DialogHeader>
                <div className="border rounded-lg bg-gray-50 overflow-hidden" style={{ height: '700px' }}>
                    <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                        <InvoicePDF
                           invoice={invoice}
                           userInfo={userInfoForPdf}
                           clientData={invoice.clients ? {
                             name: invoice.clients.name || 'N/A',
                             email: invoice.clients.email || 'N/A',
                             phone: invoice.clients.phone || 'N/A',
                             company: invoice.clients.company || 'N/A',
                             address: invoice.clients.address || 'N/A'
                           } : undefined}
                        />
                    </PDFViewer>
                </div>
            </DialogContent>
        </Dialog>
    )
}