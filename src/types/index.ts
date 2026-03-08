export interface WorkHistory {
  jobTitle: string;
  city: string;
  duties: string[];
  startDate: string;
  endDate: string;
}

export interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface Service {
  name: string;
  description: string;
  price: string;
  duration?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discount: string;
  expiryDate: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export type HireStatus = 'none' | 'pending-confirmation' | 'confirmed' | 'not-hired' | 'disputed';

export interface HireConfirmation {
  id: string;
  conversationId: string;
  initiatedBy: string;
  initiatedDate: string;
  hireOccurred: boolean;
  hiredProfileId?: string;
  startDate?: string;
  status: HireStatus;
  secondPartyResponse?: {
    respondedBy: string;
    respondedDate: string;
    confirmed: boolean;
    disputed: boolean;
    disputeReason?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: ConversationMessage[];
  createdDate: string;
  lastMessageDate: string;
  hireStatus: HireStatus;
  hireConfirmation?: HireConfirmation;
  hasWorkIntent: boolean;
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  sentDate: string;
  read: boolean;
}

export interface Message {
  id: string;
  subject: string;
  body: string;
  sentDate: string;
  recipientIds: string[];
  senderName: string;
  senderEmail: string;
}

export interface ServiceRequest {
  id: string;
  serviceNeeded: string;
  location: string;
  dateNeeded: string;
  details: string;
  specialRequests?: string;
  postedBy: string;
  postedDate: string;
  status: 'active' | 'expired' | 'filled';
}

export interface Bid {
  id: string;
  serviceRequestId: string;
  bidderId: string;
  bidderName: string;
  quoteAmount: string;
  message: string;
  submittedDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  salaryRange: string;
  employmentType: string[];
  daysRequired: string[];
  hoursPerWeek: string;
  hoursPerDay?: string;
  startTime?: string;
  endTime?: string;
  scheduleNotes?: string;
  weekendWork?: boolean;
  eveningWork?: boolean;
  overnightStays?: boolean;
  onCallAvailability?: boolean;
  dateNeeded: string;
  postedBy: string;
  postedDate: string;
  status: 'active' | 'expired' | 'filled';
}

export interface UserManual {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
}

export type ProfileStatus = 'available-for-hire' | 'actively-hiring' | 'community-only';

export type AccountType = 'professional' | 'estates';

export type EstatesRole = 'estate-manager' | 'chief-of-staff' | 'personal-assistant' | 'executive-assistant' | 'principal';

export type UserType = 'professional' | 'business' | 'agency' | 'estates';

export type PricingTier = 
  | 'professional-basic' 
  | 'professional-pro'
  | 'professional-free' 
  | 'professional-premium'
  | 'professional-community'
  | 'business-free'
  | 'business-basic'
  | 'business-pro'
  | 'business-multi'
  | 'business-enterprise'
  | 'agency-free'
  | 'agency-basic'
  | 'agency-hiring'
  | 'agency-pro'
  | 'agency-community'
  | 'estates-free'
  | 'estates-basic'
  | 'estates-hiring'
  | 'estates-pro'
  | 'estates-community';

export interface PricingPlan {
  id: PricingTier;
  name: string;
  price: string;
  period?: string;
  features: string[];
  userType: UserType;
}

export interface Listing {
  id: string;
  profilePhoto: string;
  name: string;
  role: string;
  location: string;
  experienceYears: number;
  rating: number;
  category: 'Staff' | 'Vendor' | 'Business' | 'Agency' | 'Estates';
  accountType?: AccountType;
  estatesRole?: EstatesRole;
  availability: boolean;
  verified: boolean;
  bio: string;
  skills?: string[];
  experience?: string[];
  
  profileStatus?: ProfileStatus;
  hideDetailedInfo?: boolean;
  
  isOnlineNow?: boolean;
  lastOnline?: string;

  
  hourlyRate?: string;
  languages?: string[];
  
  previousJobTitles?: string[];
  workHistory?: WorkHistory[];
  
  references?: Reference[];
  portfolioLink?: string;
  socialLinks?: SocialLinks;
  
  workSchedule?: string[];
  technicalSkills?: string[];
  socialSkills?: string[];
  hobbies?: string[];
  certifications?: string[];
  
  willingToRelocate?: boolean;
  willingToTravel?: boolean;
  hasCarAndInsurance?: boolean;
  willingToWorkWithKids?: boolean;
  willingToWorkWithAnimals?: boolean;
  willingToStayOvernight?: boolean;
  willingToLiveOnSite?: boolean;
  hasValidDriversLicense?: boolean;
  willingToBackgroundCheck?: boolean;
  willingToDrugTest?: boolean;
  
  benefitExpectations?: string[];
  
  profilePhotos?: string[];
  videoUrl?: string;
  resumeUrl?: string;
  recommendationLetters?: string[];
  
  systemsUsed?: string[];
  
  reviews?: Review[];
  
  businessWebsite?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessHours?: BusinessHours[];
  servicesOffered?: Service[];
  coverageAreas?: string[];
  coupons?: Coupon[];
  bookingEnabled?: boolean;
  depositRequired?: boolean;
  depositAmount?: string;
  invoicingEnabled?: boolean;
  paymentTerms?: string;
  chatEnabled?: boolean;
  userManuals?: UserManual[];
  
  title?: string;
  agencyWebsite?: string;
  agencyBio?: string;
  individualBio?: string;
  yearsInIndustry?: number;
  primaryMarkets?: string[];
  responseExpectations?: string;
  hoursAvailable?: string;
  
  photoHidden?: boolean;
  
  canReceiveMessages?: boolean;
  
  pricingTier?: PricingTier;
  
  // Gender for title formatting
  gender?: 'male' | 'female' | 'other';
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  location: string;
  availableNow: boolean;
  verifiedOnly: boolean;
  profileStatus: string;
  // Advanced filters from requirements
  title?: string;
  serviceType?: string;
  gender?: string;
  language?: string;
  workAvailability?: string;
  hasBackgroundCheck?: boolean;
  willingDrugTest?: boolean;
  certifications?: string[];
  comfortWith?: string[];
  hasCar?: boolean;
  yearsExperience?: string;
  personalityType?: string;
  cookingLevel?: string;
}

export interface NotificationPreferences {
  newJobPostings: {
    email: boolean;
    sms: boolean;
  };
  messageReceived: {
    email: boolean;
    sms: boolean;
  };
  profileViewed: {
    email: boolean;
    sms: boolean;
  };
  forumTopics: {
    email: boolean;
    sms: boolean;
  };
  subscribedTopics: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  savedProfiles: string[];
  notificationPreferences: NotificationPreferences;
  savedLocations?: string[];
  pricingTier?: PricingTier;
  userType?: UserType;
  profileViewCount?: number;
}

export interface ComparisonData {
  profiles: Listing[];
  similarities: string[];
  differences: { [key: string]: string[] };
  pros: { [key: string]: string[] };
  cons: { [key: string]: string[] };
}

export type OnboardingType = 'professional' | 'service-provider' | 'agency' | 'estates';

export interface OnboardingStep {
  id: number;
  title: string;
  content: string;
  subContent?: string;
  note?: string;
  buttonText?: string;
}

export interface ApplicationFormData {
  userType: UserType;
  selectedTier: PricingTier;
  name: string;
  email: string;
  phone: string;
  location: string;
  role?: string;
  bio?: string;
  experienceYears?: number;
  hourlyRate?: string;
  [key: string]: any;
}
