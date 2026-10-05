import { FareConfig, VehicleType } from '../types';

export const DEFAULT_FARE_CONFIGS: Record<VehicleType, FareConfig> = {
  bike: {
    vehicleType: 'bike',
    displayName: 'Bike (موٽرسائيڪل)',
    baseFare: 60,
    perKmRate: 20,
    minimumFare: 80,
    commissionPercent: 8,
    capacity: 1,
    icon: 'Bike',
  },
  rickshaw: {
    vehicleType: 'rickshaw',
    displayName: 'Rickshaw (رڪشا)',
    baseFare: 90,
    perKmRate: 28,
    minimumFare: 120,
    commissionPercent: 10,
    capacity: 3,
    icon: 'Navigation',
  },
  car_economy: {
    vehicleType: 'car_economy',
    displayName: 'Car Economy (گاڏي - اڪانومي)',
    baseFare: 180,
    perKmRate: 45,
    minimumFare: 250,
    commissionPercent: 12,
    capacity: 4,
    icon: 'Car',
  },
  car_comfort: {
    vehicleType: 'car_comfort',
    displayName: 'Car Comfort AC (اي سي گاڏي)',
    baseFare: 280,
    perKmRate: 65,
    minimumFare: 400,
    commissionPercent: 15,
    capacity: 4,
    icon: 'Sparkles',
  },
};

export function calculateEstimatedFare(
  vehicleType: VehicleType,
  distanceKm: number,
  customConfig?: FareConfig
): number {
  const config = customConfig || DEFAULT_FARE_CONFIGS[vehicleType];
  const calculated = config.baseFare + distanceKm * config.perKmRate;
  // Round to nearest 10 PKR for clean cash handling in Pakistan
  return Math.max(config.minimumFare, Math.ceil(calculated / 10) * 10);
}
