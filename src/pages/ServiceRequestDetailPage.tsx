import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Users, 
  MapPin, 
  DollarSign, 
  Calendar,
  Clock,
  FileText,
  Mail,
  Loader2
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
  const [service, setService] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchService();
    }
  }, [id]);

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
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white mb-4"
                    onClick={() => {
                      const subject = encodeURIComponent(`Bid for Service: ${service.service_needed}`);
                      const body = encodeURIComponent(`Hello,\n\nI am interested in providing services for your request: ${service.service_needed}\n\nLocation: ${service.location}\nDate Needed: ${formatDate(service.date_needed)}\n\nMy proposed quote: [Enter your quote]\n\nDetails about my services:\n[Describe your experience and how you can help]\n\nBest regards,\n[Your Name]`);
                      window.location.href = `mailto:support@summerlandestates.com?subject=${subject}&body=${body}`;
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Submit a Bid
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Contact the requester to discuss details and pricing.
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
