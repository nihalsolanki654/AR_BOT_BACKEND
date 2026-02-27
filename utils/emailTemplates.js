/**
 * Email Template System
 * Professional and Premium HTML template for Invoice Statements
 */

export const getInvoiceEmailTemplate = (invoice, config) => {
    const {
        invoiceNumber,
        invoice_number,
        companyName,
        invoiceDate,
        dueDate,
        total_Amount,
        balance_due,
        description,
        total_price,
        quantity,
        GST,
        GST_Amount,
        subtotal
    } = invoice;

    const invNo = invoiceNumber || invoice_number || 'N/A';
    const total = parseFloat(total_Amount || 0).toLocaleString('en-IN');
    const balance = parseFloat(balance_due || 0).toLocaleString('en-IN');
    const price = parseFloat(total_price || 0).toLocaleString('en-IN');
    const gstAmt = parseFloat(GST_Amount || 0).toLocaleString('en-IN');
    const sub = parseFloat(subtotal || 0).toLocaleString('en-IN');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; }
        .content { padding: 30px; background: #ffffff; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 15px; }
        .message-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin-bottom: 25px; font-size: 14px; font-weight: 600; color: #0369a1; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
        .table th { background: #f8fafc; text-align: left; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; }
        .table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .footer { padding: 20px 30px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        .signature { margin-top: 20px; font-size: 14px; color: #1e293b; font-weight: 700; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Notification</h1>
        </div>
        <div class="content">
            <div class="greeting">Dear ${companyName},</div>
            
            <div class="message-box">
                The Invoice details given below will be due on the due dates mentioned in the table. We request you to arrange for payment on its due date.
            </div>

            <!-- Horizontal Details Grid -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
                <tr>
                    <td style="padding: 15px; background: #f8fafc; border-right: 1px solid #f1f5f9; width: 33%;">
                        <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Recipient Info</div>
                        <div style="font-size: 13px; font-weight: 700; color: #1e293b;">To: ${config.toEmails.join(', ')}</div>
                        ${config.ccEmails.length > 0 ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;">CC: ${config.ccEmails.join(', ')}</div>` : ''}
                    </td>
                    <td style="padding: 15px; background: #ffffff; border-right: 1px solid #f1f5f9; width: 33%;">
                        <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Billing Cycle</div>
                        <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Invoice: ${invoiceDate || '-'}</div>
                        <div style="font-size: 11px; color: #e11d48; font-weight: 700; margin-top: 3px;">Due: ${dueDate || '-'}</div>
                    </td>
                    <td style="padding: 15px; background: #f8fafc; width: 34%;">
                        <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Payment Terms</div>
                        <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${invoice.Terms || '0'} Days Credit</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Status: Payment Requested</div>
                    </td>
                </tr>
            </table>

            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 10px; padding-left: 5px;">Itemized Invoice Summary</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="padding-left: 15px;">Invoice #</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>GST Amt</th>
                        <th style="padding-right: 15px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding-left: 15px; font-weight: 700; color: #1e293b;">${invNo}</td>
                        <td style="font-size: 11px; color: #64748b;">${description || 'Standard Service'}</td>
                        <td style="font-weight: 600;">₹${price}</td>
                        <td style="font-weight: 600;">${quantity || 1}</td>
                        <td style="font-weight: 600;">₹${gstAmt}</td>
                        <td style="padding-right: 15px; text-align: right; font-weight: 800; color: #2563eb; font-size: 14px;">₹${total}</td>
                    </tr>
                </tbody>
            </table>

            <div class="signature">
                Best Regards,<br><br>
                Accounts Receivable Team
            </div>
        </div>
        <div class="footer" style="text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; font-weight: 600; margin: 0;">Automated message from Finance AR Bot System</p>
        </div>
    </div>
</body>
</html>
    `;
};
