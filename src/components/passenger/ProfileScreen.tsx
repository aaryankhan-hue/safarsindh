import React, { useState } from 'react';
import { User, Language } from '../../types';
import { updateProfile } from '../../services/auth';
import { APP_TEXT } from '../../i18n/appText';
import { 
  User as UserIcon, 
  Phone, 
  ShieldAlert, 
  Globe, 
  HelpCircle, 
  LogOut, 
  Check, 
  Save, 
  Car,
  AlertTriangle
} from 'lucide-react';

interface ProfileScreenProps {
  user: User;
  completedRidesCount: number;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenHelp: () => void;
  onLogOut: () => void;
  onUpdateUser: (updated: User) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  completedRidesCount,
  lang,
  onSelectLang,
  onOpenHelp,
  onLogOut,
  onUpdateUser,
}) => {
  const t = APP_TEXT[lang];

  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, { emergencyContact });
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 pb-28 space-y-5">
      {/* User Avatar & Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-600/30">
          {initialLetter}
        </div>
        <div className="flex-1">
          <h2 className="font-black text-lg text-slate-900 dark:text-white">
            {user.name}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {user.phone}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t.passengerAccount}
            </span>
            <span className="text-[10px] text-slate-400">
              {completedRidesCount} {t.completedRidesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Contact SOS Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-rose-600">
          <ShieldAlert size={20} />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {t.emergencyContactTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          {t.emergencyContactHelp}
        </p>

        {saveSuccess && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check size={16} />
            <span>{t.emergencySaved}</span>
          </div>
        )}

        <form onSubmit={handleSaveContact} className="space-y-3">
          <div className="relative">
            <Phone size={16} className="absolute start-3.5 top-3.5 text-slate-400" />
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder={t.emergencyContactPlaceholder}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Save size={14} />
            <span>{saving ? '...' : t.saveEmergencyContact}</span>
          </button>
        </form>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        {/* Language Preference */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe size={18} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.languageTitle}
            </span>
          </div>
          <select
            value={lang}
            onChange={(e) => onSelectLang(e.target.value as Language)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl border-none font-bold"
          >
            <option value="en">English (EN)</option>
            <option value="ur">اردو (Urdu)</option>
            <option value="sd">سنڌي (Sindhi)</option>
          </select>
        </div>

        {/* Setup and Regional Guide */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition text-start"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={18} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.helpGuide}
            </span>
          </div>
          <span className="text-xs text-slate-400">View</span>
        </button>

        {/* Log Out */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full p-3 flex items-center justify-between text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition text-start"
        >
          <div className="flex items-center gap-2.5">
            <LogOut size={18} />
            <span className="text-xs font-bold">{t.logoutButton}</span>
          </div>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
              {t.logoutConfirmTitle}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {t.logoutConfirmMsg}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogOut();
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/30"
              >
                {t.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
