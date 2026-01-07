import { useNavigate } from 'react-router-dom';
import ListingCard from './ListingCard';
import BlurredProfileCard from './BlurredProfileCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            : 'flex flex-col gap-6'
        }
      >
        {listings.map((listing, index) => {
          const isBlurred = shouldBlurProfile(index, userTier, isPublicView);
          
          if (isBlurred) {
            return <BlurredProfileCard key={`blurred-${index}`} viewMode={viewMode} />;
          }

          return (
            <ListingCard
              key={listing.id}
              listing={listing}
              viewMode={viewMode}
              onClick={(e) => handleCardClick(listing.id, index, e)}
              isSelected={selectedForComparison.includes(listing.id)}
              onToggleSelection={onToggleSelection ? () => onToggleSelection(listing.id) : undefined}
              showCheckbox={!!onToggleSelection}
              canViewFullName={visibilityRules.canViewFullName}
              canViewPhoto={visibilityRules.canViewPhoto}
              canViewLocation={visibilityRules.canViewLocation}
            />
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
            className="border-border text-foreground hover:bg-muted disabled:opacity-50"
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
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border text-foreground hover:bg-muted'
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
            className="border-border text-foreground hover:bg-muted disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
