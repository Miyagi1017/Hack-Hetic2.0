import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  Euro, 
  Search, 
  Plus, 
  Clock,
  Layers,
  ChevronRight,
  Menu,
  X,
  Ticket,
  ExternalLink,
  Navigation,
  Heart,
  Camera,
  User,
  ArrowRight,
  Shuffle,
  Dices,
  ChevronDown,
  CalendarDays,
  Pencil,
  Coins,
  RefreshCw,
} from 'lucide-react';

import { Activity, ItineraryStep, Trip, ConflictSolution, DestinationOption, Reservation, PhotoSpotSpotlight, UserProfile } from './types/travel';
import { 
  CURRENT_USER, 
  INITIAL_TRIP_ROME, 
  INITIAL_TRIP_PARIS,
  AVAILABLE_DESTINATIONS,
  POPULAR_RECOMMENDATIONS,
  INITIAL_RESERVATIONS,
  CURATED_PHOTO_SPOTS
} from './data/mock-data';
import { InteractiveMap } from './components/InteractiveMap';
import { TimelineItem } from './components/TimelineItem';
import { SafeImage } from './components/SafeImage';
import { ContextPanel } from './components/ContextPanel';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ExploreView } from './components/ExploreView';
import { RestrictionsView } from './components/RestrictionsView';
import { BudgetView } from './components/BudgetView';
import { ProfileModal } from './components/ProfileModal';
import type { ProfileUpdates } from './components/ProfileModal';
import { AddActivityModal } from './components/AddActivityModal';
import { PriceComparatorModal } from './components/PriceComparatorModal';
import { DestinationSelectorModal } from './components/DestinationSelectorModal';
import { ReservationsView } from './components/ReservationsView';
import { WishlistView } from './components/WishlistView';
import { PhotoSpotsModal } from './components/PhotoSpotsModal';
import { PhotoSpotsView } from './components/PhotoSpotsView';
import { BudgetPlanner, BUDGET_MAX } from './components/BudgetPlanner';
import { DateRangeModal } from './components/DateRangeModal';
import type { DateUpdatePayload } from './components/DateRangeModal';
import { AuthScreen } from './components/AuthScreen';
import { WelcomeView } from './components/WelcomeView';
import type { PlanningCard } from './components/WelcomeView';
import { AddTripModal } from './components/AddTripModal';
import { ScheduleModal } from './components/ScheduleModal';
import {
  TripPlan,
  createRandomTripPlans,
  createTripPlan,
  readTripPlans,
  writeTripPlans,
} from './data/trip-plans';
import { clearSession, readSession, saveSession, SessionUser } from './data/session';
import { getCityFestivals, getCityTraditions } from './data/local-traditions';
import { getCityRestrictions } from './data/local-restrictions';
import { getActivityBudget, formatEuros } from './data/activity-budget';
import { recalculateStepsRoute } from './data/route';
import { recalculateProgramForBudget } from './data/budget-recalc';
import {
  applyDatesToTrip,
  clampDaysCount,
  clampTravelers,
  formatDuration,
  formatTripDates,
  readStoredTripDates,
  writeStoredTripDates,
} from './data/trip-dates';

/* ------------------------------------------------------------------
   Enveloppe budget : mémorisée par utilisateur et par voyage
   (chaque voyageur retrouve ses propres réglages sur cet appareil).
   ------------------------------------------------------------------ */
const budgetStorageKey = (tripId: string, email: string) =>
  `odyssee:budget:${email}:${tripId}`;

const readStoredBudget = (tripId: string, email: string): number | null => {
  try {
    const raw = window.localStorage.getItem(budgetStorageKey(tripId, email));
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.min(BUDGET_MAX, parsed);
  } catch {
    return null;
  }
};

const writeStoredBudget = (tripId: string, email: string, value: number) => {
  try {
    window.localStorage.setItem(budgetStorageKey(tripId, email), String(value));
  } catch {
    // Stockage indisponible (navigation privée) : la valeur reste en mémoire.
  }
};

const withStoredBudget = (base: Trip, email: string): Trip => {
  const stored = readStoredBudget(base.id, email);
  return stored == null ? base : { ...base, budgetTotal: stored };
};

/* ------------------------------------------------------------------
   Répartition de l'enveloppe (hébergement / restauration), par voyage.
   ------------------------------------------------------------------ */
const breakdownStorageKey = (tripId: string, email: string) =>
  `odyssee:breakdown:${email}:${tripId}`;

const readStoredBreakdown = (
  tripId: string,
  email: string
): { lodging: number; food: number } | null => {
  try {
    const raw = window.localStorage.getItem(breakdownStorageKey(tripId, email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.lodging !== 'number' ||
      typeof parsed.food !== 'number' ||
      parsed.lodging < 0 ||
      parsed.food < 0
    ) {
      return null;
    }
    return { lodging: parsed.lodging, food: parsed.food };
  } catch {
    return null;
  }
};

const writeStoredBreakdown = (
  tripId: string,
  email: string,
  value: { lodging: number; food: number }
) => {
  try {
    window.localStorage.setItem(breakdownStorageKey(tripId, email), JSON.stringify(value));
  } catch {
    // Stockage indisponible : la répartition reste en mémoire.
  }
};

const withStoredBreakdown = (base: Trip, email: string): Trip => {
  const stored = readStoredBreakdown(base.id, email);
  if (!stored) return base;
  return {
    ...base,
    budgetBreakdown: {
      lodging: stored.lodging,
      food: stored.food,
      lodgingLabel: base.budgetBreakdown?.lodgingLabel ?? 'Hébergement',
    },
  };
};

const shuffleItems = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
};

