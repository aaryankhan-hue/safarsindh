import React, { useState } from 'react';
import { Language } from '../../types';
import { APP_TEXT } from '../../i18n/appText';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface CancelRideModalProps {
  isDriverAssigned: boolean;
  lang: Language;
  onConfirmCancel: (reason: string) => void;
  onClose: () => void;
}

export const CancelRideModal: React.FC<CancelRideModalProps> = ({
  isDriverAssigned,
  lang,
  onConfirmCancel,
  onClose,
}) => {
  const t = APP_TEXT[lang];

  const reasons = [
    { id: 'changed_mind', label: t.reasonChangedMind },
    { id: 'found_another', label: t.reasonFoundAnother },
    { id: 'driver_slow', label: t.reasonDriverSlow },
    { id: 'wrong_location', label: t.reasonWrongLocation },
    { id: 'price_high', label: t.reasonPriceHigh },
    { id: 'other', label: t.reasonOther },
  ];

  const [selectedReason, setSelectedReason] = useState(reasons[0].label);
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const finalReason = selectedReason === t.reasonOther && customReason.trim()
      ? customReason.trim()
      : selectedReason;
    onConfirmCancel(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
        {/* Header & Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={20} />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.cancelRideTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning Banner */}
        <div
          className={`p-3.5 rounded-2xl mb-4 text-xs flex items-start gap-2.5 ${
            isDriverAssigned
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-500/30'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ShieldAlert size={18} className={`shrink-0 mt-0.5 ${isDriverAssigned ? 'text-amber-600' : 'text-slate-400'}`} />
          <p className="leading-relaxed">
            {isDriverAssigned ? t.cancelWarningAssigned : t.cancelWarningWaiting}
          </p>
        </div>

        {/* Reasons Radio List */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            {t.cancelReasonLabel}
          </label>
          {reasons.map((r) => (
            <label
              key={r.id}
              className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition ${
                selectedReason === r.label
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>{r.label}</span>
              <input
                type="radio"
                name="cancelReason"
                checked={selectedReason === r.label}
                onChange={() => setSelectedReason(r.label)}
                className="w-4 h-4 text-rose-600 focus:ring-rose-500"
              />
            </label>
          ))}

          {selectedReason === t.reasonOther && (
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe reason..."
              className="w-full mt-2 p-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-rose-500"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition"
          >
            {t.keepRideButton}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition active:scale-[0.98]"
          >
            {t.confirmCancelButton}
          </button>
        </div>
      </div>
    </div>
  );
};
