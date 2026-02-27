import express from 'express';
import CompanyEmail from '../models/CompanyEmail.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// GET all configured company emails
router.get('/', async (req, res) => {
    try {
        const configurations = await CompanyEmail.find().sort({ companyName: 1 });
        res.json(configurations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET unconfigured company names from invoices
router.get('/unconfigured', async (req, res) => {
    try {
        // Get all unique company names from Invoices
        const invoiceCompanies = await Invoice.distinct('companyName');

        // Get all configured company names
        const configuredCompanies = await CompanyEmail.distinct('companyName');

        // Filter out those already configured
        const unconfigured = invoiceCompanies.filter(name => name && !configuredCompanies.includes(name));

        res.json(unconfigured);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new configuration
router.post('/', async (req, res) => {
    try {
        const { companyName, toEmails, ccEmails } = req.body;

        // Check if already exists
        const existing = await CompanyEmail.findOne({ companyName });
        if (existing) {
            return res.status(400).json({ message: 'Company already configured' });
        }

        const config = new CompanyEmail({
            companyName,
            toEmails: toEmails || [],
            ccEmails: ccEmails || []
        });

        const newConfig = await config.save();
        res.status(201).json(newConfig);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update configuration
router.put('/:id', async (req, res) => {
    try {
        const { toEmails, ccEmails } = req.body;

        const updatedConfig = await CompanyEmail.findByIdAndUpdate(
            req.params.id,
            { toEmails, ccEmails },
            { new: true, runValidators: true }
        );

        if (!updatedConfig) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.json(updatedConfig);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE configuration
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await CompanyEmail.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Configuration not found' });
        }
        res.json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
