import React, { useState } from 'react';
import { 
  LocationPoint, 
  VehicleType, 
  Language, 
  PromoCode 
} from '../../types';
import { SINDH_LOCATIONS, POPULAR_ROUTES, calculateDistanceKm } from '../../data/sindhLocations';
import { DEFAULT_FARE_CONFIGS, calculateEstimatedFare } from '../../data/fareConfigs';
import { TRANSLATIONS } from '../../i18n/translations';
import { PAYMENT_TEXT } from '../../i18n/paymentText';
import { safarStore } from '../../services/store';
import { ChooseLocationModal } from './ChooseLocationModal';
import { 
  MapPin, 
  Navigation2, 
  Bike, 
  Car, 
  Sparkles, 
  Shield, 
  Tag, 
  Check, 
  ArrowRight,
  Clock,
  Coins,
  Banknote,
  CreditCard,
  Smartphone
} from 'lucide-react';

interface PassengerBookingFlowProps {
  onPostRide: (data: {
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
  }) => void;
  lang: Language;
}

export const PassengerBookingFlow: React.FC<PassengerBookingFlowProps> = ({
  onPostRide,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Locations state
  const [pickup, setPickup] = useState<LocationPoint>(SINDH_LOCATIONS[0]); // Naukot Fort default
  const [dropoff, setDropoff] = useState<LocationPoint>(SINDH_LOCATIONS[5]); // Mithi Gaddi Bhit default
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [isWomenOnly, setIsWomenOnly] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'easypaisa' | 'jazzcash'>('cash');
  const payT = PAYMENT_TEXT[lang];
  const paymentSettings = safarStore.getPaymentSettings();

  // Search & custom dropdowns
  const [searchField, setSearchField] = useState<'pickup' | 'dropoff' | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  // Calculated distance & recommended fare
  const distanceKm = calculateDistanceKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const estimatedMinutes = Math.round(distanceKm * 1.25);
  const recommendedFare = calculateEstimatedFare(vehicleType, distanceKm);

  // Passenger's custom editable offer
  const [userOffer, setUserOffer] = useState<number>(recommendedFare);

  // Keep offer in sync when vehicle or route changes if user hasn't heavily customized
  const handleVehicleSelect = (type: VehicleType) => {
    setVehicleType(type);
    const newRec = calculateEstimatedFare(type, distanceKm);
    setUserOffer(newRec);
  };

  const handleRouteSelect = (p: LocationPoint, d: LocationPoint) => {
    setPickup(p);
    setDropoff(d);
    const dist = calculateDistanceKm(p.lat, p.lng, d.lat, d.lng);
    const newRec = calculateEstimatedFare(vehicleType, dist);
    setUserOffer(newRec);
    setSearchField(null);
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (code === 'SINDH100') {
      setAppliedPromo({
        code: 'SINDH100',
        discountPKR: 100,
        minFarePKR: 200,
        description: 'Sindh Thar Launch Offer - Rs. 100 OFF',
      });
      setUserOffer((prev) => Math.max(80, prev - 100));
    } else if (code === 'NAUKOT50') {
      setAppliedPromo({
        code: 'NAUKOT50',
        discountPKR: 50,
        minFarePKR: 100,
        description: 'Naukot Fort Promo - Rs. 50 OFF',
      });
      setUserOffer((prev) => Math.max(80, prev - 50));
    } else {
      setPromoError('Invalid code. Try "SINDH100" or "NAUKOT50"');
    }
  };

  const vehicleOptions = [
    {
      type: 'bike' as VehicleType,
      name: 'Bike (موٽرسائيڪل)',
      desc: '1 seat · Fast & agile for city & desert roads',
      icon: Bike,
      fare: calculateEstimatedFare('bike', distanceKm),
    },
    {
      type: 'rickshaw' as VehicleType,
      name: 'Rickshaw (رڪشا)',
      desc: '3 seats · Local standard ride',
      icon: Navigation2,
      fare: calculateEstimatedFare('rickshaw', distanceKm),
    },
    {
      type: 'car_economy' as VehicleType,
      name: 'Economy Car (گاڏي)',
      desc: '4 seats · Suzuki Alto / Bolan / Mehran',
      icon: Car,
      fare: calculateEstimatedFare('car_economy', distanceKm),
    },
    {
      type: 'car_comfort' as VehicleType,
      name: 'AC Comfort Car (اي سي)',
      desc: '4 seats · Corolla / City with cooling AC',
      icon: Sparkles,
      fare: calculateEstimatedFare('car_comfort', distanceKm),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostRide({
      pickup,
      dropoff,
      distanceKm,
      estimatedMinutes,
      vehicleType,
      baseRecommendedFare: recommendedFare,
      passengerOffer: Math.max(50, userOffer),
      isWomenOnly,
      notes,
      discountPKR: appliedPromo?.discountPKR,
      promoCode: appliedPromo?.code,
      paymentMethod,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 max-w-lg mx-auto overflow-y-auto max-h-[75vh] relative pb-20">
      {/* Mobile Drag Handle */}
      <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />

      {/* Popular Highway Routes Carousel */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.popularRoutes}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            1-Click Set
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {POPULAR_ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => handleRouteSelect(route.from, route.to)}
              className="shrink-0 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition group"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>{route.from.city}</span>
                <ArrowRight size={12} className="text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                <span>{route.to.city}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {route.distanceKm} km · {route.badgeText}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pickup & Destination Input Card */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/80 mb-4 relative">
        <div className="flex items-center gap-3 py-1.5 border-b border-slate-200/80 dark:border-slate-700">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60 shrink-0" />
          <button
            type="button"
            onClick={() => setSearchField('pickup')}
            className="flex-1 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <span className="text-[10px] text-slate-400 block font-normal">
              {t.pickupLocation}
            </span>
            {pickup.name} ({pickup.city})
          </button>
        </div>

        <div className="flex items-center gap-3 py-1.5 pt-2">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60 shrink-0" />
          <button
            type="button"
            onClick={() => setSearchField('dropoff')}
            className="flex-1 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <span className="text-[10px] text-slate-400 block font-normal">
              {t.dropoffLocation}
            </span>
            {dropoff.name} ({dropoff.city})
          </button>
        </div>
      </div>

      {/* Choose Location Modal (Google Places, Pin on Map, and Sindh Locations) */}
      {searchField && (
        <ChooseLocationModal
          type={searchField}
          initialLocation={searchField === 'pickup' ? pickup : dropoff}
          lang={lang}
          onSelect={(selectedLoc) => {
            if (searchField === 'pickup') {
              setPickup(selectedLoc);
              const dist = calculateDistanceKm(selectedLoc.lat, selectedLoc.lng, dropoff.lat, dropoff.lng);
              const newRec = calculateEstimatedFare(vehicleType, dist);
              setUserOffer(newRec);
            } else {
              setDropoff(selectedLoc);
              const dist = calculateDistanceKm(pickup.lat, pickup.lng, selectedLoc.lat, selectedLoc.lng);
              const newRec = calculateEstimatedFare(vehicleType, dist);
              setUserOffer(newRec);
            }
            setSearchField(null);
          }}
          onClose={() => setSearchField(null)}
        />
      )}

      {/* Distance and Estimated Time summary strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl mb-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
        <div className="flex items-center gap-1.5">
          <Navigation2 size={14} className="text-emerald-600" />
          <span>{distanceKm} {t.km} road trip</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-emerald-600" />
          <span>~{estimatedMinutes} {t.mins}</span>
        </div>
      </div>

      {/* Vehicle Selector (inDrive / Yango grid) */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          {t.selectVehicle}
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {vehicleOptions.map((v) => {
            const Icon = v.icon;
            const isSelected = vehicleType === v.type;
            return (
              <button
                key={v.type}
                type="button"
                onClick={() => handleVehicleSelect(v.type)}
                className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Rs. {v.fare}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {v.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {v.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* inDrive Style Fare Negotiation Box */}
      <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Coins size={16} className="text-amber-500" />
            <span>{t.yourOffer}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Rec: Rs. {recommendedFare}
          </span>
        </div>

        {/* Big editable offer display with 48px touch steppers */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            type="button"
            onClick={() => setUserOffer((prev) => Math.max(50, prev - 20))}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200 text-lg active:scale-95 shadow-xs flex items-center justify-center cursor-pointer"
          >
            -20
          </button>

          <div className="text-center min-w-[120px]">
            <input
              type="number"
              value={userOffer}
              onChange={(e) => setUserOffer(Number(e.target.value) || 0)}
              className="text-3xl font-black text-center text-slate-900 dark:text-white w-full bg-transparent border-b-2 border-emerald-500 focus:outline-none"
            />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">
              Pakistani Rupees (PKR)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setUserOffer((prev) => prev + 20)}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200 text-lg active:scale-95 shadow-xs flex items-center justify-center cursor-pointer"
          >
            +20
          </button>
        </div>

        {/* Quick Stepper Chips */}
        <div className="flex justify-center gap-2 mt-2">
          {[+50, +100, +200].map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => setUserOffer((prev) => prev + inc)}
              className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold hover:border-emerald-500 active:scale-95"
            >
              +{inc} PKR
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUserOffer(recommendedFare)}
            className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold"
          >
            Reset
          </button>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2.5">
          {t.proposeFareHelp}
        </p>
      </div>

      {/* Women-only Driver Option */}
      <div className="mb-4 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-950 dark:text-purple-200">
              {t.womenOnly}
            </div>
            <div className="text-[10px] text-purple-700/80 dark:text-purple-400">
              {t.womenOnlySub}
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isWomenOnly}
          onChange={(e) => setIsWomenOnly(e.target.checked)}
          className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
        />
      </div>

      {/* Promo Code Drawer */}
      <div className="mb-5">
        {appliedPromo ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
              <Check size={16} />
              <span>{appliedPromo.description}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUserOffer((prev) => prev + appliedPromo.discountPKR);
                setAppliedPromo(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo Code (try SINDH100)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500 uppercase font-semibold"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-emerald-600 hover:text-white transition"
            >
              {t.applyPromo}
            </button>
          </div>
        )}
        {promoError && (
          <p className="text-[10px] text-red-500 mt-1 pl-1">{promoError}</p>
        )}
      </div>

      {/* Payment Method Selector (Phase 1: Cash active, Easypaisa & JazzCash "Coming Soon") */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.paymentMethod}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {payT.cashToCollect}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Cash Payment */}
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Banknote size={16} className={paymentMethod === 'cash' ? 'text-emerald-600' : 'text-slate-400'} />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold">{t.cashPayment}</div>
            <div className="text-[10px] text-slate-400">Default</div>
          </button>

          {/* Easypaisa */}
          <button
            type="button"
            disabled={!paymentSettings.enableOnlinePayments}
            onClick={() => paymentSettings.enableOnlinePayments && setPaymentMethod('easypaisa')}
            className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition ${
              paymentMethod === 'easypaisa'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            } ${!paymentSettings.enableOnlinePayments ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Smartphone size={16} className="text-green-600" />
              {!paymentSettings.enableOnlinePayments && (
                <span className="text-[8px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                  Soon
                </span>
              )}
            </div>
            <div className="text-xs font-bold">Easypaisa</div>
            <div className="text-[10px] text-slate-400">
              {paymentSettings.enableOnlinePayments ? 'Wallet' : 'Phase 2'}
            </div>
          </button>

          {/* JazzCash */}
          <button
            type="button"
            disabled={!paymentSettings.enableOnlinePayments}
            onClick={() => paymentSettings.enableOnlinePayments && setPaymentMethod('jazzcash')}
            className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition ${
              paymentMethod === 'jazzcash'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            } ${!paymentSettings.enableOnlinePayments ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <CreditCard size={16} className="text-amber-600" />
              {!paymentSettings.enableOnlinePayments && (
                <span className="text-[8px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                  Soon
                </span>
              )}
            </div>
            <div className="text-xs font-bold">JazzCash</div>
            <div className="text-[10px] text-slate-400">
              {paymentSettings.enableOnlinePayments ? 'Wallet' : 'Phase 2'}
            </div>
          </button>
        </div>
      </div>

      {/* Sticky Primary Action Button at bottom */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 pb-1 -mx-5 px-5 border-t border-slate-100 dark:border-slate-800 z-10">
        <button
          onClick={handleSubmit}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition cursor-pointer"
        >
          <span>{t.findDrivers} (Rs. {userOffer})</span>
          <ArrowRight size={20} className="rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
