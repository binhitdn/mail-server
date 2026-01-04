
# Temp Mail Backend

This is a complete backend for a temporary email service. It includes:

1.  **SMTP Server**: Receives emails sent to your domain.
2.  **HTTP API**: Allows frontend clients to create mailboxes and read emails.
3.  **Database**: Stores received emails.

## Prerequisites

-   Node.js installed.
-   A domain name (if deploying to production).
-   Port 25 open (for production receiving) or use 2525 for testing.

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000           # HTTP API Port
SMTP_PORT=2525      # SMTP Server Port (Use 25 for production)
DOMAIN=example.com  # Your domain
```

## API Endpoints

-   `GET /api/inbox/:address`: Get emails for a specific address.
-   `GET /api/email/:id`: Get full content of an email.
# mail-server
