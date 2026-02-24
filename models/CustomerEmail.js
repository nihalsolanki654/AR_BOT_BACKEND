import mongoose from 'mongoose';

const customerEmailSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    toEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    ccEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'customer_emails' // Explicitly setting collection name as requested
});

const CustomerEmail = mongoose.model('CustomerEmail', customerEmailSchema);

export default CustomerEmail;
