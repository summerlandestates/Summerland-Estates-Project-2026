// Simple Express server to handle API routes in development
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use((req, res, next) => {
  if (req.path === '/api/upload-article-image') return next();
  express.json()(req, res, next);
});

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY not found in .env file');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || null;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || null;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || null;
const APPLICATION_UPLOAD_BUCKET =
  process.env.VITE_APPLICATION_UPLOAD_BUCKET || process.env.APPLICATION_UPLOAD_BUCKET || 'avatars';

const isComplimentaryTier = (tier) => Boolean(tier && (tier.includes('free') || tier.includes('community')));
const sanitizeFileName = (name = 'upload') =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
const supabaseReadClient =
  SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// ─── Rate-limited Email Queue ────────────────────────────────────────────

let lastEmailTime = 0;
const EMAIL_RATE_LIMIT_MS = 600; // 600ms = ~1.6 emails/second (under 2/sec limit)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY || !process.env.APP_FROM_EMAIL) {
    console.warn('Skipping email send because RESEND_API_KEY or APP_FROM_EMAIL is missing.');
    return;
  }

  // Rate limiting: ensure minimum delay between emails
  const now = Date.now();
  const timeSinceLastEmail = now - lastEmailTime;
  if (timeSinceLastEmail < EMAIL_RATE_LIMIT_MS) {
    const waitTime = EMAIL_RATE_LIMIT_MS - timeSinceLastEmail;
    console.log(`Rate limiting: waiting ${waitTime}ms before sending email...`);
    await delay(waitTime);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.APP_FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  lastEmailTime = Date.now();

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }

  console.log(`Email sent successfully to: ${to}`);
};

const approvalTemplate = (name, requiresPayment) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Your account is approved</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">${name || 'Hello'}, your registration has been approved.${requiresPayment ? ' Please sign in to complete your membership payment and activate access.' : ' You can now sign in and access your account.'}</p>
      <a href="${APP_URL}/login" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">${requiresPayment ? 'Sign in to Complete Payment' : 'Sign in'}</a>
    </div>
  </div>
`;

const registrationPendingTemplate = (name) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Thank You for Registering</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        ${name || 'Hello'}, thank you for registering with Summerland Estates. Your account is currently under review.
      </p>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        Our team will review your application and get back to you shortly. Once approved, you will receive an email with instructions to access your account.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#6b6b6b; margin:0;"><strong>What happens next?</strong></p>
        <ul style="font-size:14px; color:#6b6b6b; margin:12px 0 0; padding-left:20px;">
          <li>Our team reviews your application</li>
          <li>You'll receive an approval email once verified</li>
          <li>Complete any required payment (if applicable)</li>
          <li>Access your full account and start connecting</li>
        </ul>
      </div>
      <p style="font-size:14px; color:#8A8279; margin:24px 0 0;">If you have any questions, please contact us at summerlandestates@summerlandestates.com</p>
    </div>
  </div>
`;

const adminNewRegistrationTemplate = (userData) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates - Admin</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">New Registration Received</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        A new user has registered and is awaiting approval.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Name:</strong> ${userData.name || 'Not provided'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Email:</strong> ${userData.email || 'Not provided'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Profile Type:</strong> ${userData.profileType || 'Not specified'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Selected Tier:</strong> ${userData.tier || 'Not specified'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Phone:</strong> ${userData.phone || 'Not provided'}</p>
      </div>
      <a href="${APP_URL}/admin" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Review in Admin Panel</a>
    </div>
  </div>
`;

const rejectionTemplate = (name, reason) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Update on your registration</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 16px;">${name || 'Hello'}, thank you for your interest in Summerland Estates. At this time we’re unable to approve your registration.</p>
      ${reason ? `<p style="font-size:15px; line-height:1.7; color:#4b4b4b; margin:0;"><strong>Reason:</strong> ${reason}</p>` : ''}
    </div>
  </div>
`;

// ─── User Action Confirmation Templates ──────────────────────────────────────

const eventRegistrationTemplate = (name, eventTitle, eventDate, eventLocation) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">You're Registered!</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        ${name || 'Hello'}, you're confirmed for <strong>${eventTitle}</strong>.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Event:</strong> ${eventTitle}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Date:</strong> ${eventDate}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Location:</strong> ${eventLocation}</p>
      </div>
      <a href="${APP_URL}/events" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">View All Events</a>
    </div>
  </div>
