import { ItineraryStep, Trip } from '../types/travel';
import { recalculateStepsRoute } from './route';

export interface BudgetRecalcResult {
  trip: Trip;
  /** Activités retirées car elles ne tenaient plus dans l'enveloppe. */
  removed: number;
  /** Activités conservées. */
  kept: number;
}

/**
 * Recalcule le programme pour tenir dans la nouvelle enveloppe :
 * on conserve les activités dans l'ordre du séjour tant que leur prix cumulé
 * (par personne) reste dans le budget dédié aux activités. Les activités
 * gratuites sont toujours conservées ; les trajets sont recalculés ensuite.
 */
export const recalculateProgramForBudget = (trip: Trip): BudgetRecalcResult => {
  const fixed = (trip.budgetBreakdown?.lodging ?? 0) + (trip.budgetBreakdown?.food ?? 0);
  const transport = Object.values(trip.steps)
    .flat()
    .reduce((sum, step) => sum + (step.travel?.cost || 0), 0);

  const available = Math.max(0, trip.budgetTotal - fixed - transport);

  let spent = 0;
  let removed = 0;
  let kept = 0;

  const days = Object.keys(trip.steps)
    .map(Number)
    .sort((a, b) => a - b);

  const nextSteps: Record<number, ItineraryStep[]> = {};

  for (const day of days) {
    const steps = trip.steps[day] ?? [];
    const filtered = steps.filter((step) => {
      const price = Math.max(0, step.activity.price || 0);
      if (spent + price <= available + 0.01) {
        spent += price;
        kept += 1;
        return true;
      }
      removed += 1;
      return false;
    });

    nextSteps[day] = recalculateStepsRoute(filtered);
  }

  return {
    trip: { ...trip, steps: nextSteps },
    removed,
    kept,
  };
};
