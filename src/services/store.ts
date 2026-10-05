import { 
  RideRequest, 
  DriverProfile, 
  DriverOffer, 
  FareConfig, 
  ChatMessage, 
  VehicleType, 
  LocationPoint,
  LedgerEntry,
  TopUpRequest,
  PaymentSettings,
  RideDispute
} from '../types';
import { DEFAULT_FARE_CONFIGS, calculateEstimatedFare } from '../data/fareConfigs';
import { SINDH_LOCATIONS } from '../data/sindhLocations';

const STORAGE_KEYS = {
  RIDES: 'safarsindh_rides_v1',
  DRIVERS: 'safarsindh_drivers_v1',
  CURRENT_DRIVER_ID: 'safarsindh_current_driver_id_v1',
  FARE_CONFIGS: 'safarsindh_fares_v1',
  CHATS: 'safarsindh_chats_v1',
  SAVED_PLACES: 'safarsindh_saved_places_v1',
  LANGUAGE: 'safarsindh_lang_v1',
  ACTIVE_RIDE_ID: 'safarsindh_active_ride_id_v1',
  ANNOUNCEMENTS: 'safarsindh_announcements_v1',
  LEDGER: 'safarsindh_ledger_v1',
  TOPUPS: 'safarsindh_topups_v1',
  PAYMENT_SETTINGS: 'safarsindh_payment_settings_v1',
  DISPUTES: 'safarsindh_disputes_v1',
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  minDriverBalancePKR: -200,
  enableOnlinePayments: false,
  accounts: [
    {
      id: 'acc-easypaisa-1',
      method: 'easypaisa',
      title: 'SafarSindh Logistics (PVT) Ltd',
      accountNumber: '0300 2345678',
      isActive: true,
      instructions: 'Send money via Easypaisa App or retailer shop. Keep screenshot & TID.',
    },
    {
      id: 'acc-jazzcash-1',
      method: 'jazzcash',
      title: 'SafarSindh Transport Partner',
      accountNumber: '0301 9876543',
      isActive: true,
      instructions: 'Send money via JazzCash App or *786# menu. Keep screenshot & TID.',
    },
    {
      id: 'acc-bank-1',
      method: 'bank_transfer',
      title: 'SafarSindh Technologies (PVT) Ltd',
      accountNumber: 'PK72MEZN0001234567890123',
      bankName: 'Meezan Bank (Mirpurkhas Main Branch)',
      isActive: true,
      instructions: 'Interbank funds transfer (1Link / Raast). Use transaction reference as TID.',
    },
  ],
};

const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'led-init-1',
    userId: 'drv-naukot-1',
    type: 'topup',
    amountPKR: 4200,
    balanceAfter: 4200,
    reference: 'initial_deposit_ali',
    notes: 'Initial account balance',
    createdBy: 'system',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'led-init-2',
    userId: 'drv-mithi-1',
    type: 'topup',
    amountPKR: 8100,
    balanceAfter: 8100,
    reference: 'initial_deposit_zulfiqar',
    notes: 'Initial account balance',
    createdBy: 'system',
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'led-init-3',
    userId: 'drv-mpk-1',
    type: 'topup',
    amountPKR: 12500,
    balanceAfter: 12500,
    reference: 'initial_deposit_ghulam',
    notes: 'Initial account balance',
    createdBy: 'system',
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: 'led-init-4',
    userId: 'drv-rickshaw-1',
    type: 'topup',
    amountPKR: 2900,
    balanceAfter: 2900,
    reference: 'initial_deposit_dino',
    notes: 'Initial account balance',
    createdBy: 'system',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'led-init-5',
    userId: 'drv-female-1',
    type: 'topup',
    amountPKR: 6400,
    balanceAfter: 6400,
    reference: 'initial_deposit_razia',
    notes: 'Initial account balance',
    createdBy: 'system',
    createdAt: Date.now() - 40 * 86400000,
  },
];

