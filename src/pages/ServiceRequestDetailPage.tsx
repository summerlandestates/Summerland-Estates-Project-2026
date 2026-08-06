import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getTierLimits } from '@/utils/tierAccess';
import { sendBackendNotification } from '@/utils/notifications';
import { 
  ArrowLeft,
  Users, 
  MapPin, 
  DollarSign, 
  Calendar,
  Clock,
  FileText,
  Loader2,
  Send,
  CheckCircle
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  service_needed: string;
  location: string;
  date_needed: string;
  details: string;
  special_requests: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  user_id: string;
  status: string;
}

export default function ServiceRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [bidForm, setBidForm] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchService();
      checkExistingBid();
    }
  }, [id]);

  useEffect(() => {
    if (user && service) {
      checkExistingBid();
    }
  }, [user, service]);

  const checkExistingBid = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('service_bids')
      .select('id')
      .eq('service_request_id', id)
      .eq('bidder_id', user.id)
      .single();
    setHasBid(!!data);
  };

  const getMonthlyBidCount = async () => {
    if (!user) return 0;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('service_bids')
      .select('*', { count: 'exact', head: true })
      .eq('bidder_id', user.id)
      .gte('created_at', startOfMonth.toISOString());
    return count || 0;
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a bid');
      navigate('/login');
      return;
    }
    if (!service) return;
    if (!bidForm.name.trim() || !bidForm.email.trim()) {
      toast.error('Please fill in your name and email');
      return;
    }
    const quoteAmount = parseFloat(bidForm.amount);
    if (!bidForm.amount.trim() || isNaN(quoteAmount) || quoteAmount <= 0) {
      toast.error('Please enter a valid quote amount');
      return;
    }

    setBidding(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();

      const limits = getTierLimits(profile?.tier || 'professional-basic');
      if (!limits.canBidOnRequests) {
        toast.error('Bidding is not available on your current plan');
        return;
      }
      if (limits.bidLimit) {
        const count = await getMonthlyBidCount();
        if (count >= limits.bidLimit) {
          toast.error(`You have reached your limit of ${limits.bidLimit} bids this month. Upgrade to Pro for unlimited bidding.`);
          return;
        }
      }

      const { error } = await supabase.from('service_bids').insert({
        service_request_id: service.id,
        bidder_id: user.id,
        bidder_name: bidForm.name,
        bidder_email: bidForm.email,
        bidder_phone: bidForm.phone || null,
        quote_amount: quoteAmount,
        message: bidForm.message || null,
      });

      if (error) throw error;

      // Notify service request owner
      if (service?.user_id) {
        await sendBackendNotification(
          service.user_id,
          'message',
          `New bid for ${service.service_needed}`,
          `${bidForm.name} submitted a $${quoteAmount.toFixed(2)} bid for your ${service.service_needed} request.`,
          `/service-request/${service.id}`
        );
      }

      setHasBid(true);
      toast.success('Bid submitted successfully');
      setBidForm({ name: '', email: '', phone: '', amount: '', message: '' });
    } catch (error: any) {
      toast.error('Failed to submit bid', { description: error.message });
    } finally {
      setBidding(false);
    }
  };

  const fetchService = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service request:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Service Request Not Found</h1>
            <p className="text-muted-foreground mb-6">This service request may have been removed or is no longer available.</p>
            <Button onClick={() => navigate('/open-roles')} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
              Browse All Requests
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/open-roles')}
            variant="ghost"
            className="mb-6 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Open Roles
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-2 lg:order-1">
              {/* Header Card */}
              <Card className="p-4 sm:p-6 lg:p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#A89F91]" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2">
                      {service.service_needed}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm sm:text-base">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {service.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className={service.status === 'open' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                    {service.status === 'open' ? 'Open for Bids' : service.status}
                  </Badge>
                </div>

                {/* Posted Date */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Posted on {formatDate(service.created_at)}
                </div>
              </Card>

              {/* Service Details */}
              <Card className="p-4 sm:p-6 lg:p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                  Service Details
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {service.details}
                </p>
              </Card>

              {/* Special Requests */}
              {service.special_requests && (
                <Card className="p-4 sm:p-6 lg:p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                    Special Requests
                  </h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {service.special_requests}
                  </p>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-32 space-y-4 lg:space-y-6">
                {/* Submit Bid Card */}
                <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Interested in this Request?
                  </h3>
                  
                  {hasBid ? (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="font-medium text-foreground">Bid Submitted</p>
                      <p className="text-sm text-muted-foreground mt-1">The requester will review your bid.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleBid} className="space-y-4">
                      {!user && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Please sign in to submit a bid.
                        </p>
                      )}
                      <div>
                        <Label htmlFor="bid-name" className="text-sm">Your Name</Label>
                        <Input
                          id="bid-name"
                          value={bidForm.name}
                          onChange={(e) => setBidForm({ ...bidForm, name: e.target.value })}
                          placeholder="Full name"
                          required
                          disabled={!user || bidding}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bid-email" className="text-sm">Email</Label>
                        <Input
                          id="bid-email"
                          type="email"
                          value={bidForm.email}
                          onChange={(e) => setBidForm({ ...bidForm, email: e.target.value })}
                          placeholder="you@email.com"
                          required
                          disabled={!user || bidding}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bid-phone" className="text-sm">Phone</Label>
                        <Input
                          id="bid-phone"
                          value={bidForm.phone}
                          onChange={(e) => setBidForm({ ...bidForm, phone: e.target.value })}
                          placeholder="(optional)"
                          disabled={!user || bidding}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bid-amount" className="text-sm">Quote Amount ($)</Label>
                        <Input
                          id="bid-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={bidForm.amount}
                          onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                          placeholder="e.g., 150"
                          required
                          disabled={!user || bidding}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bid-message" className="text-sm">Message</Label>
                        <Textarea
                          id="bid-message"
                          value={bidForm.message}
                          onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                          placeholder="Describe your experience and how you can help..."
                          rows={4}
                          disabled={!user || bidding}
                        />
                      </div>
                      <Button 
                        type="submit"
                        className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white"
                        disabled={!user || bidding}
                      >
                        {bidding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        {bidding ? 'Submitting...' : 'Submit a Bid'}
                      </Button>
                    </form>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    The requester will be notified and can contact you.
                  </p>
                </Card>

                {/* Timeline Card */}
                <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-[#A89F91]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Service Needed By</p>
                        <p className="font-medium">{formatDate(service.date_needed)}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Budget Card */}
                {(service.budget_min || service.budget_max) && (
                  <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                      Budget Range
                    </h3>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-3 text-[#A89F91]" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          ${service.budget_min || 0} - ${service.budget_max || 'Open'}
                        </p>
                        <p className="text-sm text-muted-foreground">Estimated budget</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Info Card */}
                <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                    Quick Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <FileText className="w-4 h-4 mr-3 mt-0.5 text-[#A89F91]" />
                      <div>
                        <p className="text-muted-foreground">Request ID</p>
                        <p className="font-mono text-xs">{service.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 text-[#A89F91]" />
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{service.location}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
