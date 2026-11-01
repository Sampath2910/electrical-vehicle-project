'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Landmark, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Trash2, 
  Minus, 
  Sliders, 
  Check, 
  X, 
  RefreshCw, 
  PartyPopper,
  Zap,
  Info
} from 'lucide-react';
import { useStore } from '@/lib/storeContext';
import { Tariff, TariffCondition } from '@/types/ev';

const STATE_DISCOM_BENCHMARKS = [
  {
    state: 'Karnataka (BESCOM)',
    category: 'LT-6 Concessional Tariff',
    rate: '₹4.50 – ₹5.50 / unit',
    notes: 'No demand charge for public EV charging stations. Baseline for project retail markup.',
  },
  {
    state: 'Delhi (DERC)',
    category: 'Low Tension (LT) EV',
    rate: '~₹4.50 / unit',
    notes: 'Subsidized single-phase and three-phase public EV charging supply.',
  },
  {
    state: 'Maharashtra (MSEDCL)',
    category: 'LT Commercial EV',
    rate: '~₹6.08 / unit',
    notes: 'Standard discom base rate before local municipal duties and CPO margin.',
  },
  {
    state: 'Tamil Nadu (TANGEDCO)',
    category: 'Mandatory ToD Tariff',
    rate: '₹6.00 – ₹9.00 / unit',
    notes: 'Time-of-Day stepped tariff based on morning, solar, and evening peak slots.',
  },
];

// Presets for quick occasion condition setup
const OCCASION_PRESETS: Array<{
  name: string;
  type: TariffCondition['type'];
  dateRange: string;
  timeWindowOverride: string;
  suggestedRate: number;
  discountPercent: number;
  notes: string;
}> = [
  {
    name: 'Diwali Festive Green Mobility',
    type: 'FESTIVAL',
    dateRange: 'Oct 28 – Nov 03',
    timeWindowOverride: 'Extended Night (08:00 PM – 08:00 AM)',
    suggestedRate: 5.50,
    discountPercent: 26.7,
    notes: 'Encourage green electric mobility and clean air travel during the festive season.',
  },
  {
    name: 'National Holidays (Republic / Independence Day)',
    type: 'HOLIDAY',
    dateRange: 'Jan 26, Aug 15, Oct 02 (Gazetted)',
    timeWindowOverride: 'Full Day (24 Hours Off-Peak)',
    suggestedRate: 6.00,
    discountPercent: 20.0,
    notes: 'Low commercial grid load during national holidays allows all-day subsidized charging.',
  },
  {
    name: 'Christmas & New Year Eve Celebration',
    type: 'CELEBRATION',
    dateRange: 'Dec 24 – Jan 01',
    timeWindowOverride: 'Extended Night (08:00 PM – 08:00 AM)',
    suggestedRate: 5.75,
    discountPercent: 23.3,
    notes: 'Year-end holiday night celebrations with dynamic concession rate.',
  },
  {
    name: 'Eid Festive Night Drive',
    type: 'FESTIVAL',
    dateRange: 'Eid-ul-Fitr & Eid-ul-Adha Evenings',
    timeWindowOverride: 'Extended Night (08:00 PM – 08:00 AM)',
    suggestedRate: 5.50,
    discountPercent: 26.7,
    notes: 'Festive community discount promoting overnight zero-emission transport.',
  },
  {
    name: 'World EV Day & Clean City Drive',
    type: 'CELEBRATION',
    dateRange: 'September 09 & 1st Sunday of every month',
    timeWindowOverride: 'Full Day (24 Hours Off-Peak)',
    suggestedRate: 5.00,
    discountPercent: 33.3,
    notes: 'Special civic celebration promoting 100% renewable EV mass adoption.',
  },
  {
    name: 'Weekend Super-Saver Hours',
    type: 'WEEKEND',
    dateRange: 'Every Saturday & Sunday',
    timeWindowOverride: 'Extended Night (09:00 PM – 09:00 AM)',
    suggestedRate: 6.50,
    discountPercent: 13.3,
    notes: 'Weekend community discount for weekend leisure and commuter riders.',
  },
];

