export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  assignedStationId?: string; // Station ID assigned to this operator (e.g. ch-101 or ch-102)
  operatorBadgeId?: string; // Employee/Operator Badge ID
  vehicleModel?: string; // EV vehicle model for drivers
}

export type ChargerStatus = 
  | 'AVAILABLE' 
  | 'PREPARING' 
  | 'CONNECTED' 
  | 'CHARGING' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'FAULT' 
  | 'OFFLINE' 
  | 'MAINTENANCE';

export type TwoWheelerConnector = 
  | 'IEC 60309 (Industrial 3-pin)'
  | 'Standard 16A Socket'
  | 'LEV AC (IS 17017)'
  | 'BSS Swappable Dock'
  | 'Ather Grid / LEV DC'
  | 'IEC 60309'
  | '15A Smart Plug';

export interface Charger {
  id: string;
  chargerCode: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  powerRating: number; // in kW (0.5 to 3.3 kW for 2-wheelers)
  connectorType: TwoWheelerConnector;
  status: ChargerStatus;
  pricePerKwh: number;
  lastSeenAt: string;
  maxCurrentA: number; // e.g., 14.3A max for 3.3kW single-phase 230V
  voltageV: number; // 230V single phase
  firmwareVersion: string;
  stationType?: 'PLUG_CHARGER' | 'BATTERY_SWAP_STATION';
  availableBatteries?: number;
  totalBatterySlots?: number;
  isPriorityBay?: boolean; // Section 2 Priority Preemption / VIP bay
  assignedOperatorId?: string; // Bound Operator User ID
  assignedOperatorName?: string; // Display name of assigned operator
  totalEarnedRevenue?: number; // Total ₹ collected specifically by this station
  totalEnergyConsumedKwh?: number; // Total kWh metered specifically by this station
}

export type SessionStatus = 
  | 'CREATED' 
  | 'AUTHORIZED' 
  | 'STARTED' 
  | 'CHARGING' 
  | 'STOPPING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface Measurement {
  id: string;
  sessionId: string;
  chargerId: string;
  timestamp: string;
  voltageV: number; // ~230V AC
  currentA: number; // restricted to <= 14.3A for 3.3kW
  powerW: number; // <= 3300W
  energyKwh: number;
  frequencyHz: number;
  powerFactor: number; // ~0.98
  thdPercent: number; // Total Harmonic Distortion e.g. ~2.1% (<5% IEEE 519)
  voltageSagSwellStatus: 'NORMAL' | 'SAG' | 'SWELL';
  todSlotActive: string; // e.g. "S_2: Standard (06:00 AM - 06:00 PM)"
  todRate: number; // in INR per kWh
}

export interface ChargingSession {
  id: string;
  sessionCode: string;
  userId: string;
  chargerId: string;
  chargerName: string;
  chargerLocation: string;
  vehicleId?: string;
  vehicleName?: string;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  energyKwh: number;
  durationSeconds: number;
  tariffRate: number; // Tariff snapshot
  estimatedCost: number;
  finalCost?: number;
  serviceFee?: number; // ₹5.00
  gstAmount?: number; // 18% GST
  penaltyAmount?: number; // ₹500 if emergency preemption not yielded
  penaltyFee?: number; // alias for penaltyAmount
  vehicleModel?: string; // vehicle model string e.g. "Ather 450X"
  todSlotActive?: string;
  maxCurrentA?: number; // To prove power quality stability
  avgVoltageV?: number;
  isPriorityBay?: boolean;
  evictionTriggered?: boolean;
  paymentMethod?: 'QR_UPI';
  paymentStatus?: 'PENDING' | 'AUTHORIZED' | 'SUCCESS' | 'FAILED';
}

export interface Tariff {
  id: string;
  name: string;
  slotCode: 'S_1' | 'S_2' | 'S_3' | 'S_VIP';
  slotName: string; // e.g. "Normal / Off-Peak", "Mid / Standard", "Peak"
  timeWindow: string; // e.g. "10:00 PM to 06:00 AM"
  pricePerKwh: number; // ₹8.00, ₹10.50, ₹14.00, or Current ToD + ₹8.00
  effectiveFrom: string;
  effectiveTo?: string;
  logic: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Bill {
  id: string;
  billNumber: string;
  sessionId: string;
  userId: string;
  chargerName: string;
  energyKwh: number;
  tariffRate: number;
  subtotal: number; // (Energy * ToD Rate)
  energyCost?: number; // alias for subtotal
  serviceFee: number; // Fixed ₹5.00
  tax: number; // 18% GST on (Energy * Rate + Service Fee)
  gstAmount?: number; // alias for tax
  penaltyAmount?: number; // ₹500 if emergency vehicle eviction ignored
  penaltyFee?: number; // alias for penaltyAmount
  maxCurrentA?: number; // Section 6 audit log
  avgVoltageV?: number; // Section 6 audit log
  totalAmount: number; // Subtotal + Service Fee + 18% GST (+ Penalty)
  todSlotActive: string;
  status: 'UNPAID' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  issuedAt: string;
  paidAt?: string;
}

export interface Payment {
  id: string;
  paymentReference: string;
  userId: string;
  sessionId?: string;
  billId?: string;
  method: 'QR_UPI';
  provider: 'MOCK_UPI' | 'RAZORPAY' | 'STRIPE';
  providerReference?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'AUTHORIZED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  reference: string;
  description: string;
  sessionId?: string;
  createdAt: string;
}

// Deprecated: Kept only for internal store compatibility, removed from UI
export interface RfidCard {
  id: string;
  userId: string;
  displayIdentifier: string;
  status: 'ACTIVE' | 'BLOCKED';
  lastUsedAt?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  model: string; // e.g. "Ather 450X (3.7 kWh)", "Ola S1 Pro (4 kWh)", "TVS iQube (3.4 kWh)"
  registration: string;
  connectorType: TwoWheelerConnector;
  batteryCapacityKwh: number; // e.g. 3.7, 4.0, 3.4
  createdAt: string;
  vehicleType?: 'MOTORCYCLE' | 'SCOOTER' | 'DELIVERY_BIKE';
  ridingRangeKm?: number;
  isBatterySwappable?: boolean;
  ridingModes?: { eco: number; ride: number; sport: number; warp?: number };
  imageUrl?: string;
}

export interface Fault {
  id: string;
  chargerId: string;
  chargerName: string;
  sessionId?: string;
  faultCode: string;
  faultType: 'CRITICAL' | 'WARNING' | 'INFO';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  occurredAt: string;
  clearedAt?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'CHARGING_STARTED' | 'CHARGING_COMPLETED' | 'PAYMENT_SUCCESS' | 'FAULT_ALERT' | 'WALLET_LOW' | 'EMERGENCY_PREEMPTION';
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
}
