import React from 'react';
import { RideRequest, Language } from '../../types';
import { APP_TEXT } from '../../i18n/appText';
import { 
  History, 
  MapPin, 
  ArrowRight, 
  Star, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Navigation,
  Car,
  Bike
} from 'lucide-react';

interface RideHistoryProps {
  rides: RideRequest[];
  lang: Language;
  onViewActiveRide?: () => void;
}

export const RideHistory: React.FC<RideHistoryProps> = ({
  rides,
  lang,
  onViewActiveRide,
}) => {
  const t = APP_TEXT[lang];

  // Sort newest first
  const sortedRides = [...rides].sort((a, b) => b.createdAt - a.createdAt);

  const activeRide = sortedRides.find(
    (r) => r.status !== 'completed' && r.status !== 'cancelled'
  );

  return (
    <div className="w-full max-w-lg mx-auto p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History size={20} className="text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t.myRidesTitle}
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          {rides.length} trips
        </span>
      </div>

      {/* Active Ride Banner if exists */}
      {activeRide && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-md flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Current Ride: {activeRide.pickup.city} → {activeRide.dropoff.city}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Fare: Rs. {activeRide.finalFare || activeRide.passengerOffer} · Status: {activeRide.status}
            </p>
          </div>
          {onViewActiveRide && (
            <button
              onClick={onViewActiveRide}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition shrink-0"
            >
              {t.viewCurrentRide}
            </button>
          )}
        </div>
      )}

      {/* Rides List */}
      {sortedRides.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History size={32} />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
            {t.noRidesYet}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            {t.noRidesSub}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRides.map((ride) => {
            const isCompleted = ride.status === 'completed';
            const isCancelled = ride.status === 'cancelled';
            const fare = ride.finalFare || ride.passengerOffer;
            const dateStr = new Date(ride.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ride.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3"
              >
                {/* Header Row: City to City & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                      <span>{ride.pickup.city}</span>
                      <ArrowRight size={14} className="text-emerald-500 rtl:rotate-180" />
                      <span>{ride.dropoff.city}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      <span>{dateStr}</span>
                      <span>·</span>
                      <span>{ride.distanceKm} km</span>
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 size={12} />
                        <span>{t.statusCompleted}</span>
                      </span>
                    ) : isCancelled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        <XCircle size={12} />
                        <span>{t.statusCancelled}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <Navigation size={12} className="animate-spin" />
                        <span>{t.statusInProgress}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Pickup and Destination Details */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {ride.pickup.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {ride.dropoff.name}
                    </span>
                  </div>
                </div>

                {/* Driver / Cancellation Info / Rating */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    {isCancelled ? (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        <span className="font-semibold">
                          {ride.cancelledBy === 'driver' ? t.cancelledByDriver : t.cancelledByPassenger}
                        </span>
                        {ride.cancellationReason && (
                          <span className="block text-[10px] text-slate-400">
                            {t.cancelReasonPrefix} {ride.cancellationReason}
                          </span>
                        )}
                      </div>
                    ) : ride.driverName ? (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <span>Driver: <strong>{ride.driverName}</strong></span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {ride.driverVehicle || 'Vehicle'} ({ride.driverPlate || ''})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">No driver assigned</span>
                    )}
                  </div>

                  <div className="text-end">
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      Rs. {fare}
                    </div>
                    {isCompleted && (
                      <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px]">
                        {ride.ratingGiven && ride.ratingGiven.stars > 0 ? (
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star size={12} className="fill-amber-400 me-0.5" />
                            {ride.ratingGiven.stars} / 5
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">{t.notRated}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
