# Deployment Guide: Moving to Vercel

Since this is a Next.js project, **Vercel** is the recommended platform. It will give you a public URL (e.g., `rabiya-komur.vercel.app`) that stays online 24/7.

## Step 1: Push to GitHub
If you haven't already, you need to put your code on GitHub:
1. Go to [github.com/new](https://github.com/new) and create a repository (e.g., `personal-site`).
2. Run these commands in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initialize deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/personal-site.git
   git push -u origin main
   ```

## Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **"Add New"** -> **"Project"**.
3. Import your `personal-site` repository.

## Step 3: Configure Environment Variables
**CRITICAL**: Your site won't work without the API Key. 
1. During the Vercel setup, look for the **"Environment Variables"** section.
2. Add the following:
   - **Key**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `AIzaSyBrChbu2YxzYjP8TqVpSOl3oyOD_E0qJAc` (Your API Key)
3. Click **"Deploy"**.

## Step 4: Access Your Site
Once the build is finished, Vercel will provide you with a permanent link. You no longer need to run `npm run dev` manually to keep it alive!

---
*Note: Your local site will always be available at localhost:3000 as long as you have the terminal open, but Vercel is for people to visit from the outside.*
