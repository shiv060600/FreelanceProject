'use client'

import React, { useEffect, useState } from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase-browser'

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



const InvoicePDF = ({ invoice, userInfo }: InvoicePDFProps) => {
  const [clientData,setClientData] = useState<Client>()

  useEffect(() => {
      const fetchClientData = async(clientId:string) => {
        const supabase = createClient();
        const {data : clientDataT , error : clientError} = await supabase
        .from('clients')
        .select('*')
        .eq('id',clientId)
        .single()

        if(clientDataT && !clientError){
          setClientData(clientDataT)
        }

      }
      fetchClientData(invoice?.client_id)

    },[invoice?.client_id])

    
    


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

  const safeUserInfo = {
    name: safeString(userInfo?.name) || 'Your Company',
    email: safeString(userInfo?.email) || 'your@email.com',
    address: safeString(userInfo?.address) || 'Your Address'
  };

  const clientName = safeString(safeInvoice.clients?.name) || 'Client Name';
  const invoiceName = safeString(safeInvoice.invoice_items?.[0]?.invoice_name) || 'Service';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{safeInvoice.invoice_number}</Text>
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
                <Text style={styles.tableCell}>${formatCurrency(item.unit_price || safeInvoice.total)}</Text>
                <Text style={styles.tableCell}>${formatCurrency(item.amount || safeInvoice.total)}</Text>
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
          {safeInvoice.subtotal > 0 && safeInvoice.subtotal !== safeInvoice.total && (
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
            <Text style={styles.totalAmount}>Total: ${formatCurrency(safeInvoice.total)}</Text>
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