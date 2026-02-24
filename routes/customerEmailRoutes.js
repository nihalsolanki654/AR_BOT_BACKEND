import express from 'express';
import CustomerEmail from '../models/CustomerEmail.js';

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
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
