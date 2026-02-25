import express from 'express';
import nodemailer from 'nodemailer';
import Invoice from '../models/Invoice.js';
import CustomerEmail from '../models/CustomerEmail.js';

const router = express.Router();

// Create transporter - configured via environment variables
const createTransporter = () => nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// POST /api/mail/send-invoice/:invoiceId
router.post('/send-invoice/:invoiceId', async (req, res) => {
    try {
        const { senderName, fromEmail } = req.body;
        const invoice = await Invoice.findById(req.params.invoiceId);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const company = await CustomerEmail.findOne({ companyName: invoice.companyName });
        if (!company) return res.status(404).json({ message: 'No email contacts found for this company. Please set up emails in Company Emails page.' });

        const toEmails = company.toEmails?.filter(Boolean) || [];
        const ccEmails = company.ccEmails?.filter(Boolean) || [];

        if (toEmails.length === 0) {
            return res.status(400).json({ message: 'No TO email addresses configured for this company. Please add them in Company Emails page.' });
        }

        const transporter = createTransporter();

        // Format currency
        const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN')}`;

        const invoiceNo = invoice.invoiceNumber || invoice.invoice_number || invoice._id.toString().slice(-6).toUpperCase();

        const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; color: #1e293b; line-height: 1.5;">
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Invoice Details</h1>
                <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">${invoice.companyName}</p>
            </div>

            <!-- Body Content -->
            <div style="padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Invoice Information</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 40%;">Invoice Number</td>
                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${invoiceNo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Issue Date</td>
                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${invoice.invoiceDate || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Due Date</td>
                            <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: 800; text-align: right;">${invoice.dueDate || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">State / Location</td>
                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${invoice.State || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Payment Terms</td>
                            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${invoice.Terms || '-'}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Order Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: #f8fafc;">
                            <th style="padding: 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Description</th>
                            <th style="padding: 12px; text-align: center; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Qty</th>
                            <th style="padding: 12px; text-align: right; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Unit Price</th>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${invoice.description || 'Service/Product'}</td>
                            <td style="padding: 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: center; border-bottom: 1px solid #f1f5f9;">${invoice.quantity || 1}</td>
                            <td style="padding: 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-bottom: 1px solid #f1f5f9;">${fmt(invoice.total_price)}</td>
                        </tr>
                    </table>
                </div>

                <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px; font-weight: 500;">Subtotal</td>
                            <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${fmt(invoice.subtotal)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px; font-weight: 500;">Tax (GST ${invoice.GST || 0}%)</td>
                            <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${fmt(invoice.GST_Amount)}</td>
                        </tr>
                        <tr style="border-top: 1px solid #e2e8f0; margin-top: 8px;">
                            <td style="padding: 12px 0 4px; color: #0f172a; font-size: 14px; font-weight: 800;">Total Amount</td>
                            <td style="padding: 12px 0 4px; color: #0f172a; font-size: 18px; font-weight: 900; text-align: right;">${fmt(invoice.total_Amount)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #2563eb; font-size: 14px; font-weight: 800;">Balance Due</td>
                            <td style="padding: 4px 0; color: #2563eb; font-size: 20px; font-weight: 950; text-align: right;">${fmt(invoice.balance_due)}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 32px; text-align: center;">
                    <div style="display: inline-block; padding: 8px 16px; background: ${invoice.paymentStatus === 'Paid' ? '#f0fdf4' : '#fff7ed'}; border-radius: 99px; border: 1px solid ${invoice.paymentStatus === 'Paid' ? '#bbf7d0' : '#ffedd5'};">
                        <span style="font-size: 12px; font-weight: 800; color: ${invoice.paymentStatus === 'Paid' ? '#166534' : '#9a3412'}; text-transform: uppercase;">Status: ${invoice.paymentStatus || 'Pending'}</span>
                    </div>
                </div>

                <p style="margin-top: 40px; color: #94a3b8; font-size: 12px; text-align: center; font-style: italic;">
                    Sent by: ${senderName || 'Finance Team'} (${fromEmail || 'No Reply'})
                </p>
            </div>
        </div>
        `;

        const mailOptions = {
            from: `"${senderName || 'Finance Team'}" <${process.env.EMAIL_USER}>`,
            replyTo: fromEmail,
            to: toEmails.join(', '),
            cc: ccEmails.length > 0 ? ccEmails.join(', ') : undefined,
            subject: `Invoice #${invoiceNo} — ${invoice.companyName}`,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: `Email sent successfully to ${toEmails.length} recipient(s)${ccEmails.length > 0 ? ` and ${ccEmails.length} CC` : ''}.`,
            to: toEmails,
            cc: ccEmails,
        });

    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ message: error.message || 'Failed to send email.' });
    }
});

export default router;
