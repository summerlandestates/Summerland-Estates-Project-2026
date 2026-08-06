import type { PricingTier, UserType } from '../types';

export interface TierLimits {
  canViewPlacements: boolean;
  placementViewLimit?: number;
  canMessage: boolean;
  messageLimit?: number;
  messageLimitPerProfile?: number;
  canInterview: boolean;
  interviewLimit?: number;
  canPostRoles: boolean;
  rolePostLimit?: number;
  canPostServiceRequests: boolean;
  serviceRequestLimit?: number;
  canAccessCommunity: boolean;
  canReceiveNotifications: boolean;
  canUseBookingTool: boolean;
  canBidOnRequests: boolean;
  bidLimit?: number;
  canUseComparisons: boolean;
  canViewFullProfiles: boolean;
  canApplyToRoles?: boolean;
  applicationLimit?: number;
  canAddArticles?: boolean;
  articleLimit?: number;
  profilePhotoLimit: number;
  canUploadVideo: boolean;
  canAccessVerificationCredits: boolean;
  multiLocationSupport: boolean;
}

export function getTierLimits(tier: PricingTier): TierLimits {
  switch (tier) {
    // Professional Tiers
    case 'professional-basic':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: true,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: true,
        bidLimit: 2,
        canUseComparisons: false,
        canViewFullProfiles: false,
        canApplyToRoles: true,
        applicationLimit: 5,
        canAddArticles: false,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'professional-pro':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: true,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: true,
        canBidOnRequests: true,
        canUseComparisons: true,
        canViewFullProfiles: true,
        canApplyToRoles: true,
        canAddArticles: true,
        articleLimit: 5,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'professional-free':
      return {
        canViewPlacements: true,
        placementViewLimit: 1,
        canMessage: true,
        messageLimit: 1,
        messageLimitPerProfile: 2,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 1,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };
    
    case 'professional-premium':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: true,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: true,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'professional-community':
      return {
        canViewPlacements: false,
        canMessage: false,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 1,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    // Business Tiers
    case 'business-free':
      return {
        canViewPlacements: true,
        placementViewLimit: 1,
        canMessage: true,
        messageLimit: 1,
        messageLimitPerProfile: 2,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 1,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'business-pro':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: true,
        canBidOnRequests: true,
        canUseComparisons: false,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'business-multi':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: true,
        canBidOnRequests: true,
        canUseComparisons: false,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: true
      };

    // Agency Tiers
    case 'agency-free':
      return {
        canViewPlacements: true,
        canMessage: false,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 1,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'agency-basic':
      return {
        canViewPlacements: true,
        placementViewLimit: 6,
        canMessage: true,
        messageLimit: 3,
        canInterview: true,
        interviewLimit: 3,
        canPostRoles: true,
        rolePostLimit: 1,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'agency-hiring':
      return {
        canViewPlacements: true,
        canMessage: true,
        messageLimit: 12,
        canInterview: true,
        interviewLimit: 12,
        canPostRoles: true,
        rolePostLimit: 4,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: true,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'agency-pro':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: true,
        canPostRoles: true,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: true,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: true,
        multiLocationSupport: false
      };

    // Estates Tiers
    case 'estates-free':
      return {
        canViewPlacements: true,
        canMessage: false,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 1,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'estates-basic':
      return {
        canViewPlacements: true,
        canMessage: true,
        messageLimit: 3,
        canInterview: true,
        interviewLimit: 3,
        canPostRoles: true,
        rolePostLimit: 1,
        canPostServiceRequests: true,
        serviceRequestLimit: 1,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'estates-hiring':
      return {
        canViewPlacements: true,
        canMessage: true,
        messageLimit: 12,
        canInterview: true,
        interviewLimit: 12,
        canPostRoles: true,
        rolePostLimit: 4,
        canPostServiceRequests: true,
        serviceRequestLimit: 4,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: true,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'estates-pro':
      return {
        canViewPlacements: true,
        canMessage: true,
        canInterview: true,
        canPostRoles: true,
        canPostServiceRequests: true,
        canAccessCommunity: true,
        canReceiveNotifications: true,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: true,
        canViewFullProfiles: true,
        profilePhotoLimit: 999,
        canUploadVideo: true,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    case 'agency-community':
    case 'estates-community':
      return {
        canViewPlacements: false,
        canMessage: false,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: true,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 1,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };

    default:
      return {
        canViewPlacements: false,
        canMessage: false,
        canInterview: false,
        canPostRoles: false,
        canPostServiceRequests: false,
        canAccessCommunity: false,
        canReceiveNotifications: false,
        canUseBookingTool: false,
        canBidOnRequests: false,
        canUseComparisons: false,
        canViewFullProfiles: false,
        profilePhotoLimit: 0,
        canUploadVideo: false,
        canAccessVerificationCredits: false,
        multiLocationSupport: false
      };
  }
}

export function checkFeatureAccess(
  tier: PricingTier | undefined,
  feature: keyof TierLimits
): boolean {
  if (!tier) return false;
  const limits = getTierLimits(tier);
  return !!limits[feature];
}

export function getUpgradeMessage(
  currentTier: PricingTier | undefined,
  feature: string
): string {
  return `This feature is not available in your current participation level. Consider upgrading to access ${feature}.`;
}
