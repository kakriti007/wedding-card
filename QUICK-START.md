# Quick Deployment Commands

## 1️⃣ Push to GitHub

```bash
cd /Users/fakriti/Desktop/Cursor/indian-wedding-card

# Initialize git (skip if already done)
git init

# Add files
git add .
git commit -m "Ready for deployment"

# Connect to GitHub (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/indian-wedding-invitation.git
git branch -M main
git push -u origin main
```

## 2️⃣ Generate NextAuth Secret

```bash
openssl rand -base64 32
```
Copy this output - you'll need it for Vercel!

## 3️⃣ After Creating Neon Database

Your Neon connection string will look like:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## 4️⃣ Vercel Environment Variables

Add these in Vercel dashboard:

```
DATABASE_URL = your-neon-connection-string
NEXTAUTH_URL = https://your-project-name.vercel.app
NEXTAUTH_SECRET = output-from-openssl-command
ADMIN_EMAILS = your-email@example.com
```

## 5️⃣ Initialize Database (after Vercel deployment)

```bash
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

## 6️⃣ Access Your App

- **Your site**: https://your-project-name.vercel.app
- **Admin login**: https://your-project-name.vercel.app/admin/login
- **Dashboard**: https://your-project-name.vercel.app/admin/dashboard

---

## Future Updates

```bash
# Make changes, then:
git add .
git commit -m "Your changes"
git push
# Vercel auto-deploys!
```

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions!
