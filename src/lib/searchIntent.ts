import { serviceTypeCategories, serviceTypes } from '../data/serviceTypes';
import { professionalTitles } from '../data/profileOptions';
import type { Listing } from '../types';

// Emoji per service catalog group (sophisticated category UX)
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Cleaning & Home Care': '🧹',
  'Landscaping & Outdoor': '🌿',
  'Handyman & Repairs': '🔧',
  'Pet Services': '🐾',
  'Health & Wellness': '🧘',
  'Beauty & Personal Care': '💅',
  'Food & Beverage': '🍽️',
  'Entertainment & Specialty': '🎭',
  'Luxury & Niche Services': '✨',
};

// Keyword → emoji heuristic for individual services. First match wins.
const SERVICE_EMOJI_RULES: [RegExp, string][] = [
  [/baby|newborn|child|kid|nanny|babysit|doula|lactation/, '👶'],
  [/tutor|homework|test prep|teach|school/, '🎓'],
  [/drive|chauffeur|ride|transport|pickup|drop.?off/, '🚗'],
  [/clean|sweep|laundr|iron|maid|junk|declutter|organiz/, '🧹'],
  [/window|pressure wash|roof|gutter/, '🪟'],
  [/lawn|mow|landscap|garden|tree|stump|weed|irrigation|plant|fence|patio|pond/, '🌿'],
  [/pool/, '🏊'],
  [/snow/, '❄️'],
  [/plumb/, '🚿'],
  [/electric/, '💡'],
  [/hvac|air duct|vent/, '🌬️'],
  [/appliance|handyman|repair|assembl|mount|drywall/, '🔧'],
  [/paint/, '🎨'],
  [/floor|tile|grout/, '🧱'],
  [/locksmith/, '🔑'],
  [/dog/, '🐕'],
  [/cat/, '🐈'],
  [/pet/, '🐾'],
  [/aquarium/, '🐠'],
  [/horse|pony/, '🐴'],
  [/reptile|animal|falcon/, '🦎'],
  [/massage/, '💆'],
  [/trainer|fitness/, '💪'],
  [/yoga|pilates|meditat/, '🧘'],
  [/therap|sauna|cryo|iv therapy/, '🩺'],
  [/nutrition/, '🥗'],
  [/sleep/, '😴'],
  [/hair|barber/, '💇'],
  [/makeup/, '💄'],
  [/nail/, '💅'],
  [/lash|brow/, '👁️'],
  [/tattoo|piercing|permanent makeup/, '🖋️'],
  [/teeth/, '🦷'],
  [/tan/, '🌞'],
  [/chef|cook|meal prep/, '👨‍🍳'],
  [/bartend|mixolog|wine|whiskey|sommelier|cigar/, '🍷'],
  [/coffee|tea/, '☕'],
  [/cake/, '🎂'],
  [/charcuterie|cheese/, '🧀'],
  [/magic/, '🎩'],
  [/face paint/, '🎨'],
  [/balloon/, '🎈'],
  [/tarot/, '🔮'],
  [/casino|poker/, '🎰'],
  [/mystery/, '🕵️'],
  [/party|event|birthday|proposal|picnic|glamp/, '🎉'],
  [/dj|karaoke|disco|dancer|music/, '🎶'],
  [/photograph|drone/, '📸'],
  [/movie|film|digitiz|backyard movie/, '🎬'],
  [/christmas|holiday|decorat/, '🎄'],
  [/princess|superhero|character/, '🦸'],
  [/computer|tech|smart home|automation|podcast|recording|voice/, '💻'],
  [/auto|car detail|mechanic|tire|oil change|windshield|rv |boat/, '🚙'],
  [/bicycle|bike/, '🚲'],
  [/watch|clock/, '⌚'],
  [/piano/, '🎹'],
  [/knife|scissor|sharpen/, '🔪'],
  [/leather|shoe|sneaker/, '👟'],
  [/mattress/, '🛏️'],
  [/ice bath/, '🧊'],
  [/shop|stylist|closet/, '👗'],
  [/handbag|luxury|art apprais|estate sale/, '💎'],
  [/genealog|historian/, '📜'],
];

