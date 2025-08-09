'use client'

import React, { useEffect, useState } from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase-browser'
import QRCode from 'qrcode'
import { useInvoicePDF } from '@/hooks/use-invoice-pdf'

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '40%',
  },
  qrContainer: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  qrCode: {
    width: 40,
    height: 40,
  },
  qrLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  invoiceNumber: {
    fontSize: 16,
    marginTop: 5,
    color: '#666666',
  },
  paymentIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    textDecoration: 'underline',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flexDirection: 'column',
    width: '48%',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#eeeeee',
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1,
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  paymentSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#cccccc',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  paymentLink: {
    fontSize: 12,
    color: '#0066cc',
    textDecoration: 'underline',
  },
})

interface InvoicePDFProps {
  invoice: any
  userInfo?: {
    name?: string
    email?: string
    address?: string
  }
}

interface Client {
  name:string,
  email:string,
  phone:string,
  company:string,
  addrres:string
}

const safeString = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return String(value);
}

const formatCurrency = (value: any): string => {
  const num = parseFloat(value) || 0;
  return num.toFixed(2);
}

const formatDate = (dateValue: any): string => {
  try {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  } catch {
    return 'N/A';
  }
}

const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 160,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

const InvoicePDF = ({ invoice, userInfo }: InvoicePDFProps) => {
  const { userInfo: hookUserInfo, loading: userLoading } = useInvoicePDF()
  const [clientData, setClientData] = useState<Client>()
  const [cashAppQR, setCashAppQR] = useState<string>('')
  const [venmoQR, setVenmoQR] = useState<string>('')
  const [qrCodesGenerated, setQrCodesGenerated] = useState(false)

  useEffect(() => {
    const fetchClientData = async() => {
      if (invoice?.client_id) {
        const supabase = createClient();
        const {data : clientDataT , error : clientError} = await supabase
          .from('clients')
          .select('*')
          .eq('id', invoice.client_id)
          .single()

        if(!clientError && clientDataT) {
          setClientData(clientDataT);
        } else {
          console.error("Error fetching client data:", clientError?.message)
        }
      }
    }
    
    fetchClientData();
  }, [invoice])

  // Generate QR codes when user data is available
  useEffect(() => {
    const generateQRCodes = async () => {
      if (!userLoading && hookUserInfo && !qrCodesGenerated) {
        try {
          console.log('Generating QR codes with user data:', hookUserInfo);
          
          // Generate Cash App QR code
          if (hookUserInfo.cashapp_username) {
            console.log('Generating Cash App QR for:', hookUserInfo.cashapp_username);
            const cashAppUrl = `https://cash.app/$${hookUserInfo.cashapp_username}`;
            const qrCode = await generateQRCode(cashAppUrl);
            setCashAppQR(qrCode);
            console.log('Cash App QR generated successfully');
          } else {
            console.log('No Cash App username found');
          }
          
          // Generate Venmo QR code
          if (hookUserInfo.venmo_username) {
            console.log('Generating Venmo QR for:', hookUserInfo.venmo_username);
            const venmoUrl = `https://venmo.com/${hookUserInfo.venmo_username}`;
            const qrCode = await generateQRCode(venmoUrl);
            setVenmoQR(qrCode);
            console.log('Venmo QR generated successfully');
          } else {
            console.log('No Venmo username found');
          }
          
          setQrCodesGenerated(true);
        } catch (error) {
          console.error('Error generating QR codes:', error);
        }
      }
    }
    
    generateQRCodes();
  }, [userLoading, hookUserInfo, qrCodesGenerated])

  // Show loading state if any data is not ready
  if (userLoading || !qrCodesGenerated) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Loading Invoice...</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Ensure we have valid data with fallbacks
  const safeInvoice = {
    invoice_number: safeString(invoice?.invoice_number) || 'N/A',
    issue_date: invoice?.issue_date || null,
    due_date: invoice?.due_date || null,
    total: invoice?.total || 0,
    tax_rate: invoice?.tax_rate || 0,
    tax_amount: invoice?.tax_amount || 0,
    subtotal: invoice?.subtotal || 0,
    notes: safeString(invoice?.notes) || '',
    invoice_items: Array.isArray(invoice?.invoice_items) ? invoice.invoice_items : [],
    clients: invoice?.clients || {},
    status: safeString(invoice?.status) || 'draft'
  };

  // Use hook user data or fallback to props
  const safeUserInfo = {
    name: safeString(hookUserInfo?.name || userInfo?.name) || 'Your Company',
    email: safeString(hookUserInfo?.email || userInfo?.email) || 'your@email.com',
    address: safeString(userInfo?.address) || 'Your Address'
  };

  const clientName = safeString(safeInvoice.clients?.name) || 'Client Name';
  const invoiceName = safeString(safeInvoice.invoice_items?.[0]?.invoice_name) || 'Service';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{safeInvoice.invoice_number}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.qrContainer}>
              {cashAppQR ? (
                <>
                  <Image src={cashAppQR} style={styles.qrCode} />
                  <Text style={styles.qrLabel}>Cash App</Text>
                </>
              ) : (
                <Text style={styles.qrLabel}>No Cash App</Text>
              )}
            </View>
            <View style={styles.qrContainer}>
              {venmoQR ? (
                <>
                  <Image src={venmoQR} style={styles.qrCode} />
                  <Text style={styles.qrLabel}>Venmo</Text>
                </>
              ) : (
                <Text style={styles.qrLabel}>No Venmo</Text>
              )}
            </View>
          </View>
        </View>

        {/* Company and Client Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>From:</Text>
            <Text style={styles.text}>{safeUserInfo.name}</Text>
            <Text style={styles.text}>{safeUserInfo.email}</Text>
            <Text style={styles.text}>{safeUserInfo.address}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>To:</Text>
            <Text style={styles.text}>{clientData?.name || 'Not Set'}</Text>
            <Text style={styles.text}>{clientData?.email || 'Not Set'}</Text>
            <Text style={styles.text}>{clientData?.phone || 'Not Set'}</Text>
            <Text style={styles.text}>{clientData?.company || 'Not Set'}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Invoice Details:</Text>
            <Text style={styles.text}>Issue Date: {formatDate(safeInvoice.issue_date)}</Text>
            <Text style={styles.text}>Due Date: {formatDate(safeInvoice.due_date)}</Text>
            <Text style={styles.text}>Status: {safeInvoice.status.toUpperCase()}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Service:</Text>
            <Text style={styles.text}>{invoiceName}</Text>
          </View>
        </View>

        {/* Services/Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Description</Text>
            <Text style={styles.tableCellHeader}>Quantity</Text>
            <Text style={styles.tableCellHeader}>Unit Price</Text>
            <Text style={styles.tableCellHeader}>Amount</Text>
          </View>
          
          {safeInvoice.invoice_items.length > 0 ? (
            safeInvoice.invoice_items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{safeString(item.description || item.invoice_name) || 'Service'}</Text>
                <Text style={styles.tableCell}>{formatCurrency(item.quantity || 1)}</Text>
                <Text style={styles.tableCell}>${formatCurrency(item.unit_price || 0)}</Text>
                <Text style={styles.tableCell}>${formatCurrency(item.total || 0)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{invoiceName}</Text>
              <Text style={styles.tableCell}>1.00</Text>
              <Text style={styles.tableCell}>${formatCurrency(safeInvoice.total)}</Text>
              <Text style={styles.tableCell}>${formatCurrency(safeInvoice.total)}</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.total}>
          {safeInvoice.subtotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.text}>${formatCurrency(safeInvoice.subtotal)}</Text>
            </View>
          )}
          
          {safeInvoice.tax_rate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({formatCurrency(safeInvoice.tax_rate)}%):</Text>
              <Text style={styles.text}>${formatCurrency(safeInvoice.tax_amount)}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${formatCurrency(safeInvoice.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {safeInvoice.notes && safeInvoice.notes !== 'N/A' && safeInvoice.notes.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.text}>{safeInvoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default InvoicePDF 