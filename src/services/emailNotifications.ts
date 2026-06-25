const API_BASE_URL = 'http://localhost:3001';

export interface EventRegistrationData {
  userEmail: string;
  userName?: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

export interface SponsorshipInquiryData {
  userEmail: string;
  userName?: string;
  companyName: string;
  sponsorshipType: string;
}

export interface EmailBlastData {
  userEmail: string;
  userName?: string;
  subject: string;
  recipientsCount?: string;
}

export interface RecognitionData {
  userEmail: string;
  userName?: string;
  nomineeName: string;
  category: string;
}

export interface AdminEventData {
  userData: {
    name?: string;
    email: string;
  };
  eventData: {
    title: string;
    date: string;
    location: string;
  };
}

export interface AdminSponsorshipData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  sponsorship_type: string;
  budget_range: string;
  message?: string | null;
  status?: string;
}

export interface AdminEmailBlastData {
  sender_name: string;
  sender_email: string;
  subject: string;
  target_recipients?: string;
  amount_paid?: number;
}

export interface AdminRecognitionData {
  nominee_name: string;
  company?: string;
  category: string;
  submitter_email?: string;
  submitter_name?: string;
}

class EmailNotificationService {
  async notifyEventRegistration(data: EventRegistrationData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-event-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send event registration notification');
      }
    } catch (error) {
      console.error('Error sending event notification:', error);
    }
  }

  async notifyAdminEventRegistration(data: AdminEventData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-admin-event-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to notify admin of event registration');
      }
    } catch (error) {
      console.error('Error sending admin event notification:', error);
    }
  }

  async notifySponsorshipInquiry(data: SponsorshipInquiryData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-sponsorship-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send sponsorship inquiry notification');
      }
    } catch (error) {
      console.error('Error sending sponsorship notification:', error);
    }
  }

  async notifyAdminSponsorship(data: AdminSponsorshipData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-admin-sponsorship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorshipData: data }),
      });

      if (!response.ok) {
        console.error('Failed to notify admin of sponsorship inquiry');
      }
    } catch (error) {
      console.error('Error sending admin sponsorship notification:', error);
    }
  }

  async notifyEmailBlast(data: EmailBlastData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-email-blast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send email blast notification');
      }
    } catch (error) {
      console.error('Error sending email blast notification:', error);
    }
  }

  async notifyAdminEmailBlast(data: AdminEmailBlastData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-admin-email-blast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailData: data }),
      });

      if (!response.ok) {
        console.error('Failed to notify admin of email blast');
      }
    } catch (error) {
      console.error('Error sending admin email blast notification:', error);
    }
  }

  async notifyRecognition(data: RecognitionData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-recognition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send recognition notification');
      }
    } catch (error) {
      console.error('Error sending recognition notification:', error);
    }
  }

  async notifyAdminRecognition(data: AdminRecognitionData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-admin-recognition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recognitionData: data }),
      });

      if (!response.ok) {
        console.error('Failed to notify admin of recognition submission');
      }
    } catch (error) {
      console.error('Error sending admin recognition notification:', error);
    }
  }

  async notifyStatusUpdate(data: {
    userEmail: string;
    userName?: string;
    itemType: string;
    itemName: string;
    status: string;
    adminNotes?: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-status-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send status update notification');
      }
    } catch (error) {
      console.error('Error sending status update notification:', error);
    }
  }
}

export const emailNotifications = new EmailNotificationService();
