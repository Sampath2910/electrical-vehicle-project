import fs from 'fs';
import path from 'path';
import { User, Charger, ChargingSession } from '@/types/ev';

export interface DatabaseSchema {
  users: (User & { passwordHash?: string })[];
  chargers: Charger[];
  sessions: ChargingSession[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'admin-001',
      name: 'Fleet System Admin',
      email: 'admin@smartev.com',
      phone: '+91 90000 00000',
      role: 'ADMIN',
      passwordHash: 'admin123',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-op-101',
      name: 'Ramesh Kumar',
      email: 'operator1@kletech.ac.in',
      phone: '+91 98765 11111',
      role: 'OPERATOR',
      passwordHash: 'operator123',
      assignedStationId: 'ch-101',
      operatorBadgeId: 'KLE-OP-101',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      createdAt: '2024-11-10T10:00:00Z',
    },
    {
      id: 'user-op-102',
      name: 'Pooja Patil',
      email: 'operator2@kletech.ac.in',
      phone: '+91 98765 22222',
      role: 'OPERATOR',
      passwordHash: 'operator123',
      assignedStationId: 'ch-102',
      operatorBadgeId: 'KLE-OP-102',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      createdAt: '2024-11-15T10:00:00Z',
    },
    {
      id: 'user-drv-001',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+91 98765 43210',
      role: 'USER',
      passwordHash: 'password123',
      vehicleModel: 'Ather 450X (3.7 kWh)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: '2025-01-15T08:30:00Z',
    },
  ],
  chargers: [
    {
      id: 'ch-101',
      chargerCode: 'KLETECH-STATION-1',
      name: 'KLETECH EV Station 1',
      location: 'KLETECH Campus Engineering Zone, Station 1',
      latitude: 12.8452,
      longitude: 77.6602,
      powerRating: 3.3,
      connectorType: 'IEC 60309 (Industrial 3-pin)',
      status: 'AVAILABLE',
      pricePerKwh: 10.50,
      lastSeenAt: new Date().toISOString(),
      maxCurrentA: 14.3,
      voltageV: 230,
      firmwareVersion: 'v3.2.0-esp32-pzem',
      assignedOperatorId: 'user-op-101',
      assignedOperatorName: 'Ramesh Kumar (KLE-OP-101)',
      totalEarnedRevenue: 3450.00,
      totalEnergyConsumedKwh: 328.50,
    },
    {
      id: 'ch-102',
      chargerCode: 'KLETECH-STATION-2',
      name: 'KLETECH EV Station 2',
      location: 'KLETECH Campus Emergency EV Zone, Station 2',
      latitude: 12.8455,
      longitude: 77.6605,
      powerRating: 3.3,
      connectorType: 'Standard 16A Socket',
      status: 'AVAILABLE',
      pricePerKwh: 18.50,
      lastSeenAt: new Date().toISOString(),
      maxCurrentA: 14.3,
      voltageV: 230,
      firmwareVersion: 'v3.2.0-esp32-pzem',
      isPriorityBay: true,
      assignedOperatorId: 'user-op-102',
      assignedOperatorName: 'Pooja Patil (KLE-OP-102)',
      totalEarnedRevenue: 4920.00,
      totalEnergyConsumedKwh: 266.00,
    },
    {
      id: 'ch-103',
      chargerCode: 'BSS-METRO-003',
      name: 'Metro Station Battery Swapping Hub (BSS)',
      location: 'Indiranagar Metro 2-Wheeler Parking, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      powerRating: 3.3,
      connectorType: 'BSS Swappable Dock',
      status: 'AVAILABLE',
      pricePerKwh: 10.50,
      lastSeenAt: new Date().toISOString(),
      maxCurrentA: 14.3,
      voltageV: 230,
      firmwareVersion: 'v3.1.0-esp32',
      stationType: 'BATTERY_SWAP_STATION',
      availableBatteries: 14,
      totalBatterySlots: 16,
      assignedOperatorId: undefined,
      assignedOperatorName: 'Unassigned',
      totalEarnedRevenue: 1890.00,
      totalEnergyConsumedKwh: 180.00,
    },
    {
      id: 'ch-104',
      chargerCode: 'CH-2W-004',
      name: 'TechPark 2-Wheeler Smart Socket Point',
      location: 'Building 4, Electronic City Phase 1, Bengaluru',
      latitude: 12.8460,
      longitude: 77.6610,
      powerRating: 3.3,
      connectorType: 'Standard 16A Socket',
      status: 'AVAILABLE',
      pricePerKwh: 10.50,
      lastSeenAt: new Date().toISOString(),
      maxCurrentA: 14.3,
      voltageV: 230,
      firmwareVersion: 'v3.0.0-esp32',
      stationType: 'PLUG_CHARGER',
      assignedOperatorId: undefined,
      assignedOperatorName: 'Unassigned',
      totalEarnedRevenue: 1250.00,
      totalEnergyConsumedKwh: 119.00,
    },
    {
      id: 'ch-105',
      chargerCode: 'CH-2W-005',
      name: 'Koramangala LEV AC Commuter Hub',
      location: '5th Block Social Hub 2-Wheeler Bay, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      powerRating: 3.3,
      connectorType: 'LEV AC (IS 17017)',
      status: 'AVAILABLE',
      pricePerKwh: 10.50,
      lastSeenAt: new Date().toISOString(),
      maxCurrentA: 14.3,
      voltageV: 230,
      firmwareVersion: 'v3.1.2-esp32',
      stationType: 'PLUG_CHARGER',
      assignedOperatorId: undefined,
      assignedOperatorName: 'Unassigned',
      totalEarnedRevenue: 980.00,
      totalEnergyConsumedKwh: 93.30,
    },
  ],
  sessions: [
    {
      id: 'sess-801',
      sessionCode: 'SES-KLE-01-801',
      chargerId: 'ch-101',
      chargerName: 'KLETECH EV Station 1',
      chargerLocation: 'KLETECH Campus Engineering Zone, Station 1',
      userId: 'user-drv-001',
      status: 'COMPLETED',
      startTime: '2026-10-09T08:00:00Z',
      endTime: '2026-10-09T09:15:00Z',
      durationSeconds: 4500,
      tariffRate: 10.50,
      energyKwh: 3.12,
      estimatedCost: 37.76,
      finalCost: 37.76,
      paymentStatus: 'SUCCESS',
      vehicleName: 'Ather 450X',
    },
    {
      id: 'sess-802',
      sessionCode: 'SES-KLE-02-802',
      chargerId: 'ch-102',
      chargerName: 'KLETECH EV Station 2',
      chargerLocation: 'KLETECH Campus Emergency EV Zone, Station 2',
      userId: 'user-drv-001',
      status: 'COMPLETED',
      startTime: '2026-10-09T14:30:00Z',
      endTime: '2026-10-09T15:45:00Z',
      durationSeconds: 4500,
      tariffRate: 18.50,
      energyKwh: 2.85,
      estimatedCost: 62.22,
      finalCost: 62.22,
      paymentStatus: 'SUCCESS',
      vehicleName: 'Ola S1 Pro',
    },
  ],
};

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Fallback to in-memory store:', err);
    return INITIAL_DATA;
  }
}

