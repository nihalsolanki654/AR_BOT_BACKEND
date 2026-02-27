import mongoose from 'mongoose';

const companyEmailSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    toEmails: {
        type: [String],
        validate: [
            {
                validator: function (v) {
                    return v.length <= 4;
                },
                message: 'Maximum 4 To email addresses allowed'
            }
        ],
        default: []
    },
    ccEmails: {
        type: [String],
        validate: [
            {
                validator: function (v) {
                    return v.length <= 8;
                },
                message: 'Maximum 8 CC email addresses allowed'
            }
        ],
        default: []
    }
}, { timestamps: true });

// Performance index
companyEmailSchema.index({ companyName: 1 });

const CompanyEmail = mongoose.model('CompanyEmail', companyEmailSchema);
export default CompanyEmail;
