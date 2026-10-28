import React, { useState } from 'react';
import { SafeImage } from './SafeImage';
import { 
  Heart, 
  Trash2, 
  Plus, 
  MapPin, 
  Clock, 
  Star, 
  ExternalLink, 
  Compass, 
  Calendar, 
  Sparkles,
  Ticket
} from 'lucide-react';
import { Activity, ActivityCategory } from '../types/travel';

interface WishlistViewProps {
  wishlist: Activity[];
  onRemoveFromWishlist: (activityId: string) => void;
  onAddToTripDay: (activity: Activity, day: number) => void;
  onOpenComparator: (activity: Activity) => void;
  onFocusOnMap: (activity: Activity) => void;
  totalDays: number;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onRemoveFromWishlist,
  onAddToTripDay,
  onOpenComparator,
  onFocusOnMap,
  totalDays,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'Tous'>('Tous');

  const categories: (ActivityCategory | 'Tous')[] = ['Tous', 'Gastronomie', 'Culture', 'Nature', 'Insolite'];

  const filtered = wishlist.filter((item) => {
    return selectedCategory === 'Tous' || item.category === selectedCategory;
  });

  const totalEstimatedCost = wishlist.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[26px] border border-line bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              <Heart className="h-3.5 w-3.5 fill-accent/20 text-accent" />
              Carnet d'envies
            </span>
            <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
              Vos coups de cœur <span className="text-muted">({wishlist.length})</span>
            </h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
              Enregistrez vos lieux favoris, spots photo et restaurants secrets, puis ajoutez-les à votre itinéraire.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-line bg-paper px-4 py-3 text-right">
            <span className="block text-[11px] font-medium text-muted">Budget estimé</span>
            <span className="font-serif text-2xl font-semibold text-ink">
              {totalEstimatedCost.toFixed(0)} €
            </span>
            <span className="mt-0.5 block text-[11px] text-muted">pour {wishlist.length} lieux</span>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      {wishlist.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white hover:bg-paper text-muted border border-line'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Wishlist Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[26px] overflow-hidden border border-line hover:border-line-strong transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-paper-deep">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    icon={<MapPin className="h-6 w-6 text-ink/20" aria-hidden="true" />}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {item.category}
                  </span>

                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    title="Retirer de la liste d'envies"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-md backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-serif font-semibold text-lg text-ink truncate">{item.name}</h3>
                    {item.rating && (
                      <span className="text-xs font-semibold text-ink flex items-center gap-1 flex-shrink-0">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        {item.rating}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted flex items-center gap-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
                    <span className="truncate">{item.address}</span>
                  </p>

                  <p className="text-xs text-ink leading-relaxed line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.duration}</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-ink">
                      {item.price > 0 ? `${item.price} €` : 'Gratuit'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-5 pt-0 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-line">
                  <a
                    href={item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-ink-soft hover:text-ink hover:underline"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onOpenComparator(item)}
                    className="text-xs font-semibold text-ink hover:underline"
                  >
                    Comparer les prix ↗
                  </button>
                </div>

                {/* Direct add to day buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => onAddToTripDay(item, day)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-line bg-paper px-2 py-1.5 text-[11px] font-semibold text-ink-soft transition-colors hover:border-line-strong hover:bg-white hover:text-ink"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Jour {day}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[26px] p-12 text-center border border-line shadow-sm max-w-lg mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-xl text-ink">
              Votre liste d'envies est vide
            </h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Explorez les suggestions, jardins et restaurants, et cliquez sur le cœur pour les garder au chaud avant de les ajouter à votre planning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
