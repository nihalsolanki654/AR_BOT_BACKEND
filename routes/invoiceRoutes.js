import express from 'express';
import Invoice from '../models/Invoice.js';
import CustomerEmail from '../models/CustomerEmail.js';
import { syncDbToExcel, EXCEL_FILE_PATH } from '../utils/excelUtils.js';

const router = express.Router();

router.get('/download-excel', (req, res) => {
    res.download(EXCEL_FILE_PATH);
});


// GET all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
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

        // Sync to customer_emails
        if (req.body.companyName) {
            await CustomerEmail.findOneAndUpdate(
                { companyName: req.body.companyName },
                { companyName: req.body.companyName },
                { upsert: true, new: true }
            );
        }

        // 🔥 Always sync
        await syncDbToExcel();

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

        if (req.body.companyName) {
            await CustomerEmail.findOneAndUpdate(
                { companyName: req.body.companyName },
                { companyName: req.body.companyName },
                { upsert: true, new: true }
            );
        }

        // 🔥 Always sync
        await syncDbToExcel();

        // 🔥 Always sync
        await syncDbToExcel();
        res.json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);

        // 🔥 Sync after delete
        await syncDbToExcel();

        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
