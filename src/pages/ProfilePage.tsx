import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Star, Mail, Share2, Bookmark, UserPlus, CheckCircle, BadgeCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import UpgradePrompt from '../components/UpgradePrompt';
import MapLocationLink from '../components/MapLocationLink';
import ProfileAnalytics, { useProfileViewTracker } from '../components/ProfileAnalytics';
import ServiceCalendar from '../components/ServiceCalendar';
import NativeAd from '../components/NativeAd';
import ReportButton from '../components/ReportButton';
import BlockUserButton from '../components/BlockUserButton';
import { fetchListingBySlug, fetchListingById } from '../utils/listings';
import { getVisibilityRules, formatNameForDisplay, canAccessProfile } from '@/utils/profileVisibility';
import { getTierLimits } from '@/utils/tierAccess';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Listing, PricingTier, Review } from '../types';

export default function ProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [bookingType, setBookingType] = useState('video');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [serviceMessage, setServiceMessage] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [respondingToReviewId, setRespondingToReviewId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userTier, setUserTier] = useState<PricingTier | undefined>(undefined);
  const [isPublicView, setIsPublicView] = useState(true);
  const [profileIndex, setProfileIndex] = useState(0);
  const [currentUserId] = useState(localStorage.getItem('userId') || '');
  const [viewLimitReached, setViewLimitReached] = useState(false);

  // Track profile views
  useProfileViewTracker(currentUserId, listing?.id || slug || '');

  useEffect(() => {
    window.scrollTo(0, 0);

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsPublicView(!loggedIn);

    if (loggedIn) {
      const tier = localStorage.getItem('userTier') as PricingTier | undefined;
      setUserTier(tier);
    }
  }, []);

  // Enforce monthly profile view limits (e.g. "Search & View 3 Profiles/Month")
  useEffect(() => {
    if (!user || !listing) return;
    if (listing.userId && listing.userId === user.id) return;

    const checkViewLimit = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .maybeSingle();

      const limits = getTierLimits((profile?.tier || 'professional-basic') as PricingTier);
      if (!limits.profileViewLimitMonthly) return;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact', head: true })
        .eq('viewer_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if ((count || 0) >= limits.profileViewLimitMonthly) {
        setViewLimitReached(true);
      }
    };

    checkViewLimit().catch((err) => console.error('View limit check failed:', err));
  }, [user, listing]);

  useEffect(() => {
    if (!slug) return;

    const loadListing = async () => {
      try {
        setLoading(true);
        let data = await fetchListingBySlug(slug);
        if (!data) {
          // Fallback: if slug is actually a legacy id, try loading by id
          data = await fetchListingById(slug);
        }
        setListing(data);
        setReviews(data?.reviews || []);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        toast.error('Failed to load profile', { description: err.message });
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [slug]);

  useEffect(() => {
    if (!listing) return;

    const saved = localStorage.getItem('savedProfiles');
    if (saved) {
      const savedIds = JSON.parse(saved);
      setIsSaved(savedIds.includes(listing.id) || savedIds.includes(listing.slug));
    }

    const connections = localStorage.getItem('connections');
    if (connections) {
      const connectedIds = JSON.parse(connections);
      setIsConnected(connectedIds.includes(listing.id));
    }
  }, [listing]);

  // Check if user can access this profile
  const canAccess = canAccessProfile(userTier, profileIndex, isPublicView);
  const visibilityRules = getVisibilityRules(userTier, isPublicView);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const url = window.location.href;
    const subject = `Check out ${listing?.name}'s profile`;
    const body = `I thought you might be interested in this profile:\n\n${listing?.name} - ${listing?.role}\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRefer = () => {
    const url = window.location.href;
    const subject = `Referral: ${listing?.name} - ${listing?.role}`;
    const body = `I would like to refer ${listing?.name} for your consideration.\n\nProfile: ${url}\n\nReason for referral: [Please add your comments here]`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please sign in to send a message');
      navigate('/login');
      return;
    }

    const recipientId = listing?.userId;
    if (!recipientId || recipientId === user.id) {
      toast.error('Cannot message this profile');
      return;
    }

    try {
      // Check for existing conversation
      const { data: existingParticipants, error: searchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (searchError) throw searchError;

      const myConversations = (existingParticipants || []).map(p => p.conversation_id);
      let conversationId: string | null = null;

      if (myConversations.length > 0) {
        const { data: match, error: matchError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', recipientId)
          .in('conversation_id', myConversations)
          .maybeSingle();

        if (matchError) throw matchError;
        if (match) conversationId = match.conversation_id;
      }

      if (!conversationId) {
        const allowed = await checkNewConversationLimit();
        if (!allowed) return;
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = conversation.id;

        const { error: partError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversationId, user_id: user.id },
            { conversation_id: conversationId, user_id: recipientId }
          ]);

        if (partError) throw partError;
      }

      navigate(`/messaging/${conversationId}`);
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('Failed to start conversation', { description: error.message });
    }
  };

  const handleToggleSave = () => {
    if (!listing) return;

    const saved = localStorage.getItem('savedProfiles');
    let savedIds = saved ? JSON.parse(saved) : [];

    if (isSaved) {
      savedIds = savedIds.filter((savedId: string) => savedId !== listing.id);
      setIsSaved(false);
    } else {
      savedIds.push(listing.id);
      setIsSaved(true);
    }

    localStorage.setItem('savedProfiles', JSON.stringify(savedIds));
  };

  const handleToggleConnect = () => {
    if (!listing) return;

    const connections = localStorage.getItem('connections');
    let connectedIds = connections ? JSON.parse(connections) : [];

    if (isConnected) {
      connectedIds = connectedIds.filter((connectedId: string) => connectedId !== listing.id);
      setIsConnected(false);
    } else {
      connectedIds.push(listing.id);
      setIsConnected(true);
    }

    localStorage.setItem('connections', JSON.stringify(connectedIds));
  };

  const getProfileStatusLabel = (status?: string) => {
    switch (status) {
      case 'available-for-hire':
        return 'Available for Hire';
      case 'actively-hiring':
        return 'Actively Hiring';
      case 'community-only':
        return 'Just here for the Community';
      default:
        return null;
    }
  };

  const getProfileStatusColor = (status?: string) => {
    switch (status) {
      case 'available-for-hire':
        return 'bg-success text-white';
      case 'actively-hiring':
        return 'bg-primary text-primary-foreground';
      case 'community-only':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <Loader2 className="w-12 h-12 mx-auto text-[#A89F91] animate-spin mb-4" />
            <h1 className="text-2xl font-heading font-medium text-foreground">
              Loading profile...
            </h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Profile Not Found
            </h1>
            <Button
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Directory
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user cannot access this profile, show upgrade prompt
  if (!canAccess || viewLimitReached) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="mb-8 text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Directory
            </Button>

            <UpgradePrompt
              feature="Full Profile Access"
              message={viewLimitReached
                ? 'You have reached your monthly profile view limit. Upgrade for unlimited profile searches.'
                : 'Additional profiles are available with a paid participation level.'}
              currentTier={userTier}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = formatNameForDisplay(listing, visibilityRules.canViewFullName);
  const displayPhoto = visibilityRules.canViewPhoto ? listing.profilePhoto : 'https://via.placeholder.com/400x400/e5e5e5/666666?text=Profile';
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : listing.rating.toFixed(1);

  const persistCollection = (key: string, nextValue: unknown) => {
    localStorage.setItem(key, JSON.stringify(nextValue));
  };

  const resetReviewForm = () => {
    setShowReviewModal(false);
    setReviewRating(0);
    setReviewComment('');
    setReviewSubmitting(false);
    setEditingReviewId(null);
  };

  const resetBookingForm = () => {
    setShowBookingModal(false);
    setSelectedDate('');
    setSelectedTime('');
    setBookingType('video');
    setBookingMessage('');
    setBookingName('');
    setBookingEmail('');
    setBookingPhone('');
    setBookingSubmitting(false);
  };

  const resetServiceForm = () => {
    setShowServiceModal(false);
    setSelectedDate('');
    setSelectedTime('');
    setServiceType('');
    setServiceLocation('');
    setServiceMessage('');
    setServiceSubmitting(false);
  };

  const handleSubmitReview = async () => {
    if (!listing || reviewRating === 0) return;

    if (!user) {
      toast.error('Sign in to leave a review', {
        description: 'Reviews are tied to your member account.',
      });
      navigate('/login');
      return;
    }

    setReviewSubmitting(true);

    try {
      const { data: reviewerProfile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle();

      const reviewerName = reviewerProfile?.full_name || user.email?.split('@')[0] || 'Community Member';
      const reviewerRole = reviewerProfile?.role || 'Member';

      if (editingReviewId) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating: reviewRating, comment: reviewComment, updated_at: new Date().toISOString() })
          .eq('id', editingReviewId)
          .eq('reviewer_id', user.id);
        if (error) throw error;

        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReviewId ? { ...r, rating: reviewRating, comment: reviewComment } : r
          )
        );
        toast.success('Review updated');
      } else {
        const { data: inserted, error } = await supabase
          .from('reviews')
          .insert({
            listing_id: listing.id,
            reviewer_id: user.id,
            reviewer_name: reviewerName,
            reviewer_role: reviewerRole,
            rating: reviewRating,
            comment: reviewComment,
            verified: true,
          })
          .select('id, created_at')
          .single();
        if (error) throw error;

        const nextReview: Review = {
          id: inserted?.id || `${listing.id}-${Date.now()}`,
          reviewerId: user.id,
          reviewerName,
          reviewerRole,
          rating: reviewRating,
          date: inserted?.created_at || new Date().toISOString(),
          comment: reviewComment,
          verified: true,
        };
        setReviews((prev) => [nextReview, ...prev]);
        toast.success('Review submitted', {
          description: 'Your feedback has been added to this profile.',
        });
      }
    } catch (err: any) {
      console.error('Review submit failed:', err);
      toast.error('Could not save review', { description: err.message });
    } finally {
      setReviewSubmitting(false);
      resetReviewForm();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('reviewer_id', user.id);
    if (error) {
      toast.error('Could not delete review', { description: error.message });
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    toast.success('Review deleted');
  };

  const handleRespondToReview = async (reviewId: string) => {
    if (!user || !listing?.userId || listing.userId !== user.id) return;
    const text = responseText.trim();
    if (!text) return;

    const { error } = await supabase
      .from('reviews')
      .update({ response: text, response_at: new Date().toISOString() })
      .eq('id', reviewId);
    if (error) {
      toast.error('Could not save response', { description: error.message });
      return;
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, response: text, responseAt: new Date().toISOString() } : r))
    );
    setRespondingToReviewId(null);
    setResponseText('');
    toast.success('Response posted');
  };

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setShowReviewModal(true);
  };

  const getMonthlyNewConversationCount = async (): Promise<number> => {
    if (!user) return 0;
    const { data: myParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    const ids = (myParticipants || []).map(p => p.conversation_id);
    if (ids.length === 0) return 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .in('id', ids)
      .gte('created_at', startOfMonth.toISOString());
    return count || 0;
  };

  const checkNewConversationLimit = async (): Promise<boolean> => {
    if (!user) return false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .maybeSingle();
    const limits = getTierLimits((profile?.tier || 'professional-basic') as PricingTier);
    if (!limits.newConversationLimitMonthly) return true;
    const count = await getMonthlyNewConversationCount();
    if (count >= limits.newConversationLimitMonthly) {
      toast.error(`You have reached your limit of ${limits.newConversationLimitMonthly} new profiles this month.`, {
        description: 'Upgrade to message more profiles.',
      });
      navigate('/upgrade');
      return false;
    }
    return true;
  };

  const sendSiteMessage = async (recipientId: string, content: string) => {
    if (!user) return;
    const { data: myParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    const myConversations = (myParticipants || []).map(p => p.conversation_id);
    let conversationId: string | null = null;

    if (myConversations.length > 0) {
      const { data: match } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', myConversations)
        .maybeSingle();
      if (match) conversationId = match.conversation_id;
    }

    if (!conversationId) {
      const allowed = await checkNewConversationLimit();
      if (!allowed) return;
      const { data: conversation } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();
      if (!conversation) return;
      conversationId = conversation.id;
      await supabase.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: recipientId }
      ]);
    }

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    });
  };

  const handleSubmitInterviewRequest = async () => {
    if (!listing || !bookingName.trim() || !bookingEmail.trim() || !bookingPhone.trim() || !bookingMessage.trim()) return;

    setBookingSubmitting(true);

    const messageBody = [
      `Interview request for ${listing.name}`,
      ``,
      `Booking party: ${bookingName.trim()}`,
      `Email: ${bookingEmail.trim()}`,
      `Phone: ${bookingPhone.trim()}`,
      selectedDate && selectedTime ? `Requested time: ${selectedDate} at ${selectedTime}` : '',
      `Interview type: ${bookingType}`,
      ``,
      bookingMessage.trim()
    ].filter(Boolean).join('\n');

    const recipientId = listing.userId;
    let delivered = false;

    if (recipientId && user) {
      try {
        await sendSiteMessage(recipientId, messageBody);
        delivered = true;
      } catch (error) {
        console.error('Interview message error:', error);
      }
    }

    if (recipientId) {
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: recipientId,
            type: 'message',
            title: `Interview request from ${bookingName.trim()}`,
            message: messageBody,
            link: user ? '/messages' : undefined,
          }),
        });
        delivered = true;
      } catch (error) {
        console.error('Interview notification error:', error);
      }
    }

    // Keep a local copy for the dashboard requests list
    const existing = JSON.parse(localStorage.getItem('profile_interview_requests') || '[]');
    const nextRequest = {
      id: `${listing.id}-${Date.now()}`,
      profileId: listing.id,
      profileName: listing.name,
      requesterName: bookingName.trim(),
      requesterEmail: bookingEmail.trim(),
      requesterPhone: bookingPhone.trim(),
      requestedDate: selectedDate,
      requestedTime: selectedTime,
      interviewType: bookingType,
      message: bookingMessage.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    persistCollection('profile_interview_requests', [nextRequest, ...existing]);

    // Open Google Calendar so the requester can book a 30-minute Meet slot
    const professionalEmail = listing.email || listing.businessEmail || '';
    const eventTitle = encodeURIComponent(`Interview with ${listing.name}`);
    const eventDetails = encodeURIComponent(
      `Interview requested via Summerland Estates for ${listing.name}.\n\n` +
      `Requested by: ${bookingName.trim()} (${bookingEmail.trim()}, ${bookingPhone.trim()})\n\n` +
      `Profile: ${window.location.href}\n\nAdd a Google Meet video call when creating the event.`
    );
    const addParam = professionalEmail ? `&add=${encodeURIComponent(professionalEmail)}` : '';
    const durationParam = `&dates=`; // dates chosen in calendar
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=Google Meet${addParam}${durationParam}`,
      '_blank',
      'noopener,noreferrer'
    );

    toast.success('Interview request sent', {
      description: delivered
        ? `${listing.name} has been notified. Finish booking a 30-minute slot in Google Calendar.`
        : 'Request saved. Finish booking a 30-minute slot in Google Calendar.',
    });

    resetBookingForm();
  };

  const handleSubmitServiceRequest = () => {
    if (!listing || !selectedDate || !selectedTime) return;

    setServiceSubmitting(true);

    const existing = JSON.parse(localStorage.getItem('profile_service_requests') || '[]');
    const nextRequest = {
      id: `${listing.id}-${Date.now()}`,
      profileId: listing.id,
      profileName: listing.name,
      requestedDate: selectedDate,
      requestedTime: selectedTime,
      serviceType: serviceType || 'general',
      location: serviceLocation.trim(),
      message: serviceMessage.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    persistCollection('profile_service_requests', [nextRequest, ...existing]);

    toast.success('Service request sent', {
      description: `Your request for ${selectedDate} has been saved for follow-up.`,
    });

    resetServiceForm();
  };

  const profileSchema = listing ? {
    '@context': 'https://schema.org',
    '@type': listing.category === 'Business' ? 'LocalBusiness' : 'Person',
    name: listing.name,
    description: listing.bio || listing.role,
    image: listing.profilePhoto,
    jobTitle: listing.role,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.location,
      addressCountry: 'US',
    },
    url: `https://summerlandestates.com/profile/${listing.slug || listing.id}`,
  } : undefined;

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title={listing ? `${listing.name} - ${listing.role} | Summerland Estates` : 'Profile | Summerland Estates'}
        description={listing ? `${listing.name} is a ${listing.role} based in ${listing.location}. ${listing.bio || ''}`.slice(0, 160) : ''}
        canonical={`/profile/${listing.slug || slug}`}
        ogImage={listing?.profilePhoto}
        schema={profileSchema}
      />
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Directory
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Profile Card (right column on desktop, like LinkedIn) */}
            <div className="lg:col-span-1 lg:order-2">
              <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
                <div className="relative mb-6">
                  <img
                    src={displayPhoto}
                    alt={displayName}
                    className="w-full aspect-square object-cover rounded-xl"
                    loading="lazy"
                  />
                  {listing.isOnlineNow && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Online Now
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-heading font-bold text-foreground">
                        {displayName}
                      </h1>
                      {listing.verified && (
                        <div className="relative group">
                          <BadgeCheck className="w-6 h-6 text-[#A89F91] fill-[#A89F91]/20" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Verified
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xl text-muted-foreground">{listing.role}</p>
                    {!listing.isOnlineNow && listing.lastOnline && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Last online: {new Date(listing.lastOnline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground"
                    >
                      {listing.category}
                    </Badge>
                    {listing.profileStatus && (
                      <Badge className={getProfileStatusColor(listing.profileStatus)}>
                        {getProfileStatusLabel(listing.profileStatus)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-foreground">
                    <Star className="w-5 h-5 mr-2 fill-accent text-accent" />
                    <span className="font-semibold">{averageRating}</span>
                    <span className="text-muted-foreground ml-1">/5.0</span>
                  </div>

                  {visibilityRules.canViewLocation && (
                    <MapLocationLink
                      location={listing.location}
                      className="text-foreground"
                      iconClassName="w-5 h-5 mr-2 text-accent"
                    />
                  )}

                  {listing.category !== 'Business' && (
                    <div className="flex items-center text-foreground">
                      <Calendar className="w-5 h-5 mr-2 text-accent" />
                      <span>{listing.experienceYears} years experience</span>
                    </div>
                  )}

                  {listing.availability && (
                    <Badge className="bg-success text-white">
                      Available Now
                    </Badge>
                  )}

                  {listing.category === 'Business' && listing.businessWebsite && visibilityRules.canViewContactInfo && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center text-sm text-foreground">
                        <span className="w-4 h-4 mr-2 text-accent">🌐</span>
                        <a href={listing.businessWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  {/* Professionals can message for free, others need to upgrade */}
                  {(userTier === 'professional-free' || visibilityRules.canSendMessage) ? (
                    <Button
                      onClick={handleSendMessage}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/pricing')}
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Upgrade to Message
                    </Button>
                  )}
                  
                  {/* Request Interview button for Professionals */}
                  {listing.category === 'Staff' && (
                    <Button
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent/10"
                      onClick={() => {
                        if (!visibilityRules.canViewFullProfile) {
                          navigate('/pricing');
                          return;
                        }
                        setShowBookingModal(true);
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Request Interview
                    </Button>
                  )}

                  {/* Book Service button for Business/Service Providers */}
                  {listing.category === 'Business' && (
                    <Button
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent/10"
                      onClick={() => {
                        if (!visibilityRules.canViewFullProfile) {
                          navigate('/pricing');
                        } else {
                          setShowServiceModal(true);
                        }
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Service
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Share'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted"
                      onClick={() => setShowReviewModal(true)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      className={isSaved ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}
                      onClick={handleToggleSave}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant={isConnected ? "default" : "outline"}
                      className={isConnected ? "bg-secondary text-secondary-foreground" : "border-border text-foreground hover:bg-muted"}
                      onClick={handleToggleConnect}
                    >
                      <UserPlus className={`w-4 h-4 mr-2 ${isConnected ? 'fill-current' : ''}`} />
                      {isConnected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <ReportButton
                      targetType="profile"
                      targetId={listing.slug || listing.id}
                      targetLabel={listing.name}
                      className="border-border text-muted-foreground hover:bg-muted"
                    />
                    <BlockUserButton
                      targetUserId={listing.userId}
                      targetListingId={listing.id}
                      targetLabel={listing.name}
                    />
                  </div>
                </div>
              </Card>

              {/* Sponsored Content */}
              <div className="mt-6">
                <NativeAd position="profile_sidebar" />
              </div>
            </div>

            {/* Main Content - Profile Details (left column on desktop) */}
            <div className="lg:col-span-2 lg:order-1">
              {!visibilityRules.canViewDetailedInfo ? (
                <UpgradePrompt
                  feature="Full Profile Details"
                  message="Full profile information is available with a paid participation level."
                  currentTier={userTier}
                />
              ) : (
                <div className="space-y-6">
                  <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                      About
                    </h2>
                    <p className="text-foreground leading-relaxed text-sm">{listing.bio}</p>
                    
                    {listing.hourlyRate && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold text-foreground mb-2">Rate</h3>
                        <p className="text-lg font-semibold text-primary">{listing.hourlyRate}</p>
                      </div>
                    )}
                  </Card>

                  {listing.languages && listing.languages.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                        Languages
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.languages.map((language, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-[#A89F91]/10 text-[#A89F91] border border-[#A89F91]/20"
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {listing.workHistory && listing.workHistory.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                        Work History
                      </h2>
                      <div className="space-y-6">
                        {listing.workHistory.map((job, index) => (
                          <div key={index} className="border-l-3 border-[#A89F91] pl-4">
                            <h3 className="text-base font-heading font-semibold text-foreground">
                              {job.jobTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.city} • {job.startDate} - {job.endDate}
                            </p>
                            <ul className="space-y-1">
                              {job.duties.map((duty, dutyIndex) => (
                                <li key={dutyIndex} className="text-foreground text-sm flex items-start">
                                  <span className="mr-2 text-[#A89F91]">•</span>
                                  <span>{duty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {listing.technicalSkills && listing.technicalSkills.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                        Technical Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.technicalSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {listing.certifications && listing.certifications.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-4 pb-3 border-b border-gray-100">
                        Certifications
                      </h2>
                      <ul className="space-y-3 text-sm">
                        {listing.certifications.map((cert, index) => (
                          <li key={index} className="flex items-start text-foreground">
                            <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Profile Analytics - Show for own profile or premium users */}
                  {(currentUserId === listing.userId || (userTier as string) === 'premium' || (userTier as string) === 'platinum') && (
                    <ProfileAnalytics
                      isPremium={(userTier as string) === 'premium' || (userTier as string) === 'platinum'}
                      userId={listing.id || ''}
                    />
                  )}

                  {/* Service Calendar - Show for Service Provider accounts */}
                  {listing?.category === 'Business' && (
                    <ServiceCalendar
                      userId={listing.id || ''}
                      isOwner={currentUserId === listing.userId}
                    />
                  )}

                  {reviews && reviews.length > 0 && (
                    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-heading font-bold text-foreground">
                          Reviews
                        </h2>
                        <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                          Premium
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {reviews.map((review) => {
                          const isOwnReview = !!user && review.reviewerId === user.id;
                          const isProfileOwner = !!user && !!listing.userId && listing.userId === user.id;
                          return (
                          <div key={review.id} className="border-l-2 border-primary pl-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground text-sm">{review.reviewerName}</h3>
                                  {review.verified && (
                                    <CheckCircle className="w-3 h-3 text-success" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{review.reviewerRole}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating
                                        ? 'fill-accent text-accent'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-foreground text-sm leading-relaxed">{review.comment}</p>

                            {review.response && (
                              <div className="mt-3 ml-2 rounded-lg bg-[#FAFAF8] border border-border p-3">
                                <p className="text-xs font-medium text-foreground mb-1">
                                  Response from {listing.name}
                                </p>
                                <p className="text-sm text-muted-foreground">{review.response}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              {isOwnReview && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditReview(review)}
                                    className="text-xs text-[#A89F91] hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {isProfileOwner && !review.response && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRespondingToReviewId(review.id);
                                    setResponseText('');
                                  }}
                                  className="text-xs text-[#A89F91] hover:underline"
                                >
                                  Respond
                                </button>
                              )}
                              {isProfileOwner && review.response && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRespondingToReviewId(review.id);
                                    setResponseText(review.response || '');
                                  }}
                                  className="text-xs text-[#A89F91] hover:underline"
                                >
                                  Edit Response
                                </button>
                              )}
                              {!isOwnReview && user && (
                                <ReportButton
                                  targetType="review"
                                  targetId={review.id}
                                  targetLabel={`Review by ${review.reviewerName}`}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 px-2 text-muted-foreground hover:text-foreground"
                                />
                              )}
                            </div>

                            {respondingToReviewId === review.id && (
                              <div className="mt-3 ml-2">
                                <textarea
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder="Write your response..."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#A89F91] resize-none"
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setRespondingToReviewId(null);
                                      setResponseText('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                                    onClick={() => handleRespondToReview(review.id)}
                                    disabled={!responseText.trim()}
                                  >
                                    Post Response
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4 text-center">
              {editingReviewId ? 'Edit Your Review' : 'Leave a Review'}
            </h3>
            <p className="text-muted-foreground mb-6">
              How would you rate {listing?.name}?
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= reviewRating
                        ? 'fill-[#A89F91] text-[#A89F91]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Review Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share a few words about your experience..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetReviewForm}
                disabled={reviewSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#A89F91] hover:bg-[#8A8279] text-white"
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || reviewSubmitting}
              >
                {reviewSubmitting ? 'Saving...' : editingReviewId ? 'Save Changes' : 'Submit Review'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Book Interview Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 bg-card">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2 text-center">
              Request Interview
            </h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Send a booking request to {listing?.name}, then reserve a 30-minute slot in Google Calendar
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Date (Optional)</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Time (Optional)</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                >
                  <option value="">Choose a time slot</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Interview Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interviewType"
                      value="video"
                      checked={bookingType === 'video'}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="text-[#A89F91]"
                    />
                    <span className="text-sm text-foreground">Video Call</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interviewType"
                      value="phone"
                      checked={bookingType === 'phone'}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="text-[#A89F91]"
                    />
                    <span className="text-sm text-foreground">Phone Call</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interviewType"
                      value="inperson"
                      checked={bookingType === 'inperson'}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="text-[#A89F91]"
                    />
                    <span className="text-sm text-foreground">In Person</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Tell them about the role or what you'd like to discuss..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetBookingForm}
                disabled={bookingSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#A89F91] hover:bg-[#8A8279] text-white"
                onClick={handleSubmitInterviewRequest}
                disabled={!bookingName.trim() || !bookingEmail.trim() || !bookingPhone.trim() || !bookingMessage.trim() || bookingSubmitting}
              >
                {bookingSubmitting ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Book Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 bg-card">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2 text-center">
              Book Service
            </h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Schedule a service with {listing?.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                >
                  <option value="">Select a service</option>
                  <option value="consultation">Consultation</option>
                  <option value="estimate">Free Estimate</option>
                  <option value="one-time">One-Time Service</option>
                  <option value="recurring">Recurring Service</option>
                  <option value="emergency">Emergency Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preferred Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                >
                  <option value="">Choose a time slot</option>
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Service Location</label>
                <input
                  type="text"
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description of Service Needed</label>
                <textarea
                  value={serviceMessage}
                  onChange={(e) => setServiceMessage(e.target.value)}
                  placeholder="Describe what you need help with..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A89F91] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetServiceForm}
                disabled={serviceSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#A89F91] hover:bg-[#8A8279] text-white"
                onClick={handleSubmitServiceRequest}
                disabled={!selectedDate || !selectedTime || !serviceType || serviceSubmitting}
              >
                {serviceSubmitting ? 'Sending...' : 'Request Service'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
