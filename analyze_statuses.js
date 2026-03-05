import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';

dotenv.config();

function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) return new Date(dateStr); // YYYY-MM-DD
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // DD-MM-YYYY
    }
    return new Date(dateStr);
}

const getPaymentStatus = (invoice) => {
    const balance = parseFloat(invoice.balance_due || 0);
    if (balance <= 0) return 'Paid';

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = parseDate(invoice.dueDate);
    if (due) {
        due.setHours(0, 0, 0, 0);
        if (due < today) return 'Overdue';
        if (due.getTime() === today.getTime()) return 'Due Today';
    }

    const total = parseFloat(invoice.total_Amount || 0);
    if (balance >= total) return 'Due';
    return 'PartiallyPaid';
};

async function analyze() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const invoices = await Invoice.find({}).lean();

        const counts = {
            Paid: 0,
            Overdue: 0,
            'Due Today': 0,
            Due: 0,
            PartiallyPaid: 0,
            Unknown: 0
        };

        invoices.forEach(inv => {
            const status = getPaymentStatus(inv);
            counts[status] = (counts[status] || 0) + 1;
        });

        console.log('--- INVOICE ANALYSIS ---');
        console.log('Total Invoices:', invoices.length);
        console.log('Counts by Dynamic Status:', JSON.stringify(counts, null, 2));

        // Show some examples of Overdue that might be missed
        const overdueOnes = invoices.filter(inv => getPaymentStatus(inv) === 'Overdue').slice(0, 5);
        console.log('Overdue Examples:', JSON.stringify(overdueOnes.map(i => ({ no: i.invoiceNumber || i.invoice_number, due: i.dueDate, bal: i.balance_due })), null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
analyze();
