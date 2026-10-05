import React from 'react';
import { User, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { 
  Navigation, 
  Globe, 
  HelpCircle, 
  LogOut,
  User as UserIcon,
  Shield,
  Car
} from 'lucide-react';

interface TopNavigationProps {
  user: User;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenHelp: () => void;
  onLogOut: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  user,
  currentLang,
  onSelectLang,
  onOpenHelp,
  onLogOut,
}) => {
  const t = TRANSLATIONS[currentLang];

  const getRoleIcon = () => {
    switch (user.role) {
      case 'driver':
        return <Car size={12} className="text-emerald-500" />;
      case 'admin':
        return <Shield size={12} className="text-purple-500" />;
      default:
        return <UserIcon size={12} className="text-emerald-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 h-[56px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between transition-colors pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
            <Navigation size={18} className="fill-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
              SafarSindh
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-serif">
              سفر سنڌ
            </span>
          </div>
        </div>

        {/* User Info Badge */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full text-xs max-w-[140px] sm:max-w-[200px] truncate">
          {getRoleIcon()}
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
            {user.name}
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400 hidden xs:inline">
            ({user.role})
          </span>
        </div>

        {/* Language selector, Help, and Logout */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="relative flex items-center">
            <select
              value={currentLang}
              onChange={(e) => onSelectLang(e.target.value as Language)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 ps-2 pe-5 rounded-lg border-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="ur">اردو</option>
              <option value="sd">سنڌي</option>
            </select>
            <Globe size={10} className="absolute end-1.5 pointer-events-none text-slate-400" />
          </div>

          <button
            onClick={onOpenHelp}
            title="App & Setup Guide"
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <HelpCircle size={15} />
          </button>

          {/* Quick Logout button for driver and admin (and convenient for passenger as well) */}
          <button
            onClick={onLogOut}
            title="Log Out"
            className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 transition"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
