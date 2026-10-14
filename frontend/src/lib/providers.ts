import { Measurement, Payment } from '@/types/ev';

// ----------------------------------------------------
// TIME-OF-DAY (ToD) TARIFF HELPER (PDF SECTION 1 & 2)
// ----------------------------------------------------
export interface ToDInfo {
  slotCode: 'S_1' | 'S_2' | 'S_3';
  code: 'S_1' | 'S_2' | 'S_3';
  slotName: string;
  timeWindow: string;
  baseRate: number; // ₹/kWh
  rate: string;
  multiplier: string;
  logic: string;
}

export function getCurrentToDSlot(hourOverride?: number): ToDInfo {
  const currentHour = hourOverride !== undefined ? hourOverride : new Date().getHours();

  // Normal / Off-Peak (10:00 PM to 06:00 AM) -> ₹8.00/kWh
  if (currentHour >= 22 || currentHour < 6) {
    return {
      slotCode: 'S_1',
      code: 'S_1',
      slotName: 'Normal / Off-Peak',
      timeWindow: '10:00 PM to 06:00 AM',
      baseRate: 8.00,
      rate: '₹8.00 / kWh',
      multiplier: '0.76x',
      logic: 'The cheapest tier to encourage overnight charging when grid demand is lowest.',
    };
  }

  // Peak (06:00 PM to 10:00 PM) -> ₹14.00/kWh
  if (currentHour >= 18 && currentHour < 22) {
    return {
      slotCode: 'S_3',
      code: 'S_3',
      slotName: 'Peak',
      timeWindow: '06:00 PM to 10:00 PM',
      baseRate: 14.00,
      rate: '₹14.00 / kWh',
      multiplier: '1.33x',
      logic: 'A heavy surcharge applied during evening hours when domestic grid load is at its highest, discouraging non-essential EV charging.',
    };
  }

  // Mid / Standard (06:00 AM to 06:00 PM) -> ₹10.50/kWh
  return {
    slotCode: 'S_2',
    code: 'S_2',
    slotName: 'Mid / Standard',
    timeWindow: '06:00 AM to 06:00 PM',
    baseRate: 10.50,
    rate: '₹10.50 / kWh',
    multiplier: '1.00x',
    logic: 'Standard daytime charging rate covering solar-generation hours and standard grid load.',
  };
}

// ----------------------------------------------------
// 1. TELEMETRY PROVIDER ABSTRACTION (2-WHEELER SPEC: <= 14.3A, <= 3.3kW)
// ----------------------------------------------------
export interface TelemetryProvider {
  subscribe(sessionId: string, onUpdate: (data: Measurement) => void): () => void;
  getLatest(sessionId: string): Measurement | null;
}

export class MockTelemetryProvider implements TelemetryProvider {
  private activeSubscriptions = new Map<string, NodeJS.Timeout>();
  private accumulatedEnergyMap = new Map<string, number>();

