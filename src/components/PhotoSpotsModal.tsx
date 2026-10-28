import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Sun, 
  Camera, 
  Share2, 
  Heart, 
  ExternalLink, 
  Sparkles, 
  Star, 
  ThumbsUp, 
  Bookmark, 
  CheckCircle, 
  ShieldCheck, 
  Filter,
  Eye,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PhotoSpotSpotlight, SocialPlatform, Activity } from '../types/travel';
import { SafeImage } from './SafeImage';

interface PhotoSpotsModalProps {
  spot: PhotoSpotSpotlight | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleWishlist?: (activity: Activity) => void;
  isWishlisted?: boolean;
  onFocusOnMap?: (lat: number, lng: number) => void;
}

export const PhotoSpotsModal: React.FC<PhotoSpotsModalProps> = ({
  spot,
  isOpen,
  onClose,
  onToggleWishlist,
  isWishlisted = false,
  onFocusOnMap,
}) => {
  const [activePlatformFilter, setActivePlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!isOpen || !spot) return null;

  const allPhotos = [spot.photoUrl, ...(spot.secondaryPhotos || [])];
  const filteredReviews = spot.reviews.filter((r) => 
    activePlatformFilter === 'all' || r.platform === activePlatformFilter
  );

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'google':
        return <span className="text-red-500 font-black text-xs">G</span>;
      case 'instagram':
        return <span className="text-pink-600 font-semibold text-xs">IG</span>;
      case 'pinterest':
        return <span className="text-rose-600 font-semibold text-xs">P</span>;
      case 'facebook':
        return <span className="text-blue-600 font-semibold text-xs">f</span>;
    }
  };

  const getPlatformBadgeColor = (platform: SocialPlatform) => {
    switch (platform) {
      case 'google':
        return 'border-line bg-paper text-ink-soft';
      case 'instagram':
        return 'border-rose-100 bg-rose-50/70 text-rose-700';
      case 'pinterest':
        return 'border-red-100 bg-red-50/70 text-red-700';
      case 'facebook':
        return 'border-blue-100 bg-blue-50/70 text-blue-700';
    }
  };

  const mockActivity: Activity = {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[26px] max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-line">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-paper shadow-2xs">
              <Camera className="h-5 w-5 text-ink-soft" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold font-serif text-ink line-clamp-1">
                  {spot.name}
                </h2>
                <span className="bg-ink text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Spot photo & avis
                </span>
              </div>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span>{spot.locationName}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Zone sécurisée
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(mockActivity)}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-paper hover:bg-line text-ink border-transparent'
                }`}
                title="Ajouter à la liste d'envies"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted'}`} />
                <span className="hidden sm:inline">
                  {isWishlisted ? 'Dans mes envies' : 'Ajouter aux envies'}
                </span>
              </button>
            )}

            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold border border-line bg-paper text-ink-soft hover:bg-line flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Maps</span>
            </a>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-paper hover:bg-line text-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Main Visual Gallery & Photos */}
          <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-paper-deep shadow-md sm:aspect-[21/9]">
            <SafeImage
              src={allPhotos[activePhotoIndex]}
              alt={spot.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              icon={<Camera className="h-8 w-8 text-ink/20" aria-hidden="true" />}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Thumbnail Navigation Indicators */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-ink/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs">
                  <span>Photo {activePhotoIndex + 1} / {allPhotos.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {allPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activePhotoIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Platforms Stats Banner (Pinterest, Instagram, Facebook, Google) */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold">
                <Star className="h-4 w-4 fill-gold/30" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Google</p>
                <p className="text-sm font-semibold leading-tight text-ink">
                  {spot.platformMetrics.googleRating} / 5
                </p>
                <p className="truncate text-[10px] text-muted">
                  {spot.platformMetrics.googleReviewsCount.toLocaleString()} avis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Camera className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Instagram</p>
                <p className="text-sm font-semibold leading-tight text-ink">
                  {spot.platformMetrics.instagramPosts}
                </p>
                <p className="truncate text-[10px] text-muted">tendance voyage</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Bookmark className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Pinterest</p>
                <p className="text-sm font-semibold leading-tight text-ink">
                  {spot.platformMetrics.pinterestSaves}
                </p>
                <p className="truncate text-[10px] text-muted">tableaux esthétiques</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ThumbsUp className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Facebook</p>
                <p className="text-sm font-semibold leading-tight text-ink">
                  {spot.platformMetrics.facebookRecommendations}
                </p>
                <p className="truncate text-[10px] text-muted">groupes voyageurs</p>
              </div>
            </div>
          </div>

          {/* Photography Composition & Golden Hour Guide */}
          <div className="bg-paper rounded-2xl p-4 sm:p-5 border border-line space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Guide Photoshoot & Cadrage Professionnel</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-3.5 border border-line flex items-start gap-3">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Meilleure Heure & Heure Dorée
                  </h4>
                  <p className="mt-0.5 text-sm font-semibold text-ink">{spot.bestHour}</p>
                  <p className="text-xs text-muted mt-1">{spot.lightingTip}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-line flex items-start gap-3">
                <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Angle & Composition Idéale
                  </h4>
                  <p className="text-xs text-ink leading-relaxed mt-1">{spot.angleTip}</p>
                </div>
              </div>

              {spot.outfitTip && (
                <div className="bg-white rounded-xl p-3.5 border border-line flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                      Palette Vestimentaire Suggérée
                    </h4>
                    <p className="text-xs text-ink leading-relaxed mt-1">{spot.outfitTip}</p>
                  </div>
                </div>
              )}

              {spot.gearTip && (
                <div className="bg-white rounded-xl p-3.5 border border-line flex items-start gap-3">
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                      Matériel & Mode Recommandé
                    </h4>
                    <p className="text-xs text-ink leading-relaxed mt-1">{spot.gearTip}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Multi-Platform Reviews (Google, Instagram, Pinterest, Facebook) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold font-serif text-ink">
                  Tous les Avis & Recommandations Vérifiées
                </h3>
                <p className="text-xs text-muted">
                  Retours authentiques collectés sur Google, Instagram, Pinterest et les communautés Facebook
                </p>
              </div>

              {/* Platform Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-paper p-1 rounded-full border border-line overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActivePlatformFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activePlatformFilter === 'all'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Tous ({spot.reviews.length})
                </button>
                <button
                  onClick={() => setActivePlatformFilter('google')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activePlatformFilter === 'google'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <span>Google</span>
                </button>
                <button
                  onClick={() => setActivePlatformFilter('instagram')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activePlatformFilter === 'instagram'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <span>Instagram</span>
                </button>
                <button
                  onClick={() => setActivePlatformFilter('pinterest')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activePlatformFilter === 'pinterest'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <span>Pinterest</span>
                </button>
                <button
                  onClick={() => setActivePlatformFilter('facebook')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activePlatformFilter === 'facebook'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-4 border border-line shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Review Header */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <SafeImage
                          src={rev.authorAvatar}
                          alt={rev.authorName}
                          className="h-8 w-8 rounded-full border border-line object-cover"
                          icon={<User className="h-4 w-4 text-ink/30" aria-hidden="true" />}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-ink">
                              {rev.authorName}
                            </span>
                            {rev.authorHandle && (
                              <span className="text-[11px] text-muted">
                                {rev.authorHandle}
                              </span>
                            )}
                          </div>
                          {rev.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getPlatformBadgeColor(rev.platform)}`}>
                              {rev.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[11px] text-muted flex-shrink-0">
                        {rev.date}
                      </span>
                    </div>

                    {/* Star Rating if available */}
                    {rev.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Review Comment */}
                    <p className="text-xs sm:text-[13px] text-ink leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {/* Specific Photo Tip if present */}
                    {rev.photoTip && (
                      <div className="mt-2.5 bg-rose-50 border border-rose-200/60 rounded-xl p-2.5 text-xs text-rose-900 flex items-start gap-2">
                        <Camera className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Astuce photo :</strong> {rev.photoTip}</span>
                      </div>
                    )}
                  </div>

                  {/* Review Footer with Metrics */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#F0F0EE] flex items-center justify-between text-[11px] text-muted">
                    <div className="flex items-center gap-1">
                      {getPlatformIcon(rev.platform)}
                      <span className="capitalize font-medium">{rev.platform}</span>
                    </div>

                    {rev.likesCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-gray-400" />
                        <span>{rev.likesCount.toLocaleString()} mentions utiles</span>
                      </span>
                    )}

                    {rev.sharesOrSaves !== undefined && (
                      <span className="flex items-center gap-1 text-rose-600 font-medium">
                        <Bookmark className="w-3 h-3 fill-rose-500" />
                        <span>{rev.sharesOrSaves.toLocaleString()} épingles</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-line bg-paper flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Coordonnées GPS : {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)} • Données synchronisées Google Maps & Réseaux
          </p>

          <div className="flex items-center gap-2">
            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-line text-ink border border-line transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ouvrir dans Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-ink text-white hover:bg-ink-soft transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
