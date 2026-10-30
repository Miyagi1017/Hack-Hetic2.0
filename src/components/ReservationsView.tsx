import React, { useState } from 'react';
import { 
  Ticket, 
  QrCode, 
  CheckCircle2, 
  Users, 
  Clock, 
  MapPin, 
  Camera,
  X
} from 'lucide-react';
import { Reservation, Activity } from '../types/travel';
import { guidedTourPrice, isInstagrammable } from '../data/guided-tours';

interface ReservationsViewProps {
  reservations: Reservation[];
  onOpenComparator: (activity: Activity) => void;
  plannedActivities: Activity[];
  /** Réserve une visite guidée (guide francophone) pour une activité planifiée. */
  onBookGuidedTour?: (activity: Activity, pricePerPerson: number) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  onOpenComparator,
  plannedActivities,
  onBookGuidedTour,
}) => {
  const [activeTicket, setActiveTicket] = useState<Reservation | null>(null);

  const totalReservedAmount = reservations.reduce((sum, r) => sum + r.totalPrice, 0);

  // Activities not yet reserved
  const unreservedActivities = plannedActivities.filter(
    (act) => act.price > 0 && !reservations.some((r) => r.activityId === act.id)
  );

  const guidedCandidates = unreservedActivities.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6 md:flex-row md:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Pass & billetterie
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            Vos réservations & billets
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
            Vos billets et vouchers, accessibles hors-ligne et prêts à scanner.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-line bg-paper px-4 py-3 text-right">
          <span className="block text-[11px] font-medium text-muted">Total réservé</span>
          <span className="font-serif text-2xl font-semibold text-ink">{totalReservedAmount.toFixed(0)} €</span>
          <span className="mt-0.5 block text-[11px] font-semibold text-emerald-700">
            {reservations.length} billets confirmés
          </span>
        </div>
      </div>

      {/* Visites guidées à réserver */}
      {onBookGuidedTour && guidedCandidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-serif font-semibold text-xl text-ink">
                Visites guidées à réserver
              </h3>
              <p className="mt-0.5 max-w-xl text-[13px] leading-relaxed text-muted">
                Guide francophone, petits groupes et billets coupe-file : les meilleurs lieux de
                votre itinéraire, dont les spots les plus instagrammables.
              </p>
            </div>
            <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">
              {guidedCandidates.length} visite{guidedCandidates.length > 1 ? 's' : ''} disponible
              {guidedCandidates.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {guidedCandidates.map((activity) => {
              const price = guidedTourPrice(activity);
              const instagram = isInstagrammable(activity);
              return (
                <div
                  key={activity.id}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-white p-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        <Users className="h-3 w-3" />
                        Visite guidée · guide FR
                      </span>
                      {instagram && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700">
                          <Camera className="h-3 w-3" />
                          Spot Instagram
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 line-clamp-2 font-serif text-base font-semibold leading-snug text-ink">
                      {activity.name}
                    </h4>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.address}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">
                      {price} €
                      <span className="ml-1 text-[10px] font-normal text-muted">/ pers.</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => onBookGuidedTour(activity, price)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-ink-soft"
                    >
                      <Ticket className="h-3 w-3" />
                      Réserver la visite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmed Reservations List */}
      <div className="space-y-4">
        <h3 className="font-serif font-semibold text-xl text-ink">
          Billets confirmés ({reservations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-[26px] p-5 border border-line shadow-xs hover:border-line-strong transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-ink text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {res.provider}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmé
                  </span>
                </div>

                <h4 className="font-serif font-semibold text-lg text-ink mb-1 leading-snug">
                  {res.activityName}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted my-3 p-3 bg-paper rounded-xl border border-line">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted">Date & Heure</span>
                    <span className="font-semibold text-ink">{res.date} • {res.time}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted">Voyageurs</span>
                    <span className="font-semibold text-ink">{res.travelers} personnes</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-line/60 flex justify-between">
                    <span className="text-muted">Réf.</span>
                    <span className="font-mono font-semibold text-ink">{res.reference}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-ink">{res.totalPrice.toFixed(2)} €</span>
                  <span className="text-[11px] text-muted block">Payé en ligne</span>
                </div>

                <button
                  onClick={() => setActiveTicket(res)}
                  className="px-3.5 py-2 bg-ink hover:bg-ink-soft text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  <span>Afficher le Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unreserved Activities Teaser / Comparator CTA */}
      {unreservedActivities.length > 0 && (
        <div className="bg-white rounded-[26px] p-6 border border-line shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-semibold text-lg text-ink">
                Activités à réserver pour votre voyage
              </h3>
              <p className="text-xs text-muted">
                Comparez les tarifs officiels et 12 tour-opérateurs — Booking.com,
                GetYourGuide, Tiqets, Viator… — et repérez les offres gratuites.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full">
              {unreservedActivities.length} à réserver
            </span>
          </div>

          <div className="space-y-2.5">
            {unreservedActivities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 bg-paper rounded-2xl border border-line flex items-center justify-between gap-3 hover:border-line-strong transition-all"
              >
                <div>
                  <h5 className="font-serif font-semibold text-sm text-ink">{act.name}</h5>
                  <p className="text-xs text-muted">{act.address} • Créneau : {act.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">Dès {act.price} €</span>
                  <button
                    onClick={() => onOpenComparator(act)}
                    className="px-3 py-1.5 bg-white border border-line hover:bg-ink hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    Comparer les prix ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Pass Modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-ink/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[26px] w-full max-w-sm p-6 border border-line shadow-2xl space-y-4 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-line">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Pass Smartphone Valide
              </span>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-1 hover:bg-paper rounded-full text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-lg text-ink">{activeTicket.activityName}</h4>
              <p className="text-xs text-muted mt-0.5">Fournisseur : {activeTicket.provider}</p>
            </div>

            {/* QR Code Container */}
            <div className="bg-paper p-6 rounded-2xl border border-line inline-block my-2">
              <QrCode className="w-36 h-36 mx-auto text-ink" />
              <span className="font-mono font-semibold text-xs text-ink block mt-2 tracking-widest">
                {activeTicket.reference}
              </span>
            </div>

            <div className="text-xs text-muted space-y-1">
              <p>Présentez ce QR Code au contrôle d'accès coupe-file.</p>
              <p className="font-semibold text-ink">Créneau : {activeTicket.date} à {activeTicket.time}</p>
            </div>

            <button
              onClick={() => setActiveTicket(null)}
              className="w-full py-3 bg-ink hover:bg-ink-soft text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
