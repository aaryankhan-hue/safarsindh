import React, { useState } from 'react';
import { RideRequest, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { APP_TEXT } from '../../i18n/appText';
import { RideChatModal } from '../common/RideChatModal';
import { SosModal } from '../common/SosModal';
import { CancelRideModal } from '../common/CancelRideModal';
import { 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  KeyRound, 
  MapPin, 
  Navigation, 
  Star, 
  Car, 
  Bike, 
  Banknote, 
  CheckCircle,
  Clock,
  ShieldCheck,
  XCircle,
  Info,
  Lock,
  RotateCw
} from 'lucide-react';

interface ActiveRideViewProps {
  ride: RideRequest;
  onUpdateStatus: (status: RideRequest['status']) => void;
  onCancelRide: (reason: string) => void;
  lang: Language;
}

export const ActiveRideView: React.FC<ActiveRideViewProps> = ({
  ride,
  onUpdateStatus,
  onCancelRide,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const appT = APP_TEXT[lang];
  const [showChat, setShowChat] = useState(false);
  const [showSos, setShowSos] = useState(false);
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const getStatusBadge = () => {
    switch (ride.status) {
      case 'driver_arriving':
        return {
          title: t.driverArriving,
          sub: 'Driver is en route to your pickup point',
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        };
      case 'arrived':
        return {
          title: t.driverArrived,
          sub: 'Please meet the driver and share your OTP',
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
      case 'ride_started':
        return {
          title: t.rideInProgress,
          sub: `Heading towards ${ride.dropoff.name}`,
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        };
      default:
        return {
          title: 'Ride Confirmed',
          sub: 'Driver assigned',
          color: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        };
    }
  };

  const statusInfo = getStatusBadge();
  const fare = ride.finalFare || ride.passengerOffer;
  const canCancel = ride.status === 'driver_arriving' || ride.status === 'arrived';
  const isTripInProgress = ride.status === 'ride_started';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 max-w-lg mx-auto overflow-y-auto max-h-[75vh]">
      {/* Mobile Drag Handle */}
      <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />

      {/* Live Status Tracker Banner */}
      <div className={`p-3.5 rounded-2xl border ${statusInfo.color} mb-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {statusInfo.title}
            </h3>
            <p className="text-[11px] opacity-80">{statusInfo.sub}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
            Rs. {fare}
          </span>
          <span className="text-[9px] block text-slate-400">Cash</span>
        </div>
      </div>

      {/* Live 4-Step Trip Progress Indicator */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-3">
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { id: 'step-1', label: 'On way', active: ride.status === 'driver_arriving', done: ['arrived', 'ride_started', 'completed'].includes(ride.status) },
            { id: 'step-2', label: 'Arrived', active: ride.status === 'arrived', done: ['ride_started', 'completed'].includes(ride.status) },
            { id: 'step-3', label: 'On trip', active: ride.status === 'ride_started', done: ride.status === 'completed' },
            { id: 'step-4', label: 'Destination', active: ride.status === 'completed', done: ride.status === 'completed' },
          ].map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center">
              <div 
                className={`w-full h-1.5 rounded-full mb-1.5 transition-colors ${
                  s.active ? 'bg-emerald-500 animate-pulse' : s.done ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                }`} 
              />
              <span className={`text-[10px] font-bold truncate max-w-full ${
                s.active ? 'text-emerald-600 dark:text-emerald-400' : s.done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Live Remaining Distance & ETA metrics */}
        {(ride.remainingDistanceKm !== undefined || ride.remainingDurationMin !== undefined) && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <Clock size={13} className="text-emerald-500" />
              <span>
                ETA: ~{ride.remainingDurationMin ?? Math.round(ride.distanceKm * 1.3)} mins
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Navigation size={13} className="text-blue-500" />
              <span>
                {ride.remainingDistanceKm !== undefined ? ride.remainingDistanceKm : ride.distanceKm} km remaining
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Off-Route Alert */}
      {ride.isOffRoute && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold mb-3 flex items-center gap-2 animate-pulse">
          <RotateCw size={15} className="animate-spin text-amber-500" />
          <span>{t.rerouting || 'Rerouting...'} Updating path to destination</span>
        </div>
      )}

      {/* In-Progress Warning Notice (Cancellation Not Allowed) */}
      {isTripInProgress && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs mb-4 flex items-start gap-2">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{appT.inProgressNoCancel}</p>
        </div>
      )}

      {/* Driver Profile Card */}
      <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={ride.driverPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={ride.driverName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {ride.driverName}
                </span>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star size={13} className="fill-amber-400 mr-0.5" />
                  {ride.driverRating || 4.9}
                </span>
                <span>·</span>
                <span>Verified Partner</span>
              </div>
            </div>
          </div>

          {/* 4-digit Ride Verification OTP */}
          <div className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold block uppercase">
              Ride OTP
            </span>
            <span className="text-base font-black tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">
              {ride.otp}
            </span>
          </div>
        </div>

        {/* Vehicle Spec Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            {ride.vehicleType === 'bike' ? <Bike size={16} /> : <Car size={16} />}
            <span>{ride.driverVehicle || 'Vehicle'}</span>
          </div>
          <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 tracking-wider">
            {ride.driverPlate || 'SINDH-REG'}
          </span>
        </div>
      </div>

      {/* Communications, Emergency, and Cancel Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => setShowCallPrompt(true)}
          className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
        >
          <Phone size={16} />
          <span>{t.callDriver}</span>
        </button>

        <button
          onClick={() => setShowChat(true)}
          className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
        >
          <MessageSquare size={16} />
          <span>{t.chatWithDriver}</span>
        </button>

        <button
          onClick={() => setShowSos(true)}
          className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
        >
          <AlertTriangle size={16} />
          <span>{t.sosEmergency}</span>
        </button>

        {canCancel ? (
          <button
            onClick={() => setShowCancelModal(true)}
            className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <XCircle size={16} />
            <span>Cancel</span>
          </button>
        ) : (
          <div className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] flex flex-col items-center justify-center gap-1">
            <Lock size={14} />
            <span>On Trip</span>
          </div>
        )}
      </div>

      {/* Route Overview */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 mb-4">
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Pickup Location</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {ride.pickup.name} ({ride.pickup.city})
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Drop-off Destination</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {ride.dropoff.name} ({ride.dropoff.city})
            </div>
          </div>
        </div>
      </div>

      {/* Demo Fast-Forward simulation buttons (Makes testing smooth and instant) */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Demo Trip Simulator (Step Through Lifecycle)
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onUpdateStatus('arrived')}
            className={`min-h-[44px] py-1.5 text-[11px] rounded-lg font-semibold transition ${
              ride.status === 'arrived'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            1. Arrived
          </button>
          <button
            onClick={() => onUpdateStatus('ride_started')}
            className={`min-h-[44px] py-1.5 text-[11px] rounded-lg font-semibold transition ${
              ride.status === 'ride_started'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            2. Start Trip
          </button>
          <button
            onClick={() => onUpdateStatus('completed')}
            className="min-h-[44px] py-1.5 text-[11px] rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
          >
            3. Complete
          </button>
        </div>
      </div>

      {/* Cancellation Modal for assigned driver state */}
      {showCancelModal && (
        <CancelRideModal
          isDriverAssigned={true}
          lang={lang}
          onConfirmCancel={(reason) => {
            onCancelRide(reason);
            setShowCancelModal(false);
          }}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {/* Call modal prompt */}
      {showCallPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-xs w-full text-center border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Phone size={24} />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Call {ride.driverName}
            </h4>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              {ride.driverPhone || '+92 300 2345678'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCallPrompt(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.close}
              </button>
              <a
                href={`tel:${ride.driverPhone || '+923002345678'}`}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center"
              >
                Dial Phone
              </a>
            </div>
          </div>
        </div>
      )}

      {/* In-app Chat Modal */}
      {showChat && (
        <RideChatModal
          rideId={ride.id}
          currentUserRole="passenger"
          currentUserId="current_passenger"
          currentUserName={ride.passengerName}
          otherPartyName={ride.driverName || 'Driver'}
          lang={lang}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Emergency SOS Modal */}
      {showSos && (
        <SosModal
          ride={ride}
          lang={lang}
          onClose={() => setShowSos(false)}
        />
      )}
    </div>
  );
};
