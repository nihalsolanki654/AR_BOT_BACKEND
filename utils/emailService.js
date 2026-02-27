import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getInvoiceEmailTemplate } from './emailTemplates.js';

dotenv.config();

/**
 * Send an automated invoice email using Gmail SMTP
 * @param {Object} invoice - The invoice document
 * @param {Object} config - The CompanyEmail configuration
 * @returns {Promise<Object>} Nodemailer response
 */
export const sendInvoiceEmail = async (invoice, config) => {
    if (!config || !config.toEmails || config.toEmails.length === 0) {
        throw new Error('No configuration found for this company');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const htmlContent = getInvoiceEmailTemplate(invoice);
    const invoiceNo = invoice.invoiceNumber || invoice.invoice_number || 'N/A';

    const mailOptions = {
        from: `"Finance Team" <${process.env.EMAIL_USER}>`,
        to: config.toEmails.join(', '),
        cc: config.ccEmails.length > 0 ? config.ccEmails.join(', ') : undefined,
        subject: `Invoice Statement #${invoiceNo} - ${invoice.companyName}`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('SMTP Error:', error);
        throw new Error('Failed to send email via Gmail. Please check your App Password.');
    }
};
