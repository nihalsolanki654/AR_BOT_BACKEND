import express from 'express';
import Invoice from '../models/Invoice.js';

const router = express.Router();

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

export default router;
