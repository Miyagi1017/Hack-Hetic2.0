export interface SavedPosition {
  lat: number;
  lng: number;
  label: string;
  source: 'gps' | 'manual';
  updatedAt: string;
}

const storageKey = (email: string) => `odyssee:position:${email}`;

export const readSavedPosition = (email: string): SavedPosition | null => {
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.lat !== 'number' ||
      typeof parsed.lng !== 'number' ||
      typeof parsed.label !== 'string'
    ) {
      return null;
    }
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      label: parsed.label,
      source: parsed.source === 'gps' ? 'gps' : 'manual',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

export const writeSavedPosition = (email: string, position: SavedPosition) => {
  try {
    window.localStorage.setItem(storageKey(email), JSON.stringify(position));
  } catch {
    // Stockage indisponible : la position reste en mémoire.
  }
};
