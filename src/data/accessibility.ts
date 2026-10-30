export type FontScale = 'normal' | 'large' | 'xlarge';

export interface ComfortSettings {
  /** Taille du texte pour toute l'application. */
  fontScale: FontScale;
  /** Contraste renforcé : fonds blancs, textes et bordures plus foncés. */
  highContrast: boolean;
  /** Supprime animations et transitions (confort, vertiges, lenteur). */
  reduceMotion: boolean;
  /** Agrandit les zones cliquables (boutons, liens, champs) à 44 px minimum. */
  biggerTargets: boolean;
  /** Souligne systématiquement les liens et boutons texte. */
  underlineLinks: boolean;
}

export const DEFAULT_COMFORT: ComfortSettings = {
  fontScale: 'normal',
  highContrast: false,
  reduceMotion: false,
  biggerTargets: false,
  underlineLinks: false,
};

const STORAGE_KEY = 'odyssee:comfort';

export const readComfort = (): ComfortSettings => {
  if (typeof window === 'undefined') return DEFAULT_COMFORT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COMFORT;
    const parsed = JSON.parse(raw) as Partial<ComfortSettings>;
    return {
      fontScale:
        parsed.fontScale === 'large' || parsed.fontScale === 'xlarge'
          ? parsed.fontScale
          : 'normal',
      highContrast: Boolean(parsed.highContrast),
      reduceMotion: Boolean(parsed.reduceMotion),
      biggerTargets: Boolean(parsed.biggerTargets),
      underlineLinks: Boolean(parsed.underlineLinks),
    };
  } catch {
    return DEFAULT_COMFORT;
  }
};

export const writeComfort = (settings: ComfortSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Stockage plein ou désactivé : le confort reste actif pour la session.
  }
};

/**
 * Applique les réglages sur <html> via des attributs data-* consommés
 * par les styles de src/index.css.
 */
export const applyComfort = (settings: ComfortSettings): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.fontScale = settings.fontScale;
  root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
  root.dataset.motion = settings.reduceMotion ? 'reduced' : 'normal';
  root.dataset.targets = settings.biggerTargets ? 'large' : 'normal';
  root.dataset.links = settings.underlineLinks ? 'underlined' : 'normal';
};

export const FONT_SCALES: Array<{ id: FontScale; label: string; sample: string }> = [
  { id: 'normal', label: 'Standard', sample: 'Aa' },
  { id: 'large', label: 'Grand', sample: 'Aa' },
  { id: 'xlarge', label: 'Très grand', sample: 'Aa' },
];