`;

const sponsorshipInquiryTemplate = (name, companyName, sponsorshipType) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Sponsorship Inquiry Received</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        ${name || 'Hello'}, thank you for your sponsorship interest. We've received your inquiry and will be in touch shortly.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Company:</strong> ${companyName}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Package:</strong> ${sponsorshipType}</p>
      </div>
      <a href="${APP_URL}/dashboard" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">View Dashboard</a>
    </div>
  </div>
`;

const emailBlastConfirmationTemplate = (name, subject, recipientsCount) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Email Blast Submitted</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        ${name || 'Hello'}, your email blast has been submitted for review. You'll receive confirmation once it's approved and sent.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Subject:</strong> ${subject}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Target Audience:</strong> ${recipientsCount || 'Professionals'}</p>
      </div>
      <a href="${APP_URL}/dashboard" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">View Status</a>
    </div>
  </div>
`;

const recognitionSubmissionTemplate = (name, nomineeName, category) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Recognition Submitted</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        ${name || 'Hello'}, thank you for recognizing excellence in the industry. Your nomination has been received.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Nominee:</strong> ${nomineeName}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Category:</strong> ${category}</p>
      </div>
      <a href="${APP_URL}/dashboard" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">View Dashboard</a>
    </div>
  </div>
`;

// ─── Admin Notification Templates ─────────────────────────────────────────

const adminNewEventRegistrationTemplate = (userData, eventData) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates - Admin</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">New Event Registration</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        A user has registered for an event.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>User:</strong> ${userData.name || userData.email}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Email:</strong> ${userData.email}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Event:</strong> ${eventData.title}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Date:</strong> ${eventData.date}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Location:</strong> ${eventData.location}</p>
      </div>
      <a href="${APP_URL}/admin/events" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Manage Event</a>
    </div>
  </div>
`;

const adminNewSponsorshipTemplate = (sponsorshipData) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates - Admin</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">New Sponsorship Inquiry</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        A new sponsorship inquiry has been received.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Company:</strong> ${sponsorshipData.company_name}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Contact:</strong> ${sponsorshipData.contact_name}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Email:</strong> ${sponsorshipData.email}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Phone:</strong> ${sponsorshipData.phone || 'Not provided'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Type:</strong> ${sponsorshipData.sponsorship_type}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Budget:</strong> ${sponsorshipData.budget_range}</p>
      </div>
      <a href="${APP_URL}/admin/sponsorships" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Manage Sponsorships</a>
    </div>
  </div>
`;

const adminNewEmailBlastTemplate = (emailData) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates - Admin</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">New Email Blast Submission</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        A user has submitted an email blast for review.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Sender:</strong> ${emailData.sender_name} (${emailData.sender_email})</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Subject:</strong> ${emailData.subject}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Target Recipients:</strong> ${emailData.target_recipients || 'Not specified'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Amount Paid:</strong> $${emailData.amount_paid || '0.00'}</p>
      </div>
      <a href="${APP_URL}/admin/email-blasts" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Manage Email Blasts</a>
    </div>
  </div>
`;

const adminNewRecognitionTemplate = (recognitionData) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates - Admin</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">New Recognition Submission</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        A new recognition nomination has been submitted.
      </p>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Nominee:</strong> ${recognitionData.nominee_name}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Company:</strong> ${recognitionData.company || 'Not specified'}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Category:</strong> ${recognitionData.category}</p>
        <p style="font-size:14px; color:#1f1f1f; margin:0;"><strong>Submitted by:</strong> ${recognitionData.submitter_email || recognitionData.submitter_name}</p>
      </div>
      <a href="${APP_URL}/admin" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Review in Admin Panel</a>
    </div>
  </div>
`;

// ─── Admin Action Notification Templates (Status Updates) ────────────────

