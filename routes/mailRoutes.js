import express from 'express';
import nodemailer from 'nodemailer';
import Invoice from '../models/Invoice.js';
import CustomerEmail from '../models/CustomerEmail.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getInvoiceEmailTemplate } from '../utils/email_formate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const { senderName, fromEmail, senderPhone } = req.body;
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

        // Helper to parse DD-MM-YYYY
        const parseDate = (d) => {
            if (!d) return new Date();
            const parts = d.split('-');
            if (parts.length === 3) {
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
            return new Date(d);
        };

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const due = parseDate(invoice.dueDate);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const overdueDays = diffDays < 0 ? Math.abs(diffDays) : diffDays;
        const diffLabel = diffDays < 0 ? overdueDays : diffDays;

        // Format currency
        const fmt = (v) => `${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        const invoiceNo = invoice.invoiceNumber || invoice.invoice_number || invoice._id.toString().slice(-6).toUpperCase();

        const htmlBody = getInvoiceEmailTemplate(invoice, {
            senderName,
            fromEmail,
            senderPhone,
            diffLabel,
            invoiceNo
        });

        const logo1Path = path.resolve(__dirname, '../../frontend/image/Picture1.png');
        const logo2Path = path.resolve(__dirname, '../../frontend/image/Picture2.png');

        const attachments = [];
        if (fs.existsSync(logo1Path)) {
            attachments.push({
                filename: 'Picture1.png',
                path: logo1Path,
                cid: 'logo1'
            });
        }
        if (fs.existsSync(logo2Path)) {
            attachments.push({
                filename: 'Picture2.png',
                path: logo2Path,
                cid: 'logo2'
            });
        }

        const mailOptions = {
            from: `"${senderName || 'Accounts Receivable Team'}" <${process.env.EMAIL_USER}>`,
            replyTo: fromEmail,
            to: toEmails.join(', '),
            cc: ccEmails.length > 0 ? ccEmails.join(', ') : undefined,
            subject: `Invoice Overdue/Due Notice — ${invoice.companyName}`,
            html: htmlBody,
            attachments: attachments
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
