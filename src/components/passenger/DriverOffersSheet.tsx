import React, { useState } from 'react';
import { RideRequest, DriverOffer, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { CancelRideModal } from '../common/CancelRideModal';
import { 
  Star, 
  Clock, 
  Check, 
  X, 
  Car, 
  Bike, 
  ShieldCheck, 
  Radio 
} from 'lucide-react';

interface DriverOffersSheetProps {
  ride: RideRequest;
  onAcceptOffer: (offerId: string) => void;
  onDeclineOffer: (offerId: string) => void;
  onCancelRide: (reason: string) => void;
  lang: Language;
}

export const DriverOffersSheet: React.FC<DriverOffersSheetProps> = ({
  ride,
  onAcceptOffer,
  onDeclineOffer,
  onCancelRide,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [showCancelModal, setShowCancelModal] = useState(false);

  const offers = ride.offers || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 max-w-lg mx-auto overflow-y-auto max-h-[75vh]">
      {/* Mobile Drag Handle */}
      <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />

      {/* Negotiation Status Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio size={20} className="text-emerald-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {offers.length === 0 ? t.waitingForDrivers : `${offers.length} ${t.driverOffersCount}`}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your Offer: <span className="font-bold text-emerald-600">Rs. {ride.passengerOffer}</span> · {ride.pickup.city} → {ride.dropoff.city}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCancelModal(true)}
          className="text-xs px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold transition min-h-[44px] flex items-center"
        >
          {t.cancelRide}
        </button>
      </div>

      {/* Offers List */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {offers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-spin">
              <Radio size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Broadcasting your offer to nearby drivers...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Drivers in {ride.pickup.city} are reviewing your offer of Rs. {ride.passengerOffer}. Incoming offers will appear here automatically.
            </p>
          </div>
        ) : (
          offers.map((offer) => {
            const isCounter = offer.offeredPrice !== ride.passengerOffer;
            const diff = offer.offeredPrice - ride.passengerOffer;

            return (
              <div
                key={offer.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 hover:border-emerald-500/60 transition shadow-xs flex flex-col gap-3"
              >
                {/* Driver Info Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={offer.driverPhoto}
                      alt={offer.driverName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {offer.driverName}
                        </span>
                        <ShieldCheck size={14} className="text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star size={12} className="fill-amber-400 mr-0.5" />
                          {offer.driverRating}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {offer.etaMinutes} {t.etaMin}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      Rs. {offer.offeredPrice}
                    </div>
                    {isCounter ? (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                        +{diff} PKR Counter
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        Accepted Your Offer
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicle Model & Plate */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    {offer.vehicleType === 'bike' ? <Bike size={14} /> : <Car size={14} />}
                    <span>{offer.vehicleModel}</span>
                  </div>
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {offer.vehiclePlate}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => onDeclineOffer(offer.id)}
                    className="col-span-1 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <X size={14} />
                    <span>{t.declineOffer}</span>
                  </button>

                  <button
                    onClick={() => onAcceptOffer(offer.id)}
                    className="col-span-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                  >
                    <Check size={16} />
                    <span>{t.acceptOffer} (Rs. {offer.offeredPrice})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <CancelRideModal
          isDriverAssigned={false}
          lang={lang}
          onConfirmCancel={(reason) => {
            onCancelRide(reason);
            setShowCancelModal(false);
          }}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};
