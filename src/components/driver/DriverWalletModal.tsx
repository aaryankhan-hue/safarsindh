import React, { useState, useEffect } from 'react';
import { Language, DriverProfile, LedgerEntry } from '../../types';
import { PAYMENT_TEXT } from '../../i18n/paymentText';
import { safarStore } from '../../services/store';
import { TopUpModal } from './TopUpModal';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  PlusCircle, 
  Receipt, 
  ShieldCheck, 
  History,
  TrendingDown,
  TrendingUp,
  Tag
} from 'lucide-react';

interface DriverWalletModalProps {
  driver: DriverProfile;
  lang: Language;
  onClose: () => void;
}

export const DriverWalletModal: React.FC<DriverWalletModalProps> = ({
  driver,
  lang,
  onClose,
}) => {
  const payT = PAYMENT_TEXT[lang];
  const isRtl = lang === 'ur' || lang === 'sd';

  const [currentDriver, setCurrentDriver] = useState<DriverProfile>(driver);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() =>
    safarStore.getLedger(driver.id)
  );
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const settings = safarStore.getPaymentSettings();
  const minRequired = settings.minDriverBalancePKR;
  const isBelowMin = (currentDriver.balancePKR || 0) < minRequired;

  const refreshData = () => {
    const updated = safarStore.getDrivers().find((d) => d.id === driver.id) || driver;
    setCurrentDriver(updated);
    setLedgerEntries(safarStore.getLedger(driver.id));
  };

  useEffect(() => {
    const unsub = safarStore.subscribe(refreshData);
    return () => unsub();
  }, [driver.id]);

  const getLedgerTypeInfo = (type: LedgerEntry['type'], amount: number) => {
    switch (type) {
      case 'commission':
        return {
          label: payT.typeCommission,
          icon: TrendingDown,
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50',
          prefix: '-',
        };
      case 'topup':
        return {
          label: payT.typeTopUp,
          icon: TrendingUp,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/50',
          prefix: '+',
        };
      case 'promo_credit':
        return {
          label: payT.typePromoCredit,
          icon: Tag,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/50',
          prefix: '+',
        };
      case 'adjustment':
        return {
          label: payT.typeAdjustment,
          icon: Receipt,
          color: amount >= 0 ? 'text-emerald-600' : 'text-rose-600',
          bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          prefix: amount >= 0 ? '+' : '',
        };
      default:
        return {
          label: type,
          icon: Receipt,
          color: 'text-slate-600',
          bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          prefix: '',
        };
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {payT.driverWallet}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentDriver.name} · {currentDriver.currentCity}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pe-1">
          {/* Main Balance Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {payT.currentBalance}
                </span>
                <div className="text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                  Rs. {currentDriver.balancePKR ?? 0}
                </div>
              </div>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
              >
                <PlusCircle size={15} />
                <span>{payT.topUpNow}</span>
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
              <span>{payT.minBalanceRequired}:</span>
              <span className="font-mono font-bold text-amber-400">
                Rs. {minRequired}
              </span>
            </div>

            {/* Background design glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          </div>

          {/* Minimum Balance Warning Banner */}
          {isBelowMin && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">{payT.minBalanceWarning}</span>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-300 mt-0.5">
                  You cannot accept new rides while balance is below Rs. {minRequired}. Please top up your wallet.
                </p>
                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="mt-2 py-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  {payT.topUpNow}
                </button>
              </div>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-normal">Today</span>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                Rs. {currentDriver.todayEarnings}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-normal">This Week</span>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                Rs. {currentDriver.weekEarnings}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-normal">Trips</span>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                {currentDriver.totalTrips}
              </span>
            </div>
          </div>

          {/* Ledger History List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History size={13} />
                <span>{payT.ledgerHistory}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {ledgerEntries.length} entries
              </span>
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {payT.noLedgerEntries}
              </div>
            ) : (
              <div className="space-y-2">
                {ledgerEntries.map((entry) => {
                  const typeInfo = getLedgerTypeInfo(entry.type, entry.amountPKR);
                  const Icon = typeInfo.icon;
                  const isPositive = entry.amountPKR > 0;

                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${typeInfo.bg} ${typeInfo.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {typeInfo.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {entry.notes || entry.reference}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {new Date(entry.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ps-2">
                        <div className={`text-xs font-black font-mono ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isPositive ? `+Rs. ${entry.amountPKR}` : `-Rs. ${Math.abs(entry.amountPKR)}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Bal: Rs. {entry.balanceAfter}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Up Modal Child */}
      {showTopUpModal && (
        <TopUpModal
          driver={currentDriver}
          lang={lang}
          onClose={() => setShowTopUpModal(false)}
          onSuccess={() => {
            refreshData();
          }}
        />
      )}
    </div>
  );
};
