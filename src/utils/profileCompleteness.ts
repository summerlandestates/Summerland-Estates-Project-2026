export interface CompletenessResult {
  percent: number;
  complete: string[];
  missing: string[];
}

const hasValue = (v: any): boolean => {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
};

const pick = (data: any, keys: string[]): any => {
  for (const k of keys) {
    if (hasValue(data?.[k])) return data[k];
  }
  return undefined;
};

export function computeProfileCompleteness(profile: any): CompletenessResult {
  const data = profile?.application_data || {};
  const checks: { label: string; present: boolean }[] = [
    {
      label: 'Photo',
      present: hasValue(
        pick(data, ['profile_photo', 'photo', 'photo_url', 'avatar_url', 'headshot', 'logo', 'image'])
      ),
    },
    {
      label: 'Bio',
      present: hasValue(pick(data, ['bio', 'about', 'description', 'agency_bio', 'individual_bio'])),
    },
    {
      label: 'Location',
      present: hasValue(pick(data, ['location', 'city', 'address', 'formatted_address'])),
    },
    {
      label: 'Services',
      present: hasValue(
        pick(data, ['services', 'service_types', 'services_offered', 'title', 'job_title', 'role'])
      ),
    },
    {
      label: 'Experience',
      present: hasValue(
        pick(data, ['experience', 'years_experience', 'work_history', 'previous_jobs'])
      ),
    },
    {
      label: 'Certifications',
      present: hasValue(pick(data, ['certifications', 'licenses', 'credentials'])),
    },
    {
      label: 'Availability',
      present: hasValue(
        pick(data, ['availability', 'work_availability', 'schedule', 'hours_available'])
      ),
    },
    {
      label: 'Portfolio',
      present: hasValue(
        pick(data, ['portfolio', 'portfolio_link', 'website', 'business_website', 'video_url'])
      ),
    },
  ];

  const done = checks.filter((c) => c.present).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    complete: checks.filter((c) => c.present).map((c) => c.label),
    missing: checks.filter((c) => !c.present).map((c) => c.label),
  };
}
