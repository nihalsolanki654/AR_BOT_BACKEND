/**
 * Email Template System
 * Professional and Premium HTML template for Invoice Statements
 */

export const getInvoiceEmailTemplate = (invoice) => {
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
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; }
        .header p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; font-weight: 500; }
        .content { padding: 30px; background: #ffffff; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .detail-value { font-size: 14px; font-weight: 600; color: #1e293b; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th { text-align: left; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 12px 0; border-bottom: 2px solid #f1f5f9; }
        .table td { padding: 15px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .total-section { border-top: 2px solid #0f172a; padding-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total-label { font-size: 14px; color: #64748b; font-weight: 500; }
        .total-value { font-size: 14px; color: #1e293b; font-weight: 600; }
        .grand-total { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .grand-total-label { font-size: 16px; font-weight: 800; color: #0f172a; }
        .grand-total-value { font-size: 24px; font-weight: 800; color: #2563eb; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; font-size: 12px; color: #64748b; font-weight: 500; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 20px; transition: background 0.2s; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-unpaid { background: #fff1f2; color: #e11d48; }
        .status-paid { background: #ecfdf5; color: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Request</h1>
            <p>Invoice Statement #${invNo}</p>
        </div>
        <div class="content">
            <div class="greeting">Dear ${companyName},</div>
            <p style="font-size: 14px; color: #475569; margin-bottom: 25px;">
                Please find the details of your outstanding invoice below. We kindly request you to process the payment by the due date mentioned.
            </p>
            
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Invoice Date</div>
                    <div class="detail-value">${invoiceDate || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Due Date</div>
                    <div class="detail-value">${dueDate || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div>
                        <span class="status-badge ${parseFloat(balance_due) > 0 ? 'status-unpaid' : 'status-paid'}">
                            ${parseFloat(balance_due) > 0 ? 'Outstanding' : 'Paid'}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Invoice #</div>
                    <div class="detail-value">${invNo}</div>
                </div>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 60%;">Description</th>
                        <th style="text-align: center; width: 15%;">Qty</th>
                        <th style="text-align: right; width: 25%;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div style="font-weight: 700; color: #1e293b;">Service / Items</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${description || 'No description provided'}</div>
                        </td>
                        <td style="text-align: center; font-weight: 600; color: #1e293b;">${quantity || 1}</td>
                        <td style="text-align: right; font-weight: 600; color: #1e293b;">₹${price}</td>
                    </tr>
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <div class="total-label">Subtotal</div>
                    <div class="total-value">₹${sub}</div>
                </div>
                <div class="total-row">
                    <div class="total-label">GST (${GST || 18}%)</div>
                    <div class="total-value">₹${gstAmt}</div>
                </div>
                <div class="grand-total">
                    <div class="grand-total-label">Amount Due</div>
                    <div class="grand-total-value">₹${balance}</div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 10px;">
                <p style="font-size: 11px; color: #94a3b8; font-weight: 600;">Thank you for your business!</p>
            </div>
        </div>
        <div class="footer">
            <p>Finance Team | AR Bot System</p>
            <p>&copy; 2026 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};
