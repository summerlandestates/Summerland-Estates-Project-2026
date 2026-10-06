import { describe, it, expect } from 'vitest';
import { computeProfileCompleteness } from './profileCompleteness';

describe('computeProfileCompleteness', () => {
  it('returns 0% for an empty profile', () => {
    const r = computeProfileCompleteness({});
    expect(r.percent).toBe(0);
    expect(r.missing).toHaveLength(8);
  });

  it('returns 0% for a null profile', () => {
    expect(computeProfileCompleteness(null).percent).toBe(0);
  });

  it('returns 100% when all sections are present', () => {
    const r = computeProfileCompleteness({
      application_data: {
        photo: 'x.jpg',
        bio: 'Hello',
        location: 'Charlotte',
        services: ['Cleaning'],
        experience: '5 years',
        certifications: ['CPR'],
        availability: 'Weekdays',
        portfolio: 'https://example.com',
      },
    });
    expect(r.percent).toBe(100);
    expect(r.missing).toHaveLength(0);
    expect(r.complete).toHaveLength(8);
  });

  it('counts partial profiles correctly', () => {
    const r = computeProfileCompleteness({
      application_data: { bio: 'Hi', location: 'NYC' },
    });
    expect(r.percent).toBe(25);
    expect(r.complete).toEqual(['Bio', 'Location']);
    expect(r.missing).toContain('Photo');
    expect(r.missing).toContain('Services');
  });

  it('accepts alternative field names', () => {
    const r = computeProfileCompleteness({
      application_data: {
        avatar_url: 'x.png',
        about: 'About me',
        city: 'LA',
        service_types: ['Tutoring'],
        years_experience: 10,
        licenses: ['License A'],
        schedule: 'Full time',
        website: 'https://x.com',
      },
    });
    expect(r.percent).toBe(100);
  });

  it('ignores empty strings and empty arrays', () => {
    const r = computeProfileCompleteness({
      application_data: { bio: '   ', services: [] },
    });
    expect(r.percent).toBe(0);
  });
});
