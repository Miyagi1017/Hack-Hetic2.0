import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Activity, ItineraryStep, PhotoSpotSpotlight } from '../types/travel';
import { CURATED_PHOTO_SPOTS } from '../data/mock-data';
import { Layers, Maximize2, Compass, Sparkles, Navigation, MapPin, Camera, ExternalLink, ShieldCheck, Users, Sun } from 'lucide-react';

interface InteractiveMapProps {
  steps: ItineraryStep[];
  selectedStepId?: string | null;
  onSelectActivity: (activity: Activity) => void;
  chatLocations?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    category?: string;
    description?: string;
  }[];
  onAskAboutPlace?: (placeName: string) => void;
  onOpenComparator?: (activity: Activity) => void;
  onOpenPhotoSpot?: (spot: PhotoSpotSpotlight) => void;
  center?: [number, number];
  zoom?: number;
  showPhotoSpots?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  steps,
  selectedStepId,
  onSelectActivity,
  chatLocations = [],
  onAskAboutPlace,
  onOpenComparator,
  onOpenPhotoSpot,
  center = [41.8986, 12.4769],
  zoom = 14,
  showPhotoSpots = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const scenicLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const chatLayerRef = useRef<L.LayerGroup | null>(null);

  // Default to Google Maps Streets
  const [tileMode, setTileMode] = useState<'google_streets' | 'google_hybrid' | 'google_terrain' | 'carto_light'>('google_streets');
  const [isGoogleEmbedActive, setIsGoogleEmbedActive] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Google Maps tile layers & Carto fallback
  const tileUrls = {
    google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_hybrid: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    google_terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    carto_light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Default Google Maps Street tiles
    const tileLayer = L.tileLayer(tileUrls.google_streets, {
      attribution: '&copy; Google Maps Data',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    (map as any)._baseTileLayer = tileLayer;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    scenicLayerRef.current = L.layerGroup().addTo(map);
    chatLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base tile layer on style change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    const isGoogle = tileMode.startsWith('google');
    const newLayer = L.tileLayer(tileUrls[tileMode], {
      attribution: isGoogle ? '&copy; Google Maps' : '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: isGoogle ? 20 : 19,
      subdomains: isGoogle ? ['mt0', 'mt1', 'mt2', 'mt3'] : ['a', 'b', 'c', 'd'],
    }).addTo(map);

    (map as any)._baseTileLayer = newLayer;
  }, [tileMode]);

  // Center update when props change (destination switch)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(center, zoom);
  }, [center, zoom]);

  // Update Itinerary Markers, Scenic Passages & Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    const scenicLayer = scenicLayerRef.current;
    if (!map || !layer || !scenicLayer) return;

    layer.clearLayers();
    scenicLayer.clearLayers();

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      const casing = (routeLayerRef.current as any)._casing;
      if (casing) map.removeLayer(casing);
      routeLayerRef.current = null;
    }

    const latLngs: L.LatLngExpression[] = [];

    steps.forEach((step, index) => {
      const act = step.activity;
      latLngs.push([act.lat, act.lng]);

      const isConflict = !!step.conflict;
      const isSelected = selectedStepId === act.id;

      // Activity Step Marker Pin
      const markerHtml = `
        <div class="custom-marker-pin" style="
          width: ${isSelected ? '38px' : '32px'};
          height: ${isSelected ? '38px' : '32px'};
          background: ${isConflict ? '#F59E0B' : isSelected ? '#1D1B16' : '#FFFFFF'};
          color: ${isConflict || isSelected ? '#FFFFFF' : '#1D1B16'};
          border: 2px solid ${isConflict ? '#D97706' : isSelected ? '#000000' : '#EAE4D8'};
          border-radius: 50%;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${isSelected ? '0 0 0 4px rgba(29,27,22,0.18)' : '0 4px 10px rgba(0,0,0,0.15)'};
        ">
          ${isConflict ? '⚠' : index + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'empty-leaflet-class',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([act.lat, act.lng], { icon: customIcon });

      // Rich popup card
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-ink min-w-[220px]';
      popupContent.innerHTML = `
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isConflict ? 'bg-amber-100 text-amber-800' : 'bg-ink text-white'
          }">Étape ${index + 1} • ${act.time}</span>
          ${isConflict ? '<span class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">Conflit</span>' : ''}
        </div>
        <h4 class="font-serif font-semibold text-base leading-snug mb-1">${act.name}</h4>
        <p class="text-xs text-muted mb-2 leading-relaxed">${act.address}</p>
        <div class="flex items-center justify-between text-xs font-medium pt-2 border-t border-line">
          <span>${act.price > 0 ? `${act.price} €` : 'Gratuit'}</span>
          <span class="text-muted">${act.duration}</span>
        </div>
      `;

      // Action Buttons Container
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'mt-2.5 pt-2 border-t border-line flex flex-col gap-1.5';

      // Price comparison & booking button
      if (onOpenComparator) {
        const bookBtn = document.createElement('button');
        bookBtn.className = 'w-full py-1.5 px-2 bg-ink hover:bg-ink-soft text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer';
        bookBtn.innerHTML = `<span>🏷️ Comparer & Réserver (${act.price > 0 ? `${act.price} €` : 'Offres'})</span>`;
        bookBtn.onclick = (e) => {
          e.stopPropagation();
          onOpenComparator(act);
          marker.closePopup();
        };
        actionsDiv.appendChild(bookBtn);
      }

      // Google Maps button
      const gmapsLink = document.createElement('a');
      gmapsLink.href = act.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + ' ' + act.address)}`;
      gmapsLink.target = '_blank';
      gmapsLink.rel = 'noreferrer';
      gmapsLink.className = 'w-full py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors text-center';
      gmapsLink.innerHTML = `<span>📍 Ouvrir dans Google Maps ↗</span>`;
      actionsDiv.appendChild(gmapsLink);

      // Ask AI button in popup
      if (onAskAboutPlace) {
        const askBtn = document.createElement('button');
        askBtn.className = 'w-full py-1 px-2 bg-paper hover:bg-line text-[11px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors text-ink cursor-pointer';
        askBtn.innerHTML = `<span>✨ Poser une question à l'IA</span>`;
        askBtn.onclick = (e) => {
          e.stopPropagation();
          onAskAboutPlace(act.name);
          marker.closePopup();
        };
        actionsDiv.appendChild(askBtn);
      }

      popupContent.appendChild(actionsDiv);

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectActivity(act);
      });

      layer.addLayer(marker);

      // Add Scenic Passage Marker on Route (Jardin, Parc, Monument Paysager, Spot Photo)
      if (step.scenicPassage) {
        const sc = step.scenicPassage;
        const scenicIconHtml = `
          <div class="custom-marker-pin" style="
            width: 32px;
            height: 32px;
            background: #059669;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(5,150,105,0.4);
          ">
            ${sc.type === 'jardin' || sc.type === 'parc' ? '🌿' : '📸'}
          </div>
        `;

        const scenicMarkerIcon = L.divIcon({
          html: scenicIconHtml,
          className: 'empty-scenic-class',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const scenicMarker = L.marker([sc.lat, sc.lng], { icon: scenicMarkerIcon });
        scenicMarker.bindPopup(`
          <div class="p-1 min-w-[230px] max-w-[270px] text-ink">
            <img src="${sc.photoUrl}" alt="${sc.name}" onerror="this.style.display='none'" class="w-full h-24 object-cover rounded-xl mb-2 border border-line bg-paper" />
            <div class="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 inline-flex">
              <span>Passage paysager • ${sc.safetyRating} (${sc.safetyScore}%)</span>
            </div>
            <h4 class="font-serif font-semibold text-sm leading-snug mb-1">${sc.name}</h4>
            <p class="text-xs text-muted mb-2 leading-relaxed">${sc.description}</p>
            <div class="p-2 bg-paper rounded-xl text-xs space-y-1 mb-2">
              <p class="font-semibold text-ink flex items-center gap-1">📸 ${sc.instagrammableSpot}</p>
              <p class="text-[11px] text-muted">${sc.photoTips}</p>
              <p class="text-[11px] text-amber-900 font-semibold">✨ Golden Hour : ${sc.goldenHour}</p>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sc.name)}" target="_blank" rel="noreferrer" class="w-full py-1 text-center bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold block hover:bg-blue-100 transition-colors">
              Voir sur Google Maps ↗
            </a>
          </div>
        `);

        scenicLayer.addLayer(scenicMarker);
      }
    });

    // Add Curated Photo Spots (Instagram, Pinterest, Google, Facebook)
    if (showPhotoSpots) {
      CURATED_PHOTO_SPOTS.forEach((spot) => {
      const spotIconHtml = `
        <div class="custom-marker-pin" style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #EC4899, #8B5CF6);
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(236,72,153,0.4);
          cursor: pointer;
        ">
          📸
        </div>
      `;

      const spotMarkerIcon = L.divIcon({
        html: spotIconHtml,
        className: 'empty-spot-class',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const spotMarker = L.marker([spot.lat, spot.lng], { icon: spotMarkerIcon });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 min-w-[240px] max-w-[280px] text-ink';
      popupDiv.innerHTML = `
        <img src="${spot.photoUrl}" alt="${spot.name}" onerror="this.style.display='none'" class="w-full h-24 object-cover rounded-xl mb-2 border border-line bg-paper" />
        <div class="flex items-center gap-1 text-[10px] font-semibold text-pink-900 bg-pink-50 px-2 py-0.5 rounded-full mb-1 inline-flex">
          <span>📸 Spot Instagramable • ${spot.category}</span>
        </div>
        <h4 class="font-serif font-semibold text-sm leading-snug mb-1">${spot.name}</h4>
        <p class="text-xs text-muted mb-2">${spot.locationName}</p>
        <div class="grid grid-cols-2 gap-1 p-2 bg-paper rounded-xl text-[10px] font-semibold mb-2">
          <span>⭐ Google: ${spot.platformMetrics.googleRating}</span>
          <span>📸 IG: ${spot.platformMetrics.instagramPosts.split(' ')[0]}</span>
          <span>📌 Pin: ${spot.platformMetrics.pinterestSaves.split(' ')[0]}</span>
          <span>👍 FB: ${spot.platformMetrics.facebookRecommendations.split(' ')[0]}</span>
        </div>
      `;

      if (onOpenPhotoSpot) {
        const viewBtn = document.createElement('button');
        viewBtn.className = 'w-full py-1.5 px-2 bg-ink hover:bg-ink-soft text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 mb-1.5 transition-colors cursor-pointer';
        viewBtn.innerHTML = `<span>📸 Voir Photos & Tous les Avis (${spot.reviews.length})</span>`;
        viewBtn.onclick = (e) => {
          e.stopPropagation();
          onOpenPhotoSpot(spot);
          spotMarker.closePopup();
        };
        popupDiv.appendChild(viewBtn);
      }

      const gLink = document.createElement('a');
      gLink.href = spot.googleMapsUrl;
      gLink.target = '_blank';
      gLink.rel = 'noreferrer';
      gLink.className = 'w-full py-1 text-center bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold block hover:bg-blue-100 transition-colors';
      gLink.innerHTML = `<span>Ouvrir dans Google Maps ↗</span>`;
      popupDiv.appendChild(gLink);

      spotMarker.bindPopup(popupDiv);
      scenicLayer.addLayer(spotMarker);
      });
    }

    // Draw route path between steps (white casing + terracotta line)
    if (latLngs.length > 1) {
      const casing = L.polyline(latLngs, {
        color: '#FFFDF8',
        weight: 8,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);

      const route = L.polyline(latLngs, {
        color: '#B4542F',
        weight: 3.5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
        dashArray: '1, 9',
      }).addTo(map);

      routeLayerRef.current = route;
      (routeLayerRef.current as any)._casing = casing;
    }
  }, [steps, selectedStepId, showPhotoSpots]);

  // Center on selected activity
  useEffect(() => {
    if (!selectedStepId || !mapInstanceRef.current) return;
    const selectedStep = steps.find((s) => s.activity.id === selectedStepId);
    if (selectedStep) {
      mapInstanceRef.current.flyTo(
        [selectedStep.activity.lat, selectedStep.activity.lng],
        16,
        { duration: 1.2 }
      );
    }
  }, [selectedStepId, steps]);

  // Render locations suggested by Chatbot
  useEffect(() => {
    const map = mapInstanceRef.current;
    const chatLayer = chatLayerRef.current;
    if (!map || !chatLayer) return;

    chatLayer.clearLayers();

    if (chatLocations.length === 0) return;

    chatLocations.forEach((loc) => {
      const pinHtml = `
        <div class="custom-marker-pin" style="
          width: 34px;
          height: 34px;
          background: #10B981;
          color: #FFFFFF;
          border: 2px solid #059669;
          border-radius: 50%;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
        ">
          ✨
        </div>
      `;

      const chatIcon = L.divIcon({
        html: pinHtml,
        className: 'empty-chat-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: chatIcon });
      marker.bindPopup(`
        <div class="p-1 min-w-[200px]">
          <div class="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
            <span>Recommandation IA</span>
          </div>
          <h4 class="font-serif font-semibold text-base mb-1">${loc.name}</h4>
          <p class="text-xs text-muted mb-2">${loc.address}</p>
          <p class="text-xs text-ink bg-paper p-2 rounded-lg mb-2">${loc.description || 'Lieu recommandé par votre concierge Odyssée.'}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + ' ' + loc.address)}" target="_blank" rel="noreferrer" class="text-xs font-semibold text-blue-700 hover:text-blue-900 block text-center bg-blue-50 py-1 rounded-md">
            Ouvrir dans Google Maps ↗
          </a>
        </div>
      `);

      chatLayer.addLayer(marker);
    });

    if (chatLocations.length > 0) {
      map.flyTo([chatLocations[0].lat, chatLocations[0].lng], 15, { duration: 1.2 });
    }
  }, [chatLocations]);

  const fitBoundsToAll = () => {
    const map = mapInstanceRef.current;
    if (!map || steps.length === 0) return;
    const bounds = L.latLngBounds(steps.map((s) => [s.activity.lat, s.activity.lng]));
    if (chatLocations.length > 0) {
      chatLocations.forEach((c) => bounds.extend([c.lat, c.lng]));
    }
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  };

  // Google Maps Full Itinerary URL generator
  const getGoogleMapsDirectionsUrl = () => {
    if (steps.length === 0) return 'https://www.google.com/maps';
    const origin = encodeURIComponent(steps[0].activity.address);
    const destination = encodeURIComponent(steps[steps.length - 1].activity.address);
    const waypoints = steps.slice(1, -1).map((s) => encodeURIComponent(s.activity.address)).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
  };

  return (
    <div className="relative h-full min-h-[260px] w-full overflow-hidden rounded-[20px] border border-line/80 bg-paper-deep shadow-xs">
      {/* Either Leaflet Map (with Google Maps Tiles) OR Direct Google Maps Embed View */}
      {!isGoogleEmbedActive ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full relative bg-paper">
          <iframe
            title="Google Maps Itinéraire"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${center[0]},${center[1]}&z=${zoom}&output=embed`}
          />
        </div>
      )}

      {/* Floating map controls */}
      <div className="absolute right-3 top-3 z-[400] flex flex-col gap-1.5 sm:right-4 sm:top-4 sm:gap-2">
        {/* Recenter */}
        <button
          onClick={fitBoundsToAll}
          title="Recadrer sur l'itinéraire"
          aria-label="Recadrer sur l'itinéraire"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/95 text-ink shadow-sm backdrop-blur-sm hover:bg-paper"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Google Maps External Directions Link */}
        <a
          href={getGoogleMapsDirectionsUrl()}
          target="_blank"
          rel="noreferrer"
          title="Lancer l'itinéraire complet dans Google Maps (GPS)"
          aria-label="Lancer l'itinéraire dans Google Maps"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/95 text-ink-soft shadow-sm backdrop-blur-sm hover:bg-paper hover:text-accent"
        >
          <Navigation className="h-4 w-4" />
        </a>

        {/* Toggle Direct Google Maps Embed View */}
        <button
          onClick={() => setIsGoogleEmbedActive(!isGoogleEmbedActive)}
          title={isGoogleEmbedActive ? "Revenir à la carte interactive" : "Mode Google Maps Direct"}
          aria-label={isGoogleEmbedActive ? "Revenir à la carte interactive" : "Mode Google Maps Direct"}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border text-[11px] font-semibold shadow-sm backdrop-blur-sm ${
            isGoogleEmbedActive
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-white/95 text-ink hover:bg-paper'
          }`}
        >
          <span>G</span>
        </button>

        {/* Layer style selector */}
        {!isGoogleEmbedActive && (
          <div className="relative">
            <button
              title="Changer de fond de carte"
              aria-label="Changer de fond de carte"
              aria-expanded={isLayersOpen}
              onClick={() => setIsLayersOpen((open) => !open)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm backdrop-blur-sm ${
                isLayersOpen
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white/95 text-ink hover:bg-paper'
              }`}
            >
              <Layers className="h-4 w-4" />
            </button>
            {isLayersOpen && (
              <div className="absolute right-0 top-0 z-[500] mt-11 flex min-w-[178px] flex-col gap-1 rounded-xl border border-line bg-white p-1.5 text-xs font-semibold shadow-lg">
                <button
                  onClick={() => {
                    setTileMode('google_streets');
                    setIsLayersOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-left ${
                    tileMode === 'google_streets' ? 'bg-ink text-white' : 'text-ink hover:bg-paper'
                  }`}
                >
                  Plan (rues)
                </button>
                <button
                  onClick={() => {
                    setTileMode('google_hybrid');
                    setIsLayersOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-left ${
                    tileMode === 'google_hybrid' ? 'bg-ink text-white' : 'text-ink hover:bg-paper'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => {
                    setTileMode('google_terrain');
                    setIsLayersOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-left ${
                    tileMode === 'google_terrain' ? 'bg-ink text-white' : 'text-ink hover:bg-paper'
                  }`}
                >
                  Relief
                </button>
                <button
                  onClick={() => {
                    setTileMode('carto_light');
                    setIsLayersOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-left ${
                    tileMode === 'carto_light' ? 'bg-ink text-white' : 'text-ink hover:bg-paper'
                  }`}
                >
                  Épuré
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend overlay */}
      <div className="absolute bottom-3 left-3 z-[400] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-white/95 px-3 py-2 text-[11px] text-ink shadow-sm backdrop-blur-sm sm:bottom-4 sm:left-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
          <span className="font-medium">Étapes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="font-medium">Conflit</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
          <span className="font-medium">Jardin & photo</span>
        </div>
        {chatLocations.length > 0 && (
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <span>Recommandation IA</span>
          </div>
        )}
      </div>
    </div>
  );
};
