# 🧪 Advertising & Sponsorship System - Complete Testing Workflow

## Pre-Testing Setup

### 1. Environment Variables (.env)
```env
# Required for Stripe payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Supabase (already configured)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App
APP_URL=http://localhost:5173
RESEND_API_KEY=...
APP_FROM_EMAIL=...
```

### 2. Database Setup (Supabase SQL Editor)

Run these in order:

```sql
-- 1. Create Sponsorships Table
\i CREATE-SPONSORSHIPS-TABLE.sql

-- 2. Create Advertisements & Email Blast Tables
\i CREATE-ADVERTISEMENTS-TABLE.sql
```

Or execute directly:

```sql
-- Verify tables exist
SELECT * FROM information_schema.tables 
WHERE table_name IN ('sponsorships', 'advertisements', 'email_blast_submissions');
```

---

## 🎯 Testing Scenarios

### SCENARIO 1: Sponsorship Inquiry (Public User)

**Path:** `/sponsorship`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/advertisements` | Page loads with all ad options displayed |
| 2 | Click "Explore Sponsorships" or "Inquire Now" | Redirects to `/sponsorship` |
| 3 | Fill form with valid data | All fields accept input |
| 4 | Submit form | Success toast appears, data saved to Supabase |
| 5 | Check Supabase `sponsorships` table | New row with `status: 'pending'` |

**Test Data:**
```json
{
  "company_name": "Luxury Services Inc",
  "contact_name": "John Smith",
  "email": "john@luxuryservices.com",
  "phone": "+1-555-123-4567",
  "website": "https://luxuryservices.com",
  "sponsorship_type": "event",
  "budget_range": "5000-10000",
  "message": "Interested in sponsoring your next networking event"
}
```

---

### SCENARIO 2: Email Blast Submission (Public User)

**Path:** `/email-blast`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/email-blast` | Page loads with form |
| 2 | Fill email details | All fields accept input |
| 3 | Click "Pay $12.99 & Submit" | Stripe payment modal opens |
| 4 | Use Stripe test card | Payment succeeds |
| 5 | Submit after payment | Success toast, redirect to success page |
| 6 | Check Supabase `email_blast_submissions` | New row with `payment_status: 'paid'` |

**Stripe Test Cards:**
```
✅ Success: 4242 4242 4242 4242
❌ Declined: 4000 0000 0000 0002
⌛ Requires 3D Secure: 4000 0025 0000 3155
```

**Test Data:**
```json
{
  "sender_name": "Jane Doe",
  "sender_email": "jane@company.com",
  "subject": "Introducing Premium Estate Services",
  "content": "<p>We offer top-tier estate management...</p>",
  "target_audience": "all",
  "scheduled_date": null
}
```

---

### SCENARIO 3: Admin Sponsorship Management

**Path:** `/admin/sponsorships`

**Prerequisites:**
- Log in as admin (email: `admin@summerlandestates.com`)
- At least one pending sponsorship in database

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/sponsorships` | Admin page loads with sidebar |
| 2 | View stats cards | Shows Total/Pending/Active/Closed counts |
| 3 | Click "View Details" on pending item | Dialog opens with full details |
| 4 | Add admin notes | Notes save successfully |
| 5 | Change status to "contacted" | Status updates, badge changes color |
| 6 | Filter by status | Only matching items display |

---

### SCENARIO 4: Admin Email Blast Review

**Path:** `/admin/email-blasts`

**Prerequisites:**
- Log in as admin
- At least one submitted email blast (paid or pending)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin/email-blasts` | Admin page loads |
| 2 | View stats | Shows Total Revenue, Pending, etc. |
| 3 | Click "Review" on pending blast | Dialog opens with email preview |
| 4 | Click "Approve & Send" | Confirmation dialog appears |
| 5 | Confirm sending | Status updates to `sent`, toast appears |
| 6 | Check "Sent" tab | Email appears in sent list |

---

### SCENARIO 5: Banner Ads Display (Homepage)

**Path:** `/` (DirectoryPage)

**Prerequisites:**
- At least one active ad in `advertisements` table:

```sql
INSERT INTO advertisements (
  company_name, contact_name, email, ad_type, 
  ad_content, image_url, target_url, placement_location,
  status, start_date, end_date
) VALUES (
  'Acme Services', 'Bob Smith', 'bob@acme.com', 'homepage_banner',
  'Premium estate services for discerning clients', 
  'https://your-image-url.com/banner.jpg',
  'https://acme.com',
  'directory_top',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
);
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/` | Directory page loads |
| 2 | Scroll to ad section (below feature cards) | Banner carousel appears |
| 3 | Wait 8 seconds | Carousel auto-rotates if multiple ads |
| 4 | Click navigation dots | Manual navigation works |
| 5 | Click "Learn More" button | Opens advertiser URL in new tab |
| 6 | Check Supabase | `clicks` column incremented |

---

### SCENARIO 6: Native Ads in Search

**Path:** `/search`

**Prerequisites:**
- Active native ad in database:

