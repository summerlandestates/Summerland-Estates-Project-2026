import type { Listing, PricingTier } from '../types';
import { getTierLimits } from './tierAccess';

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
  userTier: PricingTier | undefined,
  isPublicView: boolean = false
): VisibilityRules {
  // Public/not logged in
  if (isPublicView || !userTier) {
    return {
      canViewFullName: false,
      canViewPhoto: false,
      canViewLocation: false,
      canViewBio: false,
      canViewContactInfo: false,
      canViewDetailedInfo: false,
      canSendMessage: false,
      canViewFullProfile: false
    };
  }

  const limits = getTierLimits(userTier);

  return {
    canViewFullName: limits.canViewFullProfiles,
    canViewPhoto: limits.canViewFullProfiles,
    canViewLocation: limits.canViewFullProfiles,
    canViewBio: limits.canViewFullProfiles,
    canViewContactInfo: limits.canViewFullProfiles,
    canViewDetailedInfo: limits.canViewFullProfiles,
    canSendMessage: limits.canMessage,
    canViewFullProfile: limits.canViewFullProfiles
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
  profileIndex: number,
  userTier: PricingTier | undefined,
  isPublicView: boolean = false
): boolean {
  // Public or free tier: blur after 2 profiles
  if (isPublicView || !userTier || userTier.includes('free')) {
    return profileIndex >= 2;
  }

  return false;
}

export function canAccessProfile(
  userTier: PricingTier | undefined,
  profileIndex: number,
  isPublicView: boolean = false
): boolean {
  if (isPublicView || !userTier) {
    return profileIndex < 2;
  }

  if (userTier.includes('free')) {
    return profileIndex < 2;
  }

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
