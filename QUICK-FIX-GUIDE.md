# Quick Fix Guide - Netlify Functions & Admin Login

## Issue 1: Netlify Functions 404 Error ❌

**Problem:** 
```
POST http://localhost:5173/.netlify/functions/create-checkout-session 404 (Not Found)
```

**Root Cause:** Netlify functions don't work with regular `npm run dev` (Vite only). You need Netlify CLI to run functions locally.

### ✅ Solution:

**Step 1: Install Netlify CLI**
```bash
npm install -D netlify-cli
```

**Step 2: Run with Netlify Dev**
```bash
npm run dev:netlify
```

This will:
- Start Vite dev server
- Start Netlify functions server
- Make `/.netlify/functions/*` endpoints available

**Alternative for Testing:**
For now, you can test free accounts (they don't need Stripe). Paid account testing requires Netlify Dev running.

---

## Issue 2: Admin Login Duplicate Profiles Error ❌

**Problem:**
```json
{
  "code": "PGRST116",
  "message": "Cannot coerce the result to a single JSON object",
  "details": "The result contains 2 rows"
}
```

**Root Cause:** The admin user has duplicate profile entries in the database. The `.single()` query fails when multiple rows exist.

### ✅ Solution Applied:

**Changed all admin check queries from:**
```typescript
.select('role')
.single()
```

**To:**
```typescript
.select('role')
.eq('id', user.id)
.maybeSingle()
```

**Files Fixed:**
- ✅ `AdminLoginPage.tsx`
- ✅ `AdminDashboard.tsx`
- ✅ `AdminUsersPage.tsx`
- ✅ `AdminContentPage.tsx`

**What `.maybeSingle()` does:**
- Returns first matching row (or null if none)
- Doesn't throw error if multiple rows exist
- More forgiving than `.single()`

---

## Database Cleanup (Optional)

If you want to remove duplicate profiles:

```sql
-- Find duplicates
SELECT id, email, COUNT(*) 
FROM profiles 
GROUP BY id, email 
HAVING COUNT(*) > 1;

-- Delete duplicates (keep one)
DELETE FROM profiles 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at) as rn
    FROM profiles
  ) t
  WHERE rn > 1
);
```

---

## Testing Instructions

### Test Admin Login:
1. Go to `/admin/login`
2. Login with: `admin@summerlandestates.com`
3. Should now work without "Cannot coerce" error ✅

### Test Free Account Creation:
1. Click "Get Started"
2. Select "Community" tier (free)
3. Fill form → Submit
4. Account created immediately ✅

### Test Paid Account (Requires Netlify Dev):
1. **Stop current dev server**
2. Run: `npm run dev:netlify`
3. Go to `http://localhost:8888` (Netlify Dev port)
4. Click "Get Started" → Select paid tier
5. Fill form → Stripe Checkout should work ✅

---

## Environment Setup Checklist

### Required in `.env`:
```bash
VITE_SUPABASE_URL=https://odrliroexttojsqsissj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### For Netlify Deployment:
Add all environment variables in Netlify Dashboard:
- Site Settings → Environment Variables
- Add all 4 variables above

---

## Summary

✅ **Admin login fixed** - Changed `.single()` to `.maybeSingle()` with user ID filter  
✅ **Netlify functions setup** - Added `dev:netlify` script  
⚠️ **To test Stripe** - Must run `npm run dev:netlify` instead of `npm run dev`  
✅ **Free accounts** - Work with regular `npm run dev`  

---

## Next Steps

1. **For Development:**
   - Use `npm run dev:netlify` to test full flow with Stripe
   - Use `npm run dev` for quick testing (free accounts only)

2. **For Production:**
   - Deploy to Netlify
   - Add environment variables
   - Test with real Stripe test cards

3. **Database Cleanup:**
   - Optional: Remove duplicate profiles using SQL above
   - Or leave as-is (`.maybeSingle()` handles it)
