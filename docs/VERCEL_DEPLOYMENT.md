# Deploying L.E.A.P to Vercel

Complete guide to deploy your L.E.A.P application to Vercel hosting.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Supabase project with database set up
- Your code pushed to GitHub

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### 3. Import Your Project

1. Click "Add New..." → "Project"
2. Find your L.E.A.P repository
3. Click "Import"

### 4. Configure Project Settings

Vercel will auto-detect your settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Add Environment Variables

This is CRITICAL! Click "Environment Variables" and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to get these values:**
1. Go to your Supabase Dashboard
2. Click Settings → API
3. Copy "Project URL" and "anon public" key

**Important:**
- ✅ Add to "Production"
- ✅ Add to "Preview" (optional)
- ✅ Add to "Development" (optional)

### 6. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://your-project.vercel.app`

### 7. Update Supabase Settings

After deployment, update Supabase to allow your Vercel domain:

1. Go to Supabase Dashboard
2. Click Authentication → URL Configuration
3. Add your Vercel URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: `https://your-project.vercel.app/auth/callback`

### 8. Test Your Deployment

1. Visit your Vercel URL
2. Try registering a new user
3. Try logging in
4. Test all major features

## Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `leap.yourdomain.com`)
5. Follow DNS configuration instructions

### Update Supabase for Custom Domain

Add your custom domain to Supabase:
- Site URL: `https://leap.yourdomain.com`
- Redirect URLs: `https://leap.yourdomain.com/auth/callback`

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull Requests** → Preview deployment with unique URL

## Environment Variables Management

### Update Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Edit or add variables
4. Click "Save"
5. Redeploy for changes to take effect

### Different Environments

You can set different values for:
- **Production**: Live site
- **Preview**: Branch deployments
- **Development**: Local development

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. Check "Build Logs" tab

**Common issues:**
- Missing environment variables
- TypeScript errors
- Dependency issues

**Solutions:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

### Environment Variables Not Working

1. Verify variable names start with `VITE_`
2. Check for typos in variable names
3. Redeploy after adding variables
4. Clear browser cache

### 404 Errors on Refresh

This should be fixed by `vercel.json` rewrites. If not:

1. Check `vercel.json` exists in root
2. Verify rewrites configuration
3. Redeploy

### Supabase Connection Issues

1. Verify environment variables are correct
2. Check Supabase URL allows your Vercel domain
3. Verify CORS settings in Supabase
4. Check browser console for errors

## Performance Optimization

### Enable Caching

Already configured in `vercel.json`:
- Static assets cached for 1 year
- HTML not cached (always fresh)

### Enable Analytics

1. Go to Vercel Dashboard → Your Project
2. Click "Analytics" tab
3. Enable "Web Analytics"
4. View performance metrics

### Monitor Performance

Use Vercel's built-in tools:
- **Speed Insights**: Page load performance
- **Web Vitals**: Core Web Vitals metrics
- **Real User Monitoring**: Actual user experience

## CI/CD Pipeline

Vercel provides automatic CI/CD:

```
Push to GitHub → Vercel detects → Build → Test → Deploy
```

### Build Checks

Vercel runs:
1. Install dependencies
2. Run build command
3. Check for errors
4. Deploy if successful

### Preview Deployments

Every pull request gets:
- Unique preview URL
- Automatic deployment
- Comment on PR with URL

## Rollback

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback!

## Monitoring

### Check Deployment Status

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Check deployments
vercel ls

# View logs
vercel logs
```

### Set Up Alerts

1. Go to Vercel Dashboard → Settings
2. Click "Notifications"
3. Enable email/Slack notifications for:
   - Deployment failures
   - Performance issues
   - Errors

## Security

### Environment Variables

- ✅ Never commit `.env` to Git
- ✅ Use Vercel's environment variables
- ✅ Rotate keys regularly
- ✅ Use different keys for production/preview

### HTTPS

- ✅ Automatic HTTPS on all Vercel domains
- ✅ Free SSL certificates
- ✅ Automatic renewal

### Security Headers

Already configured in `vercel.json`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

## Cost

### Free Tier Includes:

- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics

### Paid Plans:

- Pro: $20/month (more bandwidth, team features)
- Enterprise: Custom pricing

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)

## Quick Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Link local project
vercel link
```

## Checklist

Before going live:

- [ ] All environment variables set
- [ ] Supabase URLs configured
- [ ] Database schema deployed
- [ ] Test registration/login
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify security headers
- [ ] Set up custom domain (optional)
- [ ] Enable analytics
- [ ] Set up monitoring/alerts

## Next Steps

After successful deployment:

1. Share your URL with team
2. Monitor performance
3. Set up custom domain
4. Enable analytics
5. Configure alerts
6. Plan for scaling

Your L.E.A.P application is now live on Vercel! 🚀
