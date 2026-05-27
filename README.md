# Indian Wedding Invitation System 🎊

A beautiful, customizable Indian wedding invitation system with RSVP functionality, Canva-like design editor, and admin portal.

## Features

- 🎨 **Canva-like Editor**: Customize colors, fonts, images, layouts
- 💌 **RSVP System**: Collect guest responses with custom questions
- 🎵 **Music & Media**: Add background music and couple photos
- 🔐 **Magic Link Authentication**: Passwordless admin login
- 📧 **Email Notifications**: Automatic RSVP notifications to 3 emails
- 📱 **Responsive Design**: Beautiful on all devices
- 🎭 **Indian Wedding Themes**: Traditional designs and patterns

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Magic Link
- **Email**: Nodemailer
- **Design Editor**: Fabric.js
- **UI Components**: Shadcn/ui + Radix UI

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local development)
- Gmail account (for sending emails)

## Setup Instructions

### 1. Clone and Install

```bash
cd indian-wedding-card
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and update the following:

```env
# Admin emails (comma-separated) - Only these 3 emails can access admin portal
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com

# Gmail Configuration (for magic links and RSVP notifications)
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# RSVP notification emails (comma-separated)
RSVP_NOTIFICATION_EMAILS=email1@example.com,email2@example.com,email3@example.com

# Generate a random secret (keep this secret!)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 3. Get Gmail App Password

1. Go to Google Account Settings → Security
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the password to `SMTP_PASSWORD` in `.env.local`

### 4. Start with Docker

```bash
# Start PostgreSQL and the app
docker-compose up

# Or run in detached mode
docker-compose up -d
```

The app will be available at: **http://localhost:3000**

### 5. Alternative: Run Without Docker

```bash
# Start PostgreSQL separately (or use a cloud database)
# Update DATABASE_URL in .env.local

# Install dependencies
npm install

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## Usage Guide

### For Admins

1. **Login**
   - Go to http://localhost:3000/admin/login
   - Enter your admin email (must be in ADMIN_EMAILS)
   - Check email for magic link
   - Click link to access dashboard

2. **Create Wedding Card**
   - Click "Create New Card"
   - Fill in wedding details (names, date, venue)
   - Set RSVP deadline and max guests
   - Add custom question for RSVP

3. **Customize Design**
   - Use the Canva-like editor
   - Change colors, fonts, layouts
   - Upload couple photos or caricatures
   - Add background music (provide URL)
   - Preview in real-time

4. **Publish & Share**
   - Click "Publish" when ready
   - Copy the invitation link
   - Share with guests via WhatsApp, email, etc.

5. **Track RSVPs**
   - View all RSVPs in dashboard
   - Automatic email notifications to 3 specified emails
   - See guest count, responses, and custom answers

### For Guests

1. Click the invitation link shared by the couple
2. View the beautiful wedding invitation
3. Fill out the RSVP form:
   - Name, email, phone
   - Number of guests attending
   - Attending Yes/No
   - Answer custom question
   - Add special message or dietary restrictions
4. Submit - automatic confirmation

## Project Structure

```
indian-wedding-card/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── admin/             # Admin pages
│   │   │   ├── login/         # Magic link login
│   │   │   ├── dashboard/     # Card listing
│   │   │   └── cards/         # Card CRUD
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── cards/         # Card endpoints
│   │   │   └── rsvp/          # RSVP submission
│   │   └── invite/            # Guest-facing pages
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   └── lib/
│       ├── auth.ts            # Auth config
│       ├── email.ts           # Email functions
│       ├── prisma.ts          # Database client
│       └── utils.ts           # Utilities
├── docker-compose.yml
└── package.json
```

## Database Schema

- **User**: Admin users with magic link auth
- **WeddingCard**: Wedding invitation details and design
- **RSVP**: Guest responses
- **Session/Account/VerificationToken**: NextAuth tables

## API Endpoints

### Admin (Authenticated)
- `GET /api/cards` - List all cards
- `POST /api/cards` - Create new card
- `GET /api/cards/[id]` - Get card details
- `PATCH /api/cards/[id]` - Update card
- `DELETE /api/cards/[id]` - Delete card

### Public
- `POST /api/rsvp` - Submit RSVP (no auth required)

## Email Templates

The system sends two types of emails:

1. **Magic Link Email**: Sent to admins for login
2. **RSVP Notification Email**: Sent to 3 specified emails when someone RSVPs

Both use beautiful HTML templates with Indian wedding themes.

## Customization

### Add More Admin Users
Update `ADMIN_EMAILS` in `.env.local` with comma-separated emails

### Change RSVP Notification Recipients
Update `RSVP_NOTIFICATION_EMAILS` in `.env.local`

### Modify Email Templates
Edit functions in `src/lib/email.ts`

### Add Design Themes
Extend the design editor in card creation/edit pages

## Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

### Option 2: Docker

```bash
# Build production image
docker build -t wedding-card .

# Run with production env vars
docker run -p 3000:3000 --env-file .env.production wedding-card
```

## Troubleshooting

### Emails Not Sending
- Verify Gmail app password is correct
- Ensure 2FA is enabled on Gmail
- Check SMTP settings in `.env.local`

### Database Connection Issues
- Ensure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL format
- Run `npx prisma db push` to sync schema

### Magic Link Not Working
- Check NEXTAUTH_URL matches your domain
- Verify NEXTAUTH_SECRET is set (min 32 characters)
- Check admin email is in ADMIN_EMAILS list

## Contributing

This is a custom wedding invitation system. Feel free to customize for your needs!

## License

MIT License - Use for your special day! 💑
