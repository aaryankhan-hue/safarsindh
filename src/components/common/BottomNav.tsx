import React from 'react';
import { Language } from '../../types';
import { APP_TEXT } from '../../i18n/appText';
import { MapPin, History, User } from 'lucide-react';

export type PassengerTab = 'home' | 'rides' | 'profile';

interface BottomNavProps {
  activeTab: PassengerTab;
  onChangeTab: (tab: PassengerTab) => void;
  lang: Language;
  hasActiveRide?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  lang,
  hasActiveRide = false,
}) => {
  const t = APP_TEXT[lang];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 px-4 shadow-lg transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
        <button
          onClick={() => onChangeTab('home')}
          className={`min-h-[48px] py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition active:scale-95 relative ${
            activeTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <MapPin size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
            {hasActiveRide && (
              <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>
          <span className="text-[11px] leading-none">{t.homeTab}</span>
        </button>

        <button
          onClick={() => onChangeTab('rides')}
          className={`min-h-[48px] py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition active:scale-95 ${
            activeTab === 'rides'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <History size={20} className={activeTab === 'rides' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] leading-none">{t.ridesTab}</span>
        </button>

        <button
          onClick={() => onChangeTab('profile')}
          className={`min-h-[48px] py-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition active:scale-95 ${
            activeTab === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] leading-none">{t.profileTab}</span>
        </button>
      </div>
    </nav>
  );
};
