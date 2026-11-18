import fs from 'fs';
import path from 'path';
import { User, Charger, ChargingSession, Wallet, WalletTransaction, Vehicle, Bill } from '@/types/ev';

export interface DatabaseSchema {
  users: (User & { passwordHash?: string })[];
  chargers: Charger[];
  sessions: ChargingSession[];
  wallets?: Record<string, Wallet>;
  walletTransactions?: WalletTransaction[];
  vehicles?: Vehicle[];
  bills?: Bill[];
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
      totalEarnedRevenue: 0,
      totalEnergyConsumedKwh: 0,
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
      totalEarnedRevenue: 0,
      totalEnergyConsumedKwh: 0,
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
      totalEarnedRevenue: 0,
      totalEnergyConsumedKwh: 0,
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
      totalEarnedRevenue: 0,
      totalEnergyConsumedKwh: 0,
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
      totalEarnedRevenue: 0,
      totalEnergyConsumedKwh: 0,
    },
  ],
  sessions: [],
  wallets: {},
  walletTransactions: [],
  vehicles: [],
  bills: [],
};

function normalizeSchema(raw: DatabaseSchema): DatabaseSchema {
  return {
    users: Array.isArray(raw.users) ? raw.users : [],
    chargers: Array.isArray(raw.chargers) ? raw.chargers : INITIAL_DATA.chargers,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    wallets: raw.wallets && typeof raw.wallets === 'object' ? raw.wallets : {},
    walletTransactions: Array.isArray(raw.walletTransactions) ? raw.walletTransactions : [],
    vehicles: Array.isArray(raw.vehicles) ? raw.vehicles : [],
    bills: Array.isArray(raw.bills) ? raw.bills : [],
  };
}

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return normalizeSchema(INITIAL_DATA);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return normalizeSchema(JSON.parse(raw));
  } catch (err) {
    console.error('[DB] Fallback to in-memory store:', err);
    return normalizeSchema(INITIAL_DATA);
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
    if (!email) return undefined;
    const data = ensureDbFile();
    return data.users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  },

  getUserByIdentifier: (identifier: string) => {
    if (!identifier) return undefined;
    const data = ensureDbFile();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return data.users.find(u => {
      // 1. Exact Email match
      if (u.email && u.email.trim().toLowerCase() === cleanId) return true;
      // 2. Full Name / Username match
      if (u.name && u.name.trim().toLowerCase() === cleanId) return true;
      // 3. Phone number match (matches local or international format)
      if (cleanDigits.length >= 7 && u.phone) {
        const uPhoneDigits = u.phone.replace(/\D/g, '');
        if (uPhoneDigits.length >= 7 && (uPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uPhoneDigits))) {
          return true;
        }
      }
      // 4. Operator badge ID match
      if (u.operatorBadgeId && u.operatorBadgeId.trim().toLowerCase() === cleanId) return true;
      return false;
    });
  },

  getUserById: (id: string) => {
    const data = ensureDbFile();
    return data.users.find(u => u.id === id);
  },

  // Best-effort local removal of a user and their loosely-coupled records.
  // Refuses to delete ADMIN accounts. Returns true if a user was removed.
  deleteUserByEmail: (email: string): boolean => {
    const data = ensureDbFile();
    const target = (email || '').trim().toLowerCase();
    const idx = data.users.findIndex(u => (u.email || '').trim().toLowerCase() === target);
    if (idx === -1) return false;
    const user = data.users[idx];
    if (user.role === 'ADMIN') return false;

    data.users.splice(idx, 1);
    data.sessions = (data.sessions || []).filter(s => s.userId !== user.id);
    data.bills = (data.bills || []).filter(b => b.userId !== user.id);
    data.vehicles = (data.vehicles || []).filter(v => v.userId !== user.id);
    if (data.wallets) delete data.wallets[user.id];
    if (data.walletTransactions) {
      data.walletTransactions = data.walletTransactions.filter(t => t.walletId !== `wal-${user.id}`);
    }
    saveDbFile(data);
    return true;
  },

  createUser: (user: Partial<User> & { password: string }): User => {
    const data = ensureDbFile();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const cleanName = (user.name || 'Anonymous User').trim();
    const cleanPhone = (user.phone || '+91 00000 00000').trim();
    const cleanRole = (user.role || 'USER') as User['role'];

    if (!['USER', 'OPERATOR', 'ADMIN'].includes(cleanRole)) {
      const err: any = new Error('Invalid account role specified.');
      err.statusCode = 400;
      throw err;
    }

    const existing = data.users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (existing) {
      const err: any = new Error('An account with this email already exists. Please sign in instead.');
      err.statusCode = 409;
      throw err;
    }

    // Prevent duplicate mobile number collisions (ignoring placeholder default)
    const cleanPhoneDigits = cleanPhone.replace(/\D/g, '');
    const isPlaceholderPhone = cleanPhoneDigits === '910000000000' || cleanPhoneDigits === '0000000000';
    if (cleanPhoneDigits.length >= 7 && !isPlaceholderPhone) {
      const phoneTaken = data.users.some(u => {
        const uDigits = (u.phone || '').replace(/\D/g, '');
        if (uDigits.length < 7 || uDigits === '910000000000' || uDigits === '0000000000') return false;
        return uDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(uDigits);
      });
      if (phoneTaken) {
        const err: any = new Error('An account with this mobile number already exists. Please sign in or use a different number.');
        err.statusCode = 409;
        throw err;
      }
    }

    // Prevent duplicate Operator Badge ID collisions
    const cleanBadge = user.operatorBadgeId ? user.operatorBadgeId.trim() : undefined;
    if (cleanBadge) {
      const badgeTaken = data.users.some(
        u => u.operatorBadgeId && u.operatorBadgeId.trim().toLowerCase() === cleanBadge.toLowerCase()
      );
      if (badgeTaken) {
        const err: any = new Error('An operator account with this Badge ID already exists.');
        err.statusCode = 409;
        throw err;
      }
    }

    // Resolve charger helper matching id or chargerCode strictly (no silent fallback)
    const resolveCharger = (stationIdentifier?: string): Charger | undefined => {
      if (!stationIdentifier) return undefined;
      return data.chargers.find(ch =>
        ch.id === stationIdentifier ||
        ch.chargerCode === stationIdentifier ||
        (ch.chargerCode && ch.chargerCode.toLowerCase() === stationIdentifier.toLowerCase())
      );
    };

    let boundCharger: Charger | undefined;
    if (cleanRole === 'OPERATOR') {
      boundCharger = resolveCharger(user.assignedStationId);
      if (!boundCharger) {
        const err: any = new Error('Selected EV charging station was not found.');
        err.statusCode = 400;
        throw err;
      }
    }

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: cleanRole,
      passwordHash: user.password,
      assignedStationId: boundCharger ? boundCharger.id : undefined,
      operatorBadgeId: user.operatorBadgeId ? user.operatorBadgeId.trim() : undefined,
      vehicleModel: user.vehicleModel,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);

    // If operator and station assigned, update charger's assignedOperator
    if (newUser.role === 'OPERATOR' && boundCharger) {
      data.users.forEach(u => {
        if (u.id !== newUser.id && (u.assignedStationId === boundCharger!.id || u.assignedStationId === boundCharger!.chargerCode)) {
          u.assignedStationId = undefined;
        }
      });

      data.chargers.forEach(c => {
        if (c.id !== boundCharger!.id && c.assignedOperatorId === newUser.id) {
          c.assignedOperatorId = undefined;
          c.assignedOperatorName = 'Unassigned';
        }
      });

      boundCharger.assignedOperatorId = newUser.id;
      boundCharger.assignedOperatorName = `${newUser.name} (${newUser.operatorBadgeId || 'OP'})`;
      newUser.assignedStationId = boundCharger.id;
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
    return data.chargers.find(c => c.id === id || c.chargerCode === id);
  },

  updateChargerStatus: (id: string, status: Charger['status']): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === id || c.chargerCode === id);
    if (!charger) return null;
    charger.status = status;
    charger.lastSeenAt = new Date().toISOString();
    saveDbFile(data);
    return charger;
  },

  updateChargerRating: (id: string, rating: number, pricePerKwh?: number): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === id || c.chargerCode === id);
    if (!charger) return null;
    charger.powerRating = rating;
    if (pricePerKwh !== undefined) {
      charger.pricePerKwh = pricePerKwh;
    }
    charger.lastSeenAt = new Date().toISOString();
    saveDbFile(data);
    return charger;
  },

  clearSessionsByStationId: (stationId: string): void => {
    const data = ensureDbFile();
    data.sessions = data.sessions.filter(s => s.chargerId !== stationId);
    saveDbFile(data);
  },

  assignOperatorToStation: (stationId: string, operatorId: string): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => 
      c.id === stationId || 
      c.chargerCode === stationId ||
      (c.chargerCode && c.chargerCode.toLowerCase() === stationId.toLowerCase())
    );
    if (!charger) return null;

    if (!operatorId || operatorId === 'none' || operatorId === 'unassigned') {
      return db.unassignOperatorFromStation(stationId);
    }

    const operator = data.users.find(u => 
      u.id === operatorId || 
      (u.email && u.email.toLowerCase() === operatorId.toLowerCase()) ||
      u.operatorBadgeId === operatorId
    );
    if (!operator) return null;

    // 1. If this operator was assigned to any other charger, unassign it
    data.chargers.forEach(c => {
      if (c.id !== charger.id && (c.assignedOperatorId === operator.id || c.assignedOperatorId === operatorId)) {
        c.assignedOperatorId = undefined;
        c.assignedOperatorName = 'Unassigned';
      }
    });

    // 2. If this charger previously had a different operator, clear that operator's station
    data.users.forEach(u => {
      if (u.id !== operator.id && (u.assignedStationId === charger.id || u.assignedStationId === charger.chargerCode)) {
        u.assignedStationId = undefined;
      }
    });

    // 3. Assign operator to charger
    charger.assignedOperatorId = operator.id;
    charger.assignedOperatorName = `${operator.name} (${operator.operatorBadgeId || 'OP'})`;
    operator.assignedStationId = charger.id;

    saveDbFile(data);
    return charger;
  },

  unassignOperatorFromStation: (stationId: string): Charger | null => {
    const data = ensureDbFile();
    const charger = data.chargers.find(c => c.id === stationId || c.chargerCode === stationId);
    if (!charger) return null;

    if (charger.assignedOperatorId) {
      const prevOp = data.users.find(u => u.id === charger.assignedOperatorId);
      if (prevOp) {
        prevOp.assignedStationId = undefined;
      }
    }

    charger.assignedOperatorId = undefined;
    charger.assignedOperatorName = 'Unassigned';
    saveDbFile(data);
    return charger;
  },

  // STATS FOR OPERATOR (STRICTLY SCOPED TO ASSIGNED STATION)
  getOperatorStats: (operatorIdOrStationId: string) => {
    const data = ensureDbFile();
    // Resolve station by ID, code, assigned operator ID, or user's assignedStationId
    let charger = data.chargers.find(c => c.id === operatorIdOrStationId || c.chargerCode === operatorIdOrStationId);
    if (!charger) {
      charger = data.chargers.find(c => c.assignedOperatorId === operatorIdOrStationId);
    }
    if (!charger) {
      const op = data.users.find(u => 
        u.id === operatorIdOrStationId || 
        (u.email && u.email.toLowerCase() === operatorIdOrStationId.toLowerCase()) ||
        u.operatorBadgeId === operatorIdOrStationId
      );
      if (op && op.assignedStationId) {
        charger = data.chargers.find(c => c.id === op.assignedStationId || c.chargerCode === op.assignedStationId);
      }
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

  // PER-USER & FLEET PERSISTENCE (WALLET, VEHICLES, SESSIONS, BILLS)
  getUserState: (userId: string, role: User['role']) => {
    const data = ensureDbFile();
    const now = new Date().toISOString();
    const wallets = data.wallets || {};
    const wallet: Wallet = wallets[userId] || {
      id: `wal-${userId}`,
      userId,
      balance: 0,
      currency: 'INR',
      updatedAt: now,
    };
    const allTx = data.walletTransactions || [];
    const allVehicles = data.vehicles || [];
    const allBills = data.bills || [];
    const allSessions = data.sessions || [];

    return {
      wallet,
      walletTransactions: role === 'ADMIN' ? allTx : allTx.filter(tx => tx.walletId === wallet.id),
      vehicles: allVehicles.filter(v => v.userId === userId),
      sessions: role === 'ADMIN' ? allSessions : allSessions.filter(s => s.userId === userId),
      bills: role === 'ADMIN' ? allBills : allBills.filter(b => b.userId === userId),
      chargers: data.chargers,
    };
  },

  topUpWallet: (userId: string, amount: number) => {
    const data = ensureDbFile();
    const now = new Date().toISOString();
    if (!data.wallets) data.wallets = {};
    if (!data.walletTransactions) data.walletTransactions = [];

    const existing: Wallet = data.wallets[userId] || {
      id: `wal-${userId}`,
      userId,
      balance: 0,
      currency: 'INR',
      updatedAt: now,
    };

    const updatedWallet: Wallet = {
      ...existing,
      balance: +(existing.balance + amount).toFixed(2),
      updatedAt: now,
    };
    data.wallets[userId] = updatedWallet;

    const tx: WalletTransaction = {
      id: `wtx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      walletId: updatedWallet.id,
      type: 'CREDIT',
      amount,
      reference: `UPI/ONLINE/${Math.floor(100000 + Math.random() * 900000)}`,
      description: 'Wallet top-up via UPI Online Payment',
      createdAt: now,
    };
    data.walletTransactions.unshift(tx);
    saveDbFile(data);
    return { wallet: updatedWallet, transaction: tx };
  },

  addVehicle: (userId: string, vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => {
    const data = ensureDbFile();
    if (!data.vehicles) data.vehicles = [];
    const newV: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    data.vehicles.push(newV);
    saveDbFile(data);
    return newV;
  },

  startSession: (session: ChargingSession) => {
    const data = ensureDbFile();
    data.sessions.unshift(session);
    const charger = data.chargers.find(c => c.id === session.chargerId);
    if (charger) {
      charger.status = 'CHARGING';
      charger.lastSeenAt = new Date().toISOString();
    }
    saveDbFile(data);
    return { session, charger };
  },

  stopSession: (
    userId: string,
    role: User['role'],
    sessionId: string,
    meteredEnergyKwh: number,
    durationSeconds: number,
    penaltyApplies: boolean
  ) => {
    const data = ensureDbFile();
    if (!data.bills) data.bills = [];
    const idx = data.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return null;

    const targetSession = data.sessions[idx];
    // Strict ownership check: only session owner or ADMIN may stop the session
    if (role !== 'ADMIN' && targetSession.userId !== userId) {
      const err: any = new Error('Forbidden: You can only stop your own charging session.');
      err.statusCode = 403;
      throw err;
    }

    // Prevent double-stop replay / double-billing
    if (targetSession.status === 'COMPLETED' || targetSession.status === 'FAILED') {
      const err: any = new Error('This charging session has already been completed and settled.');
      err.statusCode = 409;
      throw err;
    }

    const charger = data.chargers.find(c => c.id === targetSession.chargerId);
    const safeTariffRate =
      Number.isFinite(targetSession.tariffRate) && targetSession.tariffRate > 0
        ? targetSession.tariffRate
        : (charger?.pricePerKwh && charger.pricePerKwh > 0 ? charger.pricePerKwh : 10.5);

    const endTime = new Date().toISOString();
    const finalEnergy = +Math.max(0, Number.isFinite(meteredEnergyKwh) ? meteredEnergyKwh : 0).toFixed(3);
    const energySubtotal = +(finalEnergy * safeTariffRate).toFixed(2);
    const serviceFee = 5.0;
    const taxableSubtotal = +(energySubtotal + serviceFee).toFixed(2);
    const gstTax = +(taxableSubtotal * 0.18).toFixed(2);
    const penaltyFee = penaltyApplies ? 500.0 : 0.0;
    const finalTotal = +Math.max(0, taxableSubtotal + gstTax + penaltyFee).toFixed(2);

    const updatedSession: ChargingSession = {
      ...targetSession,
      tariffRate: safeTariffRate,
      status: 'COMPLETED',
      endTime,
      energyKwh: finalEnergy,
      durationSeconds: Math.max(0, Math.round(Number.isFinite(durationSeconds) ? durationSeconds : 0)),
      finalCost: finalTotal,
      estimatedCost: finalTotal,
      serviceFee,
      gstAmount: gstTax,
      penaltyAmount: penaltyFee,
      penaltyFee,
      paymentStatus: 'SUCCESS',
    };
    data.sessions[idx] = updatedSession;

    if (charger) {
      charger.status = 'AVAILABLE';
      charger.totalEarnedRevenue = +((charger.totalEarnedRevenue ?? 0) + finalTotal).toFixed(2);
      charger.totalEnergyConsumedKwh = +((charger.totalEnergyConsumedKwh ?? 0) + finalEnergy).toFixed(3);
      charger.lastSeenAt = endTime;
    }

    const ownerUserId = targetSession.userId || userId;
    const newBill: Bill = {
      id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      billNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sessionId,
      userId: ownerUserId,
      chargerName: targetSession.chargerName,
      energyKwh: finalEnergy,
      tariffRate: safeTariffRate,
      subtotal: energySubtotal,
      energyCost: energySubtotal,
      serviceFee,
      tax: gstTax,
      gstAmount: gstTax,
      penaltyAmount: penaltyFee,
      penaltyFee,
      maxCurrentA: targetSession.maxCurrentA ?? 0,
      avgVoltageV: targetSession.avgVoltageV ?? 0,
      totalAmount: finalTotal,
      todSlotActive: targetSession.todSlotActive || 'S_2: Standard (06:00 AM - 06:00 PM)',
      status: 'PAID',
      issuedAt: endTime,
      paidAt: endTime,
    };
    data.bills.unshift(newBill);

    // Keep wallet balance & ledger mathematically consistent:
    // Auto-debit wallet when balance covers invoice; otherwise settle via direct UPI without contradicting wallet balance.
    if (!data.wallets) data.wallets = {};
    if (!data.walletTransactions) data.walletTransactions = [];

    const existingWallet: Wallet = data.wallets[ownerUserId] || {
      id: `wal-${ownerUserId}`,
      userId: ownerUserId,
      balance: 0,
      currency: 'INR',
      updatedAt: endTime,
    };

    let updatedWallet = existingWallet;
    let settlementDesc = `Direct UPI Settlement @ ${targetSession.chargerName} (${finalEnergy.toFixed(3)} kWh)`;
    if (existingWallet.balance >= finalTotal) {
      updatedWallet = {
        ...existingWallet,
        balance: +(existingWallet.balance - finalTotal).toFixed(2),
        updatedAt: endTime,
      };
      data.wallets[ownerUserId] = updatedWallet;
      settlementDesc = `Wallet Auto-Debit @ ${targetSession.chargerName} (${finalEnergy.toFixed(3)} kWh)`;
    }

    const debitTx: WalletTransaction = {
      id: `wtx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      walletId: updatedWallet.id,
      type: 'DEBIT',
      amount: finalTotal,
      reference: newBill.billNumber,
      description: settlementDesc,
      createdAt: endTime,
    };
    data.walletTransactions.unshift(debitTx);

    saveDbFile(data);
    return { session: updatedSession, bill: newBill, charger, transaction: debitTx, wallet: updatedWallet };
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

  // COMPLETE FACTORY RESET (PURGES ALL PAST SESSIONS & METERS TO DAY-ZERO)
  factoryReset: () => {
    saveDbFile(INITIAL_DATA);
    return INITIAL_DATA;
  },
};
