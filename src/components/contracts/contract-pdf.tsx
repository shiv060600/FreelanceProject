'use client'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { parseContract, parseInline, type ContractBlock } from '@/lib/contracts/parse'

// Built-in PDF fonts (no network fetch needed): Times for the legal body,
// Helvetica for the cover details so the page reads as a proper document.
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: 'Times-Roman',
    fontSize: 10.5,
    lineHeight: 1.5,
    color: '#111111',
  },
  header: {
    marginBottom: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    borderBottomStyle: 'solid',
  },
  title: {
    fontFamily: 'Times-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#666666',
    textAlign: 'center',
  },
  parties: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 22,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
  },
  partyBox: { flex: 1 },
  partyLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#666666',
    marginBottom: 3,
  },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
  partyLine: { color: '#444444' },

  heading: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 4,
  },
  subheading: { fontFamily: 'Times-Bold', marginTop: 8, marginBottom: 2 },
  paragraph: { marginBottom: 5, textAlign: 'justify' },
  bulletRow: { flexDirection: 'row', marginBottom: 3, paddingLeft: 18 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  bold: { fontFamily: 'Times-Bold' },
  placeholder: { backgroundColor: '#FDE68A' },

  signatureSection: {
    marginTop: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
  },
  signatureBox: { flex: 1 },
  signatureTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 28,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    borderBottomStyle: 'solid',
    marginBottom: 4,
  },
  signatureLabel: { fontFamily: 'Helvetica', fontSize: 8.5, color: '#555555' },

  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#888888',
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

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) => (
        <Text
          key={i}
          style={seg.bold ? styles.bold : seg.placeholder ? styles.placeholder : undefined}
        >
          {seg.text}
        </Text>
      ))}
    </>
  )
}

function renderBlocks(blocks: ContractBlock[]) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'heading':
        // minPresenceAhead stops a heading being stranded at the bottom of a page
        return (
          <Text key={i} style={styles.heading} minPresenceAhead={40}>
            {block.text}
          </Text>
        )
      case 'subheading':
        return (
          <Text key={i} style={styles.subheading} minPresenceAhead={30}>
            {block.text}
          </Text>
        )
      case 'bullet':
        return (
          <View key={i} style={styles.bulletRow} wrap={false}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              <Inline text={block.text} />
            </Text>
          </View>
        )
      case 'paragraph':
        return (
          <Text key={i} style={styles.paragraph}>
            <Inline text={block.text} />
          </Text>
        )
      default:
        return null // title is shown in the page header; spacers are handled by margins
    }
  })
}

export function ContractPDF({ contract, userName, userEmail }: ContractPDFProps) {
  const client = contract.clients?.[0]
  const formattedDate = new Date(contract.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const body = renderBlocks(parseContract(contract?.content || ''))

  return (
    <Document title={contract.title} author={userName} creator="FreelanceFlow">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{contract.title}</Text>
          <Text style={styles.subtitle}>Agreement · {formattedDate}</Text>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Service provider</Text>
            <Text style={styles.partyName}>{userName}</Text>
            {!!userEmail && <Text style={styles.partyLine}>{userEmail}</Text>}
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Client</Text>
            <Text style={styles.partyName}>{client?.name || 'Client'}</Text>
            {!!client?.company && <Text style={styles.partyLine}>{client.company}</Text>}
            {!!client?.email && <Text style={styles.partyLine}>{client.email}</Text>}
          </View>
        </View>

        <View>{body}</View>

        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Service provider</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{userName}</Text>
            <Text style={[styles.signatureLabel, { marginTop: 14 }]}>Date: ____________________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Client</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{client?.name || 'Client'}</Text>
            <Text style={[styles.signatureLabel, { marginTop: 14 }]}>Date: ____________________</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{contract.title}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
