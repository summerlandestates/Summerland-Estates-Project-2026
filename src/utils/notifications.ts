import type { NotificationPreferences } from '../types';

export interface NotificationPayload {
  type: 'new-job' | 'message' | 'profile-view' | 'forum-update';
  title: string;
  body: string;
  userId: string;
  metadata?: {
    jobId?: string;
    messageId?: string;
    viewerId?: string;
    topicId?: string;
  };
}

export function shouldSendNotification(
  preferences: NotificationPreferences,
  notificationType: NotificationPayload['type'],
  channel: 'email' | 'sms'
): boolean {
  switch (notificationType) {
    case 'new-job':
      return preferences.newJobPostings[channel];
    case 'message':
      return preferences.messageReceived[channel];
    case 'profile-view':
      return preferences.profileViewed[channel];
    case 'forum-update':
      return preferences.forumTopics[channel];
    default:
      return false;
  }
}

export async function sendNotification(
  payload: NotificationPayload,
  preferences: NotificationPreferences,
  userEmail: string,
  userPhone?: string
): Promise<void> {
  // Determine which channels to use
  const useEmail = shouldSendNotification(preferences, payload.type, 'email');
  const useSms = !!userPhone && shouldSendNotification(preferences, payload.type, 'sms');

  if (useEmail) await sendEmailNotification(payload, userEmail);
  if (useSms) await sendSMSNotification(payload, userPhone);
}

export async function sendBackendNotification(
  userId: string,
  type: NotificationPayload['type'],
  title: string,
  body: string,
  link?: string
): Promise<void> {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, title, body, link })
    });

    if (!response.ok) {
      console.warn('Backend notification failed:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send backend notification:', error);
  }
}

function sendEmailNotification(payload: NotificationPayload, email: string): void {
  // Email notifications are handled through Supabase Auth
  // Configure custom email templates in Supabase Dashboard
  // Email: summerlandestates@summerlandestates.com
  console.log('Sending email notification:', {
    to: email,
    from: 'summerlandestates@summerlandestates.com',
    subject: payload.title,
    body: payload.body
  });
  
  // TODO: Integrate with Supabase Edge Functions for custom email sending
  // or use Supabase's built-in email templates for notifications
}

function sendSMSNotification(payload: NotificationPayload, phone: string): void {
  // In a real app, this would call an SMS service API (Twilio, etc.)
  console.log('Sending SMS notification:', {
    to: phone,
    message: `${payload.title}: ${payload.body}`
  });
}

export function subscribeToForumTopic(
  _userId: string,
  topicId: string,
  preferences: NotificationPreferences
): NotificationPreferences {
  if (preferences.subscribedTopics.includes(topicId)) {
    return preferences;
  }

  return {
    ...preferences,
    subscribedTopics: [...preferences.subscribedTopics, topicId]
  };
}

export function unsubscribeFromForumTopic(
  _userId: string,
  topicId: string,
  preferences: NotificationPreferences
): NotificationPreferences {
  return {
    ...preferences,
    subscribedTopics: preferences.subscribedTopics.filter(id => id !== topicId)
  };
}
