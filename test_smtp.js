import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testGmail() {
    console.log('Testing Gmail SMTP with:', process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('SUCCESS: SMTP Connection is valid!');

        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'SMTP Test - ' + new Date().toISOString(),
            text: 'If you see this, the SMTP settings are working perfectly.'
        });

        console.log('Test Email Sent!');
        console.log('Response:', info.response);
        process.exit(0);
    } catch (error) {
        console.error('FAILED: SMTP Connection error:');
        console.error(error);
        process.exit(1);
    }
}

testGmail();
