import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import FAQSection from '../components/FAQSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, Loader2, Video, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'networking' | 'workshop' | 'conference' | 'webinar' | 'social' | 'training';
  date: string;
  time: string;
  location: string;
  is_online: boolean;
  image_url: string | null;
  capacity: number | null;
  is_featured: boolean;
}

const eventTypeColors: Record<string, string> = {
  networking: 'bg-blue-100 text-blue-700 border-blue-200',
  workshop: 'bg-green-100 text-green-700 border-green-200',
  conference: 'bg-purple-100 text-purple-700 border-purple-200',
  webinar: 'bg-orange-100 text-orange-700 border-orange-200',
  social: 'bg-pink-100 text-pink-700 border-pink-200',
  training: 'bg-teal-100 text-teal-700 border-teal-200',
};

const eventTypeLabels: Record<string, string> = {
  networking: 'Networking',
  workshop: 'Workshop',
  conference: 'Conference',
  webinar: 'Webinar',
  social: 'Social/Gala',
  training: 'Training',
};

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'networking' | 'workshop' | 'conference' | 'webinar' | 'social' | 'training'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['approved', 'published'])
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.event_type === filter);

  const featuredEvent = events.find(e => e.is_featured);

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="Events - Summerland Estates"
        description="Discover estate industry events, networking opportunities, and professional gatherings hosted by Summerland Estates."
        canonical="/events"
      />
      <NavBar currentPage="events" />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-[#A89F91]/10 text-[#A89F91] border-[#A89F91]/20 px-4 py-2 text-sm font-semibold mb-6">
              Events & Gatherings
            </Badge>
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6 tracking-tight">
              Industry Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect with fellow professionals, expand your skills, and stay current with industry trends through our curated events.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#A89F91]" />
            </div>
          )}

          {/* Featured Event */}
          {!loading && featuredEvent && (
            <div className="mb-12 relative overflow-hidden rounded-2xl">
              {/* Background Image */}
              <div className="absolute inset-0">
                {featuredEvent.image_url ? (
                  <img
                    src={featuredEvent.image_url}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#A89F91] to-[#8A8279]" />
                )}
                <div className="absolute inset-0 bg-black/50" />
              </div>
              
              <CardContent className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 text-white">
                    <Badge className="bg-amber-500 text-white border-amber-400 mb-4">
                      <Star className="w-3 h-3 mr-1" />
                      Featured Event
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">
                      {featuredEvent.title}
                    </h2>
                    <p className="text-white/90 leading-relaxed mb-6 max-w-2xl line-clamp-3">
                      {featuredEvent.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar className="w-5 h-5 text-amber-400" />
                        <span>{new Date(featuredEvent.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <span>{featuredEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Users className="w-5 h-5 text-amber-400" />
                        <span>{featuredEvent.capacity || 'Unlimited'} spots</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 mb-6">
                      {featuredEvent.is_online ? (
                        <Video className="w-5 h-5 text-amber-400" />
                      ) : (
                        <MapPin className="w-5 h-5 text-amber-400" />
                      )}
                      <span>{featuredEvent.location}</span>
                    </div>
                    <Button 
                      className="bg-white text-[#A89F91] hover:bg-white/90 font-semibold"
                      onClick={() => navigate(`/event/${featuredEvent.id}`)}
                    >
                      Register Now
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              All Events
            </Button>
            <Button
              variant={filter === 'conference' ? 'default' : 'outline'}
              onClick={() => setFilter('conference')}
              className={filter === 'conference' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              Conferences
            </Button>
            <Button
              variant={filter === 'workshop' ? 'default' : 'outline'}
              onClick={() => setFilter('workshop')}
              className={filter === 'workshop' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              Workshops
            </Button>
            <Button
              variant={filter === 'networking' ? 'default' : 'outline'}
              onClick={() => setFilter('networking')}
              className={filter === 'networking' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              Networking
            </Button>
            <Button
              variant={filter === 'webinar' ? 'default' : 'outline'}
              onClick={() => setFilter('webinar')}
              className={filter === 'webinar' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              Webinars
            </Button>
            <Button
              variant={filter === 'social' ? 'default' : 'outline'}
              onClick={() => setFilter('social')}
              className={filter === 'social' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              Social
            </Button>
            <Button
              variant={filter === 'training' ? 'default' : 'outline'}
              onClick={() => setFilter('training')}
              className={filter === 'training' ? 'bg-[#A89F91] hover:bg-[#8A8279]' : 'border-border'}
            >
              Training
            </Button>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.filter(e => !e.is_featured).map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#A89F91]/20 to-[#A89F91]/40 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-[#A89F91]/50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${eventTypeColors[event.event_type]} shadow-sm`}>
                      {eventTypeLabels[event.event_type]}
                    </Badge>
                  </div>
                  {event.is_online && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-500 text-white border-0 shadow-sm">
                        <Video className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-[#A89F91]" />
                      <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-[#A89F91]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {event.is_online ? (
                        <Video className="w-4 h-4 text-[#A89F91]" />
                      ) : (
                        <MapPin className="w-4 h-4 text-[#A89F91]" />
                      )}
                      <span>{event.location}</span>
                    </div>
                    {event.capacity && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-[#A89F91]" />
                        <span>{event.capacity} spots available</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    Learn More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Host an Event CTA */}
          <div className="mt-16">
            <Card className="p-8 bg-[#A89F91]/5 border-[#A89F91]/20 text-center">
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Want to Host an Event?
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Partner with us to host networking events, workshops, or educational sessions for the estate services community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-[#A89F91] hover:bg-[#8A8279]"
                  onClick={() => navigate('/submit-event')}
                >
                  Submit Event Proposal
                </Button>
                <Button 
                  variant="outline" 
                  className="border-[#A89F91] text-[#A89F91]"
                  onClick={() => navigate('/sponsorship')}
                >
                  Sponsorship Opportunities
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection 
          category="Events"
          title="Events FAQs"
          subtitle="Common questions about our events and attendance"
          maxItems={5}
          className="bg-muted/30"
        />
      </main>

      <Footer />
    </div>
  );
}
