import React, { useState } from 'react';
import { safarStore } from '../../services/store';
import { VehicleType, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { 
  ShieldCheck, 
  Upload, 
  Car, 
  Bike, 
  Sparkles, 
  Navigation, 
  CheckCircle2, 
  X,
  Camera,
  FileText
} from 'lucide-react';

interface DriverRegistrationModalProps {
  onClose: () => void;
  lang: Language;
  userId?: string;
  defaultName?: string;
  defaultPhone?: string;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  onClose,
  lang,
  userId,
  defaultName,
  defaultPhone,
}) => {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState(defaultName || '');
  const [phone, setPhone] = useState(defaultPhone || '');
  const [cnic, setCnic] = useState('44101-9876543-1');
  const [licenseNumber, setLicenseNumber] = useState('SINDH-MPK-9021');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car_economy');
  const [vehicleModel, setVehicleModel] = useState('Suzuki Alto VXR Silver');
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState('SINDH-MPK 3190');
  const [currentCity, setCurrentCity] = useState('Naukot');
  const [isFemale, setIsFemale] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sampleSelfie = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80';
  const sampleLicense = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
  const sampleVehicle = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80';

  const handleSubmit = (e: React.FormEvent, instantApprove = false) => {
    e.preventDefault();
    const newDriver = safarStore.registerDriver({
      userId: userId || ('usr-new-' + Date.now()),
      name: name.trim() || 'Driver Partner',
      phone: phone.trim() || '+92 300 0000000',
      cnic,
      licenseNumber,
      licensePhotoUrl: sampleLicense,
      vehicleType,
      vehicleModel,
      vehicleNumberPlate,
      vehiclePhotoUrl: sampleVehicle,
      selfieUrl: sampleSelfie,
      isOnline: true,
      isFemale,
      currentCity,
      currentLocation: currentCity === 'Naukot' 
        ? { lat: 24.8583, lng: 69.2045 }
        : currentCity === 'Mithi'
        ? { lat: 24.7438, lng: 69.8012 }
        : { lat: 25.5276, lng: 69.0125 },
    });

    if (instantApprove) {
      safarStore.updateDriverStatus(newDriver.id, 'approved');
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck size={22} />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.registrationTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Registration Submitted!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              SafarSindh Admin has received your documents. You can now go online and accept rides.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Full Name (ڊرائيور جو پورو نالو)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Phone (+92)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  CNIC No.
                </label>
                <input
                  type="text"
                  required
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Base City
                </label>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Naukot">Naukot (نوڪوٽ)</option>
                  <option value="Mithi">Mithi (مٺي)</option>
                  <option value="Mirpurkhas">Mirpurkhas (ميرپورخاص)</option>
                  <option value="Digri">Digri (ڊگھڙي)</option>
                  <option value="Islamkot">Islamkot (اسلام ڪوٽ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="bike">Motorbike (Honda 125/70)</option>
                  <option value="rickshaw">Auto Rickshaw</option>
                  <option value="car_economy">Car Economy (Alto/Bolan)</option>
                  <option value="car_comfort">Car Comfort AC (Corolla)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Suzuki Alto 2022"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Number Plate
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumberPlate}
                  onChange={(e) => setVehicleNumberPlate(e.target.value)}
                  placeholder="e.g. SINDH-MPK 4921"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Driving License Number
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. SINDH-MPK-44102"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Document upload preview indicators */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/40">
                <FileText size={18} className="mx-auto text-emerald-600 mb-1" />
                <span className="text-[10px] block font-semibold text-slate-700 dark:text-slate-300">
                  Driving License
                </span>
                <span className="text-[9px] text-emerald-600 font-bold">Attached ✓</span>
              </div>
              <div className="p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/40">
                <Car size={18} className="mx-auto text-emerald-600 mb-1" />
                <span className="text-[10px] block font-semibold text-slate-700 dark:text-slate-300">
                  Vehicle Photo
                </span>
                <span className="text-[9px] text-emerald-600 font-bold">Attached ✓</span>
              </div>
              <div className="p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/40">
                <Camera size={18} className="mx-auto text-emerald-600 mb-1" />
                <span className="text-[10px] block font-semibold text-slate-700 dark:text-slate-300">
                  Selfie Photo
                </span>
                <span className="text-[9px] text-emerald-600 font-bold">Attached ✓</span>
              </div>
            </div>

            {/* Female Driver checkbox */}
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={isFemale}
                onChange={(e) => setIsFemale(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                Female Driver (Eligible for Women-only trips)
              </span>
            </label>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95 transition"
              >
                <span>Register & Quick Approve (Demo Mode)</span>
              </button>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                <span>Submit for Admin Manual Review</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
