import { TravelOption } from '../types/travel';

/** Distance à vol d'oiseau entre deux points [lat, lng], en kilomètres. */
export const haversineKm = (from: [number, number], to: [number, number]): number => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRadians(to[0] - from[0]);
  const dLng = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(a)));
};

export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.max(50, Math.round(km * 1000))} m` : `${km.toFixed(1)} km`;

/**
 * Estimation simple du trajet entre deux étapes, utilisée pour recalculer
 * l'itinéraire après un ajout, un remplacement ou une réorganisation.
 */
export const estimateTravel = (km: number): TravelOption => {
  if (km <= 1.6) {
    const minutes = Math.max(3, Math.round((km / 4.5) * 60));
    return { mode: 'Marche', duration: `${minutes} min`, durationMinutes: minutes, cost: 0 };
  }

  if (km <= 7) {
    const minutes = Math.max(8, Math.round((km / 18) * 60) + 6);
    return { mode: 'Métro', duration: `${minutes} min`, durationMinutes: minutes, cost: 2 };
  }

  if (km <= 20) {
    const minutes = Math.max(12, Math.round((km / 25) * 60) + 5);
    return { mode: 'Bus', duration: `${minutes} min`, durationMinutes: minutes, cost: 2 };
  }

  const minutes = Math.max(15, Math.round((km / 45) * 60) + 5);
  return {
    mode: 'Voiture',
    duration: `${minutes} min`,
    durationMinutes: minutes,
    cost: Math.round(km * 1.1),
  };
};
