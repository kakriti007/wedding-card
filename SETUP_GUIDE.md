# Setup Guide - Indian Wedding Invitation System

## 🚀 Quick Start (5 minutes)

### Step 1: Configure Admin Emails

Edit `.env.local` and set your 3 admin emails:

```env
ADMIN_EMAILS=your-email1@gmail.com,your-email2@gmail.com,your-email3@gmail.com
```

**IMPORTANT**: Only these 3 emails will be able to access the admin portal!

### Step 2: Configure Gmail for Emails

You need a Gmail account to send magic link and RSVP notification emails.

1. **Enable 2-Factor Authentication on your Gmail**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Wedding Invitation"
   - Copy the 16-character password

3. **Update .env.local**

```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char app password (spaces optional)
EMAIL_FROM=noreply@yourwedding.com  # Can be any email
```

### Step 3: Set RSVP Notification Emails

Set the 3 emails that will receive RSVP notifications:

```env
RSVP_NOTIFICATION_EMAILS=email1@example.com,email2@example.com,email3@example.com
```

These can be the same as admin emails or different.

### Step 4: Generate Secret Key

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Add it to `.env.local`:

```env
NEXTAUTH_SECRET=<paste-the-generated-secret-here>
```

### Step 5: Start the Application

**Option A: Docker Compose (Recommended)**

```bash
docker-compose up
```

Wait for both services to start. You'll see:
- PostgreSQL running on port 5432
- App running on port 3000

**Option B: Local Development**

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Start PostgreSQL (separately or via Docker)
docker-compose up postgres -d

# 4. Push database schema
npx prisma db push

# 5. Start dev server
npm run dev
```

### Step 6: Access the Application

Open your browser and go to:
- **Home**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login

## 📧 Testing Email Functionality

### Test Magic Link Login

1. Go to http://localhost:3000/admin/login
2. Enter one of your admin emails
3. Click "Send Magic Link"
4. Check your email inbox
5. Click the link in the email
6. You should be logged into the dashboard!

If emails aren't working:
- ✅ Check your Gmail app password is correct
- ✅ Make sure 2FA is enabled on Gmail
- ✅ Check spam folder
- ✅ Look at terminal logs for error messages

## 🎨 Creating Your First Wedding Card

### 1. Login to Admin Portal

- Go to http://localhost:3000/admin/login
- Enter your admin email
- Check email for magic link
- Click link to access dashboard

### 2. Create New Card

Click "Create New Card" and fill in:

**Couple Information:**
- Bride's Name: e.g., "Priya"
- Groom's Name: e.g., "Raj"
- Invitation Message: Custom message or use default

**Wedding Details:**
- Wedding Date: Select date
- Wedding Time: Select time (e.g., 6:00 PM)
- Venue Name: e.g., "Grand Palace Banquet Hall"
- Venue Address: Full address

**RSVP Settings:**
- RSVP Deadline: Date by which guests must respond
- Max Guests per RSVP: Usually 2 (guest + plus one)
- Custom Question: e.g., "Will you need accommodation?"

**Optional:**
- Background Music URL: Link to MP3 file

Click "Create Wedding Card"

### 3. Customize Design

You'll be taken to the design editor where you can:

**Colors:**
- Primary Color: Main heading color
- Secondary Color: Accent elements
- Accent Color: Highlights
- Background Color: Card background

**Typography:**
- Font Family: Choose from 5 options
- Font Size: Adjust base size

**Preview:**
- See changes in real-time
- Click "Save Design" to save changes

### 4. Publish & Share

1. Click "Publish" button (top right)
2. Click "Copy Link" to get the invitation URL
3. Share the URL via:
   - WhatsApp: Send to groups/individuals
   - Email: Send invitation emails
   - SMS: Text the link
   - Social Media: Post on family groups

The URL will look like:
```
http://localhost:3000/invite/priya-raj-1234567890
```

## 👥 Guest Experience

### How Guests Use the Invitation

1. **Click the Link**
   - Guest receives the invitation link
   - Opens it in their browser (mobile or desktop)

2. **View Beautiful Invitation**
   - See couple names, date, time, venue
   - Background music plays (if configured)
   - Fully responsive on all devices

3. **Fill RSVP Form**
   - Click "RSVP Now"
   - Enter name, email, phone
   - Select "Attending" or "Not Attending"
   - If attending, specify number of guests
   - Answer custom question (if any)
   - Add dietary restrictions
   - Leave a message for the couple
   - Click "Submit RSVP"

4. **Confirmation**
   - Success message appears
   - RSVP is saved in database
   - 3 notification emails are sent to the specified addresses

## 📊 Tracking RSVPs

### View All Responses

1. Go to Admin Dashboard
2. Click on your wedding card
3. See RSVP count
4. Click "View RSVPs" to see all responses

### Email Notifications

Every RSVP submission sends an email to all 3 notification addresses with:
- Guest name and contact info
- Attending status (Yes/No)
- Number of guests
- Custom question answer
- Dietary restrictions
- Personal message

## 🛠️ Advanced Configuration

### Custom Domain (Production)

When deploying to production:

1. Update `.env.local`:
```env
NEXTAUTH_URL=https://yourdomain.com
```

2. Update email templates in `src/lib/email.ts` if needed

### Database Management

**View Database:**
```bash
npx prisma studio
```

Opens a GUI at http://localhost:5555 to:
- View all wedding cards
- See RSVPs
- Manage users

**Backup Database:**
```bash
docker exec wedding-card-db pg_dump -U weddinguser weddingcard > backup.sql
```

**Restore Database:**
```bash
docker exec -i wedding-card-db psql -U weddinguser weddingcard < backup.sql
```

### Adding More Admins

Just add their email to `ADMIN_EMAILS` in `.env.local`:

```env
ADMIN_EMAILS=email1@example.com,email2@example.com,email3@example.com,email4@example.com
```

Restart the app for changes to take effect.

## 🐛 Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check what's using port 3000
lsof -i :3000

# Or change the port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

**Database connection failed:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart just the database
docker-compose restart postgres
```

