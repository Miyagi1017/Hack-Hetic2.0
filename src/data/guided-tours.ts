import { Activity } from '../types/travel';
import { CURATED_PHOTO_SPOTS } from './mock-data';

/** Supplément guide francophone ajouté au prix d'entrée. */
export const GUIDED_TOUR_SUPPLEMENT = 18;

export const guidedTourPrice = (activity: Activity): number =>
  Math.max(activity.price, 0) + GUIDED_TOUR_SUPPLEMENT;

const tokens = (value: string): string[] =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3);

/** Vrai si le lieu figure parmi les spots photo « instagrammables » de la ville. */
export const isInstagrammable = (activity: Activity): boolean => {
  const activityTokens = tokens(activity.name);
  return CURATED_PHOTO_SPOTS.some((spot) => {
    const spotTokens = tokens(spot.locationName);
    return spotTokens.some((word) => activityTokens.includes(word));
  });
};

export const guidedTourProvider = 'GetYourGuide';

export const guidedTourReference = (activity: Activity): string =>
  `GYG-${activity.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}-${new Date()
    .getFullYear()
    .toString()
    .slice(-2)}`;
