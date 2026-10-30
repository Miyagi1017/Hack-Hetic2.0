import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Sun, 
  Star, 
  Heart, 
  ExternalLink, 
  Sparkles, 
  Search, 
  User,
  ArrowRight
} from 'lucide-react';
import { PhotoSpotSpotlight, Activity } from '../types/travel';
import { CURATED_PHOTO_SPOTS } from '../data/mock-data';
import { SafeImage } from './SafeImage';

interface PhotoSpotsViewProps {
  onSelectSpot: (spot: PhotoSpotSpotlight) => void;
  onToggleWishlist?: (activity: Activity) => void;
  wishlistIds?: string[];
  onFocusOnMap?: (lat: number, lng: number) => void;
}

export const PhotoSpotsView: React.FC<PhotoSpotsViewProps> = ({
  onSelectSpot,
  onToggleWishlist,
  wishlistIds = [],
  onFocusOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'monument' | 'jardin' | 'ruelle' | 'point_de_vue'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'google' | 'instagram' | 'pinterest' | 'facebook'>('all');

  const filteredSpots = CURATED_PHOTO_SPOTS.filter((spot) => {
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.lightingTip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.angleTip.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || spot.category === selectedCategory;

    const matchesPlatform =
      selectedPlatform === 'all' ||
      spot.reviews.some((r) => r.platform === selectedPlatform);

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Spots photo & avis
          </p>

          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            Les meilleurs angles et la meilleure heure
          </h2>

          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Des cadrages repérés sur Google Maps, Instagram, Pinterest et les communautés Facebook.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
          <span className="text-[11px] font-semibold text-ink">Google · 4,9/5</span>
          <span className="text-[11px] font-semibold text-ink">Instagram · 500k+</span>
          <span className="text-[11px] font-semibold text-ink">Pinterest · 220k+</span>
          <span className="text-[11px] font-semibold text-ink">Facebook · 98%</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-[22px] border border-line bg-white p-4 shadow-2xs">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {/* Search input */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un spot, monument, jardin, belvédère ou angle de photo…"
              className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-xs text-ink outline-none placeholder:text-muted focus:border-line-strong focus:bg-white focus:ring-2 focus:ring-ink/5 sm:text-sm"
            />
          </div>

          {/* Platform Filters */}
          <div className="flex items-center gap-1 bg-paper p-1 rounded-xl border border-line w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === 'all' ? 'bg-white text-ink shadow-xs' : 'text-muted'
              }`}
            >
              Tous les réseaux
            </button>
            <button
              onClick={() => setSelectedPlatform('google')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === 'google' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setSelectedPlatform('instagram')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === 'instagram' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setSelectedPlatform('pinterest')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === 'pinterest' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
              }`}
            >
              Pinterest
            </button>
            <button
              onClick={() => setSelectedPlatform('facebook')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === 'facebook' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
              }`}
            >
              Facebook
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider mr-1">
            Lieux :
          </span>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'monument', label: 'Monuments' },
            { id: 'jardin', label: 'Jardins & parcs' },
            { id: 'point_de_vue', label: 'Belvédères' },
            { id: 'ruelle', label: 'Ruelles secrètes' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-paper hover:bg-line text-muted hover:text-ink'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSpots.map((spot) => {
          const isWishlisted = wishlistIds.includes(spot.id);
          const topReview = spot.reviews[0];

          return (
            <div
              key={spot.id}
              className="bg-white rounded-[26px] overflow-hidden border border-line shadow-2xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Card Photo Header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-deep">
                <SafeImage
                  src={spot.photoUrl}
                  alt={spot.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  icon={<Camera className="h-7 w-7 text-ink/20" aria-hidden="true" />}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="bg-ink/45 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                    <Camera className="h-3 w-3 text-gold" />
                    <span>Spot photo certifié</span>
                  </span>

                  {onToggleWishlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist({
                          id: spot.id,
                          name: spot.name,
                          category: 'Nature',
                          address: spot.locationName,
                          lat: spot.lat,
                          lng: spot.lng,
                          time: '17:00',
                          duration: '1h',
                          price: 0,
                          rating: spot.platformMetrics.googleRating,
                          image: spot.photoUrl,
                          googleMapsUrl: spot.googleMapsUrl,
                        });
                      }}
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Ajouter à ma liste d'envies"
                    >
                      <Heart
                        className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
                      />
                    </button>
                  )}
                </div>

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{spot.bestHour}</span>
                  </div>
                  <h3 className="text-lg font-semibold font-serif leading-snug line-clamp-1">
                    {spot.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/75">
                    <MapPin className="h-3 w-3 text-gold" />
                    <span>{spot.locationName}</span>
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Platform Metrics Bar */}
                <div className="grid grid-cols-4 gap-1 rounded-2xl border border-line bg-paper px-2 py-2.5 text-center">
                  <div>
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Google</span>
                    <span className="mt-0.5 flex items-center justify-center gap-0.5 text-xs font-semibold text-ink">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      {spot.platformMetrics.googleRating}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Instagram</span>
                    <span className="mt-0.5 block text-xs font-semibold text-ink">{spot.platformMetrics.instagramPosts.split(' ')[0]}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Pinterest</span>
                    <span className="mt-0.5 block text-xs font-semibold text-ink">{spot.platformMetrics.pinterestSaves.split(' ')[0]}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Facebook</span>
                    <span className="mt-0.5 block text-xs font-semibold text-ink">{spot.platformMetrics.facebookRecommendations.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Practical Advice Snippets */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 rounded-xl border border-line bg-white p-2.5 text-ink-soft">
                    <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <div>
                      <strong className="font-semibold text-ink">Angle de cadrage :</strong> {spot.angleTip}
                    </div>
                  </div>

                  {spot.outfitTip && (
                    <div className="flex items-start gap-2 rounded-xl border border-line bg-white p-2.5 text-ink-soft">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      <div>
                        <strong className="font-semibold text-ink">Tenue & couleurs :</strong> {spot.outfitTip}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verified Review Highlight */}
                {topReview && (
                  <div className="border-t border-[#F0F0EE] pt-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-muted">
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <SafeImage
                          src={topReview.authorAvatar}
                          alt={topReview.authorName}
                          className="h-5 w-5 rounded-full object-cover"
                          icon={<User className="h-3 w-3 text-ink/30" aria-hidden="true" />}
                        />
                        <span>{topReview.authorName}</span>
                        {topReview.badge && (
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded-full">
                            {topReview.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px]">{topReview.date}</span>
                    </div>
                    <p className="text-ink italic line-clamp-2">
                      "{topReview.comment}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
                  <a
                    href={spot.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg p-1 text-[11px] font-semibold text-ink-soft hover:text-ink hover:underline"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => onSelectSpot(spot)}
                    className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-white shadow-xs hover:bg-ink-soft"
                  >
                    <span>Photos & avis ({spot.reviews.length})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
