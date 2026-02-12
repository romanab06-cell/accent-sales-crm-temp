# 🚀 Deployment Guide

Deploy your Accent CRM to production so your team can access it from anywhere!

## Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best performance.

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

#### 1. Push Code to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial Accent CRM setup"

# Create a repo on GitHub, then:
git remote add origin https://github.com/yourusername/accent-crm.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your `accent-crm` repository
5. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

6. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_key
   ```

7. Click "Deploy"

#### 3. Wait for Deployment
- Takes ~2-3 minutes
- You'll get a URL like: `accent-crm.vercel.app`

#### 4. Done!
Share the URL with your team!

### Updating the App
Every time you push to GitHub:
```bash
git add .
git commit -m "Updated features"
git push
```
Vercel automatically rebuilds and deploys! 🎉

---

## Option 2: Netlify

### Steps
1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Add environment variables (same as Vercel)
7. Click "Deploy site"

---

## Option 3: Self-Hosted (VPS)

For more control, deploy to your own server.

### Prerequisites
- Ubuntu server (20.04+)
- Domain name (optional)
- SSH access

### Steps

#### 1. Set Up Server
```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Upload Your Code
```bash
# On your local machine
scp -r accent-crm user@your-server-ip:/home/user/

# Or use git
ssh user@your-server-ip
cd /home/user
git clone https://github.com/yourusername/accent-crm.git
cd accent-crm
```

#### 3. Configure Environment
```bash
# On server
cd /home/user/accent-crm
nano .env.local

# Add your Supabase credentials
# Save with Ctrl+X, Y, Enter
```

#### 4. Build and Run
```bash
# Install dependencies
npm install

# Build the app
npm run build

# Start with PM2
pm2 start npm --name "accent-crm" -- start

# Make it start on boot
pm2 startup
pm2 save
```

#### 5. Set Up Nginx (Web Server)
```bash
# Install Nginx
sudo apt install nginx -y

# Create config file
sudo nano /etc/nginx/sites-available/accent-crm
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or server IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/accent-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Add SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

Your app is now live at `https://your-domain.com`!

---

## Security Checklist

Before going live, consider:

### 1. Add Authentication
- Enable Supabase Auth
- Add login/signup pages
- Protect routes

### 2. Enable Row Level Security (RLS)
In Supabase SQL Editor:
```sql
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ... for all tables

-- Example policy (all team members can see everything)
CREATE POLICY "Allow all for authenticated users" ON brands
FOR ALL USING (auth.role() = 'authenticated');
```

### 3. Set Up Team Access
- Create team member accounts in Supabase Auth
- Assign roles (admin, sales, viewer)
- Configure policies based on roles

### 4. Backup Your Database
In Supabase:
- Settings → Database → Enable Point-in-Time Recovery
- Or set up daily backups via SQL

---

## Monitoring & Maintenance

### Vercel/Netlify
- Check deployment logs in dashboard
- Monitor performance via Analytics
- Set up error tracking (Sentry)

### Self-Hosted
```bash
# View app logs
pm2 logs accent-crm

# Restart app
pm2 restart accent-crm

# Monitor resources
pm2 monit
```

---

## Updating Production

### Vercel/Netlify
Just push to GitHub:
```bash
git add .
git commit -m "New features"
git push
```
Auto-deploys in 2-3 minutes!

### Self-Hosted
```bash
# SSH into server
cd /home/user/accent-crm

# Pull latest code
git pull

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart accent-crm
```

---

## Domain Setup

### Using a Custom Domain

#### On Vercel/Netlify:
1. Go to project settings
2. Click "Domains"
3. Add your domain (e.g., crm.accent.com)
4. Update your DNS with the provided records
5. Wait for DNS propagation (~10 minutes)

#### On Self-Hosted:
1. Point your domain's A record to your server IP
2. Update Nginx config with your domain
3. Run Certbot to get SSL certificate

---

## Cost Estimates

### Vercel Free Tier
- ✅ Perfect for small teams (up to 10 people)
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Unlimited deployments
- 💵 **$0/month**

### VPS (DigitalOcean, Linode, etc.)
- Basic Droplet: **$5-10/month**
- + Domain: **$12/year**
- Total: ~**$6-11/month**

### Supabase
- Free tier: 500 MB database, 1 GB file storage
- Enough for 1000+ brands
- 💵 **$0/month** (or $25/month for Pro if you need more)

**Total Cost: $0-11/month** 🎉

---

## Support

Having deployment issues?
1. Check build logs for errors
2. Verify environment variables are set correctly
3. Test locally first (`npm run build && npm start`)
4. Check Vercel/Netlify status pages
5. Review Supabase connection in production

---

**Ready to go live? Pick an option and deploy! 🚀**
