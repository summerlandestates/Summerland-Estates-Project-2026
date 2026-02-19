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
    const { userId, email } = JSON.parse(event.body || '{}');

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Update user profile with verification code
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_code: verificationCode,
        verification_code_expires_at: expiresAt,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // In production, send email with verification code
    // For now, we'll just return the code (remove this in production)
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // await sendEmail({
    //   to: email,
    //   subject: 'Email Verification Code',
    //   text: `Your verification code is: ${verificationCode}. This code expires in 15 minutes.`,
    // });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: true,
        // Remove this in production - only for testing
        code: verificationCode 
      }),
    };
  } catch (error: any) {
    console.error('Send verification code error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
