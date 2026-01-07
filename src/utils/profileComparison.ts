import type { Listing, ComparisonData } from '../types';

export function compareProfiles(profiles: Listing[]): ComparisonData {
  if (profiles.length < 2) {
    return {
      profiles,
      similarities: [],
      differences: {},
      pros: {},
      cons: {}
    };
  }

  const similarities: string[] = [];
  const differences: { [key: string]: string[] } = {};
  const pros: { [key: string]: string[] } = {};
  const cons: { [key: string]: string[] } = {};

  // Check for common attributes
  const allVerified = profiles.every(p => p.verified);
  const allAvailable = profiles.every(p => p.availability);
  const sameCategory = profiles.every(p => p.category === profiles[0].category);

  if (allVerified) similarities.push('All profiles are verified');
  if (allAvailable) similarities.push('All are currently available');
  if (sameCategory) similarities.push(`All are in the ${profiles[0].category} category`);

  // Check for common languages
  const commonLanguages = profiles[0].languages?.filter(lang =>
    profiles.every(p => p.languages?.includes(lang))
  );
  if (commonLanguages && commonLanguages.length > 0) {
    similarities.push(`Common languages: ${commonLanguages.join(', ')}`);
  }

  // Check for common skills
  const commonSkills = profiles[0].technicalSkills?.filter(skill =>
    profiles.every(p => p.technicalSkills?.includes(skill))
  );
  if (commonSkills && commonSkills.length > 0) {
    similarities.push(`Common technical skills: ${commonSkills.join(', ')}`);
  }

  // Check for common systems
  const commonSystems = profiles[0].systemsUsed?.filter(system =>
    profiles.every(p => p.systemsUsed?.includes(system))
  );
  if (commonSystems && commonSystems.length > 0) {
    similarities.push(`Common systems experience: ${commonSystems.join(', ')}`);
  }

  // Analyze each profile
  profiles.forEach((profile, index) => {
    const profileKey = profile.name;
    differences[profileKey] = [];
    pros[profileKey] = [];
    cons[profileKey] = [];

    // Experience
    differences[profileKey].push(`${profile.experienceYears} years of experience`);
    if (profile.experienceYears >= 10) {
      pros[profileKey].push('Extensive experience (10+ years)');
    } else if (profile.experienceYears < 5) {
      cons[profileKey].push('Limited experience (less than 5 years)');
    }

    // Rating
    differences[profileKey].push(`Rating: ${profile.rating}/5.0`);
    if (profile.rating >= 4.8) {
      pros[profileKey].push('Excellent rating (4.8+)');
    } else if (profile.rating < 4.5) {
      cons[profileKey].push('Lower rating (below 4.5)');
    }

    // Location
    differences[profileKey].push(`Location: ${profile.location}`);

    // Rate (if available)
    if (profile.hourlyRate) {
      differences[profileKey].push(`Rate: ${profile.hourlyRate}`);
    }

    // Verification
    if (profile.verified) {
      pros[profileKey].push('Verified profile');
    } else {
      cons[profileKey].push('Not verified');
    }

    // Availability
    if (profile.availability) {
      pros[profileKey].push('Currently available');
    } else {
      cons[profileKey].push('Not currently available');
    }

    // Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      pros[profileKey].push(`${profile.certifications.length} certifications`);
      differences[profileKey].push(`Certifications: ${profile.certifications.slice(0, 2).join(', ')}${profile.certifications.length > 2 ? '...' : ''}`);
    }

    // Languages
    if (profile.languages && profile.languages.length > 2) {
      pros[profileKey].push(`Multilingual (${profile.languages.length} languages)`);
    }

    // Work preferences
    if (profile.willingToRelocate) {
      pros[profileKey].push('Willing to relocate');
    }
    if (profile.willingToTravel) {
      pros[profileKey].push('Willing to travel');
    }
    if (profile.willingToLiveOnSite) {
      pros[profileKey].push('Willing to live on-site');
    }

    // Requirements
    if (profile.hasValidDriversLicense) {
      pros[profileKey].push('Has valid driver\'s license');
    }
    if (profile.hasCarAndInsurance) {
      pros[profileKey].push('Has car and insurance');
    }

    // Reviews
    if (profile.reviews && profile.reviews.length > 0) {
      const avgRating = profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length;
      pros[profileKey].push(`${profile.reviews.length} reviews (avg: ${avgRating.toFixed(1)})`);
    }

    // Business-specific
    if (profile.category === 'Business') {
      if (profile.bookingEnabled) {
        pros[profileKey].push('Online booking available');
      }
      if (profile.invoicingEnabled) {
        pros[profileKey].push('Invoicing system available');
      }
      if (profile.chatEnabled) {
        pros[profileKey].push('Chat feature available');
      }
      if (profile.coupons && profile.coupons.length > 0) {
        pros[profileKey].push(`${profile.coupons.length} active coupon(s)`);
      }
    }

    // Unique skills
    const uniqueSkills = profile.technicalSkills?.filter(skill =>
      !profiles.some((p, i) => i !== index && p.technicalSkills?.includes(skill))
    );
    if (uniqueSkills && uniqueSkills.length > 0) {
      differences[profileKey].push(`Unique skills: ${uniqueSkills.slice(0, 3).join(', ')}`);
    }

    // Systems experience
    if (profile.systemsUsed && profile.systemsUsed.length > 0) {
      differences[profileKey].push(`Systems: ${profile.systemsUsed.slice(0, 3).join(', ')}${profile.systemsUsed.length > 3 ? '...' : ''}`);
    }
  });

  return {
    profiles,
    similarities,
    differences,
    pros,
    cons
  };
}
