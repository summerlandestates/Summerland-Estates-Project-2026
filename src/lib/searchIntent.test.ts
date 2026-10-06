import { describe, it, expect } from 'vitest';
import { parseSearchIntent, intentScore, getServiceEmoji, getCategoryEmoji } from './searchIntent';
import type { Listing } from '../types';

const makeListing = (over: Partial<Listing>): Listing =>
  ({
    id: '1',
    name: 'Test',
    role: '',
    bio: '',
    location: '',
    servicesOffered: [],
    skills: [],
    previousJobTitles: [],
    ...over,
  } as Listing);

describe('parseSearchIntent', () => {
  it('expands synonyms and strips stopwords', () => {
    const intent = parseSearchIntent('find a math tutor for my kid');
    expect(intent.tokens).toContain('math');
    expect(intent.tokens).toContain('tutor');
    // 'math' should pull in education/homework synonyms
    expect(intent.tokens.some((t) => ['tutor', 'education', 'homework'].includes(t))).toBe(true);
    // stopwords excluded
    expect(intent.tokens).not.toContain('my');
    expect(intent.tokens).not.toContain('a');
  });

  it('matches catalog services for "someone to pick my kids up from school"', () => {
    const intent = parseSearchIntent('someone to pick my kids up from school');
    expect(intent.matchedServices.length).toBeGreaterThan(0);
    expect(intent.matchedServices.join(' ').toLowerCase()).toMatch(
      /school|pickup|transport|nanny|babysit/
    );
  });

  it('recommends party services for "birthday party planner"', () => {
    const intent = parseSearchIntent('I need a birthday party planner');
    expect(intent.matchedServices.join(' ').toLowerCase()).toMatch(/party|event|birthday/);
  });

  it('recommends dog services for "dog walker this weekend"', () => {
    const intent = parseSearchIntent('dog walker this weekend');
    expect(intent.matchedServices.join(' ').toLowerCase()).toMatch(/dog|pet/);
  });

  it('recommends cleaning for "someone to clean my house"', () => {
    const intent = parseSearchIntent('someone to clean my house');
    expect(intent.matchedServices.join(' ').toLowerCase()).toMatch(/clean|housekeep|maid/);
  });

  it('recommends moving services for "move a couch upstairs"', () => {
    const intent = parseSearchIntent('move a couch upstairs');
    expect(intent.matchedServices.join(' ').toLowerCase()).toMatch(/mov|furniture|junk|assembl/);
  });

  it('recommends fitness services for "find a personal trainer"', () => {
    const intent = parseSearchIntent('find a personal trainer');
    expect(intent.matchedServices.join(' ').toLowerCase()).toMatch(/trainer|fitness/);
  });

  it('returns empty matches for gibberish', () => {
    const intent = parseSearchIntent('zxqwv plmnko');
    expect(intent.matchedServices).toHaveLength(0);
  });

  it('returns no tokens for an all-stopword query', () => {
    const intent = parseSearchIntent('I need someone for my this that');
    expect(intent.tokens).toHaveLength(0);
  });
});

describe('intentScore', () => {
  it('gives every listing a pass-through score for empty queries', () => {
    expect(intentScore(makeListing({}), '')).toBe(1);
    expect(intentScore(makeListing({}), '   ')).toBe(1);
  });

  it('scores exact substring matches highest', () => {
    const l = makeListing({ role: 'Personal Trainer', bio: 'Certified coach' });
    expect(intentScore(l, 'personal trainer')).toBe(100);
  });

  it('scores listings via synonym expansion', () => {
    const nanny = makeListing({ role: 'Nanny', bio: 'Experienced childcare provider' });
    const plumber = makeListing({ role: 'Plumber', bio: 'Fixes pipes' });
    expect(intentScore(nanny, 'someone to watch my kids')).toBeGreaterThan(0);
    expect(intentScore(plumber, 'someone to watch my kids')).toBe(0);
  });

  it('boosts listings whose role matches a recommended service', () => {
    const trainer = makeListing({ role: 'Certified Personal Trainer' });
    const chef = makeListing({ role: 'Private Chef' });
    expect(intentScore(trainer, 'find a personal trainer')).toBeGreaterThan(
      intentScore(chef, 'find a personal trainer')
    );
  });

  it('matches against services, skills and previous job titles', () => {
    const l = makeListing({
      role: 'Caregiver',
      servicesOffered: [{ name: 'Dog Walking', description: '', price: '' }],
      skills: ['meal prep'],
      previousJobTitles: ['Math Tutor'],
    });
    expect(intentScore(l, 'dog walker')).toBeGreaterThan(0);
    expect(intentScore(l, 'math tutor')).toBeGreaterThan(0);
  });
});

describe('emoji helpers', () => {
  it('maps known services to emojis', () => {
    expect(getServiceEmoji('Dog Walking')).toBe('🐕');
    expect(getServiceEmoji('House Cleaning')).toBe('🧹');
    expect(getServiceEmoji('Private Chef')).toBe('👨‍🍳');
  });

  it('falls back to sparkles for unknown services', () => {
    expect(getServiceEmoji('Quantum Candle Sniffer')).toBe('✨');
  });

  it('maps catalog categories and falls back for unknown', () => {
    expect(getCategoryEmoji('Pet Services')).toBe('🐾');
    expect(getCategoryEmoji('Cleaning & Home Care')).toBe('🧹');
    expect(getCategoryEmoji('Nonexistent Category')).toBe('✨');
  });
});