### Email Issues

**Magic link not received:**
- Check spam folder
- Verify SMTP_USER and SMTP_PASSWORD are correct
- Check terminal for error logs
- Test with a different email

**RSVP notifications not sending:**
- Verify RSVP_NOTIFICATION_EMAILS is set correctly
- Check email addresses are valid
- Look at terminal logs

### TypeScript Errors

If you see TypeScript errors in your IDE:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Clear Everything and Start Fresh

```bash
# Stop Docker containers
docker-compose down

# Remove volumes (deletes database)
docker-compose down -v

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install

# Start fresh
docker-compose up
```

## 📱 Mobile Testing

The invitation is fully responsive. Test on:

- iPhone Safari
- Android Chrome
- iPad/Tablet
- Desktop browsers

Use browser dev tools to test responsive views.

## 🎯 Production Deployment

### Deploy to Vercel (Easiest)

1. Push code to GitHub

2. Install Vercel CLI:
```bash
npm i -g vercel
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - All variables from `.env.local`
   - Update `NEXTAUTH_URL` to your Vercel URL

5. Use Vercel Postgres or external PostgreSQL

### Deploy with Docker

1. Build production image:
```bash
docker build -t wedding-invitation .
```

2. Run with production env:
```bash
docker run -p 3000:3000 --env-file .env.production wedding-invitation
```

## 🎊 Tips for Your Wedding

1. **Send Invitations Early**
   - Create card 2-3 months before wedding
   - Set RSVP deadline 2-3 weeks before wedding

2. **Test Everything**
   - Send test invitation to yourself
   - Submit a test RSVP
   - Verify notification emails arrive

3. **Track Responses**
   - Check dashboard regularly
   - Follow up with guests who haven't responded

4. **Backup Your Data**
   - Export RSVPs before the wedding
   - Keep a backup of the database

5. **Share the Link Smartly**
   - Create a short URL (bit.ly, tinyurl.com)
   - Add to wedding website
   - Include in WhatsApp messages

## 🆘 Need Help?

Check the logs:
```bash
# Docker logs
docker-compose logs -f

# Just app logs
docker-compose logs -f app
```

Common log files:
- Application errors: In terminal
- Database errors: In Docker logs
- Email errors: In terminal

## 🎉 Congratulations!

Your Indian Wedding Invitation System is ready! 

Enjoy your special day! 💑🎊
