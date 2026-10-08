'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Charger, 
  ChargingSession, 
  Wallet, 
  WalletTransaction, 
  RfidCard, 
  Vehicle, 
  Fault, 
  NotificationItem, 
  Tariff,
  Bill
} from '@/types/ev';
import { 
  mockUsers, 
  mockChargers, 
  mockSessions, 
  mockWallet, 
  mockWalletTransactions, 
  mockRfidCards, 
  mockVehicles, 
  mockFaults, 
  mockNotifications, 
  mockTariffs, 
  mockBills 
} from './mockData';
import { getCurrentToDSlot } from './providers';

interface StoreContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: 'USER' | 'OPERATOR' | 'ADMIN') => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: 'beep' | 'success' | 'alert' | 'start' | 'alarm') => void;
  
  chargers: Charger[];
  updateChargerStatus: (chargerId: string, status: Charger['status']) => void;
  
  activeSession: ChargingSession | null;
  historySessions: ChargingSession[];
  startChargingSession: (
    chargerId: string, 
    paymentMethod?: 'QR_UPI' | 'RFID_WALLET', 
    vehicleId?: string,
    isPriorityBayConsentGiven?: boolean
  ) => Promise<ChargingSession>;
  stopChargingSession: (sessionId: string, penaltyApplies?: boolean) => Promise<ChargingSession>;
  
  // PDF Section 2: Priority Preemption Protocol (120-second eviction)
  isEvictionWarningActive: boolean;
  evictionCountdown: number;
  penaltyApplied: boolean;
  triggerEmergencyOverride: () => void;
  yieldEmergencyBay: () => Promise<ChargingSession>;
  resetEvictionWarning: () => void;

  wallet: Wallet;
  walletTransactions: WalletTransaction[];
  topUpWallet: (amount: number) => Promise<void>;
  
  rfidCards: RfidCard[];
  toggleRfidBlock: (cardId: string) => Promise<void>;
  addRfidCard: (identifier: string) => void;
  
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => void;
  
  tariffs: Tariff[];
  updateTariff: (tariffId: string, price: number) => void;
  
  bills: Bill[];
  faults: Fault[];
  resolveFault: (faultId: string) => void;
  
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  
  dataMode: 'mock' | 'real';
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [chargers, setChargers] = useState<Charger[]>(mockChargers);
  const [sessions, setSessions] = useState<ChargingSession[]>(mockSessions);
  const [wallet, setWallet] = useState<Wallet>(mockWallet);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(mockWalletTransactions);
  const [rfidCards, setRfidCards] = useState<RfidCard[]>(mockRfidCards);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [tariffs, setTariffs] = useState<Tariff[]>(mockTariffs);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [faults, setFaults] = useState<Fault[]>(mockFaults);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [dataMode] = useState<'mock' | 'real'>('mock');

  // PDF Section 2 Preemption eviction state
  const [isEvictionWarningActive, setIsEvictionWarningActive] = useState<boolean>(false);
  const [evictionCountdown, setEvictionCountdown] = useState<number>(120);
  const [penaltyApplied, setPenaltyApplied] = useState<boolean>(false);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize theme from localStorage & apply DOM class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  // Web Audio API Synth Haptics & Rapid Eviction Buzzer
  const playSound = (type: 'beep' | 'success' | 'alert' | 'start' | 'alarm') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'start') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'alarm') {
        // Rapid active buzzer pulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.frequency.setValueAtTime(450, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      console.warn('Audio not supported or blocked:', e);
    }
  };

  const activeSession = sessions.find(s => s.status === 'CHARGING' || s.status === 'STARTED') || null;
  const historySessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'FAILED');

  // Eviction 120-Second Sequence Counter (PDF Section 2)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isEvictionWarningActive && evictionCountdown > 0) {
      timer = setInterval(() => {
        setEvictionCountdown(prev => {
          if (prev <= 1) {
            // Auto cutoff & 500 penalty: ESP32 trips 5V relay cutting power
            playSound('alert');
            setPenaltyApplied(true);
            setIsEvictionWarningActive(false);
            if (activeSession) {
              stopChargingSession(activeSession.id, true);
            }
            return 0;
          }
          if (prev % 2 === 0) playSound('alarm');
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isEvictionWarningActive, evictionCountdown, activeSession]);

  const triggerEmergencyOverride = () => {
    playSound('alarm');
    setIsEvictionWarningActive(true);
    setEvictionCountdown(120);
    setPenaltyApplied(false);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type: 'EMERGENCY_PREEMPTION',
      title: 'CRITICAL: EMERGENCY VEHICLE OVERRIDE TRIGGERED',
      message: 'Ambulance / Emergency vehicle detected at Priority Bay! Unplug within 120 seconds to avoid ₹500 penalty.',
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const yieldEmergencyBay = async (): Promise<ChargingSession> => {
    playSound('success');
    setIsEvictionWarningActive(false);
    setPenaltyApplied(false);
    if (!activeSession) throw new Error('No active session to yield');
    return stopChargingSession(activeSession.id, false);
  };

  const resetEvictionWarning = () => {
    setIsEvictionWarningActive(false);
    setEvictionCountdown(120);
  };

  const switchRole = (role: 'USER' | 'OPERATOR' | 'ADMIN') => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
    playSound('beep');
  };

  const updateChargerStatus = (chargerId: string, status: Charger['status']) => {
    setChargers(prev => prev.map(c => c.id === chargerId ? { ...c, status, lastSeenAt: new Date().toISOString() } : c));
  };

  const startChargingSession = async (
    chargerId: string, 
    _paymentMethod?: 'QR_UPI' | 'RFID_WALLET', 
    vehicleId?: string,
    isPriorityBayConsentGiven?: boolean
  ): Promise<ChargingSession> => {
    const charger = chargers.find(c => c.id === chargerId);
    if (!charger) throw new Error('Charger not found');
    if (charger.status === 'FAULT' || charger.status === 'OFFLINE') {
      throw new Error(`Cannot start session: Station is currently ${charger.status}`);
    }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];
    const todInfo = getCurrentToDSlot();
    const isPriority = charger.isPriorityBay || false;

    // Rate: Current ToD rate (+ ₹8.00/kWh Premium if Priority Bay)
    const effectiveRate = isPriority ? +(todInfo.baseRate + 8.00).toFixed(2) : todInfo.baseRate;
    const todSlotDesc = isPriority 
      ? `S_VIP: Priority Bay (${todInfo.slotName} ₹${todInfo.baseRate.toFixed(2)} + ₹8.00 Premium)`
      : `${todInfo.slotCode}: ${todInfo.slotName} (${todInfo.timeWindow})`;

    const newSession: ChargingSession = {
      id: `ses-${Date.now()}`,
      sessionCode: `SES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      chargerId: charger.id,
      chargerName: charger.name,
      chargerLocation: charger.location,
      vehicleId: selectedVehicle?.id,
      vehicleName: selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.registration})` : undefined,
      startTime: new Date().toISOString(),
      status: 'CHARGING',
      energyKwh: 0.10,
      durationSeconds: 5,
      tariffRate: effectiveRate,
      estimatedCost: +(0.10 * effectiveRate + 5.00 * 1.18).toFixed(2),
      serviceFee: 5.00,
      gstAmount: +(5.00 * 0.18).toFixed(2),
      todSlotActive: todSlotDesc,
      maxCurrentA: 14.1,
      avgVoltageV: 230.2,
      isPriorityBay: isPriority,
      paymentMethod: 'QR_UPI',
      paymentStatus: 'SUCCESS',
    };

    setSessions(prev => [newSession, ...prev]);
    updateChargerStatus(chargerId, 'CHARGING');
    playSound('start');

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type: 'CHARGING_STARTED',
      title: 'Bike Charging Session Authorized',
      message: `Session ${newSession.sessionCode} started at ${charger.name} via QR / UPI Online Payment. Tariff: ₹${effectiveRate}/kWh.`,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newSession;
  };

  const stopChargingSession = async (sessionId: string, penaltyApplies = false): Promise<ChargingSession> => {
    let targetSession = sessions.find(s => s.id === sessionId);
    if (!targetSession) throw new Error('Session not found');

    const endTime = new Date().toISOString();
    const finalEnergy = +(targetSession.energyKwh + 0.4).toFixed(2);
    
    // PDF Section 6 Official Billing Formula:
    // Total Billed Amount = (Energy kWh Delivered × ToD Rate) + Service Fee + 18% GST (+ Penalty)
    const energySubtotal = +(finalEnergy * targetSession.tariffRate).toFixed(2);
    const serviceFee = 5.00; // Fixed Service Fee
    const taxableSubtotal = +(energySubtotal + serviceFee).toFixed(2);
    const gstTax = +(taxableSubtotal * 0.18).toFixed(2); // 18% GST
    const penaltyFee = penaltyApplies || penaltyApplied ? 500.00 : 0.00;
    const finalTotal = +(taxableSubtotal + gstTax + penaltyFee).toFixed(2);

    const updatedSession: ChargingSession = {
      ...targetSession,
      status: 'COMPLETED',
      endTime,
      energyKwh: finalEnergy,
      finalCost: finalTotal,
      estimatedCost: finalTotal,
      serviceFee,
      gstAmount: gstTax,
      penaltyAmount: penaltyFee,
      paymentStatus: 'SUCCESS',
    };

    setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
    updateChargerStatus(targetSession.chargerId, 'AVAILABLE');
    playSound(penaltyFee > 0 ? 'alert' : 'success');

    // Create official digital bill conforming to PDF Section 6
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      billNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sessionId,
      userId: currentUser.id,
      chargerName: targetSession.chargerName,
      energyKwh: finalEnergy,
      tariffRate: targetSession.tariffRate,
      subtotal: energySubtotal,
      serviceFee,
      tax: gstTax,
      penaltyAmount: penaltyFee,
      totalAmount: finalTotal,
      todSlotActive: targetSession.todSlotActive || 'S_2: Standard (06:00 AM - 06:00 PM)',
      status: 'PAID',
      issuedAt: endTime,
      paidAt: endTime,
    };
    setBills(prev => [newBill, ...prev]);

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type: 'CHARGING_COMPLETED',
      title: penaltyFee > 0 ? 'Session Ended with Eviction Penalty' : 'Charging Session Settled via UPI',
      message: `Session ${targetSession?.sessionCode} finished. Total ${finalEnergy} kWh delivered. Billed: ₹${finalTotal}${penaltyFee > 0 ? ' (includes ₹500 non-yield penalty)' : ''}.`,
      createdAt: endTime,
    }, ...prev]);

    return updatedSession;
  };

  const topUpWallet = async (amount: number) => {
    const now = new Date().toISOString();
    setWallet(prev => ({ ...prev, balance: +(prev.balance + amount).toFixed(2), updatedAt: now }));
    setWalletTransactions(prev => [{
      id: `wtx-${Date.now()}`,
      walletId: wallet.id,
      type: 'CREDIT',
      amount,
      reference: `UPI/ONLINE/${Math.floor(100000 + Math.random() * 900000)}`,
      description: 'Wallet top-up via UPI Online Payment',
      createdAt: now,
    }, ...prev]);
    playSound('success');
  };

  const toggleRfidBlock = async (cardId: string) => {
    const card = rfidCards.find(c => c.id === cardId);
    if (card) {
      const willBlock = card.status === 'ACTIVE';
      setRfidCards(prev => prev.map(c => c.id === cardId ? { ...c, status: willBlock ? 'BLOCKED' : 'ACTIVE' } : c));
      playSound(willBlock ? 'alert' : 'beep');
    }
  };

  const addRfidCard = (identifier: string) => {
    const newCard: RfidCard = {
      id: `rfid-${Date.now()}`,
      userId: currentUser.id,
      displayIdentifier: identifier.toUpperCase().startsWith('CARD-') ? identifier.toUpperCase() : `CARD-${identifier.toUpperCase()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setRfidCards(prev => [...prev, newCard]);
    playSound('success');
  };

  const addVehicle = (v: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => {
    const newV: Vehicle = {
      ...v,
      id: `veh-${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newV]);
    playSound('success');
  };

  const updateTariff = (tariffId: string, price: number) => {
    setTariffs(prev => prev.map(t => t.id === tariffId ? { ...t, pricePerKwh: price } : t));
    playSound('beep');
  };

  const resolveFault = (faultId: string) => {
    const fault = faults.find(f => f.id === faultId);
    if (fault) {
      setFaults(prev => prev.map(f => f.id === faultId ? { ...f, status: 'RESOLVED', clearedAt: new Date().toISOString() } : f));
      updateChargerStatus(fault.chargerId, 'AVAILABLE');
      playSound('success');
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      theme,
      toggleTheme,
      soundEnabled,
      toggleSound,
      playSound,
      chargers,
      updateChargerStatus,
      activeSession,
      historySessions,
      startChargingSession,
      stopChargingSession,
      isEvictionWarningActive,
      evictionCountdown,
      penaltyApplied,
      triggerEmergencyOverride,
      yieldEmergencyBay,
      resetEvictionWarning,
      wallet,
      walletTransactions,
      topUpWallet,
      rfidCards,
      toggleRfidBlock,
      addRfidCard,
      vehicles,
      addVehicle,
      tariffs,
      updateTariff,
      bills,
      faults,
      resolveFault,
      notifications,
      markNotificationRead,
      dataMode,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
