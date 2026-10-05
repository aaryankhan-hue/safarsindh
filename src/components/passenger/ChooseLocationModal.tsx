import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { SINDH_LOCATIONS } from '../../data/sindhLocations';
import { 
  loadMaps, 
  isMapsConfigured, 
  reverseGeocode, 
  isWithinServiceArea, 
  SINDH_SERVICE_AREA,
  getNearestCity
} from '../../services/maps';
import { 
  Search, 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  X, 
  Check, 
  AlertTriangle, 
  Compass, 
  Building2, 
  Map as MapIcon,
  Loader2
} from 'lucide-react';

interface ChooseLocationModalProps {
  initialLocation?: LocationPoint | null;
  type: 'pickup' | 'dropoff';
  lang: Language;
  onSelect: (location: LocationPoint) => void;
  onClose: () => void;
}

export const ChooseLocationModal: React.FC<ChooseLocationModalProps> = ({
  initialLocation,
  type,
  lang,
  onSelect,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur' || lang === 'sd';

  // Mode: 'search' | 'pin'
  const [mode, setMode] = useState<'search' | 'pin'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Current coordinates for Pin on Map
  const [centerCoord, setCenterCoord] = useState<{ lat: number; lng: number }>(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      return { lat: initialLocation.lat, lng: initialLocation.lng };
    }
    return SINDH_SERVICE_AREA.center;
  });

  const [resolvedPoint, setResolvedPoint] = useState<LocationPoint>(() => {
    if (initialLocation) return initialLocation;
    return SINDH_LOCATIONS[0];
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isOutsideArea, setIsOutsideArea] = useState(false);

  // Google Places Autocomplete Predictions
  const [predictions, setPredictions] = useState<
    Array<{ placeId: string; mainText: string; secondaryText: string; description: string }>
  >([]);

  // Real Google Map reference for Pin mode
  const pinMapContainerRef = useRef<HTMLDivElement>(null);
  const pinMapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local filtered locations
  const filteredLocal = SINDH_LOCATIONS.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q)
    );
  });

  // Handle Autocomplete predictions with Google Places if configured
  useEffect(() => {
    if (!isMapsConfigured || !searchQuery.trim() || searchQuery.length < 2) {
      setPredictions([]);
      return;
    }

    let isSubscribed = true;
    loadMaps(lang).then((maps) => {
      if (!maps || !isSubscribed) return;
      try {
        const autocompleteService = new maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: searchQuery,
            componentRestrictions: { country: 'pk' },
            locationBias: new maps.LatLngBounds(
              new maps.LatLng(SINDH_SERVICE_AREA.bounds.south, SINDH_SERVICE_AREA.bounds.west),
              new maps.LatLng(SINDH_SERVICE_AREA.bounds.north, SINDH_SERVICE_AREA.bounds.east)
            ),
          },
          (results, status) => {
            if (isSubscribed && status === maps.places.PlacesServiceStatus.OK && results) {
              setPredictions(
                results.slice(0, 5).map((p) => ({
                  placeId: p.place_id,
                  mainText: p.structured_formatting?.main_text || p.description,
                  secondaryText: p.structured_formatting?.secondary_text || '',
                  description: p.description,
                }))
              );
            } else if (isSubscribed) {
              setPredictions([]);
            }
          }
        );
      } catch (err) {
        console.warn('[SafarSindh] Autocomplete error:', err);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, lang]);

  // Reverse geocode when centerCoord settles in Pin mode
  const triggerReverseGeocode = (lat: number, lng: number) => {
    setIsOutsideArea(!isWithinServiceArea(lat, lng));
    setIsGeocoding(true);

    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    geocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await reverseGeocode(lat, lng);
        if (res) {
          setResolvedPoint({
            name: res.name,
            address: res.address,
            city: res.city,
            lat,
            lng,
          });
        } else {
          const city = getNearestCity(lat, lng);
          setResolvedPoint({
            name: `${city} Custom Point`,
            address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city,
            lat,
            lng,
          });
        }
      } catch (e) {
        console.warn('Geocoding error:', e);
      } finally {
        setIsGeocoding(false);
      }
    }, 400);
  };

  // Initialize Google Map in Pin mode
  useEffect(() => {
    if (mode !== 'pin' || !pinMapContainerRef.current) return;

    if (!isMapsConfigured) {
      // If Maps not configured, trigger reverse-geocode on current centerCoord
      triggerReverseGeocode(centerCoord.lat, centerCoord.lng);
      return;
    }

    let isSubscribed = true;
    loadMaps(lang).then((maps) => {
      if (!maps || !pinMapContainerRef.current || !isSubscribed) return;

      if (!pinMapInstanceRef.current) {
        const map = new maps.Map(pinMapContainerRef.current, {
          center: centerCoord,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#38414e' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#212a37' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#9ca5b3' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#746855' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#17263c' }],
            },
          ],
        });

        pinMapInstanceRef.current = map;

        map.addListener('center_changed', () => {
          const c = map.getCenter();
          if (c) {
            setCenterCoord({ lat: c.lat(), lng: c.lng() });
          }
        });

        map.addListener('idle', () => {
          const c = map.getCenter();
          if (c) {
            triggerReverseGeocode(c.lat(), c.lng());
          }
        });
      } else {
        pinMapInstanceRef.current.setCenter(centerCoord);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [mode]);

  // GPS Current Location Handler
  const handleUseGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError(t.locationPermissionDenied);
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingGps(false);
        const { latitude, longitude } = pos.coords;
        const target = { lat: latitude, lng: longitude };
        setCenterCoord(target);

        if (pinMapInstanceRef.current) {
          pinMapInstanceRef.current.panTo(target);
          pinMapInstanceRef.current.setZoom(15);
        }

        const res = await reverseGeocode(latitude, longitude);
        const city = res?.city || getNearestCity(latitude, longitude);
        const loc: LocationPoint = {
          name: res?.name || 'Current Location',
          address: res?.address || `Near ${city}`,
          city,
          lat: latitude,
          lng: longitude,
        };

        setResolvedPoint(loc);
        setIsOutsideArea(!isWithinServiceArea(latitude, longitude));

        // In search mode, confirm or allow review
        if (mode === 'search') {
          onSelect(loc);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        console.warn('Geolocation error:', err);
        setGpsError(t.locationPermissionDenied);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Google Places selection handler
  const handleSelectPrediction = async (prediction: { placeId: string; description: string; mainText: string }) => {
    setIsGeocoding(true);
    try {
      const maps = await loadMaps(lang);
      if (maps) {
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ placeId: prediction.placeId }, (results, status) => {
          setIsGeocoding(false);
          if (status === maps.GeocoderStatus.OK && results && results[0]) {
            const top = results[0];
            const lat = top.geometry.location.lat();
            const lng = top.geometry.location.lng();
            const city = getNearestCity(lat, lng);
            const selected: LocationPoint = {
              name: prediction.mainText,
              address: top.formatted_address,
              city,
              lat,
              lng,
            };
            onSelect(selected);
          }
        });
      }
    } catch (e) {
      setIsGeocoding(false);
      console.warn('Place selection error:', e);
    }
  };

  // Confirm selection from Pin on Map
  const handleConfirmLocation = () => {
    onSelect(resolvedPoint);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <header className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-md shrink-0 z-20">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition cursor-pointer"
            aria-label="Back"
          >
            {isRtl ? <ArrowLeft size={18} className="rotate-180" /> : <ArrowLeft size={18} />}
          </button>

          <div className="flex-1 text-center">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${type === 'pickup' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{type === 'pickup' ? t.pickupLocation : t.dropoffLocation}</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Naukot · Mithi · Mirpurkhas
            </p>
          </div>

          {/* Toggle between Search & Pin mode */}
          <button
            onClick={() => setMode(mode === 'search' ? 'pin' : 'search')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            {mode === 'search' ? (
              <>
                <MapIcon size={14} />
                <span>{t.pinOnMap}</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      {mode === 'search' ? (
        <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4">
          {/* Search Input Box */}
          <div className="relative">
            <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlacesPlaceholder || 'Search city, landmark, or address...'}
              className="w-full ps-10 pe-10 py-3 rounded-2xl bg-white dark:bg-slate-800/90 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Use GPS Location Button */}
          <button
            onClick={handleUseGps}
            disabled={isLocatingGps}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition disabled:opacity-70 cursor-pointer"
          >
            {isLocatingGps ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t.locatingYou}</span>
              </>
            ) : (
              <>
                <Navigation size={16} className="animate-pulse" />
                <span>{t.useCurrentLocation}</span>
              </>
            )}
          </button>

          {/* GPS Error alert if permission denied */}
          {gpsError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <p>{gpsError}</p>
            </div>
          )}

          {/* Pin on Map Quick Switch Card */}
          <div 
            onClick={() => setMode('pin')}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.chooseOnMap}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Drag and drop pin on live regional map
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>

          {/* Popular Places Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.popularPlaces}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Quick Select
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SINDH_LOCATIONS.slice(0, 8).map((loc) => (
                <button
                  key={loc.id || loc.name}
                  onClick={() => onSelect(loc)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <MapPin size={12} className="text-emerald-500" />
                  <span>{loc.name.split('(')[0].trim()}</span>
                  <span className="text-[10px] text-slate-400">({loc.city})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Google Places Autocomplete Predictions */}
          {predictions.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Google Places Matches
              </span>
              {predictions.map((p) => (
                <div
                  key={p.placeId}
                  onClick={() => handleSelectPrediction(p)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition cursor-pointer flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 size={16} />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {p.mainText}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {p.secondaryText || p.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Local Locations Results List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Regional Points ({filteredLocal.length})
            </span>
            {filteredLocal.map((loc) => (
              <div
                key={loc.id || loc.name}
                onClick={() => onSelect(loc)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500 transition cursor-pointer flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {loc.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {loc.address}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                  {loc.city}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Pin On Map Interactive View */
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
          {/* Real Map or Fallback Map Container */}
          <div className="absolute inset-0 z-0">
            {isMapsConfigured ? (
              <div ref={pinMapContainerRef} className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-slate-950 flex items-center justify-center p-4 text-center">
                <div className="space-y-3 max-w-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Compass size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Regional Sindh Coordinates
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t.mapNotConfigured}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono">
                    Lat: {centerCoord.lat.toFixed(4)}, Lng: {centerCoord.lng.toFixed(4)}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const target = { lat: 24.8583, lng: 69.2045 };
                        setCenterCoord(target);
                        triggerReverseGeocode(target.lat, target.lng);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 text-[11px] text-white hover:bg-slate-700 cursor-pointer"
                    >
                      Naukot
                    </button>
                    <button
                      onClick={() => {
                        const target = { lat: 24.7438, lng: 69.8012 };
                        setCenterCoord(target);
                        triggerReverseGeocode(target.lat, target.lng);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 text-[11px] text-white hover:bg-slate-700 cursor-pointer"
                    >
                      Mithi
                    </button>
                    <button
                      onClick={() => {
                        const target = { lat: 25.5276, lng: 69.0125 };
                        setCenterCoord(target);
                        triggerReverseGeocode(target.lat, target.lng);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 text-[11px] text-white hover:bg-slate-700 cursor-pointer"
                    >
                      MPK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Out of Service Area Banner */}
          {isOutsideArea && (
            <div className="relative z-10 m-3 p-3 rounded-2xl bg-amber-500/95 text-slate-950 font-bold text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-slate-950" />
              <span>{t.outOfServiceArea}</span>
            </div>
          )}

          {/* Fixed Center Pin with Bounce Effect */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="relative -translate-y-6 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/80 ${
                  type === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                } animate-bounce`}
              >
                <MapPin size={22} />
              </div>
              {/* Pin Base Pointer */}
              <div className="w-1.5 h-3 bg-slate-900 mx-auto -mt-0.5 rounded-b-full shadow-sm" />
              {/* Drop Shadow on Ground */}
              <div className="w-5 h-2 bg-black/40 rounded-full blur-[2px] mt-0.5" />
            </div>
          </div>

          {/* Floating Current Location GPS Button */}
          <div className="relative z-10 p-4 flex justify-end">
            <button
              onClick={handleUseGps}
              disabled={isLocatingGps}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 text-emerald-600 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition cursor-pointer"
              title="Locate Me"
            >
              {isLocatingGps ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Navigation size={20} />
              )}
            </button>
          </div>

          {/* Bottom Card with Resolved Address & Big Green Button */}
          <div className="relative z-20 p-4 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 max-w-lg mx-auto w-full space-y-3">
            <div className="flex items-start gap-3">
              <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${type === 'pickup' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-rose-500 ring-4 ring-rose-100'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {type === 'pickup' ? t.pickupLocation : t.dropoffLocation}
                  </span>
                  {isGeocoding && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <Loader2 size={10} className="animate-spin" />
                      Resolving...
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {resolvedPoint.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {resolvedPoint.address}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmLocation}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
            >
              <Check size={18} />
              <span>{t.confirmLocation}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
