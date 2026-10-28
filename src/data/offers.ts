import { Activity, BookingKind, BookingOffer, BookingPromo } from '../types/travel';

/* ------------------------------------------------------------------
   Comparateur multi-fournisseurs
   Chaque activité reçoit un jeu d'offres déterministe (même activité =
   mêmes offres) couvrant : billets, activités, événements, festivités et
   options gratuites. Les prix restent réalistes et varient selon la ville.
   ------------------------------------------------------------------ */

export const OFFER_KIND_META: Record<BookingKind, { label: string; icon: string; className: string }> = {
  billet: {
    label: 'Billet',
    icon: '🎟️',
    className: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  activité: {
    label: 'Activité',
    icon: '🧭',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  événement: {
    label: 'Événement',
    icon: '🎭',
    className: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  festivité: {
    label: 'Festivité',
    icon: '🎉',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  gratuit: {
    label: 'Gratuit',
    icon: '🆓',
    className: 'bg-paper-deep text-ink border-line-strong',
  },
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return hash;
};

const round = (value: number): number => Math.max(0, Math.round(value));

const searchUrl = (base: string, query: string): string =>
  `${base}${encodeURIComponent(query)}`;

interface ProviderSpec {
  provider: string;
  multiplier: number;
  rating: number;
  reviews: number;
  features: string[];
  cancellation: string;
  url: (query: string) => string;
}

const PROVIDERS: ProviderSpec[] = [
  {
    provider: 'Site Officiel',
    multiplier: 1,
    rating: 4.7,
    reviews: 18400,
    features: ['Billet officiel nominatif', 'Créneau d’entrée garanti', 'Sans frais intermédiaires'],
    cancellation: 'Non modifiable · remboursable sous conditions',
    url: (query) => searchUrl('https://www.google.com/search?q=', `${query} site officiel billetterie`),
  },
  {
    provider: 'Booking.com',
    multiplier: 1.08,
    rating: 4.6,
    reviews: 9650,
    features: ['Réservation instantanée', 'Annulation flexible sur une sélection', 'Paiement sur place possible'],
    cancellation: 'Annulation gratuite jusqu’à 24 h avant',
    url: (query) => searchUrl('https://www.booking.com/searchresults.fr.html?ss=', query),
  },
  {
    provider: 'GetYourGuide',
    multiplier: 1.22,
    rating: 4.8,
    reviews: 14200,
    features: ['Billet mobile coupe-file', 'Guide francophone', 'Support 24/7'],
    cancellation: 'Annulation gratuite jusqu’à 24 h avant',
    url: (query) => searchUrl('https://www.getyourguide.fr/s/?q=', query),
  },
  {
    provider: 'Viator',
    multiplier: 1.27,
    rating: 4.7,
    reviews: 8800,
    features: ['Guide local certifié', 'Petit groupe (max 12)', 'Assurance annulation offerte'],
    cancellation: 'Annulation gratuite jusqu’à 48 h avant',
    url: (query) => searchUrl('https://www.viator.com/searchResults/all?text=', query),
  },
  {
    provider: 'Tiqets',
    multiplier: 1.15,
    rating: 4.9,
    reviews: 5200,
    features: ['Coupe-file express', 'Confirmation immédiate', 'Billet dans l’app Odyssée'],
    cancellation: 'Remboursement garanti sous 24 h',
    url: (query) => searchUrl('https://www.tiqets.com/fr/recherche?q=', query),
  },
  {
    provider: 'Musement',
    multiplier: 1.12,
    rating: 4.5,
    reviews: 3100,
    features: ['Offres locales exclusives', 'Bon cadeau disponible', 'Guide audio inclus'],
    cancellation: 'Annulation gratuite jusqu’à 72 h avant',
    url: (query) => searchUrl('https://www.musement.com/fr/search/?q=', query),
  },
  {
    provider: 'Klook',
    multiplier: 1.02,
    rating: 4.6,
    reviews: 4700,
    features: ['Prix web exclusif', 'Billet QR code', 'Cashback voyage'],
    cancellation: 'Non modifiable après validation',
    url: (query) => searchUrl('https://www.klook.com/fr/search/result/?query=', query),
  },
  {
    provider: 'Civitatis',
    multiplier: 1.06,
    rating: 4.8,
    reviews: 6300,
    features: ['Guide francophone garanti', 'Groupes à taille humaine', 'Bon d’échange papier accepté'],
    cancellation: 'Annulation gratuite jusqu’à 24 h avant',
    url: (query) => searchUrl('https://www.civitatis.com/fr/buscar?q=', query),
  },
  {
    provider: 'Headout',
    multiplier: 1.18,
    rating: 4.4,
    reviews: 2400,
    features: ['Tarifs dégressifs dès 4 pers.', 'E-billet immédiat', 'Assistance WhatsApp'],
    cancellation: 'Annulation gratuite jusqu’à 12 h avant',
    url: (query) => searchUrl('https://www.headout.com/search/?q=', query),
  },
  {
    provider: 'Expedia',
    multiplier: 1.31,
    rating: 4.3,
    reviews: 3900,
    features: ['Combinez avec l’hôtel (-8 %)', 'Programme de fidélité', 'Paiement en 3 fois'],
    cancellation: 'Annulation gratuite jusqu’à 7 jours avant',
    url: (query) => searchUrl('https://www.expedia.fr/Activites-Recherche?q=', query),
  },
  {
    provider: 'Airbnb',
    multiplier: 1.24,
    rating: 4.7,
    reviews: 1800,
    features: ['Expérience avec un habitant', 'Petit groupe convivial', 'Boisson locale offerte'],
    cancellation: 'Annulation gratuite jusqu’à 48 h avant',
    url: (query) => searchUrl('https://www.airbnb.fr/s/', `${query}/experiences`),
  },
  {
    provider: 'Tripadvisor',
    multiplier: 1.1,
    rating: 4.2,
    reviews: 12400,
    features: ['Comparateur de notes vérifiées', 'Meilleures offres agrégées', 'Liens directs partenaires'],
    cancellation: 'Selon le partenaire sélectionné',
    url: (query) => searchUrl('https://www.tripadvisor.fr/Search?q=', query),
  },
];

const PROMOS: BookingPromo[] = [
  { label: 'Offre d’automne', percent: 15, code: 'AUTOMNE15' },
  { label: 'Early booking', percent: 10 },
  { label: 'Flash 48 h', percent: 25, code: 'FLASH48' },
  { label: 'Code Odyssée', percent: 12, code: 'ODYSSEE12' },
  { label: 'Tarif résident / étudiant', percent: 20 },
  { label: 'Pack famille (dès 3 pers.)', percent: 18, code: 'FAMILLE18' },
  { label: 'Dernière minute', percent: 30, code: 'MINUTE30' },
];

const FESTIVAL_BY_CITY: Record<string, { name: string; price: number }[]> = {
  rome: [
    { name: 'Festa della Repubblica — accès cérémonies', price: 0 },
    { name: 'Estate Romana — cinéma en plein air', price: 6 },
    { name: 'Rome Film Fest — projection découverte', price: 12 },
  ],
  paris: [
    { name: 'Journées du Patrimoine — accès guidé', price: 0 },
    { name: 'Fête de la Musique — scène du quartier', price: 0 },
    { name: 'Nuit Blanche — parcours d’art contemporain', price: 9 },
  ],
  barcelone: [
    { name: 'Festa Major de Gràcia — décorations', price: 0 },
    { name: 'Festival Grec — spectacle en plein air', price: 14 },
  ],
  tokyo: [
    { name: 'Matsuri de quartier — procession', price: 0 },
    { name: 'Hanabi — soirée feux d’artifice', price: 11 },
  ],
  default: [
    { name: 'Fête locale — village gourmand', price: 0 },
    { name: 'Marché nocturne — animation musicale', price: 7 },
  ],
};

const kindForCategory = (category: Activity['category']): BookingKind => {
  switch (category) {
    case 'Culture':
      return 'billet';
    case 'Insolite':
      return 'événement';
    case 'Transport':
      return 'billet';
    default:
      return 'activité';
  }
};

const cityKey = (city: string): string => city.trim().toLowerCase().split(',')[0];

/**
 * Construit toutes les offres comparables pour une activité donnée.
 * @param activity activité du programme
 * @param city ville de séjour (Rome, Paris…)
 * @param cityLabel libellé affichable de la ville
 */
export const buildActivityOffers = (
  activity: Activity,
  city: string,
  cityLabel?: string
): BookingOffer[] => {
  const label = cityLabel ?? city;
  const seed = hashString(`${activity.id}-${activity.name}-${label}`);
  const base = activity.price > 0 ? activity.price : 18;
  const mainKind = kindForCategory(activity.category);
  const offers: BookingOffer[] = [];

  PROVIDERS.forEach((spec, index) => {
    const jitter = ((seed + index * 37) % 9) - 4; // ±4 %
    const hasPromo = (seed + index * 13) % 3 !== 0;
    const promo = hasPromo ? PROMOS[(seed + index) % PROMOS.length] : undefined;
    const rawPrice = base * spec.multiplier * (1 + jitter / 100);
    const price = round(rawPrice);
    const percent = promo?.percent ?? 0;
    const discounted = percent > 0 ? round(price * (1 - percent / 100)) : price;

    // Quelques fournisseurs proposent aussi une déclinaison événement/festivité
    const kind: BookingKind =
      index === 9 ? 'événement' : index === 10 ? 'festivité' : mainKind;

    offers.push({
      id: `offer-${activity.id}-${index}`,
      provider: spec.provider,
      price: discounted,
      originalPrice: percent > 0 ? price : undefined,
      currency: '€',
      kind,
      promo,
      isFree: false,
      features: spec.features,
      cancellationPolicy: spec.cancellation,
      rating: Number((spec.rating - ((seed + index) % 3) * 0.1).toFixed(1)),
      reviewsCount: spec.reviews + ((seed * 7 + index * 131) % 4000),
      link: spec.url(`${activity.name} ${label}`),
    });
  });

  // Complète les catégories manquantes pour que chaque filtre ait des offres
  const kindsPresent = new Set(offers.map((offer) => offer.kind));
  const extras: Array<{
    kind: BookingKind;
    provider: string;
    multiplier: number;
    features: string[];
    cancellation: string;
    url: (query: string) => string;
  }> = [
    {
      kind: 'activité',
      provider: 'Withlocals',
      multiplier: 1.45,
      features: ['Expérience privée avec un habitant', 'Programme personnalisé', 'Groupe de 2 à 6 personnes'],
      cancellation: 'Annulation gratuite jusqu’à 72 h avant',
      url: (query) => searchUrl('https://www.withlocals.com/search?q=', query),
    },
    {
      kind: 'événement',
      provider: 'Fever',
      multiplier: 1.5,
      features: ['Placement libre catégorie 2', 'E-billet immédiat', 'Accès à l’ouverture des portes'],
      cancellation: 'Échange possible jusqu’à 48 h avant',
      url: (query) => searchUrl('https://feverup.com/fr/search?q=', query),
    },
    {
      kind: 'festivité',
      provider: 'Billetweb',
      multiplier: 1.12,
      features: ['Billet festivité journée', 'Accès aux animations', 'Tarif réduit résidents'],
      cancellation: 'Billet non remboursable',
      url: (query) => searchUrl('https://www.billetweb.fr/recherche?q=', query),
    },
    {
      kind: 'billet',
      provider: 'Ticketmaster',
      multiplier: 1.35,
      features: ['E-billet officiel sécurisé', 'Choix de l’horaire', 'Assurance billet en option'],
      cancellation: 'Remboursement sous conditions',
      url: (query) => searchUrl('https://www.ticketmaster.fr/fr/resultat?q=', query),
    },
  ];

  extras
    .filter((extra) => !kindsPresent.has(extra.kind))
    .forEach((extra, index) => {
      const price = round(base * extra.multiplier);
      offers.push({
        id: `offer-${activity.id}-extra-${index}`,
        provider: extra.provider,
        price,
        originalPrice: round(price * 1.12),
        currency: '€',
        kind: extra.kind,
        promo: { label: 'Offre découverte', percent: 12, code: 'DECOUV12' },
        isFree: false,
        features: extra.features,
        cancellationPolicy: extra.cancellation,
        rating: 4.4,
        reviewsCount: 700 + ((seed + index * 97) % 2800),
        link: extra.url(`${activity.name} ${label}`),
      });
    });

  // Options gratuites : accès libre, événement de ville, festivité
  const festivals = FESTIVAL_BY_CITY[cityKey(label)] ?? FESTIVAL_BY_CITY.default;

  offers.push({
    id: `offer-${activity.id}-free`,
    provider: 'Office de Tourisme',
    price: 0,
    currency: '€',
    kind: 'gratuit',
    isFree: true,
    features: [
      activity.category === 'Culture'
        ? 'Entrée libre (premier dimanche du mois)'
        : 'Accès libre sans réservation',
      'Plan papier & conseils en français',
      'Sans frais de service',
    ],
    cancellationPolicy: 'Sans engagement',
    rating: 4.5,
    reviewsCount: 1200 + (seed % 900),
    link: searchUrl('https://www.google.com/search?q=', `office de tourisme ${label} gratuit`),
  });

  const festival = festivals[seed % festivals.length];
  offers.push({
    id: `offer-${activity.id}-festival`,
    provider: label === 'Rome' ? 'Roma Capitale' : `Ville de ${label}`,
    price: festival.price,
    currency: '€',
    kind: 'festivité',
    isFree: festival.price === 0,
    promo:
      festival.price === 0
        ? { label: 'Entrée gratuite', percent: 100 }
        : { label: 'Tarif festivité', percent: 15, code: 'FEST15' },
    originalPrice: festival.price > 0 ? round(festival.price * 1.2) : undefined,
    features: [festival.name, 'Ambiance locale garantie', 'Accès sans guide'],
    cancellationPolicy: 'Billet non nominatif',
    rating: 4.6,
    reviewsCount: 800 + (seed % 600),
    link: searchUrl('https://www.google.com/search?q=', `${festival.name} ${label}`),
  });

  // Le meilleur prix (gratuit inclus) est identifié une seule fois
  const best = offers.reduce<BookingOffer | null>(
    (current, offer) => (!current || offer.price < current.price ? offer : current),
    null
  );

  return offers.map((offer) => ({
    ...offer,
    isBestDeal: best ? offer.id === best.id : offer.isFree,
  }));
};

/** Offres réellement affichées : celles de l’activité + le jeu généré. */
export const resolveActivityOffers = (
  activity: Activity,
  city: string,
  cityLabel?: string
): BookingOffer[] => {
  const generated = buildActivityOffers(activity, city, cityLabel);
  if (!activity.bookingOffers?.length) return generated;
  const known = new Set(generated.map((offer) => offer.provider));
  const extras = activity.bookingOffers.filter((offer) => !known.has(offer.provider));
  return [...extras, ...generated];
};

export const offerKind = (offer: BookingOffer): BookingKind => offer.kind ?? 'activité';
