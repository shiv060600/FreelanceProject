'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import InvoicePDF from './invoice-pdf'

// Dynamically import PDFDownloadLink with SSR disabled to fix Next.js 16 compatibility
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

interface PDFDownloadWrapperProps {
  invoice: any
  userInfo?: {
    name?: string
    email?: string
    address?: string
  }
  userInfoLoading?: boolean
}

export default function PDFDownloadWrapper({ 
  invoice, 
  userInfo, 
  userInfoLoading 
}: PDFDownloadWrapperProps) {
  // Use invoice ID as key to force re-render when invoice changes
  // This prevents the "Eo is not a function" reconciler error
  const documentKey = `invoice-${invoice?.id || 'unknown'}-${invoice?.invoice_number || ''}`
  
  return (
    <PDFDownloadLink
      document={
        <InvoicePDF 
          key={documentKey}
          invoice={invoice} 
          userInfo={userInfo} 
        />
      }
      fileName={`invoice-${invoice?.invoice_number || 'unknown'}.pdf`}
    >
      {({ loading }) => (
        <Button
          variant="ghost"
          size="icon"
          disabled={loading || userInfoLoading || !invoice?.id}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </PDFDownloadLink>
  )
}

