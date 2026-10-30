import type { CSSProperties } from 'react';
import { ItineraryStep } from '../types/travel';

/* ------------------------------------------------------------------
   Couleurs du parcours selon le moment de la journée
   Chaque étape reçoit une teinte propre : l'aube dorée, la table du
   déjeuner, le plein jour, le crépuscule, la soirée et la nuit.
   ------------------------------------------------------------------ */

export type DayPartId = 'aube' | 'dejeuner' | 'apres-midi' | 'crepuscule' | 'soiree' | 'nuit';

export type DayPartIcon =
  | 'sunrise'
  | 'utensils'
  | 'sun'
  | 'sunset'
  | 'moon'
  | 'sparkles';

export interface DayPart {
  id: DayPartId;
  label: string;
  range: string;
  tagline: string;
  icon: DayPartIcon;
  /** Couleur principale : pastille d'heure, filet de la carte, titre de section. */
  accent: string;
  accentSoft: string;
  washFrom: string;
  washTo: string;
  border: string;
  ink: string;
  muted: string;
  chipBg: string;
  chipInk: string;
}

export const DAY_PARTS: Record<DayPartId, DayPart> = {
  aube: {
    id: 'aube',
    label: 'Matin',
    range: '05:00 — 11:29',
    tagline: "La ville s'éveille dans une lumière dorée.",
    icon: 'sunrise',
    accent: '#C08A2E',
    accentSoft: 'rgba(192, 138, 46, 0.16)',
    washFrom: '#FFF9EC',
    washTo: '#FFFDF8',
    border: 'rgba(192, 138, 46, 0.32)',
    ink: '#5C3E12',
    muted: '#8A7650',
    chipBg: '#F8EDD6',
    chipInk: '#7A5312',
  },
  dejeuner: {
    id: 'dejeuner',
    label: 'Déjeuner',
    range: '11:30 — 14:29',
    tagline: 'La grande table du midi, produits et terrasses.',
    icon: 'utensils',
    accent: '#B4542F',
    accentSoft: 'rgba(180, 84, 47, 0.14)',
    washFrom: '#FDF1E9',
    washTo: '#FFFCF8',
    border: 'rgba(180, 84, 47, 0.30)',
    ink: '#6E2E14',
    muted: '#8A6A5C',
    chipBg: '#FAE4D8',
    chipInk: '#7A3418',
  },
  'apres-midi': {
    id: 'apres-midi',
    label: 'Après-midi',
    range: '14:30 — 17:59',
    tagline: 'Plein jour : musées, ruelles et jardins.',
    icon: 'sun',
    accent: '#4F7A6A',
    accentSoft: 'rgba(79, 122, 106, 0.14)',
    washFrom: '#F1F7F2',
    washTo: '#FCFEFC',
    border: 'rgba(79, 122, 106, 0.28)',
    ink: '#2C5142',
    muted: '#6C8078',
    chipBg: '#E4F0E7',
    chipInk: '#2F5445',
  },
  crepuscule: {
    id: 'crepuscule',
    label: 'Dîner',
    range: '18:00 — 20:59',
    tagline: "L'heure des terrasses, de l'apéritif et du dîner.",
    icon: 'sunset',
    accent: '#9A5A7A',
    accentSoft: 'rgba(154, 90, 122, 0.14)',
    washFrom: '#FAF0F4',
    washTo: '#FEFBFC',
    border: 'rgba(154, 90, 122, 0.28)',
    ink: '#66304A',
    muted: '#8A6B7C',
    chipBg: '#F4E5EC',
    chipInk: '#6D2F4C',
  },
  soiree: {
    id: 'soiree',
    label: 'Soirée',
    range: '21:00 — 23:59',
    tagline: "La nuit s'installe, les adresses s'allument.",
    icon: 'moon',
    accent: '#4E4B8F',
    accentSoft: 'rgba(78, 75, 143, 0.14)',
    washFrom: '#F1F0FA',
    washTo: '#FCFBFE',
    border: 'rgba(78, 75, 143, 0.26)',
    ink: '#33305F',
    muted: '#6F6C8A',
    chipBg: '#E7E5F6',
    chipInk: '#3A3770',
  },
  nuit: {
    id: 'nuit',
    label: 'Après minuit',
    range: '00:00 — 04:59 · dès 24:00',
    tagline: 'La ville en confidence, pour les noctambules.',
    icon: 'sparkles',
    accent: '#C99A4B',
    accentSoft: 'rgba(201, 154, 75, 0.18)',
    washFrom: '#26231C',
    washTo: '#1B1915',
    border: 'rgba(201, 154, 75, 0.40)',
    ink: '#F5EFE2',
    muted: 'rgba(245, 239, 226, 0.66)',
    chipBg: 'rgba(201, 154, 75, 0.18)',
    chipInk: '#E8C98D',
  },
};

/** Ordre d'apparition dans une journée. */
export const DAY_PART_ORDER: DayPartId[] = [
  'aube',
  'dejeuner',
  'apres-midi',
  'crepuscule',
  'soiree',
  'nuit',
];

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours)) return 12 * 60;
  return hours * 60 + (Number.isNaN(minutes) ? 0 : minutes);
};

/**
 * Moment de la journée d'une étape. Les horaires 24:00 → 29:59 sont
 * bien après minuit : ils basculent dans la nuit.
 */
export const getDayPart = (time: string): DayPart => {
  const minutes = toMinutes(time);

  if (minutes >= 24 * 60 || minutes < 5 * 60) return DAY_PARTS.nuit;
  if (minutes < 11 * 60 + 30) return DAY_PARTS.aube;
  if (minutes < 14 * 60 + 30) return DAY_PARTS.dejeuner;
  if (minutes < 18 * 60) return DAY_PARTS['apres-midi'];
  if (minutes < 21 * 60) return DAY_PARTS.crepuscule;
  return DAY_PARTS.soiree;
};

export interface DayPartSection {
  part: DayPart;
  steps: ItineraryStep[];
}

/** Regroupe les étapes du jour en blocs Matin / Déjeuner / … / Soirée. */
export const groupStepsByDayPart = (steps: ItineraryStep[]): DayPartSection[] => {
  const sections = new Map<DayPartId, DayPartSection>();

  steps.forEach((step) => {
    const part = getDayPart(step.activity.time);
    const section = sections.get(part.id);
    if (section) {
      section.steps.push(step);
    } else {
      sections.set(part.id, { part, steps: [step] });
    }
  });

  return DAY_PART_ORDER.filter((id) => sections.has(id)).map((id) => sections.get(id)!);
};

/** Variables CSS injectées sur la carte d'une étape. */
export const dayPartCssVars = (part: DayPart): CSSProperties => ({
  ['--step-accent' as string]: part.accent,
  ['--step-accent-soft' as string]: part.accentSoft,
  ['--step-bg' as string]: `linear-gradient(168deg, ${part.washFrom} 0%, ${part.washTo} 62%, #ffffff 100%)`,
  ['--step-border' as string]: part.border,
  ['--step-ink' as string]: part.ink,
  ['--step-muted' as string]: part.muted,
  ['--step-chip-bg' as string]: part.chipBg,
  ['--step-chip-ink' as string]: part.chipInk,
});
