'use client';

import React, { useState } from 'react';
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
  Settings,
  History,
  FileText,
  LayoutDashboard,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { 
    currentUser, 
    switchRole, 
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

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const isPublicPage = pathname === '/' || pathname === '/how-it-works' || pathname === '/features';

  const userLinks = [
    { href: '/dashboard', label: 'Rider Dashboard', icon: LayoutDashboard },
    { href: '/chargers', label: 'Bike Stations & BSS', icon: Zap },
    { href: '/vehicles', label: 'Bike Garage', icon: Bike },
    { href: '/history', label: 'History', icon: History },
    { href: '/bills', label: 'Bills', icon: FileText },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Ops Dashboard', icon: LayoutDashboard },
    { href: '/admin/chargers', label: 'Manage Chargers', icon: Zap },
    { href: '/admin/live', label: 'Live Telemetry', icon: Activity },
    { href: '/admin/faults', label: 'Fault Center', icon: ShieldCheck },
    { href: '/admin/tariffs', label: 'Tariffs', icon: CreditCard },
    { href: '/admin/analytics', label: 'Analytics', icon: Activity },
  ];

  const currentNavLinks = currentUser.role === 'USER' ? userLinks : adminLinks;

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-2xl transition-colors duration-300">
      
      {/* Active Charging Banner */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 px-4 py-2 text-white text-xs font-semibold flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>Active Charging Session in Progress: <strong>{activeSession.sessionCode}</strong> ({activeSession.energyKwh} kWh)</span>
            </div>
            <Link 
              href={`/charging/${activeSession.id}`}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold transition-all text-xs"
            >
              View Live Screen &rarr;
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-500 flex items-center justify-center glow-cyan group-hover:scale-105 transition-transform shadow-lg">
              <Bike className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white block">
                  SMART<span className="text-cyan-400">MOTO</span><span className="text-emerald-400 text-xs ml-0.5">EV</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[8px] font-mono text-cyan-300 font-bold hidden sm:inline-block">
                  LIVE CPO
                </span>
              </div>
              <span className="text-[9px] text-slate-400 tracking-wider uppercase block -mt-1 font-bold">
                Smart EV 2-Wheeler Energy Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isPublicPage ? (
              <>
                <Link href="/" className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${pathname === '/' ? 'text-cyan-400 bg-slate-900 border border-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}>
                  Home
                </Link>
                <Link href="/how-it-works" className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${pathname === '/how-it-works' ? 'text-cyan-400 bg-slate-900 border border-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}>
                  How It Works
                </Link>
                <Link href="/features" className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${pathname === '/features' ? 'text-cyan-400 bg-slate-900 border border-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}>
                  Features
                </Link>
                <Link href="/chargers" className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/50">
                  Stations & Swap Hubs
                </Link>
                <Link href="/vehicles" className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/50">
                  Bike Garage
                </Link>
              </>
            ) : (
              currentNavLinks.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold' 
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* SOUND TOGGLE BUTTON */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Haptics' : 'Enable Sound Effects'}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all shadow-sm"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Wallet Balance Badge */}
            <Link 
              href="/wallet" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all text-xs font-extrabold shadow-sm"
            >
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-mono">₹{wallet.balance.toFixed(2)}</span>
            </Link>

            {/* Notification Bell */}
            <Link 
              href="/notifications" 
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white relative shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Role Switcher & User Profile */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-white text-xs font-bold shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {currentUser.role[0]}
                </div>
                <span>{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-700 bg-slate-900 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">System Access Role</p>
                    <button
                      onClick={() => { switchRole('USER'); setRoleDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${currentUser.role === 'USER' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      <span>Driver (USER)</span>
                      {currentUser.role === 'USER' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      onClick={() => { switchRole('OPERATOR'); setRoleDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${currentUser.role === 'OPERATOR' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      <span>Operator</span>
                      {currentUser.role === 'OPERATOR' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      onClick={() => { switchRole('ADMIN'); setRoleDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${currentUser.role === 'ADMIN' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      <span>Administrator</span>
                      {currentUser.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <Link
                      href="/profile"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                      Profile Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {currentNavLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              <link.icon className="w-5 h-5 text-cyan-400" />
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button onClick={toggleTheme} className="text-cyan-400 font-semibold flex items-center gap-1">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <span>Role: <strong className="text-cyan-400">{currentUser.role}</strong></span>
          </div>
        </div>
      )}
    </header>
  );
};
