import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  User,
  Building2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const eventTypes = [
  { value: 'networking', label: 'Networking Event', icon: Users },
  { value: 'workshop', label: 'Workshop', icon: Sparkles },
  { value: 'conference', label: 'Conference', icon: Building2 },
  { value: 'webinar', label: 'Webinar', icon: Video },
  { value: 'social', label: 'Social/Gala', icon: Calendar },
  { value: 'training', label: 'Training', icon: FileText },
];

interface FormData {
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  location: string;
  is_online: boolean;
  meeting_link: string;
  capacity: string;
  registration_url: string;
  organizer_name: string;
  organizer_email: string;
  image_url: string;
}

export default function EventSubmissionPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to submit an event');
      navigate('/login', { state: { from: '/submit-event' } });
    }
  }, [authLoading, user, navigate]);

  // Pre-fill user data when available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizer_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        organizer_email: user.email || '',
      }));
    }
  }, [user]);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    event_type: '',
    date: '',
    time: '',
    location: '',
    is_online: false,
    meeting_link: '',
    capacity: '',
    registration_url: '',
    organizer_name: '',
    organizer_email: '',
    image_url: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.description.length < 50) errors.description = 'Description must be at least 50 characters';
    if (!formData.event_type) errors.event_type = 'Event type is required';
    if (!formData.date) errors.date = 'Event date is required';
    if (!formData.time) errors.time = 'Event time is required';
    if (!formData.is_online && !formData.location.trim()) {
      errors.location = 'Location is required for in-person events';
    }
    if (formData.is_online && !formData.meeting_link.trim()) {
      errors.meeting_link = 'Meeting link is required for online events';
    }
    if (!formData.organizer_name.trim()) errors.organizer_name = 'Organizer name is required';
    if (!formData.organizer_email.trim()) {
      errors.organizer_email = 'Organizer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizer_email)) {
      errors.organizer_email = 'Please enter a valid email address';
    }

    // Check if date is in the future
    if (formData.date) {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        errors.date = 'Event date must be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        date: formData.date,
        time: formData.time,
        location: formData.is_online ? 'Online' : formData.location,
        is_online: formData.is_online,
        meeting_link: formData.is_online ? formData.meeting_link : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        registration_url: formData.registration_url || null,
        organizer_name: formData.organizer_name,
        organizer_email: formData.organizer_email,
        image_url: formData.image_url || null,
        status: 'pending',
        submitted_by: user?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Event submitted successfully!', {
        description: 'Your event is pending admin approval. You will be notified once it is reviewed.',
      });
    } catch (error: any) {
      toast.error('Failed to submit event', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload image', { description: error.message });
    } finally {
      setUploadingImage(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Event Submitted - Summerland Estates"
          description="Your event has been submitted for review."
          canonical="/submit-event"
          noIndex={true}
        />
        <NavBar currentPage="events" />

        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-2xl">
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                Event Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-8">
                Thank you for submitting your event. Our team will review it and get back to you within 24-48 hours. 
                You will receive an email notification once your event is approved.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/events')}
                  className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                >
                  View All Events
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      title: '',
                      description: '',
                      event_type: '',
                      date: '',
                      time: '',
                      location: '',
                      is_online: false,
                      meeting_link: '',
                      capacity: '',
                      registration_url: '',
                      organizer_name: '',
                      organizer_email: '',
                      image_url: '',
                    });
                  }}
                >
                  Submit Another Event
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Submit an Event - Summerland Estates"
        description="Submit your estate industry event for approval and reach our network of professionals."
        canonical="/submit-event"
      />
      <NavBar currentPage="events" />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
            className="mb-6 -ml-4 text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-4">
              Submit an Event
            </h1>
            <p className="text-xl text-gray-600">
              Share your estate industry event with our community. Fill in the details below and our team will review your submission.
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-6 mb-8 bg-amber-50 border-amber-200">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Before You Submit</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• All events are reviewed within 24-48 hours</li>
                  <li>• Events must be related to estate management or luxury service industry</li>
                  <li>• Include clear date, time, and location information</li>
                  <li>• Provide a detailed description (minimum 50 characters)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Details Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A89F91]" />
                  Event Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Estate Management Best Practices Workshop"
                      className={formErrors.title ? 'border-red-500' : ''}
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value) => handleInputChange('event_type', value)}
                    >
                      <SelectTrigger className={formErrors.event_type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.event_type && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.event_type}
                      </p>
                    )}
                  </div>

                  {/* Event Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="event_image">Event Feature Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          id="event_image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="cursor-pointer"
                        />
                      </div>
                      {uploadingImage && (
                        <Loader2 className="w-5 h-5 animate-spin text-[#A89F91]" />
                      )}
                    </div>
                    {formData.image_url && (
                      <div className="mt-2 relative">
                        <img
                          src={formData.image_url}
                          alt="Event preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('image_url', '')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload a feature image for your event (recommended: 1200x600px)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Event Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your event, what attendees will learn, who should attend, and any special features..."
                      rows={5}
                      className={formErrors.description ? 'border-red-500' : ''}
                    />
                    {formErrors.description ? (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">{formData.description.length} characters (minimum 50)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#A89F91]" />
                  Date & Time
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={formErrors.date ? 'border-red-500' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {formErrors.date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Event Time *</Label>
                    <Input
                      id="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      placeholder="e.g., 10:00 AM - 4:00 PM EST"
                      className={formErrors.time ? 'border-red-500' : ''}
                    />
                    {formErrors.time && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.time}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#A89F91]" />
                  Location
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="is_online"
                      checked={formData.is_online}
                      onCheckedChange={(checked) => {
                        handleInputChange('is_online', checked as boolean);
                        if (checked) {
                          handleInputChange('location', 'Online');
                        } else {
                          handleInputChange('location', '');
                        }
                      }}
                    />
                    <Label htmlFor="is_online" className="cursor-pointer flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-500" />
                      This is an online/virtual event
                    </Label>
                  </div>

                  {formData.is_online ? (
                    <div className="space-y-2">
                      <Label htmlFor="meeting_link">Meeting Link *</Label>
                      <Input
                        id="meeting_link"
                        value={formData.meeting_link}
                        onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                        placeholder="e.g., https://zoom.us/j/123456789"
                        className={formErrors.meeting_link ? 'border-red-500' : ''}
                      />
                      {formErrors.meeting_link && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formErrors.meeting_link}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="location">Venue/Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Beverly Hills Hotel, 9641 Sunset Blvd, Beverly Hills, CA"
                        className={formErrors.location ? 'border-red-500' : ''}
                      />
                      {formErrors.location && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formErrors.location}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#A89F91]" />
                  Registration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="e.g., 100"
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_url">Registration URL (Optional)</Label>
                    <Input
                      id="registration_url"
                      type="url"
                      value={formData.registration_url}
                      onChange={(e) => handleInputChange('registration_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Organizer Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#A89F91]" />
                  Organizer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer_name">Organizer Name *</Label>
                    <Input
                      id="organizer_name"
                      value={formData.organizer_name}
                      onChange={(e) => handleInputChange('organizer_name', e.target.value)}
                      placeholder="e.g., Jane Smith"
                      className={formErrors.organizer_name ? 'border-red-500' : ''}
                    />
                    {formErrors.organizer_name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.organizer_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizer_email">Organizer Email *</Label>
                    <Input
                      id="organizer_email"
                      type="email"
                      value={formData.organizer_email}
                      onChange={(e) => handleInputChange('organizer_email', e.target.value)}
                      placeholder="e.g., jane@example.com"
                      className={formErrors.organizer_email ? 'border-red-500' : ''}
                    />
                    {formErrors.organizer_email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.organizer_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/events')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Event for Review
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting, you agree to our event guidelines. All events are reviewed before being published.
                </p>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
