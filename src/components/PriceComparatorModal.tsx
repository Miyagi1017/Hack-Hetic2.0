import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Check,
  ExternalLink,
  Star,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Download,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  TrendingDown,
  Navigation,
  Tag,
  Filter,
  ArrowUpDown,
  Gift,
  Percent,
} from 'lucide-react';
import { Activity, BookingKind, BookingOffer, Reservation } from '../types/travel';
import { resolveActivityOffers, offerKind, OFFER_KIND_META } from '../data/offers';
import { SafeImage } from './SafeImage';

interface PriceComparatorModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  travelersCount: number;
  onConfirmBooking: (reservation: Reservation) => void;
  city?: string;
  dateLabel?: string;
  userEmail?: string;
  userName?: string;
}

type SortMode = 'recommande' | 'prix' | 'note' | 'promo';

const SORTS: { id: SortMode; label: string }[] = [
  { id: 'recommande', label: 'Recommandé' },
  { id: 'prix', label: 'Prix croissant' },
  { id: 'note', label: 'Mieux notés' },
  { id: 'promo', label: 'Meilleures promos' },
];

const KIND_FILTERS: { id: BookingKind | 'tous'; label: string }[] = [
  { id: 'tous', label: 'Tout' },
  { id: 'billet', label: 'Billets' },
  { id: 'activité', label: 'Activités' },
  { id: 'événement', label: 'Événements' },
  { id: 'festivité', label: 'Festivités' },
  { id: 'gratuit', label: 'Gratuit' },
];

const euro = (value: number) =>
  value === 0
    ? 'Gratuit'
    : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;

