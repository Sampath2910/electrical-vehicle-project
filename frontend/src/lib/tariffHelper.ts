export interface KwTariffTier {
  kw: number;
  label: string;
  pricePerKwh: number;
  description: string;
}

export const KW_TARIFF_TIERS: Record<number, KwTariffTier> = {
  1: {
    kw: 1,
    label: '1 kW (Slow Eco AC)',
    pricePerKwh: 8.00,
    description: 'Off-peak slow charging baseline rate',
  },
  3.3: {
    kw: 3.3,
    label: '3.3 kW (Standard 2W AC)',
    pricePerKwh: 10.50,
    description: 'Standard 14.3A single-phase 2-wheeler charging rate',
  },
  7: {
    kw: 7,
    label: '7 kW (Fast Commercial AC)',
    pricePerKwh: 14.00,
    description: 'Accelerated high-throughput AC commercial rate',
  },
  12: {
    kw: 12,
    label: '12 kW (Rapid Booster AC)',
    pricePerKwh: 18.50,
    description: 'Premium fast booster multi-pack delivery rate',
  },
};

export function getTariffForKw(kw: number): number {
  if (KW_TARIFF_TIERS[kw]) {
    return KW_TARIFF_TIERS[kw].pricePerKwh;
  }
  if (kw <= 1.5) return 8.00;
  if (kw <= 4.0) return 10.50;
  if (kw <= 8.0) return 14.00;
  return 18.50;
}

