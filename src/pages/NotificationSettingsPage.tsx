import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bell, Mail, MessageSquare, Eye, MessageCircle, Save } from 'lucide-react';
import type { NotificationPreferences } from '../types';

const defaultPreferences: NotificationPreferences = {
  newJobPostings: {
    email: false,
    sms: false
  },
  messageReceived: {
    email: true,
    sms: false
  },
  profileViewed: {
    email: false,
    sms: false
  },
  forumTopics: {
    email: false,
    sms: false
  },
  subscribedTopics: []
};

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [hasPhone, setHasPhone] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load saved preferences
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }

    // Check if user has phone number on file
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setHasPhone(!!profile.phone);
    }
  }, []);

  const handleToggle = (
    category: keyof Omit<NotificationPreferences, 'subscribedTopics'>,
    channel: 'email' | 'sms'
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const NotificationRow = ({
    title,
    description,
    icon: Icon,
    category,
    emailEnabled,
    smsEnabled
  }: {
    title: string;
    description: string;
    icon: any;
    category: keyof Omit<NotificationPreferences, 'subscribedTopics'>;
    emailEnabled: boolean;
    smsEnabled: boolean;
  }) => (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor={`${category}-email`} className="text-foreground cursor-pointer">
              Email
            </Label>
          </div>
          <Switch
            id={`${category}-email`}
            checked={emailEnabled}
            onCheckedChange={() => handleToggle(category, 'email')}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor={`${category}-sms`} className="text-foreground cursor-pointer">
              Text Message
            </Label>
          </div>
          <Switch
            id={`${category}-sms`}
            checked={smsEnabled}
            onCheckedChange={() => handleToggle(category, 'sms')}
            disabled={!hasPhone}
          />
        </div>
      </div>

      {!hasPhone && (
        <p className="text-xs text-muted-foreground ml-14 mt-2">
          Add a phone number to your profile to enable text notifications
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-8 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-heading font-bold text-foreground">
                  Notification Settings
                </h1>
                <p className="text-muted-foreground">
                  Choose how you'd like to be notified
                </p>
              </div>
            </div>
          </div>

          <Card className="p-8 bg-card text-card-foreground mb-6">
            <div className="space-y-6">
              <NotificationRow
                title="New Job Postings or Service Requests"
                description="Get notified when new opportunities are posted in your area or saved locations"
                icon={Bell}
                category="newJobPostings"
                emailEnabled={preferences.newJobPostings.email}
                smsEnabled={preferences.newJobPostings.sms}
              />

              <Separator className="bg-border" />

              <NotificationRow
                title="Message Received"
                description="Get notified when you receive a new direct message, bid, or response"
                icon={MessageCircle}
                category="messageReceived"
                emailEnabled={preferences.messageReceived.email}
                smsEnabled={preferences.messageReceived.sms}
              />

              <Separator className="bg-border" />

              <NotificationRow
                title="Profile Viewed"
                description="Get notified when another user views your profile"
                icon={Eye}
                category="profileViewed"
                emailEnabled={preferences.profileViewed.email}
                smsEnabled={preferences.profileViewed.sms}
              />

              <Separator className="bg-border" />

              <NotificationRow
                title="Forum Topic Updates"
                description="Get notified when new posts or comments are added to topics you follow"
                icon={MessageSquare}
                category="forumTopics"
                emailEnabled={preferences.forumTopics.email}
                smsEnabled={preferences.forumTopics.sms}
              />
            </div>
          </Card>

          {/* Subscribed Topics */}
          {preferences.subscribedTopics.length > 0 && (
            <Card className="p-8 bg-card text-card-foreground mb-6">
              <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                Subscribed Forum Topics
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                You're following {preferences.subscribedTopics.length} topic{preferences.subscribedTopics.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.subscribedTopics.map((topicId) => (
                  <Badge
                    key={topicId}
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground"
                  >
                    Topic #{topicId}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Important Notes */}
          <Card className="p-6 bg-muted border-border">
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All notification types are opt-in. You control what you receive.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your phone number is used only for notifications you enable. We never send marketing messages.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can change these settings at any time.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Text message rates may apply based on your carrier plan.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can unsubscribe from any notification type at any time.</span>
              </li>
            </ul>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>

          {saved && (
            <div className="mt-4 p-4 bg-success/10 border border-success rounded-lg">
              <p className="text-sm text-success flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Your notification preferences have been saved successfully
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
