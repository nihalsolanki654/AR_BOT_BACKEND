import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';
import fs from 'fs';

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

        const counts = {};
        const samples = {};

        invoices.forEach(inv => {
            const status = getPaymentStatus(inv);
            counts[status] = (counts[status] || 0) + 1;
            if (!samples[status]) samples[status] = [];
            if (samples[status].length < 3) {
                samples[status].push({
                    no: inv.invoiceNumber || inv.invoice_number,
                    due: inv.dueDate,
                    bal: inv.balance_due,
                    total: inv.total_Amount,
                    statusInDB: inv.paymentStatus
                });
            }
        });

        const report = {
            total: invoices.length,
            counts,
            samples
        };

        fs.writeFileSync('status_report.json', JSON.stringify(report, null, 2));
        console.log('Report written to status_report.json');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('status_error.txt', err.stack);
        process.exit(1);
    }
}
analyze();
