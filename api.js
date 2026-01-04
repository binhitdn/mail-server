const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all emails (for debugging/admin)
app.get('/api/emails', (req, res) => {
    const query = `SELECT id, sender, recipient, subject, received_at FROM emails ORDER BY received_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ emails: rows });
    });
});

// Get all emails for a specific address
app.get('/api/inbox/:address', (req, res) => {
    const address = req.params.address;
    // Basic SQL injection protection is handled by sqlite3 bind parameters, 
    // but good to valid address format too.

    const query = `SELECT id, sender, subject, received_at FROM emails WHERE recipient = ? ORDER BY received_at DESC`;

    db.all(query, [address], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            address: address,
            emails: rows
        });
    });
});

// Get detailed email content
app.get('/api/email/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM emails WHERE id = ?`;

    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Email not found' });
            return;
        }
        res.json(row);
    });
});

// Generate a random email address (Helper for frontend)
app.get('/api/generate', (req, res) => {
    const randomString = Math.random().toString(36).substring(7);
    const domain = process.env.DOMAIN || 'localhost';
    res.json({ email: `${randomString}@${domain}` });
});

module.exports = {
    start: () => {
        app.listen(HTTP_PORT, () => {
            console.log(`HTTP API running on port ${HTTP_PORT}`);
        });
    }
};
