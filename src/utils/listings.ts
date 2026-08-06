import { supabase } from '@/lib/supabase';
import type { Listing, Review, WorkHistory, Reference, Service, SocialLinks } from '../types';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(name: string, id: string): string {
  const base = slugify(name || 'listing');
  const shortId = id.replace(/-/g, '').slice(0, 8);
  return `${base}-${shortId}`;
}

function mapSocialLinks(raw: any): SocialLinks | undefined {
  if (!raw) return undefined;
  try {
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw as SocialLinks;
  } catch {
    return undefined;
  }
}

function mapArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function mapListingFromRow(row: any, index: number = 0): Listing {
  const skills = (row.skills || []).map((s: any) => s.skill_name).filter(Boolean);
  const workHistory: WorkHistory[] = (row.work_history || []).map((wh: any) => ({
    jobTitle: wh.job_title || '',
    city: wh.city || '',
    duties: wh.duties || [],
    startDate: wh.start_date || '',
    endDate: wh.end_date || ''
  }));
  const certifications = (row.certifications || []).map((c: any) => c.certification_name).filter(Boolean);
  const reviews: Review[] = (row.reviews || []).map((r: any) => ({
    id: r.id,
    reviewerName: r.reviewer_name,
    reviewerRole: r.reviewer_role,
    rating: r.rating,
    date: r.created_at,
    comment: r.comment,
    verified: r.verified
  }));
  const servicesOffered: Service[] = (row.services || []).map((s: any) => ({
    name: s.service_name,
    description: s.description,
    price: s.price,
    duration: s.duration
  }));

  return {
    id: row.id,
    slug: row.slug || generateUniqueSlug(row.name, row.id),
    userId: row.user_id,
    profilePhoto: row.profile_photo || '',
    name: row.name || '',
    gender: (row.gender || 'other') as 'male' | 'female' | 'other',
    role: row.role || '',
    location: row.location || '',
    experienceYears: row.experience_years || 0,
    rating: row.rating ? parseFloat(row.rating) : 0,
    category: (row.category || 'Staff') as Listing['category'],
    accountType: (row.account_type || 'professional') as any,
    estatesRole: (row.estates_role || undefined) as any,
    availability: row.availability !== false,
    verified: row.verified === true,
    bio: row.bio || row.individual_bio || row.agency_bio || '',
    profileStatus: (row.profile_status || 'available-for-hire') as any,
    hideDetailedInfo: row.hide_detailed_info === true,
    isOnlineNow: row.is_online_now === true,
    lastOnline: row.last_online,
    canReceiveMessages: row.chat_enabled !== false,
    hourlyRate: row.hourly_rate,
    languages: mapArray(row.languages),
    previousJobTitles: mapArray(row.previous_job_titles),
    workHistory,
    references: (row.references || []) as Reference[],
    portfolioLink: row.portfolio_link || row.business_website || row.agency_website,
    socialLinks: mapSocialLinks(row.social_links),
    workSchedule: mapArray(row.hours_available),
    technicalSkills: skills,
    socialSkills: mapArray(row.social_skills),
    hobbies: mapArray(row.hobbies),
    certifications,
    willingToRelocate: row.willing_to_relocate === true,
    willingToTravel: row.willing_to_travel === true,
    hasCarAndInsurance: row.has_car_and_insurance === true,
    willingToWorkWithKids: row.willing_to_work_with_kids === true,
    willingToWorkWithAnimals: row.willing_to_work_with_animals === true,
    willingToStayOvernight: row.willing_to_stay_overnight === true,
    willingToLiveOnSite: row.willing_to_live_on_site === true,
    hasValidDriversLicense: row.has_valid_drivers_license === true,
    willingToBackgroundCheck: row.willing_to_background_check !== false,
    willingToDrugTest: row.willing_to_drug_test !== false,
    backgroundCheckAvailable: row.willing_to_background_check === true,
    benefitExpectations: mapArray(row.benefit_expectations),
    profilePhotos: mapArray(row.profile_photos).length > 0 ? mapArray(row.profile_photos) : (row.profile_photo ? [row.profile_photo] : []),
    videoUrl: row.video_url,
    resumeUrl: row.resume_url,
    recommendationLetters: mapArray(row.recommendation_letters),
    servicesOffered,
    reviews,
    systemsUsed: mapArray(row.systems_used),
    businessWebsite: row.business_website,
    businessEmail: row.business_email,
    businessPhone: row.business_phone,
    businessAddress: row.business_address,
    bookingEnabled: row.booking_enabled === true,
    depositRequired: row.deposit_required === true,
    depositAmount: row.deposit_amount,
    invoicingEnabled: row.invoicing_enabled === true,
    paymentTerms: row.payment_terms,
    agencyWebsite: row.agency_website,
    agencyBio: row.agency_bio,
    individualBio: row.individual_bio,
    yearsInIndustry: row.years_in_industry,
    responseExpectations: row.response_expectations,
    hoursAvailable: row.hours_available,
    photoHidden: row.photo_hidden === true,
    pricingTier: row.pricing_tier,
    approved: row.approved !== false,
    priorityListing: false,
    featuredOnHomepage: false,
    bookingCalendarEnabled: row.booking_enabled === true,
    availableTimeSlots: []
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      skills(skill_name),
      work_history(job_title, city, duties, start_date, end_date),
      certifications(certification_name),
      reviews(id, reviewer_name, reviewer_role, rating, comment, verified, created_at),
      services(service_name, description, price, duration)
    `)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }

  return (data || []).map((row, index) => mapListingFromRow(row, index));
}

export async function fetchListingBySlug(slug: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      skills(skill_name),
      work_history(job_title, city, duties, start_date, end_date),
      certifications(certification_name),
      reviews(id, reviewer_name, reviewer_role, rating, comment, verified, created_at),
      services(service_name, description, price, duration)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching listing by slug:', error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data ? mapListingFromRow(data) : null;
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      skills(skill_name),
      work_history(job_title, city, duties, start_date, end_date),
      certifications(certification_name),
      reviews(id, reviewer_name, reviewer_role, rating, comment, verified, created_at),
      services(service_name, description, price, duration)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching listing by id:', error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data ? mapListingFromRow(data) : null;
}