```sql
INSERT INTO advertisements (
  company_name, contact_name, email, ad_type,
  ad_content, image_url, target_url,
  status, start_date, end_date
) VALUES (
  'Elite Staffing', 'Sarah Johnson', 'sarah@elite.com', 'native_listing',
  'Find your perfect estate staff with Elite Staffing Solutions',
  'https://your-image-url.com/native.jpg',
  'https://elitestaffing.com',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
);
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/search` | Search page loads |
| 2 | View sidebar below filters | Native ad appears in sidebar |
| 3 | Switch to grid view | Ad appears inline after 2nd listing |
| 4 | Click ad | Opens target URL, click tracked |

---

### SCENARIO 7: Profile Page Sidebar Ad

**Path:** `/profile/:id`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to any profile | Profile page loads |
| 2 | View left sidebar | Native ad appears below profile card |
| 3 | Click ad link | Opens in new tab, click tracked |

---

## 🔧 API Testing (Dev Server)

### Test Email Blast Payment Endpoint

```bash
curl -X POST http://localhost:3001/api/create-email-blast-payment \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "test-submission-id",
    "amount": 12.99
  }'
```

**Expected Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

---

## 📊 Database Verification Queries

### Check All Sponsorships
```sql
SELECT 
  id, 
  company_name, 
  sponsorship_type, 
  budget_range, 
  status, 
  created_at 
FROM sponsorships 
ORDER BY created_at DESC;
```

### Check All Email Blasts
```sql
SELECT 
  ebs.id,
  ebs.sender_name,
  ebs.subject,
  ebs.status,
  ebs.payment_status,
  ebs.amount_paid,
  ebs.created_at,
  s.company_name as sponsor_company
FROM email_blast_submissions ebs
LEFT JOIN sponsorships s ON ebs.sponsor_id = s.id
ORDER BY ebs.created_at DESC;
```

### Check Active Advertisements
```sql
SELECT 
  id,
  company_name,
  ad_type,
  placement_location,
  status,
  impressions,
  clicks,
  (clicks::float / NULLIF(impressions, 0) * 100) as ctr
FROM advertisements
WHERE status = 'active'
AND start_date <= CURRENT_DATE
AND end_date >= CURRENT_DATE;
```

### Ad Performance Stats
```sql
SELECT 
  ad_type,
  COUNT(*) as total_ads,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  SUM(amount_paid) as total_revenue
FROM advertisements
GROUP BY ad_type;
```

---

## 🚨 Common Issues & Fixes

### Issue: Stripe payment modal doesn't open
**Fix:** 
1. Check `VITE_STRIPE_PUBLISHABLE_KEY` in .env
2. Verify dev server is running on port 3001
3. Check browser console for Stripe.js errors

### Issue: Ads not showing on pages
**Fix:**
1. Verify ads exist in database with `status = 'active'`
2. Check date range: `start_date <= today <= end_date`
3. Verify `placement_location` matches component prop
4. Check RLS policies allow public read access

### Issue: Admin pages show "Access Denied"
**Fix:**
1. Log in with `admin@summerlandestates.com`
2. Check JWT token contains correct email
3. Verify RLS policies check `auth.jwt() ->> 'email'`

### Issue: Click tracking not working
**Fix:**
1. Verify RPC function exists: `increment_ad_clicks`
2. Check Supabase client has anon key configured
3. Test function directly in Supabase SQL Editor:
   ```sql
   SELECT increment_ad_clicks('your-ad-id');
   ```

---

## ✅ End-to-End Test Checklist

- [ ] User can view `/advertisements` page with all options
- [ ] User can submit sponsorship inquiry → appears in admin
- [ ] User can submit email blast → payment processes → appears in admin
- [ ] Admin can view sponsorships list with correct stats
- [ ] Admin can update sponsorship status and add notes
- [ ] Admin can view email blasts with revenue tracking
- [ ] Admin can approve and "send" email blast (status updates)
- [ ] Banner ads display on DirectoryPage when active in DB
- [ ] Native ads display in SearchPage sidebar and inline
- [ ] Native ads display in ProfilePage sidebar
- [ ] Ad clicks increment the `clicks` counter
- [ ] All toast notifications appear correctly
- [ ] Responsive design works on mobile/desktop

---

## 🎭 Test User Personas

### Persona 1: "Marketing Mike" (Advertiser)
- Wants to promote his estate service company
- Navigates to `/advertisements`
- Clicks "Send Email Blast"
- Completes form and pays $12.99
- Expects confirmation email

### Persona 2: "Sponsor Sarah" (Event Sponsor)
- Wants to sponsor a networking event
- Navigates to `/sponsorship`
- Fills out detailed inquiry
- Expects follow-up within 48 hours

### Persona 3: "Admin Amy" (Site Admin)
- Reviews `/admin/sponsorships` daily
- Updates status on new inquiries
- Reviews `/admin/email-blasts`
- Approves and sends email campaigns
- Tracks revenue and performance

---

## 📱 Mobile Testing

Test on:
- [ ] iPhone Safari (iOS)
- [ ] Android Chrome
- [ ] iPad/tablet
- [ ] Desktop (1920x1080)
- [ ] Desktop (1366x768)

Check:
- [ ] Banner ads are responsive
- [ ] Carousel navigation works with touch
- [ ] Forms are mobile-friendly
- [ ] Admin sidebar collapses properly
- [ ] No horizontal scroll issues

---

**Last Updated:** June 2026  
**Version:** 1.0
