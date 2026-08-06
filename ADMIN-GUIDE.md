# Admin Guide - Summerland Estates

## How to Add Articles to the News Page

1. Go to `/admin/articles` (or click **Manage Articles** in the admin sidebar)
2. Click **Create New Article**
3. Fill in the article form:
   - Title, Excerpt, Content
   - Category and Tags
   - Featured Image (upload or provide URL)
   - Meta description for SEO
   - Author name
4. Set **Status** to **Published** (or keep as Draft to edit later)
5. Click **Save Article**
6. The article will appear on the `/news` page immediately

## How to Add Events to the Events Page

1. Go to `/admin/events` (or click **Events** in the admin sidebar)
2. Click **Add Event**
3. Fill in the event form:
   - Title, Description, Event Type
   - Date, Time, Location
   - Capacity, Registration URL (optional)
   - Organizer name and email
   - Featured image (optional)
4. Set **Status** to **Published** or **Upcoming**
5. Click **Create Event**
6. The event will appear on the `/events` page

## How to Approve Users in the Dashboard

1. Go to `/admin/users` (or click **User Management** in the admin sidebar)
2. You will see a list of all user profiles with their current status
3. Find the user with status **Pending**
4. Click the **Actions** menu (three dots) on the right side
5. Choose **Approve** or **Reject**
   - If rejecting, you can add a rejection reason
6. Approved users become active and can use their profile

## How to Create a Free Pro Profile Promo Code

1. Go to `/admin/promo-codes` (or click **Promo Codes** in the admin sidebar)
2. Fill in the form:
   - Description (e.g., "Free Pro for 6 months")
   - Target Tier (e.g., Professional Pro, Business Pro)
   - Max Uses (how many people can use this code)
3. Click **Generate Promo Code**
4. Copy the generated code (e.g., `PRO-XXXXX`)
5. Give the code to the user
6. The user enters the code during profile creation on the **Apply** page
7. The user gets the selected Pro tier free for 6 months

## Setup Required

Before using promo codes, run this SQL in your Supabase SQL Editor:

```sql
-- Run the contents of CREATE-PROMO-CODES-TABLE.sql
```

This creates the `promo_codes` and `user_promo_codes` tables.
