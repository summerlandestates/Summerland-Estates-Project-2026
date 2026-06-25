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

export function sendNotification(
  payload: NotificationPayload,
  preferences: NotificationPreferences,
  userEmail: string,
  userPhone?: string
): void {
  // Check if email notification should be sent
  if (shouldSendNotification(preferences, payload.type, 'email')) {
    sendEmailNotification(payload, userEmail);
  }

  // Check if SMS notification should be sent
  if (userPhone && shouldSendNotification(preferences, payload.type, 'sms')) {
    sendSMSNotification(payload, userPhone);
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
