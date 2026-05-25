# Vercel Migration Q&A

## 1. What do you need from me?

- Vercel account (free tier)
- List of all environment variables from Netlify dashboard
- Custom domain name (you mentioned you paid for hosting)
- Current DNS provider/registrar login access (likely Spaceship - Namecheap's spin-off)
- Email MX records (if you use email with this domain)

## 2. Gaps/Red Flags (Given Stack)

**✅ Compatible:**
- Next.js 15 - Native Vercel support, auto-detects build settings
- Upstash Redis (minimal usage in dev tools only) - Fully compatible
- Sanity CMS - No changes needed
- Stripe - No changes needed
- Clerk - No changes needed

**⚠️ Migration Required:**
- **Custom headers:** `netlify.toml` headers → move to `next.config.ts` or `vercel.json`
- **Build command:** Currently `npm i --legacy-peer-deps && next build` → Vercel auto-detects `npm run build`

**🔴 Critical:**
- Environment variables must be manually copied from Netlify to Vercel
- DNS migration if using custom domain (zero-downtime migration available)

## 3. How should it work with Vercel?

**Migration Steps:**
1. Create Vercel project from GitHub repo
2. Vercel auto-detects Next.js framework
3. Copy all environment variables from Netlify to Vercel dashboard
4. Migrate custom headers from `netlify.toml` to `next.config.ts` (already there)
5. Deploy: `vercel deploy --prod`
6. Update DNS to point to Vercel (if custom domain)

**Result:**
- Auto-build on commit (can be disabled)
- Manual deploy via CLI
- All existing services work unchanged

## 4. Manual Deploy Command Line

**Command:**
```bash
vercel deploy --prod
```

**Setup (one-time):**
```bash
npm install -g vercel
vercel login
```

**Workflow:**
1. Make changes locally
2. Run `vercel deploy --prod` from project root
3. Vercel builds and deploys to production
4. No git push required

**Alternative (if you want git-based but not auto-build):**
- Disable auto-deploy in Vercel project settings
- Use `vercel deploy --prod` for manual deploys
- Or use Vercel Git Integration with branch filters (only deploy specific branches)

## 5. Vercel Project Setup - Exact Field Values

**New Project → Import from GitHub**

| Field | Value | Notes |
|-------|-------|-------|
| Vercel Team | `munrhalls' projects` | Already selected |
| Project Name | `sanglogium` | Already filled |
| Framework Preset | `Next.js` | Already selected |
| Root Directory | `./` | Already filled |
| Build Command | `npm run build` | Already filled (correct) |
| Output Directory | `Next.js default` | Leave as is (auto-detects `.next`) |
| Install Command | `npm install --legacy-peer-deps` | **CHANGE THIS** - required for peer deps |
| Environment Variables | See below | Copy from Netlify |

**Environment Variables - Copy from Netlify Dashboard:**

1. Go to Netlify → Site settings → Environment variables
2. Copy each variable and add to Vercel → Settings → Environment Variables
3. Required variables (exact names):
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `SANITY_API_TOKEN`
   - `SANITY_STUDIO_READ_WRITE`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - Any other variables present in Netlify

**After filling all fields:**
- Click "Deploy"
- Wait for build to complete
- Note the deployment URL

## 6. DNS Migration (Spaceship → Vercel) - Verified Simplest Steps

### Step 1: Get Vercel DNS Records (2 minutes)
1. In Vercel project → Settings → Domains → Add your domain
2. Vercel will show you:
   - **A Record IP** (for apex domain, e.g., example.com) - COPY THIS
   - **CNAME Target** (for www subdomain) - COPY THIS
3. Note: These are unique to your project, don't use generic IPs

### Step 2: Update DNS in Spaceship (3 minutes)
1. Login to Spaceship dashboard
2. Go to Domains → your domain → DNS Management
3. **Update A Record** (apex domain):
   - Find existing A record pointing to Netlify
   - Change the value to the Vercel A Record IP from Step 1
4. **Update CNAME Record** (www subdomain):
   - Find existing CNAME record pointing to Netlify
   - Change the value to the Vercel CNAME Target from Step 1
5. **Check CAA Record** (if exists):
   - If you have existing CAA records, add: `0 issue "letsencrypt.org"`
   - This is required for Vercel SSL certificates
6. **Keep these records unchanged:**
   - MX records (email)
   - TXT records (domain verification, SPF, DKIM)

### Step 3: Verify (2 minutes)
1. Wait 5 minutes for DNS propagation
2. Run: `dig A yourdomain.com +short` (should return Vercel IP)
3. Check Vercel dashboard → Domains → should show "Valid Configuration"

### Step 4: Deploy (1 minute)
```bash
vercel deploy --prod
```

**Total Time:** ~8 minutes

### Critical Notes (Verified)
- **Vercel IP:** Use the specific IP from your Vercel dashboard, not hardcoded values
- **CNAME Target:** Use the unique CNAME from your Vercel dashboard
- **CAA Record:** Only add if you have existing CAA records
- **Email:** Keep MX records unchanged
- **Zero Downtime:** Site stays live during DNS propagation (5 minutes)

### What to do on Netlify
- Cancel Netlify hosting after migration is complete
- Keep domain registration at Spaceship (separate from hosting)

## 7. Manual vs Automated Tasks

### What YOU Must Do Manually (External Access Required)

**Vercel Setup:**
1. Create Vercel account (vercel.com)
2. Create project from GitHub repo (import munrhalls/sanglogium)
3. Fill project fields (see Section 5 for exact values)
4. Copy environment variables from Netlify dashboard
5. Add environment variables to Vercel dashboard
6. Add domain to Vercel project
7. Copy A Record IP and CNAME Target from Vercel dashboard

**Spaceship DNS:**
1. Login to Spaceship dashboard
2. Navigate to domain → DNS Management
3. Update A record value to Vercel IP
4. Update CNAME record value to Vercel CNAME
5. Check/add CAA record if needed

**Local Commands:**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel deploy --prod`

**Netlify Cleanup:**
1. Cancel Netlify hosting (check refund policy)

### What I CAN Do For You (Code Changes)

**I can execute these now:**
1. Delete `netlify.toml` (no longer needed)
2. Update `package.json` - remove `netlify deploy` script
3. Create `vercel.json` (if needed for configuration)
4. Remove any Netlify-specific code references

**Ready to execute?** Confirm and I'll make these code changes.

## 8. Research Questions - Vercel + Spaceship Deployment Best Practices 2026

**Research Scope:**
- First principles of DNS management for production e-commerce applications
- Best practices for nameserver configuration (Vercel vs. Spaceship DNS)
- Zero-downtime migration strategies from Netlify to Vercel
- Environment variable management across platforms
- SSL certificate provisioning and DNS record requirements
- Propagation timing and verification methods

**Specific Questions to Answer:**
1. What are the tradeoffs between using Vercel nameservers vs. Spaceship nameservers for an e-commerce application?
2. What is the recommended DNS configuration for apex domains and www subdomains on Vercel?
3. What are the minimal required DNS records for a production e-commerce site (A, CNAME, MX, TXT, CAA)?
4. What are the first principles of zero-downtime DNS migration?
5. What are the red flags and common failure modes in DNS configuration for e-commerce?

**Context:** Next.js 15 / React 18 / Sanity v3 e-commerce application
