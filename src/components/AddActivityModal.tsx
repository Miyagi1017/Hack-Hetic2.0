import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Plus,
  MapPin,
  Clock,
  Euro,
  Tag,
  Sparkles,
  Search,
  Navigation,
  Star,
  Check,
  Compass,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { Activity, ActivityCategory } from '../types/travel';
import {
  ActivityBudget,
  budgetOverage,
  fitsActivityBudget,
  formatEuros,
} from '../data/activity-budget';
import { activityMatchesInterests } from '../data/interests';
import { SafeImage } from './SafeImage';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: Activity) => void;
  dayNumber: number;
  center?: [number, number];
  city?: string;
  /** Activités déjà connues (catalogue, envies, programme) avec coordonnées. */
  nearbyActivities?: Activity[];
  /** Identifiants déjà présents dans le séjour, pour afficher « Ajoutée ». */
  addedActivityIds?: string[];
  /** Point de référence : dernière étape du jour, sinon centre-ville. */
  anchor?: [number, number];
  anchorLabel?: string;
  /** Enveloppe choisie : sert à ne proposer que les activités finançables. */
  activityBudget?: ActivityBudget;
  /** Ouvre l'onglet Budget pour ajuster l'enveloppe. */
  onOpenBudget?: () => void;
  /** Enveloppe totale actuelle, pour l'ajustement direct. */
  budgetTotal?: number;
  /** Applique une nouvelle enveloppe au séjour. */
  onBudgetChange?: (value: number) => void;
  /** Centres d'intérêt du profil, pour le filtre « Mes envies ». */
  interests?: string[];
}

type BudgetMode = 'fit' | 'free' | 'all';

const RADIUS_OPTIONS = [1, 3, 5, 10, 25] as const;

