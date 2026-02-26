
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    Terms: { type: String, required: true },
    companyName: { type: String },
    State: { type: String },
    total_Amount: { type: Number },
    balance_due: { type: Number, default: 0 },
    description: { type: String },
    quantity: { type: Number, default: 1 },
    total_price: { type: Number },
    subtotal: { type: Number },
    GST: { type: Number, default: 18 },
    GST_Amount: { type: Number, default: 0 },
    paymentStatus: {
        type: String,
        enum: ['Due', 'Paid', 'PartiallyPaid', 'Overdue'],
        default: 'Due'
    }
}, { timestamps: true });

// Performance Indexes
invoiceSchema.index({ companyName: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ createdAt: -1 });

// Helper to sync company name to CustomerEmail model
const syncCustomer = async (companyName) => {
    if (!companyName) return;
    try {
        await mongoose.model('CustomerEmail').findOneAndUpdate(
            { companyName: companyName },
            { companyName: companyName },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error syncing companyName to CustomerEmail:', error);
    }
};

// Sync on creation
invoiceSchema.post('save', async function (doc) {
    await syncCustomer(doc.companyName);
});

// Sync on update
invoiceSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) await syncCustomer(doc.companyName);
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
