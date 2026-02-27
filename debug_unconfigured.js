import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';
import CompanyEmail from './models/CompanyEmail.js';

dotenv.config();

async function checkUnconfigured() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const invoiceCompanies = await Invoice.distinct('companyName');
        const configurations = await CompanyEmail.find({}, { companyName: 1 });
        const configuredNamesSet = new Set(configurations.map(c => c.companyName.trim().toLowerCase()));

        const unconfigured = Array.from(new Set(invoiceCompanies
            .map(name => name ? name.trim() : null)
            .filter(name => {
                if (!name) return false;
                const lowerName = name.toLowerCase();
                const garbageValues = ['bill to', 'customer', 'n/a', 'unknown', 'name', 'test'];
                if (garbageValues.includes(lowerName)) return false;
                return !configuredNamesSet.has(lowerName);
            })
        )).sort();

        console.log('Invoice Companies:', invoiceCompanies);
        console.log('Unconfigured:', unconfigured);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUnconfigured();
