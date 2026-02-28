# Quick Deploy to Vercel

## 🚀 Fast Track Deployment (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Website (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
6. Click "Deploy"
7. Done! 🎉

**Option B: Using Vercel CLI (Advanced)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### Step 3: Update Supabase

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/auth/callback`

### Step 4: Test

Visit your Vercel URL and test:
- ✅ Registration
- ✅ Login
- ✅ All features

## 📚 Need More Details?

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for complete guide.

## 🔑 Environment Variables

Get these from Supabase Dashboard → Settings → API:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## ⚡ Auto-Deploy

After initial setup, every push to `main` automatically deploys!

```bash
git push origin main  # → Automatic deployment
```

## 🌐 Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records
4. Update Supabase URLs

## 🆘 Issues?

- Build fails? Run `npm run build` locally first
- 404 errors? Check `vercel.json` exists
- Auth issues? Verify Supabase URLs
- Need help? Check [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)

---

**Your app will be live at:** `https://your-project-name.vercel.app`
