import React, { useState, useEffect } from 'react';
import { safarStore } from '../../services/store';
import { 
  DriverProfile, 
  RideRequest, 
  FareConfig, 
  VehicleType, 
  Language 
} from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { SafarMap } from '../map/SafarMap';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Bell, 
  Sliders, 
  FileText, 
  ShieldAlert,
  Send,
  Sparkles,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'rides' | 'pricing' | 'broadcast'>('overview');
  
  const [drivers, setDrivers] = useState<DriverProfile[]>(safarStore.getDrivers());
  const [rides, setRides] = useState<RideRequest[]>(safarStore.getRides());
  const [fareConfigs, setFareConfigs] = useState<Record<VehicleType, FareConfig>>(safarStore.getFareConfigs());
  
  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Pricing edit state
  const [pricingEdit, setPricingEdit] = useState<Record<VehicleType, FareConfig>>(fareConfigs);
  const [pricingSaved, setPricingSaved] = useState(false);

  const sync = () => {
    setDrivers(safarStore.getDrivers());
    setRides(safarStore.getRides());
    const fares = safarStore.getFareConfigs();
    setFareConfigs(fares);
    setPricingEdit(fares);
  };

  useEffect(() => {
    sync();
    const unsub = safarStore.subscribe(sync);
    return () => unsub();
  }, []);

  // Compute metrics
  const totalRidesCount = rides.length;
  const completedRides = rides.filter((r) => r.status === 'completed');
  const activeRides = rides.filter((r) => ['requested', 'offers_received', 'driver_arriving', 'arrived', 'ride_started'].includes(r.status));
  const pendingDrivers = drivers.filter((d) => d.status === 'pending');
  const onlineDrivers = drivers.filter((d) => d.isOnline && d.status === 'approved');

  const totalGMV = completedRides.reduce((acc, r) => acc + (r.finalFare || r.passengerOffer || 0), 0);
  const platformRevenue = Math.round(totalGMV * 0.1);

  const handleApproveDriver = (driverId: string) => {
    safarStore.updateDriverStatus(driverId, 'approved');
  };

  const handleRejectDriver = (driverId: string) => {
    safarStore.updateDriverStatus(driverId, 'rejected', 'Document verification criteria not met');
  };

  const handleSavePricing = () => {
    (Object.keys(pricingEdit) as VehicleType[]).forEach((type) => {
      safarStore.updateFareConfig(type, pricingEdit[type]);
    });
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    safarStore.postAnnouncement(broadcastTitle, broadcastMsg);
    setBroadcastTitle('');
    setBroadcastMsg('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              SafarSindh Admin Operations
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">
            Regional Control Room (سنڌ ڪنٽرول)
          </h2>
          <p className="text-xs text-slate-400">
            Naukot · Mithi · Mirpurkhas Transport Division
          </p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'drivers', label: `Drivers (${pendingDrivers.length})`, icon: Users },
            { id: 'rides', label: `Live Rides (${activeRides.length})`, icon: Car },
            { id: 'pricing', label: 'Fare Matrix', icon: Sliders },
            { id: 'broadcast', label: 'Broadcast', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {totalRidesCount}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {completedRides.length} completed
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Gross Volume (GMV)
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                Rs. {totalGMV}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Passenger Cash Paid
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SafarSindh Revenue
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                Rs. {platformRevenue}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                10% Avg Commission
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Fleet
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {onlineDrivers.length} / {drivers.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Online in Region
              </span>
            </div>
          </div>

          {/* Regional Live Map View */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Regional Fleet Live Heatmap (Naukot - Mithi - Mirpurkhas)
                </h3>
              </div>
              <span className="text-xs text-slate-500">Live GPS tracking</span>
            </div>
            <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <SafarMap />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVER VERIFICATION QUEUE */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Driver Document Verification Queue
          </h3>

          <div className="space-y-3">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={d.selfieUrl}
                    alt={d.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {d.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          d.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : d.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      <div>Phone: {d.phone} · CNIC: {d.cnic}</div>
                      <div>
                        Vehicle: {d.vehicleModel} ({d.vehicleNumberPlate}) · Base: {d.currentCity}
                      </div>
                      <div>License: {d.licenseNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex items-center gap-2">
                  {d.status !== 'approved' && (
                    <button
                      onClick={() => handleApproveDriver(d.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle size={14} />
                      <span>{t.approveDriver}</span>
                    </button>
                  )}
                  {d.status !== 'rejected' && (
                    <button
                      onClick={() => handleRejectDriver(d.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <XCircle size={14} />
                      <span>{t.rejectDriver}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE DISPATCH & RIDES */}
      {activeTab === 'rides' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            All Regional Trip Dispatches
          </h3>

          <div className="space-y-3">
            {rides.length === 0 ? (
              <p className="text-xs text-slate-400">No rides booked yet.</p>
            ) : (
              rides.map((r) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {r.pickup.city} → {r.dropoff.city}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {r.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Passenger: {r.passengerName} ({r.passengerPhone}) · Driver: {r.driverName || 'Unassigned'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Pickup: {r.pickup.name} | Drop: {r.dropoff.name} ({r.distanceKm} km)
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      Rs. {r.finalFare || r.passengerOffer}
                    </span>
                    <span className="text-[10px] block text-slate-400">
                      Payment: {r.paymentMethod.toUpperCase()} ({r.paymentStatus})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRICING CONFIGURATION */}
      {activeTab === 'pricing' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.fareSettings}
              </h3>
              <p className="text-xs text-slate-400">
                Adjust base fares, per-km rates, and platform commission for the Sindh region.
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              {pricingSaved ? 'Saved! ✓' : t.saveSettings}
            </button>
          </div>

          <div className="space-y-4">
            {(Object.keys(pricingEdit) as VehicleType[]).map((type) => {
              const cfg = pricingEdit[type];
              return (
                <div
                  key={type}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                >
                  <div className="sm:col-span-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {cfg.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t.baseFare}
                    </label>
                    <input
                      type="number"
                      value={cfg.baseFare}
                      onChange={(e) =>
                        setPricingEdit({
                          ...pricingEdit,
                          [type]: { ...cfg, baseFare: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t.perKmRate}
                    </label>
                    <input
                      type="number"
                      value={cfg.perKmRate}
                      onChange={(e) =>
                        setPricingEdit({
                          ...pricingEdit,
                          [type]: { ...cfg, perKmRate: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t.minimumFare}
                    </label>
                    <input
                      type="number"
                      value={cfg.minimumFare}
                      onChange={(e) =>
                        setPricingEdit({
                          ...pricingEdit,
                          [type]: { ...cfg, minimumFare: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t.commissionPct}
                    </label>
                    <input
                      type="number"
                      value={cfg.commissionPercent}
                      onChange={(e) =>
                        setPricingEdit({
                          ...pricingEdit,
                          [type]: { ...cfg, commissionPercent: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-emerald-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.broadcastNotification}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish push alerts to all drivers and passengers operating on the Naukot, Mithi, and Mirpurkhas routes.
          </p>

          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              Announcement broadcasted successfully to all users!
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Weather Advisory: Sandstorm near Thar Desert Highway"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Message Content
              </label>
              <textarea
                required
                rows={3}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Write message in English, Sindhi, or Urdu for drivers and passengers..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Send size={14} />
              <span>{t.sendBroadcast}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
