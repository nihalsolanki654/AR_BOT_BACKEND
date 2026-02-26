export const getInvoiceEmailTemplate = (invoices, { senderName, fromEmail, senderPhone, diffLabel, invoiceNo }) => {
    const fmt = (v) => `${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
    const invoiceList = Array.isArray(invoices) ? invoices : [invoices];

    const parseDate = (d) => {
        if (!d) return null;
        const parts = d.split('-');
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return new Date(d);
    };

    const rows = invoiceList.map((invoice, idx) => {
        let label = diffLabel;
        if (!label) {
            const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
            const due = parseDate(invoice.dueDate);
            if (due) {
                due.setHours(0, 0, 0, 0);
                const diffTime = due.getTime() - todayDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                label = diffDays < 0 ? `${Math.abs(diffDays)}d Overdue` : `${diffDays}d Due`;
            } else {
                label = '-';
            }
        }

        const invNo = invoice.invoiceNumber || invoice.invoice_number || invoiceNo || '-';

        return `
            <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${invoice.invoiceDate || '-'}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #1e293b;">${invNo}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">${invoice.companyName || '-'}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; color: ${label.includes('Overdue') ? '#ef4444' : '#10b981'};">
                        ${label}
                    </span>
                </td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 700; color: #1e293b;">
                    ₹${fmt(invoice.balance_due)}
                </td>
            </tr>
        `;
    }).join('');

    const totalBalance = invoiceList.reduce((acc, inv) => acc + parseFloat(inv.balance_due || 0), 0);

    return `
    <div style="background-color: #ffffff; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155;">
        <div style="max-width: 750px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
            
            <div style="margin-bottom: 30px;">
                <img src="cid:logo1" alt="Company Logo" style="height: 50px;">
            </div>

            <h2 style="color: #0f172a; margin-bottom: 20px; font-size: 22px;">Payment Statement Reminder</h2>
            
            <p style="font-size: 15px;">Hello <strong>Team</strong>,</p>
            <p style="font-size: 15px; margin-bottom: 25px;">
                We are writing to provide you with a summary of your outstanding balance. Please find the details of the pending invoice(s) below:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f8fafc;">
                        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Date</th>
                        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Invoice #</th>
                        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Customer</th>
                        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Timeline</th>
                        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Balance Due</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="padding: 15px; text-align: right; font-weight: 700; color: #64748b; font-size: 13px;">Total Outstanding Amount</td>
                        <td style="padding: 15px; text-align: right; font-size: 18px; font-weight: 800; color: #2563eb; border-top: 2px solid #e2e8f0;">
                            ₹${fmt(totalBalance)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">How to Pay:</p>
                <p style="margin: 5px 0 0; font-size: 13px; color: #1e3a8a;">
                    Kindly settle the outstanding amount via Bank Transfer as per the details mentioned in each invoice. If you have already made the payment, please disregard this email.
                </p>
            </div>

            <div style="margin-top: 40px; pt: 20px; border-top: 1px solid #f1f5f9; color: #64748b;">
                <p style="margin: 0; font-weight: 700; color: #1e293b; font-size: 14px;">Best Regards,</p>
                <p style="margin: 5px 0; font-size: 13px; font-weight: 600;">${senderName || 'Finance Support Team'}</p>
                <p style="margin: 2px 0; font-size: 12px;">Email: <a href="mailto:${fromEmail}" style="color: #2563eb; text-decoration: none;">${fromEmail || 'finance@tecnoprism.com'}</a></p>
                <p style="margin: 2px 0; font-size: 12px;">Phone: ${senderPhone || '+91 97126 36570'}</p>
                
                <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
                    &copy; 2026 TecnoPrism Solutions Private Limited. All rights reserved.
                </div>
            </div>
        </div>
    </div>
    `;
};
