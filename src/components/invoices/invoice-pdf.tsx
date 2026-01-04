'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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

interface Client {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

interface InvoicePDFProps {
  invoice: any
  userInfo: {
    name: string
    email: string
    address: string
    venmo_username?: string
    cashapp_username?: string
  }
  clientData?: Client
  cashAppQR?: string
  venmoQR?: string
}

const safeString = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return String(value);
}

const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
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

const InvoicePDF = ({ invoice, userInfo, clientData, cashAppQR, venmoQR }: InvoicePDFProps) => {
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
    description: safeString(invoice?.description),
    quantity: safeNumber(invoice?.quantity),
    unit_price: safeNumber(invoice?.unit_price),
    invoice_name: safeString(invoice?.invoice_name),
    clients: invoice?.clients || {},
    status: safeString(invoice?.status) || 'draft'
  };

  const safeUserInfo = {
    name: safeString(userInfo?.name) || 'Your Company',
    email: safeString(userInfo?.email) || 'your@email.com',
    address: safeString(userInfo?.address) || 'Your Address'
  };

  const clientName = safeString(safeInvoice.clients?.name) || 'Client Name';
  const invoiceName = safeString(safeInvoice.invoice_name) || 'Service';

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
            {userInfo.cashapp_username && (
              <View style={styles.qrContainer}>
                {cashAppQR ? (
                  <>
                    <Image src={cashAppQR} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>Cash App</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.qrLabel}>Cash App:</Text>
                    <Text style={styles.paymentLink}>${userInfo.cashapp_username}</Text>
                  </>
                )}
              </View>
            )}
            {userInfo.venmo_username && (
              <View style={styles.qrContainer}>
                {venmoQR ? (
                  <>
                    <Image src={venmoQR} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>Venmo</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.qrLabel}>Venmo:</Text>
                    <Text style={styles.paymentLink}>@{userInfo.venmo_username}</Text>
                  </>
                )}
              </View>
            )}
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
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{safeString(safeInvoice.description || safeInvoice.invoice_name) || 'Service'}</Text>
            <Text style={styles.tableCell}>{formatCurrency(safeInvoice.quantity || 1)}</Text>
            <Text style={styles.tableCell}>${formatCurrency(safeInvoice.unit_price || safeInvoice.subtotal || 0)}</Text>
            <Text style={styles.tableCell}>${formatCurrency(safeInvoice.subtotal || 0)}</Text>
          </View>
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