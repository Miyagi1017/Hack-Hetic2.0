import { Activity, Trip } from '../types/travel';

/**
 * Contexte budgétaire des activités d'un séjour.
 *
 * Les prix des activités sont exprimés par personne. On compare donc le reste
 * disponible par voyageur aux prix du catalogue pour ne proposer que des
 * étapes réellement finançables par l'enveloppe choisie.
 */
export interface ActivityBudget {
  budgetTotal: number;
  travelers: number;
  days: number;
  /** Hébergement + restauration estimés sur tout le séjour. */
  fixedTotal: number;
  /** Activités déjà inscrites au programme (prix par personne). */
  activitiesTotal: number;
  /** Trajets déjà inscrits au programme. */
  transportTotal: number;
  /** Reste total, éventuellement négatif si le séjour dépasse l'enveloppe. */
  remainingTotal: number;
  /** Reste par voyageur, ramené à 0 quand le budget est dépassé. */
  remainingPerPerson: number;
  /** Enveloppe quotidienne par voyageur, pour situer le rythme. */
  perDayPerPerson: number;
  isOverBudget: boolean;
  /** Nombre d'activités déjà planifiées, utile pour les libellés. */
  plannedActivities: number;
}

export const getActivityBudget = (trip: Trip): ActivityBudget => {
  const days = Math.max(1, trip.daysCount);
  const travelers = Math.max(1, trip.travelers);
  const steps = Object.values(trip.steps).flat();

  const fixedTotal =
    (trip.budgetBreakdown?.lodging ?? 0) + (trip.budgetBreakdown?.food ?? 0);
  const activitiesTotal = steps.reduce(
    (sum, step) => sum + Math.max(0, step.activity.price || 0),
    0
  );
  const transportTotal = steps.reduce((sum, step) => sum + (step.travel?.cost || 0), 0);
  const remainingTotal =
    trip.budgetTotal - fixedTotal - activitiesTotal - transportTotal;

  return {
    budgetTotal: trip.budgetTotal,
    travelers,
    days,
    fixedTotal,
    activitiesTotal,
    transportTotal,
    remainingTotal,
    remainingPerPerson: Math.max(0, remainingTotal / travelers),
    perDayPerPerson: trip.budgetTotal / (days * travelers),
    isOverBudget: remainingTotal < 0,
    plannedActivities: steps.length,
  };
};

/** Une activité tient-elle dans le reste d'enveloppe par voyageur ? */
export const fitsActivityBudget = (
  activity: Activity,
  budget: ActivityBudget
): boolean => Math.max(0, activity.price || 0) <= budget.remainingPerPerson + 0.01;

export const budgetOverage = (
  activity: Activity,
  budget: ActivityBudget
): number => Math.max(0, (activity.price || 0) - budget.remainingPerPerson);

export const formatEuros = (value: number): string =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;