/** Séjour de référence (programme et dates d'origine) pour un identifiant donné. */
const baseTripFor = (trip: Trip): Trip => {
  if (trip.id === INITIAL_TRIP_PARIS.id) return INITIAL_TRIP_PARIS;
  if (trip.id === INITIAL_TRIP_ROME.id) return INITIAL_TRIP_ROME;
  return {
    ...trip,
    startDate: INITIAL_TRIP_ROME.startDate,
    daysCount: INITIAL_TRIP_ROME.daysCount,
    duration: INITIAL_TRIP_ROME.duration,
    dates: INITIAL_TRIP_ROME.dates,
    steps: INITIAL_TRIP_ROME.steps,
    budgetBreakdown: INITIAL_TRIP_ROME.budgetBreakdown,
  };
};

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(() => readSession());
  const sessionEmail = session?.email ?? CURRENT_USER.email;
  const user: UserProfile = {
    ...CURRENT_USER,
    name: session?.name ?? CURRENT_USER.name,
    email: sessionEmail,
    avatar: session?.avatar || CURRENT_USER.avatar,
    travelStyle: session?.travelStyle ?? CURRENT_USER.travelStyle,
    preferences: session?.preferences ?? CURRENT_USER.preferences,
  };

  const [trip, setTrip] = useState<Trip>(() => {
    const email = readSession()?.email ?? CURRENT_USER.email;
    const base = INITIAL_TRIP_ROME;
    const storedDates = readStoredTripDates(base.id, email);
    const dated = storedDates
      ? applyDatesToTrip(
          base,
          storedDates.startDate,
          storedDates.daysCount,
          storedDates.travelers
        )
      : base;
    return withStoredBreakdown(withStoredBudget(dated, email), email);
  });
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeConflictStep, setActiveConflictStep] = useState<ItineraryStep | null>(null);
  const [resolvedBanner, setResolvedBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'plan' | 'explore' | 'wishlist' | 'photospots' | 'reservations' | 'restrictions' | 'budget'>('home');

  // Séjours prévus : trois destinations aléatoires au premier lancement,
  // puis celles ajoutées manuellement (persistées par utilisateur).
  const [tripPlans, setTripPlans] = useState<TripPlan[]>(() => {
    const email = readSession()?.email ?? CURRENT_USER.email;
    const stored = readTripPlans(email);
    if (stored.length > 0) return stored;
    const generated = createRandomTripPlans(3);
    writeTripPlans(email, generated);
    return generated;
  });
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDay, setScheduleDay] = useState(1);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  
  // Photo Spot Spotlight Modal state (Google, Instagram, Pinterest, Facebook)
  const [selectedPhotoSpot, setSelectedPhotoSpot] = useState<PhotoSpotSpotlight | null>(null);
  const [isPhotoSpotModalOpen, setIsPhotoSpotModalOpen] = useState(false);

  // Wishlist state (Liste d'envies)
  const [wishlist, setWishlist] = useState<Activity[]>([
    POPULAR_RECOMMENDATIONS[0],
    POPULAR_RECOMMENDATIONS[1],
    POPULAR_RECOMMENDATIONS[2],
  ]);

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);

  // Price Comparator Modal state
  const [comparatorActivity, setComparatorActivity] = useState<Activity | null>(null);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // Destination Selector Modal state
  const [isDestinationSelectorOpen, setIsDestinationSelectorOpen] = useState(false);

  // Modification des dates du séjour
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [datesNotice, setDatesNotice] = useState<string | null>(null);

  // Chat Assistant states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatLocations, setChatLocations] = useState<any[]>([]);
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null);

  // Other Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [replacingStepIndex, setReplacingStepIndex] = useState<number | null>(null);
  const [autoLocateNearby, setAutoLocateNearby] = useState(false);
  const [budgetNotice, setBudgetNotice] = useState<string | null>(null);

  // Programme aléatoire, carte en fond et alertes locales
  const [isRandomMenuOpen, setIsRandomMenuOpen] = useState(false);
  const [randomNotice, setRandomNotice] = useState<string | null>(null);
  const [isRestrictionsBannerHidden, setIsRestrictionsBannerHidden] = useState(false);

  const currentSteps = trip.steps[currentDay] || [];
  const hasConflict = currentSteps.some((s) => !!s.conflict);
  const activityBudget = getActivityBudget(trip);

  // Calculate total costs for current itinerary
  const totalCost = Object.values(trip.steps)
    .flat()
    .reduce((sum, s) => sum + s.activity.price + (s.travel?.cost || 0), 0);

  // Useful summaries for the planner hero
  const cityName = trip.destination.split(',')[0];
  const travelMinutes = currentSteps.reduce((sum, s) => sum + (s.travel?.durationMinutes || 0), 0);
  const dayScheduleLabel = (() => {
    const times = currentSteps
      .map((step) => step.activity.time)
      .filter(Boolean)
      .sort();
    if (times.length === 0) return 'Horaires à définir';
    return `${times[0]} – ${times[times.length - 1]}`;
  })();

  // Activités connues autour de la dernière étape du jour (ou du centre-ville)
  const nearbyAnchorActivity = [...currentSteps]
    .reverse()
    .map((step) => step.activity)
    .find(
      (activity) =>
        typeof activity.lat === 'number' && typeof activity.lng === 'number'
    );
  const nearbyAnchor: [number, number] = nearbyAnchorActivity
    ? [nearbyAnchorActivity.lat as number, nearbyAnchorActivity.lng as number]
    : trip.center;
  const nearbyAnchorLabel = nearbyAnchorActivity?.name ?? `${cityName} centre`;
  const knownActivities = (() => {
    const seen = new Set<string>();
    return [
      ...POPULAR_RECOMMENDATIONS,
      ...wishlist,
      ...Object.values(trip.steps)
        .flat()
        .map((step) => step.activity),
    ].filter((activity) => {
      if (seen.has(activity.id)) return false;
      if (typeof activity.lat !== 'number' || typeof activity.lng !== 'number') return false;
      seen.add(activity.id);
      return true;
    });
  })();
  const itineraryActivityIds = Object.values(trip.steps)
    .flat()
    .map((step) => step.activity.id);
  const budgetPercent =
    trip.budgetTotal > 0 ? Math.min(100, Math.round((totalCost / trip.budgetTotal) * 100)) : 0;

  // Date réelle et plage horaire du jour affiché (en-tête du planificateur)
  const getDayDateLabel = (day: number) => {
    if (!trip.startDate) return null;
    const date = new Date(`${trip.startDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    date.setDate(date.getDate() + (day - 1));
    const label = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const dayDateLabel = getDayDateLabel(currentDay);

  const getDayLongDateLabel = (day: number) => {
    if (!trip.startDate) return null;
    const date = new Date(`${trip.startDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    date.setDate(date.getDate() + (day - 1));
    const label = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const comparatorDateLabel =
    getDayLongDateLabel(currentDay) ??
    `${trip.dates} · ${trip.duration}`;

  const mandatoryRestrictions = trip.restrictions.filter((item) => item.status === 'obligatoire');
  const cityTraditions = getCityTraditions(cityName);
  const cityFestivals = getCityFestivals(cityName);

  const dayTimes = currentSteps
    .map((s) => s.activity.time)
    .filter((time): time is string => !!time)
    .sort();

  const dayTimeLabel =
    dayTimes.length > 1 ? `${dayTimes[0]} – ${dayTimes[dayTimes.length - 1]}` : dayTimes[0] ?? null;

  // All planned activities for reservation management
  const allPlannedActivities = Object.values(trip.steps).flat().map((s) => s.activity);

  // Construit un séjour complet pour une destination (avec dates et budget mémorisés)
  const buildTripForDestination = (dest: DestinationOption, forcedId?: string): Trip => {
    const base: Trip =
      dest.id === 'dest-paris'
        ? { ...INITIAL_TRIP_PARIS, id: forcedId ?? INITIAL_TRIP_PARIS.id }
        : {
            ...INITIAL_TRIP_ROME,
            id: forcedId ?? `${dest.id.replace('dest-', 'trip-')}-2026`,
            destination: `${dest.name}, ${dest.country}`,
            country: dest.country,
            center: dest.center,
            zoom: dest.zoom,
            coverImage: dest.coverImage,
            restrictions: getCityRestrictions(dest.name),
          };

    const storedDates = readStoredTripDates(base.id, sessionEmail);
    const datedTrip = storedDates
      ? applyDatesToTrip(
          base,
          storedDates.startDate,
          storedDates.daysCount,
          storedDates.travelers
        )
      : base;

    return withStoredBreakdown(withStoredBudget(datedTrip, sessionEmail), sessionEmail);
  };

  const loadTrip = (nextTrip: Trip) => {
    setTrip(nextTrip);
    setCurrentDay(1);
    setSelectedActivity(null);
    setRandomNotice(null);
    setDatesNotice(null);
    setReplacingStepIndex(null);
    setActiveTab('plan');
    triggerSuccessBanner();
  };

  // Switch destination dynamically
  const handleSelectDestination = (dest: DestinationOption) => {
    loadTrip(buildTripForDestination(dest));
  };

  // Ouvre un séjour prévu depuis l'accueil
  const handleOpenPlan = (planId: string) => {
    const plan = tripPlans.find((item) => item.id === planId);
    if (!plan) return;
    const destination = AVAILABLE_DESTINATIONS.find((item) => item.id === plan.destinationId);
    if (!destination) return;
    loadTrip(buildTripForDestination(destination, plan.id));
  };

  // Ajuste la répartition de l'enveloppe (hébergement / restauration)
  const handleBreakdownChange = (next: { lodging: number; food: number }) => {
    const clampAmount = (value: number) =>
      Math.max(0, Math.min(trip.budgetTotal, Math.round(value)));
    const lodging = clampAmount(next.lodging);
    const food = clampAmount(next.food);

    setTrip((prev) => ({
      ...prev,
      budgetBreakdown: {
        lodging,
        food,
        lodgingLabel: prev.budgetBreakdown?.lodgingLabel ?? 'Hébergement',
      },
    }));
    writeStoredBreakdown(trip.id, sessionEmail, { lodging, food });
    setBudgetNotice(
      `Répartition ajustée : ${formatEuros(lodging)} d'hébergement et ${formatEuros(
        food
      )} de restauration.`
    );
    triggerSuccessBanner();
  };

  // Ajoute une destination aux séjours prévus (plusieurs ajouts possibles)
  const handleAddPlan = (destinationId: string) => {
    const plan = createTripPlan(destinationId);
    if (!plan) return;
    const next = [...tripPlans, plan];
    setTripPlans(next);
    writeTripPlans(sessionEmail, next);
    triggerSuccessBanner();
  };

  const planCards: PlanningCard[] = tripPlans.flatMap((plan) => {
    const destination = AVAILABLE_DESTINATIONS.find((item) => item.id === plan.destinationId);
    if (!destination) return [];
    const stored = readStoredTripDates(plan.id, sessionEmail);
    const storedBudget = readStoredBudget(plan.id, sessionEmail);
    return [
      {
        id: plan.id,
        destination,
        dates: stored
          ? formatTripDates(stored.startDate, stored.daysCount)
          : INITIAL_TRIP_ROME.dates,
        daysCount: stored?.daysCount ?? INITIAL_TRIP_ROME.daysCount,
        travelers: stored?.travelers ?? INITIAL_TRIP_ROME.travelers,
        budgetTotal: storedBudget ?? INITIAL_TRIP_ROME.budgetTotal,
        isCurrent: trip.id === plan.id,
      },
    ];
  });

  // Enveloppe budget : met à jour le séjour et mémorise le choix du voyageur.
  // `adaptActivities` retire les activités qui ne tiennent plus dans l'enveloppe.
  const handleBudgetChange = (nextValue: number, adaptActivities = false) => {
    const budget = Math.max(0, Math.min(BUDGET_MAX, Math.round(nextValue / 10) * 10));

    if (adaptActivities) {
      const result = recalculateProgramForBudget({ ...trip, budgetTotal: budget });
      setTrip(result.trip);
      setBudgetNotice(
        result.removed > 0
          ? `Programme recalculé pour ${formatEuros(budget)} : ${result.removed} activité${
              result.removed > 1 ? 's' : ''
            } retirée${result.removed > 1 ? 's' : ''}, ${result.kept} conservée${
              result.kept > 1 ? 's' : ''
            }.`
          : `Programme recalculé pour ${formatEuros(budget)} : toutes les activités tiennent dans l'enveloppe.`
      );
      triggerSuccessBanner();
    } else {
      setTrip((prev) => ({ ...prev, budgetTotal: budget }));
    }

    writeStoredBudget(trip.id, sessionEmail, budget);
  };

  // Changement de dates : le programme et l'enveloppe s'adaptent à la durée
  const handleDatesUpdate = (payload: DateUpdatePayload) => {
    const nextDays = clampDaysCount(payload.daysCount);
    const nextTravelers = clampTravelers(payload.travelers);
    const previousDays = Math.max(1, trip.daysCount);
    const previousTravelers = Math.max(1, trip.travelers);
    // Rythme de référence par personne et par jour : l'enveloppe reste juste
    // quand la durée ou le nombre de voyageurs évolue.
    const ratePerPersonPerDay = trip.budgetTotal / (previousDays * previousTravelers);
    const candidateBudget =
      payload.manualBudget != null
        ? payload.manualBudget
        : payload.adaptBudget
          ? trip.budgetTotal > 0
            ? ratePerPersonPerDay * nextDays * nextTravelers
            : 110 * nextDays * nextTravelers
          : trip.budgetTotal;
    const budget = Math.max(0, Math.min(BUDGET_MAX, Math.round(candidateBudget / 10) * 10));

    writeStoredBudget(trip.id, sessionEmail, budget);
    writeStoredTripDates(trip.id, sessionEmail, {
      startDate: payload.startDate,
      daysCount: nextDays,
      travelers: nextTravelers,
    });

    setTrip((prev) => ({
      ...applyDatesToTrip(prev, payload.startDate, nextDays, nextTravelers),
      budgetTotal: budget,
    }));

    setCurrentDay((prev) => Math.min(prev, nextDays));
    setIsDateModalOpen(false);

    const euroFormat = (value: number) =>
      `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;
    const travelerLabel = `${nextTravelers} voyageur${nextTravelers > 1 ? 's' : ''}`;
    const dateLabel = `${formatDuration(nextDays)} · ${travelerLabel} · ${formatTripDates(
      payload.startDate,
      nextDays
    )}`;

    const effectiveRate =
      budget > 0 ? budget / (nextDays * nextTravelers) : ratePerPersonPerDay;

    setDatesNotice(
      payload.manualBudget != null
        ? `${dateLabel} — enveloppe ajustée à ${euroFormat(
            budget
          )} (${euroFormat(effectiveRate)} / pers. / jour), selon votre réglage manuel.`
        : payload.adaptBudget
          ? `${dateLabel} — enveloppe recalculée à ${euroFormat(
              budget
            )} (${euroFormat(effectiveRate)} / pers. / jour), au même rythme qu'avant.`
          : `${dateLabel} — enveloppe conservée à ${euroFormat(
              budget
            )}. Ajustez-la dans l'onglet Budget si besoin.`
    );
  };

  // Connexion / déconnexion
  const handleAuthenticate = (nextUser: SessionUser) => {
    saveSession(nextUser);
    setSession(nextUser);
    setTrip((prev) => {
      // Chaque voyageur retrouve ses dates et son enveloppe budgétaire
      const base = baseTripFor(prev);
      const storedDates = readStoredTripDates(base.id, nextUser.email);
      const dated = storedDates
        ? applyDatesToTrip(
            base,
            storedDates.startDate,
            storedDates.daysCount,
            storedDates.travelers
          )
        : base;
      const stored = readStoredBudget(dated.id, nextUser.email);
      const initialBudget =
        dated.id === INITIAL_TRIP_PARIS.id
          ? INITIAL_TRIP_PARIS.budgetTotal
          : INITIAL_TRIP_ROME.budgetTotal;
      const reference = dated.id === INITIAL_TRIP_PARIS.id ? INITIAL_TRIP_PARIS : INITIAL_TRIP_ROME;
      const ratePerPersonPerDay =
        initialBudget / Math.max(1, reference.daysCount * reference.travelers);
      const scaledDefault =
        Math.round(
          ((ratePerPersonPerDay * dated.daysCount * Math.max(1, dated.travelers)) as number) / 10
        ) * 10;
      return { ...dated, budgetTotal: stored ?? scaledDefault };
    });
    setCurrentDay(1);
  };

  const handleLogout = () => {
    clearSession();
    setIsProfileOpen(false);
    setSession(null);
  };

  // Mise à jour du profil et des centres d'intérêt (mémorisés avec la session)
  const handleUpdateProfile = (updates: ProfileUpdates) => {
    if (!session) return;
    const nextSession: SessionUser = { ...session, ...updates };
    saveSession(nextSession);
    setSession(nextSession);
    triggerSuccessBanner();
  };

  // Programme aléatoire (journée ou séjour complet)
  const handleRandomProgram = (scope: 'day' | 'trip') => {
    setTrip((prev) => {
      const days =
        scope === 'day'
          ? [currentDay]
          : Object.keys(prev.steps)
              .map(Number)
              .filter((day) => (prev.steps[day] ?? []).length > 0)
              .sort((a, b) => a - b);

      const nextSteps = { ...prev.steps };

      days.forEach((day) => {
        const steps = prev.steps[day] ?? [];
        if (steps.length < 2) return;

        const activities = steps.map((step) => step.activity);
        let shuffled = shuffleItems(activities);
        if (shuffled.every((activity, index) => activity.id === activities[index].id)) {
          shuffled = [...shuffled.slice(1), shuffled[0]];
        }

        const slots = steps.map((step) => step.activity.time).sort();

        nextSteps[day] = shuffled.map((activity, index) => ({
          ...steps[index],
          activity: { ...activity, time: slots[index] ?? activity.time },
          conflict: undefined,
        }));
      });

      return { ...prev, steps: nextSteps };
    });

    setIsRandomMenuOpen(false);
    setRandomNotice(
      scope === 'day'
        ? `Jour ${currentDay} remixé au hasard : les étapes ont été réordonnées dans la journée.`
        : 'Séjour complet remixé au hasard : chaque journée a été réordonnée.'
    );
  };

  // Open price comparator for an activity
  const handleOpenComparator = (activity: Activity) => {
    setComparatorActivity(activity);
    setIsComparatorOpen(true);
  };

  // Open photo spots & multi-platform reviews modal
  const handleOpenPhotoSpot = (spot: PhotoSpotSpotlight) => {
    setSelectedPhotoSpot(spot);
    setIsPhotoSpotModalOpen(true);
  };

  // Add new confirmed booking
  const handleConfirmBooking = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
    // Mark activity confirmed in current trip
    setTrip((prev) => {
      const updatedSteps = { ...prev.steps };
      for (const day in updatedSteps) {
        updatedSteps[day] = updatedSteps[day].map((step) =>
          step.activity.id === newRes.activityId
            ? { ...step, activity: { ...step.activity, isConfirmed: true } }
            : step
        );
      }
      return { ...prev, steps: updatedSteps };
    });
    triggerSuccessBanner();
  };

  // Handle conflict resolution from modal
  const handleApplySolution = (solution: ConflictSolution) => {
    setTrip((prev) => {
      const updatedSteps = { ...prev.steps };
      const daySteps = [...(updatedSteps[currentDay] || [])];

      if (solution.type === 'shift') {
        const conflictIndex = daySteps.findIndex((s) => s.activity.id === 'act-5');
        const conflictStep = daySteps[conflictIndex];
        if (conflictStep) {
          const shiftedActivity: Activity = {
            ...conflictStep.activity,
            time: '10:00',
            isConfirmed: true,
          };

          const prevStepIndex = daySteps.findIndex((s) => s.conflict);
          if (prevStepIndex !== -1) {
            daySteps[prevStepIndex] = { ...daySteps[prevStepIndex], conflict: undefined };
          }
          const filteredDay1 = daySteps.filter((s) => s.activity.id !== 'act-5');
          updatedSteps[currentDay] = filteredDay1;

          const day2Steps = [...(updatedSteps[2] || [])];
          day2Steps.unshift({
            activity: shiftedActivity,
            travel: { mode: 'Marche', duration: '15 min', durationMinutes: 15, cost: 0 },
          });
          updatedSteps[2] = day2Steps;
        }
      } else if (solution.type === 'replace' && solution.replacementActivity) {
        const conflictIndex = daySteps.findIndex((s) => s.activity.id === 'act-5');
        const prevStepIndex = daySteps.findIndex((s) => s.conflict);
        if (prevStepIndex !== -1) {
          daySteps[prevStepIndex] = {
            ...daySteps[prevStepIndex],
            conflict: undefined,
            travel: { mode: 'Marche', duration: '3 min', durationMinutes: 3, cost: 0 },
          };
        }
        if (conflictIndex !== -1) {
          daySteps[conflictIndex] = {
            activity: solution.replacementActivity,
          };
        }
        updatedSteps[currentDay] = daySteps;
      } else if (solution.type === 'transport' && solution.newTravelOption) {
        const prevStepIndex = daySteps.findIndex((s) => s.conflict);
        if (prevStepIndex !== -1) {
          daySteps[prevStepIndex] = {
            ...daySteps[prevStepIndex],
            conflict: undefined,
            travel: solution.newTravelOption,
          };
        }
        const conflictIndex = daySteps.findIndex((s) => s.activity.id === 'act-5');
        if (conflictIndex !== -1) {
          daySteps[conflictIndex] = {
            ...daySteps[conflictIndex],
            activity: { ...daySteps[conflictIndex].activity, time: '16:50', isConfirmed: true },
          };
        }
        updatedSteps[currentDay] = daySteps;
      }

      return { ...prev, steps: updatedSteps };
    });

    setActiveConflictStep(null);
    triggerSuccessBanner();
  };

  // One-click AI optimization ("Bouton WOW")
  const handleOptimizeTrip = () => {
    if (!hasConflict) {
      triggerSuccessBanner();
      return;
    }
    const conflictStep = currentSteps.find((s) => !!s.conflict);
    if (conflictStep?.conflict?.solutions?.[2]) {
      handleApplySolution(conflictStep.conflict.solutions[2]);
    } else if (conflictStep?.conflict?.solutions?.[0]) {
      handleApplySolution(conflictStep.conflict.solutions[0]);
    }
  };

  const triggerSuccessBanner = () => {
    setResolvedBanner(true);
    setTimeout(() => setResolvedBanner(false), 4500);
  };

  // Add an activity to Day's Itinerary (ou remplace l'étape en cours)
  const handleAddActivity = (activity: Activity) => {
    const targetIndex = replacingStepIndex;

    setTrip((prev) => {
      const daySteps = [...(prev.steps[currentDay] || [])];

      if (targetIndex != null && daySteps[targetIndex]) {
        daySteps[targetIndex] = { ...daySteps[targetIndex], activity, conflict: undefined };
      } else {
        daySteps.push({
          activity,
          travel: { mode: 'Marche', duration: '12 min', durationMinutes: 12, cost: 0 },
        });
      }

      return {
        ...prev,
        steps: {
          ...prev.steps,
          [currentDay]: recalculateStepsRoute(daySteps),
        },
      };
    });

    setSelectedActivity(activity);
    setReplacingStepIndex(null);
    if (activeTab === 'home') setActiveTab('plan');
    triggerSuccessBanner();
  };

  // Recalcule les temps de trajet d'une journée
  const handleRecalculateRoute = (day = currentDay) => {
    setTrip((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        [day]: recalculateStepsRoute(prev.steps[day] || []),
      },
    }));
    triggerSuccessBanner();
  };

  // Ouvre le sélecteur d'activités autour de la position de l'utilisateur
  const handleOpenNearby = () => {
    setReplacingStepIndex(null);
    setAutoLocateNearby(true);
    setIsAddStepOpen(true);
  };

  const handleOpenAddStep = () => {
    setReplacingStepIndex(null);
    setAutoLocateNearby(false);
    setIsAddStepOpen(true);
  };

  const handleStartReplace = (index: number) => {
    setAutoLocateNearby(false);
    setReplacingStepIndex(index);
    setIsAddStepOpen(true);
  };

  // Modifie l'horaire d'une étape, replace les étapes dans l'ordre et
  // recalcule les temps de trajet de la journée.
  const handleUpdateStepTime = (index: number, time: string) => {
    const normalized = time.slice(0, 5);
    setTrip((prev) => {
      const daySteps = [...(prev.steps[currentDay] || [])];
      if (!daySteps[index]) return prev;

      daySteps[index] = {
        ...daySteps[index],
        activity: { ...daySteps[index].activity, time: normalized },
      };
      daySteps.sort((a, b) => a.activity.time.localeCompare(b.activity.time));

      return {
        ...prev,
        steps: {
          ...prev.steps,
          [currentDay]: recalculateStepsRoute(daySteps),
        },
      };
    });
    triggerSuccessBanner();
  };

  // Valide une série d'horaires depuis la fenêtre « Modifier les horaires »
  const handleApplySchedule = (day: number, updates: Array<{ index: number; time: string }>) => {
    setTrip((prev) => {
      const daySteps = [...(prev.steps[day] || [])];

      updates.forEach(({ index, time }) => {
        if (!daySteps[index] || !time) return;
        daySteps[index] = {
          ...daySteps[index],
          activity: { ...daySteps[index].activity, time: time.slice(0, 5) },
        };
      });

      daySteps.sort((a, b) => a.activity.time.localeCompare(b.activity.time));

      return {
        ...prev,
        steps: {
          ...prev.steps,
          [day]: recalculateStepsRoute(daySteps),
        },
      };
    });

    setIsScheduleOpen(false);
    setScheduleNotice(
      `Jour ${day} · ${updates.length} horaire${updates.length > 1 ? 's' : ''} ajusté${
        updates.length > 1 ? 's' : ''
      } — programme réordonné et trajets recalculés.`
    );
    triggerSuccessBanner();
  };

  // Valide les filtres de l'onglet Explorer : recalcule les trajets du séjour
  const handleValidateExploreChoices = (_count: number) => {
    setTrip((prev) => {
      const nextSteps: Record<number, ItineraryStep[]> = {};
      Object.entries(prev.steps).forEach(([day, steps]) => {
        nextSteps[Number(day)] = recalculateStepsRoute(steps);
      });
      return { ...prev, steps: nextSteps };
    });
  };

  // Reorder steps up/down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    setTrip((prev) => {
      const daySteps = [...(prev.steps[currentDay] || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= daySteps.length) return prev;

      const temp = daySteps[index];
      daySteps[index] = daySteps[targetIndex];
      daySteps[targetIndex] = temp;

      return {
        ...prev,
        steps: {
          ...prev.steps,
          [currentDay]: recalculateStepsRoute(daySteps),
        },
      };
    });
  };

  // Wishlist actions
  const handleToggleWishlist = (activity: Activity) => {
    setWishlist((prev) => {
      const exists = prev.some((a) => a.id === activity.id);
      if (exists) {
        return prev.filter((a) => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  const handleRemoveFromWishlist = (activityId: string) => {
    setWishlist((prev) => prev.filter((a) => a.id !== activityId));
  };

  const handleAddWishlistToDay = (activity: Activity, day: number) => {
    setTrip((prev) => {
      const daySteps = [...(prev.steps[day] || [])];
      daySteps.push({
        activity,
        travel: { mode: 'Marche', duration: '12 min', durationMinutes: 12, cost: 0 },
      });
      return {
        ...prev,
        steps: {
          ...prev.steps,
          [day]: daySteps,
        },
      };
    });
    triggerSuccessBanner();
  };

  // Update user rating on an itinerary step
  const handleUpdateRating = (stepIndex: number, rating: number) => {
    setTrip((prev) => {
      const daySteps = [...(prev.steps[currentDay] || [])];
      if (daySteps[stepIndex]) {
        daySteps[stepIndex] = { ...daySteps[stepIndex], userRating: rating };
      }
      return {
        ...prev,
        steps: {
          ...prev.steps,
          [currentDay]: daySteps,
        },
      };
    });
  };

  // Trigger Chatbot with query
  const handleAskAI = (placeName: string) => {
    setInitialChatQuery(placeName);
    setIsChatOpen(true);
  };

  if (!session) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="relative min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-ink selection:text-white">
      {/* Carte du trajet en fond */}
      <div className="map-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-80">
          <InteractiveMap
            steps={currentSteps}
            selectedStepId={selectedActivity?.id}
            onSelectActivity={() => undefined}
            chatLocations={[]}
            onAskAboutPlace={() => undefined}
            onOpenComparator={() => undefined}
            onOpenPhotoSpot={() => undefined}
            center={trip.center}
            zoom={trip.zoom}
            showPhotoSpots={false}
          />
        </div>
        <div className="absolute inset-0 bg-paper/78 backdrop-blur-[2px]" />
      </div>
      {/* ============ NAVIGATION HEADER ============ */}
      <header className="bg-white/90 supports-[backdrop-filter]:bg-white/75 backdrop-blur-xl border-b border-line/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Destination Picker Trigger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('home')}
              aria-label="Revenir à l'accueil"
              className="w-10 h-10 rounded-[14px] bg-ink flex items-center justify-center text-white shadow-sm ring-1 ring-ink/10 hover:bg-ink-soft"
            >
              <Compass className="w-5 h-5 text-amber-300" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-[22px] font-semibold font-serif text-ink tracking-tight">
                  Voyage
                </h1>
                <button
                  onClick={() => setIsDestinationSelectorOpen(true)}
                  className="group flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm ring-1 ring-ink/10 transition-colors hover:bg-ink-soft"
                  title="Changer de destination"
                >
                  <MapPin className="h-3.5 w-3.5 text-amber-300" />
                  <span className="hidden text-white/60 sm:inline">Destination</span>
                  <span>{cityName}</span>
                  <ChevronDown className="h-3 w-3 text-white/70 transition-transform group-hover:translate-y-0.5" />
                </button>
              </div>
              <div className="hidden items-center gap-2 whitespace-nowrap text-[11px] text-muted sm:flex">
                <button
                  onClick={() => setIsDateModalOpen(true)}
                  title="Modifier les dates et le nombre de voyageurs"
                  className="group flex cursor-pointer items-center gap-1 rounded-full border border-transparent px-1 py-0.5 transition-colors hover:border-line hover:bg-paper hover:text-ink"
                >
                  <CalendarDays className="h-3 w-3 text-accent" />
                  <span>
                    {trip.duration} · {trip.travelers} voyageur
                    {trip.travelers > 1 ? 's' : ''}
                  </span>
                  <Pencil className="h-2.5 w-2.5 text-muted group-hover:text-accent" />
                </button>
                <span className="text-line-strong">•</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-0.5 hover:text-accent"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-paper-deep/70 p-1.5 rounded-full border border-line/80 shadow-2xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              Planificateur
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => setActiveTab('photospots')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'photospots'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-pink-600" />
              <span>Spots & Avis</span>
              <span className="bg-pink-100 text-pink-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {CURATED_PHOTO_SPOTS.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'wishlist'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Liste d'envies</span>
              <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {wishlist.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reservations'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>Réservations</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {reservations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('restrictions')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'restrictions'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Restrictions</span>
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-white text-ink shadow-xs ring-1 ring-ink/5'
                  : 'text-muted hover:text-ink hover:bg-white/70'
              }`}
            >
              Budget
            </button>
          </nav>

          {/* Right Header: Assistant + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold transition-all cursor-pointer sm:px-3.5 ${
                isChatOpen
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white hover:bg-paper text-ink border-line shadow-2xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Concierge IA</span>
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1 pl-2 sm:pr-3 rounded-full hover:bg-paper border border-transparent hover:border-line transition-all cursor-pointer"
            >
              <SafeImage
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-ink object-cover"
                icon={<User className="h-4 w-4 text-ink/40" aria-hidden="true" />}
              />
              <span className="hidden text-xs font-semibold text-ink sm:inline">
                {user.name}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="relative xl:hidden">
          <div className="flex gap-1.5 overflow-x-auto border-t border-line bg-white px-4 py-2 no-scrollbar">
            <button
              onClick={() => setActiveTab('plan')}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'plan' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              Planificateur
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'explore' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => setActiveTab('photospots')}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'photospots' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              <Camera className={`h-3 w-3 ${activeTab === 'photospots' ? 'text-amber-300' : 'text-rose-500'}`} />
              <span>Spots & Avis ({CURATED_PHOTO_SPOTS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'wishlist' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              <Heart
                className={`h-3 w-3 ${
                  activeTab === 'wishlist' ? 'fill-amber-300 text-amber-300' : 'fill-rose-500 text-rose-500'
                }`}
              />
              <span>Envies ({wishlist.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'reservations' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              Réservations ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('restrictions')}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'restrictions' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              Restrictions
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeTab === 'budget' ? 'bg-ink text-white shadow-xs' : 'border border-line bg-paper text-muted'
              }`}
            >
              Budget
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
        </div>
      </header>

      {/* ============ MAIN CONTAINER ============ */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-7 pb-28 sm:pb-16">
        {/* ============ RESOLUTION / SUCCESS BANNER ============ */}
        {resolvedBanner && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-xs animate-in sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-950 sm:text-[15px]">
                  Itinéraire & réservations synchronisés
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-800 sm:text-[13px]">
                  Aucun conflit d'horaires. Carte à jour, billets coupe-file prêts et trajet optimisé.
                </p>
              </div>
            </div>
            <button
              onClick={() => setResolvedBanner(false)}
              aria-label="Fermer la confirmation"
              className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============ RANDOM PROGRAM NOTICE ============ */}
        {randomNotice && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-gold/40 bg-gold-soft/80 p-4 shadow-xs animate-in sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gold ring-1 ring-gold/30">
                <Dices className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Programme aléatoire appliqué</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{randomNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setRandomNotice(null)}
              aria-label="Masquer la notification de programme aléatoire"
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-white/70 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============ BUDGET RECALC NOTICE ============ */}
        {budgetNotice && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-xs animate-in sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 ring-1 ring-emerald-200">
                <Coins className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Budget validé et programme ajusté</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{budgetNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setBudgetNotice(null)}
              aria-label="Masquer la notification de budget"
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-white/70 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============ SCHEDULE UPDATED NOTICE ============ */}
        {scheduleNotice && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/90 p-4 shadow-xs animate-in sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sky-700 ring-1 ring-sky-200">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Horaires mis à jour</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{scheduleNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setScheduleNotice(null)}
              aria-label="Masquer la notification d'horaires"
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-white/70 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============ DATES UPDATED NOTICE ============ */}
        {datesNotice && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-xs animate-in sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 ring-1 ring-emerald-200">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Dates mises à jour — budget ajusté
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">{datesNotice}</p>
                <button
                  onClick={() => setActiveTab('budget')}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
                >
                  Vérifier le budget
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setDatesNotice(null)}
              aria-label="Masquer la notification de dates"
              className="rounded-lg p-1.5 text-emerald-800 transition-colors hover:bg-white/70 hover:text-emerald-950"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============ ACCUEIL ============ */}
        {activeTab === 'home' && (
          <WelcomeView
            user={user}
            trip={trip}
            activitiesCount={Object.values(trip.steps).flat().length}
            plannings={planCards}
            scheduleLabel={dayScheduleLabel}
            onOpenPlanner={() => setActiveTab('plan')}
            onOpenNearby={handleOpenNearby}
            onOpenDates={() => setIsDateModalOpen(true)}
            onOpenSchedule={() => {
              setScheduleDay(currentDay);
              setIsScheduleOpen(true);
            }}
            onOpenPlan={handleOpenPlan}
            onAddDestination={() => setIsAddTripOpen(true)}
          />
        )}

        {/* ============ VUE 3: PLANIFICATEUR (carte en tête, puis timeline + contexte) ============ */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            {/* --- Alerte règles & coutumes locales --- */}
            {!isRestrictionsBannerHidden && (
              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-[#fdf8ec] to-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 ring-1 ring-amber-200">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {mandatoryRestrictions.length} règle
                      {mandatoryRestrictions.length > 1 ? 's' : ''} obligatoire
                      {mandatoryRestrictions.length > 1 ? 's' : ''} à {cityName}{' '}
                      <span className="ml-1 font-normal text-muted">
                        · {cityTraditions.length} coutumes · {cityFestivals.length} festivités
                      </span>
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                      {mandatoryRestrictions[0]?.title ?? 'Règles locales vérifiées'} — vérifiez les
                      usages avant de partir.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setActiveTab('restrictions')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-ink-soft"
                  >
                    Voir les règles & coutumes
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setIsRestrictionsBannerHidden(true)}
                    aria-label="Masquer l'alerte règles locales"
                    className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-white hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- Carte du trajet : élément principal de la page --- */}
            <section className="overflow-hidden rounded-[28px] border border-line bg-white shadow-md">
              <div className="flex flex-col gap-4 border-b border-line/80 bg-gradient-to-br from-[#fffdf9] via-white to-[#fbf6ec] px-5 py-5 sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                    <MapPin className="h-3.5 w-3.5" />
                    Carte du trajet
                  </p>
                  <h2 className="mt-1.5 flex flex-wrap items-baseline gap-x-2 font-serif text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
                    <span>Jour {currentDay}</span>
                    <span className="text-xl text-line-strong sm:text-2xl">·</span>
                    <span>{cityName}</span>
                  </h2>
                  <p className="mt-1 text-[13px] text-muted">
                    {currentSteps.length} étapes · {travelMinutes > 0 ? `${travelMinutes} min de trajet` : 'trajets à pied'} · vue d'ensemble de votre journée
                  </p>

                  {/* Date & plage horaire du jour */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {dayDateLabel && (
                      <button
                        onClick={() => setIsDateModalOpen(true)}
                        title="Modifier les dates et le nombre de voyageurs"
                        className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink-soft shadow-2xs transition-colors hover:border-accent/40 hover:bg-white hover:text-ink"
                      >
                        <CalendarDays className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        <span>{dayDateLabel}</span>
                        <Pencil
                          className="h-2.5 w-2.5 text-muted transition-colors group-hover:text-accent"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                    {dayTimeLabel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink-soft shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                        <span>{dayTimeLabel}</span>
                        <span className="font-normal text-muted">sur la journée</span>
                      </span>
                    )}
                    <button
                      onClick={() => setIsDateModalOpen(true)}
                      title="Modifier le nombre de voyageurs"
                      className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink-soft shadow-2xs transition-colors hover:border-accent/40 hover:bg-white hover:text-ink"
                    >
                      <Users className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      <span>
                        {trip.travelers} voyageur{trip.travelers > 1 ? 's' : ''}
                      </span>
                      <Pencil
                        className="h-2.5 w-2.5 text-muted transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      onClick={() => setIsDestinationSelectorOpen(true)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent shadow-2xs transition-colors hover:border-accent/50 hover:bg-[#f8e3d8]"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      Changer de destination
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Sélecteur de jour */}
                  <div className="flex items-center gap-1 rounded-full border border-line bg-white/85 p-1 shadow-2xs backdrop-blur-sm">
                    {Array.from({ length: trip.daysCount }, (_, i) => i + 1).map((day) => {
                      const hasConflictThisDay = trip.steps[day]?.some((s) => !!s.conflict);
                      const isActive = currentDay === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setCurrentDay(day)}
                          aria-label={`Afficher le jour ${day}`}
                          aria-pressed={isActive}
                          title={getDayDateLabel(day) ?? undefined}
                          className={`relative flex h-9 items-center justify-center rounded-full px-3.5 text-xs font-semibold ${
                            isActive
                              ? 'bg-ink text-white shadow-xs'
                              : 'text-muted hover:bg-paper hover:text-ink'
                          }`}
                        >
                          J{day}
                          {hasConflictThisDay && (
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-1 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleOptimizeTrip}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold shadow-xs ${
                      hasConflict
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-ink text-white hover:bg-ink-soft'
                    }`}
                  >
                    {hasConflict ? <AlertTriangle className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{hasConflict ? 'Résoudre' : 'Optimiser'}</span>
                  </button>

                  <button
                    onClick={() => handleRecalculateRoute()}
                    title="Recalculer les temps de trajet du jour"
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:border-line-strong hover:bg-paper"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-accent" />
                    <span>Recalculer</span>
                  </button>

                  <button
                    onClick={() => {
                      setScheduleDay(currentDay);
                      setIsScheduleOpen(true);
                    }}
                    title="Modifier les horaires du jour"
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:border-line-strong hover:bg-paper"
                  >
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    <span>Horaires</span>
                  </button>

                  {/* Programme aléatoire */}
                  <div className="relative">
                    <button
                      onClick={() => setIsRandomMenuOpen((prev) => !prev)}
                      aria-expanded={isRandomMenuOpen}
                      aria-haspopup="menu"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:border-line-strong hover:bg-paper"
                    >
                      <Shuffle className="h-3.5 w-3.5 text-accent" />
                      <span>Aléatoire</span>
                      <ChevronDown className="h-3 w-3 text-muted" />
                    </button>

                    {isRandomMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsRandomMenuOpen(false)}
                          aria-hidden="true"
                        />
                        <div
                          role="menu"
                          className="absolute left-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-xl animate-in fade-in duration-150 sm:left-auto sm:right-0"
                        >
                          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                            Choisir un programme au hasard
                          </p>
                          <button
                            role="menuitem"
                            onClick={() => handleRandomProgram('day')}
                            className="flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-paper"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                              <Shuffle className="h-3.5 w-3.5" />
                            </span>
                            <span>
                              <span className="block text-xs font-semibold text-ink">
                                Journée au hasard
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                                Réordonne les étapes du jour {currentDay} en gardant les horaires.
                              </span>
                            </span>
                          </button>
                          <button
                            role="menuitem"
                            onClick={() => handleRandomProgram('trip')}
                            className="flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-paper"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold">
                              <Dices className="h-3.5 w-3.5" />
                            </span>
                            <span>
                              <span className="block text-xs font-semibold text-ink">
                                Séjour complet au hasard
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                                Mélange les étapes de chaque journée de {cityName}.
                              </span>
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* Carte */}
              <div className="bg-white p-2 sm:p-3">
                <div className="h-[300px] overflow-hidden rounded-[20px] sm:h-[380px] lg:h-[430px]">
                  <InteractiveMap
                    steps={currentSteps}
                    selectedStepId={selectedActivity?.id}
                    onSelectActivity={(act) => setSelectedActivity(act)}
                    chatLocations={chatLocations}
                    onAskAboutPlace={handleAskAI}
                    onOpenComparator={handleOpenComparator}
                    onOpenPhotoSpot={handleOpenPhotoSpot}
                    center={trip.center}
                    zoom={trip.zoom}
                    showPhotoSpots={false}
                  />
                </div>
              </div>

              {/* Bandeau de synthèse */}
              <div className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
                <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-ink-soft">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-none text-ink">{currentSteps.length}</p>
                    <p className="mt-1 truncate text-[11px] text-muted">étapes planifiées</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-none text-ink">{travelMinutes} min</p>
                    <p className="mt-1 truncate text-[11px] text-muted">entre les étapes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Euro className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-none text-ink">{totalCost.toFixed(0)} €</p>
                    <p className="mt-1 truncate text-[11px] text-muted">sur {trip.budgetTotal} € · {budgetPercent}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      hasConflict ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {hasConflict ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-none text-ink">
                      {hasConflict ? '1 à régler' : 'Aucun'}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted">
                      {hasConflict ? 'conflit d\'horaires' : 'horaires vérifiés'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Timeline + panneau de contexte --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              <section className="lg:col-span-7 xl:col-span-8">
                <div className="mb-4 flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Programme du jour
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink">
                      Jour {currentDay} à {cityName}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {currentSteps.length} étapes · rythme équilibré
                    </p>
                  </div>

                  {hasConflict ? (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                      <AlertTriangle className="h-3 w-3" />
                      1 conflit
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle className="h-3 w-3" />
                      Journée fluide
                    </span>
                  )}
                </div>

                <div className="space-y-0">
                  {currentSteps.map((step, idx) => (
                    <TimelineItem
                      key={step.activity.id}
                      step={step}
                      index={idx}
                      totalSteps={currentSteps.length}
                      isSelected={selectedActivity?.id === step.activity.id}
                      onSelect={() => setSelectedActivity(step.activity)}
                      onOpenConflict={() => setActiveConflictStep(step)}
                      onOpenComparator={handleOpenComparator}
                      onOpenPhotoSpot={handleOpenPhotoSpot}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some((w) => w.id === step.activity.id)}
                      onUpdateRating={handleUpdateRating}
                      onMoveUp={idx > 0 ? () => handleMoveStep(idx, 'up') : undefined}
                      onMoveDown={idx < currentSteps.length - 1 ? () => handleMoveStep(idx, 'down') : undefined}
                      onReplace={() => handleStartReplace(idx)}
                      onUpdateTime={(time) => handleUpdateStepTime(idx, time)}
                    />
                  ))}

                  {currentSteps.length === 0 && (
                    <div className="rounded-[24px] border border-dashed border-line-strong bg-white/70 p-10 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper text-muted">
                        <Compass className="h-6 w-6" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-ink">Aucune activité pour ce jour</p>
                      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">
                        Ajoutez des étapes ou demandez des suggestions au concierge IA.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleOpenAddStep}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-white/60 py-3.5 text-xs font-semibold text-ink-soft hover:border-ink hover:bg-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter une étape au jour {currentDay}</span>
                </button>
              </section>

              <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
                <ContextPanel
                  trip={trip}
                  currentDay={currentDay}
                  onOptimizeTrip={handleOptimizeTrip}
                  onAddStep={handleOpenAddStep}
                  onOpenChat={() => setIsChatOpen(true)}
                  onOpenRestrictions={() => setActiveTab('restrictions')}
                  onBudgetChange={handleBudgetChange}
                  hasConflict={hasConflict}
                  totalCost={totalCost}
                  userName={user.name}
                  profileStyle={user.travelStyle}
                />
              </aside>
            </div>
          </div>
        )}

        {/* ============ VUE 1 & 2: EXPLORATION (Recherche & Recommandations) ============ */}
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <ExploreView
                onAddActivityToTrip={handleAddActivity}
                onFocusOnMap={(act) => {
                  setSelectedActivity(act);
                  setActiveTab('plan');
                }}
                onAskAIAboutActivity={handleAskAI}
                onOpenComparator={handleOpenComparator}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlist.map((w) => w.id)}
                addedActivityIds={Object.values(trip.steps).flat().map((s) => s.activity.id)}
                destination={cityName}
                dates={trip.dates}
                travelers={trip.travelers}
                interests={user.preferences}
                onEditDates={() => setIsDateModalOpen(true)}
                onValidateChoices={handleValidateExploreChoices}
              />
            </div>

            {/* Carte interactive en split screen */}
            <div className="order-first h-[320px] lg:sticky lg:top-24 lg:order-none lg:col-span-5 lg:h-[720px]">
              <InteractiveMap
                steps={currentSteps}
                selectedStepId={selectedActivity?.id}
                onSelectActivity={(act) => setSelectedActivity(act)}
                chatLocations={chatLocations}
                onAskAboutPlace={handleAskAI}
                onOpenComparator={handleOpenComparator}
                onOpenPhotoSpot={handleOpenPhotoSpot}
                center={trip.center}
                zoom={14}
              />
            </div>
          </div>
        )}

        {/* ============ VUE SPOTS INSTAGRAMABLES & AVIS (GOOGLE, PINTEREST, INSTA, FB) ============ */}
        {activeTab === 'photospots' && (
          <div className="max-w-5xl mx-auto">
            <PhotoSpotsView
              onSelectSpot={handleOpenPhotoSpot}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlist.map((w) => w.id)}
              onFocusOnMap={(lat, lng) => {
                setActiveTab('plan');
              }}
            />
          </div>
        )}

        {/* ============ VUE LISTE D'ENVIES ============ */}
        {activeTab === 'wishlist' && (
          <div className="max-w-4xl mx-auto">
            <WishlistView
              wishlist={wishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              onAddToTripDay={handleAddWishlistToDay}
              onOpenComparator={handleOpenComparator}
              onFocusOnMap={(act) => {
                setSelectedActivity(act);
                setActiveTab('plan');
              }}
              totalDays={trip.daysCount}
            />
          </div>
        )}

        {/* ============ VUE RÉSERVATIONS & COMPARATEUR DE BILLETS ============ */}
        {activeTab === 'reservations' && (
          <div className="max-w-4xl mx-auto">
            <ReservationsView
              reservations={reservations}
              onOpenComparator={handleOpenComparator}
              plannedActivities={allPlannedActivities}
            />
          </div>
        )}

        {/* ============ VUE 4: RESTRICTIONS & ALERTES ============ */}
        {activeTab === 'restrictions' && (
          <div className="max-w-3xl mx-auto">
            <RestrictionsView
              restrictions={trip.restrictions}
              destinationName={trip.destination}
            />
          </div>
        )}

        {/* ============ VUE 5: BUDGET & DÉPENSES ============ */}
        {activeTab === 'budget' && (
          <div className="max-w-3xl mx-auto">
            <BudgetView
              trip={trip}
              onBudgetChange={handleBudgetChange}
              onBreakdownChange={handleBreakdownChange}
              onEditDates={() => setIsDateModalOpen(true)}
              onPickBudgetActivity={() => {
                setActiveTab('plan');
                handleOpenAddStep();
              }}
              userName={user.name}
              profileStyle={user.travelStyle}
            />
          </div>
        )}
      </main>

      {/* ============ FLOATING CHATBOT DRAWER ============ */}
      <div
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-[85vh] sm:h-[620px] z-50 transition-all duration-300 transform ${
          isChatOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 pointer-events-none scale-95'
        }`}
      >
        <ChatAssistant
          currentTrip={{ ...trip, currentDay }}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onLocationsReceived={(locs) => setChatLocations(locs)}
          initialQuery={initialChatQuery}
          onClearInitialQuery={() => setInitialChatQuery(null)}
        />
      </div>

      {/* Floating Chat Trigger button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10 hover:bg-ink-soft hover:shadow-2xl sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
          </span>
          <span>Concierge IA</span>
        </button>
      )}

      {/* ============ MODAL SPOTS PHOTO & TOUS LES AVIS (GOOGLE, PINTEREST, INSTA, FB) ============ */}
      <PhotoSpotsModal
        spot={selectedPhotoSpot}
        isOpen={isPhotoSpotModalOpen}
        onClose={() => {
          setIsPhotoSpotModalOpen(false);
          setSelectedPhotoSpot(null);
        }}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedPhotoSpot ? wishlist.some((w) => w.id === selectedPhotoSpot.id) : false}
      />

      {/* ============ MODAL COMPARATEUR DE PRIX & RÉSERVATION ============ */}
      <PriceComparatorModal
        activity={comparatorActivity}
        isOpen={isComparatorOpen}
        onClose={() => {
          setIsComparatorOpen(false);
          setComparatorActivity(null);
        }}
        travelersCount={trip.travelers}
        onConfirmBooking={handleConfirmBooking}
        city={cityName}
        dateLabel={comparatorDateLabel}
        userEmail={user.email}
        userName={user.name}
      />

      {/* ============ MODAL SÉLECTEUR DE DESTINATION ============ */}
      <DestinationSelectorModal
        isOpen={isDestinationSelectorOpen}
        onClose={() => setIsDestinationSelectorOpen(false)}
        currentDestinationId={
          AVAILABLE_DESTINATIONS.find(
            (dest) => dest.name.toLowerCase() === cityName.toLowerCase()
          )?.id ?? 'dest-rome'
        }
        onSelectDestination={handleSelectDestination}
      />

      {/* ============ MODAL MODIFICATION DES DATES ============ */}
      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        trip={trip}
        onConfirm={handleDatesUpdate}
      />

      {/* ============ MODAL RÉSOLUTION DE CONFLIT ============ */}
      {activeConflictStep && (
        <ConflictResolutionModal
          step={activeConflictStep}
          isOpen={!!activeConflictStep}
          onClose={() => setActiveConflictStep(null)}
          onApplySolution={handleApplySolution}
        />
      )}

      {/* ============ MODAL PROFIL EVAN ============ */}
      <ProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
        onSave={handleUpdateProfile}
      />

      {/* ============ MODAL AJOUT D'ÉTAPE ============ */}
      <AddTripModal
        isOpen={isAddTripOpen}
        onClose={() => setIsAddTripOpen(false)}
        plannedDestinationIds={tripPlans.map((plan) => plan.destinationId)}
        onAdd={handleAddPlan}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        trip={trip}
        initialDay={scheduleDay}
        onApply={handleApplySchedule}
      />

      <AddActivityModal
        isOpen={isAddStepOpen}
        onClose={() => {
          setIsAddStepOpen(false);
          setReplacingStepIndex(null);
          setAutoLocateNearby(false);
        }}
        onAdd={handleAddActivity}
        dayNumber={currentDay}
        center={trip.center}
        city={cityName}
        nearbyActivities={knownActivities}
        addedActivityIds={itineraryActivityIds}
        anchor={nearbyAnchor}
        anchorLabel={nearbyAnchorLabel}
        activityBudget={activityBudget}
        budgetTotal={trip.budgetTotal}
        onBudgetChange={handleBudgetChange}
        interests={user.preferences}
        mode={replacingStepIndex != null ? 'replace' : 'add'}
        currentActivityId={
          replacingStepIndex != null
            ? currentSteps[replacingStepIndex]?.activity.id
            : undefined
        }
        autoLocate={autoLocateNearby}
        onOpenBudget={() => {
          setIsAddStepOpen(false);
          setReplacingStepIndex(null);
          setActiveTab('budget');
        }}
      />
    </div>
  );
}
