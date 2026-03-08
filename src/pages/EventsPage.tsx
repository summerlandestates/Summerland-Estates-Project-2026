import { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'networking' | 'workshop' | 'conference' | 'webinar';
  attendees?: number;
  isFeatured?: boolean;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Estate Management Excellence Summit 2026',
    description: 'Join industry leaders for a day of insights, networking, and professional development focused on the future of luxury estate management.',
    date: 'April 15, 2026',
    time: '9:00 AM - 5:00 PM PST',
    location: 'The Beverly Hills Hotel, Beverly Hills, CA',
    type: 'conference',
    attendees: 150,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Private Chef Networking Dinner',
    description: 'An exclusive evening for private chefs to connect, share experiences, and explore collaboration opportunities.',
    date: 'March 28, 2026',
    time: '7:00 PM - 10:00 PM EST',
    location: 'The Breakers, Palm Beach, FL',
    type: 'networking',
    attendees: 40
  },
  {
    id: '3',
    title: 'Smart Home Technology Workshop',
    description: 'Hands-on training on the latest smart home systems including Crestron, Savant, and Control4 for estate staff.',
    date: 'April 5, 2026',
    time: '10:00 AM - 3:00 PM CST',
    location: 'Virtual Event',
    type: 'workshop',
    attendees: 75
  },
  {
    id: '4',
    title: 'Household Staff Management Webinar',
    description: 'Best practices for managing household teams, from hiring to performance reviews and team development.',
    date: 'March 20, 2026',
    time: '2:00 PM - 3:30 PM EST',
    location: 'Online via Zoom',
    type: 'webinar',
    attendees: 200
  },
  {
    id: '5',
    title: 'Yacht Crew Certification Course',
    description: 'STCW certification course for yacht professionals looking to advance their maritime careers.',
    date: 'May 1-5, 2026',
    time: '8:00 AM - 4:00 PM Daily',
    location: 'Fort Lauderdale, FL',
    type: 'workshop',
    attendees: 25
  },
  {
    id: '6',
    title: 'Estate Security Best Practices',
    description: 'Learn from security experts about protecting high-net-worth properties and families.',
    date: 'April 22, 2026',
    time: '1:00 PM - 4:00 PM PST',
    location: 'Virtual Event',
    type: 'webinar',
    attendees: 100
  }
];

const eventTypeColors = {
  networking: 'bg-purple-100 text-purple-700 border-purple-200',
  workshop: 'bg-blue-100 text-blue-700 border-blue-200',
  conference: 'bg-amber-100 text-amber-700 border-amber-200',
  webinar: 'bg-green-100 text-green-700 border-green-200'
};

const eventTypeLabels = {
  networking: 'Networking',
  workshop: 'Workshop',
  conference: 'Conference',
  webinar: 'Webinar'
};

export default function EventsPage() {
  const [filter, setFilter] = useState<'all' | 'networking' | 'workshop' | 'conference' | 'webinar'>('all');

  const filteredEvents = filter === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.type === filter);

  const featuredEvent = upcomingEvents.find(e => e.isFeatured);

  return (
    <div className="min-h-screen bg-background page-transition">
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

          {/* Featured Event */}
          {featuredEvent && (
            <Card className="mb-12 overflow-hidden border-[#A89F91]/30 bg-gradient-to-r from-[#A89F91]/5 to-transparent">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4">
                      Featured Event
                    </Badge>
                    <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                      {featuredEvent.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {featuredEvent.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-5 h-5 text-[#A89F91]" />
                        <span>{featuredEvent.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-5 h-5 text-[#A89F91]" />
                        <span>{featuredEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-5 h-5 text-[#A89F91]" />
                        <span>{featuredEvent.attendees} Expected</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-6">
                      <MapPin className="w-5 h-5 text-[#A89F91]" />
                      <span>{featuredEvent.location}</span>
                    </div>
                    <Button className="bg-[#A89F91] hover:bg-[#8A8279]">
                      Register Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.filter(e => !e.isFeatured).map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Badge className={`${eventTypeColors[event.type]} mb-4`}>
                    {eventTypeLabels[event.type]}
                  </Badge>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-[#A89F91]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-[#A89F91]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-[#A89F91]" />
                      <span>{event.location}</span>
                    </div>
                    {event.attendees && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-[#A89F91]" />
                        <span>{event.attendees} Expected Attendees</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white">
                    Learn More
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
                <Button className="bg-[#A89F91] hover:bg-[#8A8279]">
                  Submit Event Proposal
                </Button>
                <Button variant="outline" className="border-[#A89F91] text-[#A89F91]">
                  Sponsorship Opportunities
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
