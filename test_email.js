require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: process.env.SMTP_PORT || 25,
    secure: false, 
    tls: {
        rejectUnauthorized: false
    }
});

async function main() {
    const domain = process.env.DOMAIN || 'localhost';
    const info = await transporter.sendMail({
        from: '"Tester" <sender@example.com>',
        to: `hello@${domain}`, 
        subject: 'Hello from Temp Mail',
        text: 'This is a test email sent to your local temp mail server.',
        html: '<b>This is a test email sent to your local temp mail server.</b>',
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
