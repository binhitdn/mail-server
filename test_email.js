const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 2525,
    secure: false, // true for 465, false for other ports
    tls: {
        rejectUnauthorized: false
    }
});

async function main() {
    const info = await transporter.sendMail({
        from: '"Tester" <sender@example.com>', // sender address
        to: 'randomUser@tempmail.local', // list of receivers
        subject: 'Hello from Temp Mail', // Subject line
        text: 'This is a test email sent to your local temp mail server.', // plain text body
        html: '<b>This is a test email sent to your local temp mail server.</b>', // html body
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
