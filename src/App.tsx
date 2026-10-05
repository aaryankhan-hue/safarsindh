/**
 * SafarSindh - Ride Hailing Web App (PWA)
 * Complete inDrive & Yango style ride-hailing app for Naukot, Mithi, and Mirpurkhas
 */
import React, { useState, useEffect } from 'react';
import { safarStore } from './services/store';
import { getSession, logOut } from './services/auth';
import { User, Language, RideRequest, LocationPoint, VehicleType } from './types';
import { TopNavigation } from './components/common/TopNavigation';
import { SetupGuideModal } from './components/common/SetupGuideModal';
import { BottomNav, PassengerTab } from './components/common/BottomNav';
import { AuthScreen } from './components/auth/AuthScreen';
import { SafarMap } from './components/map/SafarMap';
import { PassengerBookingFlow } from './components/passenger/PassengerBookingFlow';
import { DriverOffersSheet } from './components/passenger/DriverOffersSheet';
import { ActiveRideView } from './components/passenger/ActiveRideView';
import { PostRideRatingModal } from './components/passenger/PostRideRatingModal';
import { RideHistory } from './components/passenger/RideHistory';
import { ProfileScreen } from './components/passenger/ProfileScreen';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { APP_TEXT } from './i18n/appText';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => getSession());
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('safarsindh_lang_v1') as Language) || 'en';
  });

  const [passengerTab, setPassengerTab] = useState<PassengerTab>('home');
  const [showHelp, setShowHelp] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const [activeRide, setActiveRide] = useState<RideRequest | undefined>(() => {
    return user ? safarStore.getActiveRideForPassenger(user.id) : undefined;
  });

  const [pendingRatingRide, setPendingRatingRide] = useState<RideRequest | undefined>(() => {
    return user ? safarStore.getPendingRatingRide(user.id) : undefined;
  });

  const [passengerRides, setPassengerRides] = useState<RideRequest[]>(() => {
    return user ? safarStore.getRidesForPassenger(user.id) : [];
  });

  const appT = APP_TEXT[lang];

  const syncState = () => {
    if (!user) return;
    const currentActive = safarStore.getActiveRideForPassenger(user.id);
    const pendingRating = safarStore.getPendingRatingRide(user.id);
    const allPassengerRides = safarStore.getRidesForPassenger(user.id);

    // Check if previous active ride was cancelled by driver
    if (activeRide && !currentActive) {
      const updatedPrevious = safarStore.getRideById(activeRide.id);
      if (updatedPrevious?.status === 'cancelled' && updatedPrevious.cancelledBy === 'driver') {
        setToastMessage({ text: appT.driverCancelledNotice, isError: true });
      }
    }

    setActiveRide(currentActive);
    setPendingRatingRide(pendingRating);
    setPassengerRides(allPassengerRides);
  };

  useEffect(() => {
    syncState();
    const unsub = safarStore.subscribe(syncState);
    return () => unsub();
  }, [user?.id, activeRide?.id]);

  // Update HTML document direction and language for RTL support
  useEffect(() => {
    const isRtl = lang === 'ur' || lang === 'sd';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('safarsindh_lang_v1', lang);
  }, [lang]);

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    syncState();
  };

  const handleLogOut = () => {
    logOut();
    setUser(null);
    setActiveRide(undefined);
    setPendingRatingRide(undefined);
  };

  const handlePostRide = (params: {
    pickup: LocationPoint;
    dropoff: LocationPoint;
    distanceKm: number;
    estimatedMinutes: number;
    vehicleType: VehicleType;
    baseRecommendedFare: number;
    passengerOffer: number;
    isWomenOnly: boolean;
    notes: string;
    discountPKR?: number;
    promoCode?: string;
    paymentMethod?: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'card';
  }) => {
    if (!user) return;
    const newRide = safarStore.createRideRequest({
      ...params,
      passengerId: user.id,
      passengerName: user.name,
      passengerPhone: user.phone,
    });
    setActiveRide(newRide);
    setPassengerTab('home');
  };

  const handleAcceptOffer = (offerId: string) => {
    if (!activeRide) return;
    safarStore.acceptDriverOffer(activeRide.id, offerId);
  };

  const handleDeclineOffer = (offerId: string) => {
    if (!activeRide) return;
    safarStore.declineOffer(activeRide.id, offerId);
  };

  const handleUpdateRideStatus = (status: RideRequest['status']) => {
    if (!activeRide) return;
    safarStore.updateRideStatus(activeRide.id, status);
  };

  const handleCancelRide = (reason: string) => {
    if (!activeRide) return;
    const success = safarStore.cancelRide(activeRide.id, reason, 'passenger');
    if (success) {
      setToastMessage({ text: appT.rideCancelledToast });
    }
  };

  const handleSubmitRating = (ratingData: {
    stars: number;
    feedback: string;
    compliments: string[];
  }) => {
    if (!pendingRatingRide) return;
    safarStore.submitRating(pendingRatingRide.id, ratingData);
    setPendingRatingRide(undefined);
  };

  const handleSkipRating = () => {
    if (!pendingRatingRide) return;
    // Mark as rated with 0 stars so history shows "Not rated"
    safarStore.submitRating(pendingRatingRide.id, {
      stars: 0,
      feedback: '',
      compliments: [],
    });
    setPendingRatingRide(undefined);
  };

  // If user is not authenticated, show AuthScreen
  if (!user) {
    return (
      <AuthScreen
        lang={lang}
        onSelectLang={handleSelectLang}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  const completedRidesCount = passengerRides.filter((r) => r.status === 'completed').length;

  return (
    <div className="h-[100dvh] bg-slate-100 dark:bg-slate-950 flex flex-col font-sans overflow-hidden select-none">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-16 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {toastMessage.isError ? (
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Compact 56px Top Header (No Role Switcher) */}
      <TopNavigation
        user={user}
        currentLang={lang}
        onSelectLang={handleSelectLang}
        onOpenHelp={() => setShowHelp(true)}
        onLogOut={handleLogOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* PASSENGER ROLE INTERFACE */}
        {user.role === 'passenger' && (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Tab 1: HOME (Map + Bottom Sheet) */}
            {passengerTab === 'home' && (
              <div className="flex-1 flex flex-col lg:flex-row relative h-full overflow-hidden">
                {/* Full Viewport Map */}
                <div className="absolute inset-0 lg:static lg:flex-1 h-full w-full">
                  <SafarMap
                    pickup={activeRide?.pickup}
                    dropoff={activeRide?.dropoff}
                    driverLocation={activeRide?.driverLocation}
                    driverType={activeRide?.vehicleType}
                    isOffRoute={activeRide?.isOffRoute}
                    routePolyline={activeRide?.routePolyline}
                  />
                </div>

                {/* Floating Bottom Sheet on mobile / Side Panel on lg: */}
                <div className="absolute bottom-14 inset-x-0 max-h-[72%] lg:max-h-full lg:static lg:h-full lg:w-96 lg:max-w-md w-full bg-transparent lg:bg-white lg:dark:bg-slate-900 z-20 flex flex-col overflow-hidden pointer-events-auto">
                  {!activeRide ? (
                    <PassengerBookingFlow onPostRide={handlePostRide} lang={lang} />
                  ) : activeRide.status === 'requested' || activeRide.status === 'offers_received' ? (
                    <DriverOffersSheet
                      ride={activeRide}
                      onAcceptOffer={handleAcceptOffer}
                      onDeclineOffer={handleDeclineOffer}
                      onCancelRide={handleCancelRide}
                      lang={lang}
                    />
                  ) : ['driver_arriving', 'arrived', 'ride_started'].includes(activeRide.status) ? (
                    <ActiveRideView
                      ride={activeRide}
                      onUpdateStatus={handleUpdateRideStatus}
                      onCancelRide={handleCancelRide}
                      lang={lang}
                    />
                  ) : (
                    <PassengerBookingFlow onPostRide={handlePostRide} lang={lang} />
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: MY RIDES (Ride History) */}
            {passengerTab === 'rides' && (
              <div className="flex-1 overflow-y-auto">
                <RideHistory
                  rides={passengerRides}
                  lang={lang}
                  onViewActiveRide={() => setPassengerTab('home')}
                />
              </div>
            )}

            {/* Tab 3: PROFILE */}
            {passengerTab === 'profile' && (
              <div className="flex-1 overflow-y-auto">
                <ProfileScreen
                  user={user}
                  completedRidesCount={completedRidesCount}
                  lang={lang}
                  onSelectLang={handleSelectLang}
                  onOpenHelp={() => setShowHelp(true)}
                  onLogOut={handleLogOut}
                  onUpdateUser={(updated) => setUser(updated)}
                />
              </div>
            )}

            {/* Passenger Bottom Navigation Bar */}
            <BottomNav
              activeTab={passengerTab}
              onChangeTab={setPassengerTab}
              lang={lang}
              hasActiveRide={Boolean(activeRide)}
            />

            {/* Post-Ride Rating Modal (Bug 1 & 2 Fix) */}
            {pendingRatingRide && (
              <PostRideRatingModal
                ride={pendingRatingRide}
                lang={lang}
                onSubmitRating={handleSubmitRating}
                onSkipRating={handleSkipRating}
                onClose={handleSkipRating}
              />
            )}
          </div>
        )}

        {/* DRIVER ROLE INTERFACE */}
        {user.role === 'driver' && (
          <div className="flex-1 overflow-y-auto">
            <DriverDashboard lang={lang} user={user} />
          </div>
        )}

        {/* ADMIN ROLE INTERFACE */}
        {user.role === 'admin' && (
          <div className="flex-1 overflow-y-auto">
            <AdminDashboard lang={lang} />
          </div>
        )}
      </main>

      {/* Setup & Architecture Documentation Modal */}
      {showHelp && <SetupGuideModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
