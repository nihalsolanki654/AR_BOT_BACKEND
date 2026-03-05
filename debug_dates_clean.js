import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';

dotenv.config();

async function checkDateFormats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const sample = await Invoice.find({}).limit(50).lean();
        console.log('--- DB SAMPLES ---');
        sample.forEach(inv => {
            const row = `No: ${inv.invoiceNumber || inv.invoice_number} | Status: ${inv.paymentStatus} | Due: ${inv.dueDate} | Bal: ${inv.balance_due}`;
            console.log(row);
        });
        console.log('--- END SAMPLES ---');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
checkDateFormats();
