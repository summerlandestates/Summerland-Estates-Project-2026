# Supabase Email Configuration - Exact Settings to Enter

## Step-by-Step Instructions for Supabase Dashboard

### 1. Go to Your Supabase Project
- Log in to https://supabase.com/dashboard
- Select your project: `odrliroexttojsqsissj`

### 2. Navigate to Email Settings
- Go to **Authentication** (left sidebar)
- Click on **Email Templates**
- Click on **SMTP Settings** tab

### 3. Enter These Exact SMTP Settings:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: summerlandestates@summerlandestates.com
SMTP Password: Success12!
Sender Email: summerlandestates@summerlandestates.com
Sender Name: Summerland Estates
```

### 4. Configure Email Templates

#### Confirm Signup Email Template:
```
Subject: Welcome to Summerland Estates - Confirm Your Email

Content:
Welcome to Summerland Estates!

Please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

If you didn't create an account, you can safely ignore this email.

Best regards,
Summerland Estates Team
```

#### Reset Password Email Template:
```
Subject: Reset Your Password - Summerland Estates

Content:
You requested to reset your password for your Summerland Estates account.

Click the link below to reset your password:

{{ .ConfirmationURL }}

If you didn't request this, you can safely ignore this email.

Best regards,
Summerland Estates Team
```

#### Email Change Email Template:
```
Subject: Email Change Request - Summerland Estates

Content:
Your email address is being changed for your Summerland Estates account.

Click the link below to confirm the change:

{{ .ConfirmationURL }}

If you didn't request this change, please contact support immediately.

Best regards,
Summerland Estates Team
```

### 5. Enable Email Verification

- Go to **Authentication** → **Providers** → **Email**
- Ensure **Enable email provider** is checked ✅
- Enable **Confirm email** checkbox ✅
- Enable **Secure email change** checkbox ✅
- Click **Save**

### 6. Test the Configuration

After entering the SMTP settings:
1. Click **Test SMTP** button
2. Enter your email: summerlandestates@summerlandestates.com
3. Click **Send Test Email**
4. Check your inbox for the test email
5. If successful, click **Save**

### 7. Alternative SMTP Settings (If Gmail Doesn't Work)

If your hosting provider uses different SMTP settings, try these common alternatives:

#### For Name.com Hosting:
```
SMTP Host: mail.summerlandestates.com
SMTP Port: 587
SMTP User: summerlandestates@summerlandestates.com
SMTP Password: Success12!
```

#### For Generic Hosting:
```
SMTP Host: smtp.summerlandestates.com
SMTP Port: 465 (with SSL) or 587 (with TLS)
SMTP User: summerlandestates@summerlandestates.com
SMTP Password: Success12!
```

### 8. Gmail-Specific Setup (If Using Gmail)

If summerlandestates@summerlandestates.com is hosted on Gmail:

1. Enable 2-Factor Authentication on the Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate
   - Use the app password instead of "Success12!"
3. Enable "Less Secure Apps" (if not using app password)

### 9. Verification

After configuration, test by:
1. Creating a new user account
2. Checking your email for verification link
3. Testing password reset functionality
4. Verifying all email templates work

### Troubleshooting

**If emails don't send:**
- Check SMTP credentials are correct
- Verify hosting provider allows SMTP access
- Check spam folder
- Try port 465 instead of 587
- Enable SSL/TLS in SMTP settings

**If using hosting email:**
- Contact your hosting provider for correct SMTP host
- They will provide: SMTP Host, Port, and any special settings
- Common hosting SMTP hosts: mail.yourdomain.com, smtp.yourdomain.com

### Contact Support

If you need help finding your hosting SMTP settings:
- Contact Name.com support
- Check hosting control panel (cPanel, Plesk, etc.)
- Look for "Email Settings" or "SMTP Configuration" in hosting dashboard
