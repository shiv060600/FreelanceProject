'use client'

import InvoicePDF from './invoice-pdf'
import { saveBlob } from '@/lib/download'

export { saveBlob }

export interface PdfUserInfo {
  name: string
  email: string
  address: string
  venmo_username?: string
  cashapp_username?: string
}

/** The client fields the PDF template expects, with the app's existing 'N/A' fallbacks. */
function clientDataFor(invoice: any) {
  const c = invoice.clients
  if (!c) return undefined
  return {
    name: c.name || 'N/A',
    email: c.email || 'N/A',
    phone: c.phone || 'N/A',
    company: c.company || 'N/A',
    address: c.address || 'N/A',
  }
}

/**
 * Renders the PDF only when asked. The old screen mounted a PDFDownloadLink
 * per table row, which re-rendered every invoice's PDF on every render.
 */
export async function buildInvoicePdf(invoice: any, userInfo: PdfUserInfo): Promise<Blob> {
  const { pdf } = await import('@react-pdf/renderer')
  return pdf(<InvoicePDF invoice={invoice} userInfo={userInfo} clientData={clientDataFor(invoice)} />).toBlob()
}

export const invoiceFileName = (invoice: { invoice_number?: string }) => `invoice-${invoice.invoice_number || 'unknown'}.pdf`

