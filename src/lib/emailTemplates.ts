/**
 * Summerland Estates - Email Templates
 * Beautiful, branded email templates for all user communications
 */

export interface EmailTemplateData {
  userName?: string;
  verificationLink?: string;
  resetLink?: string;
  appUrl?: string;
  logoUrl?: string;
  year?: number;
}

const BRAND_COLORS = {
  primary: '#A89F91',
  primaryDark: '#8B8378',
  background: '#FAFAFA',
  text: '#1a1a1a',
  textLight: '#666666',
  white: '#ffffff',
  border: '#E5E5E5'
};

const emailWrapper = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: ${BRAND_COLORS.background};
      color: ${BRAND_COLORS.text};
      line-height: 1.6;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_COLORS.white};
    }
    
    .email-header {
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .email-header img {
      max-width: 200px;
      height: auto;
    }
    
    .email-header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      color: ${BRAND_COLORS.white};
      font-size: 28px;
      margin: 20px 0 0 0;
      font-weight: 600;
    }
    
    .email-body {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: ${BRAND_COLORS.text};
    }
    
    .content-text {
      font-size: 16px;
      color: ${BRAND_COLORS.textLight};
      margin-bottom: 30px;
      line-height: 1.8;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      color: ${BRAND_COLORS.white};
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 30px 0;
      text-align: center;
      box-shadow: 0 4px 15px rgba(168, 159, 145, 0.3);
    }
    
    .cta-button:hover {
      box-shadow: 0 6px 20px rgba(168, 159, 145, 0.4);
    }
    
    .info-box {
      background-color: ${BRAND_COLORS.background};
      border-left: 4px solid ${BRAND_COLORS.primary};
      padding: 20px;
      margin: 30px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .info-box h3 {
      margin: 0 0 10px 0;
      color: ${BRAND_COLORS.text};
      font-size: 18px;
    }
    
    .info-box p {
      margin: 0;
      color: ${BRAND_COLORS.textLight};
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${BRAND_COLORS.border}, transparent);
      margin: 30px 0;
    }
    
    .email-footer {
      background-color: ${BRAND_COLORS.background};
      padding: 30px;
      text-align: center;
    }
    
    .social-links {
      margin-bottom: 20px;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: ${BRAND_COLORS.primary};
      text-decoration: none;
    }
    
    .footer-text {
      font-size: 14px;
      color: ${BRAND_COLORS.textLight};
      margin-bottom: 10px;
    }
    
    .footer-address {
      font-size: 12px;
      color: #999;
    }
    
    .link-fallback {
      word-break: break-all;
      color: ${BRAND_COLORS.primary};
      font-size: 14px;
      margin-top: 20px;
    }
    
    @media (max-width: 480px) {
      .email-header {
        padding: 30px 20px;
      }
      
      .email-header h1 {
        font-size: 24px;
      }
      
      .email-body {
        padding: 30px 20px;
      }
      
      .cta-button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td>
        <div class="email-wrapper">
          ${content}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getVerificationEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Welcome to Summerland Estates - Verify Your Email';
  
  const html = emailWrapper(`
    <div class="email-header">
      <h1>Welcome to Summerland Estates</h1>
    </div>
    
    <div class="email-body">
      <p class="greeting">Hello ${data.userName || 'there'},</p>
      
      <p class="content-text">
        Thank you for joining Summerland Estates! We're thrilled to have you as part of our exclusive luxury community. 
        To complete your registration and unlock full access to our platform, please verify your email address.
      </p>
      
      <div style="text-align: center;">
        <a href="${data.verificationLink}" class="cta-button">Verify My Email</a>
      </div>
      
      <div class="info-box">
        <h3>What happens next?</h3>
        <p>Once verified, you'll be able to connect with luxury estate professionals, browse exclusive listings, and access premium features tailored to your membership level.</p>
      </div>
      
      <div class="divider"></div>
      
      <p class="content-text" style="font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p class="link-fallback">${data.verificationLink}</p>
      
      <p class="content-text" style="font-size: 14px; margin-top: 30px;">
        This verification link will expire in 24 hours. If you didn't create an account with Summerland Estates, 
        you can safely ignore this email.
      </p>
    </div>
    
    <div class="email-footer">
      <p class="footer-text">© ${data.year || new Date().getFullYear()} Summerland Estates. All rights reserved.</p>
      <p class="footer-address">Luxury Estate Professional Network</p>
    </div>
  `, subject);
  
  return { subject, html };
};

