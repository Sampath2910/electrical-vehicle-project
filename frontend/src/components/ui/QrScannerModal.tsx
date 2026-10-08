'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, CheckCircle2, ShieldCheck, Smartphone, Camera } from 'lucide-react';
import { useStore } from '@/lib/storeContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: () => void;
  chargerName: string;
  chargerCode: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  chargerName,
  chargerCode,
}) => {
  const { playSound } = useStore();
  const [isScanning, setIsScanning] = useState(true);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScanned(false);
      const timer = setTimeout(() => {
        setIsScanning(false);
        setScanned(true);
        playSound('success');
        setTimeout(() => {
          onScanSuccess();
        }, 1000);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card rounded-3xl p-6 w-full max-w-sm border border-cyan-500/30 bg-navy-900 shadow-2xl space-y-5 text-center relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-navy-950 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
            <Camera className="w-3.5 h-3.5" />
            <span>UPI Mobile Scanner Simulator</span>
          </div>
          <h3 className="text-lg font-extrabold text-white">Scan Station QR Code</h3>
          <p className="text-xs text-slate-400">{chargerName} ({chargerCode})</p>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative w-56 h-56 mx-auto rounded-2xl bg-navy-950 border-2 border-dashed border-cyan-500/50 flex items-center justify-center overflow-hidden p-4">
          
          {/* Scanning Beam Animation */}
          {isScanning && (
            <motion.div 
              initial={{ y: -90 }}
              animate={{ y: 90 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse', ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F0FF]"
            />
          )}

          {/* QR Pattern Simulation */}
          <div className="p-3 bg-white rounded-xl shadow-inner relative">
            <QrCode className="w-36 h-36 text-navy-950" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-navy-950 font-black text-xs">
                EV
              </div>
            </div>
          </div>
        </div>

        {/* Status text */}
        <div>
          {isScanning ? (
            <p className="text-xs font-semibold text-cyan-400 animate-pulse">
              Aligning QR code in camera view...
            </p>
          ) : scanned ? (
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>QR Verified! Opening Payment Gateway...</span>
            </div>
          ) : null}
        </div>

      </motion.div>
    </div>
  );
};
