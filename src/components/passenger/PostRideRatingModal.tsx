import React, { useState, useEffect } from 'react';
import { RideRequest, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import confetti from 'canvas-confetti';
import { 
  Star, 
  CheckCircle2, 
  Sparkles, 
  ThumbsUp, 
  ShieldCheck, 
  Banknote,
  Send
} from 'lucide-react';

interface PostRideRatingModalProps {
  ride: RideRequest;
  lang: Language;
  onSubmitRating: (data: { stars: number; feedback: string; compliments: string[] }) => void;
  onSkipRating: () => void;
  onClose: () => void;
}

export const PostRideRatingModal: React.FC<PostRideRatingModalProps> = ({
  ride,
  lang,
  onSubmitRating,
  onSkipRating,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#3b82f6', '#ec4899'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const complimentOptions = [
    'Polite & Respectful (اخلاق)',
    'Safe Desert Driving (محفوظ ڊرائيونگ)',
    'Clean Vehicle (صاف گاڏي)',
    'On Time Arrival (وقت تي پهچڻ)',
    'Knows Sindh Routes Well (واقفڪار)',
    'Great AC Cooling (ٿڌو اي سي)',
  ];

  const toggleCompliment = (comp: string) => {
    setSelectedCompliments((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const handleFinish = () => {
    onSubmitRating({
      stars,
      feedback,
      compliments: selectedCompliments,
    });
  };

  const handleSkip = () => {
    onSkipRating();
  };

  const fare = ride.finalFare || ride.passengerOffer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-h-[90vh] overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={36} />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          {t.rideCompleted}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          {ride.pickup.city} → {ride.dropoff.city} ({ride.distanceKm} km)
        </p>

        {/* Fare Receipt Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-500/20 mb-5">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            Cash Paid to Driver
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Rs. {fare}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
            <Banknote size={14} className="text-emerald-600" />
            <span>Paid in Cash on Arrival</span>
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            {t.rateDriver}
          </span>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStars(s)}
                className="p-1 active:scale-125 transition"
              >
                <Star
                  size={28}
                  className={
                    s <= stars
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
            {stars === 5 ? 'Excellent Journey! (زبردست)' : `${stars} Stars`}
          </span>
        </div>

        {/* Compliment Tags */}
        <div className="mb-5 text-left">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            {t.driverCompliments}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {complimentOptions.map((c) => {
              const active = selectedCompliments.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCompliment(c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Notes */}
        <div className="mb-5">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write a comment about your trip through Naukot, Mithi, or Mirpurkhas..."
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleFinish}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Send size={16} />
            <span>{t.submitRating}</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold text-xs transition"
          >
            Skip Rating
          </button>
        </div>
      </div>
    </div>
  );
};
