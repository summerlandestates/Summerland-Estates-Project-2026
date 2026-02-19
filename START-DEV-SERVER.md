# 🚀 How to Start Development Server

## ⚠️ IMPORTANT: Two Different Dev Modes

### Option 1: Regular Dev (No Stripe Payments)
**Use this for:** Testing free accounts, UI changes, general development

```bash
npm run dev
```

- ✅ Fast startup
- ✅ Free account creation works
- ❌ Stripe checkout will NOT work (404 error)
- Access at: `http://localhost:5173`

---

### Option 2: Netlify Dev (With Stripe Payments)
**Use this for:** Testing paid accounts, Stripe integration, full flow

```bash
npm run dev:netlify
```

- ✅ Netlify functions available
- ✅ Stripe checkout works
- ✅ Full payment flow testing
- ⚠️ Slower startup (runs both Vite + Netlify)
- Access at: `http://localhost:8888`

---

## 🐛 Current Issue & Workaround

**Problem:** Netlify functions return 404 when using `npm run dev`

**Why:** Vite dev server doesn't serve Netlify functions. Only Netlify CLI does.

**Solution Applied:**
The code now automatically detects dev mode and points to `http://localhost:8888` for function calls.

**What This Means:**
1. If you run `npm run dev` → Paid accounts will try to call `localhost:8888` (won't work unless Netlify Dev is also running)
2. If you run `npm run dev:netlify` → Everything works at `localhost:8888`

---

## 📋 Quick Start Guide

### For Quick Testing (Free Accounts Only):
```bash
# Terminal 1
npm run dev

# Browser
http://localhost:5173
```

### For Full Testing (Including Stripe):
```bash
# Terminal 1
npm run dev:netlify

# Browser
http://localhost:8888
```

---

## 🧪 What to Test

### With `npm run dev`:
- ✅ Admin login
- ✅ Free account creation
- ✅ Email verification
- ✅ Profile pages
- ✅ All UI features
- ❌ Paid account checkout (will error)

### With `npm run dev:netlify`:
- ✅ Everything above PLUS
- ✅ Paid account checkout
- ✅ Stripe payment flow
- ✅ Payment success page

---

## 🔧 Environment Variables Required

Make sure your `.env` file has:

```bash
VITE_SUPABASE_URL=https://odrliroexttojsqsissj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## 💡 Pro Tips

1. **Use `npm run dev` for most development** - It's faster
2. **Only use `npm run dev:netlify` when testing payments**
3. **Both can run simultaneously** if you want to test something specific
4. **Netlify Dev uses port 8888** by default
5. **Regular Vite uses port 5173** by default

---

## 🆘 Troubleshooting

### "404 on /.netlify/functions/..."
**Solution:** You're using `npm run dev` but trying to test paid accounts. Use `npm run dev:netlify` instead.

### "Port 8888 already in use"
**Solution:** Stop any running Netlify Dev instances:
```bash
# Windows
netstat -ano | findstr :8888
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8888 | xargs kill -9
```

### Netlify Dev is slow
**Solution:** This is normal. Netlify CLI needs to start both Vite and function servers. Wait 10-20 seconds for full startup.

---

## 📝 Summary

| Feature | `npm run dev` | `npm run dev:netlify` |
|---------|---------------|----------------------|
| Speed | ⚡ Fast | 🐌 Slower |
| Port | 5173 | 8888 |
| Free Accounts | ✅ | ✅ |
| Paid Accounts | ❌ | ✅ |
| Stripe Checkout | ❌ | ✅ |
| Netlify Functions | ❌ | ✅ |

**Recommendation:** Use `npm run dev` for 90% of development, switch to `npm run dev:netlify` only when testing Stripe.
