import express from 'express';
import Invoice from '../models/Invoice.js';
import CompanyEmail from '../models/CompanyEmail.js';
import { sendInvoiceEmail } from '../utils/emailService.js';

// --- Helpers to match frontend logic ---
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr !== 'string') return new Date(dateStr);

    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        // Check if YYYY-MM-DD
        if (parts[0].length === 4) return new Date(dateStr);
        // Otherwise assume DD-MM-YYYY
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dateStr);
};

const getPaymentStatus = (invoice) => {
    const balance = parseFloat(invoice.balance_due || 0);
    if (balance <= 0) return 'Paid';

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = parseDate(invoice.dueDate);
    if (due) {
        due.setHours(0, 0, 0, 0);
        if (due < today) return 'Overdue';
        if (due.getTime() === today.getTime()) return 'Due Today';
    }

    if (invoice.paymentStatus && ['Paid', 'Overdue', 'Due Today'].includes(invoice.paymentStatus)) {
        return invoice.paymentStatus;
    }

    const total = parseFloat(invoice.total_Amount || 0);
    if (balance >= total) return 'Due';
    return 'PartiallyPaid';
};


const router = express.Router();


// GET all invoices (with pagination, search, and filter)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || 'All';

        // 1. Build Search Query (Ignore status for now)
        let searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { invoice_number: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }

        console.log(`[FETCH] Status: ${status} | Search: "${search}"`);

        // 2. Fetch all matching search but ignore status for now to filter in memory
        const allInvoices = await Invoice.find(searchQuery)
            .sort({ createdAt: -1 })
            .lean();

        // DEBUG: Check if any invoice has lastEmailSentAt
        const withDate = allInvoices.filter(inv => inv.lastEmailSentAt);
        console.log(`[GET /] Total: ${allInvoices.length}, With Email Sent Date: ${withDate.length}`);
        if (withDate.length > 0) {
            console.log(`[GET /] Sample with date: ${withDate[0].invoiceNumber || withDate[0].invoice_number} sent at ${withDate[0].lastEmailSentAt}`);
        }

        // 3. Filter in memory to match frontend logic exactly
        const filteredInvoices = status === 'All'
            ? allInvoices
            : allInvoices.filter(inv => {
                const dynamicStatus = getPaymentStatus(inv);
                // Handle "Due" and "Due Today" as "Due" if the user clicked the Due tab
                if (status === 'Due') return dynamicStatus === 'Due' || dynamicStatus === 'Due Today';
                return dynamicStatus === status;
            });

        // 4. Apply pagination on filtered results
        const total = filteredInvoices.length;
        const paginatedInvoices = filteredInvoices.slice(skip, skip + limit);

        console.log(`[FILTER RESULT] Status: ${status} | Total Match: ${total} | Returning: ${paginatedInvoices.length}`);

        res.json({
            invoices: paginatedInvoices,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET financial statistics (Optimized)
router.get('/stats', async (req, res) => {
    try {
        const stats = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: "$total_Amount" },
                    balanceDue: { $sum: "$balance_due" },
                    paidCount: {
                        $sum: { $cond: [{ $lte: ["$balance_due", 0] }, 1, 0] }
                    },
                    pendingCount: {
                        $sum: { $cond: [{ $gt: ["$balance_due", 0] }, 1, 0] }
                    }
                }
            }
        ]);

        // Calculate Overdue (Simplified for now - can be refined with date logic)
        const todayStr = new Date().toISOString().split('T')[0];
        const overdue = await Invoice.aggregate([
            {
                $match: {
                    balance_due: { $gt: 0 },
                    dueDate: { $lt: todayStr }
                }
            },
            {
                $group: {
                    _id: null,
                    amount: { $sum: "$balance_due" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || { totalInvoices: 0, totalAmount: 0, balanceDue: 0, paidCount: 0, pendingCount: 0 };
        const overdueResult = overdue[0] || { amount: 0, count: 0 };

        res.json({
            ...result,
            overdueAmount: overdueResult.amount,
            overdueCount: overdueResult.count,
            paidAmount: result.totalAmount - result.balanceDue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET latest invoice
router.get('/latest', async (req, res) => {
    try {
        const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        res.json(latestInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new invoice
router.post('/', async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        const newInvoice = await invoice.save();

        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update invoice
router.put('/:id', async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);



        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST send email for invoice
router.post('/:id/send-email', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).lean();
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Search for company configuration (case-insensitive)
        const normalizedName = invoice.companyName.trim().toLowerCase();
        const config = await CompanyEmail.findOne({
            companyName: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
        });

        if (!config) {
            return res.status(400).json({
                message: `No email configuration found for "${invoice.companyName}". Please set up emails in the Company Emails page.`
            });
        }

        const type = req.body.type || 'due';
        const emailResult = await sendInvoiceEmail(invoice, config, type);

        // Formatting date for string field
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const formattedDate = `${d}-${m}-${y}`;

        // Update the invoice with both fields
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                lastEmailSentAt: now,
                emailSentDate: formattedDate
            },
            { new: true } // Return the updated document
        ).lean();

        console.log(`[EMAIL SENT] Invoice ${updatedInvoice.invoiceNumber || updatedInvoice.invoice_number} updated with Sent Date: ${formattedDate}`);

        res.json({
            message: 'Email sent successfully',
            result: emailResult,
            invoice: updatedInvoice
        });
    } catch (error) {
        console.error('Email Route Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
