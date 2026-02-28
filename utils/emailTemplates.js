/**
 * Email Template System
 * Professional, Responsive, and Premium HTML template for Invoice Statements
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
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Notification</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f7fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7fa; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        
        /* Mobile Improvements */
        @media screen and (max-width: 600px) {
            .content { padding: 20px !important; }
            .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; margin-bottom: 15px; }
            .hide-on-mobile { display: none !important; }
            .show-on-mobile { display: block !important; }
            .mobile-center { text-align: center !important; }
            .mobile-padding { padding-left: 10px !important; padding-right: 10px !important; }
            .header-h1 { font-size: 24px !important; }
        }
    </style>
</head>
<body style="background-color: #f4f7fa; margin: 0; padding: 0;">
    <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 40px 20px; text-align: center;">
                    <h1 class="header-h1" style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">AR_EMAIL</h1>
                    <p style="color: #6ee7b7; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Accounts Receivable Management</p>
                </td>
            </tr>

            <!-- Greeting -->
            <tr>
                <td class="content" style="padding: 40px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Dear ${companyName},</h2>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                        We trust you are doing well. Please find the details of your outstanding invoice provided below. We kindly request you to coordinate the payment by the specified due date.
                    </p>

                    <!-- Summary Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                        <tr>
                            <td style="padding: 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td class="stack-column" width="50%" valign="top">
                                            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Invoice Number</p>
                                            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">#${invNo}</p>
                                        </td>
                                        <td class="stack-column" width="50%" valign="top">
                                            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Due Date</p>
                                            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: #dc2626;">${dueDate || 'Pending'}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding-top: 20px;">
                                            <div style="height: 1px; background-color: #e2e8f0;"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="stack-column" width="50%" valign="top" style="padding-top: 20px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Total Amount</p>
                                            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">₹${total}</p>
                                        </td>
                                        <td class="stack-column" width="50%" valign="top" style="padding-top: 20px;">
                                            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Balance Due</p>
                                            <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #059669;">₹${balance}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- Itemized List Table -->
                    <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; padding-left: 4px;">Itemized Invoice Summary</p>
                    <div style="width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr style="background-color: #f8fafc;">
                                    <th style="padding: 12px 15px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; border-bottom: 2px solid #e2e8f0;">DESC</th>
                                    <th style="padding: 12px 15px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; border-bottom: 2px solid #e2e8f0;">QTY</th>
                                    <th style="padding: 12px 15px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; border-bottom: 2px solid #e2e8f0;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 500;">${description || 'Standard Invoice'}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 14px;">${quantity || 1}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: 700; color: #022c22;">₹${total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Footer Signature -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
                        <tr>
                            <td style="border-top: 2px solid #f1f5f9; padding-top: 30px;">
                                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">Best Regards,</p>
                                <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 500; color: #475569;">Accounts Receivable Team</p>
                                <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 800; color: #059669;">AR_EMAIL Automated Bot</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Footer Bottom -->
            <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                        This is an automated statement. Please do not reply directly to this email.<br>
                        Generated by **Finance Portal AR Bot System**
                    </p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
    `;
};
