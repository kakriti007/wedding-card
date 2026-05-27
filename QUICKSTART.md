# 🎊 Quick Start - 5 Minutes to Your Wedding Invitation!

## Prerequisites
- Node.js 20+ installed
- Docker Desktop installed and running
- Gmail account with 2FA enabled

## Step 1: Configure Environment (2 minutes)

Copy the example file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and update:

```env
# 1. YOUR 3 ADMIN EMAILS (who can access admin portal)
ADMIN_EMAILS=your-email@gmail.com,admin2@gmail.com,admin3@gmail.com

# 2. YOUR GMAIL CREDENTIALS
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password-here

# 3. WHO RECEIVES RSVP NOTIFICATIONS (can be same as admin emails)
RSVP_NOTIFICATION_EMAILS=email1@gmail.com,email2@gmail.com,email3@gmail.com

# 4. GENERATE SECRET (run: openssl rand -base64 32)
NEXTAUTH_SECRET=paste-generated-secret-here
```

### Get Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)" → Name it "Wedding"
3. Copy the 16-character password → Paste in `SMTP_PASSWORD`

## Step 2: Start Everything (1 minute)

```bash
docker-compose up
```

Wait for logs to show:
- ✓ PostgreSQL ready
- ✓ App running on http://localhost:3000

## Step 3: Test Login (1 minute)

1. Open http://localhost:3000/admin/login
2. Enter your admin email
3. Check your email for magic link
4. Click the link → You're in! 🎉

## Step 4: Create Your Invitation (1 minute)

1. Click "Create New Card"
2. Fill in:
   - Bride & Groom names
   - Wedding date, time, venue
   - RSVP deadline
3. Click "Create Wedding Card"

## Step 5: Customize & Publish

1. Choose colors, fonts (or use defaults)
2. Click "Save Design"
3. Click "Publish" (top right)
4. Click "Copy Link"
5. Share with guests! 🎊

## Your Invitation Link

```
http://localhost:3000/invite/your-names-here
```

## What's Next?

- 📱 **Share**: Send link via WhatsApp, email, SMS
- 👀 **Track**: View RSVPs in dashboard
- 📧 **Notifications**: Get email for each RSVP
- 🎨 **Customize**: Change design anytime

## Need Help?

- 📖 Full guide: Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 📚 Features: Read [README.md](./README.md)
- 🐛 Issues: Check terminal logs

## Common Issues

**Emails not sending?**
- Check Gmail app password
- Look for error in terminal
- Try different email

**Port 3000 in use?**
- Change port in docker-compose.yml
- Or stop other apps using port 3000

**Database error?**
- Restart: `docker-compose restart`
- Or rebuild: `docker-compose down && docker-compose up`

## Stop the App

```bash
# Stop (keeps data)
docker-compose down

# Stop and delete everything
docker-compose down -v
```

## Restart the App

```bash
docker-compose up
```

---

**🎉 Congratulations! Your wedding invitation system is live!**

Share the link and start collecting RSVPs! 💑