export default function AdminTariffsPage() {
  const { 
    tariffs, 
    updateTariff, 
    addTariffCondition, 
    updateTariffCondition, 
    deleteTariffCondition, 
    toggleTariffCondition,
    addTariff,
    resetTariffsToDefault
  } = useStore();

  // Inline price editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(7.5);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Condition Modal state (for Slot 1 occasions)
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);
  const [conditionTargetTariffId, setConditionTargetTariffId] = useState<string>('tar-01');
  const [conditionForm, setConditionForm] = useState<{
    name: string;
    type: TariffCondition['type'];
    dateRange: string;
    timeWindowOverride: string;
    adjustedPricePerKwh: number;
    discountPercent: number;
    isActive: boolean;
    notes: string;
  }>({
    name: '',
    type: 'FESTIVAL',
    dateRange: '',
    timeWindowOverride: 'Full Day (24 Hours Off-Peak)',
    adjustedPricePerKwh: 5.50,
    discountPercent: 25,
    isActive: true,
    notes: '',
  });

  // Slot Configuration Modal state (for editing any slot details or adding custom slot)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState<{
    name: string;
    slotCode: string;
    slotName: string;
    timeWindow: string;
    pricePerKwh: number;
    logic: string;
  }>({
    name: '',
    slotCode: 'S_CUSTOM',
    slotName: '',
    timeWindow: '',
    pricePerKwh: 10.0,
    logic: '',
  });

  // Handle Quick Stepper Adjustments (+/- ₹0.50)
  const handleQuickAdjust = (t: Tariff, delta: number) => {
    const updatedRate = Math.max(1, +(t.pricePerKwh + delta).toFixed(2));
    updateTariff(t.id, updatedRate);
    showToast(`Dynamic rate for ${t.name} adjusted to ₹${updatedRate.toFixed(2)}/kWh`);
  };

  // Handle Inline Save
  const handleSaveInline = (id: string) => {
    updateTariff(id, newPrice);
    setEditingId(null);
    showToast(`Saved dynamic tariff rate: ₹${newPrice.toFixed(2)}/kWh`);
  };

  // Open Condition Modal for Adding
  const openAddConditionModal = (tariffId: string = 'tar-01') => {
    const targetTariff = tariffs.find(t => t.id === tariffId) || tariffs[0];
    setConditionTargetTariffId(tariffId);
    setEditingConditionId(null);
    setConditionForm({
      name: '',
      type: 'FESTIVAL',
      dateRange: '',
      timeWindowOverride: 'Extended Night (08:00 PM – 08:00 AM)',
      adjustedPricePerKwh: +(targetTariff.pricePerKwh * 0.75).toFixed(2),
      discountPercent: 25,
      isActive: true,
      notes: 'Dynamic holiday / festival pricing parameter to support green festive travel.',
    });
    setIsConditionModalOpen(true);
  };

  // Open Condition Modal for Editing
  const openEditConditionModal = (tariffId: string, condition: TariffCondition) => {
    setConditionTargetTariffId(tariffId);
    setEditingConditionId(condition.id);
    setConditionForm({
      name: condition.name,
      type: condition.type,
      dateRange: condition.dateRange,
      timeWindowOverride: condition.timeWindowOverride,
      adjustedPricePerKwh: condition.adjustedPricePerKwh,
      discountPercent: condition.discountPercent || 20,
      isActive: condition.isActive,
      notes: condition.notes || '',
    });
    setIsConditionModalOpen(true);
  };

  // Save Condition Form
  const handleSaveCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionForm.name.trim()) return;

    if (editingConditionId) {
      updateTariffCondition(conditionTargetTariffId, editingConditionId, {
        name: conditionForm.name,
        type: conditionForm.type,
        dateRange: conditionForm.dateRange,
        timeWindowOverride: conditionForm.timeWindowOverride,
        adjustedPricePerKwh: conditionForm.adjustedPricePerKwh,
        discountPercent: conditionForm.discountPercent,
        isActive: conditionForm.isActive,
        notes: conditionForm.notes,
      });
      showToast(`Updated condition "${conditionForm.name}" for Slot 1`);
    } else {
      const newCondition: TariffCondition = {
        id: `cond-${Date.now()}`,
        name: conditionForm.name,
        type: conditionForm.type,
        dateRange: conditionForm.dateRange || 'Applicable on Event Dates',
        timeWindowOverride: conditionForm.timeWindowOverride,
        adjustedPricePerKwh: conditionForm.adjustedPricePerKwh,
        discountPercent: conditionForm.discountPercent,
        isActive: conditionForm.isActive,
        notes: conditionForm.notes,
      };
      addTariffCondition(conditionTargetTariffId, newCondition);
      showToast(`Added occasion parameter "${conditionForm.name}" with + symbol`);
    }

    setIsConditionModalOpen(false);
  };

  // Apply Preset to Condition Form
  const applyPreset = (preset: typeof OCCASION_PRESETS[0]) => {
    setConditionForm({
      name: preset.name,
      type: preset.type,
      dateRange: preset.dateRange,
      timeWindowOverride: preset.timeWindowOverride,
      adjustedPricePerKwh: preset.suggestedRate,
      discountPercent: preset.discountPercent,
      isActive: true,
      notes: preset.notes,
    });
  };

  // Open Slot Details Modal
  const openSlotModal = (slot?: Tariff) => {
    if (slot) {
      setEditingSlotId(slot.id);
      setSlotForm({
        name: slot.name,
        slotCode: slot.slotCode,
        slotName: slot.slotName,
        timeWindow: slot.timeWindow,
        pricePerKwh: slot.pricePerKwh,
        logic: slot.logic,
      });
    } else {
      setEditingSlotId(null);
      setSlotForm({
        name: 'Custom Time Slot Tier',
        slotCode: `S_${tariffs.length + 1}`,
        slotName: 'Special Concession Window',
        timeWindow: '11:00 AM to 03:00 PM',
        pricePerKwh: 9.00,
        logic: 'Custom dynamic charging slot configured for specific load conditions.',
      });
    }
    setIsSlotModalOpen(true);
  };

  // Save Slot Form
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.name.trim()) return;

    if (editingSlotId) {
      updateTariff(editingSlotId, {
        name: slotForm.name,
        slotCode: slotForm.slotCode,
        slotName: slotForm.slotName,
        timeWindow: slotForm.timeWindow,
        pricePerKwh: slotForm.pricePerKwh,
        logic: slotForm.logic,
      });
      showToast(`Updated slot configuration for "${slotForm.name}"`);
    } else {
      const newSlot: Tariff = {
        id: `tar-${Date.now()}`,
        name: slotForm.name,
        slotCode: slotForm.slotCode,
        slotName: slotForm.slotName,
        timeWindow: slotForm.timeWindow,
        pricePerKwh: slotForm.pricePerKwh,
        logic: slotForm.logic,
        effectiveFrom: new Date().toISOString(),
        status: 'ACTIVE',
      };
      addTariff(newSlot);
      showToast(`Created new dynamic time slot tier`);
    }

    setIsSlotModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header with Title and Global Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-500 dark:text-cyan-400 mb-2">
            Section 1 & 5 Tariff Specification Engine
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Time-of-Day (ToD) Tariff Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Configured according to commercial LT-6 public charging guidelines and Priority Preemption surge rates
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetTariffsToDefault();
              showToast('Reset all time slot tariffs to default state discom benchmarks');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            title="Reset to LT-6 Benchmarks"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={() => openSlotModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Time Slot</span>
          </button>
        </div>
      </div>

      {/* ACTIVE TIME-OF-DAY TIERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {tariffs.map((t) => {
          const isSurge = t.id === 'tar-surge' || t.name.includes('Priority');
          const isOffPeak = t.name.includes('Off-Peak') || t.slotCode === 'S_1';
          const isPeak = t.name.includes('Peak') && !isOffPeak;
          const conditions = t.conditions || [];
          const activeCondition = isOffPeak ? conditions.find(c => c.isActive) : undefined;
          const effectivePrice = activeCondition ? activeCondition.adjustedPricePerKwh : t.pricePerKwh;

          return (
            <div 
              key={t.id} 
              className={`rounded-3xl p-6 border flex flex-col justify-between space-y-4 shadow-xl transition-all duration-200 ${
                activeCondition
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30'
                  : isSurge 
                  ? 'border-amber-400/40 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/25' 
                  : isPeak 
                  ? 'border-rose-300 dark:border-rose-500/30 bg-rose-50/40 dark:bg-navy-900/90'
                  : isOffPeak
                  ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-navy-900/90'
                  : 'border-cyan-300 dark:border-cyan-500/30 bg-cyan-50/40 dark:bg-navy-900/90'
              } bg-white dark:bg-navy-900/90 dark:border-slate-800`}
            >
              {/* Card Header & Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isSurge 
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30' 
                        : isPeak 
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                        : isOffPeak
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                    }`}>
                      {t.id.replace('tar-', 'SLOT ').toUpperCase()}
                    </span>

                    {/* Active Occasion Tag on Slot 1 */}
                    {activeCondition && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Occasion Active</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* + Symbol Button on Slot 1 for adding/editing conditional parameters */}
                    {isOffPeak && (
                      <button
                        onClick={() => openAddConditionModal(t.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm hover:shadow transition-all group"
                        title="Add conditional parameter for holidays, festivals, celebrations (+)"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3] group-hover:rotate-90 transition-transform" />
                        <span className="font-extrabold">+ Occasion</span>
                      </button>
                    )}

                    {/* Configure Slot Details Button */}
                    <button
                      onClick={() => openSlotModal(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                      title="Configure slot hours and parameters"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    {isSurge && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>

                {/* Title and Time Window */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {t.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{t.timeWindow}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {t.logic || (
                    isOffPeak 
                      ? 'Cheapest tier to encourage overnight charging when grid demand is lowest (10 PM – 6 AM).'
                      : t.name.includes('Standard') 
                      ? 'Standard daytime charging rate covering solar-generation hours and grid load (6 AM – 6 PM).'
                      : isPeak 
                      ? 'Heavy surcharge applied during evening domestic peak grid load (6 PM – 10 PM).'
                      : 'Current ToD rate + ₹8.00/kWh premium deterrent for civilian priority bay access.'
                  )}
                </p>

                {/* Active Occasion Banner on Slot 1 */}
                {isOffPeak && activeCondition && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <PartyPopper className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {activeCondition.name} ({activeCondition.type})
                      </span>
                      <span className="text-[10px] opacity-90 block">
                        Applied rate: ₹{activeCondition.adjustedPricePerKwh.toFixed(2)}/kWh ({activeCondition.timeWindowOverride})
                      </span>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL PARAMETERS LIST (SLOT 1 SPECIFIC FEATURE) */}
                {isOffPeak && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>Occasions & Festivals</span>
                      </span>

                      {/* Header + symbol to quickly add */}
                      <button
                        onClick={() => openAddConditionModal(t.id)}
                        className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-0.5 transition-colors"
                        title="Add occasion condition (+)"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Condition Items */}
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                      {conditions.length === 0 ? (
                        <div className="text-center py-3 px-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                          <span>No occasion rules configured.</span>
                          <button
                            onClick={() => openAddConditionModal(t.id)}
                            className="block mx-auto mt-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            + Add Holiday/Festival Rule
                          </button>
                        </div>
                      ) : (
                        conditions.map((c) => (
                          <div
                            key={c.id}
                            className={`p-2 rounded-xl border text-[11px] transition-all flex flex-col gap-1.5 ${
                              c.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40'
                                : 'bg-slate-50 dark:bg-navy-950/50 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                  c.type === 'FESTIVAL'
                                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                    : c.type === 'HOLIDAY'
                                    ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                                    : c.type === 'CELEBRATION'
                                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                  {c.type}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {c.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                {/* Toggle Active */}
                                <button
                                  onClick={() => {
                                    toggleTariffCondition(t.id, c.id);
                                    showToast(`${c.isActive ? 'Deactivated' : 'Activated'} occasion rule: ${c.name}`);
                                  }}
                                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                                    c.isActive
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}
                                  title={c.isActive ? 'Condition is Active (Click to disable)' : 'Condition Inactive (Click to activate)'}
                                >
                                  {c.isActive ? 'Active' : 'Off'}
                                </button>

                                {/* Edit Condition */}
                                <button
                                  onClick={() => openEditConditionModal(t.id, c)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                  title="Edit Condition"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>

                                {/* Delete Condition */}
                                <button
                                  onClick={() => {
                                    deleteTariffCondition(t.id, c.id);
                                    showToast(`Deleted condition: ${c.name}`);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                  title="Delete Condition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Condition details */}
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="truncate">{c.dateRange}</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{c.adjustedPricePerKwh.toFixed(2)}/kWh
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* DYNAMIC PRICE ADJUSTMENT ROW (EDITABLE FORMAT FOR ALL SLOTS) */}
              {editingId === t.id ? (
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                    Adjust Dynamic Rate (₹/kWh)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewPrice(prev => Math.max(1, +(prev - 0.5).toFixed(2)))}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      step="0.25"
                      min="1"
                      max="100"
                      value={newPrice}
                      onChange={(e) => setNewPrice(+e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setNewPrice(prev => +(prev + 0.5).toFixed(2))}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSaveInline(t.id)}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                    >
                      Save Rate
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      {/* Price Display */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                          ₹{effectivePrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/kWh</span>
                      </div>

                      {/* If Active Occasion Override is different from base price */}
                      {activeCondition && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="line-through">₹{t.pricePerKwh.toFixed(2)}</span>
                          <span className="text-emerald-500 font-bold">Festive Rate</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Stepper + Edit Icon */}
                    <div className="flex items-center gap-1">
                      {/* Quick Decrement */}
                      <button
                        onClick={() => handleQuickAdjust(t, -0.5)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-600 dark:text-slate-300 transition-all"
                        title="Quick step: -₹0.50/kWh"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      {/* Quick Increment */}
                      <button
                        onClick={() => handleQuickAdjust(t, 0.5)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-600 dark:text-slate-300 transition-all"
                        title="Quick step: +₹0.50/kWh"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      {/* Inline Edit Button */}
                      <button
                        onClick={() => { setEditingId(t.id); setNewPrice(t.pricePerKwh); }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-600 dark:text-slate-300 transition-all ml-0.5"
                        title="Edit Dynamic Rate"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Adjustment Live Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Zap className="w-2.5 h-2.5" />
                      <span>Dynamic Adjustment Ready</span>
                    </span>
                    <button 
                      onClick={() => openSlotModal(t)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-sans"
                    >
                      Configure Hours
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 5: DISCOM EV TARIFF RATES BENCHMARK (Page 5) */}
      <div className="rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span>Section 5: State Discom EV Tariff Rates (2025/2026 Base Benchmarks)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official State Electricity Regulatory Commission (SERC) base supply rates before retail CPO markup
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-bold self-start sm:self-auto">
            LT-6 Regulatory Ground Truth
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATE_DISCOM_BENCHMARKS.map((b) => (
            <div key={b.state} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/90 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">{b.state}</span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 block">{b.category}</span>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{b.rate}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{b.notes}</p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Home Charging (AC)</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">₹5 to ₹10 / kWh</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cheapest residential baseline.</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">Public AC Charging (Our Project)</span>
            <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-sm font-mono">₹8 to ₹15 / kWh</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Commercial 2W single-phase markup covering grid & infrastructure.</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Public DC Fast Charging</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm font-mono">₹15 to ₹25 / kWh</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High-capital DC fast chargers for 4-wheelers.</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: OCCASION CONDITIONAL PARAMETER (SLOT 1 + FEATURE) */}
      {/* ======================================================== */}
      {isConditionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingConditionId ? 'Edit Occasion Conditional Parameter' : 'Add Occasion Parameter for Slot 1'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dynamic pricing parameter for festivals, national holidays, and celebrations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConditionModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Quick Template Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {OCCASION_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all font-semibold"
                  >
                    {p.type === 'FESTIVAL' ? '🪔 ' : p.type === 'HOLIDAY' ? '🇮🇳 ' : '🎉 '}
                    {p.name.split(' ')[0]} (₹{p.suggestedRate})
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCondition} className="space-y-4">
              
              {/* Occasion Category and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Occasion Category
                  </label>
                  <select
                    value={conditionForm.type}
                    onChange={(e) => setConditionForm({ ...conditionForm, type: e.target.value as TariffCondition['type'] })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FESTIVAL">🪔 Festival</option>
                    <option value="HOLIDAY">🇮🇳 National Holiday</option>
                    <option value="CELEBRATION">🎉 Special Celebration</option>
                    <option value="WEEKEND">☀️ Weekend Special</option>
                    <option value="CUSTOM">⚙️ Custom Rule</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Occasion Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Festival of Lights"
                    value={conditionForm.name}
                    onChange={(e) => setConditionForm({ ...conditionForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date / Occasion Period & Time Window Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Date Range / Schedule
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oct 28 – Nov 03, or Gazetted Days"
                    value={conditionForm.dateRange}
                    onChange={(e) => setConditionForm({ ...conditionForm, dateRange: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Time Window Condition
                  </label>
                  <select
                    value={conditionForm.timeWindowOverride}
                    onChange={(e) => setConditionForm({ ...conditionForm, timeWindowOverride: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full Day (24 Hours Off-Peak)">Full Day (24 Hours Off-Peak)</option>
                    <option value="Extended Night (08:00 PM – 08:00 AM)">Extended Night (08:00 PM – 08:00 AM)</option>
                    <option value="Standard Slot 1 (10:00 PM – 06:00 AM)">Standard Slot 1 (10:00 PM – 06:00 AM)</option>
                    <option value="Custom Event Window">Custom Event Window</option>
                  </select>
                </div>
              </div>

              {/* Adjusted Dynamic Price */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Adjusted Occasion Rate (₹/kWh)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="50"
                    required
                    value={conditionForm.adjustedPricePerKwh}
                    onChange={(e) => setConditionForm({ ...conditionForm, adjustedPricePerKwh: +e.target.value })}
                    className="w-36 bg-slate-50 dark:bg-navy-950 border border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                  
                  {/* Preset quick buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[5.00, 5.50, 6.00, 6.50].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setConditionForm({ ...conditionForm, adjustedPricePerKwh: val })}
                        className={`text-xs px-2 py-1 rounded-lg border font-mono font-bold transition-all ${
                          conditionForm.adjustedPricePerKwh === val
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ₹{val.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Baseline normal off-peak rate: ₹7.50/kWh. This occasion rate will be applied dynamically to all active sessions when toggled.
                </p>
              </div>

              {/* Policy notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Occasion Note / Rider Notification
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes shown on mobile apps and station LCD screen..."
                  value={conditionForm.notes}
                  onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Active Immediately Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Activate Occasion Parameter Now
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Instantly applies this special rate across Slot 1 billing
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={conditionForm.isActive}
                  onChange={(e) => setConditionForm({ ...conditionForm, isActive: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConditionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingConditionId ? 'Update Condition' : 'Save Condition Parameter'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TIME SLOT CONFIGURATION (FOR ALL SLOTS) */}
      {/* ======================================================== */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 md:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSlotId ? 'Configure Time Slot Tier' : 'Add New Time Slot Tier'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure dynamic pricing, active hours, and grid load rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSlot} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Time Slot Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normal / Off-Peak (Overnight)"
                  value={slotForm.name}
                  onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Slot Identifier Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S_1, S_2, S_3, S_VIP"
                    value={slotForm.slotCode}
                    onChange={(e) => setSlotForm({ ...slotForm, slotCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Dynamic Rate (₹/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="100"
                    required
                    value={slotForm.pricePerKwh}
                    onChange={(e) => setSlotForm({ ...slotForm, pricePerKwh: +e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Active Time Window (Hours)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 PM to 06:00 AM"
                  value={slotForm.timeWindow}
                  onChange={(e) => setSlotForm({ ...slotForm, timeWindow: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Grid Load & Pricing Logic
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cheapest tier to encourage overnight charging when grid demand is lowest."
                  value={slotForm.logic}
                  onChange={(e) => setSlotForm({ ...slotForm, logic: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSlotId ? 'Update Slot Configuration' : 'Create Time Slot Tier'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
