import { Activity, ActivityCategory } from '../types/travel';

export interface InterestOption {
  label: string;
  emoji: string;
}

/** Catalogue de centres d'intérêt proposés dans le profil voyageur. */
export const INTEREST_OPTIONS: InterestOption[] = [
  { label: 'Gastronomie locale', emoji: '🍝' },
  { label: 'Histoire & Art', emoji: '🏛️' },
  { label: 'Nature & jardins', emoji: '🌿' },
  { label: 'Insolite & secrets', emoji: '🗝️' },
  { label: 'Photographie', emoji: '📸' },
  { label: 'Vie nocturne', emoji: '🌙' },
  { label: 'Shopping & artisanat', emoji: '🛍️' },
  { label: 'Mobilités douces', emoji: '🚲' },
  { label: 'Bien-être', emoji: '🧘' },
  { label: 'Voyage en famille', emoji: '👨‍👩‍👧' },
];

const INTEREST_TO_CATEGORIES: { pattern: RegExp; categories: ActivityCategory[] }[] = [
  {
    pattern: /gastronomie|restaurant|cuisine|marché|street food|food/i,
    categories: ['Gastronomie'],
  },
  {
    pattern: /histoire|art|musée|patrimoine|culture|architecture/i,
    categories: ['Culture'],
  },
  {
    pattern: /nature|jardin|parc|randonn|paysage|plage|balade/i,
    categories: ['Nature'],
  },
  {
    pattern: /insolite|secret|souterrain|nocturne|bar|club|fête/i,
    categories: ['Insolite'],
  },
  {
    pattern: /photo|panorama|vue|coucher de soleil/i,
    categories: ['Culture', 'Nature', 'Insolite'],
  },
  {
    pattern: /shopping|artisanat|boutique|souvenir/i,
    categories: ['Gastronomie', 'Culture'],
  },
  {
    pattern: /famille|enfant/i,
    categories: ['Culture', 'Nature', 'Gastronomie'],
  },
  {
    pattern: /mobilité|vélo|marche|transport/i,
    categories: ['Nature', 'Culture'],
  },
];

/** Catégories d'activités correspondant aux centres d'intérêt choisis. */
export const categoriesForInterests = (interests: string[]): ActivityCategory[] => {
  const categories = new Set<ActivityCategory>();
  interests.forEach((interest) => {
    INTEREST_TO_CATEGORIES.forEach((rule) => {
      if (rule.pattern.test(interest)) {
        rule.categories.forEach((category) => categories.add(category));
      }
    });
  });
  return Array.from(categories);
};

/**
 * Une activité correspond-elle aux centres d'intérêt ?
 * On combine la catégorie et quelques mots-clés du nom / de la description.
 */
export const activityMatchesInterests = (
  activity: Activity,
  interests: string[]
): boolean => {
  if (interests.length === 0) return true;

  const categories = categoriesForInterests(interests);
  if (categories.includes(activity.category)) return true;

  const haystack = `${activity.name} ${activity.description ?? ''} ${activity.address}`.toLowerCase();
  return interests.some((interest) => {
    const key = interest
      .toLowerCase()
      .replace(/&/g, ' ')
      .replace(/[^a-zà-ÿ0-9\s]/g, ' ')
      .trim();
    if (!key) return false;
    return key
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .some((word) => haystack.includes(word));
  });
};
