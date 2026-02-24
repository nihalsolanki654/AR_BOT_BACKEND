import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';
import CustomerEmail from './models/CustomerEmail.js';
import { syncDbToExcel } from './utils/excelUtils.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for migration...');

        const invoices = await Invoice.find();
        console.log(`Found ${invoices.length} invoices.`);

        const uniqueCompanies = [...new Set(invoices.map(inv => inv.companyName).filter(Boolean))];
        console.log(`Found ${uniqueCompanies.length} unique companies.`);

        for (const companyName of uniqueCompanies) {
            await CustomerEmail.findOneAndUpdate(
                { companyName },
                { companyName },
                { upsert: true, new: true }
            );
            console.log(`Synced: ${companyName}`);
        }

        console.log('Migration to database complete. Now syncing to Excel...');
        await syncDbToExcel();

        console.log('Migration and Sync successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
