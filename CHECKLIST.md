# ✅ Setup Checklist

Use this checklist to track your setup progress!

## Before You Start
- [ ] Download the `accent-crm` folder
- [ ] Have Cursor installed on your computer
- [ ] Have a Supabase account (or ready to create one)

---

## Database Setup (Supabase)

- [ ] Created Supabase account at https://supabase.com
- [ ] Created new project named "accent-crm"
- [ ] Waited for database initialization (~2 min)
- [ ] Opened SQL Editor in Supabase
- [ ] Copied entire `supabase-schema.sql` file
- [ ] Pasted and ran SQL in Supabase editor
- [ ] Verified tables were created (check Table Editor)
- [ ] Copied Project URL from Settings → API
- [ ] Copied `anon public` key from Settings → API

---

## Local Setup (Cursor)

- [ ] Opened `accent-crm` folder in Cursor
- [ ] Opened terminal (Terminal → New Terminal)
- [ ] Ran `npm install` (wait for completion)
- [ ] Renamed `.env.example` to `.env.local`
- [ ] Pasted Supabase URL into `.env.local`
- [ ] Pasted anon key into `.env.local`
- [ ] Saved `.env.local` file
- [ ] Ran `npm run dev` in terminal
- [ ] Opened http://localhost:3000 in browser
- [ ] Saw the dashboard load successfully ✨

---

## Test the App

- [ ] Clicked "+ New Brand" button
- [ ] Filled in form fields
- [ ] Successfully created a test brand
- [ ] Viewed the brand detail page
- [ ] Edited the brand information
- [ ] Logged a test communication
- [ ] Created a test task
- [ ] Searched for the brand
- [ ] Filtered brands by status
- [ ] Deleted the test brand

---

## Data Migration (Optional)

If you want to import your existing 715 brands:

- [ ] Placed `Brands_List.xlsx` in project root
- [ ] Ran `npm install xlsx dotenv`
- [ ] Ran `node scripts/migrate-data.js`
- [ ] Saw "Migration complete!" message
- [ ] Refreshed browser
- [ ] Verified brands appear in the list
- [ ] Checked that contacts were created
- [ ] Checked that deals were imported
- [ ] Verified documents were linked

---

## Production Deployment (Optional)

When ready to deploy for your team:

### Vercel Deployment
- [ ] Pushed code to GitHub
- [ ] Created Vercel account
- [ ] Imported project from GitHub
- [ ] Added environment variables
- [ ] Deployed successfully
- [ ] Tested live URL
- [ ] Shared URL with team

---

## Customization (Optional)

- [ ] Changed app colors in `tailwind.config.js`
- [ ] Updated company name in header
- [ ] Added/removed form fields as needed
- [ ] Customized dropdown options
- [ ] Added your team member names

---

## Training Your Team

- [ ] Shared app URL with team
- [ ] Showed how to add new brands
- [ ] Demonstrated communication logging
- [ ] Explained task management
- [ ] Set up naming conventions
- [ ] Defined workflow processes

---

## Ongoing Maintenance

Weekly:
- [ ] Check for overdue tasks
- [ ] Review follow-up reminders
- [ ] Update deal statuses

Monthly:
- [ ] Review dashboard metrics
- [ ] Clean up old tasks
- [ ] Archive inactive brands
- [ ] Backup database (Supabase does this automatically)

---

## Need Help?

**Issue**: App won't start
- Check `.env.local` has correct credentials
- Restart the dev server
- Check for typos in environment variables

**Issue**: Can't see data
- Verify SQL schema was run successfully
- Check Supabase Table Editor
- Look at browser console for errors

**Issue**: Import script fails
- Ensure Excel file is in correct location
- Check file is named exactly `Brands_List.xlsx`
- Verify Supabase credentials are correct

**Issue**: Deployment fails
- Check build logs for specific errors
- Ensure all environment variables are set
- Try building locally first: `npm run build`

---

## Quick Reference

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
npm start
```

**Run data migration:**
```bash
node scripts/migrate-data.js
```

**Supabase Dashboard:**
https://app.supabase.com

**Local App:**
http://localhost:3000

---

## Success Criteria

You're all set when:
✅ Dashboard shows your data
✅ You can create, edit, and delete brands
✅ Communication logging works
✅ Tasks can be created and completed
✅ Team can access the app (if deployed)
✅ Data persists after refresh
✅ Search and filters work correctly

---

**Once everything is checked off, you're ready to go! 🎉**

Questions? Check:
1. README.md - Full documentation
2. QUICKSTART.md - Fast setup guide
3. DEPLOYMENT.md - Production deployment
