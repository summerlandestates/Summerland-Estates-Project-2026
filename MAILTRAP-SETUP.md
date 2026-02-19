# Mailtrap SMTP Setup for Supabase

## Step-by-Step Configuration

### 1. Get Mailtrap Credentials

From your Mailtrap inbox (https://mailtrap.io/inboxes):
- **Host:** `sandbox.smtp.mailtrap.io`
- **Port:** `2525` (recommended) or `465` (SSL) or `587` (TLS)
- **Username:** `c54516a1967514` (your specific username)
- **Password:** (copy from Mailtrap - shown as asterisks)
- **Auth:** PLAIN, LOGIN, or CRAM-MD5

### 2. Configure Supabase SMTP

Go to your Supabase project:

1. **Project Settings** (gear icon in sidebar)
2. **Auth** (in the settings menu)
3. Scroll down to **SMTP Settings** section
4. Click **Enable Custom SMTP**

Fill in the following:

```
Sender email: info@summerland.com
Sender name: Summerland Estates

Host: sandbox.smtp.mailtrap.io
Port number: 2525
Username: c54516a1967514
Password: [YOUR_MAILTRAP_PASSWORD]

Minimum interval per user: 60 seconds
```

5. Click **Save**

### 3. Test Configuration

After saving:

1. Go to **Authentication** → **Users**
2. Click **Invite user**
3. Enter a test email
4. Check your Mailtrap inbox for the email

### 4. Common Issues

**Issue: "unexpected_failure: Error sending confirmation email"**

Solutions:
- ✅ Make sure you filled in the **Password** field (not just username)
- ✅ Try port **2525** instead of 465
- ✅ Verify credentials are copied correctly (no extra spaces)
- ✅ Make sure "Enable Custom SMTP" is toggled ON
- ✅ Click **Save** after making changes

**Issue: Emails not appearing in Mailtrap**

Solutions:
- Check you're looking at the correct inbox
- Verify the SMTP credentials match your inbox
- Try sending a test email from Supabase
- Check Mailtrap's "SMTP Settings" tab for connection logs

**Issue: Port 465 not working**

Solution:
- Use port **2525** (Mailtrap's recommended port)
- Port 465 requires SSL/TLS which may have certificate issues
- Port 2525 works without SSL in development

### 5. Verify It's Working

Test the signup flow:

1. Go to `http://localhost:5174/signup`
2. Create a new account
3. You should see: "Verification Code Sent!"
4. Check your **Mailtrap inbox** for the 6-digit code
5. Enter the code on the verification page
6. Success! ✅

### 6. Production Setup

For production, replace Mailtrap with a real SMTP provider:

**Recommended providers:**
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Amazon SES** (very cheap, $0.10 per 1,000 emails)
- **Postmark** (100 emails/month free)

Configuration is the same - just update the host, port, username, and password.

### 7. Email Templates

After SMTP is working, customize your email templates:

1. **Authentication** → **Email Templates**
2. Edit **Confirm signup** template
3. Customize the message (keep the `{{ .Token }}` variable for the code)
4. Edit **Reset password** template
5. Save changes

### Troubleshooting Checklist

- [ ] Password field is filled in (not just username)
- [ ] Port is 2525 (not 465 or 587)
- [ ] "Enable Custom SMTP" is toggled ON
- [ ] Credentials match your Mailtrap inbox exactly
- [ ] Changes have been saved
- [ ] Tried clearing browser cache and retrying
- [ ] Checked Supabase logs for detailed error messages

### Getting Detailed Error Logs

If still having issues:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try signing up again
4. Look for error messages
5. Check **Network** tab for failed requests
6. Share the error details for further help

## Current Configuration (Based on Your Setup)

```
Host: sandbox.smtp.mailtrap.io
Port: 465 → Change to 2525
Username: c54516a1967514 ✅
Password: [MISSING - ADD THIS] ❌
Sender: info@summerland.com ✅
Name: Summerland Estates ✅
```

**Action Required:** Add your Mailtrap password and change port to 2525!
