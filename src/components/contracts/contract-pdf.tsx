'use client'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  text: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  clientInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 80,
  },
  value: {
    flex: 1,
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderStyle: 'solid',
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    borderBottomStyle: 'solid',
    marginBottom: 5,
    height: 40,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
})

interface ContractPDFProps {
  contract: {
    id: string
    title: string
    content: string
    created_at: string
    clients?: Array<{
      id: string
      name: string
      email: string
      company?: string
    }>
  }
  userName: string
  userEmail: string
}

export function ContractPDF({ contract, userName, userEmail }: ContractPDFProps) {
  const client = contract.clients?.[0]
  const formattedDate = new Date(contract.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{contract.title}</Text>
          <Text style={styles.subtitle}>Contract Agreement</Text>
        </View>

        {/* Contract Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Details</Text>
          <View style={styles.clientInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contract ID:</Text>
              <Text style={styles.value}>{contract.id}</Text>
            </View>
          </View>
        </View>

        {/* Party Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties Involved</Text>
          <View style={styles.clientInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Provider:</Text>
              <Text style={styles.value}>{userName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{userEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>{client?.name || 'Unknown Client'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Client Email:</Text>
              <Text style={styles.value}>{client?.email || 'N/A'}</Text>
            </View>
            {client?.company && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Company:</Text>
                <Text style={styles.value}>{client.company}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contract Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.text}>
            {contract.content || 'No contract content specified.'}
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Service Provider</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature</Text>
            <Text style={styles.signatureLabel}>{userName}</Text>
            <Text style={styles.signatureLabel}>Date: _______________</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Client</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature</Text>
            <Text style={styles.signatureLabel}>{client?.name || 'Client Name'}</Text>
            <Text style={styles.signatureLabel}>Date: _______________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This contract was generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  )
}
