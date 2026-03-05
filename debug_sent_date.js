import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';

dotenv.config();

async function checkSentDate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const lastSent = await Invoice.find({ lastEmailSentAt: { $exists: true } }).lean();
        console.log(`Found ${lastSent.length} invoices with lastEmailSentAt`);
        lastSent.forEach(inv => {
            console.log(`Invoice ${inv.invoiceNumber || inv.invoice_number}: ${inv.lastEmailSentAt}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkSentDate();
