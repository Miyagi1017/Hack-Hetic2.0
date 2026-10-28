import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Lightbulb,
  HeartHandshake,
  PartyPopper,
  Check,
  X,
  MapPin,
  Gift,
} from 'lucide-react';
import { DestinationRestriction, CityTradition } from '../types/travel';
import { getCityFestivals, getCityTraditions } from '../data/local-traditions';

interface RestrictionsViewProps {
  restrictions: DestinationRestriction[];
  destinationName: string;
}

const TRADITION_STYLES: Record<CityTradition['category'], { label: string; className: string }> = {
  coutume: { label: 'Coutume', className: 'bg-gold-soft text-amber-900 border-amber-200' },
  étiquette: { label: 'Étiquette', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  festivité: { label: 'Festivité', className: 'bg-purple-50 text-purple-800 border-purple-200' },
  sécurité: { label: 'Sécurité', className: 'bg-red-50 text-red-800 border-red-200' },
};

export const RestrictionsView: React.FC<RestrictionsViewProps> = ({
  restrictions,
  destinationName,
}) => {
  const city = destinationName.split(',')[0];
  const traditions = getCityTraditions(city);
  const festivals = getCityFestivals(city);
  const mandatoryCount = restrictions.filter((item) => item.status === 'obligatoire').length;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'formalité':
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
            Formalité
          </span>
        );
      case 'écologie':
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            Zone ZTL / Écologie
          </span>
        );
      case 'taxe':
        return (
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800">
            Taxe locale
          </span>
        );
      case 'santé':
        return (
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800">
            Santé
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'obligatoire':
        return (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
            <AlertTriangle className="h-3 w-3" /> Obligatoire
          </span>
        );
      case 'recommandé':
        return (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            <Info className="h-3 w-3" /> Recommandé
          </span>
        );
      case 'info':
        return (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Conforme
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[26px] border border-line bg-white p-5 shadow-xs sm:p-6 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-900">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Vérification officielle des règles de voyage</span>
          </div>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            Restrictions, règles & coutumes — {city}
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Alertes pays, savoir-vivre local et calendrier festif, mis à jour automatiquement.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {mandatoryCount} règle{mandatoryCount > 1 ? 's' : ''} obligatoire{mandatoryCount > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-[11px] text-muted">
            <Calendar className="h-4 w-4" />
            Audit : octobre 2026
          </span>
        </div>
      </div>

      {/* Restrictions */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 px-1 font-serif text-xl font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-ink-soft" />
          Règles & restrictions locales
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {restrictions.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-line bg-white p-5 shadow-xs transition-colors hover:border-line-strong sm:p-6"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {getCategoryBadge(item.category)}
                  <h3 className="font-serif text-lg font-semibold text-ink">{item.title}</h3>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <p className="mb-2 text-sm font-medium leading-relaxed text-ink-soft">{item.description}</p>

              <p className="mb-4 rounded-xl border border-line bg-paper p-3.5 text-xs leading-relaxed text-muted">
                {item.details}
              </p>

              <div className="flex items-center justify-between gap-2 border-t border-line pt-2.5 text-[11px] text-muted">
                <span>Source : {item.source}</span>
                <span>Vérifié le {item.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Traditions & coutumes */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
              <HeartHandshake className="h-4 w-4 text-accent" />
              Traditions & coutumes à {city}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Les usages qui font plaisir — et les gestes à éviter.
            </p>
          </div>
          <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {traditions.length} usages clés
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {traditions.map((tradition) => {
            const style = TRADITION_STYLES[tradition.category];
            return (
              <article
                key={tradition.id}
                className="rounded-[24px] border border-line bg-white p-5 shadow-xs transition-colors hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif text-base font-semibold leading-snug text-ink">
                    {tradition.title}
                  </h4>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{tradition.description}</p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] leading-relaxed text-emerald-900">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                    <span>{tradition.doTip}</span>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/60 px-2.5 py-1.5 text-[11px] leading-relaxed text-red-900">
                    <X className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                    <span>{tradition.dontTip}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Calendrier festif */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
              <PartyPopper className="h-4 w-4 text-gold" />
              Festivités & occasions à {city}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Du gratuit au payant : ajoutez une festivité à votre programme.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {festivals.map((festival) => (
            <article
              key={festival.id}
              className="rounded-[24px] border border-line bg-white p-5 shadow-xs transition-colors hover:border-line-strong"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-serif text-base font-semibold text-ink">{festival.name}</h4>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    festival.isFree
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  {festival.isFree ? (
                    <span className="inline-flex items-center gap-1">
                      <Gift className="h-3 w-3" /> Gratuit
                    </span>
                  ) : (
                    `Dès ${festival.priceFrom ?? 0} €`
                  )}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                <Calendar className="h-3 w-3" />
                {festival.period}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{festival.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Conseils pratiques */}
      <div className="rounded-[24px] border border-amber-200/80 bg-amber-50/60 p-5 sm:p-6">
        <h4 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-amber-950">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          Conseils pratiques pour {city}
        </h4>
        <ul className="space-y-2 pl-1 text-xs leading-relaxed text-amber-900">
          <li>
            <strong className="font-semibold">Réservez les sites majeurs :</strong> privilégiez les
            créneaux en ligne pour éviter les files d’attente et sécuriser votre visite.
          </li>
          <li>
            <strong className="font-semibold">Transports :</strong> validez toujours votre titre de
            transport et gardez-le jusqu’à la sortie. La marche reste le meilleur moyen de découvrir
            le centre historique.
          </li>
          <li>
            <strong className="font-semibold">Pourboires :</strong> vérifiez si le service est inclus
            sur l’addition. Un pourboire de 5 à 10 % reste apprécié mais jamais obligatoire.
          </li>
          <li className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              <strong className="font-semibold">Repères locaux :</strong> gardez l’adresse de votre
              hébergement en langue locale pour les taxis et les secours.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
