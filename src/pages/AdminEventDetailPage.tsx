import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Video, 
  Star, 
  ArrowLeft, 
  Mail, 
  Phone, 
  User,
  Building2,
  FileText,
  Clock2,
  Pencil,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
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
  created_at: string;
  updated_at: string;
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

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

  useEffect(() => {
    if (id && user) {
      fetchEvent();
      fetchRegistrations();
    }
  }, [id, user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate('/admin/login');
    }
  };

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
    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Event deleted successfully');
      navigate('/admin/events');
    } catch (error: any) {
      toast.error('Failed to delete event', { description: error.message });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Event ${newStatus} successfully`);
      fetchEvent();
    } catch (error: any) {
      toast.error('Failed to update status', { description: error.message });
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#A89F91] mx-auto mb-4" />
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/admin/events')} className="bg-[#A89F91] hover:bg-[#8A8279]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const spotsLeft = event.capacity ? event.capacity - registrations.length : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/events')}
                className="rounded-xl flex-shrink-0 mt-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {getEventTypeBadge(event.event_type)}
                  {getStatusBadge(event.status)}
                  {event.is_featured && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Image */}
              {event.image_url && (
                <Card className="overflow-hidden">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-64 object-cover"
                  />
                </Card>
              )}

              {/* Event Details */}
              <Card className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4">About This Event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#A89F91] mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-600">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#A89F91] mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-gray-600">{event.time}</p>
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
                      <p className="text-gray-600">{event.location}</p>
                      {event.meeting_link && (
                        <a 
                          href={event.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {event.meeting_link}
                        </a>
                      )}
                    </div>
                  </div>
                  {event.capacity && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#A89F91] mt-0.5" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-gray-600">{event.capacity} spots</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Participants List */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-semibold">
                    <Users className="w-5 h-5 inline mr-2" />
                    Participants ({registrations.length})
                  </h2>
                  {event.capacity && (
                    <Badge className={spotsLeft === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                      {spotsLeft === 0 ? 'Full' : `${spotsLeft} spots remaining`}
                    </Badge>
                  )}
                </div>

                {registrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No registrations yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registrations.map((reg) => (
                      <div key={reg.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10 bg-[#A89F91]/20">
                          <AvatarFallback className="text-[#A89F91] text-sm font-medium">
                            {getInitials(reg.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{reg.full_name}</p>
                            <span className="text-xs text-gray-400">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {reg.email}
                            </span>
                            {reg.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {reg.phone}
                              </span>
                            )}
                          </div>
                          {reg.company && (
                            <p className="text-sm text-gray-500 mt-1">{reg.company}</p>
                          )}
                          {reg.dietary_restrictions && (
                            <p className="text-sm text-amber-600 mt-1">
                              Dietary: {reg.dietary_restrictions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Organizer Info */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Organizer</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-[#A89F91]/20">
                      <AvatarFallback className="text-[#A89F91]">
                        {getInitials(event.organizer_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{event.organizer_name}</p>
                      <p className="text-sm text-gray-500">{event.organizer_email}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Event Stats */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Event Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Registrations</span>
                    <span className="font-bold text-lg">{registrations.length}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-bold text-lg">{event.capacity}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created</span>
                    <span className="text-sm">{new Date(event.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-sm">{new Date(event.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/event/${event.id}`, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/events?edit=${event.id}`)}
                    className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                  <div className="border-t my-3" />
                  {event.status === 'pending' && (
                    <>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate('published')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve & Publish
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleStatusUpdate('rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {event.status === 'published' && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleStatusUpdate('cancelled')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Event
                    </Button>
                  )}
                  {event.status === 'cancelled' && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate('published')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Reactivate
                    </Button>
                  )}
                </div>
              </Card>

              {/* Admin Notes */}
              {event.admin_notes && (
                <Card className="p-6 bg-amber-50 border-amber-200">
                  <h3 className="font-semibold mb-2 text-amber-800">Admin Notes</h3>
                  <p className="text-amber-700 text-sm">{event.admin_notes}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone and all registrations will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
