import { describe, it, expect } from 'vitest';
import { isMappableLocation } from './MapLocationLink';

describe('isMappableLocation', () => {
  it.each(['Remote', 'Online', 'Virtual', 'N/A', 'TBD', ' remote ', 'ONLINE'])(
    'treats %s as non-mappable',
    (loc) => expect(isMappableLocation(loc)).toBe(false)
  );

  it.each(['Charlotte, NC', '123 Main St', 'New York'])(
    'treats %s as mappable',
    (loc) => expect(isMappableLocation(loc)).toBe(true)
  );

  it('treats empty/null/undefined as non-mappable', () => {
    expect(isMappableLocation('')).toBe(false);
    expect(isMappableLocation('   ')).toBe(false);
    expect(isMappableLocation(null)).toBe(false);
    expect(isMappableLocation(undefined)).toBe(false);
  });
});