// Seed Drivers in Naukot, Mithi, and Mirpurkhas
const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-naukot-1',
    userId: 'usr-drv-1',
    name: 'Ali Raza Soomro (علي رضا)',
    phone: '+92 300 2345678',
    cnic: '44101-1234567-1',
    licenseNumber: 'SINDH-MPK-88219',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    vehicleType: 'bike',
    vehicleModel: 'Honda CG 125 Red (2023)',
    vehicleNumberPlate: 'MPK-7812',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    isFemale: false,
    status: 'approved',
    currentCity: 'Naukot',
    currentLocation: { lat: 24.8600, lng: 69.2060 },
    rating: 4.9,
    totalTrips: 342,
    balancePKR: 4200,
    todayEarnings: 1850,
    weekEarnings: 9400,
    monthEarnings: 38200,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'drv-mithi-1',
    userId: 'usr-drv-2',
    name: 'Zulfiqar Ali Nohri (ذوالفقار علي)',
    phone: '+92 301 9876543',
    cnic: '44103-8765432-3',
    licenseNumber: 'SINDH-THR-99321',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    vehicleType: 'car_economy',
    vehicleModel: 'Suzuki Alto VXR White (2022)',
    vehicleNumberPlate: 'SINDH-THR 4529',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    isFemale: false,
    status: 'approved',
    currentCity: 'Mithi',
    currentLocation: { lat: 24.7420, lng: 69.8000 },
    rating: 4.8,
    totalTrips: 512,
    balancePKR: 8100,
    todayEarnings: 3400,
    weekEarnings: 15200,
    monthEarnings: 59000,
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'drv-mpk-1',
    userId: 'usr-drv-3',
    name: 'Ghulam Murtaza Khero (غلام مرتضيٰ)',
    phone: '+92 333 4567890',
    cnic: '44102-3456789-5',
    licenseNumber: 'SINDH-MPK-44102',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    vehicleType: 'car_comfort',
    vehicleModel: 'Toyota Corolla GLi Silver (Dual AC)',
    vehicleNumberPlate: 'AFG-9021',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    isFemale: false,
    status: 'approved',
    currentCity: 'Mirpurkhas',
    currentLocation: { lat: 25.5250, lng: 69.0150 },
    rating: 4.95,
    totalTrips: 840,
    balancePKR: 12500,
    todayEarnings: 4800,
    weekEarnings: 22000,
    monthEarnings: 82000,
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: 'drv-rickshaw-1',
    userId: 'usr-drv-4',
    name: 'Allah Dino Khoso (الله ڏنو)',
    phone: '+92 305 1122334',
    cnic: '44101-7788990-1',
    licenseNumber: 'SINDH-MPK-11223',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    vehicleType: 'rickshaw',
    vehicleModel: 'Sazgar 4-Stroke CNG / Petrol Auto',
    vehicleNumberPlate: 'MPK-4401',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1596707324354-9cf9446d3e8e?w=400&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    isFemale: false,
    status: 'approved',
    currentCity: 'Naukot',
    currentLocation: { lat: 24.8620, lng: 69.2100 },
    rating: 4.75,
    totalTrips: 215,
    balancePKR: 2900,
    todayEarnings: 1400,
    weekEarnings: 6800,
    monthEarnings: 26000,
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'drv-female-1',
    userId: 'usr-drv-5',
    name: 'Razia Sultana Memon (رضيه سلطانه)',
    phone: '+92 336 9988776',
    cnic: '44101-6677889-2',
    licenseNumber: 'SINDH-MPK-55443',
    licensePhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    vehicleType: 'car_economy',
    vehicleModel: 'Suzuki WagonR White (AC)',
    vehicleNumberPlate: 'KHI-6091',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    isFemale: true,
    status: 'approved',
    currentCity: 'Mirpurkhas',
    currentLocation: { lat: 25.5300, lng: 69.0100 },
    rating: 5.0,
    totalTrips: 180,
    balancePKR: 6400,
    todayEarnings: 2600,
    weekEarnings: 11500,
    monthEarnings: 45000,
    createdAt: Date.now() - 40 * 86400000,
  }
];

