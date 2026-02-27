import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getInvoiceEmailTemplate } from './emailTemplates.js';

dotenv.config();

// Create a reusable transporter with connection pooling for fast delivery
const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true, // Use connection pooling
    maxConnections: 3,
    maxMessages: 100,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection on startup to ensure it's always ready
transporter.verify((error) => {
    if (error) {
        console.error('[EMAIL] SMTP Connection Error:', error);
    } else {
        console.log('[EMAIL] SMTP Server ready for fast delivery');
    }
});

/**
 * Send an automated invoice email using Gmail SMTP
 * @param {Object} invoice - The invoice document
 * @param {Object} config - The CompanyEmail configuration
 * @returns {Promise<Object>} Nodemailer response
 */
export const sendInvoiceEmail = async (invoice, config) => {
    const toRecipients = (config.toEmails || []).filter(email => email && email.trim() !== '');
    const ccRecipients = (config.ccEmails || []).filter(email => email && email.trim() !== '');

    if (toRecipients.length === 0) {
        throw new Error(`No valid "To" email addresses found for ${invoice.companyName}.`);
    }

    const htmlContent = getInvoiceEmailTemplate(invoice, config);
    const invoiceNo = invoice.invoiceNumber || invoice.invoice_number || 'N/A';

    const mailOptions = {
        from: `"Accounts Receivable Team" <${process.env.EMAIL_USER}>`,
        to: toRecipients.join(', '),
        cc: ccRecipients.length > 0 ? ccRecipients.join(', ') : undefined,
        subject: `Invoice Announcement #${invoiceNo} - ${invoice.companyName}`,
        html: htmlContent,
        replyTo: process.env.EMAIL_USER
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Fast Delivery Success:', info.messageId);
        return info;
    } catch (error) {
        console.error('[EMAIL] Delivery Error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