const statusUpdateTemplate = (name, itemType, itemName, status, adminNotes) => {
  const statusColors = {
    approved: { bg: '#dcfce7', color: '#166534', text: 'Approved' },
    rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Declined' },
    pending: { bg: '#fef3c7', color: '#92400e', text: 'Under Review' },
    completed: { bg: '#dbeafe', color: '#1e40af', text: 'Completed' },
    sent: { bg: '#dcfce7', color: '#166534', text: 'Sent' },
  };
  const statusStyle = statusColors[status] || statusColors.pending;

  return `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:32px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Status Update</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
        ${name || 'Hello'}, there's an update on your ${itemType}.
      </p>
      <div style="background:${statusStyle.bg}; border-radius:12px; padding:16px 20px; margin:24px 0; border-left:4px solid ${statusStyle.color};">
        <p style="font-size:14px; color:${statusStyle.color}; margin:0; font-weight:600;">
          Status: ${statusStyle.text}
        </p>
      </div>
      <div style="background:#f8f4ee; border-radius:12px; padding:20px; margin:24px 0;">
        <p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>${itemType}:</strong> ${itemName}</p>
        ${adminNotes ? `<p style="font-size:14px; color:#1f1f1f; margin:0 0 8px;"><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
      </div>
      <a href="${APP_URL}/dashboard" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">View in Dashboard</a>
    </div>
  </div>
`;
};

const isMissingColumnError = (error) => error?.code === '42703';

const updateProfileIfColumnsExist = async (userId, updates) => {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId);

  if (error && !isMissingColumnError(error)) {
    throw error;
  }
};

const updateProfileApplicationData = async (userId, applicationData) => {
  if (!supabaseAdmin) return;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('application_data')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      application_data: {
        ...(profile?.application_data || {}),
        ...applicationData,
      },
    })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }
};

const listAllAuthUsers = async () => {
  const allUsers = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data?.users || [];
    allUsers.push(...users);

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return allUsers;
};

const normalizeApplicationRecord = (authUser, profileMap) => {
  const profile = profileMap.get(authUser.id) || {};
  const applicationData = {
    ...(profile.application_data || {}),
    ...(authUser.user_metadata?.application_data || {}),
  };

  return {
    id: authUser.id,
    email: authUser.email,
    full_name:
      profile.full_name ||
      authUser.user_metadata?.full_name ||
      applicationData.name ||
      'Unnamed Applicant',
    avatar_url: profile.avatar_url || null,
    role: profile.role || authUser.user_metadata?.profile_type || null,
    created_at: profile.created_at || authUser.created_at,
    status:
      authUser.user_metadata?.account_status ||
      authUser.user_metadata?.status ||
      applicationData.account_status ||
      (Object.keys(applicationData).length ? 'pending' : 'approved'),
    rejection_reason:
      authUser.user_metadata?.rejection_reason ||
      applicationData.rejection_reason ||
      null,
    profile_type: authUser.user_metadata?.profile_type || applicationData.profile_type || null,
    location: applicationData.location || null,
    phone: applicationData.phone || authUser.user_metadata?.phone || null,
    tier: authUser.user_metadata?.tier || applicationData.selected_tier || null,
    application_data: applicationData,
  };
};

const getProfileApplicationStatus = (profile) =>
  profile?.application_data?.account_status ||
  profile?.application_data?.status ||
  'pending';

const normalizeProfileApplicationRecord = (profile) => {
  const applicationData = profile.application_data || {};

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || applicationData.name || 'Unnamed Applicant',
    avatar_url: profile.avatar_url || null,
    role: profile.role || null,
    created_at: profile.created_at,
    status: getProfileApplicationStatus(profile),
    rejection_reason:
      applicationData.rejection_reason ||
      applicationData.review?.rejection_reason ||
      null,
    profile_type: profile.profile_type || applicationData.profile_type || null,
    location: profile.location || applicationData.location || null,
    phone: profile.phone || applicationData.phone || null,
    tier: profile.tier || applicationData.selected_tier || null,
    application_data: applicationData,
  };
};

const listProfileApplications = async () => {
  if (!supabaseReadClient) {
    throw new Error(
      'Missing Supabase configuration. Set VITE_SUPABASE_URL plus VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  const { data, error } = await supabaseReadClient
    .from('profiles')
    .select(
      'id, email, full_name, avatar_url, role, created_at, phone, location, tier, profile_type, application_data'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((profile) => profile.role !== 'admin')
    .filter((profile) => profile.application_data || profile.profile_type || profile.tier)
    .map((profile) => normalizeProfileApplicationRecord(profile));
};

const getMembershipApplications = async () => {
  if (!supabaseAdmin) {
    return {
      applications: await listProfileApplications(),
      reviewActionsEnabled: false,
    };
  }

  const authUsers = await listAllAuthUsers();
  const authUserIds = authUsers.map((user) => user.id);

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select(
      'id, email, full_name, avatar_url, role, created_at, phone, location, tier, profile_type, application_data'
    )
    .in('id', authUserIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return {
    applications: authUsers
      .filter((authUser) => profileMap.get(authUser.id)?.role !== 'admin')
      .map((authUser) => normalizeApplicationRecord(authUser, profileMap))
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()),
    reviewActionsEnabled: true,
  };
};

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceAmount, email, metadata } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: metadata.planName || 'Premium Plan',
              description: `${metadata.selectedTier} - Summerland Estates`,
            },
            unit_amount: Math.round(parseFloat(priceAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: metadata,
      success_url: `${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post(
  '/api/application-upload',
  express.raw({ type: '*/*', limit: '20mb' }),
  async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Missing Supabase service role configuration',
      });
    }

    try {
      const fileName = sanitizeFileName(req.headers['x-file-name'] || 'upload');
      const contentType = req.headers['x-file-type'] || 'application/octet-stream';
      const profileType = sanitizeFileName(req.headers['x-profile-type'] || 'general');
      const fieldKey = sanitizeFileName(req.headers['x-field-key'] || 'file');

      if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: 'File body is required' });
      }

      const fileExt = fileName.includes('.') ? fileName.split('.').pop() : '';
      const baseName = sanitizeFileName(fileName.replace(/\.[^/.]+$/, '')) || 'upload';
      const uniqueName = fileExt
        ? `${baseName}-${crypto.randomUUID()}.${fileExt}`
        : `${baseName}-${crypto.randomUUID()}`;
      const filePath = `applications/${profileType}/${fieldKey}/${uniqueName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(APPLICATION_UPLOAD_BUCKET)
        .upload(filePath, req.body, {
          cacheControl: '3600',
          upsert: false,
          contentType,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(APPLICATION_UPLOAD_BUCKET).getPublicUrl(filePath);

      res.json({
        name: fileName,
        size: req.body.length,
        type: contentType,
        storagePath: filePath,
        publicUrl: publicUrl || null,
      });
    } catch (error) {
      console.error('Application upload error:', error);
      res.status(500).json({
        error: error.message || 'Failed to upload application file',
      });
    }
  }
);

app.get('/api/admin-membership-applications', async (_req, res) => {
  try {
    const result = await getMembershipApplications();
    res.json(result);
  } catch (error) {
    console.error('Membership applications error:', error);
    res.status(500).json({ error: error.message || 'Failed to load membership applications' });
  }
});

app.get('/api/admin-membership-applications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getMembershipApplications();
    const application = result.applications.find((entry) => entry.id === userId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      application,
      reviewActionsEnabled: result.reviewActionsEnabled,
    });
  } catch (error) {
    console.error('Membership application detail error:', error);
    res.status(500).json({ error: error.message || 'Failed to load membership application' });
  }
});

app.post('/api/admin-review-application', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const { userId, action, rejectionReason, reviewedBy } = req.body;

    if (!userId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid review payload' });
    }

    const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError || !authUserData?.user) {
      throw new Error(authUserError?.message || 'Auth user not found');
    }

    const authUser = authUserData.user;
    const existingUserMetadata = authUser.user_metadata || {};

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, tier, application_data')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message || 'Profile not found');
    }

    const accountStatus = action === 'approve' ? 'approved' : 'rejected';
    const selectedTier =
      profile?.tier ||
      existingUserMetadata?.tier ||
      profile?.application_data?.selected_tier ||
      existingUserMetadata?.application_data?.selected_tier ||
      null;
    const paymentStatus = action === 'approve'
      ? (isComplimentaryTier(selectedTier) ? 'not_required' : 'pending')
      : existingUserMetadata?.payment_status || 'pending';

    const { error: metadataUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingUserMetadata,
        account_status: accountStatus,
        payment_status: paymentStatus,
        rejection_reason: action === 'reject' ? rejectionReason || null : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy || null,
      },
    });

    if (metadataUpdateError) {
      throw metadataUpdateError;
    }

    await updateProfileIfColumnsExist(userId, {
      status: accountStatus,
      rejection_reason: action === 'reject' ? rejectionReason || null : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy || null,
    });

    await updateProfileApplicationData(userId, {
      account_status: accountStatus,
      payment_status: paymentStatus,
      rejection_reason: action === 'reject' ? rejectionReason || null : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy || null,
    });

    await sendEmail(
      profile?.email || authUser.email,
      action === 'approve'
        ? 'Your Summerland Estates account has been approved'
        : 'Update on your Summerland Estates registration',
      action === 'approve'
        ? approvalTemplate(profile?.full_name || existingUserMetadata.full_name, paymentStatus === 'pending')
        : rejectionTemplate(profile?.full_name || existingUserMetadata.full_name, rejectionReason)
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Admin review error:', error);
    res.status(500).json({ error: error.message || 'Failed to review application' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const [usersResult, pendingResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, status, created_at', { count: 'exact' }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]);

    const totalUsers = usersResult.count ?? 0;
    const pendingApprovals = pendingResult.count ?? 0;
    const activeUsers = (usersResult.data ?? []).filter(u => u.status === 'approved').length;

    res.json({
      totalUsers,
      activeUsers,
      pendingApprovals,
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: totalUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to load stats' });
  }
});

app.post('/api/admin-delete-user', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // First, delete related records from profiles table (if exists)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = table not found, ignore that
      console.log('Profile deletion note:', profileError.message);
    }

    // Delete user's auth account
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// ─── Upload article image (bypasses RLS via service role) ──────────────────
// Accepts: multipart/form-data with fields: file (binary), folder (string)
// Returns: { url: string }
app.post('/api/upload-article-image', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Storage service not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary found' });
    const boundary = boundaryMatch[1].trim();

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const CRLF = Buffer.from('\r\n');
    const boundaryBuf = Buffer.from('--' + boundary);

    let fileBuffer = null, mimeType = 'image/jpeg', fileName = 'upload.jpg', folder = 'content';

    let pos = 0;
    while (pos < body.length) {
      const bPos = body.indexOf(boundaryBuf, pos);
      if (bPos === -1) break;
      pos = bPos + boundaryBuf.length;
      // Check for end boundary
      if (body.slice(pos, pos + 2).equals(Buffer.from('--'))) break;
      // Skip CRLF after boundary
      if (body.slice(pos, pos + 2).equals(CRLF)) pos += 2;

      // Find header/body separator
      const sep = body.indexOf(Buffer.from('\r\n\r\n'), pos);
      if (sep === -1) break;
      const header = body.slice(pos, sep).toString();
      pos = sep + 4;

      // Find next boundary to get end of part data
      const nextBoundary = body.indexOf(boundaryBuf, pos);
      const partEnd = nextBoundary === -1 ? body.length : nextBoundary - 2; // -2 strips trailing \r\n
      const content = body.slice(pos, partEnd);
      pos = nextBoundary === -1 ? body.length : nextBoundary;

      if (header.includes('name="folder"')) {
        folder = content.toString().trim();
      } else if (header.includes('name="file"')) {
        const ctMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
        if (ctMatch) mimeType = ctMatch[1].trim();
        const fnMatch = header.match(/filename="([^"]+)"/);
        if (fnMatch) fileName = fnMatch[1];
        fileBuffer = content;
      }
    }

    if (!fileBuffer) return res.status(400).json({ error: 'No file found in request' });

    const allowed = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/svg+xml'];
    if (!allowed.includes(mimeType)) return res.status(400).json({ error: 'Invalid image type' });

    const ext = fileName.split('.').pop() || 'jpg';
    const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('article-images')
      .upload(safeName, fileBuffer, { contentType: mimeType, upsert: false });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from('article-images').getPublicUrl(safeName);
    res.json({ url: data.publicUrl });
  } catch (error) {
    console.error('Article image upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// ─── Google Places API Proxy (avoids CORS from frontend) ───────────────────
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyAtJTuqP_MisCAr5buaRgieC5rzed_DAew';

app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) return res.status(400).json({ error: 'Input required' });
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_PLACES_API_KEY}&types=(cities)`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Places autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

