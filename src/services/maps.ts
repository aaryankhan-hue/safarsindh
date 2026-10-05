import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { LocationPoint, Language } from '../types';
import { calculateDistanceKm } from '../data/sindhLocations';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCTElpmmwDj17GyM-iojDYCpjwnIjMy0L4';

export const isMapsConfigured: boolean = Boolean(
  MAPS_API_KEY && 
  MAPS_API_KEY.trim() !== '' && 
  MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
);

// Service Area Boundary Constants (Naukot - Mithi - Mirpurkhas and nearby towns)
export const SINDH_SERVICE_AREA = {
  center: { lat: 25.0, lng: 69.4 },
  bounds: {
    north: 25.8,
    south: 24.4,
    west: 68.7,
    east: 70.4,
  },
};

export function isWithinServiceArea(lat: number, lng: number): boolean {
  const { north, south, west, east } = SINDH_SERVICE_AREA.bounds;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

// Regional city reference coordinates for nearest city classification
const REGIONAL_CITIES: Array<{ city: LocationPoint['city']; lat: number; lng: number }> = [
  { city: 'Naukot', lat: 24.8583, lng: 69.2045 },
  { city: 'Mithi', lat: 24.7438, lng: 69.8012 },
  { city: 'Mirpurkhas', lat: 25.5276, lng: 69.0125 },
  { city: 'Digri', lat: 25.1565, lng: 69.1120 },
  { city: 'Jhuddo', lat: 24.9650, lng: 69.2980 },
  { city: 'Diplo', lat: 24.4680, lng: 69.5840 },
  { city: 'Islamkot', lat: 24.6980, lng: 70.1780 },
  { city: 'Kunri', lat: 25.1780, lng: 69.5670 },
];

export function getNearestCity(lat: number, lng: number): LocationPoint['city'] {
  let nearestCity: LocationPoint['city'] = 'Naukot';
  let minDistance = Infinity;

  for (const c of REGIONAL_CITIES) {
    const dist = calculateDistanceKm(lat, lng, c.lat, c.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = c.city;
    }
  }

  return nearestCity;
}

// Singleton Google Maps API Loader
let googleMapsPromise: Promise<typeof google.maps | null> | null = null;

export async function loadMaps(lang: Language = 'en'): Promise<typeof google.maps | null> {
  if (!isMapsConfigured) {
    return null;
  }

  if (typeof window !== 'undefined' && window.google?.maps) {
    return window.google.maps;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Google Maps JS API supports 'ur' and 'en'. Sindhi ('sd') falls back to 'en'.
  const mapLang = lang === 'ur' ? 'ur' : 'en';

  setOptions({
    key: MAPS_API_KEY,
    v: 'weekly',
    region: 'PK',
    language: mapLang,
  });

  googleMapsPromise = (async () => {
    try {
      await importLibrary('maps');
      await Promise.allSettled([
        importLibrary('places'),
        importLibrary('geometry'),
        importLibrary('marker'),
      ]);
      return window.google?.maps ?? null;
    } catch (err) {
      console.warn('[SafarSindh] Google Maps JS API failed to load:', err);
      return null;
    }
  })();

  return googleMapsPromise;
}

// Route caching to minimize billing & Directions API requests
interface RouteResult {
  distanceKm: number;
  durationMin: number;
  polyline: Array<{ lat: number; lng: number }>;
  approximate?: boolean;
}

const routeCache = new Map<string, RouteResult>();

export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult> {
  const cacheKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  // If Maps is configured, try Google DirectionsService
  if (isMapsConfigured) {
    try {
      const maps = await loadMaps();
      if (maps) {
        const directionsService = new maps.DirectionsService();
        const request: google.maps.DirectionsRequest = {
          origin: new maps.LatLng(origin.lat, origin.lng),
          destination: new maps.LatLng(destination.lat, destination.lng),
          travelMode: maps.TravelMode.DRIVING,
          region: 'PK',
        };

        const result = await new Promise<google.maps.DirectionsResult | null>((resolve) => {
          directionsService.route(request, (res, status) => {
            if (status === maps.DirectionsStatus.OK && res) {
              resolve(res);
            } else {
              resolve(null);
            }
          });
        });

        if (result && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];
          const distanceKm = Math.round(((leg.distance?.value || 0) / 1000) * 10) / 10;
          const durationMin = Math.round((leg.duration?.value || 0) / 60);

          // Extract path points from overview polyline
          const polyline: Array<{ lat: number; lng: number }> = [];
          if (route.overview_path) {
            route.overview_path.forEach((p) => {
              polyline.push({ lat: p.lat(), lng: p.lng() });
            });
          }

          const routeResult: RouteResult = {
            distanceKm: Math.max(1, distanceKm),
            durationMin: Math.max(2, durationMin),
            polyline: polyline.length > 0 ? polyline : [origin, destination],
            approximate: false,
          };

          routeCache.set(cacheKey, routeResult);
          return routeResult;
        }
      }
    } catch (e) {
      console.warn('[SafarSindh] Directions API fallback:', e);
    }
  }

  // Fallback: Haversine distance with road curvature factor 1.3
  const directDist = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const distanceKm = Math.max(1.5, Math.round(directDist * 10) / 10);
  const durationMin = Math.max(3, Math.round(distanceKm * 1.3));

  // Synthesize a road-like curved path for visualization
  const steps = 12;
  const polyline: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Slight lateral curve based on sine
    const lat = origin.lat + (destination.lat - origin.lat) * fraction;
    const lng = origin.lng + (destination.lng - origin.lng) * fraction + Math.sin(fraction * Math.PI) * 0.015;
    polyline.push({ lat, lng });
  }

  const fallbackResult: RouteResult = {
    distanceKm,
    durationMin,
    polyline,
    approximate: true,
  };

  routeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

export async function geocode(
  address: string
): Promise<{ lat: number; lng: number; address: string; name: string } | null> {
  if (!isMapsConfigured) return null;
  try {
    const maps = await loadMaps();
    if (!maps) return null;

    const geocoder = new maps.Geocoder();
    const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
      geocoder.geocode(
        {
          address,
          region: 'PK',
          bounds: new maps.LatLngBounds(
            new maps.LatLng(SINDH_SERVICE_AREA.bounds.south, SINDH_SERVICE_AREA.bounds.west),
            new maps.LatLng(SINDH_SERVICE_AREA.bounds.north, SINDH_SERVICE_AREA.bounds.east)
          ),
        },
        (results, status) => {
          if (status === maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results);
          } else {
            resolve(null);
          }
        }
      );
    });

    if (result && result.length > 0) {
      const top = result[0];
      const lat = top.geometry.location.lat();
      const lng = top.geometry.location.lng();
      const name = top.address_components?.[0]?.long_name || address;
      return {
        lat,
        lng,
        address: top.formatted_address,
        name,
      };
    }
  } catch (err) {
    console.warn('[SafarSindh] Geocoding error:', err);
  }
  return null;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; name: string; city: LocationPoint['city'] } | null> {
  const city = getNearestCity(lat, lng);

  if (isMapsConfigured) {
    try {
      const maps = await loadMaps();
      if (maps) {
        const geocoder = new maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === maps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results);
            } else {
              resolve(null);
            }
          });
        });

        if (result && result.length > 0) {
          const top = result[0];
          // Look for prominent landmark or neighborhood name
          const name = top.address_components?.[0]?.long_name || `${city} Location`;
          return {
            name,
            address: top.formatted_address,
            city,
          };
        }
      }
    } catch (err) {
      console.warn('[SafarSindh] Reverse geocode error:', err);
    }
  }

  // Fallback description based on coordinates and nearest Sindh hub
  return {
    name: `${city} Sector (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    address: `Near ${city} Road, Sindh, Pakistan`,
    city,
  };
}

// Distance between two points in meters (Haversine formula)
export function getDistanceMeters(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000; // meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculates minimum distance from a point to a planned polyline path
export function getMinDistanceToPathMeters(
  point: { lat: number; lng: number },
  path: Array<{ lat: number; lng: number }>
): number {
  if (!path || path.length === 0) return 0;
  let minDist = Infinity;

  for (let i = 0; i < path.length; i++) {
    const d = getDistanceMeters(point, path[i]);
    if (d < minDist) {
      minDist = d;
    }
  }

  return minDist;
}
