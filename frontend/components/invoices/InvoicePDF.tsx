'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import type { Invoice } from '@/types/invoice';
import type { Customer } from '@/types/customer';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import Button from '@/components/ui/Button';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  salonInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '17.5%', textAlign: 'right' },
  col4: { width: '17.5%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

interface InvoicePDFDocumentProps {
  invoice: Invoice;
}

function InvoicePDFDocument({ invoice }: InvoicePDFDocumentProps) {
  const customer = typeof invoice.customer_id === 'string' ? null : invoice.customer_id;
  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'SalonX';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.salonInfo}>{salonName}</Text>
          <Text style={{ fontSize: 10, marginBottom: 5 }}>Invoice #: {invoice.invoice_number}</Text>
          <Text style={{ fontSize: 10, marginBottom: 5 }}>Date: {formatDate(invoice.issue_date)}</Text>
          {invoice.due_date && <Text style={{ fontSize: 10 }}>Due Date: {formatDate(invoice.due_date)}</Text>}
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          {customer && (
            <>
              <Text>
                {customer.first_name} {customer.last_name}
              </Text>
              {customer.email && <Text>{customer.email}</Text>}
              {customer.phone && <Text>{customer.phone}</Text>}
            </>
          )}
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Price</Text>
            <Text style={styles.col4}>Total</Text>
          </View>
          {invoice.line_items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>${item.unit_price.toFixed(2)}</Text>
              <Text style={styles.col4}>${item.total_price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax:</Text>
            <Text>${invoice.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total:</Text>
            <Text>${invoice.total.toFixed(2)}</Text>
          </View>

          {/* Payment Info */}
          {invoice.paid_amount > 0 && (
            <>
              <View style={[styles.totalRow, { marginTop: 10 }]}>
                <Text>Paid:</Text>
                <Text>${invoice.paid_amount.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Balance Due:</Text>
                <Text>${(invoice.total - invoice.paid_amount).toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#666' }}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}

interface InvoicePDFProps {
  invoice: Invoice;
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument invoice={invoice} />}
      fileName={`${invoice.invoice_number}.pdf`}
    >
      {({ loading }) => (
        <Button variant="secondary" disabled={loading}>
          <Download size={16} className="mr-2" />
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
