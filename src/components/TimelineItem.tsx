import React, { useState } from 'react';
import { ItineraryStep, Activity, PhotoSpotSpotlight } from '../types/travel';
import { CURATED_PHOTO_SPOTS } from '../data/mock-data';
import { formatDistance, haversineKm } from '../data/geo';
import { dayPartCssVars, getDayPart } from '../data/day-parts';
import { SafeImage } from './SafeImage';
import { TimeField } from './TimeField';

const TIME_PRESETS = [
  { label: 'Matin', time: '09:00' },
  { label: 'Déjeuner', time: '12:30' },
  { label: 'Après-midi', time: '15:00' },
  { label: 'Dîner', time: '19:30' },
  { label: 'Soirée', time: '21:30' },
];

interface TimelineItemProps {
  step: ItineraryStep;
  index: number;
  totalSteps: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenConflict: () => void;
  onOpenComparator?: (activity: Activity) => void;
  onToggleWishlist?: (activity: Activity) => void;
  isWishlisted?: boolean;
  onOpenPhotoSpot?: (spot: PhotoSpotSpotlight) => void;
  onUpdateRating?: (stepIndex: number, rating: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReplace?: () => void;
  onUpdateTime?: (time: string) => void;
  /** Étape suivante : sert à afficher le trajet entre les deux étapes. */
  nextStep?: ItineraryStep;
}

/**
 * Carte d'étape minimaliste : une heure, un lieu, une action.
 * La couleur du filet indique le moment de la journée ; la gastronomie
 * reçoit une carte « table » sombre, immédiatement reconnaissable.
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({
  step,
  index,
  totalSteps,
  isSelected,
  onSelect,
  onOpenConflict,
  onOpenComparator,
  onToggleWishlist,
  isWishlisted,
  onOpenPhotoSpot,
  onMoveUp,
  onMoveDown,
  onReplace,
  onUpdateTime,
  nextStep,
}) => {
  const act = step.activity;
  const isConflict = !!step.conflict;
  const scenic = step.scenicPassage;

  const part = getDayPart(act.time);
  const isDining = act.category === 'Gastronomie';
  const stepVars = dayPartCssVars(part);
  const nextPart = nextStep ? getDayPart(nextStep.activity.time) : null;

  const [isScenicExpanded, setIsScenicExpanded] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [draftTime, setDraftTime] = useState(act.time);

  const matchingSpot = CURATED_PHOTO_SPOTS.find(
    (s) =>
      s.locationName.toLowerCase().includes(act.name.toLowerCase().split(' ')[0]) ||
      act.name.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
      (scenic &&
        (s.name.toLowerCase().includes(scenic.name.toLowerCase().split(' ')[0]) ||
          scenic.name.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])))
  );

  // Trajet vers l'étape suivante
  const leg = nextStep?.travel;
  const legDistance =
    leg &&
    nextStep &&
    act.lat != null &&
    act.lng != null &&
    nextStep.activity.lat != null &&
    nextStep.activity.lng != null
      ? formatDistance(haversineKm([act.lat, act.lng], [nextStep.activity.lat, nextStep.activity.lng]))
      : null;

  const travelMode =
    leg?.mode === 'Marche'
      ? 'walking'
      : leg?.mode === 'Vélo'
        ? 'bicycling'
        : leg?.mode === 'Voiture' || leg?.mode === 'Uber'
          ? 'driving'
          : 'transit';

  const point = (lat?: number, lng?: number, address?: string) =>
    lat != null && lng != null ? `${lat},${lng}` : encodeURIComponent(address ?? '');

  const directionsUrl =
    leg && nextStep
      ? `https://www.google.com/maps/dir/?api=1&origin=${point(
          act.lat,
          act.lng,
          act.address
        )}&destination=${point(
          nextStep.activity.lat,
          nextStep.activity.lng,
          nextStep.activity.address
        )}&travelmode=${travelMode}`
      : null;

  return (
    <div className="group relative">
      <article
        onClick={onSelect}
        style={{
          ...stepVars,
          ...(isConflict
            ? { borderColor: '#fbbf24' }
            : isSelected
              ? { borderColor: 'rgba(29, 27, 22, 0.34)' }
              : {}),
        }}
        className={`step-card relative cursor-pointer overflow-hidden rounded-[20px] border p-4 pl-5 transition-colors sm:p-5 sm:pl-6 ${
          isDining ? 'is-dining' : ''
        } ${isSelected ? 'ring-2 ring-ink/10' : ''}`}
      >
        <span aria-hidden="true" className="step-rail absolute inset-y-4 left-0 w-[3px] rounded-r-full" />

        {isDining && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#e8c98d]">
              À table
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e8c98d]/80">
              {part.label}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3.5 sm:gap-4">
          <SafeImage
            src={act.image}
            alt={act.name}
            className="h-16 w-16 shrink-0 rounded-xl border border-line/70 object-cover sm:h-[72px] sm:w-[72px]"
            icon={<span className="text-[10px] text-muted">Photo</span>}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {onUpdateTime ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraftTime(act.time);
                    setIsEditingTime((prev) => !prev);
                  }}
                  title="Modifier l'horaire"
                  aria-label={`Modifier l'horaire de ${act.name}`}
                  aria-expanded={isEditingTime}
                  style={isConflict ? { background: '#fef3c7', color: '#92400e' } : undefined}
                  className="step-time cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums transition-opacity hover:opacity-80"
                >
                  {act.time}
                </button>
              ) : (
                <span
                  style={isConflict ? { background: '#fef3c7', color: '#92400e' } : undefined}
                  className="step-time rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
                >
                  {act.time}
                </span>
              )}

              <span className="step-category rounded-full px-2 py-0.5 text-[10px]">
                {act.category}
              </span>

              {isConflict && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenConflict();
                  }}
                  className="cursor-pointer rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 hover:bg-amber-200"
                >
                  Conflit · résoudre
                </button>
              )}
            </div>

            <h3
              className={`step-title mt-1.5 line-clamp-2 font-serif font-semibold leading-snug ${
                isDining ? 'text-lg tracking-tight sm:text-xl' : 'text-[17px] sm:text-lg'
              }`}
            >
              {act.name}
            </h3>

            {isDining && <div className="step-menu-rule mt-2 w-16" aria-hidden="true" />}

            <p className="step-muted mt-1 truncate text-[11px]">{act.address}</p>
          </div>
        </div>

        {isEditingTime && onUpdateTime && (
          <div className="mt-3 rounded-xl border border-line bg-white/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Nouvel horaire
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTime(false);
                }}
                className="cursor-pointer text-[11px] text-muted hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="contents" onClick={(e) => e.stopPropagation()}>
                <TimeField
                  value={draftTime}
                  onChange={setDraftTime}
                  ariaLabel="Choisir l'horaire de l'activité"
                  compact
                />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!draftTime) return;
                  onUpdateTime(draftTime);
                  setIsEditingTime(false);
                }}
                className="cursor-pointer rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white hover:bg-ink-soft"
              >
                Valider
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraftTime(preset.time);
                  }}
                  aria-pressed={draftTime === preset.time}
                  className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    draftTime === preset.time
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink-soft hover:border-line-strong'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
              Les étapes se replacent dans l'ordre et les trajets sont recalculés.
            </p>
          </div>
        )}

        {/* Ligne d'actions : texte seul, une action par intention */}
        <div className="step-hairline mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t pt-2.5">
          <p className="step-muted text-[11px]">
            {act.duration}
            <span className="mx-1.5 opacity-40">·</span>
            <span
              className="font-semibold"
              style={{ color: isDining ? '#e8c98d' : 'var(--step-ink)' }}
            >
              {act.price > 0 ? `${act.price} €` : 'Gratuit'}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium">
            <a
              href={
                act.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + ' ' + act.address)}`
              }
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="step-muted transition-colors hover:text-ink"
            >
              Carte ↗
            </a>

            {onReplace && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplace();
                }}
                className="step-muted cursor-pointer transition-colors hover:text-ink"
              >
                Modifier
              </button>
            )}

            {onToggleWishlist && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(act);
                }}
                aria-pressed={isWishlisted}
                className={`cursor-pointer transition-colors ${
                  isWishlisted ? 'font-semibold text-rose-600' : 'step-muted hover:text-ink'
                }`}
              >
                {isWishlisted ? 'Gardé' : 'Garder'}
              </button>
            )}

            {(onMoveUp || onMoveDown) && (
              <span className="flex items-center gap-2 text-muted">
                {onMoveUp && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp();
                    }}
                    title="Monter l'étape"
                    aria-label="Monter l'étape"
                    className="cursor-pointer px-0.5 hover:text-ink"
                  >
                    ↑
                  </button>
                )}
                {onMoveDown && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown();
                    }}
                    title="Descendre l'étape"
                    aria-label="Descendre l'étape"
                    className="cursor-pointer px-0.5 hover:text-ink"
                  >
                    ↓
                  </button>
                )}
              </span>
            )}

            {onOpenComparator && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenComparator(act);
                }}
                className="step-cta rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
              >
                {act.price > 0 ? `Réserver · ${act.price} €` : 'Comparer'}
              </button>
            )}
          </div>
        </div>

        {matchingSpot && onOpenPhotoSpot && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhotoSpot(matchingSpot);
            }}
            className={`mt-2.5 flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-colors ${
              isDining
                ? 'border-white/12 text-white/70 hover:bg-white/5'
                : 'border-line text-muted hover:bg-paper'
            }`}
          >
            <span className="truncate">Photos, avis & meilleur angle</span>
            <span className="shrink-0 font-semibold">{matchingSpot.reviews.length} avis</span>
          </button>
        )}
      </article>

      {/* ============ LIAISON : point coloré vers le prochain arrêt ============ */}
      {index < totalSteps - 1 && (
        <div className="px-4 py-2 sm:px-5">
          {leg && nextStep && (
            <div className="flex items-center gap-2">
              <div className="flex w-[64px] shrink-0 items-center justify-center sm:w-[72px]">
                <span className="h-5 w-px bg-line" />
                <span
                  className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full"
                  style={{ background: nextPart?.accentSoft ?? 'rgba(29,27,22,0.12)' }}
                  aria-hidden="true"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: nextPart?.accent ?? '#1d1b16' }}
                  />
                </span>
                <span className="h-5 w-px bg-line" />
              </div>

              <a
                href={directionsUrl ?? '#'}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                title={`${act.name} → ${nextStep.activity.name} · ${nextPart?.label ?? ''}`}
                aria-label={`Trajet de ${act.name} vers ${nextStep.activity.name} : ${leg.mode}, ${leg.duration}. Ouvrir l'itinéraire`}
                style={nextPart ? { borderColor: nextPart.border } : undefined}
                className="flex min-w-0 items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[11px] text-ink transition-colors hover:bg-paper"
              >
                <span className="shrink-0 font-semibold">{leg.mode}</span>
                <span className="opacity-30">·</span>
                <span className="shrink-0 text-muted">{leg.duration}</span>
                {legDistance && (
                  <>
                    <span className="opacity-30">·</span>
                    <span className="shrink-0 text-muted">{legDistance}</span>
                  </>
                )}
                {leg.cost > 0 && (
                  <>
                    <span className="opacity-30">·</span>
                    <span className="shrink-0 font-semibold text-emerald-700">
                      {leg.cost.toFixed(2)} €
                    </span>
                  </>
                )}
                <span className="ml-0.5 shrink-0 text-accent">↗</span>
              </a>
            </div>
          )}

          {/* Passage par parc, jardin ou monument paysager */}
          {scenic && (
            <div className="mt-1 rounded-xl border border-line bg-white/70 p-3">
              <div className="flex items-start gap-3">
                <SafeImage
                  src={scenic.photoUrl}
                  alt={scenic.name}
                  onClick={() => setIsScenicExpanded(!isScenicExpanded)}
                  className="h-14 w-14 shrink-0 cursor-pointer rounded-lg border border-line object-cover"
                  icon={<span className="text-[9px] text-muted">Parc</span>}
                />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted">
                    <span className="font-semibold uppercase tracking-wider text-emerald-800">
                      Passage paysager
                    </span>
                    <span>{scenic.safetyRating} · {scenic.safetyScore}%</span>
                    <span>{scenic.crowdLevel}</span>
                    <span className="font-semibold text-ink">
                      {scenic.rating} ({scenic.verifiedReviewsCount} avis)
                    </span>
                  </p>

                  <h5 className="mt-0.5 font-serif text-sm font-semibold leading-snug text-ink">
                    {scenic.name}
                  </h5>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{scenic.description}</p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsScenicExpanded(!isScenicExpanded)}
                      aria-expanded={isScenicExpanded}
                      className="cursor-pointer font-semibold text-ink hover:text-accent"
                    >
                      Photos & cadrage {isScenicExpanded ? '−' : '+'}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(scenic.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted hover:text-accent"
                    >
                      Carte ↗
                    </a>
                  </div>

                  {isScenicExpanded && (
                    <div className="mt-2 space-y-1 rounded-lg border border-line bg-paper p-2.5 text-[11px]">
                      <p className="font-semibold text-ink">{scenic.instagrammableSpot}</p>
                      <p className="leading-relaxed text-muted">{scenic.photoTips}</p>
                      <p className="text-amber-800">Golden hour · {scenic.goldenHour}</p>

                      {onOpenPhotoSpot && matchingSpot && (
                        <div className="flex items-center justify-between gap-2 border-t border-line pt-1.5">
                          <span className="text-[10px] text-muted">Avis multi-plateformes</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPhotoSpot(matchingSpot);
                            }}
                            className="cursor-pointer rounded-full border border-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-ink hover:bg-paper"
                          >
                            Voir les photos
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
