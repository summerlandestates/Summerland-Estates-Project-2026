# Supabase Email Templates - Summerland Estates

## How to Configure Email Templates in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Click on each template below and paste the HTML content
4. Click **Save** for each template

---

## 1. Confirm Signup Email Template

**Subject:** `Welcome to Summerland Estates - Verify Your Email`

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Summerland Estates</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; color: #1a1a1a; line-height: 1.6; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); padding: 40px 30px; text-align: center; }
    .email-header h1 { font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; }
    .email-body { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
    .content-text { font-size: 16px; color: #666666; margin-bottom: 30px; line-height: 1.8; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(168, 159, 145, 0.3); }
    .info-box { background-color: #FAFAFA; border-left: 4px solid #A89F91; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
    .info-box h3 { margin: 0 0 10px 0; color: #1a1a1a; font-size: 18px; }
    .info-box p { margin: 0; color: #666666; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #E5E5E5, transparent); margin: 30px 0; }
    .email-footer { background-color: #FAFAFA; padding: 30px; text-align: center; }
    .footer-text { font-size: 14px; color: #666666; margin-bottom: 10px; }
    .footer-address { font-size: 12px; color: #999; }
    .link-fallback { word-break: break-all; color: #A89F91; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>Welcome to Summerland Estates</h1>
          </div>
          <div class="email-body">
            <p class="greeting">Hello {{ .Email }},</p>
            <p class="content-text">
              Thank you for joining Summerland Estates! We're thrilled to have you as part of our exclusive luxury community. 
              To complete your registration and unlock full access to our platform, please verify your email address.
            </p>
            <div style="text-align: center;">
              <a href="{{ .ConfirmationURL }}" class="cta-button">Verify My Email</a>
            </div>
            <div class="info-box">
              <h3>What happens next?</h3>
              <p>Once verified, you'll be able to connect with luxury estate professionals, browse exclusive listings, and access premium features tailored to your membership level.</p>
            </div>
            <div class="divider"></div>
            <p class="content-text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p class="link-fallback">{{ .ConfirmationURL }}</p>
            <p class="content-text" style="font-size: 14px; margin-top: 30px;">This verification link will expire in 24 hours. If you didn't create an account with Summerland Estates, you can safely ignore this email.</p>
          </div>
          <div class="email-footer">
            <p class="footer-text">© 2026 Summerland Estates. All rights reserved.</p>
            <p class="footer-address">Luxury Estate Professional Network</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password Email Template

**Subject:** `Reset Your Password - Summerland Estates`

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; color: #1a1a1a; line-height: 1.6; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); padding: 40px 30px; text-align: center; }
    .email-header h1 { font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; }
    .email-body { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
    .content-text { font-size: 16px; color: #666666; margin-bottom: 30px; line-height: 1.8; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(168, 159, 145, 0.3); }
    .info-box { background-color: #FAFAFA; border-left: 4px solid #A89F91; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
    .info-box h3 { margin: 0 0 10px 0; color: #1a1a1a; font-size: 18px; }
    .info-box p { margin: 0; color: #666666; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #E5E5E5, transparent); margin: 30px 0; }
    .email-footer { background-color: #FAFAFA; padding: 30px; text-align: center; }
    .footer-text { font-size: 14px; color: #666666; margin-bottom: 10px; }
    .footer-address { font-size: 12px; color: #999; }
    .link-fallback { word-break: break-all; color: #A89F91; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="email-body">
            <p class="greeting">Hello {{ .Email }},</p>
            <p class="content-text">
              We received a request to reset your password for your Summerland Estates account. 
              Click the button below to create a new password and secure your account.
            </p>
            <div style="text-align: center;">
              <a href="{{ .ConfirmationURL }}" class="cta-button">Reset My Password</a>
            </div>
            <div class="info-box">
              <h3>Security Notice</h3>
              <p>If you didn't request this password reset, please ignore this email or contact our support team immediately. Your account security is our top priority.</p>
            </div>
            <div class="divider"></div>
            <p class="content-text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p class="link-fallback">{{ .ConfirmationURL }}</p>
            <p class="content-text" style="font-size: 14px; margin-top: 30px;">This reset link will expire in 1 hour for security reasons.</p>
          </div>
          <div class="email-footer">
            <p class="footer-text">© 2026 Summerland Estates. All rights reserved.</p>
            <p class="footer-address">Need help? Contact us at summerlandestates@summerlandestates.com</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Email Change (Magic Link) Template

**Subject:** `Confirm Email Change - Summerland Estates`

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; color: #1a1a1a; line-height: 1.6; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); padding: 40px 30px; text-align: center; }
    .email-header h1 { font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; }
    .email-body { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
    .content-text { font-size: 16px; color: #666666; margin-bottom: 30px; line-height: 1.8; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(168, 159, 145, 0.3); }
    .info-box { background-color: #FAFAFA; border-left: 4px solid #A89F91; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
    .info-box h3 { margin: 0 0 10px 0; color: #1a1a1a; font-size: 18px; }
    .info-box p { margin: 0; color: #666666; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #E5E5E5, transparent); margin: 30px 0; }
    .email-footer { background-color: #FAFAFA; padding: 30px; text-align: center; }
    .footer-text { font-size: 14px; color: #666666; margin-bottom: 10px; }
    .footer-address { font-size: 12px; color: #999; }
    .link-fallback { word-break: break-all; color: #A89F91; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>Confirm Email Change</h1>
          </div>
          <div class="email-body">
            <p class="greeting">Hello {{ .Email }},</p>
            <p class="content-text">
              We received a request to change the email address associated with your Summerland Estates account. 
              To confirm this change and secure your account, please click the button below.
            </p>
            <div style="text-align: center;">
              <a href="{{ .ConfirmationURL }}" class="cta-button">Confirm Email Change</a>
            </div>
            <div class="info-box">
              <h3>Didn't Request This?</h3>
              <p>If you didn't request to change your email address, please ignore this email or contact support immediately. Your account security is important to us.</p>
            </div>
            <div class="divider"></div>
            <p class="content-text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p class="link-fallback">{{ .ConfirmationURL }}</p>
            <p class="content-text" style="font-size: 14px; margin-top: 30px;">This confirmation link will expire in 1 hour.</p>
          </div>
          <div class="email-footer">
            <p class="footer-text">© 2026 Summerland Estates. All rights reserved.</p>
            <p class="footer-address">Premium Estate Professional Network</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Invite User Template

**Subject:** `You've Been Invited to Join Summerland Estates`

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Summerland Estates</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; color: #1a1a1a; line-height: 1.6; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); padding: 40px 30px; text-align: center; }
    .email-header h1 { font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; }
    .email-body { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
    .content-text { font-size: 16px; color: #666666; margin-bottom: 30px; line-height: 1.8; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #A89F91 0%, #8B8378 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(168, 159, 145, 0.3); }
    .info-box { background-color: #FAFAFA; border-left: 4px solid #A89F91; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
    .info-box h3 { margin: 0 0 10px 0; color: #1a1a1a; font-size: 18px; }
    .info-box p { margin: 0; color: #666666; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #E5E5E5, transparent); margin: 30px 0; }
    .email-footer { background-color: #FAFAFA; padding: 30px; text-align: center; }
    .footer-text { font-size: 14px; color: #666666; margin-bottom: 10px; }
    .footer-address { font-size: 12px; color: #999; }
    .link-fallback { word-break: break-all; color: #A89F91; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>You're Invited!</h1>
          </div>
          <div class="email-body">
            <p class="greeting">Hello {{ .Email }},</p>
            <p class="content-text">
              You've been invited to join Summerland Estates, the premier luxury estate professional network. 
              Accept this invitation to create your account and start connecting with top-tier estate professionals.
            </p>
            <div style="text-align: center;">
              <a href="{{ .ConfirmationURL }}" class="cta-button">Accept Invitation</a>
            </div>
            <div class="info-box">
              <h3>What is Summerland Estates?</h3>
              <p>An exclusive network connecting luxury estate professionals with clients seeking premium estate services. Join verified professionals in real estate, hospitality, security, and more.</p>
            </div>
            <div class="divider"></div>
            <p class="content-text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p class="link-fallback">{{ .ConfirmationURL }}</p>
            <p class="content-text" style="font-size: 14px; margin-top: 30px;">This invitation link will expire in 24 hours.</p>
          </div>
          <div class="email-footer">
            <p class="footer-text">© 2026 Summerland Estates. All rights reserved.</p>
            <p class="footer-address">Luxury Estate Professional Network</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Email Template Design Features

✅ **Branded with Summerland Estates colors** (Taupe #A89F91)  
✅ **Professional gradient headers**  
✅ **Mobile-responsive design**  
✅ **Playfair Display font for elegance**  
✅ **Inter font for readability**  
✅ **Clear call-to-action buttons**  
✅ **Informative side panels**  
✅ **Professional footer with copyright**  

## Important Notes:

1. **Variable Substitution**: Supabase uses `{{ .Email }}` and `{{ .ConfirmationURL }}` for dynamic content
2. **Email Links**: All confirmation links are automatically generated by Supabase
3. **Responsive**: Templates work on mobile, tablet, and desktop
4. **No Logo**: Currently using text headers. To add logo, upload logo to a public URL and add an `<img>` tag

## Testing:

After configuring templates:
1. Test signup flow with a test email
2. Verify template renders correctly
3. Check mobile appearance
4. Confirm all links work

## Support:

For email template issues, contact:
- **Summerland Support**: summerlandestates@summerlandestates.com
- **Supabase Support**: support@supabase.com
