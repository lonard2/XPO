/**
 * Per-venue hall wing assignments for the campus explorer.
 *
 * The previous keyword heuristic bucketed every venue into the same generic wings
 * ("East & Primary Wing (16)"), which mislabeled real campuses. Each venue below uses
 * its own vocabulary; matchers run first-match-wins against the lowercased hall name.
 * A matcher starting with "=" requires an exact match (needed for numbered halls such
 * as NICE "Exhibition Hall 10", where a substring would also hit "Hall 1").
 *
 * Labels are either dictionary keys (venues.wing.*) for generic words or literals for
 * proper designations (Building A, Festhalle, Agora) that do not translate.
 */

export interface VenueWingRule {
  id: string;
  /** Dictionary key under the venues namespace; when absent the literal is used. */
  labelKey?: string;
  literal?: string;
  match: string[];
}

function matches(rule: VenueWingRule, lowerName: string): boolean {
  return rule.match.some((pattern) => {
    if (pattern.startsWith('=')) {
      return lowerName === pattern.slice(1).toLowerCase();
    }
    return lowerName.includes(pattern.toLowerCase());
  });
}

/** Exported for the explorer: does this rule claim this (already lowercased) hall name? */
export function ruleMatches(rule: VenueWingRule, lowerName: string): boolean {
  return matches(rule, lowerName);
}

export const VENUE_WINGS: Record<string, VenueWingRule[]> = {
  'jiexpo-kemayoran': [
    { id: 'east', labelKey: 'wingEast', match: ['=hall a', '=hall d1', '=hall d2'] },
    { id: 'west', labelKey: 'wingWest', match: ['=hall b', '=hall c', '=hall b3', '=hall c3'] },
    { id: 'convention', labelKey: 'wingConventionTheatre', match: ['ballroom', 'theatre', 'meeting room', 'semeru', 'lawu', 'bromo', 'kerinci', 'rinjani'] },
    { id: 'outdoor', labelKey: 'wingOutdoorSpecial', match: ['open space', 'gambir', 'new hall', 'parking'] },
  ],
  'ice-bsd-city': [
    { id: 'exhibition', labelKey: 'wingExhibition', match: ['exhibition hall'] },
    { id: 'nusantara', literal: 'Nusantara Hall', match: ['nusantara', 'garuda', 'cendana', 'kalimaya', 'convention'] },
    { id: 'outdoor', labelKey: 'wingOutdoor', match: ['outdoor'] },
  ],
  'jcc-senayan': [
    { id: 'ceremonial', labelKey: 'wingCeremonial', match: ['plenary', 'assembly', 'cendrawasih'] },
    { id: 'exhibition', labelKey: 'wingExhibition', match: ['exhibition hall'] },
    { id: 'lobby', labelKey: 'wingLobby', match: ['lobby', 'lounge', 'outdoor', 'merak', 'nuri', 'maleo', 'murai', 'kenari', 'kakatua', 'summit'] },
  ],
  'nice-pik-2': [
    { id: 'building-a', literal: 'Building A', match: ['=exhibition hall 1', '=exhibition hall 2', '=exhibition hall 3', '=exhibition hall 3a'] },
    { id: 'building-b', literal: 'Building B', match: ['=exhibition hall 5', '=exhibition hall 6', '=exhibition hall 7', '=exhibition hall 8'] },
    { id: 'building-c', literal: 'Building C', match: ['=exhibition hall 9', '=exhibition hall 10', '=exhibition hall 11'] },
    { id: 'convention', labelKey: 'wingConventionOutdoor', match: ['sriwijaya', 'nakula', 'sadewa', 'courtyard', 'plaza', 'atrium', 'lobby'] },
  ],
  'gbk-sports-complex': [
    { id: 'stadiums', labelKey: 'wingStadiums', match: ['stadion utama', 'madya', 'aquatic'] },
    { id: 'arenas', labelKey: 'wingArenas', match: ['indonesia arena', 'istora', 'tennis indoor', 'basketball', 'gedung serbaguna', 'gbk arena'] },
    { id: 'fields', labelKey: 'wingFields', match: ['tennis outdoor', 'center court', 'baseball', 'softball', 'hockey', 'archery', 'squash', 'plaza', 'festival'] },
  ],
  'jis-jakarta': [
    { id: 'stadium', labelKey: 'wingStadium', match: ['bowl', 'tribune', 'premium', 'vvip', 'royal', 'corporate', 'press', 'box'] },
    { id: 'grounds', labelKey: 'wingGrounds', match: ['sky view', 'training', 'plaza', 'ramp', 'outdoor', 'deck'] },
  ],
  'tokyo-big-sight': [
    { id: 'east', labelKey: 'wingEast', match: ['east exhibition hall', 'east link'] },
    { id: 'west', labelKey: 'wingWest', match: ['west exhibition hall', 'west atrium', 'west rooftop', 'west outdoor'] },
    { id: 'south', labelKey: 'wingSouth', match: ['south exhibition hall'] },
    { id: 'tower', labelKey: 'wingTower', match: ['reception hall', 'conference room', 'international conference', 'vip room'] },
    { id: 'satellite', literal: 'Ariake GYM-EX', match: ['gym-ex', 'ariake'] },
  ],
  'makuhari-messe': [
    { id: 'halls-1-8', literal: 'Exhibition Halls 1–8', match: ['=exhibition hall 1', '=exhibition hall 2', '=exhibition hall 3', '=exhibition hall 4', '=exhibition hall 5', '=exhibition hall 6', '=exhibition hall 7', '=exhibition hall 8'] },
    { id: 'halls-9-11', literal: 'Exhibition Halls 9–11', match: ['=exhibition hall 9', '=exhibition hall 10', '=exhibition hall 11'] },
    { id: 'conference', labelKey: 'wingConference', match: ['convention hall', 'international conference', 'conference room', 'vip reception', 'support rooms'] },
    { id: 'event-hall', literal: 'Makuhari Event Hall', match: ['event hall'] },
  ],
  'pacifico-yokohama': [
    { id: 'exhibition', labelKey: 'wingExhibition', match: ['exhibition hall a', 'exhibition hall b', 'exhibition hall c', 'exhibition hall d', 'marine lobby'] },
    { id: 'national', literal: 'National Convention Hall', match: ['national convention'] },
    { id: 'conference', labelKey: 'wingConference', match: ['conference center main hall', 'conference room'] },
    { id: 'annex', literal: 'Annex Hall', match: ['annex', 'f201', 'f202', 'f203', 'f204', 'f205', 'f206'] },
    { id: 'north', literal: 'Pacifico Yokohama North', match: ['north'] },
  ],
  'marina-bay-sands-expo': [
    { id: 'expo', labelKey: 'wingExhibition', match: ['exhibition hall'] },
    { id: 'ballrooms', labelKey: 'wingBallrooms', match: ['ballroom', 'jasmine', 'hibiscus', 'heliconia', 'cassia', 'orchid', 'peony', 'melati', 'roselle', 'sands a', 'sands b', 'begonia', 'angsana', 'saraca', 'lotus', 'junior'] },
    { id: 'theatre', labelKey: 'wingTheatreSkypark', match: ['theatre', 'skypark', 'south garden'] },
    { id: 'outdoor', labelKey: 'wingOutdoor', match: ['event plaza'] },
  ],
  'messe-frankfurt': [
    { id: 'exhibition', labelKey: 'wingExhibition', match: ['exhibition hall', 'galleria', 'portalhaus'] },
    { id: 'festhalle', literal: 'Festhalle', match: ['festhalle'] },
    { id: 'forum', labelKey: 'wingForum', match: ['forum'] },
    { id: 'congress', labelKey: 'wingCongress', match: ['congress', 'harmonie', 'kap europa', 'horizont', 'meridian', 'plateau', 'breakout', 'spektrum'] },
    { id: 'agora', literal: 'Agora', match: ['agora'] },
  ],
  'excel-london': [
    { id: 'event', labelKey: 'wingExhibition', match: ['event halls', 'hall module'] },
    { id: 'icc', labelKey: 'wingICC', match: ['icc auditorium', 'capital hall', 'capital suite', 'capital lounge', 'platinum', 'gallery', 'prince regent', 'london suite'] },
    { id: 'maritime', labelKey: 'wingMaritime', match: ['maritime', 'victoria', 'george', 'connaught', 'greenwich', 'albert', 'trinity', 'thames'] },
    { id: 'centred', literal: 'CentrEd', match: ['centred'] },
    { id: 'leisure', literal: 'Immerse LDN & Waterfront', match: ['immerse', 'waterfront', 'event square'] },
  ],
};

