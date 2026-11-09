import type { Listing, PricingTier } from '../types';

export interface VisibilityRules {
  canViewFullName: boolean;
  canViewPhoto: boolean;
  canViewLocation: boolean;
  canViewBio: boolean;
  canViewContactInfo: boolean;
  canViewDetailedInfo: boolean;
  canSendMessage: boolean;
  canViewFullProfile: boolean;
}

export function getVisibilityRules(
  _userTier: PricingTier | undefined,
  _isPublicView: boolean = false
): VisibilityRules {
  // All profiles are fully public — every plan (and logged-out visitors) sees
  // names, photos, locations, bios and contact information.
  return {
    canViewFullName: true,
    canViewPhoto: true,
    canViewLocation: true,
    canViewBio: true,
    canViewContactInfo: true,
    canViewDetailedInfo: true,
    canSendMessage: true,
    canViewFullProfile: true
  };
}

export function formatNameForDisplay(
  listing: Listing,
  canViewFullName: boolean
): string {
  if (canViewFullName) {
    return listing.name;
  }

  // Extract last name
  const nameParts = listing.name.split(' ');
  const lastName = nameParts[nameParts.length - 1];
  
  // Determine title based on gender
  const title = listing.gender === 'female' ? 'Ms.' : 'Mr.';
  
  return `${title} ${lastName}`;
}

export function shouldBlurProfile(
  _profileIndex: number,
  _userTier: PricingTier | undefined,
  _isPublicView: boolean = false
): boolean {
  // Profiles are never blurred — the directory is fully public.
  return false;
}

export function canAccessProfile(
  _userTier: PricingTier | undefined,
  _profileIndex: number,
  _isPublicView: boolean = false
): boolean {
  return true;
}

export function getProfileAccessMessage(
  userTier: PricingTier | undefined
): string {
  if (!userTier || userTier.includes('free')) {
    return 'Additional profiles are available with a paid participation level.';
  }

  return 'This feature is not available in your current participation level.';
}
