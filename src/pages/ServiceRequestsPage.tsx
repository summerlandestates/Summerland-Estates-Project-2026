import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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
import { MapPin, Calendar, DollarSign, Send, Plus, Loader2 } from 'lucide-react';
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

interface ServiceFormData {
  serviceNeeded: string;
  location: string;
  dateNeeded: string;
  details: string;
  specialRequests: string;
  budgetMin: string;
  budgetMax: string;
}

export default function ServiceRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    serviceNeeded: '',
    location: '',
    dateNeeded: '',
    details: '',
    specialRequests: '',
    budgetMin: '',
    budgetMax: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadServiceRequests = async () => {
      setPageLoading(true);

      const { data, error } = await supabase
        .from('service_requests')
        .select('id, service_needed, location, date_needed, details, special_requests, status, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        const today = new Date();
        const activeRequests = mockServiceRequests.filter((request) => {
          const requestDate = new Date(request.dateNeeded);
          return requestDate >= today && request.status === 'active';
        });

        setServiceRequests(activeRequests);
        setPageLoading(false);

        toast.error('Showing fallback service requests', {
          description: error.message || 'Live service requests could not be loaded.',
        });
        return;
      }

      const mappedRequests: ServiceRequest[] = (data || []).map((request: any) => ({
        id: request.id,
        serviceNeeded: request.service_needed,
        location: request.location,
        dateNeeded: request.date_needed,
        details: request.details,
        specialRequests: request.special_requests || undefined,
        postedBy: 'Summerland Estates Member',
        postedDate: request.created_at,
        status: request.status === 'open' ? 'active' : 'filled',
      }));

      setServiceRequests(mappedRequests);
      setPageLoading(false);
    };

    loadServiceRequests();
  }, []);

  const handleBidClick = (request: ServiceRequest) => {
    if (!user) {
      toast.error('Apply or sign in to bid on service requests', {
        description: 'Membership approval is required before you can submit bids.',
      });
      navigate('/add-listing');
      return;
    }

    setSelectedRequest(request);
    setShowBidModal(true);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequest || !user) return;

    const submitBid = async () => {
      setBidSubmitting(true);

      const { error } = await supabase.from('service_bids').insert({
        service_request_id: selectedRequest.id,
        bidder_id: user.id,
        quote_amount: parseFloat(quoteAmount),
        message: bidMessage.trim() || null,
      });

      if (error) {
        toast.error('Failed to submit bid', {
          description:
            error.code === '23505'
              ? 'You already submitted a bid for this request.'
              : error.message || 'Please try again.',
        });
        setBidSubmitting(false);
        return;
      }

      toast.success('Bid submitted', {
        description: `Your quote has been sent for ${selectedRequest.serviceNeeded}.`,
      });

      setBidSubmitting(false);
      setQuoteAmount('');
      setBidMessage('');
      setShowBidModal(false);
      setSelectedRequest(null);
    };

    submitBid();
  };

  const handleCloseBidModal = () => {
    setShowBidModal(false);
    setSelectedRequest(null);
    setQuoteAmount('');
    setBidMessage('');
    setBidSubmitting(false);
  };

  const handleCreateServiceRequest = () => {
    if (!user) {
      toast.error('Apply or sign in to create a service request', {
        description: 'Posting requests is available after membership approval.',
      });
      navigate('/add-listing');
      return;
    }
    setShowCreateModal(true);
  };

  const handleSubmitServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Apply or sign in to create a service request');
      navigate('/add-listing');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('service_requests').insert({
        user_id: user.id,
        service_needed: serviceForm.serviceNeeded,
        location: serviceForm.location,
        date_needed: serviceForm.dateNeeded,
        details: serviceForm.details,
        special_requests: serviceForm.specialRequests || null,
        budget_min: serviceForm.budgetMin ? parseFloat(serviceForm.budgetMin) : null,
        budget_max: serviceForm.budgetMax ? parseFloat(serviceForm.budgetMax) : null,
        status: 'open',
      });

      if (error) throw error;

      toast.success('Service Request Posted!', {
        description: 'Service providers can now submit bids for your request.',
      });

      const nextRequest: ServiceRequest = {
        id: crypto.randomUUID(),
        serviceNeeded: serviceForm.serviceNeeded,
        location: serviceForm.location,
        dateNeeded: serviceForm.dateNeeded,
        details: serviceForm.details,
        specialRequests: serviceForm.specialRequests || undefined,
        postedBy: user.email || 'You',
        postedDate: new Date().toISOString(),
        status: 'active',
      };

      setServiceRequests((current) => [nextRequest, ...current]);
      
      setShowCreateModal(false);
      setServiceForm({
        serviceNeeded: '',
        location: '',
        dateNeeded: '',
        details: '',
        specialRequests: '',
        budgetMin: '',
        budgetMax: '',
      });
    } catch (error: any) {
      toast.error('Failed to post service request', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSubmitting(false);
    }
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
                onClick={handleCreateServiceRequest}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Service Request
              </Button>
            </div>
          </div>

          {pageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6 bg-card text-card-foreground animate-pulse">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="h-6 w-2/3 rounded bg-muted" />
                      <div className="h-4 w-1/2 rounded bg-muted" />
                      <div className="h-6 w-20 rounded bg-muted" />
                    </div>
                    <div className="h-16 rounded bg-muted" />
                    <div className="h-10 rounded bg-muted" />
                  </div>
                </Card>
              ))}
            </div>
          ) : serviceRequests.length === 0 ? (
            <Card className="p-12 bg-card text-card-foreground text-center">
              <p className="text-xl text-muted-foreground mb-4">
                No active service requests at this time
              </p>
              <Button
                onClick={handleCreateServiceRequest}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Service Request
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
                disabled={bidSubmitting}
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={bidSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {bidSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Bid
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Service Request Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card text-card-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Create Service Request
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Request short-term or one-time services for your estate. Service providers will be able to submit private bids.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitServiceRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serviceNeeded" className="text-foreground">Service Needed *</Label>
              <Input
                id="serviceNeeded"
                placeholder="e.g. Window Washing, Plumber, Event Staff"
                required
                value={serviceForm.serviceNeeded}
                onChange={(e) => setServiceForm(prev => ({ ...prev, serviceNeeded: e.target.value }))}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceLocation" className="text-foreground">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="serviceLocation"
                  placeholder="City, neighborhood, or estate location"
                  required
                  value={serviceForm.location}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10 bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateNeeded" className="text-foreground">Date Needed *</Label>
              <Input
                id="dateNeeded"
                type="date"
                required
                value={serviceForm.dateNeeded}
                onChange={(e) => setServiceForm(prev => ({ ...prev, dateNeeded: e.target.value }))}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details" className="text-foreground">Details *</Label>
              <Textarea
                id="details"
                placeholder="Describe the scope of work, size of property, timing, access details, etc."
                rows={5}
                required
                value={serviceForm.details}
                onChange={(e) => setServiceForm(prev => ({ ...prev, details: e.target.value }))}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests" className="text-foreground">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Certifications, discretion, uniforms, experience, or other requirements"
                rows={3}
                value={serviceForm.specialRequests}
                onChange={(e) => setServiceForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin" className="text-foreground">Budget Min (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="Min"
                    value={serviceForm.budgetMin}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, budgetMin: e.target.value }))}
                    className="pl-10 bg-background text-foreground border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax" className="text-foreground">Budget Max (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="Max"
                    value={serviceForm.budgetMax}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, budgetMax: e.target.value }))}
                    className="pl-10 bg-background text-foreground border-border"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Service Request'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
