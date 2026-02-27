import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CompanyEmail from './models/CompanyEmail.js';

dotenv.config();

async function checkConfigs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const configs = await CompanyEmail.find().sort({ createdAt: -1 });
        console.log('All Company Email Configurations:', JSON.stringify(configs, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkConfigs();
