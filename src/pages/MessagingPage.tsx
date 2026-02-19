import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Users, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import { listings } from '../data/listings';
import type { Listing } from '../types';

export default function MessagingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      navigate('/');
    }
  }, [navigate]);

  // Filter eligible recipients (Estate Managers, Chief of Staff, Personal Assistants, Executive Assistants)
  const eligibleRoles = [
    'Estate Manager',
    'Chief of Staff',
    'Personal Assistant',
    'Executive Assistant',
    'Household Manager',
    'Property Manager'
  ];

  const eligibleRecipients = listings.filter(listing => 
    listing.canReceiveMessages && 
    eligibleRoles.some(role => listing.role.toLowerCase().includes(role.toLowerCase()))
  );

  // Get unique states from locations
  const states = Array.from(new Set(
    eligibleRecipients.map(r => r.location.split(',').pop()?.trim() || '')
  )).filter(Boolean).sort();

  // Get unique roles
  const roles = Array.from(new Set(
    eligibleRecipients.map(r => r.role)
  )).sort();

  // Filter recipients based on selections
  const filteredRecipients = eligibleRecipients.filter(recipient => {
    const matchesRole = filterRole === 'all' || recipient.role === filterRole;
    const matchesCity = !filterLocation || recipient.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesState = filterState === 'all' || recipient.location.includes(filterState);
    
    return matchesRole && matchesCity && matchesState;
  });

  const handleToggleRecipient = (id: string) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter(rid => rid !== id));
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map(r => r.id));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    
    // In a real app, this would send the message via API and create conversation threads
    alert(`Message sent to ${selectedRecipients.length} recipient(s)!`);
    
    // For demo, navigate to a mock conversation
    if (selectedRecipients.length === 1) {
      navigate(`/conversation/${Date.now()}`);
    }
    
    // Reset form
    setSelectedRecipients([]);
    (e.target as HTMLFormElement).reset();
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Send Message
            </h1>
            <p className="text-lg text-muted-foreground">
              Send messages to estate managers, chiefs of staff, and assistants by location
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recipients Selection */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-card text-card-foreground mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-foreground flex items-center">
                    <Users className="w-6 h-6 mr-3 text-primary" />
                    Select Recipients
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {selectedRecipients.length} selected
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterRole" className="text-foreground">Filter by Role</Label>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="bg-background text-foreground border-border">
                          <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          <SelectItem value="all" className="text-foreground cursor-pointer">All Roles</SelectItem>
                          {roles.map(role => (
                            <SelectItem key={role} value={role} className="text-foreground cursor-pointer">
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filterState" className="text-foreground">Filter by State</Label>
                      <Select value={filterState} onValueChange={setFilterState}>
                        <SelectTrigger className="bg-background text-foreground border-border">
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          <SelectItem value="all" className="text-foreground cursor-pointer">All States</SelectItem>
                          {states.map(state => (
                            <SelectItem key={state} value={state} className="text-foreground cursor-pointer">
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filterLocation" className="text-foreground">Filter by City</Label>
                      <Input
                        id="filterLocation"
                        placeholder="Enter city name..."
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredRecipients.length} recipient(s) match your filters
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      {selectedRecipients.length === filteredRecipients.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>

                {/* Recipients List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredRecipients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No recipients match your filters
                    </p>
                  ) : (
                    filteredRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedRecipients.includes(recipient.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted'
                        }`}
                        onClick={() => handleToggleRecipient(recipient.id)}
                      >
                        <Checkbox
                          checked={selectedRecipients.includes(recipient.id)}
                          className="pointer-events-none"
                        />
                        <img
                          src={recipient.profilePhoto}
                          alt={recipient.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {recipient.name}
                            </h3>
                            {recipient.verified && (
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            )}
                            {recipient.isOnlineNow && (
                              <span className="flex items-center gap-1 text-xs text-success">
                                <span className="w-2 h-2 bg-success rounded-full"></span>
                                Online
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {recipient.role}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {recipient.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Message Form */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card text-card-foreground sticky top-32">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Compose Message
                </h2>

                <form onSubmit={handleSendMessage} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Message subject"
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={12}
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senderName" className="text-foreground">Your Name *</Label>
                    <Input
                      id="senderName"
                      placeholder="Your name"
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senderEmail" className="text-foreground">Your Email *</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <p className="text-sm text-foreground font-semibold mb-2">
                        Recipients: {selectedRecipients.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your message will be sent to all selected recipients
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={selectedRecipients.length === 0}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
