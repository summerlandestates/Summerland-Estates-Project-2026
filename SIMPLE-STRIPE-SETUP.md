# Simple Stripe Setup - Works Everywhere

## What Changed

**Removed:** Netlify functions (complicated, platform-specific)  
**Added:** Simple API route that works with Vercel, Netlify, or any platform

---

## How It Works

### Development (Local):
1. Run `npm run dev` - This starts TWO servers:
   - **Vite** on `http://localhost:5173` (your React app)
   - **API server** on `http://localhost:3001` (handles Stripe)

2. Vite proxies `/api/*` requests to the API server automatically

3. Everything works seamlessly - no special setup needed!

### Production (Vercel):
1. Deploy to Vercel
2. Vercel automatically detects the `/api` folder
3. Creates serverless functions for each file
4. Works exactly like development

---

## File Structure

```
project/
├── api/
│   └── create-checkout-session.ts    # Vercel serverless function
├── dev-server.js                      # Local API server for development
├── vercel.json                        # Vercel configuration
└── src/
    └── pages/
        └── CheckoutPage.tsx           # Calls /api/create-checkout-session
```

---

## Commands

### Start Development Server:
```bash
npm run dev
```

This runs both Vite and API server together. You'll see:
```
✅ API server running on http://localhost:3001
✅ Vite dev server running on http://localhost:5173
```

### Build for Production:
```bash
npm run build
```

### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Environment Variables

### Local (.env file):
```bash
VITE_SUPABASE_URL=https://odrliroexttojsqsissj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Vercel Dashboard:
Add the same 4 variables in:
- Project Settings → Environment Variables

---

## Testing Stripe Checkout

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to checkout:**
   - Visit `http://localhost:5173`
   - Click "Get Started"
   - Select a paid plan
   - Fill form
   - Click "Proceed to Payment"

3. **Test payment:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC

4. **Success:**
   - Redirects to payment success page
   - Account created in Supabase
   - Redirects to homepage

---

## How API Routes Work

### Development:
```
Browser → http://localhost:5173/api/create-checkout-session
         ↓ (Vite proxy)
         → http://localhost:3001/api/create-checkout-session
         → dev-server.js handles it
```

### Production (Vercel):
```
Browser → https://yourapp.vercel.app/api/create-checkout-session
         → Vercel serverless function
         → api/create-checkout-session.ts handles it
```

**Same code, works everywhere!**

---

## Benefits

✅ **Simple:** Just run `npm run dev`  
✅ **No platform lock-in:** Works on Vercel, Netlify, or anywhere  
✅ **Same code locally and production:** No environment-specific logic  
✅ **Easy to understand:** Standard Express server for dev, serverless for prod  
✅ **Fast:** No extra build steps or complicated setup  

---

## Deploying to Other Platforms

### Vercel (Recommended):
```bash
vercel
```

### Netlify:
```bash
# Netlify will auto-detect and convert /api routes to functions
netlify deploy --prod
```

### Other Platforms:
The `/api` folder structure is a standard pattern. Most modern platforms support it.

---

## Troubleshooting

### "Cannot connect to API server"
**Solution:** Make sure both servers are running:
```bash
npm run dev
```

You should see BOTH:
- ✅ Vite dev server
- ✅ API server

### "Stripe error in production"
**Solution:** Check environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Make sure `STRIPE_SECRET_KEY` is set

### "404 on /api/create-checkout-session"
**Solution:** 
- **Local:** Make sure API server is running (check terminal)
- **Production:** Make sure you deployed the `/api` folder

---

## Summary

**Before:** Complicated Netlify setup, different commands, platform-specific  
**After:** Simple `npm run dev`, works everywhere, easy to deploy  

**No more:**
- ❌ `npm run dev:netlify`
- ❌ Port conflicts
- ❌ Platform-specific code
- ❌ Complicated setup

**Just:**
- ✅ `npm run dev`
- ✅ Deploy to Vercel
- ✅ Done!
