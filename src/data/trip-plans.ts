import { AVAILABLE_DESTINATIONS } from './mock-data';

export interface TripPlan {
  id: string;
  destinationId: string;
  createdAt: string;
}

const storageKey = (email: string) => `odyssee:plans:${email}`;

const makeId = (destinationId: string) =>
  `plan-${destinationId.replace('dest-', '')}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

export const readTripPlans = (email: string): TripPlan[] => {
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (plan): plan is TripPlan =>
        !!plan &&
        typeof plan.id === 'string' &&
        typeof plan.destinationId === 'string' &&
        AVAILABLE_DESTINATIONS.some((destination) => destination.id === plan.destinationId)
    );
  } catch {
    return [];
  }
};

export const writeTripPlans = (email: string, plans: TripPlan[]) => {
  try {
    window.localStorage.setItem(storageKey(email), JSON.stringify(plans));
  } catch {
    // Stockage indisponible : la liste reste en mémoire.
  }
};

/** Trois destinations tirées au hasard pour proposer des séjours prévus. */
export const createRandomTripPlans = (count = 3): TripPlan[] => {
  const shuffled = [...AVAILABLE_DESTINATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((destination) => ({
    id: makeId(destination.id),
    destinationId: destination.id,
    createdAt: new Date().toISOString(),
  }));
};

export const createTripPlan = (destinationId: string): TripPlan | null => {
  if (!AVAILABLE_DESTINATIONS.some((destination) => destination.id === destinationId)) {
    return null;
  }
  return {
    id: makeId(destinationId),
    destinationId,
    createdAt: new Date().toISOString(),
  };
};
