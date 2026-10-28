import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  User,
  Check,
  Bookmark,
  LogOut,
  Plus,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../types/travel';
import { INTEREST_OPTIONS } from '../data/interests';
import { SafeImage } from './SafeImage';

export interface ProfileUpdates {
  name: string;
  avatar: string;
  travelStyle: string;
  preferences: string[];
}

interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onSave?: (updates: ProfileUpdates) => void;
}

const TRAVEL_STYLES = [
  'Épicurien & Culturel',
  'Routard & Authentique',
  'Confort & Bien-être',
  'Culture & Patrimoine',
  'Famille & Découverte',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onSave,
}) => {
  const [draftName, setDraftName] = useState(user.name);
  const [draftAvatar, setDraftAvatar] = useState(user.avatar);
  const [draftStyle, setDraftStyle] = useState(user.travelStyle);
  const [draftPreferences, setDraftPreferences] = useState<string[]>(user.preferences);
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDraftName(user.name);
    setDraftAvatar(user.avatar);
    setDraftStyle(user.travelStyle);
    setDraftPreferences(user.preferences);
    setCustomInterest('');
  }, [isOpen, user.name, user.avatar, user.travelStyle, user.preferences]);

  const interestCatalog = useMemo(() => {
    const known = new Set(INTEREST_OPTIONS.map((option) => option.label));
    const extras = draftPreferences
      .filter((preference) => !known.has(preference))
      .map((preference) => ({ label: preference, emoji: '✨' }));
    return [...INTEREST_OPTIONS, ...extras];
  }, [draftPreferences]);

  if (!isOpen) return null;

  const togglePreference = (label: string) => {
    setDraftPreferences((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const addCustomInterest = () => {
    const clean = customInterest.trim();
    if (!clean) return;
    setDraftPreferences((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setCustomInterest('');
  };

  const handleSave = () => {
    if (!draftName.trim()) return;
    const updates: ProfileUpdates = {
      name: draftName.trim(),
      avatar: draftAvatar.trim() || user.avatar,
      travelStyle: draftStyle.trim() || user.travelStyle,
      preferences: draftPreferences,
    };
    onSave?.(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-white/95 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <User className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Profil voyageur
              </span>
              <h2 className="font-serif text-xl font-semibold leading-tight text-ink">
                Modifier mes préférences
              </h2>
              <p className="mt-0.5 text-[11px] text-muted">
                Personnalisez votre profil et vos centres d'intérêt.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le profil"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {/* Identité */}
          <div className="rounded-2xl border border-line bg-gradient-to-br from-[#fffdf9] via-white to-[#fbf6ec] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <SafeImage
                src={draftAvatar}
                alt={draftName || user.name}
                className="h-16 w-16 rounded-full border-2 border-ink object-cover"
                icon={<User className="h-6 w-6 text-ink/30" aria-hidden="true" />}
              />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold text-ink">
                  {draftName.trim() || user.name}
                </p>
                <p className="text-xs text-muted">{user.email}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Style : <span className="font-semibold text-ink-soft">{draftStyle}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDraftAvatar(user.avatar)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                <RotateCcw className="h-3 w-3" />
                Photo d'origine
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted"
                >
                  Nom affiché
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-style"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted"
                >
                  Style de voyage
                </label>
                <select
                  id="profile-style"
                  value={draftStyle}
                  onChange={(event) => setDraftStyle(event.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
                >
                  {!TRAVEL_STYLES.includes(draftStyle) && (
                    <option value={draftStyle}>{draftStyle}</option>
                  )}
                  {TRAVEL_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="profile-avatar"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                Photo de profil (URL)
              </label>
              <input
                id="profile-avatar"
                type="url"
                value={draftAvatar}
                onChange={(event) => setDraftAvatar(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
              />
            </div>
          </div>

          {/* Centres d'intérêt */}
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Centres d'intérêt</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    Utilisés pour filtrer les activités proposées. Vous pourrez activer ou
                    désactiver ce filtre à tout moment.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-muted">
                {draftPreferences.length} sélectionné{draftPreferences.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {interestCatalog.map((option) => {
                const active = draftPreferences.includes(option.label);
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => togglePreference(option.label)}
                    aria-pressed={active}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    <span aria-hidden="true">{option.emoji}</span>
                    {option.label}
                    {active && <Check className="h-3 w-3 text-amber-300" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(event) => setCustomInterest(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomInterest();
                  }
                }}
                placeholder="Ajouter un centre d'intérêt..."
                className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>

            {draftPreferences.length === 0 && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-900">
                Sans centre d'intérêt, le filtre « Mes envies » proposera toutes les activités.
              </p>
            )}
          </div>

          {/* Collections (mémo) */}
          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Collections enregistrées ({user.savedCollectionsCount})
              </h4>
              <Bookmark className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
              {[
                { label: 'Trattorias à Rome', count: 6 },
                { label: 'Spots secrets', count: 4 },
                { label: 'Panoramas', count: 4 },
              ].map((collection) => (
                <div
                  key={collection.label}
                  className="flex items-center justify-between rounded-xl bg-paper px-2.5 py-2 text-[11px] font-semibold text-ink"
                >
                  <span>{collection.label}</span>
                  <span className="text-muted">{collection.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Pied */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-line bg-white p-5">
          {onLogout ? (
            <button
              onClick={onLogout}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-line bg-white px-3.5 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-paper"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!draftName.trim()}
              className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4 text-amber-300" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
