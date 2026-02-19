import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, code } = JSON.parse(event.body || '{}');

    // Get user's verification code and expiration
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('verification_code, verification_code_expires_at')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (!profile.verification_code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No verification code found. Please request a new code.' }),
      };
    }

    // Check if code is expired
    const expiresAt = new Date(profile.verification_code_expires_at);
    if (expiresAt < new Date()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Verification code has expired. Please request a new code.' }),
      };
    }

    // Verify code matches
    if (profile.verification_code !== code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid verification code.' }),
      };
    }

    // Mark email as verified and clear verification code
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error('Verify email code error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
