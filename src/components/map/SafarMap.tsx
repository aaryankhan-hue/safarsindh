import React, { useEffect, useRef, useState } from 'react';
import { LocationPoint } from '../../types';
import { 
  loadMaps, 
  isMapsConfigured, 
  getRoute, 
  SINDH_SERVICE_AREA 
} from '../../services/maps';
import { Navigation, Compass, Plus, Minus, AlertTriangle } from 'lucide-react';

interface SafarMapProps {
  pickup?: LocationPoint | null;
  dropoff?: LocationPoint | null;
  driverLocation?: { lat: number; lng: number } | null;
  driverType?: string;
  onSelectLocation?: (lat: number, lng: number) => void;
  interactive?: boolean;
  className?: string;
  zoomLevel?: number;
  routePolyline?: Array<{ lat: number; lng: number }>;
  isOffRoute?: boolean;
}

const PICKUP_ICON_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#10b981" stroke="#ffffff" stroke-width="3"/><circle cx="18" cy="18" r="6" fill="#ffffff"/></svg>`
)}`;

const DROPOFF_ICON_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#ef4444" stroke="#ffffff" stroke-width="3"/><circle cx="18" cy="18" r="6" fill="#ffffff"/></svg>`
)}`;

const CAR_ICON_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1e3a8a" stroke="#60a5fa" stroke-width="3"/><path d="M12 24 L15 16 L25 16 L28 24 Z" fill="#ffffff"/><circle cx="15" cy="25" r="2.5" fill="#93c5fd"/><circle cx="25" cy="25" r="2.5" fill="#93c5fd"/></svg>`
)}`;

const BIKE_ICON_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#065f46" stroke="#34d399" stroke-width="3"/><path d="M13 24 L17 18 L23 18 L27 24 Z" fill="#ffffff"/><circle cx="14" cy="24" r="2.5" fill="#a7f3d0"/><circle cx="26" cy="24" r="2.5" fill="#a7f3d0"/></svg>`
)}`;

export const SafarMap: React.FC<SafarMapProps> = ({
  pickup,
  dropoff,
  driverLocation,
  driverType = 'car_economy',
  onSelectLocation,
  interactive = true,
  className = '',
  routePolyline,
  isOffRoute = false,
}) => {
  // Google Maps DOM ref
  const googleMapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const dropoffMarkerRef = useRef<google.maps.Marker | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const prevDriverPosRef = useRef<{ lat: number; lng: number } | null>(null);

  // Fallback SVG Map state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pulse, setPulse] = useState(0);

  // Region bounds for SVG projection
  const minLat = 24.4;
  const maxLat = 25.7;
  const minLng = 68.8;
  const maxLng = 70.3;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 860 + 70;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 740 + 80;
    return { x, y };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // SVG Center & Zoom on pickup/dropoff
  useEffect(() => {
    if (pickup && dropoff) {
      const p1 = project(pickup.lat, pickup.lng);
      const p2 = project(dropoff.lat, dropoff.lng);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      setOffset({ x: 500 - midX, y: 450 - midY });
      setZoom(1.3);
    } else if (pickup) {
      const p1 = project(pickup.lat, pickup.lng);
      setOffset({ x: 500 - p1.x, y: 450 - p1.y });
      setZoom(1.5);
    } else {
      setOffset({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  // Real Google Maps Initialization & Synchronization
  useEffect(() => {
    if (!isMapsConfigured || !googleMapDivRef.current) return;

    let isCancelled = false;

    loadMaps().then(async (maps) => {
      if (isCancelled || !maps || !googleMapDivRef.current) return;

      // 1. Initialize Map if not created
      if (!mapInstanceRef.current) {
        const initialCenter = pickup
          ? { lat: pickup.lat, lng: pickup.lng }
          : SINDH_SERVICE_AREA.center;

        const map = new maps.Map(googleMapDivRef.current, {
          center: initialCenter,
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: interactive ? 'greedy' : 'none',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#34d399' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#374151' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#1f2937' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#4b5563' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#10b981' }, { weight: 1.5 }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0f172a' }],
            },
          ],
        });

        if (onSelectLocation) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onSelectLocation(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // 2. Pickup Marker
      if (pickup) {
        const pos = { lat: pickup.lat, lng: pickup.lng };
        if (!pickupMarkerRef.current) {
          pickupMarkerRef.current = new maps.Marker({
            position: pos,
            map,
            title: `Pickup: ${pickup.name}`,
            icon: {
              url: PICKUP_ICON_SVG,
              scaledSize: new maps.Size(32, 32),
              anchor: new maps.Point(16, 16),
            },
          });
        } else {
          pickupMarkerRef.current.setPosition(pos);
          pickupMarkerRef.current.setMap(map);
        }
      } else if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setMap(null);
      }

      // 3. Dropoff Marker
      if (dropoff) {
        const pos = { lat: dropoff.lat, lng: dropoff.lng };
        if (!dropoffMarkerRef.current) {
          dropoffMarkerRef.current = new maps.Marker({
            position: pos,
            map,
            title: `Destination: ${dropoff.name}`,
            icon: {
              url: DROPOFF_ICON_SVG,
              scaledSize: new maps.Size(32, 32),
              anchor: new maps.Point(16, 16),
            },
          });
        } else {
          dropoffMarkerRef.current.setPosition(pos);
          dropoffMarkerRef.current.setMap(map);
        }
      } else if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setMap(null);
      }

      // 4. Driver Marker with smooth motion
      if (driverLocation) {
        const driverIcon = driverType === 'bike' ? BIKE_ICON_SVG : CAR_ICON_SVG;
        const currentTarget = { lat: driverLocation.lat, lng: driverLocation.lng };

        if (!driverMarkerRef.current) {
          driverMarkerRef.current = new maps.Marker({
            position: currentTarget,
            map,
            title: 'Driver Live Location',
            icon: {
              url: driverIcon,
              scaledSize: new maps.Size(36, 36),
              anchor: new maps.Point(18, 18),
            },
          });
          prevDriverPosRef.current = currentTarget;
        } else {
          driverMarkerRef.current.setMap(map);
          // Animate smoothly between previous position and current target
          const prev = prevDriverPosRef.current || currentTarget;
          const marker = driverMarkerRef.current;
          let startTime: number | null = null;
          const duration = 1200; // ms

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min(1, (timestamp - startTime) / duration);
            const lat = prev.lat + (currentTarget.lat - prev.lat) * progress;
            const lng = prev.lng + (currentTarget.lng - prev.lng) * progress;
            marker.setPosition({ lat, lng });
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              prevDriverPosRef.current = currentTarget;
            }
          };

          requestAnimationFrame(step);
        }
      } else if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null);
      }

      // 5. Route Polyline
      if (pickup && dropoff) {
        let path = routePolyline;
        if (!path || path.length === 0) {
          const route = await getRoute(
            { lat: pickup.lat, lng: pickup.lng },
            { lat: dropoff.lat, lng: dropoff.lng }
          );
          path = route.polyline;
        }

        const strokeColor = isOffRoute ? '#f59e0b' : '#10b981';

        if (!polylineRef.current) {
          polylineRef.current = new maps.Polyline({
            path,
            geodesic: true,
            strokeColor,
            strokeOpacity: 0.85,
            strokeWeight: 4,
            map,
          });
        } else {
          polylineRef.current.setPath(path);
          polylineRef.current.setOptions({ strokeColor });
          polylineRef.current.setMap(map);
        }

        // Fit bounds comfortably to show pickup, dropoff, and driver
        const bounds = new maps.LatLngBounds();
        bounds.extend({ lat: pickup.lat, lng: pickup.lng });
        bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
        if (driverLocation) {
          bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
        }
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      } else if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    pickup?.lat,
    pickup?.lng,
    dropoff?.lat,
    dropoff?.lng,
    driverLocation?.lat,
    driverLocation?.lng,
    driverType,
    routePolyline,
    isOffRoute,
    interactive,
  ]);

  // Touch & Mouse handlers for SVG fallback
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !interactive || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const pPos = pickup ? project(pickup.lat, pickup.lng) : null;
  const dPos = dropoff ? project(dropoff.lat, dropoff.lng) : null;
  const drvPos = driverLocation ? project(driverLocation.lat, driverLocation.lng) : null;

  // Regional landmark coordinates for SVG map
  const mpk = project(25.5276, 69.0125);
  const naukot = project(24.8583, 69.2045);
  const mithi = project(24.7438, 69.8012);
  const digri = project(25.1565, 69.112);
  const jhuddo = project(24.965, 69.298);
  const diplo = project(24.468, 69.584);
  const islamkot = project(24.698, 70.178);

  return (
    <div
      className={`relative w-full h-full bg-slate-950 overflow-hidden select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* If Maps API configured, render real Google Map */}
      {isMapsConfigured ? (
        <div ref={googleMapDivRef} className="w-full h-full" />
      ) : (
        /* SVG Map Fallback */
        <>
          <svg
            viewBox="0 0 1000 900"
            className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <defs>
              <pattern id="safarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
              </pattern>
              <linearGradient id="tharSandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b18" />
                <stop offset="50%" stopColor="#292017" />
                <stop offset="100%" stopColor="#181e1b" />
              </linearGradient>
            </defs>

            <rect width="1000" height="900" fill="url(#tharSandGrad)" />
            <rect width="1000" height="900" fill="url(#safarGrid)" />

            {/* Regional Highways */}
            <path
              d={`M ${mpk.x} ${mpk.y} Q ${digri.x} ${digri.y} ${naukot.x} ${naukot.y}`}
              fill="none"
              stroke="#475569"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d={`M ${naukot.x} ${naukot.y} Q ${jhuddo.x + 30} ${jhuddo.y + 40} ${mithi.x} ${mithi.y}`}
              fill="none"
              stroke="#475569"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d={`M ${mithi.x} ${mithi.y} L ${islamkot.x} ${islamkot.y}`}
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="6,4"
            />
            <path
              d={`M ${naukot.x} ${naukot.y} L ${diplo.x} ${diplo.y}`}
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="6,4"
            />

            {/* Route connecting Pickup & Dropoff */}
            {pPos && dPos && (
              <path
                d={`M ${pPos.x} ${pPos.y} Q ${(pPos.x + dPos.x) / 2 + 25} ${(pPos.y + dPos.y) / 2 - 20} ${dPos.x} ${dPos.y}`}
                fill="none"
                stroke={isOffRoute ? '#f59e0b' : '#10b981'}
                strokeWidth="4.5"
                strokeDasharray="8 5"
                className="animate-pulse"
              />
            )}

            {/* Regional Hub Markers */}
            {[
              { pos: mpk, label: 'Mirpurkhas (ميرپورخاص)' },
              { pos: naukot, label: 'Naukot (قلعه نوڪوٽ)' },
              { pos: mithi, label: 'Mithi (مٺي)' },
              { pos: digri, label: 'Digri (ڊگھڙي)' },
              { pos: jhuddo, label: 'Jhuddo (جھڏو)' },
              { pos: islamkot, label: 'Islamkot (اسلام ڪوٽ)' },
              { pos: diplo, label: 'Diplo (ڏيپلو)' },
            ].map((hub, idx) => (
              <g key={idx} transform={`translate(${hub.pos.x}, ${hub.pos.y})`}>
                <circle cx="0" cy="0" r="5" fill="#10b981" opacity="0.6" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                <text
                  x="0"
                  y="-9"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {hub.label}
                </text>
              </g>
            ))}

            {/* Pickup Marker */}
            {pPos && (
              <g transform={`translate(${pPos.x}, ${pPos.y})`}>
                <circle cx="0" cy="0" r="16" fill="#10b981" opacity="0.25" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                <rect x="-42" y="-36" width="84" height="22" rx="4" fill="#059669" />
                <text x="0" y="-22" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  PICKUP
                </text>
              </g>
            )}

            {/* Dropoff Marker */}
            {dPos && (
              <g transform={`translate(${dPos.x}, ${dPos.y})`}>
                <circle cx="0" cy="0" r="16" fill="#ef4444" opacity="0.25" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                <rect x="-48" y="-36" width="96" height="22" rx="4" fill="#ef4444" />
                <text x="0" y="-22" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  DESTINATION
                </text>
              </g>
            )}

            {/* Assigned Driver Animated Marker */}
            {drvPos && (
              <g transform={`translate(${drvPos.x}, ${drvPos.y})`}>
                <circle cx="0" cy="0" r="22" fill="#3b82f6" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="14" fill="#1d4ed8" stroke="#ffffff" strokeWidth="3" />
                <path
                  d={
                    driverType === 'bike'
                      ? 'M -5 2 L -2 -3 L 3 -3 L 5 2 Z'
                      : 'M -6 -2 L -4 -6 L 4 -6 L 6 -2 L 7 4 L -7 4 Z'
                  }
                  fill="#ffffff"
                />
                <rect x="-35" y="-34" width="70" height="18" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
                <text x="0" y="-21" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">
                  DRIVER ETA
                </text>
              </g>
            )}
          </svg>

          {/* Fallback Notice Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-[10px] text-amber-400 font-semibold shadow-md">
            <AlertTriangle size={12} className="text-amber-400 shrink-0" />
            <span>Map preview mode (Add VITE_GOOGLE_MAPS_API_KEY for live Google Maps)</span>
          </div>

          {/* SVG Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.min(3, z + 0.3));
              }}
              className="w-10 h-10 rounded-xl bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/60 shadow-lg flex items-center justify-center hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              aria-label="Zoom in"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.max(0.8, z - 0.3));
              }}
              className="w-10 h-10 rounded-xl bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/60 shadow-lg flex items-center justify-center hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              aria-label="Zoom out"
            >
              <Minus size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="w-10 h-10 rounded-xl bg-slate-900/85 backdrop-blur-md text-emerald-400 border border-slate-700/60 shadow-lg flex items-center justify-center hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              title="Recenter Naukot-Mithi-Mirpurkhas"
            >
              <Compass size={18} />
            </button>
          </div>
        </>
      )}

      {/* Watermark badge */}
      <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-300">
        <Navigation size={12} className="text-emerald-400" />
        <span>Sindh Regional GIS · Naukot–Mithi–MPK</span>
      </div>
    </div>
  );
};
