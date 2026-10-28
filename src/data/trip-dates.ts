/* ------------------------------------------------------------------
   Dates du séjour
   Petits utilitaires partagés par le planificateur, la modale de dates
   et la page budget pour garder des libellés cohérents.
   ------------------------------------------------------------------ */

import { ItineraryStep, Trip } from '../types/travel';

const FR_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const parseIsoDate = (iso: string): Date => new Date(`${iso}T12:00:00`);

export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDaysIso = (iso: string, offset: number): string => {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + offset);
  return toIsoDate(date);
};

export const todayIso = (): string => toIsoDate(new Date());

/** « 14 - 17 Novembre 2026 » (même mois) ou « 28 Novembre - 2 Décembre 2026 ». */
export const formatTripDates = (startDate: string, daysCount: number): string => {
  const start = parseIsoDate(startDate);
  if (Number.isNaN(start.getTime())) return '';

  const safeDays = Math.max(1, daysCount);
  const end = parseIsoDate(addDaysIso(startDate, safeDays - 1));
  const monthStart = capitalize(FR_MONTHS[start.getMonth()]);
  const monthEnd = capitalize(FR_MONTHS[end.getMonth()]);
  const year = end.getFullYear();

  if (safeDays === 1) {
    return `${start.getDate()} ${monthStart} ${year}`;
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${end.getDate()} ${monthEnd} ${year}`;
  }

  return `${start.getDate()} ${monthStart} - ${end.getDate()} ${monthEnd} ${year}`;
};

export const formatDuration = (daysCount: number): string =>
  `${daysCount} jour${daysCount > 1 ? 's' : ''}`;

/** « Du samedi 14 novembre au lundi 17 novembre 2026 ». */
export const formatDateRangeLong = (startDate: string, daysCount: number): string => {
  const start = parseIsoDate(startDate);
  if (Number.isNaN(start.getTime())) return '';
  const end = parseIsoDate(addDaysIso(startDate, Math.max(1, daysCount) - 1));

  if (daysCount <= 1) {
    return capitalize(
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(start)
    );
  }

  const startLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(start);

  const endLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(end);

  return `Du ${startLabel} au ${endLabel}`;
};

/** « samedi 14 novembre 2026 » — pour la pastille du jour affiché. */
export const formatDayLong = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (Number.isNaN(date.getTime())) return '';
  return capitalize(
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  );
};

export interface StoredTripDates {
  startDate: string;
  daysCount: number;
  travelers?: number;
}

export const MIN_TRIP_DAYS = 1;
export const MAX_TRIP_DAYS = 21;
export const MIN_TRAVELERS = 1;
export const MAX_TRAVELERS = 12;

export const clampDaysCount = (days: number): number =>
  Math.max(MIN_TRIP_DAYS, Math.min(MAX_TRIP_DAYS, Math.round(days)));

export const clampTravelers = (travelers: number): number =>
  Math.max(MIN_TRAVELERS, Math.min(MAX_TRAVELERS, Math.round(travelers)));

/**
 * Applique de nouvelles dates à un séjour : durée, libellés, journées
 * ajoutées (clonées depuis la dernière journée connue) et postes fixes
 * (hébergement / restauration) recalculés au prorata.
 */
export const applyDatesToTrip = (
  trip: Trip,
  startDate: string,
  daysCount: number,
  travelers?: number
): Trip => {
  if (!startDate) return trip;

  const nextDays = clampDaysCount(daysCount);
  const previousDays = Math.max(1, trip.daysCount);
  const nextTravelers =
    typeof travelers === 'number' && Number.isFinite(travelers)
      ? clampTravelers(travelers)
      : Math.max(1, trip.travelers);

  const steps: Record<number, ItineraryStep[]> = {};
  for (let day = 1; day <= nextDays; day += 1) {
    steps[day] = trip.steps[day] ? [...trip.steps[day]] : [];
  }

  const templateDay = Object.keys(trip.steps)
    .map(Number)
    .filter((day) => (trip.steps[day] ?? []).length > 0)
    .sort((a, b) => b - a)[0];

  if (templateDay) {
    const template = trip.steps[templateDay] ?? [];
    for (let day = 1; day <= nextDays; day += 1) {
      if (steps[day].length > 0) continue;
      steps[day] = template.map((step, index) => ({
        ...step,
        conflict: undefined,
        activity: {
          ...step.activity,
          id: `${step.activity.id}-j${day}-${index}`,
          isConfirmed: false,
        },
      }));
    }
  }

  const budgetBreakdown = trip.budgetBreakdown
    ? {
        ...trip.budgetBreakdown,
        lodging: Math.round((trip.budgetBreakdown.lodging / previousDays) * nextDays),
        food: Math.round((trip.budgetBreakdown.food / previousDays) * nextDays),
      }
    : trip.budgetBreakdown;

  return {
    ...trip,
    startDate,
    daysCount: nextDays,
    travelers: nextTravelers,
    duration: formatDuration(nextDays),
    dates: formatTripDates(startDate, nextDays),
    budgetBreakdown,
    steps,
  };
};

/* ------------------------------------------------------------------
   Mémorisation des dates par utilisateur et par voyage
   ------------------------------------------------------------------ */

export const datesStorageKey = (tripId: string, email: string): string =>
  `odyssee:dates:${email}:${tripId}`;

export const readStoredTripDates = (
  tripId: string,
  email: string
): StoredTripDates | null => {
  try {
    const raw = window.localStorage.getItem(datesStorageKey(tripId, email));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<StoredTripDates>;
    if (typeof candidate.startDate !== 'string' || !candidate.startDate) return null;
    if (typeof candidate.daysCount !== 'number' || !Number.isFinite(candidate.daysCount)) return null;
    return {
      startDate: candidate.startDate,
      daysCount: clampDaysCount(candidate.daysCount),
      travelers:
        typeof candidate.travelers === 'number' && Number.isFinite(candidate.travelers)
          ? clampTravelers(candidate.travelers)
          : undefined,
    };
  } catch {
    return null;
  }
};

export const writeStoredTripDates = (
  tripId: string,
  email: string,
  dates: StoredTripDates
): void => {
  try {
    window.localStorage.setItem(datesStorageKey(tripId, email), JSON.stringify(dates));
  } catch {
    // Stockage indisponible : les dates restent en mémoire.
  }
};

