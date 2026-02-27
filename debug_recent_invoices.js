import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';

dotenv.config();

async function checkInvoices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent Invoices:', JSON.stringify(invoices, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkInvoices();
