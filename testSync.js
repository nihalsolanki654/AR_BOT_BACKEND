import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';
import CustomerEmail from './models/CustomerEmail.js';
import { syncDbToExcel } from './utils/excelUtils.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for test...');

        const testCompany = 'Test Sync Company ' + Date.now();

        console.log('Creating test invoice for:', testCompany);
        const invoice = new Invoice({
            companyName: testCompany,
            invoiceNumber: 'TEST-' + Date.now(),
            invoiceDate: new Date().toLocaleDateString(),
            dueDate: new Date().toLocaleDateString(),
            Terms: 'Net 30',
            total_Amount: 100,
            paymentStatus: 'Paid'
        });
        await invoice.save();

        console.log('Syncing to customer emails...');
        await CustomerEmail.findOneAndUpdate(
            { companyName: testCompany },
            { companyName: testCompany },
            { upsert: true, new: true }
        );

        console.log('Triggering syncDbToExcel...');
        await syncDbToExcel();

        console.log('Test completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

test();
