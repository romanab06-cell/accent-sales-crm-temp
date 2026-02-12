# Accent CRM - Sales & Partner Relationship Management

A modern, full-featured CRM system built specifically for Accent's sales team to manage brand partner relationships, deals, communications, documents, and tasks.

## 🚀 Features

### Core Functionality
- **Brand Partner Management** - Complete CRUD operations for 700+ brand partners
- **Contact Management** - Multiple contacts per brand with primary contact designation
- **Deal Tracking** - Manage discount terms, payment terms, shipping, and dealer access
- **Communication Logging** - Track emails, phone calls, and meetings
- **Document Management** - Store and organize master data, price lists, images, and contracts
- **Task Management** - Assign and track tasks with due dates and priorities
- **Dashboard** - Real-time metrics and insights into your sales pipeline

### Advanced Features
- Deal pipeline tracking (Lead → Qualified → Proposal → Negotiation → Won/Lost)
- Priority management (High/Medium/Low)
- Status tracking (Prospect → Active)
- Search and filtering across all data
- Upcoming task alerts
- Overdue follow-up notifications
- Communication history timeline
- Document versioning

## 📋 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **State:** React Hooks
- **Deployment Ready:** Vercel-optimized

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works great)
- Cursor or VS Code

### Step 1: Clone/Download the Project

If you're using Cursor, you can download the project files and open the folder in Cursor.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your database to initialize (takes ~2 minutes)
3. Go to **Settings** → **API** in your Supabase dashboard
4. Copy your:
   - Project URL
   - `anon` `public` API key

### Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the `supabase-schema.sql` file in your project
4. Copy and paste the entire contents into the SQL editor
5. Click **Run** to create all tables, indexes, and triggers

This will create:
- `brands` table (partners)
- `contacts` table
- `deals` table
- `communications` table
- `documents` table
- `tasks` table

### Step 5: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 6: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📊 Migrating Your Existing Data

You have 715 existing brands in `Brands_List.xlsx`. To migrate them:

### Option 1: Automated Migration Script

1. Place your `Brands_List.xlsx` file in the project root
2. Install the required package:
   ```bash
   npm install xlsx dotenv
   ```
3. Run the migration script:
   ```bash
   node scripts/migrate-data.js
   ```

This will automatically:
- Import all 715 brands
- Parse and create contacts
- Import deal terms
- Link documents (master data, price lists, images)
- Create tasks from action items

### Option 2: Manual Import

Use the "+ New Brand" button in the app to add brands one by one.

## 🎯 Usage Guide

### Dashboard
- View key metrics (total partners, active deals, overdue follow-ups)
- See recent communications
- Track upcoming tasks
- Monitor deal pipeline

### Managing Brands
1. **View All Brands:** Click "Brands" in the navigation
2. **Filter & Search:** Use the filters to find specific brands
3. **Add New Brand:** Click "+ New Brand" and fill in the required fields
4. **View Details:** Click any brand card to see full details
5. **Edit:** Click "Edit" button on brand detail page
6. **Delete:** Click "Delete" (with confirmation)

### Adding Contacts
Each brand can have multiple contacts. Mark one as "Primary Contact" for quick access.

### Logging Communications
1. Go to any brand's detail page
2. Click the "Communications" tab
3. Click "Log Communication"
4. Select type (Email/Phone/Meeting), add details
5. Mark if follow-up is required

### Managing Documents
Upload or link to:
- Master Data (product catalogs)
- Price Lists
- Images/Media
- Contracts
- Other documents

All documents are linked to Google Drive or other cloud storage.

### Task Management
- Create tasks with due dates and priorities
- Assign to team members
- Track completion status
- Get notifications for overdue tasks

## 📁 Project Structure

```
accent-crm/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── brands/
│   │   ├── page.tsx            # Brands list
│   │   ├── new/page.tsx        # Create brand
│   │   └── [id]/page.tsx       # Brand detail
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── supabase.ts             # Supabase client & types
│   └── api.ts                  # API functions
├── scripts/
│   └── migrate-data.js         # Excel import script
├── supabase-schema.sql         # Database schema
├── package.json
└── README.md
```

## 🔒 Security Notes

### For Development
- The app currently runs without authentication to keep things simple
- Row Level Security (RLS) is disabled in the schema
- All team members can see and edit all data

### For Production (Future)
If you want to add authentication:

1. Enable RLS in `supabase-schema.sql`
2. Add Supabase Auth
3. Create policies for team member access
4. Add user roles (admin, sales, viewer)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your CRM will be live at `your-project.vercel.app`!

## 🎨 Customization

### Adding New Fields
1. Add column to Supabase table via SQL Editor
2. Update TypeScript interfaces in `lib/supabase.ts`
3. Add field to forms in `app/brands/new/page.tsx`
4. Display field in `app/brands/[id]/page.tsx`

### Changing Dropdowns
Edit the options in:
- Status: Line ~286 in `app/brands/new/page.tsx`
- Deal Stage: Line ~299
- Payment Terms: Line ~383
- Shipping Terms: Line ~396

### Styling
All styles use Tailwind CSS. Modify:
- Colors: `tailwind.config.js`
- Global styles: `app/globals.css`

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Check your Supabase URL and API key in `.env.local`
- Ensure the database schema was created successfully
- Check browser console for specific error messages

### Data not appearing
- Verify the table was created: Go to Supabase → Table Editor
- Check if data exists: Run `SELECT * FROM brands` in SQL Editor
- Ensure `.env.local` is in the project root

### Build errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Make sure you're using Node.js 18+

## 📞 Support

For issues or questions:
1. Check the error message in browser console
2. Verify Supabase connection in the Network tab
3. Review the README troubleshooting section
4. Check Supabase logs in your dashboard

## 🎉 Next Steps

After setup, you can:
1. Import your existing 715 brands using the migration script
2. Customize the app to match your workflow
3. Add team member accounts
4. Set up email notifications
5. Integrate with Google Drive API for document management
6. Add reporting and analytics

## 📝 License

Built for Accent Sales Team - Internal Use Only
