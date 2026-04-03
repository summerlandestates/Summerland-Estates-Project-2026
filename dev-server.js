// Simple Express server to handle API routes in development
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY || !process.env.APP_FROM_EMAIL) {
    console.warn('Skipping email send because RESEND_API_KEY or APP_FROM_EMAIL is missing.');
    return;
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }
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

app.post('/api/admin-delete-user', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase service role configuration' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