/** Legacy generic buckets, kept as the fallback for venues without rules. */
export const FALLBACK_WINGS: VenueWingRule[] = [
  { id: 'main', labelKey: 'wingExhibition', match: [] },
  { id: 'east', labelKey: 'wingEast', match: ['east', 'hall a', 'hall 1', 'hall 2', 'hall 3'] },
  { id: 'west', labelKey: 'wingWest', match: ['west', 'hall b', 'hall 5', 'hall 6', 'hall 7'] },
  { id: 'convention', labelKey: 'wingConvention', match: ['plenary', 'nusantara', 'convention', 'ballroom', 'tower'] },
];

export function wingRulesFor(venueSlug: string | undefined | null): VenueWingRule[] {
  if (venueSlug) {
    const rules = VENUE_WINGS[venueSlug.toLowerCase()];
    if (rules) return rules;
  }
  return FALLBACK_WINGS;
}

/** First-match-wins wing id for a hall, or null when nothing matches. */
export function assignWing(venueSlug: string | undefined | null, hallName: string): string | null {
  const lower = hallName.toLowerCase();
  for (const rule of wingRulesFor(venueSlug)) {
    if (rule.match.length > 0 && matches(rule, lower)) return rule.id;
  }
  return null;
}

/** How many rules claim a hall: exactly one is the healthy state the tests assert. */
export function matchingWingCount(venueSlug: string | undefined | null, hallName: string): number {
  const lower = hallName.toLowerCase();
  return wingRulesFor(venueSlug).filter((rule) => rule.match.length > 0 && matches(rule, lower)).length;
}
