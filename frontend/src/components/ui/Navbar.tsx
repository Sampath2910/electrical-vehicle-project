'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Wallet, 
  Bell, 
  User as UserIcon, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown, 
  Activity, 
  CreditCard,
  Bike,
  History,
  FileText,
  LayoutDashboard,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Radio,
  ArrowRight,
  ShieldAlert,
  Building2,
  Sparkles,
  LogOut,
  LogIn
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { 
    currentUser, 
    logout, 
    wallet, 
    activeSession, 
    notifications, 
    theme, 
    toggleTheme, 
    soundEnabled, 
    toggleSound 
  } = useStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  // Role-specific navigation links (compact and focused)
  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chargers', label: 'Stations & Hubs', icon: Zap },
    { href: '/vehicles', label: 'Bike Garage', icon: Bike },
    { href: '/history', label: 'History', icon: History },
    { href: '/bills', label: 'Bills', icon: FileText },
  ];

  const operatorLinks = [
    { href: '/operator', label: 'My Station Console', icon: Radio },
    { href: '/chargers', label: 'Station Fleet', icon: Zap },
    { href: '/admin/live', label: 'Live Telemetry', icon: Activity },
    { href: '/history', label: 'Session Logs', icon: History },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Fleet Control Tower', icon: LayoutDashboard },
    { href: '/admin/chargers', label: 'Stations', icon: Zap },
    { href: '/admin/operators', label: 'Operators', icon: Radio },
    { href: '/admin/live', label: 'Live Metrology', icon: Activity },
    { href: '/admin/tariffs', label: 'Tariffs', icon: CreditCard },
  ];

  const currentNavLinks = 
    !mounted || !currentUser
      ? [
          { href: '/chargers', label: 'Stations & Hubs', icon: Zap },
          { href: '/auth/login', label: 'Sign In', icon: LogIn },
        ]
      : currentUser.role === 'OPERATOR' 
        ? operatorLinks 
        : currentUser.role === 'ADMIN' 
          ? adminLinks 
          : userLinks;

  // Role Accent Colors
  const roleStyles = (mounted && currentUser) ? {
    USER: {
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      dotColor: 'bg-cyan-400',
      label: 'EV Driver',
      avatarBorder: 'border-cyan-400/50 bg-cyan-500/20 text-cyan-300',
    },
    OPERATOR: {
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dotColor: 'bg-amber-400',
      label: 'Station Operator',
      avatarBorder: 'border-amber-400/50 bg-amber-500/20 text-amber-300',
    },
    ADMIN: {
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dotColor: 'bg-rose-400',
      label: 'Fleet Admin',
      avatarBorder: 'border-rose-400/50 bg-rose-500/20 text-rose-300',
    },
  }[currentUser.role] : {
    badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
    dotColor: 'bg-slate-400',
    label: 'Guest',
    avatarBorder: 'border-slate-700 bg-slate-800 text-slate-400',
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-200">
      
      {/* 1. SLIM HIGH-TECH ACTIVE SESSION TICKER */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-cyan-950 via-slate-950 to-emerald-950 border-b border-cyan-500/30 px-4 py-1.5 text-xs text-white shadow-md relative overflow-hidden"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] hidden sm:inline-block">
                  Live Session
                </span>
                <span className="text-slate-300 truncate text-[11px]">
                  <strong className="text-white font-mono">{activeSession.sessionCode}</strong> &bull; {activeSession.energyKwh} kWh Delivered
                </span>
              </div>
              <Link 
                href={`/charging/${activeSession.id}`}
                className="shrink-0 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-sm"
              >
                <span>View Session</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* BRAND LOGO */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Bike className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  SMART<span className="text-cyan-400">MOTO</span><span className="text-emerald-400">EV</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 font-bold hidden sm:inline-block">
                  CPO
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV LINKS (CENTER PILL BAR) */}
            <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-slate-900/60 border border-slate-800/80 gap-1">
              {currentNavLinks.map(link => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/40 font-bold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT UTILITY & ACTIONS BAR */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* WALLET CHIP */}
              <Link 
                href="/wallet" 
                title="Open EV Wallet & Top-up"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs font-mono font-bold shadow-sm text-slate-200 group"
              >
                <Wallet className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-white">₹{wallet.balance.toFixed(2)}</span>
              </Link>

              {/* NOTIFICATION BELL */}
              <Link 
                href="/notifications" 
                title="System Notifications"
                className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center justify-center relative transition-all shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* AUDIO SOUND TOGGLE */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Mute System Sounds' : 'Enable Audio Haptics'}
                className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white items-center justify-center transition-all shadow-sm cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                title={`Switch Theme (Current: ${theme})`}
                className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white items-center justify-center transition-all shadow-sm cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              {/* USER PROFILE & ROLE DROPDOWN */}
              {mounted && currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <div className={`w-7 h-7 rounded-lg border ${roleStyles.avatarBorder} flex items-center justify-center font-bold text-xs`}>
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-bold text-white max-w-[100px] truncate leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        {roleStyles.label}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* DROPDOWN MENU */}
                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-2.5 z-50 backdrop-blur-2xl animate-fadeIn space-y-2">
                      
                      {/* User Info Header */}
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{currentUser.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${roleStyles.badgeBg}`}>
                            {currentUser.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate font-mono">{currentUser.email}</p>
                        {currentUser.role === 'OPERATOR' && currentUser.assignedStationId && (
                          <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
                            <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Assigned: {currentUser.assignedStationId}</span>
                          </div>
                        )}
                        {currentUser.role === 'OPERATOR' && currentUser.operatorBadgeId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Badge: {currentUser.operatorBadgeId}
                          </div>
                        )}
                      </div>

                      {/* Log Out Option (Operators cannot change roles directly) */}
                      <div className="pt-1.5 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between text-rose-400 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-rose-400" />
                            <span>Log Out</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">End Session</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* MOBILE HAMBURGER BUTTON */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* 3. MOBILE SLIDE-OUT MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-4 shadow-2xl animate-fadeIn">
          
          {/* Quick Wallet Bar on Mobile */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300">Wallet Balance:</span>
            </div>
            <span className="text-sm font-extrabold text-white font-mono">₹{wallet.balance.toFixed(2)}</span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-2">
              Menu Navigation ({roleStyles.label})
            </span>
            {currentNavLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 font-bold ring-1 ring-cyan-500/30' 
                      : 'text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Utilities */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            {mounted && currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({currentUser.name})</span>
              </button>
            )}

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={toggleTheme}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 font-medium"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={toggleSound}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 font-medium"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </header>
  );
};
