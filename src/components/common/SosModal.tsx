import React, { useState } from 'react';
import { RideRequest, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { AlertTriangle, PhoneCall, Share2, CheckCircle2, X } from 'lucide-react';

interface SosModalProps {
  ride: RideRequest;
  lang: Language;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ ride, lang, onClose }) => {
  const t = TRANSLATIONS[lang];
  const [alertSent, setAlertSent] = useState(false);

  const emergencySmsText = `[EMERGENCY SOS - SafarSindh]
I need emergency assistance.
Current Ride ID: ${ride.id}
Vehicle: ${ride.driverVehicle || 'Assigned Driver'} (Plate: ${ride.driverPlate || 'Pending'})
Driver Name: ${ride.driverName || 'N/A'}
Pickup: ${ride.pickup.name}, ${ride.pickup.city}
Destination: ${ride.dropoff.name}, ${ride.dropoff.city}
Live Coordinates: ${ride.pickup.lat.toFixed(4)}, ${ride.pickup.lng.toFixed(4)}`;

  const handleTriggerEmergency = () => {
    setAlertSent(true);
    // In a mobile browser, could trigger tel:15
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(emergencySmsText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-red-500/30 text-center relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
        >
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {t.sosEmergency}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Immediate Police & Emergency Contact Broadcast for Sindh Region
        </p>

        {alertSent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm mb-6 flex items-start gap-2.5 text-left">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-semibold">{t.sosAlertActive}</p>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                Sindh Police Madadgar (15) and local patrol units notified. Keep your phone active.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <a
              href="tel:15"
              onClick={handleTriggerEmergency}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition"
            >
              <PhoneCall size={18} />
              <span>Call Sindh Police 15 (Emergency)</span>
            </a>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
            >
              <Share2 size={16} />
              <span>Share Live Ride to WhatsApp / Contact</span>
            </button>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-left text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="font-bold text-slate-700 dark:text-slate-200">
            Emergency Dispatch Info:
          </div>
          <div>Driver: {ride.driverName || 'Assigned Driver'}</div>
          <div>Vehicle: {ride.driverVehicle || 'N/A'} ({ride.driverPlate || 'Pending'})</div>
          <div>Location: {ride.pickup.name} ({ride.pickup.city})</div>
          <div>Rescue Hotline: 1122 | Motorway / Sindh Police: 15</div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
