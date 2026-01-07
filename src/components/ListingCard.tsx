import { MapPin, Star, CheckCircle } from 'lucide-react';
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
  const displayPhoto = canViewPhoto ? listing.profilePhoto : 'https://via.placeholder.com/400x400/e5e5e5/666666?text=Profile';

  if (viewMode === 'list') {
    return (
      <Card
        className={`listing-card p-6 bg-card text-card-foreground cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] border relative ${
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
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-success text-white px-2 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
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
                  className="bg-secondary text-secondary-foreground"
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
                  <Badge className="bg-success text-white">Available</Badge>
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
      className={`listing-card bg-card text-card-foreground cursor-pointer overflow-hidden border relative ${
        isSelected ? 'border-primary' : 'border-border/50'
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
      
      <div className="relative">
        <img
          src={displayPhoto}
          alt={displayName}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        {listing.isOnlineNow && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-success text-white px-2 py-1 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Online
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-heading font-bold text-foreground mb-1 truncate">
              {displayName}
            </h3>
            <p className="text-muted-foreground truncate">{listing.role}</p>
          </div>
          {listing.verified && (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-secondary text-secondary-foreground"
          >
            {listing.category}
          </Badge>
          {listing.availability && (
            <Badge className="bg-success text-white">Available</Badge>
          )}
        </div>

        {canViewLocation && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <div className="flex items-center text-foreground">
              <MapPin className="w-4 h-4 mr-1 text-accent" />
              {listing.location}
            </div>
            <div className="flex items-center text-foreground">
              <Star className="w-4 h-4 mr-1 fill-accent text-accent" />
              {listing.rating}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
