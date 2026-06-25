import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, Users, Video, Star, ArrowLeft, Mail, Phone, User, Loader2, CheckCircle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { emailNotifications } from '@/services/emailNotifications';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'networking' | 'workshop' | 'conference' | 'webinar' | 'social' | 'training';
  date: string;
  time: string;
  location: string;
  is_online: boolean;
  meeting_link: string | null;
  image_url: string | null;
  capacity: number | null;
  is_featured: boolean;
  organizer_name: string;
  organizer_email: string;
  registration_url: string | null;
  created_at: string;
}

interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  dietary_restrictions: string | null;
  created_at: string;
}

const eventTypeLabels: Record<string, string> = {
  networking: 'Networking',
  workshop: 'Workshop',
  conference: 'Conference',
  webinar: 'Webinar',
  social: 'Social/Gala',
  training: 'Training',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    dietary_restrictions: '',
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchRegistrations();
    }
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error, count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
      setRegistrationCount(count || 0);
      
      // Check if current user is already registered
      if (user?.email) {
        const existing = data?.find(r => r.email === user.email);
        setUserRegistration(existing || null);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save registration to database
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: id,
          full_name: formData.full_name,
          email: formData.email,
          user_id: user?.id || null,
          phone: formData.phone || null,
          company: formData.company || null,
          dietary_restrictions: formData.dietary_restrictions || null,
        });

      if (registrationError) throw registrationError;

      // 2. Send email notification to user
      await emailNotifications.notifyEventRegistration({
        userEmail: formData.email,
        userName: formData.full_name,
        eventTitle: event?.title || 'Event',
        eventDate: new Date(event?.date || '').toLocaleDateString(),
        eventLocation: event?.location || 'TBD',
      });

      // 3. Send email to event organizer
      await sendEmailToOrganizer();

      // 4. Send admin notification
      await emailNotifications.notifyAdminEventRegistration({
        userData: {
          name: formData.full_name,
          email: formData.email,
        },
        eventData: {
          title: event?.title || 'Event',
          date: new Date(event?.date || '').toLocaleDateString(),
          location: event?.location || 'TBD',
        },
      });

      setIsSuccess(true);
      toast.success('Registration successful! Check your email for confirmation.');
      fetchRegistrations();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Failed to register', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendEmailToOrganizer = async () => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: event?.organizer_email,
          subject: `New Registration: ${event?.title}`,
          html: `
            <h2>New Event Registration</h2>
            <p><strong>Event:</strong> ${event?.title}</p>
            <p><strong>Date:</strong> ${new Date(event?.date || '').toLocaleDateString()}</p>
            <hr />
            <h3>Attendee Details:</h3>
            <p><strong>Name:</strong> ${formData.full_name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
            <p><strong>Dietary Restrictions:</strong> ${formData.dietary_restrictions || 'None'}</p>
          `,
        }),
      });
    } catch (error) {
      console.error('Failed to send email to organizer:', error);
    }
  };

  const sendEmailToAdmin = async () => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@summerlandestates.com';
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `Event Registration Alert: ${event?.title}`,
          html: `
            <h2>Event Registration Notification</h2>
            <p>A new user has registered for an event.</p>
            <p><strong>Event:</strong> ${event?.title}</p>
            <p><strong>Organizer:</strong> ${event?.organizer_name} (${event?.organizer_email})</p>
            <hr />
            <h3>Attendee Details:</h3>
            <p><strong>Name:</strong> ${formData.full_name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
          `,
        }),
      });
    } catch (error) {
      console.error('Failed to send email to admin:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      company: '',
      dietary_restrictions: '',
    });
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    setIsRegisterModalOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-[#A89F91]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')} className="bg-[#A89F91] hover:bg-[#8A8279]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const spotsLeft = event.capacity ? event.capacity - registrationCount : null;

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title={`${event.title} - Summerland Estates Events`}
        description={event.description}
        canonical={`/event/${event.id}`}
        image={event.image_url || undefined}
      />
      <NavBar currentPage="events" />

      {/* Hero Section with Image */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden mt-24">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#A89F91] to-[#8A8279]" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
            <Button
              variant="outline"
              className="mb-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/events')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {event.is_featured && (
                <Badge className="bg-amber-500 text-white border-amber-400">
                  <Star className="w-3 h-3 mr-1" />
                  Featured Event
                </Badge>
              )}
              <Badge className="bg-white/20 text-white border-white/30">
                {eventTypeLabels[event.event_type]}
              </Badge>
              {event.is_online && (
                <Badge className="bg-blue-500 text-white border-0">
                  <Video className="w-3 h-3 mr-1" />
                  Online Event
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-heading font-semibold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Participants Section */}
            {registrations.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-heading font-semibold mb-4">
                    <Users className="w-6 h-6 inline mr-2" />
                    Participants ({registrationCount})
                  </h2>
                  <div className="space-y-3">
                    {registrations.slice(0, 10).map((reg) => (
                      <div key={reg.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#A89F91]/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#A89F91]" />
                        </div>
                        <div>
                          <p className="font-medium">{reg.full_name}</p>
                          {reg.company && (
                            <p className="text-sm text-muted-foreground">{reg.company}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {registrations.length > 10 && (
                      <p className="text-center text-muted-foreground">
                        And {registrations.length - 10} more participants...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-heading font-semibold mb-6">Event Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#A89F91] mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#A89F91] mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    {event.is_online ? (
                      <Video className="w-5 h-5 text-[#A89F91] mt-0.5" />
                    ) : (
                      <MapPin className="w-5 h-5 text-[#A89F91] mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{event.is_online ? 'Virtual Event' : 'Location'}</p>
                      <p className="text-muted-foreground">{event.location}</p>
                      {event.is_online && event.meeting_link && (
                        <p className="text-sm text-blue-600 mt-1">Link provided after registration</p>
                      )}
                    </div>
                  </div>
                  
                  {event.capacity && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#A89F91] mt-0.5" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-muted-foreground">
                          {registrationCount} / {event.capacity} registered
                        </p>
                        {spotsLeft !== null && spotsLeft > 0 && (
                          <p className="text-sm text-green-600 mt-1">{spotsLeft} spots remaining</p>
                        )}
                        {spotsLeft === 0 && (
                          <p className="text-sm text-red-600 mt-1">Event is full</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6 mb-6">
                  <h4 className="font-medium mb-2">Organized by</h4>
                  <p className="text-muted-foreground">{event.organizer_name}</p>
                  <p className="text-sm text-muted-foreground">{event.organizer_email}</p>
                </div>

                {userRegistration ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Already Registered
                  </Button>
                ) : event.registration_url ? (
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279]"
                    onClick={() => window.open(event.registration_url!, '_blank')}
                  >
                    Register on External Site
                  </Button>
                ) : spotsLeft === 0 ? (
                  <Button className="w-full" disabled>
                    Event is Full
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279]"
                    onClick={() => setIsRegisterModalOpen(true)}
                  >
                    Register Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Registration Modal */}
      <Dialog open={isRegisterModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {isSuccess ? 'Registration Successful!' : `Register for ${event.title}`}
            </DialogTitle>
            <DialogDescription>
              {isSuccess 
                ? 'You have successfully registered for this event.' 
                : 'Fill in your details to register for this event.'}
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                A confirmation email has been sent to {formData.email}
              </p>
              <p className="text-sm text-muted-foreground">
                The event organizer has also been notified.
              </p>
              <Button 
                className="mt-6 bg-[#A89F91] hover:bg-[#8A8279]"
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div>
                <Label htmlFor="full_name">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="company">Company / Organization</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label htmlFor="dietary_restrictions">Dietary Restrictions / Special Requirements</Label>
                <Input
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                  placeholder="Vegetarian, allergies, accessibility needs, etc."
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-[#A89F91] hover:bg-[#8A8279]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By registering, you agree to receive event-related communications.
                The event organizer and admin will be notified of your registration.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
