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
  // Stripe webhooks and raw file uploads need the unparsed body
  if (req.path === '/api/upload-article-image') return next();
  if (req.path === '/api/stripe-webhook') return next();
  express.json()(req, res, next);
});

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY not found in .env file');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
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
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">${name || 'Hello'}, your registration has been approved. You can now sign in and access your account.</p>
      <a href="${APP_URL}/login" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Sign in</a>
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
    honorary_until: profile.honorary_until || null,
    honorary_tier: profile.honorary_tier || null,
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
    honorary_until: profile.honorary_until || null,
    honorary_tier: profile.honorary_tier || null,
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
      'id, email, full_name, avatar_url, role, created_at, phone, location, tier, profile_type, honorary_until, honorary_tier, application_data'
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
      'id, email, full_name, avatar_url, role, created_at, phone, location, tier, profile_type, honorary_until, honorary_tier, application_data'
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

// Keep in sync with src/data/pricing.ts — prevents client-side amount tampering.
const PLAN_PRICES = {
  'professional-pro': 0.99,
  'business-pro': 6.99,
  'business-enterprise': 9.99,
  'agency-basic': 7.99,
  'agency-hiring': 10.99,
  'agency-pro': 14.99,
  'estates-basic': 7.99,
  'estates-hiring': 10.99,
  'estates-pro': 14.99,
};

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceAmount, email, metadata } = req.body;

    const parsedAmount = parseFloat(String(priceAmount).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid checkout amount' });
    }

    const expected = PLAN_PRICES[metadata?.selectedTier];
    if (expected !== undefined && Math.abs(parsedAmount - expected) > 0.001) {
      return res.status(400).json({ error: 'Checkout amount does not match the selected plan' });
    }

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
            unit_amount: Math.round(parsedAmount * 100),
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

// Stripe webhook — keeps profile tier/payment status in sync with Stripe events.
// Requires STRIPE_WEBHOOK_SECRET in .env (Stripe Dashboard → Developers → Webhooks).
// Register events: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted, invoice.payment_failed
app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        webhookSecret
      );
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const email = session.customer_email || session.metadata?.email;
          const tier = session.metadata?.selectedTier;
          if (supabaseAdmin && email) {
            const update = { payment_status: 'paid' };
            if (tier) update.tier = tier;
            const { error } = await supabaseAdmin
              .from('profiles')
              .update(update)
              .eq('email', email);
            if (error) console.error('Webhook profile update failed:', error);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          if (supabaseAdmin && subscription.metadata?.email) {
            await supabaseAdmin
              .from('profiles')
              .update({ payment_status: 'cancelled' })
              .eq('email', subscription.metadata.email);
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          if (supabaseAdmin && invoice.customer_email) {
            await supabaseAdmin
              .from('profiles')
              .update({ payment_status: 'failed' })
              .eq('email', invoice.customer_email);
          }
          break;
        }
        default:
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook handler error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

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

    let emailSent = false;
    let emailError = null;
    try {
      await sendEmail(
        profile?.email || authUser.email,
        action === 'approve'
          ? 'Your Summerland Estates account has been approved'
          : 'Update on your Summerland Estates registration',
        action === 'approve'
          ? approvalTemplate(profile?.full_name || existingUserMetadata.full_name, paymentStatus === 'pending')
          : rejectionTemplate(profile?.full_name || existingUserMetadata.full_name, rejectionReason)
      );
      emailSent = true;
    } catch (sendError) {
      emailError = sendError.message || 'Email delivery failed';
      console.error(`Review ${action} email failed for ${profile?.email || authUser.email}:`, sendError);
    }

    res.json({ success: true, emailSent, emailError });
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

// Shared helper: verifies the caller's bearer token belongs to an admin profile.
async function requireAdmin(req, res) {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Missing Supabase service role configuration' });
    return null;
  }
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Invalid session' });
    return null;
  }
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
}

