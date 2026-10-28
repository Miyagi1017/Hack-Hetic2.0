import { ItineraryStep } from '../types/travel';
import { estimateTravel, haversineKm } from './geo';

/**
 * Recalcule les temps de trajet entre les étapes d'une journée.
 * La première étape conserve son trajet d'approche (hôtel → première activité).
 */
export const recalculateStepsRoute = (steps: ItineraryStep[]): ItineraryStep[] => {
  return steps.map((step, index) => {
    if (index === 0) return step;

    const from = steps[index - 1].activity;
    const to = step.activity;

    if (
      typeof from.lat !== 'number' ||
      typeof from.lng !== 'number' ||
      typeof to.lat !== 'number' ||
      typeof to.lng !== 'number'
    ) {
      return step;
    }

    const km = haversineKm([from.lat, from.lng], [to.lat, to.lng]);
    return { ...step, travel: estimateTravel(km) };
  });
};
