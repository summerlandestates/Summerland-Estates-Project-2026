import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock2,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  CheckIcon,
  XIcon,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  X,
  Star,
  Pencil,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

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
  registration_url: string | null;
  organizer_name: string;
  organizer_email: string;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'cancelled' | 'completed';
  admin_notes: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const eventTypeOptions = [
  { value: 'networking', label: 'Networking Event', icon: Users, color: 'bg-blue-100 text-blue-700' },
  { value: 'workshop', label: 'Workshop', icon: FileText, color: 'bg-green-100 text-green-700' },
  { value: 'conference', label: 'Conference', icon: Building2, color: 'bg-purple-100 text-purple-700' },
  { value: 'webinar', label: 'Webinar', icon: Video, color: 'bg-orange-100 text-orange-700' },
  { value: 'social', label: 'Social/Gala', icon: Calendar, color: 'bg-pink-100 text-pink-700' },
  { value: 'training', label: 'Training', icon: Clock2, color: 'bg-teal-100 text-teal-700' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: Clock2 },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
];

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewingEvent, setReviewingEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  
  // Add/Edit Event Dialog
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'networking' as Event['event_type'],
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
    is_featured: false,
    status: 'published' as Event['status'],
  });

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

  useEffect(() => {
    if (events.length > 0) {
      fetchRegistrationCounts();
    }
  }, [events]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    fetchEvents();
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      toast.error('Failed to load events', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCounts = async () => {
    try {
      // Fetch all registrations and count per event manually
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach((item: any) => {
        counts[item.event_id] = (counts[item.event_id] || 0) + 1;
      });
      setRegistrationCounts(counts);
    } catch (error) {
      console.error('Error fetching registration counts:', error);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingEvent || !selectedStatus) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: selectedStatus,
          admin_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewingEvent.id);

      if (error) throw error;

      // Send email notification to organizer
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: reviewingEvent.organizer_email,
            subject: `Your Event Submission - ${selectedStatus === 'published' || selectedStatus === 'approved' ? 'Approved' : 'Update'}`,
            template: 'event-review',
            data: {
              eventTitle: reviewingEvent.title,
              status: selectedStatus,
              adminNotes: adminNotes,
              eventUrl: `https://summerlandestates.com/events`,
            },
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }

      toast.success(`Event ${selectedStatus === 'published' || selectedStatus === 'approved' ? 'approved' : 'updated'} successfully!`);
      setIsReviewDialogOpen(false);
      setReviewingEvent(null);
      setAdminNotes('');
      setSelectedStatus('');
      fetchEvents();
    } catch (error: any) {
      toast.error('Failed to update event', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', deletingEvent.id);

      if (error) throw error;

      toast.success('Event deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeletingEvent(null);
      fetchEvents();
    } catch (error: any) {
      toast.error('Failed to delete event', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event Creation/Editing Functions
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

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
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
        is_featured: formData.is_featured,
        status: formData.status,
        submitted_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(data)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully!');
      } else {
        const { error } = await supabase
          .from('events')
          .insert({ ...data, created_at: new Date().toISOString() });

        if (error) throw error;
        toast.success('Event created successfully!');
      }

      setIsEventDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload image', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setImageUploading(false);
    }
  };

  const openAddDialog = () => {
    setEditingEvent(null);
    resetForm();
    setIsEventDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      date: event.date,
      time: event.time,
      location: event.is_online ? '' : event.location,
      is_online: event.is_online,
      meeting_link: event.meeting_link || '',
      capacity: event.capacity?.toString() || '',
      registration_url: event.registration_url || '',
      organizer_name: event.organizer_name,
      organizer_email: event.organizer_email,
      image_url: event.image_url || '',
      is_featured: event.is_featured,
      status: event.status,
    });
    setFormErrors({});
    setIsEventDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'networking',
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
      is_featured: false,
      status: 'published',
    });
    setFormErrors({});
    setEditingEvent(null);
  };


  const openDeleteDialog = (event: Event) => {
    setDeletingEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const getEventTypeBadge = (type: string) => {
    const option = eventTypeOptions.find(o => o.value === type);
    return (
      <Badge className={option?.color || 'bg-gray-100'}>
        {option?.icon && <option.icon className="w-3 h-3 mr-1" />}
        {option?.label || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge className={option?.color || 'bg-gray-100'}>
        {option?.icon && <option.icon className="w-3 h-3 mr-1" />}
        {option?.label || status}
      </Badge>
    );
  };

  const isEventPast = (date: string) => {
    return new Date(date) < new Date();
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: events.length,
    pending: events.filter(e => e.status === 'pending').length,
    published: events.filter(e => e.status === 'published').length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
    past: events.filter(e => isEventPast(e.date)).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#A89F91] mx-auto mb-4" />
            <p className="text-gray-600">Loading events...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-x-hidden overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-[#A89F91]" />
                <div>
                  <h1 className="text-4xl font-heading font-bold text-gray-900">
                    Event Management
                  </h1>
                  <p className="text-gray-600">
                    Review and manage event submissions
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open('/events', '_blank')}
                  className="rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Page
                </Button>
                <Button
                  onClick={openAddDialog}
                  className="rounded-xl bg-[#A89F91] hover:bg-[#8A8279] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Past</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.past}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6 border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, organizer, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Pending Alert */}
          {stats.pending > 0 && (
            <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-amber-800">
                  <strong>{stats.pending} event{stats.pending > 1 ? 's' : ''}</strong> pending review. Please review and approve or reject.
                </p>
              </div>
            </Card>
          )}

          {/* Table */}
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Event</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Organizer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Registrations</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No events found</p>
                        <p className="text-sm">Events will appear here when submitted</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr 
                        key={event.id} 
                        className={`hover:bg-gray-50 ${event.status === 'pending' ? 'bg-amber-50/30' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {/* Event Image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {event.image_url ? (
                                <img 
                                  src={event.image_url} 
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#A89F91]/10">
                                  <Calendar className="w-6 h-6 text-[#A89F91]/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-gray-900 line-clamp-1">{event.title}</p>
                                {event.is_featured && (
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-1 mt-1">{event.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {event.is_online ? 'Online' : event.location}
                              </div>
                              {isEventPast(event.date) && (
                                <Badge className="mt-2 bg-gray-100 text-gray-600 text-xs">Past Event</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getEventTypeBadge(event.event_type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>
                            <p>{new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-gray-400">{event.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">{event.organizer_name}</p>
                            <p className="text-gray-400">{event.organizer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#A89F91]" />
                            <span className="font-medium">{registrationCounts[event.id] || 0}</span>
                            {event.capacity && (
                              <span className="text-gray-400">/ {event.capacity}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => navigate(`/admin/event/${event.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(event)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Event
                              </DropdownMenuItem>
                              {event.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setReviewingEvent(event);
                                      setSelectedStatus('published');
                                      setAdminNotes('');
                                      setIsReviewDialogOpen(true);
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setReviewingEvent(event);
                                      setSelectedStatus('rejected');
                                      setAdminNotes('');
                                      setIsReviewDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XIcon className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(event)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {reviewingEvent?.status === 'pending' ? 'Review Event Submission' : 'Edit Event'}
            </DialogTitle>
            <DialogDescription>
              Review the event details and update the status.
            </DialogDescription>
          </DialogHeader>

          {reviewingEvent && (
            <div className="mt-4 space-y-6">
              {/* Event Details */}
              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {reviewingEvent.title}</p>
                  <p><strong>Type:</strong> {getEventTypeBadge(reviewingEvent.event_type)}</p>
                  <p><strong>Date:</strong> {new Date(reviewingEvent.date).toLocaleDateString()} at {reviewingEvent.time}</p>
                  <p><strong>Location:</strong> {reviewingEvent.is_online ? 'Online' : reviewingEvent.location}</p>
                  {reviewingEvent.meeting_link && (
                    <p><strong>Meeting Link:</strong> <a href={reviewingEvent.meeting_link} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{reviewingEvent.meeting_link}</a></p>
                  )}
                  <p><strong>Description:</strong> {reviewingEvent.description}</p>
                  {reviewingEvent.capacity && <p><strong>Capacity:</strong> {reviewingEvent.capacity} people</p>}
                  {reviewingEvent.registration_url && (
                    <p><strong>Registration:</strong> <a href={reviewingEvent.registration_url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">Link</a></p>
                  )}
                </div>
              </Card>

              {/* Organizer Info */}
              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Organizer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {reviewingEvent.organizer_name}</p>
                  <p><strong>Email:</strong> {reviewingEvent.organizer_email}</p>
                  <p><strong>Submitted:</strong> {new Date(reviewingEvent.created_at).toLocaleString()}</p>
                </div>
              </Card>

              {/* Review Form */}
              <form onSubmit={handleReview} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Update Status *</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes for the organizer (will be included in email)..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReviewDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                    disabled={isSubmitting || !selectedStatus}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Event'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? 'Update the event details below.' 
                : 'Fill in the details to create a new event.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEventSubmit} className="space-y-6 mt-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Event Image</Label>
              <div className="flex items-center gap-4">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Event preview"
                      className="w-32 h-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                  {imageUploading && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Estate Management Workshop"
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value as Event['event_type'] }))}
                >
                  <SelectTrigger className={formErrors.event_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.event_type && <p className="text-sm text-red-500">{formErrors.event_type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
                rows={4}
                className={formErrors.description ? 'border-red-500' : ''}
              />
              {formErrors.description ? (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              ) : (
                <p className="text-xs text-gray-500">{formData.description.length} characters (minimum 50)</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={formErrors.date ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time *</Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g., 10:00 AM - 4:00 PM"
                  className={formErrors.time ? 'border-red-500' : ''}
                />
                {formErrors.time && <p className="text-sm text-red-500">{formErrors.time}</p>}
              </div>
            </div>

            {/* Online/In-Person Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_online"
                checked={formData.is_online}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    is_online: e.target.checked,
                    location: e.target.checked ? 'Online' : ''
                  }));
                }}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="is_online" className="cursor-pointer flex items-center gap-2">
                <Video className="w-4 h-4" />
                This is an online/virtual event
              </Label>
            </div>

            {formData.is_online ? (
              <div className="space-y-2">
                <Label htmlFor="meeting_link">Meeting Link *</Label>
                <Input
                  id="meeting_link"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                  className={formErrors.meeting_link ? 'border-red-500' : ''}
                />
                {formErrors.meeting_link && <p className="text-sm text-red-500">{formErrors.meeting_link}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location">Venue/Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Beverly Hills Hotel"
                  className={formErrors.location ? 'border-red-500' : ''}
                />
                {formErrors.location && <p className="text-sm text-red-500">{formErrors.location}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizer_name">Organizer Name *</Label>
                <Input
                  id="organizer_name"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer_name: e.target.value }))}
                  placeholder="e.g., Jane Smith"
                  className={formErrors.organizer_name ? 'border-red-500' : ''}
                />
                {formErrors.organizer_name && <p className="text-sm text-red-500">{formErrors.organizer_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer_email">Organizer Email *</Label>
                <Input
                  id="organizer_email"
                  type="email"
                  value={formData.organizer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer_email: e.target.value }))}
                  placeholder="e.g., jane@example.com"
                  className={formErrors.organizer_email ? 'border-red-500' : ''}
                />
                {formErrors.organizer_email && <p className="text-sm text-red-500">{formErrors.organizer_email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Event['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.filter(s => !['pending', 'rejected'].includes(s.value)).map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="is_featured" className="cursor-pointer flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Featured Event
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEventDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                disabled={isSubmitting || imageUploading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingEvent ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingEvent ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingEvent?.title}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