app.get('/api/places/details', async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ error: 'placeId required' });
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&fields=address_components,formatted_address,name,geometry`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

app.get('/api/places/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'Address required' });
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

app.get('/api/places/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

// ─── Send registration notification emails ─────────────────────────────────
// Sends welcome email to user + notification to admin
app.post('/api/send-registration-emails', async (req, res) => {
  try {
    const { name, email, profileType, tier, phone } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.APP_FROM_EMAIL;

    // Send welcome email to user
    try {
      await sendEmail(
        email,
        'Thank You for Registering - Summerland Estates',
        registrationPendingTemplate(name)
      );
      console.log(`✅ Registration welcome email sent to ${email}`);
    } catch (err) {
      console.error('Failed to send user welcome email:', err.message);
    }

    // Send notification to admin
    if (adminEmail) {
      try {
        await sendEmail(
          adminEmail,
          'New Registration - Summerland Estates',
          adminNewRegistrationTemplate({ name, email, profileType, tier, phone })
        );
        console.log(`✅ Admin notification sent to ${adminEmail}`);
      } catch (err) {
        console.error('Failed to send admin notification:', err.message);
      }
    }

    res.json({ success: true, message: 'Registration emails sent' });
  } catch (error) {
    console.error('Registration email error:', error);
    res.status(500).json({ error: error.message || 'Failed to send emails' });
  }
});

// ─── Newsletter Signup ────────────────────────────────────────────────────
app.post('/api/newsletter-signup', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Store in Supabase newsletter_subscribers table
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email, subscribed_at: new Date().toISOString(), active: true }, { onConflict: 'email' });

    if (error) throw error;

    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to the Summerland Estates Newsletter',
        `<div style="font-family:Georgia,serif;background:#f8f4ee;padding:32px;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8dfd4;border-radius:24px;padding:40px;">
            <p style="text-transform:uppercase;letter-spacing:0.18em;font-size:12px;color:#8A8279;margin:0 0 20px;">Summerland Estates</p>
            <h1 style="font-size:26px;color:#1f1f1f;margin:0 0 16px;">You're subscribed!</h1>
            <p style="font-size:16px;line-height:1.7;color:#4b4b4b;">Thank you for joining our newsletter. You'll receive the latest news, placement opportunities, and member updates directly in your inbox.</p>
            <hr style="border:none;border-top:1px solid #e8dfd4;margin:28px 0;">
            <p style="font-size:12px;color:#8A8279;">Summerland Estates • Connecting Estate Professionals</p>
          </div>
        </div>`
      );
    } catch (emailErr) {
      console.error('Newsletter welcome email failed:', emailErr.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    res.status(500).json({ error: error.message || 'Failed to subscribe' });
  }
});

// ─── Track Profile View ───────────────────────────────────────────────────
app.post('/api/track-profile-view', async (req, res) => {
  try {
    const { profileId, viewerId, viewerName, viewerEmail } = req.body;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID required' });
    }

    // Don't track if user views their own profile
    if (viewerId === profileId) {
      return res.json({ success: true, message: 'Self view not tracked' });
    }

    // Get profile owner details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, user_metadata')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const ownerEmail = profile.email;
    const ownerName = profile.full_name || profile.user_metadata?.full_name || 'Member';
    
    // Check if this viewer has already been counted in last 24 hours
    const viewKey = `view_${profileId}_${viewerId || viewerEmail || 'anonymous'}`;
    const lastView = await supabaseAdmin
      .from('profile_views')
      .select('created_at')
      .eq('profile_id', profileId)
      .eq('viewer_id', viewerId || viewerEmail || 'anonymous')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date();
    const shouldCountView = !lastView.data || 
      (now.getTime() - new Date(lastView.data.created_at).getTime() > 24 * 60 * 60 * 1000);

    if (shouldCountView) {
      // Record the view
      await supabaseAdmin.from('profile_views').insert({
        profile_id: profileId,
        viewer_id: viewerId || viewerEmail || 'anonymous',
        viewer_name: viewerName || 'Anonymous',
        viewer_email: viewerEmail || null,
        created_at: now.toISOString()
      });

      // Send email notification to profile owner
      const viewerDisplayName = viewerName || viewerEmail || 'Someone';
      try {
        await sendEmail(
          ownerEmail,
          `${viewerDisplayName} viewed your profile - Summerland Estates`,
          profileViewTemplate(ownerName, viewerDisplayName, now.toLocaleString())
        );
        console.log(`✅ Profile view email sent to ${ownerEmail}`);
      } catch (err) {
        console.error('Failed to send profile view email:', err.message);
      }
    }

    res.json({ success: true, viewRecorded: shouldCountView });
  } catch (error) {
    console.error('Track profile view error:', error);
    res.status(500).json({ error: error.message || 'Failed to track view' });
  }
});

// ─── Get Profile Analytics ────────────────────────────────────────────────
app.get('/api/profile-analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get total views
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('profile_views')
      .select('created_at')
      .eq('profile_id', userId);

    if (viewsError) throw viewsError;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalViews = views?.length || 0;
    const weeklyViews = views?.filter(v => new Date(v.created_at) > oneWeekAgo).length || 0;
    const monthlyViews = views?.filter(v => new Date(v.created_at) > oneMonthAgo).length || 0;

    // Get unique viewers count
    const uniqueViewers = new Set(views?.map(v => v.viewer_id) || []).size;

    res.json({
      profileViews: totalViews,
      weeklyViews,
      monthlyViews,
      uniqueViewers,
      lastUpdated: now.toISOString()
    });
  } catch (error) {
    console.error('Profile analytics error:', error);
    res.status(500).json({ error: error.message || 'Failed to get analytics' });
  }
});

// Profile view email template
const profileViewTemplate = (ownerName, viewerName, time) => `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">Someone viewed your profile</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">Hi ${ownerName || 'there'},</p>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;"><strong>${viewerName}</strong> viewed your profile on ${time}.</p>
      <p style="font-size:14px; line-height:1.6; color:#666; margin:0 0 24px;">This is a great opportunity to connect! Consider updating your profile to make it even more impressive.</p>
      <a href="${APP_URL}/my-profile" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">View Your Profile</a>
      <hr style="border:none; border-top:1px solid #e8dfd4; margin:32px 0;">
      <p style="font-size:12px; color:#8A8279; margin:0;">Summerland Estates • Connecting Estate Professionals</p>
    </div>
  </div>
