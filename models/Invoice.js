import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerMobile: { type: String },
    customerState: { type: String },
    gross: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['Due', 'Paid', 'PartiallyPaid', 'Overdue'],
        default: 'Due'
    },
    paidAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
