# Authentication Flow Guide - Summerland Estates

## Complete Authentication Flow

### 1. **Signup Flow** ✅

**Step 1: User Registration** (`/signup`)
- User enters: Name, Email, Password, Confirm Password
- Validation: Password match & minimum 6 characters
- Button shows spinner while processing
- Button is disabled during signup

**Step 2: Email Verification** (`/verify-email`)
- Toast: "Verification Code Sent! Check your email for the 6-digit verification code"
- User is redirected to verification page with email in URL
- Page displays 6 input boxes for the code
- Features:
  - Auto-focus on next input after entering a digit
  - Backspace moves to previous input
  - Paste support (paste 6-digit code anywhere)
  - "Resend Code" button with loading state
  - "Verify Email" button disabled until all 6 digits entered

**Step 3: Verification Success**
- Toast: "Email Verified! Your account has been verified successfully"
- Auto-redirect to homepage after 1 second
- User is now logged in
- NavBar shows profile icon instead of "Sign In" button

### 2. **Login Flow** ✅

**Standard Login** (`/login`)
- User enters: Email, Password
- Button shows spinner: "Signing in..."
- Button is disabled during login
- Success toast: "Login Successful! Welcome back to Summerland Estates"
- Auto-redirect to homepage
- NavBar shows profile icon with dropdown

**Google OAuth Login**
- Click "Continue with Google" button
- Redirects to Google OAuth
- After approval, returns to app
- User is logged in automatically

### 3. **Forgot Password Flow** ✅

**Step 1: Request Reset** (`/forgot-password`)
- User enters email address
- Button shows spinner: "Sending..."
- Success toast: "Email Sent! Check your email for the password reset link"
- Page shows confirmation with email address
- Option to "Send to a different email"

**Step 2: Email Link**
- User receives email with reset link
- Link redirects to `/reset-password`

**Step 3: Reset Password** (`/reset-password`)
- User enters: New Password, Confirm New Password
- Validation: Password match & minimum 6 characters
- Button shows spinner: "Resetting..."
- Success toast: "Password Reset Successful! You can now sign in with your new password"
- Auto-redirect to login page after 1.5 seconds

### 4. **User Profile in NavBar** ✅

**When Logged In:**
- Shows circular avatar with:
  - Profile picture (if available)
  - OR first 2 letters of email in uppercase
  - Orange/primary color background
- Dropdown menu shows:
  - User's full name (if provided)
  - User's email
  - Separator line
  - "My Profile" link
  - "Settings" link
  - "Saved Profiles" link
  - Separator line
  - "Sign Out" button (red text)

**When Logged Out:**
- Shows "Sign In" button
- Shows "Get Started" button

### 5. **Sign Out Flow** ✅
- Click "Sign Out" from dropdown
- Toast: "Signed Out - You have been successfully signed out"
- Redirects to login page
- NavBar returns to showing "Sign In" and "Get Started" buttons

## Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/signup` | SignupPage | User registration |
| `/verify-email` | VerifyEmailPage | 6-digit email verification |
| `/login` | LoginPage | User login |
| `/forgot-password` | ForgotPasswordPage | Request password reset |
| `/reset-password` | ResetPasswordPage | Set new password |
| `/admin/login` | AdminLoginPage | Admin-only login |
| `/admin/dashboard` | AdminDashboard | Admin user management |

## Supabase Configuration Required

### Email Templates (Authentication → Email Templates)

**Confirm signup:**
- Enabled: ✅
- Type: OTP (6-digit code)
- Template: Default Supabase template
- No custom configuration needed for development

**Reset password:**
- Enabled: ✅
- Type: Magic link
- Redirect URL: `http://localhost:5174/reset-password`

### Auth Settings (Authentication → Settings)

**Email Auth:**
- Enable email confirmations: ✅
- Secure email change: ✅ (recommended)

**Site URL:**
- Development: `http://localhost:5174`
- Production: Your production URL

**Redirect URLs:**
- Add: `http://localhost:5174/reset-password`
- Add: `http://localhost:5174/auth/callback` (for OAuth)

## Testing the Flow

### Test Signup & Verification:
1. Go to `/signup`
2. Fill in the form
3. Click "Create Account"
4. Check your email for 6-digit code
5. Enter code on verification page
6. Verify you're redirected to homepage
7. Check NavBar shows your profile icon

### Test Login:
1. Go to `/login`
2. Enter credentials
3. Click "Sign In"
4. Verify redirect to homepage
5. Check profile dropdown works

### Test Forgot Password:
1. Go to `/forgot-password`
2. Enter your email
3. Check email for reset link
4. Click link (opens `/reset-password`)
5. Enter new password
6. Verify redirect to login
7. Login with new password

### Test Profile Dropdown:
1. Login to the app
2. Click profile icon in NavBar
3. Verify dropdown shows:
   - Your name and email
   - All menu items
   - Sign out button
4. Click "Sign Out"
5. Verify you're logged out

## Common Issues & Solutions

### Issue: Not receiving verification email
**Solution:** 
- Check spam folder
- Verify email in Supabase dashboard (Authentication → Users)
- Use "Resend Code" button
- Check Supabase email settings

### Issue: Verification code doesn't work
**Solution:**
- Code expires after 60 seconds (default)
- Request a new code with "Resend Code"
- Ensure you're entering all 6 digits
- Check for typos

### Issue: Password reset link doesn't work
**Solution:**
- Link expires after 1 hour (default)
- Request a new reset link
- Verify redirect URL in Supabase settings
- Check browser console for errors

### Issue: Profile icon not showing after login
**Solution:**
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Clear browser cache and reload
- Check AuthContext is properly wrapping the app

## Security Features

✅ **Email Verification:** Required before account activation
✅ **Password Validation:** Minimum 6 characters, must match confirmation
✅ **Session Management:** Automatic session handling with Supabase
✅ **Secure Password Reset:** Time-limited magic links
✅ **Protected Routes:** Admin routes check for admin role
✅ **Row Level Security:** Database policies enforce access control
✅ **Toast Notifications:** Clear feedback for all actions
✅ **Loading States:** Prevents double submissions
✅ **Error Handling:** Descriptive error messages

## Next Steps

After authentication is working:
1. Create user profile management pages
2. Implement profile photo upload
3. Add two-factor authentication (optional)
4. Set up email notifications
5. Configure production SMTP provider
6. Add session timeout handling
7. Implement "Remember Me" functionality
