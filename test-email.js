/**
 * Email Test Script
 * Run this script to test email configuration
 * Usage: node test-email.js
 */

import nodemailer from 'nodemailer';

// Email configuration - Titan Email (Name.com) Settings
const emailConfigs = [
  {
    name: 'Titan Email - Port 587 (STARTTLS)',
    config: {
      host: 'smtp.titan.email',
      port: 587,
      secure: false,
      auth: {
        user: 'summerlandestates@summerlandestates.com',
        pass: 'Success12!'
      }
    }
  },
  {
    name: 'Titan Email - Port 465 (SSL)',
    config: {
      host: 'smtp.titan.email',
      port: 465,
      secure: true,
      auth: {
        user: 'summerlandestates@summerlandestates.com',
        pass: 'Success12!'
      }
    }
  },
  {
    name: 'Titan Email EU - Port 465',
    config: {
      host: 'smtp0101.titan.email',
      port: 465,
      secure: true,
      auth: {
        user: 'summerlandestates@summerlandestates.com',
        pass: 'Success12!'
      }
    }
  }
];

// Test recipient
const testRecipient = 'ubaidabu9@gmail.com';

async function testEmailConfig(configObj) {
  const { name, config } = configObj;
  console.log(`\n📧 Testing: ${name}`);
  console.log('---');
  console.log('SMTP Host:', config.host);
  console.log('SMTP Port:', config.port);
  console.log('From:', config.auth.user);
  console.log('To:', testRecipient);
  console.log('\n');

  try {
    // Create transporter
    console.log('🔌 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport(config);

    // Test connection
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Summerland Estates" <${config.auth.user}>`,
      to: testRecipient,
      subject: `✅ Email Test Successful - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #A89F91;">Email Configuration Test</h2>
          <p>Congratulations! Your email configuration is working correctly.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Test Details:</h3>
            <ul style="margin-bottom: 0;">
              <li><strong>Configuration:</strong> ${name}</li>
              <li><strong>SMTP Host:</strong> ${config.host}</li>
              <li><strong>SMTP Port:</strong> ${config.port}</li>
              <li><strong>From:</strong> ${config.auth.user}</li>
              <li><strong>To:</strong> ${testRecipient}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p>You can now configure these same settings in your Supabase dashboard.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from Summerland Estates.
          </p>
        </div>
      `,
      text: `
        Email Configuration Test
        
        Congratulations! Your email configuration is working correctly.
        
        Test Details:
        - Configuration: ${name}
        - SMTP Host: ${config.host}
        - SMTP Port: ${config.port}
        - From: ${config.auth.user}
        - To: ${testRecipient}
        - Time: ${new Date().toLocaleString()}
        
        You can now configure these same settings in your Supabase dashboard.
        
        This is an automated test email from Summerland Estates.
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🎉 Email configuration is working correctly!');
    console.log(`\nPlease check ${testRecipient} inbox for the test email.`);
    console.log('\n✅ Use these settings in Supabase:');
    console.log(`SMTP Host: ${config.host}`);
    console.log(`SMTP Port: ${config.port}`);
    console.log(`SMTP User: ${config.auth.user}`);
    console.log(`SMTP Password: Success12!`);
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('� Testing Email Configurations...\n');
  console.log(`Testing recipient: ${testRecipient}`);
  console.log(`Email: summerlandestates@summerlandestates.com`);
  console.log(`Password: Success12!`);

  for (const configObj of emailConfigs) {
    const success = await testEmailConfig(configObj);
    if (success) {
      console.log('\n✅✅✅ SUCCESS! Found working configuration.');
      process.exit(0);
    }
  }

  console.log('\n❌❌❌ All email configurations failed.');
  console.log('\nTroubleshooting tips:');
  console.log('1. Check if email password is correct');
  console.log('2. Check hosting provider for correct SMTP settings');
  console.log('3. Login to Name.com and check email settings');
  console.log('4. Enable SMTP access in hosting control panel');
  console.log('5. Try port 465 instead of 587');
  console.log('6. Check if firewall is blocking SMTP');
  process.exit(1);
}

// Run all tests
runAllTests();