app.post('/api/admin-reset-password', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (profileError) throw profileError;
    if (!profiles?.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      profiles[0].id,
      { password: newPassword }
    );
    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
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

const honoraryProTierByUserType = {
  professional: 'professional-pro',
  business: 'business-pro',
  agency: 'agency-pro',
  estates: 'estates-pro',
};

app.post('/api/admin-grant-honorary', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('profile_type, tier, application_data')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let proTier = honoraryProTierByUserType[profile.profile_type];

    if (!proTier && String(profile.tier || '').endsWith('-pro')) {
      proTier = profile.tier;
    }

    if (!proTier) {
      return res.status(400).json({
        error: `Could not determine Pro tier for profile type: ${profile.profile_type || 'unknown'}`,
      });
    }

    const honoraryUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const applicationData = profile.application_data || {};

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        tier: proTier,
        honorary_until: honoraryUntil,
        honorary_tier: proTier,
        status: 'approved',
        payment_status: 'not_required',
        subscription_status: 'active',
        application_data: {
          ...applicationData,
          honorary_until: honoraryUntil,
          honorary_tier: proTier,
          payment_status: 'not_required',
          account_status: 'approved',
        },
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true, tier: proTier, honorary_until: honoraryUntil });
  } catch (error) {
    console.error('Grant honorary error:', error);
    res.status(500).json({ error: error.message || 'Failed to grant honorary membership' });
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
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyC-WnvF1ZW6s2TMnWQomlGvUbKgEc5MQgs';

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

// ─── Email Verification Code ──────────────────────────────────────────────
const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;

const findProfileForVerification = async ({ userId, email }) => {
  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, application_data');
  if (userId) {
    query = query.eq('id', userId);
  } else {
    query = query.eq('email', String(email).trim().toLowerCase());
  }
  const { data, error } = await query.maybeSingle();

  if (!error && data) {
    return { data, error: null };
  }

  // Fallback: the profiles row may not exist yet (e.g. plain /signup flow).
  // Resolve the auth user by email and create a minimal profile row.
  if (email) {
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const authUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === String(email).trim().toLowerCase()
      );
      if (authUser) {
        const { data: upserted } = await supabaseAdmin
          .from('profiles')
          .upsert(
            {
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || null,
              application_data: {},
            },
            { onConflict: 'id' }
          )
          .select('id, email, full_name, application_data')
          .single();
        if (upserted) {
          return { data: upserted, error: null };
        }
      }
    } catch (lookupError) {
      console.warn('Auth user lookup fallback failed:', lookupError.message);
    }
  }

  return { data, error };
};

app.post('/api/send-verification-code', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const { userId, email } = req.body;
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email is required' });
    }

    const { data: profile, error: profileError } = await findProfileForVerification({ userId, email });

    if (profileError || !profile?.email) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS).toISOString();

    await updateProfileApplicationData(profile.id, {
      email_verification_code: code,
      email_verification_expires: expiresAt,
    });

    await sendEmail(
      profile.email,
      'Verify Your Email - Summerland Estates',
      `<div style="font-family:Georgia,serif;background:#f8f4ee;padding:32px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8dfd4;border-radius:24px;padding:40px;">
          <p style="text-transform:uppercase;letter-spacing:0.18em;font-size:12px;color:#8A8279;margin:0 0 20px;">Summerland Estates</p>
          <h1 style="font-size:26px;color:#1f1f1f;margin:0 0 16px;">Verify your email address</h1>
          <p style="font-size:16px;line-height:1.7;color:#4b4b4b;margin:0 0 24px;">
            ${profile.full_name || 'Hello'}, enter this code in your profile to verify your email address:
          </p>
          <div style="background:#f8f4ee;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <span style="font-size:36px;letter-spacing:0.35em;font-weight:700;color:#1f1f1f;">${code}</span>
          </div>
          <p style="font-size:13px;color:#8A8279;">This code expires in 15 minutes. If you didn't request it, you can ignore this email.</p>
        </div>
      </div>`
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification email' });
  }
});

app.post('/api/verify-email-code', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const { userId, email, code } = req.body;
    if ((!userId && !email) || !code) {
      return res.status(400).json({ error: 'userId or email, and code are required' });
    }

    const { data: profile, error: profileError } = await findProfileForVerification({ userId, email });

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const storedCode = profile.application_data?.email_verification_code;
    const expires = profile.application_data?.email_verification_expires;

    if (!storedCode || !expires || new Date(expires) < new Date()) {
      return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
    }

    if (String(code).trim() !== String(storedCode)) {
      return res.status(400).json({ error: 'Incorrect verification code' });
    }

    await supabaseAdmin
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', profile.id);

    try {
      await supabaseAdmin.auth.admin.updateUserById(profile.id, { email_confirm: true });
    } catch (confirmError) {
      console.warn('Could not confirm auth email:', confirmError.message);
    }

    await updateProfileApplicationData(profile.id, {
      email_verification_code: null,
      email_verification_expires: null,
      email_verified_at: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Verify email code error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify email' });
  }
});

