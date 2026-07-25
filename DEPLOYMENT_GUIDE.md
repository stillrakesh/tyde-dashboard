# How to Deploy TYDE Cloud Dashboard to Vercel + Neon (100% Free)

Follow this 5-step guide to launch your cloud dashboard live on the internet and connect it to your local POS system.

---

## Step 1: Create a Free Database on Neon (2 minutes)

1. Open [neon.tech](https://neon.tech) in your web browser and click **Sign Up** (Free tier available, no credit card required).
2. Click **New Project** and name it `tyde-cloud-db`.
3. Select your preferred region (e.g. `ap-south-1` for Mumbai/Asia or `us-east-1`).
4. Once created, copy the **PostgreSQL Connection String** displayed on the screen. It looks like:
   ```
   postgresql://owner:abcdef123456@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Push your Project to GitHub (2 minutes)

1. Go to [github.com](https://github.com) and create a new **Private Repository** named `tyde-cloud-dashboard`.
2. Open terminal/Command Prompt inside `C:\Users\mrrak\Desktop\tyde-cloud-dashboard`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of cloud dashboard"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/tyde-cloud-dashboard.git
   git push -u origin main
   ```

---

## Step 3: Deploy to Vercel (2 minutes)

1. Open [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New** → **Project**.
3. Import your `tyde-cloud-dashboard` GitHub repository.
4. Expand **Environment Variables** and add two key-value pairs:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | *(Paste your Neon PostgreSQL URL from Step 1)* |
   | `JWT_SECRET` | `tyde_pos_cloud_secret_key_2026_x987` |

5. Click **Deploy**. In under 60 seconds, Vercel will build your application and assign a live production URL (e.g., `https://tyde-cloud-dashboard.vercel.app`).

---

## Step 4: Push Database Schema to Neon (1 minute)

1. In your local terminal inside `C:\Users\mrrak\Desktop\tyde-cloud-dashboard`:
2. Update `.env` to point to your Neon PostgreSQL URL:
   ```env
   DATABASE_URL="postgresql://owner:abcdef123456@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. Update `prisma/schema.prisma` datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Push the schema to your live database:
   ```bash
   npx prisma db push
   ```

---

## Step 5: Connect Local POS to Live Cloud Dashboard (1 minute)

1. Open your live Cloud Dashboard website in your browser (e.g. `https://tyde-cloud-dashboard.vercel.app`).
2. Register your restaurant owner account.
3. Go to **API & Settings** tab and copy your **Cloud API Key** (e.g. `tyde_live_...`).
4. Open your local POS desktop application → **Settings** → **Connection Manager**.
5. Set **Cloud URL** to `https://tyde-cloud-dashboard.vercel.app`.
6. Paste your **Cloud API Key**.
7. Click **Connect & Save Sync Key**.

Your POS will now continuously sync every completed order, bill, customer profile, and expense to the cloud!