export const getPasswordResetTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Reset Your Password - Summerland Estates';
  
  const html = emailWrapper(`
    <div class="email-header">
      <h1>Password Reset Request</h1>
    </div>
    
    <div class="email-body">
      <p class="greeting">Hello ${data.userName || 'there'},</p>
      
      <p class="content-text">
        We received a request to reset your password for your Summerland Estates account. 
        Click the button below to create a new password and secure your account.
      </p>
      
      <div style="text-align: center;">
        <a href="${data.resetLink}" class="cta-button">Reset My Password</a>
      </div>
      
      <div class="info-box">
        <h3>Security Notice</h3>
        <p>If you didn't request this password reset, please ignore this email or contact our support team immediately. Your account security is our top priority.</p>
      </div>
      
      <div class="divider"></div>
      
      <p class="content-text" style="font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p class="link-fallback">${data.resetLink}</p>
      
      <p class="content-text" style="font-size: 14px; margin-top: 30px;">
        This reset link will expire in 1 hour for security reasons.
      </p>
    </div>
    
    <div class="email-footer">
      <p class="footer-text">© ${data.year || new Date().getFullYear()} Summerland Estates. All rights reserved.</p>
      <p class="footer-address">Need help? Contact us at summerlandestates@summerlandestates.com</p>
    </div>
  `, subject);
  
  return { subject, html };
};

export const getWelcomeEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Welcome to the Summerland Estates Community!';
  
  const html = emailWrapper(`
    <div class="email-header">
      <h1>Welcome to Our Community</h1>
    </div>
    
    <div class="email-body">
      <p class="greeting">Hello ${data.userName || 'there'},</p>
      
      <p class="content-text">
        Congratulations! Your email has been verified and you're now officially part of the Summerland Estates community. 
        We're excited to help you connect with the finest luxury estate professionals.
      </p>
      
      <div class="info-box">
        <h3>What's Next?</h3>
        <p>Complete your profile, browse exclusive listings, and start connecting with verified estate professionals in your area.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.appUrl || 'https://summerlandestates.com/dashboard'}" class="cta-button">Go to My Dashboard</a>
      </div>
      
      <div class="divider"></div>
      
      <p class="content-text">
        <strong>Here are some things you can do:</strong>
      </p>
      
      <ul style="color: ${BRAND_COLORS.textLight}; padding-left: 20px; margin-bottom: 30px;">
        <li style="margin-bottom: 10px;">Complete your professional profile</li>
        <li style="margin-bottom: 10px;">Browse luxury estate listings</li>
        <li style="margin-bottom: 10px;">Connect with verified professionals</li>
        <li style="margin-bottom: 10px;">Access exclusive resources and articles</li>
      </ul>
    </div>
    
    <div class="email-footer">
      <p class="footer-text">© ${data.year || new Date().getFullYear()} Summerland Estates. All rights reserved.</p>
      <p class="footer-address">Your gateway to luxury estate excellence</p>
    </div>
  `, subject);
  
  return { subject, html };
};

export const getAccountApprovedTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Your Account Has Been Approved - Summerland Estates';
  
  const html = emailWrapper(`
    <div class="email-header">
      <h1>Account Approved!</h1>
    </div>
    
    <div class="email-body">
      <p class="greeting">Hello ${data.userName || 'there'},</p>
      
      <p class="content-text">
        Great news! Your Summerland Estates account has been reviewed and approved by our team. 
        You now have full access to all platform features.
      </p>
      
      <div class="info-box">
        <h3>You're All Set!</h3>
        <p>Your profile is now live and visible to other members. Start exploring the platform and making valuable connections.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.appUrl || 'https://summerlandestates.com/dashboard'}" class="cta-button">Explore Now</a>
      </div>
      
      <div class="divider"></div>
      
      <p class="content-text" style="font-size: 14px;">
        If you have any questions or need assistance, our support team is here to help at 
        <a href="mailto:summerlandestates@summerlandestates.com" style="color: ${BRAND_COLORS.primary};">summerlandestates@summerlandestates.com</a>
      </p>
    </div>
    
    <div class="email-footer">
      <p class="footer-text">© ${data.year || new Date().getFullYear()} Summerland Estates. All rights reserved.</p>
      <p class="footer-address">Premium Estate Professional Network</p>
    </div>
  `, subject);
  
  return { subject, html };
};

export const getNotificationEmailTemplate = (
  title: string,
  message: string,
  ctaText?: string,
  ctaLink?: string,
  data?: EmailTemplateData
): { subject: string; html: string } => {
  const html = emailWrapper(`
    <div class="email-header">
      <h1>${title}</h1>
    </div>
    
    <div class="email-body">
      <p class="greeting">Hello ${data?.userName || 'there'},</p>
      
      <p class="content-text">${message}</p>
      
      ${ctaText && ctaLink ? `
        <div style="text-align: center;">
          <a href="${ctaLink}" class="cta-button">${ctaText}</a>
        </div>
      ` : ''}
      
      <div class="divider"></div>
      
      <p class="content-text" style="font-size: 14px;">
        You're receiving this email because you have notifications enabled for your Summerland Estates account.
        Manage your notification preferences in your account settings.
      </p>
    </div>
    
    <div class="email-footer">
      <p class="footer-text">© ${data?.year || new Date().getFullYear()} Summerland Estates. All rights reserved.</p>
      <p class="footer-address">Luxury Estate Professional Network</p>
    </div>
  `, title);
  
  return { subject: title, html };
};

export default {
  getVerificationEmailTemplate,
  getPasswordResetTemplate,
  getWelcomeEmailTemplate,
  getAccountApprovedTemplate,
  getNotificationEmailTemplate,
  BRAND_COLORS
};
