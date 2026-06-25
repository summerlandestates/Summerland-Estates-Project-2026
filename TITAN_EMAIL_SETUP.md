# Name.com Titan Email - SMTP Settings Guide

## Correct SMTP Settings for Titan Email

Based on Name.com's Titan Email service, use these settings:

### Primary SMTP Settings (Most Common):
```
SMTP Host: smtp.titan.email
SMTP Port: 465 (with SSL) or 587 (with STARTTLS)
SMTP User: summerlandestates@summerlandestates.com
SMTP Password: Success12!
Sender Email: summerlandestates@summerlandestates.com
Sender Name: Summerland Estates
```

### Alternative Settings (EU Hosted):
```
SMTP Host: smtp0101.titan.email
SMTP Port: 465 (with SSL)
SMTP User: summerlandestates@summerlandestates.com
SMTP Password: Success12!
Sender Email: summerlandestates@summerlandestates.com
Sender Name: Summerland Estates
```

### For Supabase Dashboard:
Go to your Supabase project → Authentication → Email Templates → SMTP Settings

Enter these exact values:
```
Host: smtp.titan.email
Port: 587
User: summerlandestates@summerlandestates.com
Password: Success12!
Sender Email: summerlandestates@summerlandestates.com
Sender Name: Summerland Estates
```

## How to Verify Your Titan Email Settings

### Option 1: Check in Name.com Dashboard
1. Login to https://www.name.com/account/titanemail/6668034
2. Look for **Settings** or **Email Configuration**
3. Find **SMTP/IMAP Settings**
4. Note down the exact SMTP host and port

### Option 2: Test Script (Updated)
I've updated the test script with the correct Titan Email settings. Run:
```bash
node test-email.js
```

### Option 3: Contact Titan Support
If the settings don't work, contact Titan Email support:
- Email: support@titan.email
- They can provide your exact SMTP settings based on your account

## Important Notes:

1. **Port 465** uses SSL encryption
2. **Port 587** uses STARTTLS encryption
3. Your username is your full email address: `summerlandestates@summerlandestates.com`
4. Your password is: `Success12!`

## Troubleshooting:

If emails don't send:
1. Try both port 465 and 587
2. Check if SSL/TLS is enabled
3. Verify password is correct in Name.com dashboard
4. Ensure email account is active and not suspended

## Links:
- Titan Email Support: https://support.titan.email
- Name.com Email Dashboard: https://www.name.com/account/titanemail/6668034