class SafarSindhStore {
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private autoResponderTimeout: ReturnType<typeof setTimeout> | null = null;
  private simulationIntervals: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('safarsindh_events');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SYNC') {
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this browser environment', e);
      }
      this.ensureInitialData();

      // Resume simulation if active trip was in progress
      try {
        const rides = this.getRides();
        const active = rides.find((r) => r.status === 'driver_arriving' || r.status === 'ride_started');
        if (active) {
          this.startTripSimulation(active.id);
        }
      } catch {
        // Ignore initialization error
      }
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private broadcast() {
    this.notify();
    try {
      this.broadcastChannel?.postMessage({ type: 'SYNC', timestamp: Date.now() });
    } catch {
      // Ignore broadcast errors
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private ensureInitialData() {
    if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_DRIVER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DRIVER_ID, INITIAL_DRIVERS[0].id);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FARE_CONFIGS)) {
      localStorage.setItem(STORAGE_KEYS.FARE_CONFIGS, JSON.stringify(DEFAULT_FARE_CONFIGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RIDES)) {
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVED_PLACES)) {
      localStorage.setItem(
        STORAGE_KEYS.SAVED_PLACES,
        JSON.stringify([
          { label: 'Home', location: SINDH_LOCATIONS[0] },
          { label: 'Work / Bazar', location: SINDH_LOCATIONS[1] },
        ])
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEDGER)) {
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(INITIAL_LEDGER_ENTRIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOPUPS)) {
      localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DISPUTES)) {
      localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify([]));
    }
  }

  // --- RIDES ---
  public getRides(): RideRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RIDES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getRideById(id: string): RideRequest | undefined {
    return this.getRides().find((r) => r.id === id);
  }

  public getRidesForPassenger(passengerId: string): RideRequest[] {
    return this.getRides().filter((r) => r.passengerId === passengerId);
  }

  public getActiveRideForPassenger(passengerId = 'usr-pass-1'): RideRequest | undefined {
    const rides = this.getRides();
    return rides.find(
      (r) =>
        r.passengerId === passengerId &&
        r.status !== 'completed' &&
        r.status !== 'cancelled'
    );
  }

  public getPendingRatingRide(passengerId: string): RideRequest | undefined {
    const rides = this.getRides();
    return rides.find(
      (r) =>
        r.passengerId === passengerId &&
        r.status === 'completed' &&
        !r.ratingGiven
    );
  }

  public createRideRequest(params: {
    pickup: LocationPoint;
    dropoff: LocationPoint;
    distanceKm: number;
    estimatedMinutes: number;
    vehicleType: VehicleType;
    baseRecommendedFare: number;
    passengerOffer: number;
    passengerId?: string;
    passengerName?: string;
    passengerPhone?: string;
    isWomenOnly?: boolean;
    notes?: string;
    discountPKR?: number;
    promoCode?: string;
    paymentMethod?: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'card';
  }): RideRequest {
    const rides = this.getRides();
    const newRide: RideRequest = {
      id: 'ride-' + Math.random().toString(36).substring(2, 9),
      passengerId: params.passengerId || 'usr-pass-1',
      passengerName: params.passengerName || 'Aaryan Khan',
      passengerPhone: params.passengerPhone || '+923001234567',
      passengerRating: 4.9,
      pickup: params.pickup,
      dropoff: params.dropoff,
      distanceKm: params.distanceKm,
      estimatedMinutes: params.estimatedMinutes,
      vehicleType: params.vehicleType,
      baseRecommendedFare: params.baseRecommendedFare,
      passengerOffer: Math.round(params.passengerOffer),
      status: 'requested',
      offers: [],
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      paymentMethod: params.paymentMethod || 'cash',
      paymentStatus: 'unpaid',
      discountPKR: params.discountPKR ? Math.round(params.discountPKR) : undefined,
      promoCode: params.promoCode,
      isWomenOnly: params.isWomenOnly || false,
      notes: params.notes || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    rides.unshift(newRide);
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_RIDE_ID, newRide.id);
    this.broadcast();

    // Trigger simulated nearby driver offers after 2-4 seconds to allow instant solo testing!
    this.scheduleSimulatedDriverOffers(newRide.id);

    return newRide;
  }

  private scheduleSimulatedDriverOffers(rideId: string) {
    if (this.autoResponderTimeout) {
      clearTimeout(this.autoResponderTimeout);
    }

    this.autoResponderTimeout = setTimeout(() => {
      const ride = this.getRideById(rideId);
      if (!ride || ride.status !== 'requested') return;

      const drivers = this.getDrivers().filter(
        (d) => d.status === 'approved' && d.isOnline
      );
      if (drivers.length === 0) return;

      // Select candidate matching vehicle or nearby
      const matchingDrivers = drivers.filter(
        (d) =>
          d.vehicleType === ride.vehicleType &&
          (!ride.isWomenOnly || d.isFemale)
      );
      const candidates = matchingDrivers.length > 0 ? matchingDrivers : drivers.slice(0, 2);

      candidates.forEach((driver, idx) => {
        setTimeout(() => {
          const currentRide = this.getRideById(rideId);
          if (!currentRide || currentRide.status !== 'requested') return;

          // 1 driver accepts passenger's offer exactly; another driver counter-offers +50 or +100
          const offeredPrice =
            idx === 0
              ? currentRide.passengerOffer
              : currentRide.passengerOffer + 50 * idx;

          this.addDriverOffer({
            rideId: rideId,
            driverId: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
            driverPhoto: driver.selfieUrl,
            driverRating: driver.rating,
            vehicleType: driver.vehicleType,
            vehicleModel: driver.vehicleModel,
            vehiclePlate: driver.vehicleNumberPlate,
            offeredPrice: offeredPrice,
            etaMinutes: Math.floor(3 + Math.random() * 6),
          });
        }, (idx + 1) * 2200);
      });
    }, 1500);
  }

  public addDriverOffer(params: {
    rideId: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverPhoto: string;
    driverRating: number;
    vehicleType: VehicleType;
    vehicleModel: string;
    vehiclePlate: string;
    offeredPrice: number;
    etaMinutes: number;
  }): DriverOffer | null {
    const rides = this.getRides();
    const rideIndex = rides.findIndex((r) => r.id === params.rideId);
    if (rideIndex === -1) return null;

    const ride = rides[rideIndex];
    if (ride.status !== 'requested' && ride.status !== 'offers_received') {
      return null;
    }

    // Minimum balance rule: cannot accept/offer if balance is below minDriverBalancePKR
    const balanceCheck = this.canDriverGoOnline(params.driverId);
    if (!balanceCheck.allowed) {
      return null;
    }

    // Check if driver already made an offer
    const existingOfferIndex = ride.offers.findIndex((o) => o.driverId === params.driverId);

    const offer: DriverOffer = {
      id: 'off-' + Math.random().toString(36).substring(2, 8),
      rideId: params.rideId,
      driverId: params.driverId,
      driverName: params.driverName,
      driverPhone: params.driverPhone,
      driverPhoto: params.driverPhoto,
      driverRating: params.driverRating,
      vehicleType: params.vehicleType,
      vehicleModel: params.vehicleModel,
      vehiclePlate: params.vehiclePlate,
      offeredPrice: params.offeredPrice,
      etaMinutes: params.etaMinutes,
      status: 'pending',
      createdAt: Date.now(),
    };

    if (existingOfferIndex >= 0) {
      ride.offers[existingOfferIndex] = offer;
    } else {
      ride.offers.push(offer);
    }

    ride.status = 'offers_received';
    ride.updatedAt = Date.now();
    rides[rideIndex] = ride;

    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    this.broadcast();
    return offer;
  }

  public acceptDriverOffer(rideId: string, offerId: string): boolean {
    const rides = this.getRides();
    const rideIndex = rides.findIndex((r) => r.id === rideId);
    if (rideIndex === -1) return false;

    const ride = rides[rideIndex];
    const offer = ride.offers.find((o) => o.id === offerId);
    if (!offer) return false;

    offer.status = 'accepted';
    ride.acceptedOffer = offer;
    ride.finalFare = offer.offeredPrice;
    ride.driverId = offer.driverId;
    ride.driverName = offer.driverName;
    ride.driverPhone = offer.driverPhone;
    ride.driverPhoto = offer.driverPhoto;
    ride.driverRating = offer.driverRating;
    ride.driverVehicle = offer.vehicleModel;
    ride.driverPlate = offer.vehiclePlate;
    ride.driverLocation = {
      lat: ride.pickup.lat + 0.005,
      lng: ride.pickup.lng - 0.004,
    };
    ride.status = 'driver_arriving';
    ride.updatedAt = Date.now();

    rides[rideIndex] = ride;
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    this.broadcast();

    // Start live simulation of driver arriving
    this.startTripSimulation(rideId);
    return true;
  }

  public declineOffer(rideId: string, offerId: string): boolean {
    const rides = this.getRides();
    const rideIndex = rides.findIndex((r) => r.id === rideId);
    if (rideIndex === -1) return false;

    const ride = rides[rideIndex];
    ride.offers = ride.offers.filter((o) => o.id !== offerId);
    ride.updatedAt = Date.now();
    rides[rideIndex] = ride;
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    this.broadcast();
    return true;
  }

  public updateRideStatus(
    rideId: string,
    status: RideRequest['status'],
    extras?: Partial<RideRequest>
  ): boolean {
    const rides = this.getRides();
    const rideIndex = rides.findIndex((r) => r.id === rideId);
    if (rideIndex === -1) return false;

    rides[rideIndex] = {
      ...rides[rideIndex],
      status,
      ...extras,
      updatedAt: Date.now(),
    };

    // If ride completed, compute commission & process ledger entries
    const driverId = rides[rideIndex].driverId;
    if (status === 'completed' && driverId) {
      const ride = rides[rideIndex];
      const fareAmount = Math.round(ride.finalFare || ride.passengerOffer);
      const vehicleType = ride.vehicleType || 'bike';
      const fareConfig = this.getFareConfigs()[vehicleType];
      const commissionPercent = fareConfig?.commissionPercent ?? 10;
      const commissionPKR = Math.round((fareAmount * commissionPercent) / 100);
      const driverNetPKR = fareAmount - commissionPKR;

      // Handle promo subsidy if promo discount was applied: platform reimburses driver!
      const discountPKR = ride.discountPKR ? Math.round(ride.discountPKR) : 0;
      if (discountPKR > 0) {
        this.recordLedgerEntry({
          userId: driverId,
          rideId: ride.id,
          type: 'promo_credit',
          amountPKR: discountPKR,
          reference: `${ride.id}_promo_credit`,
          notes: `Platform reimbursement for promo discount (-Rs. ${discountPKR})`,
          createdBy: 'system',
        });
      }

      // Deduct commission from driver's wallet (negative integer PKR)
      this.recordLedgerEntry({
        userId: driverId,
        rideId: ride.id,
        type: 'commission',
        amountPKR: -commissionPKR,
        reference: `${ride.id}_commission`,
        notes: `${commissionPercent}% platform commission for ride #${ride.id.slice(-6).toUpperCase()}`,
        createdBy: 'system',
      });

      // Update ride with complete financial breakdown
      rides[rideIndex].finalFare = fareAmount;
      rides[rideIndex].commissionPKR = commissionPKR;
      rides[rideIndex].driverNetPKR = driverNetPKR;
      rides[rideIndex].paymentStatus = 'paid';

      // Update driver earnings stats
      this.recordDriverEarnings(driverId, fareAmount, driverNetPKR);
      this.stopTripSimulation(rideId);
    } else if (status === 'ride_started') {
      this.startTripSimulation(rideId);
    } else if (status === 'cancelled') {
      this.stopTripSimulation(rideId);
    }

    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    this.broadcast();
    return true;
  }

  public cancelRide(
    rideId: string,
    reason: string,
    cancelledBy: 'passenger' | 'driver'
  ): boolean {
    const rides = this.getRides();
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) return false;

    // Once the trip has started (ride_started), completed or cancelled, cancel must be impossible
    if (
      ride.status === 'ride_started' ||
      ride.status === 'completed' ||
      ride.status === 'cancelled'
    ) {
      return false;
    }

    this.stopTripSimulation(rideId);

    return this.updateRideStatus(rideId, 'cancelled', {
      cancellationReason: reason,
      cancelledBy,
    });
  }

  public stopTripSimulation(rideId: string) {
    if (this.simulationIntervals.has(rideId)) {
      clearInterval(this.simulationIntervals.get(rideId));
      this.simulationIntervals.delete(rideId);
    }
  }

  public startTripSimulation(rideId: string) {
    this.stopTripSimulation(rideId);

    const rides = this.getRides();
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) return;

    if (ride.status === 'driver_arriving') {
      let step = 0;
      const totalSteps = 8;
      // Start ~1.8 km away from pickup
      const startLat = ride.pickup.lat + 0.012;
      const startLng = ride.pickup.lng - 0.009;

      const interval = setInterval(() => {
        step++;
        const currentRides = this.getRides();
        const idx = currentRides.findIndex((r) => r.id === rideId);
        if (idx === -1 || currentRides[idx].status !== 'driver_arriving') {
          this.stopTripSimulation(rideId);
          return;
        }

        const currentRide = currentRides[idx];
        const fraction = Math.min(1, step / totalSteps);
        const lat = startLat + (currentRide.pickup.lat - startLat) * fraction;
        const lng = startLng + (currentRide.pickup.lng - startLng) * fraction;
        const remainingKm = Math.max(0, Math.round((1 - fraction) * 1.8 * 10) / 10);
        const remainingMin = Math.max(1, Math.round(remainingKm * 2));

        currentRide.driverLocation = { lat, lng };
        currentRide.liveLocation = {
          lat,
          lng,
          timestamp: Date.now(),
        };
        currentRide.remainingDistanceKm = remainingKm;
        currentRide.remainingDurationMin = remainingMin;

        if (step >= totalSteps) {
          // Driver arrived at pickup!
          currentRide.status = 'arrived';
          currentRide.driverLocation = { lat: currentRide.pickup.lat, lng: currentRide.pickup.lng };
          currentRide.remainingDistanceKm = 0;
          currentRide.remainingDurationMin = 0;
          this.stopTripSimulation(rideId);
        }

        currentRides[idx] = currentRide;
        localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(currentRides));
        this.broadcast();
      }, 2500);

      this.simulationIntervals.set(rideId, interval);
    } else if (ride.status === 'ride_started') {
      let step = 0;
      const totalSteps = 16;
      const dist = ride.distanceKm || 12;
      const origin = { lat: ride.pickup.lat, lng: ride.pickup.lng };
      const dest = { lat: ride.dropoff.lat, lng: ride.dropoff.lng };

      const interval = setInterval(() => {
        step++;
        const currentRides = this.getRides();
        const idx = currentRides.findIndex((r) => r.id === rideId);
        if (idx === -1 || currentRides[idx].status !== 'ride_started') {
          this.stopTripSimulation(rideId);
          return;
        }

        const currentRide = currentRides[idx];
        const fraction = Math.min(1, step / totalSteps);

        // Road curve trajectory
        const lat = origin.lat + (dest.lat - origin.lat) * fraction;
        const lng = origin.lng + (dest.lng - origin.lng) * fraction + Math.sin(fraction * Math.PI) * 0.012;

        const remainingKm = Math.max(0, Math.round((1 - fraction) * dist * 10) / 10);
        const remainingMin = Math.max(0, Math.round(remainingKm * 1.25));

        // Simulated brief off-route drift at step 4
        if (step === 4) {
          currentRide.isOffRoute = true;
        } else if (step === 5) {
          currentRide.isOffRoute = false;
        }

        currentRide.driverLocation = { lat, lng };
        currentRide.liveLocation = {
          lat,
          lng,
          timestamp: Date.now(),
        };
        currentRide.remainingDistanceKm = remainingKm;
        currentRide.remainingDurationMin = remainingMin;

        if (!currentRide.trail) {
          currentRide.trail = [];
        }
        currentRide.trail.push({ lat, lng, timestamp: Date.now() });

        if (step >= totalSteps) {
          currentRide.driverLocation = { lat: dest.lat, lng: dest.lng };
          currentRide.remainingDistanceKm = 0;
          currentRide.remainingDurationMin = 0;
          this.stopTripSimulation(rideId);
        }

        currentRides[idx] = currentRide;
        localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(currentRides));
        this.broadcast();
      }, 2500);

      this.simulationIntervals.set(rideId, interval);
    }
  }

  public submitRating(
    rideId: string,
    ratingData: { stars: number; feedback: string; compliments: string[] }
  ): boolean {
    const rides = this.getRides();
    const rideIndex = rides.findIndex((r) => r.id === rideId);
    if (rideIndex === -1) return false;

    rides[rideIndex].ratingGiven = {
      ...ratingData,
      createdAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    this.broadcast();
    return true;
  }

  // --- DRIVERS ---
  public getDrivers(): DriverProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return data ? JSON.parse(data) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  }

  public getCurrentDriver(): DriverProfile {
    const drivers = this.getDrivers();
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_DRIVER_ID);
    const found = drivers.find((d) => d.id === id);
    return found || drivers[0];
  }

  public getDriverByUserId(userId: string): DriverProfile | undefined {
    const drivers = this.getDrivers();
    return drivers.find((d) => d.userId === userId);
  }

  public setCurrentDriverId(id: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DRIVER_ID, id);
    this.broadcast();
  }

  public toggleDriverOnline(driverId: string, isOnline: boolean): boolean {
    if (isOnline) {
      const check = this.canDriverGoOnline(driverId);
      if (!check.allowed) {
        return false;
      }
    }
    const drivers = this.getDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx !== -1) {
      drivers[idx].isOnline = isOnline;
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
      this.broadcast();
      return true;
    }
    return false;
  }

  public registerDriver(data: Omit<DriverProfile, 'id' | 'status' | 'balancePKR' | 'todayEarnings' | 'weekEarnings' | 'monthEarnings' | 'rating' | 'totalTrips' | 'createdAt'>): DriverProfile {
    const drivers = this.getDrivers();
    const newDriver: DriverProfile = {
      ...data,
      id: 'drv-' + Math.random().toString(36).substring(2, 9),
      status: 'pending', // Pending Admin review!
      rating: 5.0,
      totalTrips: 0,
      balancePKR: 500, // 500 PKR welcome bonus for fuel
      todayEarnings: 0,
      weekEarnings: 0,
      monthEarnings: 0,
      createdAt: Date.now(),
    };

    drivers.push(newDriver);
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    localStorage.setItem(STORAGE_KEYS.CURRENT_DRIVER_ID, newDriver.id);

    // Initial welcome fuel bonus recorded in ledger
    this.recordLedgerEntry({
      userId: newDriver.id,
      type: 'topup',
      amountPKR: 500,
      reference: `welcome_bonus_${newDriver.id}`,
      notes: 'SafarSindh Welcome Fuel Bonus',
      createdBy: 'system',
    });

    this.broadcast();
    return newDriver;
  }

  public updateDriverStatus(driverId: string, status: 'approved' | 'rejected', reason?: string) {
    const drivers = this.getDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx !== -1) {
      drivers[idx].status = status;
      if (reason) drivers[idx].rejectionReason = reason;
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
      this.broadcast();
    }
  }

  private recordDriverEarnings(driverId: string, _grossFare: number, netFare: number) {
    const drivers = this.getDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;

    drivers[idx].todayEarnings += netFare;
    drivers[idx].weekEarnings += netFare;
    drivers[idx].monthEarnings += netFare;
    drivers[idx].totalTrips += 1;

    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }

  // --- APPEND-ONLY LEDGER ---
  public getLedger(userId?: string): LedgerEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEDGER);
      const all: LedgerEntry[] = data ? JSON.parse(data) : INITIAL_LEDGER_ENTRIES;
      if (userId) {
        return all.filter((e) => e.userId === userId);
      }
      return all;
    } catch {
      return INITIAL_LEDGER_ENTRIES;
    }
  }

  public recordLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt' | 'balanceAfter'>): LedgerEntry | null {
    const allLedger = this.getLedger();

    // Idempotency: verify reference does not already exist
    const existing = allLedger.find((e) => e.reference === entry.reference);
    if (existing) {
      return existing;
    }

    const drivers = this.getDrivers();
    const driverIdx = drivers.findIndex((d) => d.id === entry.userId);
    if (driverIdx === -1) return null;

    const amount = Math.round(entry.amountPKR);
    const newBalance = Math.round((drivers[driverIdx].balancePKR || 0) + amount);
    drivers[driverIdx].balancePKR = newBalance;

    const newEntry: LedgerEntry = {
      ...entry,
      id: 'led-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      amountPKR: amount,
      balanceAfter: newBalance,
      createdAt: Date.now(),
    };

    allLedger.unshift(newEntry);

    // Atomic update of ledger and cached driver balance
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(allLedger));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    this.broadcast();

    return newEntry;
  }

  // --- PAYMENT SETTINGS & MINIMUM BALANCE RULE ---
  public getPaymentSettings(): PaymentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }

  public updatePaymentSettings(settings: Partial<PaymentSettings>): PaymentSettings {
    const current = this.getPaymentSettings();
    const updated: PaymentSettings = {
      ...current,
      ...settings,
      minDriverBalancePKR: settings.minDriverBalancePKR !== undefined
        ? Math.round(settings.minDriverBalancePKR)
        : current.minDriverBalancePKR,
    };

    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(updated));
    this.broadcast();
    return updated;
  }

  public canDriverGoOnline(driverId: string): { allowed: boolean; minRequired: number; currentBalance: number } {
    const drivers = this.getDrivers();
    const driver = drivers.find((d) => d.id === driverId);
    const settings = this.getPaymentSettings();
    const minRequired = settings.minDriverBalancePKR;
    const currentBalance = driver ? (driver.balancePKR || 0) : 0;

    return {
      allowed: currentBalance >= minRequired,
      minRequired,
      currentBalance,
    };
  }

  // --- TOP-UP REQUESTS & ANTI-FRAUD ---
  public getTopUpRequests(driverId?: string): TopUpRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPUPS);
      const all: TopUpRequest[] = data ? JSON.parse(data) : [];
      if (driverId) {
        return all.filter((t) => t.driverId === driverId);
      }
      return all;
    } catch {
      return [];
    }
  }

  public createTopUpRequest(params: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    amountPKR: number;
    method: 'easypaisa' | 'jazzcash' | 'bank_transfer';
    senderNumber: string;
    transactionId: string;
    screenshotUrl: string;
  }): { success: boolean; error?: string; topUp?: TopUpRequest } {
    const all = this.getTopUpRequests();
    const cleanTid = params.transactionId.trim().toLowerCase();

    // Anti-fraud Check 1: Duplicate TID across pending or approved requests
    const duplicate = all.find(
      (t) =>
        (t.status === 'pending' || t.status === 'approved') &&
        t.transactionId.trim().toLowerCase() === cleanTid
    );
    if (duplicate) {
      return {
        success: false,
        error: 'DUPLICATE_TID',
      };
    }

    // Anti-fraud Check 2: Rate limit of 5 pending top-ups per driver
    const pendingCount = all.filter(
      (t) => t.driverId === params.driverId && t.status === 'pending'
    ).length;
    if (pendingCount >= 5) {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
      };
    }

    const topUp: TopUpRequest = {
      id: 'topup-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      driverId: params.driverId,
      driverName: params.driverName,
      driverPhone: params.driverPhone,
      amountPKR: Math.round(params.amountPKR),
      method: params.method,
      senderNumber: params.senderNumber.trim(),
      transactionId: params.transactionId.trim(),
      screenshotUrl: params.screenshotUrl,
      status: 'pending',
      createdAt: Date.now(),
    };

    all.unshift(topUp);
    localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(all));
    this.broadcast();

    return { success: true, topUp };
  }

  public reviewTopUpRequest(
    topUpId: string,
    status: 'approved' | 'rejected',
    adminId: string,
    rejectionReason?: string
  ): boolean {
    const all = this.getTopUpRequests();
    const idx = all.findIndex((t) => t.id === topUpId);
    if (idx === -1) return false;

    const topUp = all[idx];
    if (topUp.status === 'approved') {
      return false; // Cannot approve twice
    }

    if (status === 'approved') {
      topUp.status = 'approved';
      topUp.reviewedBy = adminId;
      topUp.reviewedAt = Date.now();

      // Write ledger entry and credit driver's balance
      this.recordLedgerEntry({
        userId: topUp.driverId,
        type: 'topup',
        amountPKR: topUp.amountPKR,
        reference: `topup_${topUp.id}`,
        notes: `Wallet deposit via ${topUp.method.toUpperCase()} (TID: ${topUp.transactionId})`,
        createdBy: adminId,
      });
    } else {
      topUp.status = 'rejected';
      topUp.reviewedBy = adminId;
      topUp.reviewedAt = Date.now();
      topUp.rejectionReason = rejectionReason || 'Transaction could not be verified';
    }

    all[idx] = topUp;
    localStorage.setItem(STORAGE_KEYS.TOPUPS, JSON.stringify(all));
    this.broadcast();
    return true;
  }

  // --- MANUAL BALANCE ADJUSTMENT ---
  public adjustDriverBalance(
    driverId: string,
    amountPKR: number,
    reason: string,
    adminId: string
  ): LedgerEntry | null {
    if (!reason || !reason.trim()) {
      return null;
    }

    return this.recordLedgerEntry({
      userId: driverId,
      type: 'adjustment',
      amountPKR: Math.round(amountPKR),
      reference: `adj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: reason.trim(),
      createdBy: adminId,
    });
  }

  // --- DISPUTES ---
  public getDisputes(passengerId?: string): RideDispute[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISPUTES);
      const all: RideDispute[] = data ? JSON.parse(data) : [];
      if (passengerId) {
        return all.filter((d) => d.passengerId === passengerId);
      }
      return all;
    } catch {
      return [];
    }
  }

  public createDispute(params: {
    rideId: string;
    passengerId: string;
    passengerName: string;
    passengerPhone: string;
    driverId?: string;
    driverName?: string;
    farePKR: number;
    reason: 'charged_more' | 'not_to_destination' | 'other';
    notes: string;
  }): RideDispute {
    const all = this.getDisputes();
    const dispute: RideDispute = {
      id: 'disp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      ...params,
      status: 'open',
      createdAt: Date.now(),
    };

    all.unshift(dispute);
    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(all));
    this.broadcast();
    return dispute;
  }

  public resolveDispute(disputeId: string, adminNotes: string): boolean {
    const all = this.getDisputes();
    const idx = all.findIndex((d) => d.id === disputeId);
    if (idx === -1) return false;

    all[idx].status = 'resolved';
    all[idx].adminNotes = adminNotes;
    all[idx].resolvedAt = Date.now();

    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(all));
    this.broadcast();
    return true;
  }

  // --- LEDGER CSV EXPORT ---
  public exportLedgerCSV(): string {
    const ledger = this.getLedger();
    const drivers = this.getDrivers();
    const driverMap = new Map(drivers.map((d) => [d.id, d.name]));

    const headers = [
      'Entry ID',
      'Date & Time',
      'Driver ID',
      'Driver Name',
      'Ride ID',
      'Type',
      'Amount PKR',
      'Balance After PKR',
      'Reference',
      'Created By',
      'Notes',
    ];

    const rows = ledger.map((entry) => [
      entry.id,
      new Date(entry.createdAt).toISOString(),
      entry.userId,
      `"${(driverMap.get(entry.userId) || entry.userId).replace(/"/g, '""')}"`,
      entry.rideId || '',
      entry.type,
      entry.amountPKR,
      entry.balanceAfter,
      entry.reference,
      entry.createdBy,
      `"${(entry.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // --- FARE CONFIGS ---
  public getFareConfigs(): Record<VehicleType, FareConfig> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FARE_CONFIGS);
      return data ? JSON.parse(data) : DEFAULT_FARE_CONFIGS;
    } catch {
      return DEFAULT_FARE_CONFIGS;
    }
  }

  public updateFareConfig(type: VehicleType, config: Partial<FareConfig>) {
    const current = this.getFareConfigs();
    current[type] = { ...current[type], ...config };
    localStorage.setItem(STORAGE_KEYS.FARE_CONFIGS, JSON.stringify(current));
    this.broadcast();
  }

  // --- CHATS ---
  public getMessages(rideId: string): ChatMessage[] {
    try {
      const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
      return allChats[rideId] || [];
    } catch {
      return [];
    }
  }

  public sendMessage(
    rideId: string,
    senderId: string,
    senderName: string,
    senderRole: 'passenger' | 'driver',
    text: string
  ): ChatMessage {
    const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
    const msg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      rideId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: Date.now(),
    };

    if (!allChats[rideId]) allChats[rideId] = [];
    allChats[rideId].push(msg);

    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
    this.broadcast();
    return msg;
  }

  // --- ANNOUNCEMENTS ---
  public getAnnouncements(): { id: string; title: string; message: string; timestamp: number }[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : [
        {
          id: 'ann-1',
          title: 'Special Sindh Highway Route Notice',
          message: 'Naukot to Mithi bypass road is fully paved. AC Cars and Bikes get 0% commission discount this week!',
          timestamp: Date.now() - 3600000,
        }
      ];
    } catch {
      return [];
    }
  }

  public postAnnouncement(title: string, message: string) {
    const announcements = this.getAnnouncements();
    announcements.unshift({
      id: 'ann-' + Date.now(),
      title,
      message,
      timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    this.broadcast();
  }
}

export const safarStore = new SafarSindhStore();
