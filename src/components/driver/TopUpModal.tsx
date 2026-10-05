import React, { useState } from 'react';
import { Language, DriverProfile, TopUpRequest } from '../../types';
import { PAYMENT_TEXT } from '../../i18n/paymentText';
import { safarStore } from '../../services/store';
import { 
  X, 
  Copy, 
  Check, 
  Upload, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Building2, 
  CreditCard,
  ArrowRight,
  ShieldCheck,
  ImageIcon
} from 'lucide-react';

interface TopUpModalProps {
  driver: DriverProfile;
  lang: Language;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  driver,
  lang,
  onClose,
  onSuccess,
}) => {
  const payT = PAYMENT_TEXT[lang];
  const isRtl = lang === 'ur' || lang === 'sd';

  const settings = safarStore.getPaymentSettings();
  const activeAccounts = settings.accounts.filter((a) => a.isActive);

  // Form State
  const [selectedMethod, setSelectedMethod] = useState<'easypaisa' | 'jazzcash' | 'bank_transfer'>(
    activeAccounts[0]?.method || 'easypaisa'
  );
  const [amountInput, setAmountInput] = useState<string>('500');
  const [senderNumber, setSenderNumber] = useState<string>(driver.phone || '');
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active top-ups history
  const [topUpHistory, setTopUpHistory] = useState<TopUpRequest[]>(() =>
    safarStore.getTopUpRequests(driver.id)
  );

  const selectedAccount = activeAccounts.find((a) => a.method === selectedMethod) || activeAccounts[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Image Upload with client-side compression (safely under 3MB)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setScreenshotData(compressed);
          setErrorMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = parseInt(amountInput, 10);
    if (isNaN(amount) || amount < 100) {
      setErrorMessage(payT.invalidAmountError);
      return;
    }

    if (!senderNumber.trim()) {
      setErrorMessage('Please enter the sender phone number / account.');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMessage('Please enter the Transaction ID (TID) from your payment receipt.');
      return;
    }

    if (!screenshotData) {
      setErrorMessage(payT.screenshotRequiredError);
      return;
    }

    setIsSubmitting(true);

    const result = safarStore.createTopUpRequest({
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      amountPKR: amount,
      method: selectedMethod,
      senderNumber: senderNumber.trim(),
      transactionId: transactionId.trim(),
      screenshotUrl: screenshotData,
    });

    setIsSubmitting(false);

    if (!result.success) {
      if (result.error === 'DUPLICATE_TID') {
        setErrorMessage(payT.duplicateTidError);
      } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
        setErrorMessage(payT.rateLimitTopUpError);
      } else {
        setErrorMessage('Failed to submit top-up request. Please try again.');
      }
      return;
    }

    setSuccessMessage(payT.topUpSubmittedSuccess);
    setTopUpHistory(safarStore.getTopUpRequests(driver.id));
    setTransactionId('');
    setScreenshotData('');
    onSuccess?.();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={20} />
              <span>{payT.walletTopUp}</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {driver.name} · {driver.vehicleNumberPlate}
            </p>
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
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <span className="font-bold block">Submission Received</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Deposit Instructions */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {payT.step1Transfer}
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {activeAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedMethod(acc.method)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedMethod === acc.method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {acc.method === 'easypaisa' && <Smartphone size={14} />}
                  {acc.method === 'jazzcash' && <CreditCard size={14} />}
                  {acc.method === 'bank_transfer' && <Building2 size={14} />}
                  <span className="capitalize">{acc.method.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            {/* Account Details Display */}
            {selectedAccount && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{payT.accountTitle}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedAccount.title}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">{payT.accountNumber}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                      {selectedAccount.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedAccount.accountNumber, selectedAccount.id)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:bg-slate-200"
                    >
                      {copiedId === selectedAccount.id ? <Check size={10} /> : <Copy size={10} />}
                      <span>{copiedId === selectedAccount.id ? payT.copied : payT.copyDetails}</span>
                    </button>
                  </div>
                </div>

                {selectedAccount.bankName && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{payT.bankName}:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedAccount.bankName}
                    </span>
                  </div>
                )}

                {selectedAccount.instructions && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-1">
                    {selectedAccount.instructions}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Top-Up Request Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {payT.step2SubmitDetails}
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Amount (PKR)
              </label>
              <div className="flex gap-2 mb-2">
                {['300', '500', '1000', '2000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountInput(val)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      amountInput === val
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Rs. {val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="100"
                step="1"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Enter custom integer PKR (e.g. 500)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Sender Phone */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {payT.senderPhone}
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 03001234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Transaction ID (TID) */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {payT.transactionId}
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={payT.tidPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Screenshot Upload with Preview */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {payT.uploadScreenshot}
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                  <Upload size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {screenshotData ? 'Change Screenshot' : 'Attach Receipt Image'}
                  </span>
                  <span className="text-[10px] text-slate-400">{payT.screenshotHelp}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {screenshotData && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    <img
                      src={screenshotData}
                      alt="Receipt preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <Check size={16} className="text-emerald-600 font-bold bg-white rounded-full p-0.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? payT.submittingTopUp : payT.submitTopUp}
            </button>
          </form>

          {/* Real-time Top-Up History for this driver */}
          {topUpHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Your Recent Top-Up Requests
              </span>
              <div className="space-y-2">
                {topUpHistory.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          Rs. {req.amountPKR}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase">
                          {req.method}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        TID: {req.transactionId} · {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      {req.rejectionReason && req.status === 'rejected' && (
                        <div className="text-[10px] text-rose-500 mt-0.5 font-semibold">
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div>
                      {req.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1">
                          <Clock size={10} />
                          <span>{payT.pendingReview}</span>
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          <span>{payT.approved}</span>
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1">
                          <XCircle size={10} />
                          <span>{payT.rejected}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
