export type UserRole = 'passenger' | 'driver' | 'admin';

export type Language = 'en' | 'ur' | 'sd';

export type VehicleType = 'bike' | 'rickshaw' | 'car_economy' | 'car_comfort';

export interface LocationPoint {
  id?: string;
  name: string;
  city: 'Naukot' | 'Mithi' | 'Mirpurkhas' | 'Diplo' | 'Islamkot' | 'Kunri' | 'Jhuddo' | 'Digri';
  address: string;
  lat: number;
  lng: number;
  popular?: boolean;
}

export interface DriverOffer {
  id: string;
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
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export type RideStatus = 
  | 'requested'        // Passenger posted ride
  | 'offers_received'  // Drivers made counter/accept offers
  | 'driver_selected'  // Passenger chose a driver
  | 'driver_arriving'  // Driver is on the way to pickup
  | 'arrived'          // Driver arrived at pickup
  | 'ride_started'     // Trip currently on the way
  | 'completed'        // Dropped off and payment done
  | 'cancelled';       // Cancelled by passenger or driver

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerPhoto?: string;
  passengerRating: number;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  distanceKm: number;
  estimatedMinutes: number;
  vehicleType: VehicleType;
  baseRecommendedFare: number;
  passengerOffer: number;
  finalFare?: number;
  status: RideStatus;
  offers: DriverOffer[];
  acceptedOffer?: DriverOffer;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  driverRating?: number;
  driverPlate?: string;
  driverVehicle?: string;
  driverLocation?: { lat: number; lng: number };
  liveLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
    timestamp: number;
  };
  trail?: Array<{ lat: number; lng: number; timestamp: number }>;
  shareToken?: string;
  approximateRoute?: boolean;
  routePolyline?: Array<{ lat: number; lng: number }>;
  remainingDistanceKm?: number;
  remainingDurationMin?: number;
  isOffRoute?: boolean;
  otp: string;
  paymentMethod: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'card';
  paymentStatus: 'unpaid' | 'paid';
  commissionPKR?: number;
  driverNetPKR?: number;
  discountPKR?: number;
  promoCode?: string;
  receiptShared?: boolean;
  isWomenOnly?: boolean;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: 'passenger' | 'driver';
  createdAt: number;
  updatedAt: number;
  ratingGiven?: {
    stars: number;
    feedback: string;
    compliments: string[];
    createdAt: number;
  };
}

export type LedgerEntryType =
  | 'commission'    // Negative integer PKR
  | 'topup'         // Positive integer PKR
  | 'adjustment'    // Positive or Negative integer PKR
  | 'promo_credit'  // Positive integer PKR
  | 'online_fare'   // Positive integer PKR (Phase 2)
  | 'payout'        // Negative integer PKR (Phase 2)
  | 'refund';       // Reversal integer PKR (Phase 2)

export interface LedgerEntry {
  id: string;
  userId: string;       // driver's ID / UID
  rideId?: string;
  type: LedgerEntryType;
  amountPKR: number;    // integer PKR (positive or negative)
  balanceAfter: number; // integer PKR cached balance after entry
  reference: string;    // unique idempotency key (e.g. `${rideId}_commission`)
  notes?: string;
  createdBy: string;    // 'system' | admin ID | driver ID
  createdAt: number;
}

export type TopUpStatus = 'pending' | 'approved' | 'rejected';

export interface TopUpRequest {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  amountPKR: number;
  method: 'easypaisa' | 'jazzcash' | 'bank_transfer';
  senderNumber: string;
  transactionId: string; // TID
  screenshotUrl: string; // Base64 data URL or storage URL
  status: TopUpStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectionReason?: string;
  createdAt: number;
}

export interface CompanyPaymentAccount {
  id: string;
  method: 'easypaisa' | 'jazzcash' | 'bank_transfer';
  title: string;
  accountNumber: string;
  bankName?: string;
  qrImageUrl?: string;
  instructions?: string;
  isActive: boolean;
}

export interface PaymentSettings {
  minDriverBalancePKR: number;
  accounts: CompanyPaymentAccount[];
  enableOnlinePayments: boolean;
}

export type DisputeReason = 'charged_more' | 'not_to_destination' | 'other';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface RideDispute {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  driverName?: string;
  farePKR: number;
  reason: DisputeReason;
  notes: string;
  status: DisputeStatus;
  adminNotes?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  cnic: string;
  licenseNumber: string;
  licensePhotoUrl: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleNumberPlate: string;
  vehiclePhotoUrl: string;
  selfieUrl: string;
  isOnline: boolean;
  isFemale: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  currentCity: string;
  currentLocation: { lat: number; lng: number };
  rating: number;
  totalTrips: number;
  balancePKR: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  createdAt: number;
}

export interface FareConfig {
  vehicleType: VehicleType;
  displayName: string;
  baseFare: number;
  perKmRate: number;
  minimumFare: number;
  commissionPercent: number;
  capacity: number;
  icon: string;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  senderRole: 'passenger' | 'driver';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  phone: string; // Normalized (+923001234567)
  role: UserRole;
  passwordHash?: string;
  emergencyContact?: string;
  createdAt: number;
}

export interface PromoCode {
  code: string;
  discountPKR: number;
  minFarePKR: number;
  description: string;
}
