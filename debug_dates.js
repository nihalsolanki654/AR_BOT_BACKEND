import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';

dotenv.config();

async function checkDateFormats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const sample = await Invoice.find({}).limit(20).lean();
        sample.forEach(inv => {
            console.log(`Inv: ${inv.invoiceNumber || inv.invoice_number}, Status: ${inv.paymentStatus}, Due: ${inv.dueDate}, Balance: ${inv.balance_due}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDateFormats();
