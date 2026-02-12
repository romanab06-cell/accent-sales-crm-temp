# ⚡ Quick Start Guide

Get your Accent CRM up and running in 5 minutes!

## Step-by-Step Setup

### 1️⃣ Open the Project in Cursor
- Download/extract the accent-crm folder
- Open Cursor
- File → Open Folder → Select `accent-crm`

### 2️⃣ Install Dependencies
Open terminal in Cursor (Terminal → New Terminal) and run:
```bash
npm install
```

### 3️⃣ Create Supabase Project
1. Go to https://supabase.com
2. Sign up (or log in)
3. Click "New Project"
4. Fill in:
   - Name: `accent-crm`
   - Database Password: (make one up and save it)
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait ~2 minutes for setup

### 4️⃣ Set Up the Database
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. In Cursor, open `supabase-schema.sql`
4. Copy ALL the text
5. Paste into Supabase SQL Editor
6. Click **RUN** button
7. You should see "Success. No rows returned"

### 5️⃣ Get Your API Keys
1. In Supabase, click **Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** (copy this)
   - **anon public** key (copy this)

### 6️⃣ Create Environment File
1. In Cursor, rename `.env.example` to `.env.local`
2. Open `.env.local`
3. Replace with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key-here
   ```
4. Save the file

### 7️⃣ Start the App
In the terminal, run:
```bash
npm run dev
```

### 8️⃣ Open in Browser
Go to: http://localhost:3000

You should see your CRM dashboard! 🎉

## What You Can Do Now

### Add Your First Brand
1. Click "+ New Brand" button
2. Fill in the form (only red * fields are required)
3. Click "Create Brand"

### Import Your Excel Data (Optional)
1. Place `Brands_List.xlsx` in the project root folder
2. Install Excel package:
   ```bash
   npm install xlsx dotenv
   ```
3. Run migration:
   ```bash
   node scripts/migrate-data.js
   ```
4. Wait for "Migration complete!" message
5. Refresh the app to see your 715 brands!

## Common Issues

### "Connection failed" or blank page
- Double-check your `.env.local` file has the correct URL and key
- Make sure there are no extra spaces or quotes
- Restart the dev server (stop with Ctrl+C, then `npm run dev` again)

### "Table does not exist" error
- The database schema wasn't created
- Go back to Step 4 and make sure the SQL ran successfully
- Check Supabase → Table Editor to see if tables exist

### Import script fails
- Make sure `Brands_List.xlsx` is in the root folder (same level as `package.json`)
- Check that you installed xlsx: `npm install xlsx dotenv`
- Verify your `.env.local` credentials are correct

## Need Help?
- Check browser console (F12) for error messages
- Look at Supabase logs in the dashboard
- Re-read the full README.md

---

**That's it! You're ready to manage your brand partnerships! 🚀**
