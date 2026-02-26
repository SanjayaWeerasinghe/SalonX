import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Invoice } from '@/lib/api/invoice.api';
import { format } from 'date-fns';

interface InvoicePDFProps {
  invoice: Invoice;
  loading?: boolean;
}

export function InvoicePDF({ invoice, loading = false }: InvoicePDFProps) {
  const handleDownloadPDF = () => {
    // Create a simple HTML invoice for printing/PDF
    const customerName = invoice.customer
      ? `${invoice.customer.first_name} ${invoice.customer.last_name}`
      : 'Unknown Customer';

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #333;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-block {
            flex: 1;
          }
          .info-block h3 {
            margin-top: 0;
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .totals {
            margin-left: auto;
            width: 300px;
          }
          .totals tr td {
            padding: 8px 0;
          }
          .totals tr:last-child td {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 18px;
          }
          .notes {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 3px solid #333;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Invoice #${invoice.invoice_number}</p>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>BILL TO:</h3>
            <p><strong>${customerName}</strong></p>
            ${invoice.customer?.email ? `<p>${invoice.customer.email}</p>` : ''}
            ${invoice.customer?.phone ? `<p>${invoice.customer.phone}</p>` : ''}
          </div>
          <div class="info-block" style="text-align: right;">
            <p><strong>Issue Date:</strong> ${format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
            ${invoice.due_date ? `<p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>` : ''}
            <p><strong>Status:</strong> ${invoice.payment_status.toUpperCase()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.line_items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">$${item.unit_price.toFixed(2)}</td>
                <td style="text-align: right;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td style="text-align: right;">$${invoice.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total:</td>
            <td style="text-align: right;">$${invoice.total.toFixed(2)}</td>
          </tr>
          ${invoice.amount_paid > 0 ? `
            <tr>
              <td>Amount Paid:</td>
              <td style="text-align: right; color: green;">-$${invoice.amount_paid.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Balance Due:</td>
              <td style="text-align: right; color: red;">$${(invoice.total - invoice.amount_paid).toFixed(2)}</td>
            </tr>
          ` : ''}
        </table>

        ${invoice.notes ? `
          <div class="notes">
            <h3 style="margin-top: 0;">Notes:</h3>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Powered by SalonX Management System</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownloadPDF}
      disabled={loading}
    >
      <Download className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  );
}
