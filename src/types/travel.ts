export type ActivityCategory = 'Culture' | 'Gastronomie' | 'Nature' | 'Insolite' | 'Vie nocturne' | 'Hébergement' | 'Transport';

export type BookingKind = 'billet' | 'activité' | 'événement' | 'festivité' | 'gratuit';

export interface BookingPromo {
  label: string;
  code?: string;
  percent?: number;
}

export interface BookingOffer {
  id: string;
  provider: string;
  price: number;
  originalPrice?: number;
  currency: string;
  isBestDeal?: boolean;
  features: string[];
  cancellationPolicy: string;
  rating?: number;
  reviewsCount?: number;
  kind?: BookingKind;
  promo?: BookingPromo;
  isFree?: boolean;
  link?: string;
}

export interface CityTradition {
  id: string;
  title: string;
  description: string;
  doTip: string;
  dontTip: string;
  category: 'coutume' | 'étiquette' | 'festivité' | 'sécurité';
}

export interface CityFestival {
  id: string;
  name: string;
  period: string;
  description: string;
  isFree: boolean;
  priceFrom?: number;
}

export interface Reservation {
  id: string;
  activityId: string;
  activityName: string;
  category: ActivityCategory;
  provider: string;
  date: string;
  time: string;
  travelers: number;
  totalPrice: number;
  status: 'confirmée' | 'en_attente';
  reference: string;
  qrCodeUrl?: string;
  createdDate: string;
}

export interface DestinationOption {
  id: string;
  name: string;
  country: string;
  region: string;
  center: [number, number];
  zoom: number;
  coverImage: string;
  tagline: string;
  currency: string;
}

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  address: string;
  lat: number;
  lng: number;
  time: string;
  duration: string;
  price: number;
  rating?: number;
  image?: string;
  description?: string;
  openingHours?: string;
  isConfirmed?: boolean;
  googleMapsUrl?: string;
  streetViewUrl?: string;
  bookingOffers?: BookingOffer[];
}

export interface TravelOption {
  mode: 'Marche' | 'Métro' | 'Uber' | 'Vélo' | 'Bus' | 'Voiture';
  duration: string;
  durationMinutes: number;
  cost: number;
  icon?: string;
  co2?: string;
}

export interface ConflictDetails {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium';
  timeNeeded: number; // in minutes
  timeAvailable: number; // in minutes
  solutions: ConflictSolution[];
}

export interface ConflictSolution {
  id: string;
  title: string;
  desc: string;
  type: 'shift' | 'replace' | 'transport';
  badge: string;
  impact?: string;
  newTime?: string;
  replacementActivity?: Activity;
  newTravelOption?: TravelOption;
}

export type SocialPlatform = 'google' | 'instagram' | 'pinterest' | 'facebook';

export interface SocialReview {
  id: string;
  platform: SocialPlatform;
  authorName: string;
  authorAvatar?: string;
  authorHandle?: string;
  badge?: string; // e.g. "Google Local Guide Niv. 7", "Créateur Pinterest", "Instagram Creator"
  rating?: number; // e.g. 5
  date: string;
  comment: string;
  photoUrl?: string;
  likesCount?: number;
  sharesOrSaves?: number;
  photoTip?: string;
}

export interface PhotoSpotSpotlight {
  id: string;
  name: string;
  locationName: string;
  category: 'monument' | 'jardin' | 'rooftop' | 'ruelle' | 'point_de_vue';
  photoUrl: string;
  secondaryPhotos?: string[];
  platformMetrics: {
    googleRating: number;
    googleReviewsCount: number;
    pinterestSaves: string; // e.g. "48k épingles"
    instagramPosts: string; // e.g. "185k publications"
    facebookRecommendations: string; // e.g. "97% recommandent"
  };
  bestHour: string;
  lightingTip: string;
  angleTip: string;
  outfitTip?: string;
  gearTip?: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  reviews: SocialReview[];
}

export interface InstagramPhotoSpot {
  id: string;
  name: string;
  photoUrl: string;
  bestTime: string;
  lightingTip: string;
  popularityScore: number;
  lat: number;
  lng: number;
}

export interface ScenicPassage {
  id: string;
  name: string;
  type: 'jardin' | 'parc' | 'belvedere' | 'monument_paysager';
  description: string;
  photoUrl: string;
  secondaryPhotos?: string[];
  safetyRating: 'Zone très sûre' | 'Sûre' | 'Surveillée';
  safetyScore: number; // e.g. 98%
  crowdLevel: 'Très fréquenté' | 'Animé' | 'Calme & Agréable';
  verifiedReviewsCount: number;
  rating: number;
  instagrammableSpot: string;
  photoTips: string;
  goldenHour: string;
  lat: number;
  lng: number;
  socialReviews?: SocialReview[];
  photoSpotSpotlight?: PhotoSpotSpotlight;
}

export interface ItineraryStep {
  activity: Activity;
  travel?: TravelOption;
  conflict?: ConflictDetails;
  scenicPassage?: ScenicPassage;
  notes?: string;
  userRating?: number;
  instagramSpots?: InstagramPhotoSpot[];
  socialReviews?: SocialReview[];
  photoSpotSpotlights?: PhotoSpotSpotlight[];
}

export interface DestinationRestriction {
  id: string;
  title: string;
  category: 'formalité' | 'écologie' | 'taxe' | 'santé';
  status: 'obligatoire' | 'info' | 'recommandé';
  description: string;
  details: string;
  source: string;
  lastUpdated: string;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  center: [number, number];
  zoom: number;
  duration: string;
  daysCount: number;
  currentDay: number;
  dates: string;
  /** Date ISO (AAAA-MM-JJ) du premier jour, pour afficher la date réelle de chaque étape. */
  startDate?: string;
  travelers: number;
  budgetTotal: number;
  coverImage: string;
  steps: Record<number, ItineraryStep[]>;
  restrictions: DestinationRestriction[];
  weather?: {
    temperature: number;
    condition: string;
    summary: string;
    advice: string;
  };
  budgetBreakdown?: {
    lodging: number;
    food: number;
    lodgingLabel: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  locations?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    category?: ActivityCategory;
    description?: string;
  }[];
  groundingSources?: {
    title: string;
    url: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  preferences: string[];
  travelStyle: string;
  dietaryRestrictions?: string[];
  savedCollectionsCount: number;
  upcomingTripsCount: number;
}
