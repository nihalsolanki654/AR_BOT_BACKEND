import { Resend } from 'resend';
import dotenv from 'dotenv';
import { getInvoiceEmailTemplate } from './emailTemplates.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an automated invoice email to a company
 * @param {Object} invoice - The invoice document
 * @param {Object} config - The CompanyEmail configuration
 * @returns {Promise<Object>} Resend response
 */
export const sendInvoiceEmail = async (invoice, config) => {
    if (!config || !config.toEmails || config.toEmails.length === 0) {
        throw new Error('No configuration found for this company');
    }

    const htmlContent = getInvoiceEmailTemplate(invoice);
    const invoiceNo = invoice.invoiceNumber || invoice.invoice_number || 'N/A';

    const { data, error } = await resend.emails.send({
        from: 'Finance Team <onboarding@resend.dev>', // Should be a verified domain in production
        to: config.toEmails,
        cc: config.ccEmails.length > 0 ? config.ccEmails : undefined,
        subject: `Invoice Statement #${invoiceNo} - ${invoice.companyName}`,
        html: htmlContent,
    });

    if (error) {
        console.error('Resend Error:', error);
        throw new Error(error.message);
    }

    return data;
};
