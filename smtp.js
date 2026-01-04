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
                console.error('Lỗi phân giải email:', err);
                return callback(new Error('Error parsing email'));
            }

            const { from, subject, text, html } = parsed;
            const sender = from ? from.text : 'unknown';
            const envelopeRecipients = session.envelope.rcptTo.map(r => r.address);

            console.log(`--- Nhận mail mới ---`);
            console.log(`Từ: ${sender}`);
            console.log(`Tới (Envelope): ${envelopeRecipients.join(', ')}`);
            console.log(`Tiêu đề: ${subject}`);

            // Lưu từng người nhận vào Database
            const query = `INSERT INTO emails (recipient, sender, subject, text_body, html_body) VALUES (?, ?, ?, ?, ?)`;
            
            let completed = 0;
            if (envelopeRecipients.length === 0) return callback();

            envelopeRecipients.forEach(rcpt => {
                db.run(query, [rcpt, sender, subject, text, html], (err) => {
                    if (err) {
                        console.error(`Lỗi lưu email cho ${rcpt}:`, err.message);
                    } else {
                        console.log(`Đã lưu email vào inbox của: ${rcpt}`);
                    }
                    
                    completed++;
                    if (completed === envelopeRecipients.length) {
                        callback();
                    }
                });
            });
        });
    },

    onRcptTo(address, session, callback) {
        // Chấp nhận tất cả email gửi đến domain của mình
        console.log(`Đang kiểm tra người nhận: ${address.address}`);
        callback(); 
    }
});

module.exports = {
    start: () => {
        server.listen(SMTP_PORT, () => {
            console.log(`SMTP Server đang chạy tại port ${SMTP_PORT}`);
            console.log(`Domain: ${DOMAIN}`);
        });
    }
};