function saveDbFile(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error persisting to db.json:', err);
  }
}

export const db = {
  // USERS
  getUsers: (): User[] => {
    const data = ensureDbFile();
    return data.users.map(({ passwordHash, ...user }) => user as User);
  },

  getUserByEmail: (email: string) => {
    const data = ensureDbFile();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById: (id: string) => {
    const data = ensureDbFile();
    return data.users.find(u => u.id === id);
  },

  createUser: (user: Partial<User> & { password: string }): User => {
    const data = ensureDbFile();
    const existing = data.users.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: user.name || 'Anonymous User',
      email: user.email!,
      phone: user.phone || '+91 00000 00000',
      role: user.role || 'USER',
      passwordHash: user.password,
      assignedStationId: user.assignedStationId,
      operatorBadgeId: user.operatorBadgeId,
      vehicleModel: user.vehicleModel,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);

    // If operator and station assigned, update charger's assignedOperator
    if (newUser.role === 'OPERATOR' && newUser.assignedStationId) {
      const charger = data.chargers.find(c => c.id === newUser.assignedStationId);
      if (charger) {
        charger.assignedOperatorId = newUser.id;
        charger.assignedOperatorName = `${newUser.name} (${newUser.operatorBadgeId || 'OP'})`;
      }
    }

    saveDbFile(data);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser as User;
  },

  // CHARGERS / STATIONS
  getChargers: (): Charger[] => {
    const data = ensureDbFile();
    return data.chargers;
  },

  getChargerById: (id: string): Charger | undefined => {
    const data = ensureDbFile();
    return data.chargers.find(c => c.id === id);
  },

  updateChargerStatus: (id: string, status: Charger['status']): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === id);
    if (!charger) return null;
    charger.status = status;
    charger.lastSeenAt = new Date().toISOString();
    saveDbFile(data);
    return charger;
  },

  updateChargerRating: (id: string, rating: number): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === id);
    if (!charger) return null;
    charger.powerRating = rating;
    charger.lastSeenAt = new Date().toISOString();
    saveDbFile(data);
    return charger;
  },

  assignOperatorToStation: (stationId: string, operatorId: string): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === stationId);
    const operator = data.users.find(u => u.id === operatorId);
    if (!charger || !operator) return null;

    charger.assignedOperatorId = operator.id;
    charger.assignedOperatorName = `${operator.name} (${operator.operatorBadgeId || 'OP'})`;
    operator.assignedStationId = stationId;

    saveDbFile(data);
    return charger;
  },

  // STATS FOR OPERATOR (STRICTLY SCOPED TO ASSIGNED STATION)
  getOperatorStats: (operatorIdOrStationId: string) => {
    const data = ensureDbFile();
    // Resolve station
    let charger = data.chargers.find(c => c.id === operatorIdOrStationId);
    if (!charger) {
      charger = data.chargers.find(c => c.assignedOperatorId === operatorIdOrStationId);
    }

    if (!charger) {
      return null;
    }

    const stationSessions = data.sessions.filter(s => s.chargerId === charger!.id);
    const totalEarnedRevenue = charger.totalEarnedRevenue ?? 0;
    const totalEnergyConsumedKwh = charger.totalEnergyConsumedKwh ?? 0;

    return {
      station: charger,
      stats: {
        stationId: charger.id,
        stationName: charger.name,
        stationCode: charger.chargerCode,
        status: charger.status,
        powerRating: charger.powerRating,
        pricePerKwh: charger.pricePerKwh,
        totalEarnedRevenue,
        totalEnergyConsumedKwh,
        completedSessionsCount: stationSessions.length,
        assignedOperatorName: charger.assignedOperatorName,
        assignedOperatorId: charger.assignedOperatorId,
      },
      recentSessions: stationSessions.slice(-10),
    };
  },

  // STATS FOR ADMIN (GLOBAL AGGREGATION ACROSS ALL STATIONS)
  getAdminStats: () => {
    const data = ensureDbFile();
    const totalFleetRevenue = data.chargers.reduce((acc, c) => acc + (c.totalEarnedRevenue ?? 0), 0);
    const totalFleetEnergyKwh = data.chargers.reduce((acc, c) => acc + (c.totalEnergyConsumedKwh ?? 0), 0);
    const totalStations = data.chargers.length;
    const availableStations = data.chargers.filter(c => c.status === 'AVAILABLE').length;
    const chargingStations = data.chargers.filter(c => c.status === 'CHARGING').length;
    const faultStations = data.chargers.filter(c => c.status === 'FAULT' || c.status === 'OFFLINE').length;
    const totalOperators = data.users.filter(u => u.role === 'OPERATOR').length;

    return {
      totalFleetRevenue,
      totalFleetEnergyKwh,
      totalStations,
      availableStations,
      chargingStations,
      faultStations,
      totalOperators,
      stations: data.chargers.map(c => ({
        id: c.id,
        code: c.chargerCode,
        name: c.name,
        location: c.location,
        status: c.status,
        powerRating: c.powerRating,
        pricePerKwh: c.pricePerKwh,
        assignedOperatorName: c.assignedOperatorName || 'Unassigned',
        assignedOperatorId: c.assignedOperatorId,
        stationRevenue: c.totalEarnedRevenue ?? 0,
        stationEnergyKwh: c.totalEnergyConsumedKwh ?? 0,
      })),
      operators: data.users.filter(u => u.role === 'OPERATOR').map(({ passwordHash, ...op }) => op),
    };
  },

  // SESSION & PAYMENT RECORDING
  recordSessionPayment: (chargerId: string, finalCost: number, energyKwh: number) => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === chargerId);
    if (charger) {
      charger.totalEarnedRevenue = (charger.totalEarnedRevenue ?? 0) + finalCost;
      charger.totalEnergyConsumedKwh = (charger.totalEnergyConsumedKwh ?? 0) + energyKwh;
      saveDbFile(data);
    }
  },
};
