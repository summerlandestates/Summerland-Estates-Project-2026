import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Calendar, DollarSign, Send, X } from 'lucide-react';
import type { ServiceRequest } from '../types';

// Mock data - in a real app, this would come from an API
const mockServiceRequests: ServiceRequest[] = [
  {
    id: '1',
    serviceNeeded: 'Window Washing',
    location: 'Beverly Hills, CA',
    dateNeeded: '2024-04-15',
    details: '15,000 sq ft estate with 40+ windows. Need interior and exterior cleaning. Property has 3 floors. Access to ladders and equipment required.',
    specialRequests: 'Must have insurance and references. Discretion required.',
    postedBy: 'John Smith',
    postedDate: '2024-03-15',
    status: 'active'
  },
  {
    id: '2',
    serviceNeeded: 'Event Staff',
    location: 'Malibu, CA',
    dateNeeded: '2024-04-20',
    details: 'Need 6 servers and 2 bartenders for private dinner party. 50 guests. Event runs 6pm-11pm. Black tie attire required.',
    specialRequests: 'Experience with high-profile events. Professional appearance and demeanor essential.',
    postedBy: 'Sarah Johnson',
    postedDate: '2024-03-14',
    status: 'active'
  },
  {
    id: '3',
    serviceNeeded: 'Plumbing Repair',
    location: 'Newport Beach, CA',
    dateNeeded: '2024-03-25',
    details: 'Master bathroom shower leak. Need diagnosis and repair. May require tile work.',
    specialRequests: 'Licensed plumber with luxury home experience.',
    postedBy: 'Michael Chen',
    postedDate: '2024-03-10',
    status: 'active'
  }
];

export default function ServiceRequestsPage() {
  const navigate = useNavigate();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Filter out expired requests
    const today = new Date();
    const activeRequests = serviceRequests.filter(request => {
      const requestDate = new Date(request.dateNeeded);
      return requestDate >= today && request.status === 'active';
    });
    setServiceRequests(activeRequests);
  }, []);

  const handleBidClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowBidModal(true);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest) return;
    
    // In a real app, this would create a private message thread
    alert(`Bid submitted for ${selectedRequest.serviceNeeded}!\n\nYour quote: ${quoteAmount}\n\nA private message thread has been created with the poster.`);
    
    // Reset form
    setQuoteAmount('');
    setBidMessage('');
    setShowBidModal(false);
    setSelectedRequest(null);
  };

  const handleCloseBidModal = () => {
    setShowBidModal(false);
    setSelectedRequest(null);
    setQuoteAmount('');
    setBidMessage('');
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="jobs" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
                  Service Requests
                </h1>
                <p className="text-lg text-muted-foreground">
                  Browse and bid on short-term service opportunities
                </p>
              </div>
              <Button
                onClick={() => navigate('/post-job')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Post Service Request
              </Button>
            </div>
          </div>

          {serviceRequests.length === 0 ? (
            <Card className="p-12 bg-card text-card-foreground text-center">
              <p className="text-xl text-muted-foreground mb-4">
                No active service requests at this time
              </p>
              <Button
                onClick={() => navigate('/post-job')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Post a Service Request
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceRequests.map((request) => (
                <Card
                  key={request.id}
                  className="p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                        {request.serviceNeeded}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.dateNeeded).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className="bg-success text-white">
                        Active
                      </Badge>
                    </div>

                    <p className="text-sm text-foreground line-clamp-3">
                      {request.details}
                    </p>

                    {request.specialRequests && (
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs font-semibold text-foreground mb-1">
                          Special Requirements:
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {request.specialRequests}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleBidClick(request)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Submit Bid
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bid Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent className="bg-card text-card-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Submit a Bid
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Send a private quote and message to the person who posted this service request. Your bid will not be visible to other users.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-foreground mb-1">
                {selectedRequest.serviceNeeded}
              </h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedRequest.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedRequest.dateNeeded).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitBid} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quoteAmount" className="text-foreground">
                Quote Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="quoteAmount"
                  type="text"
                  placeholder="Enter your quote"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  required
                  className="pl-10 bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidMessage" className="text-foreground">
                Message *
              </Label>
              <Textarea
                id="bidMessage"
                placeholder="Include what's covered, availability, timeline, and any relevant experience."
                rows={8}
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                required
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseBidModal}
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Bid
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