`;

// ─── Dynamic Sitemap Generator ──────────────────────────────────────────
// Generates sitemap.xml with all static pages + dynamic articles
app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://summerlandestates.com';
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/search', priority: '0.9', changefreq: 'daily' },
      { url: '/collective', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/faqs', priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.6', changefreq: 'monthly' },
      { url: '/terms', priority: '0.6', changefreq: 'monthly' },
      { url: '/signup', priority: '0.8', changefreq: 'monthly' },
      { url: '/login', priority: '0.8', changefreq: 'monthly' },
      { url: '/advertisements', priority: '0.8', changefreq: 'weekly' },
      { url: '/open-roles', priority: '0.8', changefreq: 'daily' },
      { url: '/service-requests', priority: '0.8', changefreq: 'daily' },
      { url: '/events', priority: '0.7', changefreq: 'weekly' },
      { url: '/news', priority: '0.7', changefreq: 'weekly' },
      { url: '/recognition', priority: '0.6', changefreq: 'monthly' },
      { url: '/add-listing', priority: '0.8', changefreq: 'monthly' },
    ];

    // Fetch all published articles from Supabase
    let articles = [];
    if (supabaseReadClient) {
      const { data, error } = await supabaseReadClient
        .from('articles')
        .select('slug, updated_at, created_at, published_at')
        .eq('status', 'published');
      
      if (!error && data) {
        articles = data;
      }
    }

    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add article pages
    articles.forEach(article => {
      const lastmod = (article.updated_at || article.published_at || article.created_at || today).split('T')[0];
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/articles/${article.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// ─── Send Email Endpoint (Generic) ──────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    await sendEmail(to, subject, html);
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});

// ─── Email Blast Payment Endpoint ──────────────────────────────────────────
app.post('/api/create-email-blast-payment', async (req, res) => {
  try {
    const { submissionId, amount } = req.body;
    
    if (!submissionId || !amount) {
      return res.status(400).json({ error: 'Missing required fields: submissionId, amount' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        submissionId: submissionId,
        type: 'email_blast'
      }
    });

    // Update the submission with the payment intent ID
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('email_blast_submissions')
        .update({ 
          stripe_payment_intent_id: paymentIntent.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    }

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Email blast payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
});

// ─── Email Notification Endpoints ─────────────────────────────────────────

// Event Registration Notification
app.post('/api/notify-event-registration', async (req, res) => {
  try {
    const { userEmail, userName, eventTitle, eventDate, eventLocation } = req.body;
    
    if (!userEmail || !eventTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation to user
    await sendEmail(
      userEmail,
      `You're registered for ${eventTitle}`,
      eventRegistrationTemplate(userName, eventTitle, eventDate, eventLocation)
    );
    
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Event notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

