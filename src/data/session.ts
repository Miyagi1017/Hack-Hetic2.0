/* ------------------------------------------------------------------
   Session locale (démo)
   Aucun serveur d’authentification : la session est conservée dans le
   navigateur pour que chaque voyageur retrouve ses réglages.
   ------------------------------------------------------------------ */

export interface SessionUser {
  name: string;
  email: string;
  avatar: string;
  travelStyle: string;
  preferences: string[];
  createdAt: string;
}

export const SESSION_STORAGE_KEY = 'odyssee:session';

export const DEFAULT_PREFERENCES = [
  'Gastronomie locale',
  'Histoire & Art',
  'Nature & jardins',
  'Insolite & secrets',
];

export const DEMO_USER: SessionUser = {
  name: 'Evan',
  email: 'evan.voyageur@example.com',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  travelStyle: 'Épicurien & Culturel',
  preferences: [...DEFAULT_PREFERENCES],
  createdAt: '2026-10-28T00:00:00.000Z',
};

const sanitizePreferences = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [...DEFAULT_PREFERENCES];
  const cleaned = value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );
  return cleaned.map((item) => item.trim());
};

const avatarFor = (name: string): string => {
  const seed = encodeURIComponent(name.trim().toLowerCase() || 'voyageur');
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=fbf3e2`;
};

const isSessionUser = (value: unknown): value is SessionUser => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SessionUser>;
  return typeof candidate.email === 'string' && typeof candidate.name === 'string';
};

export const readSession = (): SessionUser | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSessionUser(parsed)) return null;
    return {
      name: parsed.name,
      email: parsed.email,
      avatar: typeof parsed.avatar === 'string' && parsed.avatar ? parsed.avatar : avatarFor(parsed.name),
      travelStyle: typeof parsed.travelStyle === 'string' && parsed.travelStyle ? parsed.travelStyle : 'Épicurien & Culturel',
      preferences: sanitizePreferences(parsed.preferences),
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

export const saveSession = (user: SessionUser): void => {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Stockage indisponible : la session reste en mémoire.
  }
};

export const clearSession = (): void => {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignorer les environnements sans stockage.
  }
};

export const createSessionUser = (email: string, name: string): SessionUser => {
  const cleanName = name.trim() || email.split('@')[0] || 'Voyageur';
  return {
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    email: email.trim().toLowerCase(),
    avatar: avatarFor(cleanName),
    travelStyle: 'Épicurien & Culturel',
    preferences: [...DEFAULT_PREFERENCES],
    createdAt: new Date().toISOString(),
  };
};
