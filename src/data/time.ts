/**
 * Gestion des horaires sans limite : une activité peut démarrer à n'importe
 * quelle heure, y compris après minuit (24:00 à 29:59 = lendemain).
 */

/** Dernière heure acceptée : 29:59 (soit 05:59 le lendemain). */
export const MAX_TIME_MINUTES = 29 * 60 + 59;

/**
 * Convertit une saisie libre en horaire normalisé « HH:MM ».
 * Accepte : 9, 9:5, 9h30, 0930, 25:00, 24h45, « 2 30 »…
 * Retourne null si la saisie n'est pas une heure valide.
 */
export const normalizeTime = (value: string): string | null => {
  const cleaned = value.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleaned) return null;

  let hours: number;
  let minutes: number;

  const withSeparator = cleaned.match(/^(\d{1,2})[:h.,](\d{1,2})$/);
  if (withSeparator) {
    hours = Number(withSeparator[1]);
    minutes = Number(withSeparator[2]);
  } else if (/^\d{1,2}$/.test(cleaned)) {
    hours = Number(cleaned);
    minutes = 0;
  } else if (/^\d{3,4}$/.test(cleaned)) {
    hours = Number(cleaned.slice(0, cleaned.length - 2));
    minutes = Number(cleaned.slice(-2));
  } else {
    return null;
  }

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || minutes < 0 || minutes > 59) return null;
  if (hours > 29 || hours * 60 + minutes > MAX_TIME_MINUTES) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/** Minutes depuis le début de la journée (peut dépasser 1440). */
export const timeToMinutes = (time: string): number => {
  const normalized = normalizeTime(time);
  if (!normalized) return 0;
  return Number(normalized.slice(0, 2)) * 60 + Number(normalized.slice(3, 5));
};

/** Comparateur pour trier des horaires, y compris ceux d'après minuit. */
export const compareTime = (a: string, b: string): number =>
  timeToMinutes(a) - timeToMinutes(b);

/** « 25:30 » → « 01:30 le lendemain ». */
export const describeTime = (time: string): string => {
  const minutes = timeToMinutes(time);
  if (minutes < 24 * 60) return time;
  const hours = Math.floor(minutes / 60) - 24;
  const rest = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')} le lendemain`;
};

/** Suggestions proposées dans les champs horaires (menu + saisie libre). */
export const TIME_SUGGESTIONS: string[] = [
  ...Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2)
      .toString()
      .padStart(2, '0');
    const minutes = index % 2 === 0 ? '00' : '30';
    return `${hours}:${minutes}`;
  }),
  '24:00',
  '24:30',
  '25:00',
  '26:00',
];