export function getServiceEmoji(service: string): string {
  const lower = service.toLowerCase();
  for (const [re, emoji] of SERVICE_EMOJI_RULES) {
    if (re.test(lower)) return emoji;
  }
  return '✨';
}

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || '✨';
}

// ── Natural-language intent parsing ──────────────────────────────────────

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'by',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'need', 'needs', 'want',
  'wants', 'looking', 'find', 'get', 'someone', 'somebody', 'person',
  'help', 'with', 'who', 'can', 'could', 'would', 'please', 'is', 'are',
  'this', 'that', 'twice', 'once', 'per', 'week', 'weekend', 'weekday',
  'day', 'daily', 'weekly', 'monthly', 'recurring', 'regularly',
]);

// Query word → related terms to also match against (synonym expansion)
const SYNONYMS: Record<string, string[]> = {
  drive: ['driver', 'chauffeur', 'transport', 'ride', 'pickup'],
  driver: ['chauffeur', 'transport', 'drive'],
  ride: ['driver', 'chauffeur', 'transport', 'pickup'],
  pickup: ['driver', 'transport', 'school'],
  chauffeur: ['driver', 'transport'],
  daughter: ['child', 'kid', 'kids', 'children', 'family'],
  son: ['child', 'kid', 'kids', 'children', 'family'],
  kid: ['child', 'children', 'kids', 'family', 'nanny', 'babysitter'],
  kids: ['child', 'children', 'kid', 'family', 'nanny', 'babysitter'],
  child: ['children', 'kids', 'kid', 'nanny', 'babysitter', 'family'],
  children: ['child', 'kids', 'nanny', 'babysitter', 'family'],
  baby: ['newborn', 'nanny', 'babysitter', 'child', 'doula'],
  babysitter: ['nanny', 'child', 'kids'],
  nanny: ['babysitter', 'child', 'kids', 'children'],
  soccer: ['sport', 'sports', 'activity', 'kids'],
  sport: ['sports', 'activity', 'fitness', 'trainer'],
  sports: ['sport', 'activity', 'fitness'],
  piano: ['music', 'instrument', 'tuning'],
  music: ['instrument', 'dj', 'karaoke', 'piano'],
  tutor: ['teacher', 'education', 'homework', 'test prep'],
  teach: ['tutor', 'teacher', 'education'],
  teacher: ['tutor', 'education'],
  math: ['tutor', 'education', 'homework'],
  homework: ['tutor', 'education', 'test prep'],
  clean: ['cleaning', 'housekeeping', 'housekeeper', 'maid'],
  cleaning: ['clean', 'housekeeping', 'housekeeper', 'deep cleaning'],
  housekeeper: ['housekeeping', 'cleaning', 'maid'],
  maid: ['housekeeper', 'cleaning'],
  cook: ['chef', 'meal prep', 'food'],
  chef: ['cook', 'meal prep', 'food', 'private chef'],
  meal: ['chef', 'cook', 'food', 'meal prep'],
  food: ['chef', 'cook', 'meal prep', 'beverage'],
  party: ['event', 'planner', 'entertainment', 'birthday'],
  birthday: ['party', 'event', 'planner'],
  event: ['party', 'planner', 'entertainment'],
  planner: ['event', 'party'],
  move: ['moving', 'furniture', 'junk removal', 'assembly'],
  moving: ['move', 'furniture', 'junk removal'],
  furniture: ['assembly', 'moving', 'handyman'],
  couch: ['furniture', 'moving', 'assembly'],
  dog: ['pet', 'dog walking', 'pet sitting', 'grooming'],
  walk: ['dog walking', 'pet'],
  walker: ['dog walking', 'pet'],
  pet: ['dog', 'cat', 'pet sitting', 'grooming'],
  cat: ['pet', 'grooming'],
  lawn: ['lawn mowing', 'landscaping', 'garden'],
  mow: ['lawn mowing', 'lawn', 'landscaping'],
  garden: ['landscaping', 'garden', 'planting'],
  paint: ['painting', 'interior painting', 'exterior painting'],
  fix: ['repair', 'handyman'],
  repair: ['handyman', 'fix'],
  leak: ['plumbing', 'plumber'],
  plumber: ['plumbing'],
  massage: ['in-home massage', 'wellness'],
  trainer: ['personal trainer', 'fitness'],
  fitness: ['personal trainer', 'trainer', 'yoga', 'pilates'],
  yoga: ['yoga instructor', 'wellness'],
  hair: ['hair stylist', 'barber', 'beauty'],
  haircut: ['barber', 'hair stylist'],
  barber: ['hair stylist', 'hair'],
  makeup: ['makeup artist', 'beauty'],
  nails: ['nail technician', 'beauty'],
  manicure: ['nail technician'],
  photo: ['photographer', 'photography'],
  photographer: ['photography', 'photo'],
  pool: ['pool cleaning', 'pool repair'],
  security: ['security', 'guard'],
  assistant: ['personal assistant', 'executive assistant', 'family assistant'],
  organize: ['organization', 'closet organization', 'garage organization'],
  elder: ['caregiver', 'companion', 'senior'],
  senior: ['caregiver', 'companion', 'tech setup for seniors'],
  mom: ['family', 'mother'],
  elderly: ['caregiver', 'companion', 'senior'],
};

