/**
 * Email Template for Invoice Notifications
 * Matches the high-fidelity design with 12 table columns and professional signature.
 */
export const getInvoiceEmailTemplate = (invoice, { senderName, fromEmail, senderPhone, diffLabel, invoiceNo }) => {
    // Helper to format currency
    const fmt = (v) => `${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return `
    <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.6;">
        <p>Hello Team,</p>
        <br/>
        <p>The Invoice's given below will be due on the due date's mentioned in the table below. We request you to arrange for its payment on its due date.</p>
        <br/>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #999; font-size: 11px;">
            <tr style="background-color: #bfbfbf; font-weight: bold; text-align: center;">
                <th style="border: 1px solid #999; padding: 6px;">Invoice Date</th>
                <th style="border: 1px solid #999; padding: 6px;">Due Date</th>
                <th style="border: 1px solid #999; padding: 6px;">Payment Term</th>
                <th style="border: 1px solid #999; padding: 6px;">Today</th>
                <th style="border: 1px solid #999; padding: 6px;">OverDue By / Due Within</th>
                <th style="border: 1px solid #999; padding: 6px;">Invoice No.</th>
                <th style="border: 1px solid #999; padding: 6px;">Customer Name</th>
                <th style="border: 1px solid #999; padding: 6px;">Payment Status</th>
                <th style="border: 1px solid #999; padding: 6px;">USD</th>
                <th style="border: 1px solid #999; padding: 6px;">Gross INR</th>
                <th style="border: 1px solid #999; padding: 6px;">GST</th>
                <th style="border: 1px solid #999; padding: 6px;">Total Invoice Amount</th>
            </tr>
            <tr style="text-align: center; background-color: #ffffff;">
                <td style="border: 1px solid #999; padding: 8px;">${invoice.invoiceDate || '-'}</td>
                <td style="border: 1px solid #999; padding: 8px;">${invoice.dueDate || '-'}</td>
                <td style="border: 1px solid #999; padding: 8px;">${invoice.Terms || '-'}</td>
                <td style="border: 1px solid #999; padding: 8px;">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                <td style="border: 1px solid #999; padding: 8px;">${diffLabel}</td>
                <td style="border: 1px solid #999; padding: 8px;">${invoiceNo}</td>
                <td style="border: 1px solid #999; padding: 8px; color: #ff0000; font-weight: bold;">${invoice.companyName}</td>
                <td style="border: 1px solid #999; padding: 8px;">${invoice.paymentStatus || 'Due'}</td>
                <td style="border: 1px solid #999; padding: 8px;">-</td>
                <td style="border: 1px solid #999; padding: 8px;">${fmt(invoice.subtotal)}</td>
                <td style="border: 1px solid #999; padding: 8px;">${fmt(invoice.GST_Amount)}</td>
                <td style="border: 1px solid #999; padding: 8px;">${fmt(invoice.total_Amount)}</td>
            </tr>
        </table>

        <br/>
        <p>Best Regards,</p>
        <br/>
        <p style="font-weight: bold; margin-bottom: 20px;">Accounts Receivable Team</p>
        
        <div style="margin-top: 20px;">
            <img src="cid:logo1" alt="TecnoPrism" style="height: 60px; margin-right: 15px; vertical-align: middle;">
            <img src="cid:logo2" alt="Partner" style="height: 60px; vertical-align: middle;">
        </div>

        <p style="margin-top: 20px; font-style: italic;">
            <span style="font-weight: bold;">Mobile.</span> ${senderPhone || '+919712636570'} 
            <span style="font-weight: bold; margin-left: 10px;">Email.</span> <a href="mailto:${fromEmail || 'finance@tecnoprism.com'}" style="color: #007bff; text-decoration: underline;">${fromEmail || 'finance@tecnoprism.com'}</a>
        </p>
        <p style="margin-top: 5px;">
            <a href="http://www.tecnoprism.com" style="color: #007bff; text-decoration: underline; font-weight: bold;">www.tecnoprism.com</a>
        </p>
    </div>
    `;
};