// Admin Event Registration Notification
app.post('/api/notify-admin-event-registration', async (req, res) => {
  try {
    const { userData, eventData } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!userData || !eventData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendEmail(
      adminEmail,
      `New Event Registration: ${eventData.title}`,
      adminNewEventRegistrationTemplate(userData, eventData)
    );
    
    res.json({ success: true, message: 'Admin notified' });
  } catch (error) {
    console.error('Admin notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to notify admin' });
  }
});

// Sponsorship Inquiry Notification
app.post('/api/notify-sponsorship-inquiry', async (req, res) => {
  try {
    const { userEmail, userName, companyName, sponsorshipType } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!userEmail || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation to user
    await sendEmail(
      userEmail,
      'Sponsorship Inquiry Received',
      sponsorshipInquiryTemplate(userName, companyName, sponsorshipType)
    );
    
    res.json({ success: true, message: 'User notified' });
  } catch (error) {
    console.error('Sponsorship notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

// Admin Sponsorship Notification
app.post('/api/notify-admin-sponsorship', async (req, res) => {
  try {
    const { sponsorshipData } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!sponsorshipData) {
      return res.status(400).json({ error: 'Missing sponsorship data' });
    }

    await sendEmail(
      adminEmail,
      `New Sponsorship Inquiry: ${sponsorshipData.company_name}`,
      adminNewSponsorshipTemplate(sponsorshipData)
    );
    
    res.json({ success: true, message: 'Admin notified' });
  } catch (error) {
    console.error('Admin sponsorship notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to notify admin' });
  }
});

// Email Blast Confirmation
app.post('/api/notify-email-blast', async (req, res) => {
  try {
    const { userEmail, userName, subject, recipientsCount } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!userEmail || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation to user
    await sendEmail(
      userEmail,
      'Email Blast Submitted for Review',
      emailBlastConfirmationTemplate(userName, subject, recipientsCount)
    );
    
    res.json({ success: true, message: 'User notified' });
  } catch (error) {
    console.error('Email blast notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

// Admin Email Blast Notification
app.post('/api/notify-admin-email-blast', async (req, res) => {
  try {
    const { emailData } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!emailData) {
      return res.status(400).json({ error: 'Missing email data' });
    }

    await sendEmail(
      adminEmail,
      `New Email Blast: ${emailData.subject}`,
      adminNewEmailBlastTemplate(emailData)
    );
    
    res.json({ success: true, message: 'Admin notified' });
  } catch (error) {
    console.error('Admin email blast notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to notify admin' });
  }
});

// Recognition Submission Notification
app.post('/api/notify-recognition', async (req, res) => {
  try {
    const { userEmail, userName, nomineeName, category } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!userEmail || !nomineeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation to user
    await sendEmail(
      userEmail,
      'Recognition Submission Received',
      recognitionSubmissionTemplate(userName, nomineeName, category)
    );
    
    res.json({ success: true, message: 'User notified' });
  } catch (error) {
    console.error('Recognition notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

// Admin Recognition Notification
app.post('/api/notify-admin-recognition', async (req, res) => {
  try {
    const { recognitionData } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@summerlandestates.com';
    
    if (!recognitionData) {
      return res.status(400).json({ error: 'Missing recognition data' });
    }

    await sendEmail(
      adminEmail,
      `New Recognition: ${recognitionData.nominee_name}`,
      adminNewRecognitionTemplate(recognitionData)
    );
    
    res.json({ success: true, message: 'Admin notified' });
  } catch (error) {
    console.error('Admin recognition notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to notify admin' });
  }
});

// Admin Status Update Notification
app.post('/api/notify-status-update', async (req, res) => {
  try {
    const { userEmail, userName, itemType, itemName, status, adminNotes } = req.body;
    
    if (!userEmail || !itemType || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendEmail(
      userEmail,
      `Update on your ${itemType}`,
      statusUpdateTemplate(userName, itemType, itemName, status, adminNotes)
    );
    
    res.json({ success: true, message: 'Status update notification sent' });
  } catch (error) {
    console.error('Status update notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