export interface SearchIntent {
  tokens: string[];          // expanded keyword set (query + synonyms)
  matchedServices: string[]; // catalog services relevant to the query
  matchedTitles: string[];   // professional titles relevant to the query
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function parseSearchIntent(query: string): SearchIntent {
  const raw = normalize(query);
  const contentTokens = raw.filter((t) => !STOPWORDS.has(t));

  // Expand with synonyms
  const expanded = new Set(contentTokens);
  for (const token of contentTokens) {
    for (const syn of SYNONYMS[token] || []) {
      expanded.add(syn);
    }
  }
  const tokens = [...expanded];

  const score = (name: string): number => {
    const words = name.toLowerCase();
    let s = 0;
    for (const t of tokens) {
      if (words.includes(t)) s += t.length > 3 ? 2 : 1;
    }
    // Phrase boost: full query appears inside the service name
    if (contentTokens.length > 1 && words.includes(contentTokens.join(' '))) s += 4;
    return s;
  };

  const matchedServices = serviceTypes
    .map((s) => ({ s, score: score(s) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s)
    .slice(0, 8);

  const matchedTitles = professionalTitles
    .map((t) => ({ t, score: score(t) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t)
    .slice(0, 6);

  return { tokens, matchedServices, matchedTitles };
}

function listingHaystack(listing: Listing): string {
  const services = (listing.servicesOffered || [])
    .map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
    .join(' ');
  return [
    listing.name,
    listing.role,
    listing.bio,
    listing.location,
    services,
    (listing.skills || []).join(' '),
    (listing.previousJobTitles || []).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Loose, Google-style matching. Returns a relevance score — 0 means no match.
 * Exact substring matches score highest; otherwise any content-token hit counts.
 */
export function intentScore(listing: Listing, query: string, intent?: SearchIntent): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const hay = listingHaystack(listing);
  if (hay.includes(q)) return 100;

  const parsed = intent || parseSearchIntent(q);
  if (parsed.tokens.length === 0) return 0;

  let score = 0;
  for (const token of parsed.tokens) {
    if (token.length < 3) continue;
    if (hay.includes(token)) score += 1;
  }

  // Boost listings whose role matches a recommended service/title
  const role = listing.role.toLowerCase();
  for (const s of parsed.matchedServices) {
    if (role.includes(s.toLowerCase())) score += 5;
  }
  for (const t of parsed.matchedTitles) {
    if (role.includes(t.toLowerCase())) score += 5;
  }

  return score;
}

export { serviceTypeCategories };
