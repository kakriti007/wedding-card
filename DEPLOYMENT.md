# Deployment Guide

This guide will help you deploy your Indian Wedding Card app to the web.

## Overview

We'll use:
- **Vercel** - Free hosting for Next.js apps
- **Neon** - Free PostgreSQL database
- **GitHub** - Code repository

---

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in (or create an account)
2. Click the **"+"** icon in the top right and select **"New repository"**
3. Name it: `indian-wedding-invitation`
4. Keep it **Private** (recommended)
5. Don't initialize with README (you already have files)
6. Click **"Create repository"**

7. In your terminal, run these commands from your project folder:

```bash
cd /Users/fakriti/Desktop/Cursor/indian-wedding-card

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit"

# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/indian-wedding-invitation.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Create a Neon Database

1. Go to [Neon.tech](https://neon.tech) and sign up (free)
2. Click **"Create Project"**
3. Name it: `wedding-invitation`
4. Select a region close to you
5. Click **"Create Project"**

6. After creation, you'll see a **Connection String**. Copy it - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

7. **Save this connection string** - you'll need it in Step 3

---

## Step 3: Update Database Configuration

1. Update `prisma/schema.prisma` to use PostgreSQL:

Open the file and change the datasource from:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

To:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Generate a NextAuth secret:

Run in terminal:
```bash
openssl rand -base64 32
```

Copy the output - this is your `NEXTAUTH_SECRET`

3. Update your `.env.local` file with:
```env
DATABASE_URL="postgresql://your-neon-connection-string-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-the-secret-from-step-2"
ADMIN_EMAILS="your-email@example.com"
```

4. Commit these changes:
```bash
git add prisma/schema.prisma
git commit -m "Update database to PostgreSQL"
git push
```

---

## Step 4: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up (use your GitHub account)
2. Click **"Add New Project"**
3. Import your GitHub repository (`indian-wedding-invitation`)
4. Vercel will detect it's a Next.js app automatically

5. **Configure Environment Variables** (very important!):
   
   Click on **"Environment Variables"** and add these:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `NEXTAUTH_URL` | Your Vercel URL (you'll get this after deployment, or use `https://your-project-name.vercel.app`) |
   | `NEXTAUTH_SECRET` | The secret you generated with openssl |
   | `ADMIN_EMAILS` | Your email address(es), comma-separated |

   Optional (if you want email notifications):
   | Name | Value |
   |------|-------|
   | `EMAIL_FROM` | noreply@yourwedding.com |
   | `SMTP_HOST` | smtp.gmail.com |
   | `SMTP_PORT` | 587 |
   | `SMTP_USER` | your-gmail@gmail.com |
   | `SMTP_PASSWORD` | Your Gmail app password |
   | `RSVP_NOTIFICATION_EMAILS` | Emails to receive RSVP notifications |

6. Click **"Deploy"**

7. Wait 2-3 minutes for deployment to complete

---

## Step 5: Initialize Database

After deployment completes:

1. In Vercel dashboard, go to your project
2. Click on **"Settings"** → **"General"**
3. Find your deployment URL (e.g., `https://your-project-name.vercel.app`)

4. Open your project in terminal and run:
```bash
# Set DATABASE_URL to your Neon connection string
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

This creates all database tables in your Neon database.

---

## Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Go to `/admin/login` to test admin access
3. Login with your authorized email and security answers
4. Create your first wedding card!

---

## Step 7: Custom Domain (Optional)

If you want a custom domain like `wedding.yourdomain.com`:

1. Buy a domain from [Namecheap](https://namecheap.com), [GoDaddy](https://godaddy.com), etc.
2. In Vercel dashboard, go to **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow Vercel's instructions to update DNS records
5. Update `NEXTAUTH_URL` environment variable to your custom domain

---

## Making Updates

Whenever you make changes to your app:

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push

# Vercel will automatically redeploy!
```

---

## Important Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Keep your NEXTAUTH_SECRET secret** - Don't share it
3. **Use strong passwords** for your Neon database
4. **Only add trusted emails** to ADMIN_EMAILS

---

## Cost Breakdown

- **Vercel**: Free tier (plenty for a wedding invitation)
- **Neon**: Free tier (0.5 GB storage, 3 projects)
- **Total Monthly Cost**: $0 🎉

---

## Troubleshooting

### "Prisma Client not found" error
Run in Vercel:
```bash
npm run db:generate
```

### Environment variable changes not reflecting
1. Go to Vercel dashboard → Settings → Environment Variables
2. Edit the variable
3. Go to Deployments → Click "..." → Redeploy

### Database connection errors
- Check your DATABASE_URL is correct
- Ensure it includes `?sslmode=require` at the end
- Verify your Neon database is active

### Admin login not working
- Check ADMIN_EMAILS includes your email (exact match, case-sensitive)
- Verify security answers match exactly (case-sensitive)

---

## Need Help?

Common issues:
- Build fails → Check the build logs in Vercel
- 500 errors → Check Vercel function logs (Runtime Logs)
- Database errors → Verify DATABASE_URL is set correctly

Good luck with your deployment! 🎊
