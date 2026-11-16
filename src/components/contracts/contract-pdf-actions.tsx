'use client'

import { ContractPDF } from './contract-pdf'

export const userNameOf = (user: any) => user?.user_metadata?.full_name || user?.email || 'Unknown User'

/** The shape ContractPDF expects: the joined client becomes a one-item array. */
export const pdfContractOf = (contract: any) => ({
  ...contract,
  clients: contract.clients ? [{ ...contract.clients, company: contract.clients.company || undefined }] : [],
})

/** Renders the PDF only when asked, instead of one PDFDownloadLink per card. */
export async function buildContractPdf(contract: any, user: any): Promise<Blob> {
  const { pdf } = await import('@react-pdf/renderer')
  return pdf(
    <ContractPDF contract={pdfContractOf(contract)} userName={userNameOf(user)} userEmail={user?.email || ''} />,
  ).toBlob()
}
