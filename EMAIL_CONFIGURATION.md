# Email Configuration Guide

## Email Credentials
- **Email**: summerlandestates@summerlandestates.com
- **Password**: Success12!

## Supabase Email Configuration

### Step 1: Configure Supabase Email Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Configure the following email templates:

#### Confirm Signup Email
- **Subject**: Welcome to Summerland Estates - Confirm Your Email
- **Content**: 
```
Welcome to Summerland Estates!

Please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

If you didn't create an account, you can safely ignore this email.

Best regards,
Summerland Estates Team
```

#### Reset Password Email
- **Subject**: Reset Your Password - Summerland Estates
- **Content**:
```
You requested to reset your password for your Summerland Estates account.

Click the link below to reset your password:

{{ .ConfirmationURL }}

If you didn't request this, you can safely ignore this email.

Best regards,
Summerland Estates Team
```

#### Email Change Email
- **Subject**: Email Change Request - Summerland Estates
- **Content**:
```
Your email address is being changed for your Summerland Estates account.

Click the link below to confirm the change:

{{ .ConfirmationURL }}

If you didn't request this change, please contact support immediately.

Best regards,
Summerland Estates Team
```

### Step 2: Enable Email Verification

1. Go to **Authentication** → **Providers** → **Email**
2. Ensure **Enable email provider** is checked
3. Enable **Confirm email** checkbox
4. Set **Email change security** to confirm email change
5. Enable **Secure email change** (recommended)

### Step 3: Configure SMTP Settings (Custom Email)

To use your custom email instead of Supabase's default:

1. Go to **Authentication** → **Email Templates** → **SMTP Settings**
2. Configure SMTP settings:
   - **SMTP Host**: smtp.gmail.com
   - **SMTP Port**: 587
   - **SMTP User**: summerlandestates@summerlandestates.com
   - **SMTP Password**: Success12!
   - **Sender Name**: Summerland Estates
   - **Sender Email**: summerlandestates@summerlandestates.com

3. Click **Test SMTP** to verify configuration
4. Click **Save** to apply settings

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Configuration
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=summerlandestates@summerlandestates.com
VITE_SMTP_PASSWORD=Success12!
VITE_EMAIL_FROM=summerlandestates@summerlandestates.com
VITE_EMAIL_FROM_NAME=Summerland Estates
```

## Email Functionality in the Application

### 1. User Registration
- Email verification is sent automatically upon signup
- User must verify email before accessing full features

### 2. Password Reset
- Users can reset password via email
- Secure link sent to registered email

### 3. Email Change
- Users can change their email address
- Verification required for new email

### 4. Admin Notifications
- Application approvals
- Membership confirmations
- Payment confirmations

## Testing Email Configuration

### Test Email Verification:
1. Sign up for a new account
2. Check your inbox (summerlandestates@summerlandestates.com)
3. Click the verification link
4. Verify account is activated

### Test Password Reset:
1. Go to login page
2. Click "Forgot Password"
3. Enter your email
4. Check your inbox for reset link
5. Test password reset functionality

## Troubleshooting

### Emails Not Sending:
1. Check SMTP settings in Supabase dashboard
2. Verify email credentials are correct
3. Check spam folder
4. Ensure email provider allows SMTP access

### Gmail Specific Setup:
1. Enable 2-Factor Authentication on the Gmail account
2. Generate an App Password for SMTP
3. Use the App Password instead of regular password
4. Enable "Less Secure Apps" if using regular password (not recommended)

### Email Templates Not Working:
1. Clear Supabase cache
2. Restart the Supabase project
3. Check template syntax and variables
4. Test with default Supabase templates first

## Security Notes

- **Never commit email credentials to version control**
- **Use environment variables for all sensitive data**
- **Rotate passwords regularly**
- **Monitor email deliverability**
- **Set up SPF, DKIM, and DMARC records for better deliverability**

## Email Deliverability Best Practices

1. **SPF Record**: Add to your domain DNS
```
v=spf1 include:_spf.google.com ~all
```

2. **DKIM**: Set up DKIM signing in Gmail settings

3. **DMARC**: Add DMARC policy
```
_dmarc.summerlandestates.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:summerlandestates@summerlandestates.com"
```

## Support

For email-related issues:
1. Check Supabase dashboard logs
2. Review email bounce reports
3. Verify DNS settings
4. Contact Supabase support if needed