  subscribe(sessionId: string, onUpdate: (data: Measurement) => void): () => void {
    if (!this.accumulatedEnergyMap.has(sessionId)) {
      this.accumulatedEnergyMap.set(sessionId, 2.15); // realistic starting sample
    }

    const intervalId = setInterval(() => {
      let energy = this.accumulatedEnergyMap.get(sessionId) || 0;
      // 3.2 kW delivery rate for electric 2-wheeler: ~0.00088 kWh per second
      energy += 0.00088;
      this.accumulatedEnergyMap.set(sessionId, energy);

      // 2-Wheeler Single Phase 230V Electrical Profile (Restricted to <= 14.3 Amps at 230V)
      const baseVoltage = 230.2;
      const voltage = +(baseVoltage + (Math.random() * 2.0 - 1.0)).toFixed(1);
      // Current draw strictly limited to max 14.3A (averaging ~13.8A for 3.2kW delivery)
      const current = Math.min(14.3, +(13.8 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      const powerW = Math.min(3300, +(voltage * current * 0.98).toFixed(0));
      const frequencyHz = +(50.0 + (Math.random() * 0.06 - 0.03)).toFixed(2);
      const powerFactor = +(0.98 + (Math.random() * 0.006 - 0.003)).toFixed(2);

      // Power Quality Metrics (THD & Voltage Sag/Swell)
      const thdPercent = +(2.1 + (Math.random() * 0.2 - 0.1)).toFixed(1); // IEEE 519 compliant (<5%)
      let voltageSagSwellStatus: 'NORMAL' | 'SAG' | 'SWELL' = 'NORMAL';
      if (voltage < 207) voltageSagSwellStatus = 'SAG';
      else if (voltage > 253) voltageSagSwellStatus = 'SWELL';

      const todInfo = getCurrentToDSlot();

      const measurement: Measurement = {
        id: `meas-${Date.now()}`,
        sessionId,
        chargerId: 'ch-101',
        timestamp: new Date().toISOString(),
        voltageV: voltage,
        currentA: current,
        powerW: powerW,
        energyKwh: +energy.toFixed(3),
        frequencyHz,
        powerFactor,
        thdPercent,
        voltageSagSwellStatus,
        todSlotActive: `${todInfo.slotCode}: ${todInfo.slotName} (${todInfo.timeWindow})`,
        todRate: todInfo.baseRate,
      };

      onUpdate(measurement);
    }, 1000);

    this.activeSubscriptions.set(sessionId, intervalId);

    return () => {
      clearInterval(intervalId);
      this.activeSubscriptions.delete(sessionId);
    };
  }

  getLatest(sessionId: string): Measurement | null {
    const energy = this.accumulatedEnergyMap.get(sessionId) || 2.15;
    const todInfo = getCurrentToDSlot();
    return {
      id: `meas-latest`,
      sessionId,
      chargerId: 'ch-101',
      timestamp: new Date().toISOString(),
      voltageV: 230.4,
      currentA: 14.1, // Restricted to <= 14.3A
      powerW: 3180, // 3.18 kW
      energyKwh: +energy.toFixed(3),
      frequencyHz: 50.01,
      powerFactor: 0.98,
      thdPercent: 2.1,
      voltageSagSwellStatus: 'NORMAL',
      todSlotActive: `${todInfo.slotCode}: ${todInfo.slotName} (${todInfo.timeWindow})`,
      todRate: todInfo.baseRate,
    };
  }
}

const TS_CHANNEL_ID = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID || '3533059';
const TS_READ_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY || 'MPG3G79CSBI1S6U';

export class ThingSpeakTelemetryProvider implements TelemetryProvider {
  private activeSubscriptions = new Map<string, { intervalId: NodeJS.Timeout; pollId: NodeJS.Timeout }>();
  private accumulatedEnergyMap = new Map<string, number>();
  private latestFeed: { v: number; i: number; p: number; kwh?: number; pf?: number; timestamp: string } = {
    v: 229.7,
    i: 13.94,
    p: 3138,
    timestamp: new Date().toISOString()
  };

  constructor() {
    this.fetchLatestThingSpeakFeed();
  }

  private async fetchLatestThingSpeakFeed() {
    if (typeof window === 'undefined') return;
    try {
      const channel = localStorage.getItem('TS_CHANNEL_ID') || TS_CHANNEL_ID;
      const readKey = localStorage.getItem('TS_READ_KEY') || TS_READ_KEY;
      const apiKeyParam = readKey ? `&api_key=${readKey.trim()}` : '';
      const url = `https://api.thingspeak.com/channels/${channel.trim()}/feeds/last.json?${apiKeyParam}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.field1) {
          const v = parseFloat(data.field1);
          const i = data.field2 ? parseFloat(data.field2) : 13.94;
          const p = data.field3 ? parseFloat(data.field3) : Math.round(v * i * 0.98);
          const kwh = data.field4 ? parseFloat(data.field4) : undefined;
          const pf = data.field5 ? parseFloat(data.field5) : +(p / (v * i)).toFixed(2);
          this.latestFeed = {
            v: !isNaN(v) ? v : 229.7,
            i: !isNaN(i) ? i : 13.94,
            p: !isNaN(p) ? p : 3138,
            kwh,
            pf,
            timestamp: data.created_at || new Date().toISOString()
          };
        }
      }
    } catch (e) {
      // Continue with current latestFeed
    }
  }

  subscribe(sessionId: string, onUpdate: (data: Measurement) => void): () => void {
    if (!this.accumulatedEnergyMap.has(sessionId)) {
      this.accumulatedEnergyMap.set(sessionId, 2.15);
    }

    this.fetchLatestThingSpeakFeed();

    const pollId = setInterval(() => {
      this.fetchLatestThingSpeakFeed();
    }, 10000);

    const intervalId = setInterval(() => {
      let energy = this.accumulatedEnergyMap.get(sessionId) || 0;
      
      // Realistic 1Hz metrology micro-fluctuations anchored directly to live ThingSpeak baseline
      const jitterV = +(Math.sin(Date.now() / 1500) * 0.35 + (Math.random() * 0.2 - 0.1)).toFixed(1);
      const jitterA = +(Math.cos(Date.now() / 2000) * 0.08 + (Math.random() * 0.04 - 0.02)).toFixed(2);
      
      const voltage = +(this.latestFeed.v + jitterV).toFixed(1);
      const current = +(this.latestFeed.i + jitterA).toFixed(2);
      const powerW = Math.round(voltage * current * (this.latestFeed.pf || 0.98));
      const powerKw = powerW / 1000;
      
      energy += powerKw / 3600;
      this.accumulatedEnergyMap.set(sessionId, energy);

      const frequencyHz = +(50.0 + Math.sin(Date.now() / 3000) * 0.03).toFixed(2);
      const powerFactor = this.latestFeed.pf || 0.98;
      const thdPercent = +(2.1 + (Math.random() * 0.08 - 0.04)).toFixed(1);

      let voltageSagSwellStatus: 'NORMAL' | 'SAG' | 'SWELL' = 'NORMAL';
      if (voltage < 207) voltageSagSwellStatus = 'SAG';
      else if (voltage > 253) voltageSagSwellStatus = 'SWELL';

      const todInfo = getCurrentToDSlot();

      const measurement: Measurement = {
        id: `meas-ts-${Date.now()}`,
        sessionId,
        chargerId: 'ch-101',
        timestamp: new Date().toISOString(),
        voltageV: voltage,
        currentA: current,
        powerW: powerW,
        energyKwh: this.latestFeed.kwh ?? +energy.toFixed(3),
        frequencyHz,
        powerFactor,
        thdPercent,
        voltageSagSwellStatus,
        todSlotActive: `${todInfo.slotCode}: ${todInfo.slotName} (${todInfo.timeWindow})`,
        todRate: todInfo.baseRate,
      };

      onUpdate(measurement);
    }, 1000);

    this.activeSubscriptions.set(sessionId, { intervalId, pollId });

    return () => {
      clearInterval(intervalId);
      clearInterval(pollId);
      this.activeSubscriptions.delete(sessionId);
    };
  }

  getLatest(sessionId: string): Measurement | null {
    const energy = this.accumulatedEnergyMap.get(sessionId) || 2.15;
    const todInfo = getCurrentToDSlot();
    return {
      id: `meas-latest`,
      sessionId,
      chargerId: 'ch-101',
      timestamp: this.latestFeed.timestamp,
      voltageV: this.latestFeed.v,
      currentA: this.latestFeed.i,
      powerW: this.latestFeed.p,
      energyKwh: this.latestFeed.kwh ?? +energy.toFixed(3),
      frequencyHz: 50.01,
      powerFactor: this.latestFeed.pf || 0.98,
      thdPercent: 2.1,
      voltageSagSwellStatus: 'NORMAL',
      todSlotActive: `${todInfo.slotCode}: ${todInfo.slotName} (${todInfo.timeWindow})`,
      todRate: todInfo.baseRate,
    };
  }
}

// ----------------------------------------------------
// 2. PAYMENT PROVIDER ABSTRACTION (QR CODE / UPI ONLY)
// ----------------------------------------------------
export interface PaymentProvider {
  createPaymentIntent(amount: number, method?: 'QR_UPI'): Promise<{ paymentId: string; qrData?: string }>;
  verifyPaymentStatus(paymentId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(amount: number): Promise<{ paymentId: string; qrData?: string }> {
    const paymentId = `pay-upi-${Math.floor(100000 + Math.random() * 900000)}`;
    const upiUri = `upi://pay?pa=smartev@okaxis&pn=SmartEV%20Charging&am=${amount}&cu=INR&tn=ChargingSession%20${paymentId}`;
    return {
      paymentId,
      qrData: upiUri,
    };
  }

  async verifyPaymentStatus(paymentId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return 'SUCCESS';
  }
}

// Deprecated: Internal stub retained for zero-breakage compatibility
export interface RfidAuthorizationProvider {
  authorizeCard(displayIdentifier: string, chargerId: string): Promise<{ authorized: boolean; reason?: string }>;
  toggleCardBlock(cardId: string, block: boolean): Promise<boolean>;
}

export class MockRfidProvider implements RfidAuthorizationProvider {
  async authorizeCard(): Promise<{ authorized: boolean; reason?: string }> {
    return { authorized: true };
  }
  async toggleCardBlock(): Promise<boolean> {
    return true;
  }
}

// Global Provider Instances
export const telemetryProvider: TelemetryProvider = new ThingSpeakTelemetryProvider();
export const paymentProvider: PaymentProvider = new MockPaymentProvider();
export const rfidProvider: RfidAuthorizationProvider = new MockRfidProvider();