export const PriceComparatorModal: React.FC<PriceComparatorModalProps> = ({
  activity,
  isOpen,
  onClose,
  travelersCount,
  onConfirmBooking,
  city = 'Rome',
  dateLabel = 'Samedi 14 novembre 2026',
  userEmail = 'evan.voyageur@example.com',
  userName = 'Evan',
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [step, setStep] = useState<'compare' | 'checkout' | 'confirmed'>('compare');
  const [leadTravelerName, setLeadTravelerName] = useState(userName);
  const [leadTravelerEmail, setLeadTravelerEmail] = useState(userEmail);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const [kindFilter, setKindFilter] = useState<BookingKind | 'tous'>('tous');
  const [tourOperator, setTourOperator] = useState<string>('tous');
  const [promoOnly, setPromoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>('recommande');

  const cityName = city.split(',')[0];

  // Réinitialise la sélection quand on change d’activité
  useEffect(() => {
    setSelectedOfferId('');
    setStep('compare');
    setKindFilter('tous');
    setTourOperator('tous');
    setPromoOnly(false);
    setSortBy('recommande');
    setLeadTravelerName(userName);
    setLeadTravelerEmail(userEmail);
  }, [activity?.id, isOpen, userName, userEmail]);

  const offers = useMemo(
    () => (activity ? resolveActivityOffers(activity, cityName, cityName) : []),
    [activity, cityName]
  );

  const providers = useMemo(
    () => Array.from(new Set(offers.map((offer) => offer.provider))).sort((a, b) => a.localeCompare(b, 'fr')),
    [offers]
  );

  const visibleOffers = useMemo(() => {
    const filtered = offers.filter((offer) => {
      if (kindFilter !== 'tous' && offerKind(offer) !== kindFilter) return false;
      if (tourOperator !== 'tous' && offer.provider !== tourOperator) return false;
      if (promoOnly && !offer.promo) return false;
      return true;
    });

    const discountOf = (offer: BookingOffer) =>
      offer.originalPrice && offer.originalPrice > 0
        ? (offer.originalPrice - offer.price) / offer.originalPrice
        : 0;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'prix') return a.price - b.price;
      if (sortBy === 'note') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === 'promo') return discountOf(b) - discountOf(a);
      if (a.isBestDeal) return -1;
      if (b.isBestDeal) return 1;
      if (a.isFree !== b.isFree) return a.isFree ? 1 : -1;
      return a.price - b.price;
    });
  }, [offers, kindFilter, tourOperator, promoOnly, sortBy]);

  if (!isOpen || !activity) return null;

  const selectedOffer =
    visibleOffers.find((offer) => offer.id === selectedOfferId) ??
    visibleOffers[0] ??
    offers[0];

  const totalPrice = selectedOffer.price * travelersCount;
  const isFree = selectedOffer.isFree || selectedOffer.price === 0;

  const maxSaving = offers.reduce((best, offer) => {
    if (!offer.originalPrice || offer.originalPrice <= offer.price) return best;
    return Math.max(best, Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100));
  }, 0);

  const promoCount = offers.filter((offer) => offer.promo).length;
  const freeCount = offers.filter((offer) => offer.isFree || offer.price === 0).length;

  const handleBookNow = () => {
    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      activityId: activity.id,
      activityName: activity.name,
      category: activity.category,
      provider: selectedOffer.provider,
      date: dateLabel,
      time: activity.time,
      travelers: travelersCount,
      totalPrice,
      status: 'confirmée',
      reference: `ODY-${Math.floor(100000 + Math.random() * 900000)}`,
      createdDate: new Date().toLocaleDateString('fr-FR'),
    };

    setConfirmedReservation(reservation);
    onConfirmBooking(reservation);
    setStep('confirmed');
  };

  const handleClose = () => {
    setStep('compare');
    setSelectedOfferId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-y-auto rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-white/95 p-5 backdrop-blur-md">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              <Percent className="h-3 w-3" />
              Comparateur & tour-opérateurs
            </span>
            <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
              {step === 'compare' && 'Comparer les offres disponibles'}
              {step === 'checkout' && 'Finaliser la réservation'}
              {step === 'confirmed' && 'Réservation confirmée !'}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {dateLabel}
              </span>
              <span className="text-line-strong">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {cityName}
              </span>
              <span className="text-line-strong">•</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {travelersCount} voyageur{travelersCount > 1 ? 's' : ''}
              </span>
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer le comparateur"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 space-y-5 p-5 sm:p-6">
          {/* Activité */}
          <div className="flex items-start gap-4 rounded-2xl border border-line bg-paper p-4">
            {activity.image && (
              <SafeImage
                src={activity.image}
                alt={activity.name}
                className="h-20 w-20 shrink-0 rounded-xl border border-line object-cover"
                icon={<MapPin className="h-5 w-5 text-ink/25" aria-hidden="true" />}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold text-ink">
                  {activity.category}
                </span>
                {activity.rating && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-ink">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {activity.rating}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-semibold text-muted">
                  <Clock className="h-3 w-3" /> {activity.time} · {activity.duration}
                </span>
              </div>
              <h3 className="truncate font-serif text-base font-semibold text-ink">{activity.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{activity.address}</span>
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-line/60 pt-2">
                <a
                  href={
                    activity.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activity.name} ${activity.address}`
                    )}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                {activity.streetViewUrl && (
                  <a
                    href={activity.streetViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-muted underline underline-offset-2 hover:text-ink"
                  >
                    <span>Street View 360°</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ÉTAPE 1 : COMPARATEUR */}
          {step === 'compare' && (
            <div className="space-y-4">
              {/* Bandeau chiffres */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-line bg-white p-2.5 text-center">
                  <span className="block font-serif text-lg font-semibold text-ink">{offers.length}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted">Fournisseurs</span>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-center">
                  <span className="block font-serif text-lg font-semibold text-amber-900">{promoCount}</span>
                  <span className="text-[10px] uppercase tracking-wide text-amber-800">Offres promo</span>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-center">
                  <span className="block font-serif text-lg font-semibold text-emerald-800">{freeCount}</span>
                  <span className="text-[10px] uppercase tracking-wide text-emerald-700">Gratuit</span>
                </div>
              </div>

              {/* Filtres */}
              <div className="space-y-2.5 rounded-2xl border border-line bg-paper p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <Filter className="h-3.5 w-3.5" /> Type
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {KIND_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setKindFilter(filter.id)}
                        aria-pressed={kindFilter === filter.id}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          kindFilter === filter.id
                            ? 'border-ink bg-ink text-white'
                            : 'border-line bg-white text-ink-soft hover:border-line-strong'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-line/70 pt-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Tour-opérateur
                  </span>
                  <select
                    value={tourOperator}
                    onChange={(event) => setTourOperator(event.target.value)}
                    aria-label="Choisir un tour-opérateur"
                    className="min-w-[9rem] flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-ink focus:outline-none"
                  >
                    <option value="tous">Tous les sites ({offers.length})</option>
                    {providers.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortMode)}
                      aria-label="Trier les offres"
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-ink focus:outline-none"
                    >
                      {SORTS.map((sort) => (
                        <option key={sort.id} value={sort.id}>
                          {sort.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPromoOnly((prev) => !prev)}
                    aria-pressed={promoOnly}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                      promoOnly
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-line bg-white text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    Promos uniquement
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <p className="font-semibold uppercase tracking-wider text-muted">
                  {visibleOffers.length} offre{visibleOffers.length > 1 ? 's' : ''} comparée
                  {visibleOffers.length > 1 ? 's' : ''}
                </p>
                {maxSaving > 0 && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-800">
                    <TrendingDown className="h-3.5 w-3.5" /> Jusqu’à -{maxSaving}%
                  </span>
                )}
              </div>

              {/* Liste des offres */}
              <div className="space-y-3">
                {visibleOffers.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-line-strong bg-paper p-6 text-center">
                    <p className="text-sm font-semibold text-ink">Aucune offre pour ces filtres</p>
                    <p className="mt-1 text-xs text-muted">
                      Réinitialisez le type ou le tour-opérateur pour retrouver les {offers.length} offres.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setKindFilter('tous');
                        setTourOperator('tous');
                        setPromoOnly(false);
                      }}
                      className="mt-3 cursor-pointer rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-ink-soft"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}

                {visibleOffers.map((offer) => {
                  const isSelected = selectedOffer.id === offer.id;
                  const kindMeta = OFFER_KIND_META[offerKind(offer)];
                  const discount =
                    offer.originalPrice && offer.originalPrice > offer.price
                      ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
                      : 0;
                  const offerIsFree = offer.isFree || offer.price === 0;

                  return (
                    <div
                      key={offer.id}
                      onClick={() => setSelectedOfferId(offer.id)}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedOfferId(offer.id);
                        }
                      }}
                      className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-ink bg-paper/60 shadow-md ring-2 ring-ink/10'
                          : 'border-line bg-white hover:border-line-strong'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-base font-semibold text-ink">{offer.provider}</h4>
                            {offer.isBestDeal && (
                              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                MEILLEUR PRIX
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${kindMeta.className}`}
                            >
                              <span aria-hidden="true">{kindMeta.icon}</span>
                              {kindMeta.label}
                            </span>
                            {discount > 0 && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                                -{discount}%
                              </span>
                            )}
                            {offerIsFree && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                GRATUIT
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-medium text-emerald-800">
                            ✓ {offer.cancellationPolicy}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                            {offer.rating && (
                              <span className="flex items-center gap-1 font-semibold text-ink">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {offer.rating.toFixed(1)}
                                <span className="font-normal text-muted">
                                  ({offer.reviewsCount?.toLocaleString('fr-FR')} avis)
                                </span>
                              </span>
                            )}
                            {offer.promo && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-900">
                                <Gift className="h-3 w-3" />
                                {offer.promo.label}
                                {offer.promo.code && (
                                  <span className="rounded bg-white px-1 font-mono text-[10px]">
                                    {offer.promo.code}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {offer.originalPrice && offer.originalPrice > offer.price && (
                            <span className="block text-xs text-muted line-through">
                              {euro(offer.originalPrice * travelersCount)}
                            </span>
                          )}
                          <span className="block font-serif text-xl font-semibold text-ink">
                            {offerIsFree ? '0 €' : euro(offer.price * travelersCount)}
                          </span>
                          <span className="block text-[11px] text-muted">
                            {offerIsFree ? 'accès libre' : `soit ${euro(offer.price)} / pers.`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3 text-xs text-ink">
                        {offer.features.map((feature, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1"
                          >
                            <Check className="h-3 w-3 text-emerald-600" />
                            {feature}
                          </span>
                        ))}
                      </div>

                      {offer.link && (
                        <a
                          href={offer.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                        >
                          Voir l’offre sur {offer.provider}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-line bg-paper p-3 text-xs text-muted">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                <span>
                  Garantie meilleur prix Odyssée : billets, activités, événements et festivités transmis
                  instantanément sur votre pass de voyage. Options gratuites incluses.
                </span>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : PAIEMENT */}
          {step === 'checkout' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2 rounded-2xl border border-line bg-paper p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tour-opérateur sélectionné</span>
                  <span className="font-semibold text-ink">{selectedOffer.provider}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Formule</span>
                  <span className="font-semibold text-ink">
                    {OFFER_KIND_META[offerKind(selectedOffer)].label}
                    {selectedOffer.promo ? ` · ${selectedOffer.promo.label}` : ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Nombre de voyageurs</span>
                  <span className="font-semibold text-ink">{travelersCount} adultes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Date & créneau</span>
                  <span className="font-semibold text-ink">
                    {dateLabel} · {activity.time}
                  </span>
                </div>
                {selectedOffer.promo?.code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Code promo appliqué</span>
                    <span className="rounded bg-white px-2 py-0.5 font-mono text-xs font-semibold text-amber-900">
                      {selectedOffer.promo.code}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                  <span>Total à régler</span>
                  <span className="font-serif text-xl">{isFree ? '0 €' : `${totalPrice.toFixed(2)} €`}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Coordonnées du voyageur principal
                </h4>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">Prénom & Nom</label>
                  <input
                    type="text"
                    value={leadTravelerName}
                    onChange={(event) => setLeadTravelerName(event.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    Email pour l’envoi des billets
                  </label>
                  <input
                    type="email"
                    value={leadTravelerEmail}
                    onChange={(event) => setLeadTravelerEmail(event.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                <span>
                  {isFree
                    ? 'Aucun paiement demandé : l’accès gratuit est confirmé immédiatement.'
                    : 'Paiement sécurisé et garanti. Vous ne serez débité qu’après validation du créneau.'}
                </span>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : CONFIRMATION */}
          {step === 'confirmed' && confirmedReservation && (
            <div className="animate-in zoom-in-95 space-y-5 py-2 text-center duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-semibold text-ink">
                  Votre réservation est confirmée !
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Les billets ont été enregistrés dans votre carnet de voyage Odyssée.
                </p>
              </div>

              <div className="relative mx-auto max-w-md space-y-4 overflow-hidden rounded-[26px] border-2 border-dashed border-line-strong bg-paper p-6 text-left">
                <div className="flex items-start justify-between border-b border-line pb-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {confirmedReservation.totalPrice === 0 ? 'Pass gratuit' : 'Billet officiel'}
                    </span>
                    <h4 className="text-base font-semibold text-ink">{confirmedReservation.activityName}</h4>
                    <p className="text-xs text-muted">Fournisseur : {confirmedReservation.provider}</p>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                    CONFIRMÉ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-muted">Date</span>
                    <span className="font-semibold text-ink">{confirmedReservation.date}</span>
                  </div>
                  <div>
                    <span className="block text-muted">Heure d’accès</span>
                    <span className="font-semibold text-ink">{confirmedReservation.time}</span>
                  </div>
                  <div>
                    <span className="block text-muted">Voyageur</span>
                    <span className="font-semibold text-ink">
                      {leadTravelerName} ({confirmedReservation.travelers} pers.)
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Référence</span>
                    <span className="font-mono font-semibold text-ink">{confirmedReservation.reference}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-3.5 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-muted">
                      {confirmedReservation.totalPrice === 0 ? 'Entrée libre' : 'Pass d’accès rapide'}
                    </span>
                    <p className="text-xs font-semibold text-ink">
                      {confirmedReservation.totalPrice === 0
                        ? 'Présentez-vous sans réservation'
                        : 'À présenter sur smartphone à l’entrée'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white">
                    <QrCode className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-paper"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Télécharger le voucher</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-white p-5">
          {step === 'compare' &&
            (visibleOffers.length === 0 ? (
              <>
                <span className="text-xs text-muted">
                  Aucune offre ne correspond à ces filtres.
                </span>
                <button
                  onClick={() => {
                    setKindFilter('tous');
                    setTourOperator('tous');
                    setPromoOnly(false);
                  }}
                  className="cursor-pointer rounded-2xl bg-ink px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <span className="block truncate text-xs text-muted">
                    {selectedOffer.provider} · {travelersCount} pers.
                    {selectedOffer.promo ? ` · ${selectedOffer.promo.label}` : ''}
                  </span>
                  <span className="font-serif text-xl font-semibold text-ink">
                    {isFree ? 'Gratuit' : euro(totalPrice)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (isFree) {
                      handleBookNow();
                    } else {
                      setStep('checkout');
                    }
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-soft"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="truncate">
                    {isFree ? 'Réserver gratuitement' : `Continuer avec ${selectedOffer.provider}`}
                  </span>
                </button>
              </>
            ))}

          {step === 'checkout' && (
            <>
              <button
                onClick={() => setStep('compare')}
                className="cursor-pointer rounded-2xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink transition-colors hover:bg-paper"
              >
                Retour
              </button>
              <button
                onClick={handleBookNow}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-soft"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {isFree ? 'Confirmer l’accès gratuit' : `Confirmer la réservation (${euro(totalPrice)})`}
                </span>
              </button>
            </>
          )}

          {step === 'confirmed' && (
            <button
              onClick={handleClose}
              className="w-full cursor-pointer rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
            >
              Voir mon itinéraire mis à jour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
