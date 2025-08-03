'use client'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import parse from 'html-react-parser'

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
    borderColor: '#ffffff',
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

function renderQuillHtml(html: string) {

  const blocks = html
    .replace(/<\/(h[1-3]|p)>/g, '</$1>||') // Add separator after block tags
    .split('||')
    .filter(Boolean);

  return blocks.map((block, i) => {
    // Headings
    if (block.startsWith('<h1')) {
      const text = block.replace(/<[^>]+>/g, '');
      return <Text key={i} style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{text}</Text>;
    }
    if (block.startsWith('<h2')) {
      const text = block.replace(/<[^>]+>/g, '');
      return <Text key={i} style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>{text}</Text>;
    }
    if (block.startsWith('<h3')) {
      const text = block.replace(/<[^>]+>/g, '');
      return <Text key={i} style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{text}</Text>;
    }
    // Paragraphs
    if (block.startsWith('<p')) {
      return <Text key={i} style={{ marginBottom: 4 }}>{renderInline(block)}</Text>;
    }
    // Fallback: treat as inline
    return <Text key={i}>{renderInline(block)}</Text>;
  });
}

// Inline tag parser for bold, italic, underline, color, br
function renderInline(html: string) {
  // Replace <br> with newline
  html = html.replace(/<br\s*\/?>/g, '\n');

  // Color spans
  html = html.replace(/<span style="color:([^"]+)">([^<]+)<\/span>/g, (_, color, text) =>
    `[[color:${color}]]${text}[[/color]]`
  );

  // Bold
  html = html.replace(/<(strong|b)>([^<]+)<\/(strong|b)>/g, (_, __, text) =>
    `[[bold]]${text}[[/bold]]`
  );

  // Italic
  html = html.replace(/<(em|i)>([^<]+)<\/(em|i)>/g, (_, __, text) =>
    `[[italic]]${text}[[/italic]]`
  );

  // Underline
  html = html.replace(/<u>([^<]+)<\/u>/g, (_, text) =>
    `[[underline]]${text}[[/underline]]`
  );

  // Now split by custom markers and render
  const parts = html.split(/(\[\[.*?\]\])/).filter(Boolean);

  let style = {};
  let color:any = undefined;
  return parts.map((part, i) => {
    if (part === '[[bold]]') style = { ...style, fontWeight: 'bold' };
    else if (part === '[[/bold]]') style = { ...style, fontWeight: undefined };
    else if (part === '[[italic]]') style = { ...style, fontStyle: 'italic' };
    else if (part === '[[/italic]]') style = { ...style, fontStyle: undefined };
    else if (part === '[[underline]]') style = { ...style, textDecoration: 'underline' };
    else if (part === '[[/underline]]') style = { ...style, textDecoration: undefined };
    else if (part.startsWith('[[color:')) color = part.slice(8, -2);
    else if (part === '[[/color]]') color = undefined;
    else {
      return (
        <Text key={i} style={{ ...style, color }}>
          {part}
        </Text>
      );
    }
    return null;
  });
}

export function ContractPDF({ contract, userName, userEmail }: ContractPDFProps) {
  const client = contract.clients?.[0]
  const formattedDate = new Date(contract.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const parsedContent = renderQuillHtml(contract?.content)

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
            {parsedContent}
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
