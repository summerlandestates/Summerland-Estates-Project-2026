import { MapPin, Star, CheckCircle, BadgeCheck, Shield, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatNameForDisplay } from '@/utils/profileVisibility';
import type { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  viewMode: 'grid' | 'list';
  onClick: (e?: React.MouseEvent) => void;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  showCheckbox?: boolean;
  canViewFullName?: boolean;
  canViewPhoto?: boolean;
  canViewLocation?: boolean;
}

export default function ListingCard({
  listing,
  viewMode,
  onClick,
  isSelected = false,
  onToggleSelection,
  showCheckbox = false,
  canViewFullName = true,
  canViewPhoto = true,
  canViewLocation = true,
}: ListingCardProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection();
    }
  };

  const displayName = formatNameForDisplay(listing, canViewFullName);
  const displayPhoto = canViewPhoto ? listing.profilePhoto : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&size=400&background=D97706&color=fff&bold=true';

  if (viewMode === 'list') {
    return (
      <Card
        className={`listing-card p-6 bg-card text-card-foreground cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border relative ${
          isSelected ? 'border-primary border-2 shadow-lg' : 'border-border'
        }`}
        onClick={onClick}
      >
        {showCheckbox && (
          <div className="comparison-checkbox absolute top-4 left-4 z-10">
            <Checkbox
              checked={isSelected}
              onClick={handleCheckboxClick}
              className="bg-white shadow-md"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-48 h-48 flex-shrink-0">
            <img
              src={displayPhoto}
              alt={displayName}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            {listing.isOnlineNow && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Online
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-1">
                  {displayName}
                </h3>
                <p className="text-lg text-muted-foreground">{listing.role}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  variant="secondary"
                  className="bg-gray-800 text-white hover:bg-gray-900"
                >
                  {listing.category}
                </Badge>
                {listing.verified && (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </div>
            </div>

            {canViewLocation && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center text-foreground">
                  <MapPin className="w-4 h-4 mr-1 text-accent" />
                  {listing.location}
                </div>
                <div className="flex items-center text-foreground">
                  <Star className="w-4 h-4 mr-1 fill-accent text-accent" />
                  {listing.rating}
                </div>
                <div className="text-foreground">
                  {listing.experienceYears} years exp.
                </div>
                {listing.availability && (
                  <Badge className="bg-[#D97706] text-white hover:bg-[#B45309]">Available</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`listing-card bg-white text-card-foreground cursor-pointer overflow-hidden border border-[#e8dfd3] rounded-[20px] relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isSelected ? 'border-primary border-2 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      {showCheckbox && (
        <div className="comparison-checkbox absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onClick={handleCheckboxClick}
            className="bg-white shadow-md"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Circular Profile Photo */}
          <div className="relative w-24 h-24 rounded-full bg-[#A89F91]/20 flex items-center justify-center mb-4 overflow-hidden">
            {displayPhoto ? (
              <img 
                src={displayPhoto} 
                alt={displayName} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            ) : (
              <Users className="w-12 h-12 text-[#A89F91]" />
            )}
            {listing.isOnlineNow && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Name with Verified Badge */}
          <div className="flex items-center gap-1 mb-1">
            <h3 className="font-heading font-semibold text-foreground text-lg">
              {displayName}
            </h3>
            {listing.verified && (
              <BadgeCheck className="w-4 h-4 text-[#A89F91]" />
            )}
            {listing.backgroundCheckAvailable && (
              <Shield className="w-4 h-4 text-green-600" />
            )}
          </div>

          {/* Role */}
          <p className="text-sm text-muted-foreground mb-1">{listing.role}</p>

          {/* Location */}
          {canViewLocation && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              {listing.location}
            </div>
          )}

          {/* Rating and Experience */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-xs font-medium">{listing.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{listing.experienceYears} yrs exp</span>
          </div>

          {/* Available Now Badge */}
          {listing.availability && (
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium uppercase tracking-wider">
              Available Now
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
