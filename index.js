require('dotenv').config();
const smtpServer = require('./smtp');
const apiServer = require('./api');

console.log("Starting Temp Mail Backend...");

// Start SMTP Server
smtpServer.start();

// Start HTTP API
apiServer.start();
