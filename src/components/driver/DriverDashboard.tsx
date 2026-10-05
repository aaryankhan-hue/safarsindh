import React, { useState, useEffect } from 'react';
import { safarStore } from '../../services/store';
import { DriverProfile, RideRequest, Language, User } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { APP_TEXT } from '../../i18n/appText';
import { DriverRegistrationModal } from './DriverRegistrationModal';
import { RideChatModal } from '../common/RideChatModal';
import { SafarMap } from '../map/SafarMap';
import { 
  Power, 
  Navigation, 
  Check, 
  Phone, 
  MessageSquare, 
  Star, 
  Wallet, 
  Radio, 
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Car,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface DriverDashboardProps {
  lang: Language;
  user?: User;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ lang, user }) => {
  const t = TRANSLATIONS[lang];
  const appT = APP_TEXT[lang];

  const [allDrivers, setAllDrivers] = useState<DriverProfile[]>(safarStore.getDrivers());
  const [driver, setDriver] = useState<DriverProfile>(() => {
    if (user) {
      const match = safarStore.getDriverByUserId(user.id);
      if (match) return match;
    }
    return safarStore.getCurrentDriver();
  });

  const [rides, setRides] = useState<RideRequest[]>(safarStore.getRides());
  const [showRegModal, setShowRegModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [counterInput, setCounterInput] = useState<Record<string, number>>({});

  const syncState = () => {
    const driversList = safarStore.getDrivers();
    setAllDrivers(driversList);
    setRides(safarStore.getRides());

    if (user) {
      const match = driversList.find((d) => d.userId === user.id);
      if (match) {
        setDriver(match);
      }
    } else {
      setDriver(safarStore.getCurrentDriver());
    }
  };

  useEffect(() => {
    syncState();
    const unsubscribe = safarStore.subscribe(syncState);
    return () => unsubscribe();
  }, [user?.id]);

  const hasProfile = Boolean(driver && (!user || driver.userId === user.id));
  const isApproved = driver?.status === 'approved';

  const handleToggleOnline = () => {
    if (!driver || !isApproved) return;
    safarStore.toggleDriverOnline(driver.id, !driver.isOnline);
  };

  const handleSelectDriver = (driverId: string) => {
    safarStore.setCurrentDriverId(driverId);
  };

  // Find incoming ride requests available to be accepted or countered
  const availableRides = rides.filter(
    (r) =>
      (r.status === 'requested' || r.status === 'offers_received') &&
      (!r.isWomenOnly || driver?.isFemale)
  );

  // Find active ride assigned to this specific driver
  const myActiveRide = driver ? rides.find(
    (r) =>
      r.driverId === driver.id &&
      ['driver_arriving', 'arrived', 'ride_started'].includes(r.status)
  ) : undefined;

  const handleAcceptFare = (ride: RideRequest) => {
    if (!driver) return;
    safarStore.addDriverOffer({
      rideId: ride.id,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverPhoto: driver.selfieUrl,
      driverRating: driver.rating,
      vehicleType: driver.vehicleType,
      vehicleModel: driver.vehicleModel,
      vehiclePlate: driver.vehicleNumberPlate,
      offeredPrice: ride.passengerOffer,
      etaMinutes: 4,
    });
  };

  const handleSendCounter = (ride: RideRequest, customAmount?: number) => {
    if (!driver) return;
    const price = customAmount || counterInput[ride.id] || ride.passengerOffer + 50;
    safarStore.addDriverOffer({
      rideId: ride.id,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverPhoto: driver.selfieUrl,
      driverRating: driver.rating,
      vehicleType: driver.vehicleType,
      vehicleModel: driver.vehicleModel,
      vehiclePlate: driver.vehicleNumberPlate,
      offeredPrice: price,
      etaMinutes: 5,
    });
  };

  const handleStartTripWithOtp = () => {
    setOtpError('');
    if (!myActiveRide) return;
    if (otpInput.trim() !== myActiveRide.otp) {
      setOtpError('Invalid OTP. Ask passenger for their 4-digit code.');
      return;
    }
    safarStore.updateRideStatus(myActiveRide.id, 'ride_started');
    setOtpInput('');
  };

  const handleCompleteTrip = () => {
    if (!myActiveRide) return;
    safarStore.updateRideStatus(myActiveRide.id, 'completed', {
      paymentStatus: 'paid',
    });
  };

  // If driver user is logged in but hasn't created a vehicle profile yet
  if (user && !hasProfile) {
    return (
      <div className="max-w-lg mx-auto p-5 pb-24 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <Car size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {appT.completeRegistrationTitle}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {appT.completeRegistrationMsg}
          </p>
          <button
            onClick={() => setShowRegModal(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            {appT.registerNow}
          </button>
        </div>

        {showRegModal && (
          <DriverRegistrationModal
            lang={lang}
            userId={user.id}
            defaultName={user.name}
            defaultPhone={user.phone}
            onClose={() => setShowRegModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4 pb-20">
      {/* Driver Switcher & Profile Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={driver.selfieUrl}
              alt={driver.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {driver.name}
                </span>
                {isApproved ? (
                  <ShieldCheck size={16} className="text-emerald-500" />
                ) : (
                  <ShieldAlert size={16} className="text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-emerald-600">
                  {driver.currentCity}
                </span>
                <span>·</span>
                <span>{driver.vehicleModel}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition"
          >
            Edit Info
          </button>
        </div>

        {/* Quick Driver Profile Switcher (Only shown in unauthenticated / generic demo mode) */}
        {!user && (
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-slate-400 text-[11px]">Select Active Driver Persona:</span>
            <select
              value={driver.id}
              onChange={(e) => handleSelectDriver(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1 px-2.5 rounded-lg border-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {allDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.currentCity} - {d.vehicleType})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pending Approval Warning (Bug 4 Fix) */}
        {!isApproved && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs mb-3 flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">{appT.pendingApprovalTitle}</div>
              <p className="text-[11px] leading-relaxed">{appT.pendingApprovalMsg}</p>
            </div>
          </div>
        )}

        {/* Online / Offline Toggle Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                driver.isOnline && isApproved
                  ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-100 dark:ring-emerald-950'
                  : 'bg-slate-400'
              }`}
            />
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                {driver.isOnline && isApproved ? t.currentlyOnline : t.currentlyOffline}
              </span>
              <span className="text-[10px] text-slate-500">
                {isApproved ? 'Verified SafarSindh Driver' : 'Pending Admin Verification'}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleOnline}
            disabled={!isApproved}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
              !isApproved
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : driver.isOnline
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Power size={14} />
            <span>{driver.isOnline && isApproved ? t.goOffline : t.goOnline}</span>
          </button>
        </div>
      </div>

      {/* ACTIVE ASSIGNED TRIP IN PROGRESS */}
      {myActiveRide && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-5 border-2 border-emerald-500 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Navigation size={18} className="animate-spin" />
              <h3 className="font-black text-sm uppercase tracking-wider">
                Active Ride Dispatch
              </h3>
            </div>
            <span className="font-mono font-extrabold text-sm text-emerald-800 dark:text-emerald-200">
              Rs. {myActiveRide.finalFare || myActiveRide.passengerOffer} Cash
            </span>
          </div>

          {/* Live Embedded Map for Driver Navigation & Tracking */}
          <div className="h-44 w-full rounded-2xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 shadow-inner relative">
            <SafarMap
              pickup={myActiveRide.pickup}
              dropoff={myActiveRide.dropoff}
              driverLocation={myActiveRide.driverLocation}
              driverType={myActiveRide.vehicleType}
              isOffRoute={myActiveRide.isOffRoute}
              interactive={false}
            />
          </div>

          {/* Route & Destination Details */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3 text-xs space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block font-normal">Pickup</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {myActiveRide.pickup.name} ({myActiveRide.pickup.city})
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block font-normal">Destination</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {myActiveRide.dropoff.name} ({myActiveRide.dropoff.city})
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {myActiveRide.dropoff.address}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger details */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {myActiveRide.passengerName}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>{myActiveRide.passengerRating} Rating</span>
                <span>·</span>
                <span>{myActiveRide.passengerPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChat(true)}
                className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center hover:bg-blue-100 cursor-pointer"
              >
                <MessageSquare size={16} />
              </button>
              <a
                href={`tel:${myActiveRide.passengerPhone}`}
                className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center hover:bg-emerald-100"
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Turn-by-turn Navigation Button (Google Maps) */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${myActiveRide.dropoff.lat},${myActiveRide.dropoff.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 mb-3 shadow-md hover:bg-slate-800 transition"
          >
            <Navigation size={14} className="text-emerald-400" />
            <span>{t.openInGoogleMaps || 'Open in Google Maps'}</span>
            <ArrowUpRight size={14} />
          </a>

          {/* Stepper Actions for Driver */}
          {myActiveRide.status === 'driver_arriving' && (
            <button
              onClick={() => safarStore.updateRideStatus(myActiveRide.id, 'arrived')}
              className="w-full min-h-[48px] py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95 transition"
            >
              <Check size={18} />
              <span>{t.arrivedAtPickup}</span>
            </button>
          )}

          {myActiveRide.status === 'arrived' && (
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Enter Passenger 4-Digit OTP to Start Trip:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder={`e.g. ${myActiveRide.otp}`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-base font-mono font-bold text-center tracking-widest text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleStartTripWithOtp}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs active:scale-95 transition"
                >
                  Start Trip
                </button>
              </div>
              {otpError && (
                <p className="text-[10px] text-red-500 font-semibold">{otpError}</p>
              )}
            </div>
          )}

          {myActiveRide.status === 'ride_started' && (
            <button
              onClick={handleCompleteTrip}
              className="w-full min-h-[50px] py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
            >
              <Check size={18} />
              <span>{t.completeTrip} (Rs. {myActiveRide.finalFare || myActiveRide.passengerOffer})</span>
            </button>
          )}
        </div>
      )}

      {/* INCOMING RIDE REQUESTS (Only shown when driver is approved and online) */}
      {!myActiveRide && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Incoming Passenger Requests
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              {driver?.isOnline && isApproved ? availableRides.length : 0} active
            </span>
          </div>

          {!isApproved ? (
            <div className="py-8 text-center text-slate-400">
              <ShieldAlert size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Awaiting Admin Verification
              </p>
              <p className="text-xs mt-1 max-w-xs mx-auto">
                Once approved by SafarSindh Admin, you can go online and receive ride offers here.
              </p>
            </div>
          ) : !driver.isOnline ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-sm font-semibold">You are currently OFFLINE.</p>
              <p className="text-xs mt-1">Switch to ONLINE above to receive ride requests.</p>
            </div>
          ) : availableRides.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-500">
                <Radio size={20} className="animate-spin" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Listening for rides in Naukot, Mithi, Mirpurkhas...
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                When a passenger books a trip, it appears here instantly for you to accept or counter-offer!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableRides.map((ride) => {
                const myOffer = ride.offers.find((o) => o.driverId === driver.id);

                return (
                  <div
                    key={ride.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    {/* Passenger & Fare Overview */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {ride.passengerName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{ride.passengerRating}</span>
                          <span>·</span>
                          <span>{ride.distanceKm} km trip</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Passenger Offer
                        </span>
                        <span className="text-2xl font-black text-emerald-600">
                          Rs. {ride.passengerOffer}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                          {ride.pickup.name} ({ride.pickup.city})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                          {ride.dropoff.name} ({ride.dropoff.city})
                        </span>
                      </div>
                    </div>

                    {/* Action: Already Sent Offer vs Send Offer */}
                    {myOffer ? (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                        <span>You offered: Rs. {myOffer.offeredPrice}</span>
                        <span className="font-bold text-[11px] animate-pulse">
                          Waiting for Passenger...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* 1-Click Accept Passenger Fare */}
                        <button
                          onClick={() => handleAcceptFare(ride)}
                          className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition"
                        >
                          <Check size={16} />
                          <span>Accept Exact Fare (Rs. {ride.passengerOffer})</span>
                        </button>

                        {/* Counter-offer Stepper Presets */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold shrink-0">
                            Counter:
                          </span>
                          {[+50, +100, +200].map((inc) => (
                            <button
                              key={inc}
                              onClick={() => handleSendCounter(ride, ride.passengerOffer + inc)}
                              className="flex-1 min-h-[40px] py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
                            >
                              Rs. {ride.passengerOffer + inc}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Driver Earnings & Wallet Dashboard */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-emerald-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.driverEarnings}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {driver.totalTrips} Total Trips
          </span>
        </div>

        {/* Earnings Metric Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              {t.today}
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              Rs. {driver.todayEarnings}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              {t.thisWeek}
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              Rs. {driver.weekEarnings}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block uppercase font-bold">
              {t.walletBalance}
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
              Rs. {driver.balancePKR}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
          <span>Platform Commission Fee: 10%</span>
          <span className="text-emerald-600 font-semibold">Zero Cash Deductions Today</span>
        </div>
      </div>

      {/* Driver Registration Modal */}
      {showRegModal && (
        <DriverRegistrationModal
          lang={lang}
          userId={user?.id || driver.userId}
          defaultName={user?.name || driver.name}
          defaultPhone={user?.phone || driver.phone}
          onClose={() => setShowRegModal(false)}
        />
      )}

      {/* Active Trip Chat */}
      {showChat && myActiveRide && (
        <RideChatModal
          rideId={myActiveRide.id}
          currentUserRole="driver"
          currentUserId={driver.id}
          currentUserName={driver.name}
          otherPartyName={myActiveRide.passengerName}
          lang={lang}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};
