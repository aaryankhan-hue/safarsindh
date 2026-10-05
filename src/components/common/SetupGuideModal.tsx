import React from 'react';
import { X, CheckCircle, Database, Map, Key, Smartphone, Users } from 'lucide-react';

interface SetupGuideModalProps {
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Database size={22} />
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              SafarSindh Setup & Architecture Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Quick Demo Testing Guide */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-2">
              <Users size={18} className="text-emerald-600" />
              How to Test the inDrive Negotiation Flow (Instant Demo)
            </h4>
            <ul className="text-xs space-y-1.5 list-disc pl-4 text-emerald-800 dark:text-emerald-300">
              <li>
                <strong>Solo Mode:</strong> In <em>Passenger</em> mode, select a route (e.g., Naukot Fort → Mithi Gaddi Bhit), pick your vehicle, adjust your offer, and tap <em>Find Drivers</em>. Simulated regional drivers will reply with real-time counter-offers within 2–4 seconds!
              </li>
              <li>
                <strong>Multi-Actor Mode:</strong> Open SafarSindh in two browser windows side-by-side. Set one window to <em>Passenger</em> and the other to <em>Driver</em>. Post a ride as passenger, and watch it ping instantly on the driver's screen via real-time BroadcastSync!
              </li>
              <li>
                <strong>Admin Mode:</strong> Switch to <em>Admin</em> to approve pending driver licenses, configure base fare & per-km rates, and monitor live fleet dispatches across Sindh.
              </li>
            </ul>
          </div>

          {/* Regional Context */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Map size={18} className="text-emerald-500" />
              Supported Sindh Region & Popular Routes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>Naukot ⇄ Mithi (48 km)</strong>
                <p className="text-slate-500 mt-0.5">Historic Talpur gateway to the Thar Desert sand dunes (Gaddi Bhit).</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>Naukot ⇄ Mirpurkhas (68 km)</strong>
                <p className="text-slate-500 mt-0.5">Via Digri Chowk & Jhuddo sugar agricultural belt.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>Mithi ⇄ Mirpurkhas (112 km)</strong>
                <p className="text-slate-500 mt-0.5">Direct intercity transit connecting Tharparkar to divisional hub.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>In-City & Connecting Towns</strong>
                <p className="text-slate-500 mt-0.5">Covers Diplo, Islamkot, Kunri, Naukot Shahi Bazar, and MPK Station.</p>
              </div>
            </div>
          </div>

          {/* Environment Variables & Setup */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Key size={18} className="text-emerald-500" />
              Environment Variables Configuration (.env)
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
              <pre>{`# Google Maps Platform (Optional for real Google Maps tiles & Places)
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_KEY"

# Firebase Config (Optional for live Cloud Firestore sync)
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="safarsindh.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="safarsindh"
VITE_FIREBASE_STORAGE_BUCKET="safarsindh.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`}</pre>
            </div>
          </div>

          {/* PWA Features */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Smartphone size={18} className="text-emerald-500" />
              PWA & Mobile Installability
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              SafarSindh is designed mobile-first with high touch-target compliance, bottom sheets, full RTL support for Sindhi (سنڌي) and Urdu (اردو), offline fallback, and installable PWA manifest metadata.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
