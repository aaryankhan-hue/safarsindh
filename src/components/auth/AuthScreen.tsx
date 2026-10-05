import React, { useState } from 'react';
import { logIn, signUp, generateOtp, verifyOtp } from '../../services/auth';
import { User, Language, UserRole } from '../../types';
import { AUTH_TEXT } from '../../i18n/authText';
import { 
  Navigation, 
  Globe, 
  Lock, 
  Phone, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Car,
  Shield,
  KeyRound
} from 'lucide-react';

interface AuthScreenProps {
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  lang,
  onSelectLang,
  onAuthSuccess,
}) => {
  const t = AUTH_TEXT[lang];

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [emergencyContact, setEmergencyContact] = useState('');

  // OTP Step
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeDemoOtp, setActiveDemoOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mapAuthError = (err: any): string => {
    const msg = err?.message || '';
    if (msg.includes('INVALID_PHONE')) return t.errInvalidPhone;
    if (msg.includes('USER_NOT_FOUND')) return t.errUserNotFound;
    if (msg.includes('WRONG_PASSWORD')) return t.errWrongPassword;
    if (msg.includes('WEAK_PASSWORD')) return t.errWeakPassword;
    if (msg.includes('PHONE_ALREADY_REGISTERED')) return t.errPhoneRegistered;
    if (msg.includes('INVALID_NAME')) return t.errInvalidName;
    if (msg.includes('ADMIN_SIGNUP_NOT_ALLOWED')) return t.errAdminNotAllowed;
    if (msg.includes('WRONG_OTP')) return t.errWrongOtp;
    return t.errGeneric;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await logIn(phone, password);
      onAuthSuccess(user);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg(t.errInvalidName);
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg(t.errWeakPassword);
      return;
    }

    try {
      // Generate OTP and move to verification step
      const generated = generateOtp(phone);
      setActiveDemoOtp(generated);
      setIsOtpStep(true);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err));
    }
  };

  const handleVerifyOtpAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const isValid = verifyOtp(phone, otpCode);
      if (!isValid && otpCode.trim() !== activeDemoOtp) {
        throw new Error('WRONG_OTP');
      }

      const user = await signUp({
        name,
        phone,
        password,
        role,
        emergencyContact,
      });

      onAuthSuccess(user);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoPhone: string, demoPass: string) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await logIn(demoPhone, demoPass);
      onAuthSuccess(user);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-md mx-auto pt-4 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Navigation size={18} className="fill-emerald-400" />
          </div>
          <span className="text-white font-extrabold tracking-tight text-sm">
            SafarSindh
          </span>
        </div>

        <div className="relative flex items-center">
          <select
            value={lang}
            onChange={(e) => onSelectLang(e.target.value as Language)}
            className="appearance-none bg-slate-800/90 text-white text-xs font-bold py-1.5 ps-3 pe-7 rounded-xl border border-slate-700 focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm"
          >
            <option value="en">English (EN)</option>
            <option value="ur">اردو (Urdu)</option>
            <option value="sd">سنڌي (Sindhi)</option>
          </select>
          <Globe size={12} className="absolute end-2.5 pointer-events-none text-slate-400" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-md mx-auto px-6 pt-4 pb-2 text-center z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/25 mb-3">
          <Navigation size={32} className="fill-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          SafarSindh <span className="text-emerald-400 font-serif">سفر سنڌ</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
          {t.heroTagline}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto px-4 pb-8 z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
          {/* Tabs: Login / Sign up (hidden when in OTP step) */}
          {!isOtpStep && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  tab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.loginTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition ${
                  tab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.signupTab}
              </button>
            </div>
          )}

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form 1: LOGIN */}
          {!isOtpStep && tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-start">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute start-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t.phoneHelp}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full ps-10 pe-11 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? '...' : t.loginButton}</span>
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
            </form>
          )}

          {/* Form 2: SIGN UP */}
          {!isOtpStep && tab === 'signup' && (
            <form onSubmit={handleStartSignup} className="space-y-4 text-start">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute start-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute start-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t.phoneHelp}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full ps-10 pe-11 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role Selection on Sign Up (Passenger or Driver) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {t.chooseRoleLabel}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('passenger')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      role === 'passenger'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <UserIcon size={20} className={role === 'passenger' ? 'text-emerald-600' : ''} />
                    <span className="text-xs">{t.rolePassenger}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('driver')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      role === 'driver'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <Car size={20} className={role === 'driver' ? 'text-emerald-600' : ''} />
                    <span className="text-xs">{t.roleDriver}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-60 cursor-pointer"
              >
                <span>{t.signupButton}</span>
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
            </form>
          )}

          {/* Form 3: OTP VERIFICATION STEP */}
          {isOtpStep && (
            <form onSubmit={handleVerifyOtpAndComplete} className="space-y-4 text-start">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <KeyRound size={24} />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.verifyOtpTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.verifyOtpSubtitle} <strong className="text-slate-800 dark:text-slate-200">{phone}</strong>
                </p>
              </div>

              {/* Demo Mode Notice Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-center">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                  {t.demoOtpNotice}
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-amber-900 dark:text-amber-200 block mt-1">
                  {activeDemoOtp}
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-400 block mt-0.5">
                  (Simulated SMS for Naukot-Mithi-MPK Region)
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder={t.otpPlaceholder}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-center font-mono font-black text-xl tracking-widest border-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? '...' : t.verifyAndComplete}</span>
                <CheckCircle2 size={16} />
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const newOtp = generateOtp(phone);
                    setActiveDemoOtp(newOtp);
                  }}
                  className="text-emerald-600 hover:underline font-bold"
                >
                  {t.resendOtp}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {t.changePhone}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Login Buttons */}
          {!isOtpStep && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                {t.quickDemoTitle}
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('03001234567', '123456')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon size={14} />
                    <span>{t.demoPassenger}</span>
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">123456</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('03002345678', '123456')}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-500/20 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Car size={14} />
                    <span>{t.demoDriver}</span>
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">123456</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('03000000000', 'admin123')}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-500/20 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Shield size={14} />
                    <span>{t.demoAdmin}</span>
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">admin123</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {t.demoCredentialsHint}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full text-center pb-4 text-[11px] text-slate-500">
        SafarSindh PWA · Sindh Digital Mobility Initiative
      </div>
    </div>
  );
};
