# SMS Monitor Web Dashboard

A modern Next.js dashboard for monitoring and managing ingested SMS/RCS messages from authorized Android devices.

## Features

- **Real-Time Message Browsing**: Filter by sender, content, or receiver, with optional date-grouped layout.
- **Select All & Batch Actions**:
  - Bulk message selection with master "Select All" / indeterminate toggle.
  - Individual message selection checkboxes.
  - One-click bulk **Mark as Read** and **Mark as Unread**.
  - Selected count indicator and quick clear.
- **Individual Message Management**:
  - Detailed view with metadata (device timestamp, server received timestamp, receiver).
  - Quick toggle button to mark single messages as read or unread.
  - One-click copy message body to clipboard.
- **Security & Encryption**: AES-256-CBC encrypted storage for sensitive fields.
- **Authentication**: NextAuth.js with Google OAuth and email allowlisting.

## Getting Started

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Testing

Run the automated test suite using Vitest:

```bash
pnpm test
```

### Building

Create an optimized production build:

```bash
pnpm build
```

## API Endpoints

- `POST /api/sms`: Ingests incoming SMS payload (API key authenticated).
- `PATCH /api/sms/read`: Batch updates read status (`{ ids: string[], isRead: boolean }`).
- `PATCH /api/sms/[id]/read`: Updates read status for a single message (`{ isRead?: boolean }`).