const haversineKm = (from: [number, number], to: [number, number]): number => {
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

const formatDistance = (km: number): string =>
  km < 1 ? `${Math.max(50, Math.round(km * 1000))} m` : `${km.toFixed(1)} km`;

const formatPrice = (price: number): string =>
  price <= 0 ? 'Gratuit' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price)} €`;

const categoryEmoji: Record<string, string> = {
  Culture: '🏛️',
  Gastronomie: '🍝',
  Nature: '🌿',
  Insolite: '🗝️',
  Hébergement: '🛏️',
  Transport: '🚋',
};

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  dayNumber,
  center = [41.895, 12.48],
  city = 'Rome',
  nearbyActivities = [],
  addedActivityIds = [],
  anchor,
  anchorLabel,
  activityBudget,
  onOpenBudget,
  budgetTotal,
  onBudgetChange,
  interests = [],
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Culture');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('16:00');
  const [duration, setDuration] = useState('1h30');
  const [price, setPrice] = useState('15');

  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [nearbyQuery, setNearbyQuery] = useState('');
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('fit');
  const [preferInterests, setPreferInterests] = useState(interests.length > 0);
  const [isAdjustingBudget, setIsAdjustingBudget] = useState(false);
  const [draftBudget, setDraftBudget] = useState(0);

  const referencePoint = anchor ?? center;
  const remainingPerPerson = activityBudget?.remainingPerPerson ?? Number.POSITIVE_INFINITY;

  // Chaque ouverture repart sur les filtres recommandés.
  useEffect(() => {
    if (!isOpen) return;
    setRadiusKm(3);
    setNearbyQuery('');
    setBudgetMode('fit');
    setPreferInterests(interests.length > 0);
    setIsAdjustingBudget(false);
    setDraftBudget(activityBudget?.budgetTotal ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const nearby = useMemo(() => {
    const seen = new Set<string>();
    return nearbyActivities
      .filter((activity) => {
        if (seen.has(activity.id)) return false;
        if (typeof activity.lat !== 'number' || typeof activity.lng !== 'number') return false;
        seen.add(activity.id);
        return true;
      })
      .map((activity) => ({
        activity,
        distance: haversineKm(referencePoint, [activity.lat as number, activity.lng as number]),
      }))
      .filter((entry) => entry.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }, [nearbyActivities, referencePoint[0], referencePoint[1], radiusKm]);

  const matchesPreferences = (activity: Activity): boolean =>
    !preferInterests || interests.length === 0 || activityMatchesInterests(activity, interests);

  const affordableNearbyCount = nearby.filter(
    (entry) =>
      Math.max(0, entry.activity.price || 0) <= remainingPerPerson + 0.01 &&
      matchesPreferences(entry.activity)
  ).length;
  const preferenceNearbyCount = nearby.filter((entry) =>
    activityMatchesInterests(entry.activity, interests)
  ).length;

  // Ajustement direct de l'enveloppe depuis le sélecteur d'activités.
  const budgetDays = activityBudget?.days ?? 1;
  const budgetTravelers = activityBudget?.travelers ?? 1;
  const budgetPresets = [60, 100, 150, 220].map((rate) => ({
    rate,
    amount: Math.round((rate * budgetDays * budgetTravelers) / 10) * 10,
  }));
  const draftRemaining = activityBudget
    ? draftBudget -
      activityBudget.fixedTotal -
      activityBudget.activitiesTotal -
      activityBudget.transportTotal
    : 0;

  const openBudgetAdjust = () => {
    setDraftBudget(activityBudget?.budgetTotal ?? budgetTotal ?? 0);
    setIsAdjustingBudget(true);
  };

  const applyBudget = () => {
    onBudgetChange?.(Math.max(0, Math.min(100000, Math.round(draftBudget))));
    setIsAdjustingBudget(false);
  };

  const filteredNearby = useMemo(() => {
    const query = nearbyQuery.trim().toLowerCase();
    let list = nearby;

    // Les activités sont filtrées selon l'enveloppe réellement choisie.
    if (budgetMode === 'free') {
      list = list.filter((entry) => Math.max(0, entry.activity.price || 0) <= 0);
    } else if (budgetMode === 'fit' && Number.isFinite(remainingPerPerson)) {
      list = list.filter(
        (entry) => Math.max(0, entry.activity.price || 0) <= remainingPerPerson + 0.01
      );
    }

    // Filtre « Mes envies » activable / désactivable.
    if (preferInterests && interests.length > 0) {
      list = list.filter((entry) => activityMatchesInterests(entry.activity, interests));
    }

    if (query) {
      list = list.filter(
        (entry) =>
          entry.activity.name.toLowerCase().includes(query) ||
          entry.activity.category.toLowerCase().includes(query) ||
          entry.activity.address.toLowerCase().includes(query)
      );
    }

    return [...list].sort((a, b) => {
      // En mode « Tout », les activités finançables passent devant.
      if (budgetMode === 'all' && Number.isFinite(remainingPerPerson)) {
        const fitsA = Math.max(0, a.activity.price || 0) <= remainingPerPerson + 0.01;
        const fitsB = Math.max(0, b.activity.price || 0) <= remainingPerPerson + 0.01;
        if (fitsA !== fitsB) return fitsA ? -1 : 1;
      }
      return a.distance - b.distance;
    });
  }, [nearby, nearbyQuery, budgetMode, remainingPerPerson, preferInterests, interests]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Approximate position around the current destination center
    const newActivity: Activity = {
      id: `custom-act-${Date.now()}`,
      name: name.trim(),
      category,
      address: address.trim() || `Centre historique, ${city}`,
      lat: center[0] + (Math.random() - 0.5) * 0.02,
      lng: center[1] + (Math.random() - 0.5) * 0.02,
      time,
      duration,
      price: parseFloat(price) || 0,
      image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=600&q=80',
      isConfirmed: true,
    };

    onAdd(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-y-auto rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-white/95 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Jour {dayNumber} · {city}
              </span>
              <h3 className="font-serif text-xl font-semibold leading-tight text-ink">
                Ajouter une étape
              </h3>
              <p className="mt-0.5 text-[11px] text-muted">
                Choisissez une activité connue à proximité ou créez votre propre étape.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Activités connues à proximité */}
          <section className="order-2 min-w-0 lg:order-1">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                <Navigation className="h-3 w-3" />
                Activités connues à proximité
              </p>
              <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">
                {filteredNearby.length} idée{filteredNearby.length > 1 ? 's' : ''}
              </span>
            </div>

            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
              <MapPin className="h-3 w-3 text-ink-soft" />
              Autour de{' '}
              <span className="font-semibold text-ink-soft">
                {anchorLabel ?? `${city} centre`}
              </span>
            </p>

            {/* Filtre de rayon */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRadiusKm(option)}
                  aria-pressed={radiusKm === option}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    radiusKm === option
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink-soft hover:border-line-strong'
                  }`}
                >
                  {option === 25 ? 'Tout' : `${option} km`}
                </button>
              ))}
            </div>

            {/* Filtre selon les centres d'intérêt du profil */}
            {interests.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <Sparkles className="h-3 w-3 text-gold" />
                  Mes centres d'intérêt
                  <span className="font-normal normal-case tracking-normal text-muted">
                    ({preferenceNearbyCount}/{nearby.length})
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreferInterests(true)}
                    aria-pressed={preferInterests}
                    className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      preferInterests
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    Avec filtre
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferInterests(false)}
                    aria-pressed={!preferInterests}
                    className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      !preferInterests
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    Sans filtre
                  </button>
                </div>
              </div>
            )}

            {/* Enveloppe budget appliquée aux activités */}
            {activityBudget && (
              <div
                className={`mt-2.5 rounded-xl border p-2.5 ${
                  activityBudget.isOverBudget
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-emerald-200 bg-emerald-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                    {activityBudget.isOverBudget ? (
                      <AlertTriangle className="h-3 w-3 text-amber-700" />
                    ) : (
                      <Wallet className="h-3 w-3 text-emerald-700" />
                    )}
                    Reste pour les activités
                  </span>
                  <span className="shrink-0 text-right font-serif text-sm font-semibold text-ink">
                    {activityBudget.isOverBudget
                      ? `Dépassé de ${formatEuros(Math.abs(activityBudget.remainingTotal))}`
                      : `${formatEuros(activityBudget.remainingPerPerson)} / pers.`}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] leading-relaxed text-ink-soft">
                  Enveloppe de {formatEuros(activityBudget.perDayPerPerson)} / pers. / jour ·{' '}
                  <strong className="font-semibold">{affordableNearbyCount}</strong> idée
                  {affordableNearbyCount > 1 ? 's' : ''} compatible
                  {affordableNearbyCount > 1 ? 's' : ''} sur {nearby.length}.
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'fit' as BudgetMode, label: 'Mon budget' },
                      { id: 'free' as BudgetMode, label: 'Gratuit' },
                      { id: 'all' as BudgetMode, label: 'Tout' },
                    ]
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setBudgetMode(mode.id)}
                      aria-pressed={budgetMode === mode.id}
                      className={`cursor-pointer rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                        budgetMode === mode.id
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-white text-ink-soft hover:border-line-strong'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                  {onBudgetChange && !isAdjustingBudget && (
                    <button
                      type="button"
                      onClick={openBudgetAdjust}
                      className="ml-auto cursor-pointer rounded-full border border-transparent px-1.5 py-1 text-[10px] font-semibold text-accent underline underline-offset-2 hover:text-ink"
                    >
                      Ajuster le budget
                    </button>
                  )}
                  {!onBudgetChange && onOpenBudget && (
                    <button
                      type="button"
                      onClick={onOpenBudget}
                      className="ml-auto cursor-pointer rounded-full border border-transparent px-1.5 py-1 text-[10px] font-semibold text-accent underline underline-offset-2 hover:text-ink"
                    >
                      Ajuster le budget
                    </button>
                  )}
                </div>

                {/* Ajustement direct + application de l'enveloppe */}
                {isAdjustingBudget && onBudgetChange && (
                  <div className="mt-2 rounded-lg border border-line bg-white p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="budget-adjust"
                        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                      >
                        Nouvelle enveloppe
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          id="budget-adjust"
                          type="number"
                          min={0}
                          max={100000}
                          step={50}
                          value={draftBudget}
                          onChange={(event) =>
                            setDraftBudget(
                              Math.max(0, Math.min(100000, Number(event.target.value) || 0))
                            )
                          }
                          className="w-24 rounded-lg border border-line bg-paper px-2 py-1 text-right font-serif text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-muted">€</span>
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {budgetPresets.map((preset) => {
                        const active = Math.abs(draftBudget - preset.amount) < 1;
                        return (
                          <button
                            key={preset.rate}
                            type="button"
                            onClick={() => setDraftBudget(preset.amount)}
                            aria-pressed={active}
                            title={`${preset.rate} € / pers. / jour`}
                            className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                              active
                                ? 'border-ink bg-ink text-white'
                                : 'border-line bg-white text-ink-soft hover:border-line-strong'
                            }`}
                          >
                            {preset.rate} €/j · {formatEuros(preset.amount)}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-medium ${
                          draftRemaining < 0 ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {draftRemaining < 0
                          ? `Encore dépassé de ${formatEuros(Math.abs(draftRemaining))}`
                          : `${formatEuros(draftRemaining / budgetTravelers)} / pers. pour les activités`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {onOpenBudget && (
                          <button
                            type="button"
                            onClick={onOpenBudget}
                            className="cursor-pointer rounded-full px-1.5 py-1 text-[10px] font-semibold text-muted underline underline-offset-2 hover:text-ink"
                          >
                            Détail
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsAdjustingBudget(false)}
                          className="cursor-pointer rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={applyBudget}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-ink px-3 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-ink-soft"
                        >
                          <Check className="h-3 w-3" />
                          Appliquer le budget
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative mt-2.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={nearbyQuery}
                onChange={(e) => setNearbyQuery(e.target.value)}
                placeholder="Filtrer par nom, catégorie..."
                className="w-full rounded-xl border border-line bg-paper py-2 pl-8 pr-3 text-xs text-ink focus:border-ink focus:outline-none"
              />
            </div>

            <div className="mt-2.5 max-h-[300px] space-y-2 overflow-y-auto pr-0.5">
              {filteredNearby.length === 0 && (
                <div className="rounded-xl border border-dashed border-line bg-paper px-3 py-6 text-center">
                  <Sparkles className="mx-auto h-4 w-4 text-gold" />
                  <p className="mt-1.5 text-xs font-semibold text-ink">
                    {preferInterests && preferenceNearbyCount === 0 && nearby.length > 0
                      ? "Aucune activité selon vos centres d'intérêt"
                      : budgetMode === 'fit' && activityBudget && nearby.length > 0
                        ? 'Aucune activité dans votre budget'
                        : 'Aucune activité connue dans ce rayon'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {preferInterests && preferenceNearbyCount === 0 && nearby.length > 0
                      ? 'Désactivez le filtre pour voir toutes les idées à proximité.'
                      : budgetMode === 'fit' && activityBudget && nearby.length > 0
                        ? 'Élargissez le budget ou affichez toutes les activités.'
                        : 'Élargissez la recherche ou ajoutez votre propre étape.'}
                  </p>
                  {preferInterests && preferenceNearbyCount === 0 && nearby.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setPreferInterests(false)}
                      className="mt-2 cursor-pointer rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                    >
                      Voir sans filtre
                    </button>
                  ) : (
                    budgetMode === 'fit' &&
                    nearby.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBudgetMode('all')}
                        className="mt-2 cursor-pointer rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                      >
                        Voir toutes les activités
                      </button>
                    )
                  )}
                </div>
              )}

              {filteredNearby.map(({ activity, distance }) => {
                const isAdded = addedActivityIds.includes(activity.id);
                const fitsBudget = activityBudget
                  ? fitsActivityBudget(activity, activityBudget)
                  : true;
                const overage = activityBudget ? budgetOverage(activity, activityBudget) : 0;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-stretch gap-2.5 rounded-xl border p-2 transition-colors ${
                      isAdded
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-line bg-white hover:border-line-strong'
                    }`}
                  >
                    <SafeImage
                      src={activity.image}
                      alt={activity.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      icon={<MapPin className="h-4 w-4 text-ink/30" aria-hidden="true" />}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-ink">{activity.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted">
                        <span>
                          {categoryEmoji[activity.category] ?? '📍'} {activity.category}
                        </span>
                        <span className="text-line-strong">•</span>
                        <span className="font-semibold text-ink-soft">{formatDistance(distance)}</span>
                        {typeof activity.rating === 'number' && (
                          <>
                            <span className="text-line-strong">•</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              {activity.rating.toFixed(1)}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="flex flex-wrap items-center gap-1 text-[11px] font-semibold text-ink">
                          {formatPrice(activity.price)}
                          {activityBudget && activity.price > 0 && (
                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${
                                fitsBudget
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : 'border-amber-200 bg-amber-50 text-amber-800'
                              }`}
                            >
                              {fitsBudget ? 'Dans le budget' : `+${formatEuros(overage)}`}
                            </span>
                          )}
                          <span className="font-normal text-muted">· {activity.duration}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdd(activity)}
                          disabled={isAdded}
                          className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                            isAdded
                              ? 'cursor-default bg-emerald-100 text-emerald-800'
                              : 'bg-ink text-white hover:bg-ink-soft'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-3 w-3" />
                              Ajoutée
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Ajouter
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Création libre */}
          <section className="order-1 min-w-0 lg:order-2">
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              <Plus className="h-3 w-3" />
              Créer une étape personnalisée
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">
                  Nom du lieu ou de l'activité
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Musée Capitolin, Trattoria Mario..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-bold text-ink">
                    <Tag className="h-3 w-3 text-muted" />
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
                  >
                    <option value="Culture">🏛️ Culture</option>
                    <option value="Gastronomie">🍝 Gastronomie</option>
                    <option value="Nature">🌿 Nature</option>
                    <option value="Insolite">🗝️ Insolite</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-bold text-ink">
                    <Clock className="h-3 w-3 text-muted" />
                    Heure prévue
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="ex: 16:00"
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Adresse ou quartier</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Piazza del Campidoglio, 1"
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-ink">Durée estimée</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="ex: 1h30"
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-bold text-ink">
                    <Euro className="h-3 w-3 text-muted" />
                    Prix estimé (€)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="ex: 15"
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter à la journée {dayNumber}</span>
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