// ─── Sync Application Profile ─────────────────────────────────────────────
// Called right after supabase.auth.signUp() during membership application.
// The client often has no session yet (email confirmation pending), so RLS
// silently blocks the client-side profiles write — do it with the service key.
app.post('/api/sync-application-profile', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase admin client not configured' });
  }

  try {
    const {
      userId,
      email,
      fullName,
      role,
      phone,
      location,
      profileType,
      tier,
      applicationData,
      subscriptionStatus,
      subscriptionExpiresAt,
    } = req.body || {};

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const payload = {
      id: userId,
      email,
      full_name: fullName || null,
      role: role || null,
      phone: phone || null,
      location: location || null,
      profile_type: profileType || null,
      tier: tier || null,
      application_data: applicationData || {},
    };
    if (subscriptionStatus) payload.subscription_status = subscriptionStatus;
    if (subscriptionExpiresAt) payload.subscription_expires_at = subscriptionExpiresAt;

    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Sync application profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync profile' });
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
      .select('email, full_name, tier, notification_preferences')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const ownerEmail = profile.email;
    const ownerName = profile.full_name || 'Member';
    const ownerTier = profile.tier || 'professional-basic';
    const tierLimits = getTierLimitsForProfile(ownerTier);

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

      // Send email notification to profile owner if paid and opted in
      if (tierLimits?.canReceiveNotifications) {
        const notificationPreferences = profile.notification_preferences || {};
        if (notificationPreferences.profileViewed?.email !== false) {
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

// ─── Sitemap ────────────────────────────────────────────────────────────────
// Legacy alias — the comprehensive sitemap lives at /sitemap.xml below.
app.get('/api/sitemap.xml', (req, res) => res.redirect(301, '/sitemap.xml'));


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

// Nominee approval request — the featured employee must approve before publishing
app.post('/api/notify-recognition-nominee', async (req, res) => {
  try {
    const { nomineeEmail, nomineeName, submitterName, category } = req.body;

    if (!nomineeEmail || !nomineeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const categoryLabel = String(category || 'recognition').replace(/_/g, ' ');
    await sendEmail(
      nomineeEmail,
      'You have been nominated on Summerland Estates',
      `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background:#FBF8F4; padding: 32px; border-radius: 16px;">
        <p style="letter-spacing: 3px; color:#8A8279; font-size: 12px; margin:0 0 16px;">SUMMERLAND ESTATES</p>
        <h1 style="font-size: 28px; color:#23231f; margin:0 0 16px;">You've been nominated</h1>
        <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 16px;">
          ${nomineeName}, ${submitterName || 'a Summerland Estates member'} has nominated you for
          <strong>${categoryLabel}</strong>. Before this recognition can be featured on the site,
          we need your sign-off.
        </p>
        <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">
          Sign in to your dashboard and open the Recognition section to approve or decline this feature.
        </p>
        <a href="${APP_URL}/login" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px;">Sign in to review</a>
      </div>`
    );

    res.json({ success: true, message: 'Nominee notified' });
  } catch (error) {
    console.error('Nominee notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to notify nominee' });
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

// Sends SMS via Twilio when TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and
// TWILIO_PHONE_NUMBER are configured. Returns false when not configured.
const sendSms = async (to, message) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return false;

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: message }),
    });
    if (!response.ok) {
      console.error('Twilio SMS failed:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error.message);
    return false;
  }
};

// ─── Notification delivery (shared by /api/send-notification and
//     /api/notify-job-matches) — direct function call, works on serverless
//     where a self-HTTP call to localhost would fail. ────────────────────────
const deliverNotification = async ({ userId, type, title, body, link }) => {
  // Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, phone, tier, notification_preferences')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return { sent: false, reason: 'user-not-found' };

  const tierLimits = getTierLimitsForProfile(profile.tier);

  const defaultPreferences = {
    newJobPostings: { email: false, sms: false },
    newServiceRequests: { email: false, sms: false },
    newEvents: { email: false, sms: false },
    messageReceived: { email: true, sms: false },
    profileViewed: { email: false, sms: false },
    forumTopics: { email: false, sms: false }
  };

  const preferences = {
    ...defaultPreferences,
    ...(profile.notification_preferences || {})
  };

  const typeMap = {
    'new-job': 'newJobPostings',
    'new-service-request': 'newServiceRequests',
    'new-event': 'newEvents',
    'message': 'messageReceived',
    'profile-view': 'profileViewed',
    'forum-update': 'forumTopics'
  };

  const category = typeMap[type] || 'messageReceived';
  const canNotify = !!tierLimits?.canReceiveNotifications;
  const shouldEmail = canNotify && preferences[category]?.email;
  const shouldSms = canNotify && preferences[category]?.sms && !!profile.phone;

  // Store in-app notification
  const { data: notification, error: insertError } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message: body,
      link,
      is_read: false,
      email_sent: false,
      sms_sent: false
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert notification:', insertError);
  }

  // Send email
  if (shouldEmail && profile.email) {
    const html = notificationEmailTemplate(title, body, link);
    await sendEmail(profile.email, title, html);
    if (notification) {
      await supabaseAdmin.from('notifications').update({ email_sent: true }).eq('id', notification.id);
    }
  }

  // SMS via Twilio when configured
  if (shouldSms && profile.phone) {
    const smsSent = await sendSms(profile.phone, `${title}: ${body}`);
    if (!smsSent) {
      console.log('SMS not sent (Twilio not configured) to', profile.phone);
    }
    if (notification && smsSent) {
      await supabaseAdmin.from('notifications').update({ sms_sent: true }).eq('id', notification.id);
    }
  }

  return { sent: !!(shouldEmail || shouldSms) || !!notification };
};

// ─── Generic User Notification Endpoint ────────────────────────────────────
// Sends email/SMS notifications to paid users based on their preferences
app.post('/api/send-notification', async (req, res) => {
  try {
    const { userId, type, title, body, link } = req.body;

    if (!userId || !type || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields: userId, type, title, body' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Supabase admin client not configured' });
    }

    const result = await deliverNotification({ userId, type, title, body, link });
    if (result.reason === 'user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, sent: result.sent });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

function getTierLimitsForProfile(tier) {
  const tiers = {
    'professional-basic': { canReceiveNotifications: false },
    'professional-free': { canReceiveNotifications: false },
    'professional-pro': { canReceiveNotifications: true },
    'business-free': { canReceiveNotifications: false },
    'business-pro': { canReceiveNotifications: true },
    'business-enterprise': { canReceiveNotifications: true },
    'business-multi': { canReceiveNotifications: true },
    'agency-free': { canReceiveNotifications: false },
    'agency-basic': { canReceiveNotifications: true },
    'agency-hiring': { canReceiveNotifications: true },
    'agency-pro': { canReceiveNotifications: true },
    'estates-free': { canReceiveNotifications: false },
    'estates-basic': { canReceiveNotifications: true },
    'estates-hiring': { canReceiveNotifications: true },
    'estates-pro': { canReceiveNotifications: true }
  };
  return tiers[tier] || { canReceiveNotifications: false };
}

function notificationEmailTemplate(title, body, link) {
  const linkHtml = link ? `<a href="${link}" style="display:inline-block; background:#A89F91; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:12px; margin-top:16px;">View in App</a>` : '';
  return `
  <div style="font-family: Georgia, serif; background:#f8f4ee; padding:32px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e8dfd4; border-radius:24px; padding:40px;">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; color:#8A8279; margin:0 0 20px;">Summerland Estates</p>
      <h1 style="font-size:28px; line-height:1.2; color:#1f1f1f; margin:0 0 16px;">${title}</h1>
      <p style="font-size:16px; line-height:1.7; color:#4b4b4b; margin:0 0 24px;">${body}</p>
      ${linkHtml}
    </div>
  </div>
  `;
}

// ─── Notify Matching Users of New Job ─────────────────────────────────────
// Finds paid users whose profile matches the job and sends notifications
// ─── Radius-based geocoding helpers ────────────────────────────────────────
const geocodeCache = new Map();

const geocodeLocation = async (address) => {
  if (!address) return null;
  const key = address.trim().toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const loc = data?.results?.[0]?.geometry?.location || null;
    geocodeCache.set(key, loc);
    return loc;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
};

const haversineMiles = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

app.post('/api/notify-job-matches', async (req, res) => {
  try {
    const {
      jobId,
      serviceId,
      eventId,
      itemType = 'job',
      jobTitle,
      jobDescription,
      jobCategory,
      location,
      radiusMiles = 50,
    } = req.body;

    const itemId = jobId || serviceId || eventId;

    if (!itemId || !jobTitle) {
      return res.status(400).json({ error: 'Missing required fields: jobId/serviceId, jobTitle' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Supabase admin client not configured' });
    }

    const jobText = `${jobTitle} ${jobCategory || ''} ${jobDescription || ''} ${location || ''}`.toLowerCase();
    const jobKeywords = jobText.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, phone, location, bio, role, tier, notification_preferences')
      .neq('id', req.body.userId || '');

    if (error) throw error;

    // Geocode the posted location once; profile locations are geocoded lazily.
    const jobCoords = location ? await geocodeLocation(location) : null;

    const sent = [];
    for (const p of (profiles || [])) {
      const resumeText = `${p.bio || ''} ${p.role || ''} ${p.location || ''}`.toLowerCase();
      const keywordMatch = jobKeywords.some(k => resumeText.includes(k)) ||
        (p.location && location && location.toLowerCase().includes(p.location.toLowerCase()));

      // Radius check: if the job location geocoded, only notify profiles
      // within the radius (or whose location text matches directly).
      let withinRadius = false;
      if (jobCoords && p.location) {
        if (location && p.location.toLowerCase().includes(location.toLowerCase().split(',')[0])) {
          withinRadius = true;
        } else {
          const profileCoords = await geocodeLocation(p.location);
          if (profileCoords && haversineMiles(jobCoords, profileCoords) <= radiusMiles) {
            withinRadius = true;
          }
        }
      } else if (!jobCoords) {
        // Geocoding unavailable — fall back to keyword/text matching only
        withinRadius = false;
      }

      // Notify every user within the radius. When geocoding is unavailable
      // (no Google Maps key), fall back to keyword/location text matching.
      const matches = jobCoords ? (withinRadius || keywordMatch) : keywordMatch;

      if (matches) {
        const isService = itemType === 'service';
        const isEvent = itemType === 'event';
        try {
          const result = await deliverNotification({
            userId: p.id,
            type: isEvent ? 'new-event' : isService ? 'new-service-request' : 'new-job',
            title: isEvent
              ? `New event near you: ${jobTitle}`
              : isService
                ? `New service request near you: ${jobTitle}`
                : `New job matches your resume: ${jobTitle}`,
            body: isEvent
              ? `A new event (${jobTitle}) in ${location || 'your area'} was just announced${jobCoords ? ` — within ${radiusMiles} miles of you` : ''}.`
              : isService
                ? `A new service request (${jobTitle}) in ${location || 'your area'} was posted${jobCoords ? ` within ${radiusMiles} miles of you` : ''}.`
                : `A new ${jobTitle} position in ${location || 'your area'} looks like a great fit for your profile.`,
            link: `${APP_URL}/${isEvent ? 'event' : isService ? 'service-request' : 'job'}/${itemId}`
          });
          if (result.sent) sent.push(p.id);
        } catch (notifErr) {
          console.error(`Notification to ${p.id} failed:`, notifErr.message);
        }
      }
    }

    res.json({ success: true, matchedUsers: sent.length, sentTo: sent, radiusMiles, geocoded: !!jobCoords });
  } catch (error) {
    console.error('Notify job matches error:', error);
    res.status(500).json({ error: error.message || 'Failed to notify matches' });
  }
});

const SITEMAP_BASE_URL = 'https://summerlandestates.com';
const sitemapStaticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/search', priority: '0.9', changefreq: 'daily' },
  { path: '/add-listing', priority: '0.8', changefreq: 'monthly' },
  { path: '/open-roles', priority: '0.8', changefreq: 'daily' },
  { path: '/service-requests', priority: '0.8', changefreq: 'daily' },
  { path: '/advertisements', priority: '0.8', changefreq: 'weekly' },
  { path: '/collective', priority: '0.8', changefreq: 'weekly' },
  { path: '/events', priority: '0.7', changefreq: 'weekly' },
  { path: '/news', priority: '0.7', changefreq: 'weekly' },
  { path: '/services', priority: '0.8', changefreq: 'weekly' },
  { path: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/faqs', priority: '0.7', changefreq: 'monthly' },
  { path: '/recognition', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.6', changefreq: 'monthly' },
  { path: '/sponsorship', priority: '0.6', changefreq: 'monthly' },
  { path: '/post-job', priority: '0.6', changefreq: 'monthly' },
];

function formatSitemapDate(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toISOString().split('T')[0];
}

function buildSitemapUrlNode(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function generateSitemapXml() {
  let profileUrls = [];
  let contentPageUrls = [];
  let jobUrls = [];
  let eventUrls = [];
  let serviceRequestUrls = [];
  let articleUrls = [];

  if (supabaseReadClient) {
    const { data, error } = await supabaseReadClient
      .from('listings')
      .select('slug, updated_at')
      .eq('approved', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Could not fetch listings for sitemap:', error.message);
    } else if (data?.length) {
      profileUrls = data.map((listing) => ({
        path: `/profile/${listing.slug || listing.id}`,
        lastmod: listing.updated_at,
        changefreq: 'weekly',
        priority: '0.6',
      }));
    }

    const { data: contentPages, error: contentError } = await supabaseReadClient
      .from('site_content_pages')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (contentError) {
      if (contentError.code !== '42P01') {
        console.error('Could not fetch content pages for sitemap:', contentError.message);
      }
    } else if (contentPages?.length) {
      contentPageUrls = contentPages
        .filter((page) => page.slug && page.slug !== 'privacy' && page.slug !== 'terms')
        .map((page) => ({
          path: `/pages/${page.slug}`,
          lastmod: page.updated_at,
          changefreq: 'monthly',
          priority: '0.5',
        }));
    }

    const dynamicSources = [
      {
        table: 'job_postings',
        select: 'id, updated_at',
        filter: (q) => q.eq('status', 'active'),
        toUrl: (row) => `/job/${row.id}`,
        changefreq: 'daily',
        priority: '0.7',
      },
      {
        table: 'events',
        select: 'id, updated_at',
        filter: (q) => q.in('status', ['approved', 'published']),
        toUrl: (row) => `/event/${row.id}`,
        changefreq: 'weekly',
        priority: '0.6',
      },
      {
        table: 'service_requests',
        select: 'id, created_at',
        filter: (q) => q.eq('status', 'open'),
        toUrl: (row) => `/service-request/${row.id}`,
        changefreq: 'daily',
        priority: '0.6',
      },
      {
        table: 'articles',
        select: 'slug, updated_at',
        filter: (q) => q.eq('status', 'published'),
        toUrl: (row) => `/articles/${row.slug || row.id}`,
        changefreq: 'weekly',
        priority: '0.6',
      },
    ];

    const collected = { job_postings: [], events: [], service_requests: [], articles: [] };
    for (const source of dynamicSources) {
      const { data: rows, error: sourceError } = await source.filter(
        supabaseReadClient.from(source.table).select(source.select)
      );
      if (sourceError) {
        if (sourceError.code !== '42P01') {
          console.error(`Could not fetch ${source.table} for sitemap:`, sourceError.message);
        }
        continue;
      }
      collected[source.table] = (rows || []).map((row) => ({
        path: source.toUrl(row),
        lastmod: row.updated_at || row.created_at,
        changefreq: source.changefreq,
        priority: source.priority,
      }));
    }
    jobUrls = collected.job_postings;
    eventUrls = collected.events;
    serviceRequestUrls = collected.service_requests;
    articleUrls = collected.articles;
  }

  const today = formatSitemapDate();
  const allUrls = [
    ...sitemapStaticRoutes.map((route) => ({ ...route, lastmod: today })),
    ...profileUrls,
    ...jobUrls,
    ...eventUrls,
    ...serviceRequestUrls,
    ...articleUrls,
    ...contentPageUrls,
  ];

  const urlNodes = allUrls.map((route) =>
    buildSitemapUrlNode(
      `${SITEMAP_BASE_URL}${route.path}`,
      formatSitemapDate(route.lastmod),
      route.changefreq,
      route.priority
    )
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes.join('\n')}\n</urlset>\n`;
}

app.get('/sitemap.xml', async (req, res) => {
  try {
    const xml = await generateSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Could not generate sitemap</error>');
  }
});

// Only start the HTTP listener in local dev; Vercel invokes the app directly
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
  });
}

export default app;
