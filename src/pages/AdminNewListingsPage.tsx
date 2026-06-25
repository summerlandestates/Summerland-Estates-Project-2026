import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Building2, 
  Briefcase, 
  Home,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface NewListing {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  profile_type: string | null;
  location: string | null;
  phone: string | null;
  tier: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  application_data?: any;
}

export default function AdminNewListingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<NewListing[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

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

    fetchNewListings();
  };

  const fetchNewListings = async () => {
    setPageLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, profile_type, location, phone, tier, created_at, application_data')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedListings = (profiles || [])
        .filter((profile: any) => profile.role !== 'admin')
        .filter((profile: any) => profile.application_data || profile.profile_type)
        .map((profile: any) => ({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.application_data?.name || 'Unnamed Applicant',
          avatar_url: profile.avatar_url,
          role: profile.role,
          profile_type: profile.profile_type || profile.application_data?.profile_type,
          location: profile.location || profile.application_data?.location,
          phone: profile.phone || profile.application_data?.phone,
          tier: profile.tier || profile.application_data?.selected_tier,
          status: profile.application_data?.account_status || profile.application_data?.status || 'pending',
          created_at: profile.created_at,
          application_data: profile.application_data,
        }));

      setListings(formattedListings);
    } catch (error: any) {
      toast.error('Failed to load new listings', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setPageLoading(false);
    }
  };

  const getProfileTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'professional': 'Professional',
      'business': 'Service Provider',
      'agency': 'Agency',
      'estates': 'Estate',
    };
    return labels[type || ''] || type || 'Unknown';
  };

  const getTierLabel = (tier: string | null) => {
    if (!tier) return 'Unknown';
    const tierMap: Record<string, string> = {
      'professional-basic': 'Basic',
      'professional-pro': 'Pro',
      'professional-free': 'Free',
      'business-free': 'Free',
      'business-pro': 'Pro',
      'business-enterprise': 'Enterprise',
      'agency-free': 'Free',
      'agency-basic': 'Basic',
      'agency-hiring': 'Hiring',
      'agency-pro': 'Pro',
      'estates-free': 'Free',
      'estates-basic': 'Basic',
      'estates-hiring': 'Hiring',
      'estates-pro': 'Pro',
    };
    return tierMap[tier] || tier;
  };

  const getProfileTypeIcon = (type: string | null) => {
    switch (type) {
      case 'professional':
        return <User className="w-4 h-4" />;
      case 'business':
        return <Building2 className="w-4 h-4" />;
      case 'agency':
        return <Briefcase className="w-4 h-4" />;
      case 'estates':
        return <Home className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      searchQuery === '' ||
      listing.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesType = typeFilter === 'all' || listing.profile_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReview = (id: string) => {
    navigate(`/admin/applications/${id}`);
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <PlusCircle className="w-8 h-8 text-[#A89F91]" />
              <h1 className="text-4xl font-heading font-bold text-gray-900">
                New Listings
              </h1>
            </div>
            <p className="text-gray-600">
              Review and approve new member applications and listings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.filter((l) => l.status === 'pending').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.filter((l) => l.status === 'approved').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.filter((l) => l.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.length}
                  </p>
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
                  placeholder="Search by name, email, or location..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="business">Service Provider</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="estates">Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Listings Table */}
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedListings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <PlusCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No new listings found</p>
                        <p className="text-sm">New applications will appear here when submitted</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#A89F91]/10 flex items-center justify-center">
                              {listing.avatar_url ? (
                                <img
                                  src={listing.avatar_url}
                                  alt={listing.full_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-[#A89F91]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {listing.full_name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail className="w-3 h-3" />
                                {listing.email}
                              </div>
                              {listing.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {listing.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getProfileTypeIcon(listing.profile_type)}
                            <span className="text-sm text-gray-700">
                              {getProfileTypeLabel(listing.profile_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs">
                            {getTierLabel(listing.tier)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {listing.location ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {listing.location}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(listing.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-[#CFC5B7] hover:bg-[#F7F1EA]"
                            onClick={() => handleReview(listing.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredListings.length)} of{' '}
                  {filteredListings.length} listings
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
