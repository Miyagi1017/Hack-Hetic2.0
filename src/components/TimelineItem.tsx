import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Footprints,
  Train,
  Car,
  Bike,
  Bus,
  Camera,
  ShieldCheck,
  Users,
  Sun,
  Star,
  Heart,
  ExternalLink,
  ChevronDown,
  Leaf,
  Pencil,
  X,
  Check,
} from 'lucide-react';
import { ItineraryStep, Activity, PhotoSpotSpotlight } from '../types/travel';
import { CURATED_PHOTO_SPOTS } from '../data/mock-data';
import { formatDistance, haversineKm } from '../data/geo';
import { SafeImage } from './SafeImage';
import { TimeField } from './TimeField';

const TIME_PRESETS = [
  { label: 'Matin', time: '09:00' },
  { label: 'Déjeuner', time: '12:30' },
  { label: 'Après-midi', time: '15:00' },
  { label: 'Dîner', time: '19:30' },
  { label: 'Soirée', time: '21:30' },
];

interface TimelineItemProps {  step: ItineraryStep;
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

  const [isScenicExpanded, setIsScenicExpanded] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [draftTime, setDraftTime] = useState(act.time);

  // Match photo spot from curated database (aucun repli arbitraire : on n'affiche
  // la bannière que lorsqu'un spot correspond réellement à l'étape)
  const matchingSpot = CURATED_PHOTO_SPOTS.find(
    (s) =>
      s.locationName.toLowerCase().includes(act.name.toLowerCase().split(' ')[0]) ||
      act.name.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
      (scenic &&
        (s.name.toLowerCase().includes(scenic.name.toLowerCase().split(' ')[0]) ||
          scenic.name.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])))
  );

  const getTransportIcon = (mode?: string) => {
    switch (mode) {
      case 'Marche':
        return <Footprints className="w-3.5 h-3.5" />;
      case 'Métro':
        return <Train className="w-3.5 h-3.5" />;
      case 'Uber':
      case 'Voiture':
        return <Car className="w-3.5 h-3.5" />;
      case 'Vélo':
        return <Bike className="w-3.5 h-3.5" />;
      case 'Bus':
        return <Bus className="w-3.5 h-3.5" />;
      default:
        return <Footprints className="w-3.5 h-3.5" />;
    }
  };

  // Vue du trajet entre cette étape et la suivante
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
      {/* Carte d'activité */}
      <article
        onClick={onSelect}
        className={`relative cursor-pointer rounded-[24px] border bg-white p-4 transition-all duration-300 sm:p-5 ${
          isConflict
            ? 'border-amber-300 shadow-sm ring-1 ring-amber-100 hover:shadow-md'
            : isSelected
            ? 'border-ink/25 shadow-md ring-2 ring-ink/10'
            : 'border-line hover:border-line-strong hover:shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3.5 sm:gap-4">
          {/* Visuel + numéro d'étape */}
          <div className="relative shrink-0">
            <SafeImage
              src={act.image}
              alt={act.name}
              className="h-[72px] w-[72px] rounded-[18px] border border-line object-cover sm:h-20 sm:w-20"
              icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
            />
            <span className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-[10px] font-bold text-ink shadow-xs">
              {index + 1}
            </span>
          </div>

          {/* Détails */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
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
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                      isConflict
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-accent-soft text-accent hover:bg-accent/15'
                    }`}
                  >
                    {act.time}
                    <Pencil className="h-2.5 w-2.5 opacity-60" />
                  </button>
                ) : (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      isConflict ? 'bg-amber-100 text-amber-800' : 'bg-accent-soft text-accent'
                    }`}
                  >
                    {act.time}
                  </span>
                )}
                <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-muted">
                  {act.category}
                </span>
                {isConflict && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Conflit
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {onToggleWishlist && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(act);
                    }}
                    title={isWishlisted ? "Retirer de ma liste d'envies" : "Ajouter à ma liste d'envies"}
                    aria-label={isWishlisted ? "Retirer de ma liste d'envies" : "Ajouter à ma liste d'envies"}
                    className="rounded-full p-1.5 hover:bg-paper"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-line-strong hover:text-rose-500'
                      }`}
                    />
                  </button>
                )}

                {/* Modifier l'activité choisie */}
                {onReplace && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReplace();
                    }}
                    title="Modifier cette activité"
                    aria-label="Modifier cette activité"
                    className="rounded-full p-1.5 text-line-strong transition-colors hover:bg-paper hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Réorganisation */}
                <div className="hidden flex-col sm:flex">
                  {onMoveUp && index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp();
                      }}
                      title="Monter l'étape"
                      aria-label="Monter l'étape"
                      className="rounded p-0.5 text-line-strong opacity-0 hover:bg-paper hover:text-ink group-hover:opacity-100"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onMoveDown && index < totalSteps - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown();
                      }}
                      title="Descendre l'étape"
                      aria-label="Descendre l'étape"
                      className="rounded p-0.5 text-line-strong opacity-0 hover:bg-paper hover:text-ink group-hover:opacity-100"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isEditingTime && onUpdateTime && (
              <div className="mt-2 rounded-xl border border-line bg-paper p-2.5">
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
                    aria-label="Fermer la modification d'horaire"
                    className="cursor-pointer rounded-full p-0.5 text-muted transition-colors hover:bg-white hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-ink-soft"
                  >
                    <Check className="h-3 w-3" />
                    Valider
                  </button>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-1">
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
                      {preset.label} · {preset.time}
                    </button>
                  ))}
                </div>

                <p className="mt-1 text-[10px] leading-relaxed text-muted">
                  Les étapes sont replacées dans l'ordre chronologique et le trajet est recalculé.
                </p>
              </div>
            )}

            <h3 className="mt-2 line-clamp-2 font-serif text-[17px] font-semibold leading-snug text-ink sm:text-lg">
              {act.name}
            </h3>

            <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{act.address}</span>
            </p>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/80 pt-2.5">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {act.duration}
                </span>
                <span className="text-line-strong">·</span>
                <span className="font-semibold text-ink">
                  {act.price > 0 ? `${act.price} €` : 'Gratuit'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={
                    act.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + ' ' + act.address)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Ouvrir dans Google Maps"
                  title="Ouvrir dans Google Maps"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:border-line-strong hover:bg-paper"
                >
                  <MapPin className="h-3.5 w-3.5" />
                </a>

                {isConflict && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenConflict();
                    }}
                    className="rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-600"
                  >
                    Résoudre
                  </button>
                )}

                {onOpenComparator && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenComparator(act);
                    }}
                    className="rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-ink-soft"
                  >
                    {act.price > 0 ? `Réserver · ${act.price} €` : 'Comparer les offres'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spots photo & avis */}
        {matchingSpot && onOpenPhotoSpot && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhotoSpot(matchingSpot);
            }}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-left hover:bg-rose-50"
          >
            <span className="flex min-w-0 items-center gap-2 text-[11px] font-medium text-rose-950">
              <Camera className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span className="truncate">Photos, avis & meilleur angle</span>
            </span>
            <span className="shrink-0 rounded-full border border-rose-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              {matchingSpot.reviews.length} avis
            </span>
          </button>
        )}
      </article>

      {/* ============ LIAISON TRANSPORT & PASSAGE PAYSAGER ============ */}
      {index < totalSteps - 1 && (
        <div className="px-4 py-2 sm:px-5">
          {leg && nextStep && (
            <div className="flex items-stretch gap-2.5">
              {/* Ligne verticale + icône du mode de transport */}
              <div className="flex w-[72px] shrink-0 flex-col items-center sm:w-20">
                <div className="h-2 w-px bg-line" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink shadow-2xs">
                  {getTransportIcon(leg.mode)}
                </span>
                <div className="w-px flex-1 bg-line" />
              </div>

              {/* Détail du trajet */}
              <div className="min-w-0 flex-1 rounded-2xl border border-line bg-paper/70 px-3 py-2">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px]">
                  <span className="font-semibold text-ink">{leg.mode}</span>
                  <span className="text-line-strong">·</span>
                  <span className="text-muted">{leg.duration}</span>
                  {legDistance && (
                    <>
                      <span className="text-line-strong">·</span>
                      <span className="text-muted">{legDistance}</span>
                    </>
                  )}
                  {leg.cost > 0 && (
                    <>
                      <span className="text-line-strong">·</span>
                      <span className="font-semibold text-emerald-700">
                        {leg.cost.toFixed(2)} €
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                  <span className="truncate">{act.name}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-line-strong" />
                  <span className="truncate">{nextStep.activity.name}</span>
                </p>

                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Voir l'itinéraire sur Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Passage par parc, jardin ou monument paysager */}
          {scenic && (
            <div className="mt-1 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-3.5 transition-colors hover:bg-emerald-50/80">
              <div className="flex items-start gap-3">
                <SafeImage
                  src={scenic.photoUrl}
                  alt={scenic.name}
                  onClick={() => setIsScenicExpanded(!isScenicExpanded)}
                  className="h-16 w-16 shrink-0 cursor-pointer rounded-xl border border-emerald-200 object-cover transition-transform hover:scale-105"
                  icon={<Leaf className="h-5 w-5 text-emerald-700/40" aria-hidden="true" />}
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Leaf className="h-2.5 w-2.5" />
                      Passage paysager
                    </span>

                    <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      {scenic.safetyRating} ({scenic.safetyScore}%)
                    </span>

                    <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                      <Users className="h-3 w-3 text-blue-600" />
                      {scenic.crowdLevel}
                    </span>

                    <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-ink">{scenic.rating}</span>
                      <span>({scenic.verifiedReviewsCount})</span>
                    </span>
                  </div>

                  <h5 className="font-serif text-sm font-semibold leading-snug text-ink">{scenic.name}</h5>

                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{scenic.description}</p>

                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsScenicExpanded(!isScenicExpanded)}
                      className="flex items-center gap-1 font-semibold text-emerald-900 hover:text-emerald-700"
                    >
                      <Camera className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Spot photo & cadrage</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isScenicExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(scenic.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-0.5 font-semibold text-ink-soft hover:text-accent"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                  {isScenicExpanded && (
                    <div className="animate-in mt-3 space-y-1.5 rounded-xl border border-emerald-200/70 bg-white p-3 text-xs">
                      <p className="flex items-center gap-1.5 font-semibold text-ink">
                        <Camera className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{scenic.instagrammableSpot}</span>
                      </p>
                      <p className="leading-relaxed text-muted">
                        <strong className="font-semibold text-ink-soft">Conseil :</strong> {scenic.photoTips}
                      </p>
                      <p className="flex items-center gap-1 font-medium text-amber-800">
                        <Sun className="h-3 w-3 text-amber-500" />
                        <span>Golden hour : {scenic.goldenHour}</span>
                      </p>

                      {onOpenPhotoSpot && matchingSpot && (
                        <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                          <span className="text-[10px] text-muted">Avis multi-plateformes</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPhotoSpot(matchingSpot);
                            }}
                            className="rounded-lg bg-ink px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-ink-soft"
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
