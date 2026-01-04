const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const db = require('./database');

const SMTP_PORT = process.env.SMTP_PORT || 2525;
const DOMAIN = process.env.DOMAIN || 'localhost';

const server = new SMTPServer({
    // Disable authentication for public temp mail
    // In a real scenario, you might want to restrict this
    authOptional: true,

    onData(stream, session, callback) {
        simpleParser(stream, (err, parsed) => {
            if (err) {
                console.error('Error parsing email:', err);
                return callback(new Error('Error parsing email'));
            }

            const { from, to, subject, text, html } = parsed;
            // 'to' is an object or array of objects. We care about the recipient in our domain.
            // For simplicity, we grab the first recipient address
            const recipient = to && to.text ? to.text : (Array.isArray(to) ? to[0].text : 'unknown');

            // Clean up recipient address if needed (extract email from "Name <email>")
            // This is a basic implementation.
            // Better processing might be needed to handle multiple recipients.

            // Filter for our domain if needed, but for now accept all provided valid SMTP envelope rcptTo happened before this.
            // The session.envelope.rcptTo gives the actual recipients specified in SMTP command.

            const envelopeRecipients = session.envelope.rcptTo.map(r => r.address);

            envelopeRecipients.forEach(rcpt => {
                console.log(`Received email for: ${rcpt}`);

                const stmt = db.prepare(`INSERT INTO emails (recipient, sender, subject, text_body, html_body) VALUES (?, ?, ?, ?, ?)`);
                stmt.run(rcpt, from ? from.text : 'unknown', subject, text, html, (err) => {
                    if (err) {
                        console.error('Error saving email:', err);
                    }
                });
                stmt.finalize();
            });

            callback();
        });
    },

    onRcptTo(address, session, callback) {
        // Optional: Validate recipient domain here
        // if (!address.address.endsWith(`@${DOMAIN}`)) {
        //   return callback(new Error('Only allowing emails to ' + DOMAIN));
        // }
        callback(); // Accept the recipient
    }
});

module.exports = {
    start: () => {
        server.listen(SMTP_PORT, () => {
            console.log(`SMTP Server running on port ${SMTP_PORT}`);
        });
    }
};
