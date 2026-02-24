import express from 'express';
import CustomerEmail from '../models/CustomerEmail.js';
import { syncDbToExcel, syncExcelToDb } from '../utils/excelUtils.js';

const router = express.Router();

// GET all customer emails
router.get('/', async (req, res) => {
    try {
        const customers = await CustomerEmail.find().sort({ companyName: 1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new customer email (manual add)
router.post('/', async (req, res) => {
    try {
        const customer = new CustomerEmail(req.body);
        const newCustomer = await customer.save();

        // Sync to Excel
        await syncDbToExcel();

        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST /sync - Full sync between Excel and DB
router.post('/sync', async (req, res) => {
    try {
        // 1. Sync from Excel to DB (to pick up manual edits in Excel)
        await syncExcelToDb();
        // 2. Sync from DB to Excel (to ensure Excel is up to date with DB state)
        await syncDbToExcel();

        res.json({ message: 'Sync completed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
