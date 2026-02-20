import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';
import memberRoutes from './routes/memberRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/members', memberRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Finance Portal API is running');
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nihal:nihal1234@arbot.ht878kn.mongodb.net/finance_portal';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
