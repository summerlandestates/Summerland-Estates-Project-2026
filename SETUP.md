# Summerland Estates - Setup Guide

## Overview
Summerland Estates is a premium directory platform connecting luxury estate professionals with high-net-worth households. This guide will help you set up the project with Supabase backend integration.

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step 1: Clone and Install Dependencies

```bash
cd c:\laragon\www\Summerland-Estates-Project-2026
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Name: `summerland-estates`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Wait for the project to be created (~2 minutes)

### 2.2 Get Your API Keys
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 2.3 Configure Environment Variables
1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.4 Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL Editor
5. Click **Run** to execute the schema

This will create:
- All necessary tables (profiles, listings, messages, reviews, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps

### 2.5 Configure Email Settings

**Important:** For email verification to work, you need to configure email settings in Supabase:

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Under **Confirm signup**, ensure the template is enabled
3. The default template will send a 6-digit OTP code
4. For development, Supabase uses their email service (no additional setup needed)
5. For production, configure your own SMTP provider in **Project Settings** → **Auth**

### 2.6 Enable Google OAuth (Optional)
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Follow Supabase's guide to set up Google OAuth:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
4. Paste your Google Client ID and Secret into Supabase

## Step 3: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 4: Create Root Admin User

### Method 1: Through Supabase Dashboard (Recommended)
1. Sign up for an account through the UI (`/signup`)
2. In Supabase dashboard, go to **Table Editor** → **profiles**
3. Find your user and change the `role` column to `admin`
4. Access the admin dashboard at `/admin/login`
5. Sign in with your admin credentials

### Method 2: Using SQL
1. Sign up for an account first
2. In Supabase **SQL Editor**, run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```
3. Access the admin dashboard at `/admin/login`

**Admin Credentials:**
- URL: `http://localhost:5173/admin/login`
- Use the same email/password from your signup
- Only users with `role = 'admin'` can access the admin dashboard

## Features Implemented

### ✅ Frontend Modernization
- Modern orange/amber color scheme
- Professional hover effects and transitions
- Rounded corners and shadows
- Responsive design
- Updated NavBar with dynamic user profile
- Avatar with initials fallback
- Professional loading spinners

### ✅ Authentication System
- Email/password signup and login with validation
- **6-digit email verification code** after signup
- Email verification page with:
  - Auto-focus on code inputs
  - Paste support for verification codes
  - Resend code functionality
  - Loading states and validation
- **Forgot password** functionality
- **Password reset** with email link
- Google OAuth integration
- Toast notifications for all auth actions
- Loading states with spinners
- Disabled buttons during processing
- Auto-redirect after successful verification
- Session management with React Context
- Protected routes

### ✅ User Profile Management
- Dynamic profile dropdown in NavBar
- User avatar or initials display
- Profile settings access
- Sign out functionality
- User metadata display (name, email)

### ✅ Admin Dashboard
- Separate admin login at `/admin/login`
- Role-based access control
- User management interface
- View all users with details
- Make/remove admin privileges
- Delete users with confirmation
- Real-time user statistics
- Professional admin UI with Shield icon
- Toast notifications for all admin actions

### ✅ Database Schema
- User profiles with role-based access
- Listings/profiles for professionals and businesses
- Skills, work history, certifications
- Reviews and ratings
- Messaging system
- Saved profiles
- Row Level Security (RLS) for data protection
- Admin role support

## Next Steps (To Be Implemented)

### 1. User Profile Management
- Create/edit profile after signup
- Upload profile photos to Supabase Storage
- Manage work history, skills, certifications
- Profile approval workflow

### 2. Admin Dashboard
- View all users and listings
- Approve/reject profiles
- Manage reviews
- User management (ban, delete, edit)
- Analytics dashboard

### 3. Dynamic Directory
- Fetch listings from Supabase instead of static data
- Real-time search and filtering
- Profile visibility based on user tier
- Pagination

### 4. Messaging System
- Real-time messaging with Supabase Realtime
- Conversation threads
- Message notifications
- Read receipts

### 5. Additional Features
- Job posting and applications
- Service requests
- Profile comparison
- Email notifications
- Payment integration for premium tiers

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── NavBar.tsx      # Navigation bar
│   ├── Footer.tsx      # Footer
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utilities
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── DirectoryPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── ...
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx             # Main app component
```

## Troubleshooting

### TypeScript Errors
The TypeScript errors you see in the IDE are expected and will resolve when you:
1. Restart the TypeScript server
2. Run `npm run dev`
3. The Vite dev server will compile correctly

### Supabase Connection Issues
- Verify your `.env` file has the correct credentials
- Check that your Supabase project is active
- Ensure the database schema was executed successfully

### Google OAuth Not Working
- Verify redirect URIs are correctly configured
- Check that Google OAuth is enabled in Supabase
- Ensure your Google Cloud Project has the correct APIs enabled

## Support

For issues or questions:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the TypeScript/React documentation
3. Check the project's GitHub issues (if applicable)

## License

This project is proprietary and confidential.
