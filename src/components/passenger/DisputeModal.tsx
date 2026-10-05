import React, { useState } from 'react';
import { Language, RideRequest, DisputeReason } from '../../types';
import { PAYMENT_TEXT } from '../../i18n/paymentText';
import { safarStore } from '../../services/store';
import { X, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

interface DisputeModalProps {
  ride: RideRequest;
  lang: Language;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  ride,
  lang,
  onClose,
  onSubmitted,
}) => {
  const payT = PAYMENT_TEXT[lang];
  const isRtl = lang === 'ur' || lang === 'sd';

  const [reason, setReason] = useState<DisputeReason>('charged_more');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    safarStore.createDispute({
      rideId: ride.id,
      passengerId: ride.passengerId,
      passengerName: ride.passengerName,
      passengerPhone: ride.passengerPhone,
      driverId: ride.driverId,
      driverName: ride.driverName,
      farePKR: ride.finalFare || ride.passengerOffer,
      reason,
      notes: notes.trim(),
    });
    setIsSubmitted(true);
    onSubmitted?.();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle size={20} />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {payT.disputeTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              Report Submitted
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {payT.disputeSubmitted}
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Trip: {ride.pickup.name} → {ride.dropoff.name}</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {ride.finalFare || ride.passengerOffer}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Driver: {ride.driverName || 'Driver'} · Ride ID #{ride.id.slice(-6).toUpperCase()}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select problem type:
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 cursor-pointer hover:border-emerald-500 transition">
                <input
                  type="radio"
                  name="dispute_reason"
                  value="charged_more"
                  checked={reason === 'charged_more'}
                  onChange={() => setReason('charged_more')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {payT.reasonChargedMore}
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 cursor-pointer hover:border-emerald-500 transition">
                <input
                  type="radio"
                  name="dispute_reason"
                  value="not_to_destination"
                  checked={reason === 'not_to_destination'}
                  onChange={() => setReason('not_to_destination')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {payT.reasonNotToDestination}
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 cursor-pointer hover:border-emerald-500 transition">
                <input
                  type="radio"
                  name="dispute_reason"
                  value="other"
                  checked={reason === 'other'}
                  onChange={() => setReason('other')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {payT.reasonOther}
                </span>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {payT.additionalNotes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Please describe what happened in detail..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              <Send size={15} />
              <span>{payT.submitDispute}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
