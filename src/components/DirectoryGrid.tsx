import { useNavigate } from 'react-router-dom';
import ListingCard from './ListingCard';
import BlurredProfileCard from './BlurredProfileCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MapPin, Star, BadgeCheck, Shield, Users } from 'lucide-react';
import { shouldBlurProfile, canAccessProfile, getVisibilityRules } from '@/utils/profileVisibility';
import type { Listing, PricingTier } from '../types';

interface DirectoryGridProps {
  listings: Listing[];
  viewMode: 'grid' | 'list';
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedForComparison?: string[];
  onToggleSelection?: (id: string) => void;
  onCardClick?: (id: string, e?: React.MouseEvent) => void;
  userTier?: PricingTier;
  isPublicView?: boolean;
}

export default function DirectoryGrid({
  listings,
  viewMode,
  currentPage,
  totalPages,
  onPageChange,
  selectedForComparison = [],
  onToggleSelection,
  onCardClick,
  userTier,
  isPublicView = false
}: DirectoryGridProps) {
  const navigate = useNavigate();

  const handleCardClick = (id: string, index: number, e?: React.MouseEvent) => {
    // Check if user can access this profile
    if (!canAccessProfile(userTier, index, isPublicView)) {
      navigate('/pricing');
      return;
    }

    if (onCardClick) {
      onCardClick(id, e);
    } else {
      navigate(`/profile/${id}`);
    }
  };

  const visibilityRules = getVisibilityRules(userTier, isPublicView);

  if (listings.length === 0) {
    return (
      <div className="directory-grid text-center py-16">
        <p className="text-xl text-muted-foreground">
          No listings found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="directory-grid">
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {listings.map((listing, index) => {
          const isBlurred = shouldBlurProfile(index, userTier, isPublicView);
          
          if (isBlurred) {
            return <BlurredProfileCard key={`blurred-${index}`} viewMode={viewMode} />;
          }

          return (
            <Card
              key={listing.id}
              className={`bg-card cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border relative ${
                listing.priorityListing ? 'border-[#A89F91] border-2' : ''
              }`}
              onClick={(e) => handleCardClick(listing.id, index, e)}
            >
              {viewMode === 'grid' ? (
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 rounded-full bg-[#A89F91]/20 flex items-center justify-center mb-4 overflow-hidden">
                      {listing.profilePhoto ? (
                        <img src={listing.profilePhoto} alt={listing.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-12 h-12 text-[#A89F91]" />
                      )}
                      {listing.isOnlineNow && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-heading font-semibold text-foreground">{listing.name}</h3>
                      {listing.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#A89F91]" />
                      )}
                      {listing.backgroundCheckAvailable && (
                        <Shield className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{listing.role}</p>
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-xs font-medium">{listing.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{listing.experienceYears} yrs exp</span>
                    </div>
                    {listing.availability && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        Available Now
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-[#A89F91]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {listing.profilePhoto ? (
                      <img src={listing.profilePhoto} alt={listing.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-[#A89F91]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-heading font-semibold text-foreground truncate">{listing.name}</h3>
                      {listing.verified && <BadgeCheck className="w-4 h-4 text-[#A89F91] flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{listing.role}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => onPageChange(page)}
                className={
                  currentPage === page
                    ? 'bg-[#A89F91] text-white hover:bg-[#B45309]'
                    : 'border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white'
                }
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-300"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
