import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, DollarSign, CheckCircle2, AlertCircle, 
  Trash2, ArrowUpRight, TrendingDown, Clock, ChevronRight, X, Save,
  CalendarDays, Wallet, CreditCard, Copy, Edit2, Banknote, History
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { AppSettings, FinancialRecord, Event } from '../types';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export default function Financeiro() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: [],
    eventNames: [],
    pushNotifications: false,
    currentCashOnHand: 0,
    lastCashUpdate: Date.now()
  });

  const [records, setRecords] = useStorage<FinancialRecord[]>('templo_finance', []);
  const [events] = useStorage<Event[]>('templo_events', []);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab ] = useState<'mensalidade' | 'extra' | 'oga'>('mensalidade');
  const [showAddModal, setShowAddModal ] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  
  const [selectedCycleIdx, setSelectedCycleIdx] = useState(0);

  // Ogã Projection Logic
  const ogaCycles = useMemo(() => {
    const today = new Date();
    const cycles = [];
    
    // Início do ciclo atual: dia 10 do mês passado se hoje < 10, senão dia 10 deste mês
    let currentStart = new Date(today.getFullYear(), today.getMonth(), 10);
    if (today.getDate() < 10) {
      currentStart.setMonth(currentStart.getMonth() - 1);
    }
    
    // Gerar os próximos 12 ciclos de 10 a 10 (mais meses para planejamento)
    for (let i = 0; i < 12; i++) {
      const start = new Date(currentStart.getFullYear(), currentStart.getMonth() + i, 10);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 10);
      
      const cycleGiras = events.filter(e => {
        if (e.category !== 'Desenvolvimento') return false;
        const [year, month, day] = e.date.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day, 12, 0, 0);
        return eventDate >= start && eventDate < end;
      }).sort((a, b) => a.date.localeCompare(b.date));

      cycles.push({
        start,
        end,
        giras: cycleGiras,
        count: cycleGiras.length,
        totalAmount: cycleGiras.length * 16,
        isCurrent: i === 0
      });
    }
    
    return cycles;
  }, [events]);

  const displayedCycle = useMemo(() => ogaCycles[selectedCycleIdx] || ogaCycles[0], [ogaCycles, selectedCycleIdx]);
  const currentOgaCycle = useMemo(() => ogaCycles[0], [ogaCycles]);

  const { pendingInCurrentCycle } = useMemo(() => {
    if (!currentOgaCycle) return { pendingInCurrentCycle: 0 };
    
    const now = new Date();
    const futureGiras = currentOgaCycle.giras.filter(g => {
      const [year, month, day] = g.date.split('-').map(Number);
      const eventEnd = new Date(year, month - 1, day, 23, 59, 59);
      return eventEnd > now;
    });
    
    return { pendingInCurrentCycle: futureGiras.length * 16 };
  }, [currentOgaCycle]);

  const walletDeficit = Math.max(0, pendingInCurrentCycle - (settings.currentCashOnHand || 0));

  // Automatic Abatement Logic
  React.useEffect(() => {
    if (!settings.lastCashUpdate || !events.length) return;

    const lastUpdate = new Date(settings.lastCashUpdate);
    const now = new Date();
    
    // Find giras that happened between lastUpdate and now (specifically after 23:59 of their day)
    const passedGirasSinceUpdate = events.filter(e => {
      if (e.category !== 'Desenvolvimento') return false;
      const eventEnd = new Date(e.date + 'T23:59:59');
      return eventEnd > lastUpdate && eventEnd < now;
    });

    if (passedGirasSinceUpdate.length > 0) {
      const deduction = passedGirasSinceUpdate.length * 16;
      setSettings(prev => ({
        ...prev,
        currentCashOnHand: Math.max(0, (prev.currentCashOnHand || 0) - deduction),
        lastCashUpdate: now.getTime()
      }));
    }
  }, [events, settings.lastCashUpdate, setSettings]);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDeleteId, setRecordToDeleteId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  // New Record State for Extra expenses
  const [newRecord, setNewRecord] = useState<Partial<FinancialRecord> & { installmentCount?: number }>({
    type: activeTab,
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    paymentAccount: 'Nubank',
    installmentCount: 1
  });

  const [customInstallments, setCustomInstallments] = useState<{ amount: number; dueDate: string }[]>([]);

  // Update installments when count or total changes
  React.useEffect(() => {
    if (newRecord.installmentCount && newRecord.installmentCount > 1) {
      const count = newRecord.installmentCount;
      const totalAmount = Number(newRecord.amount || 0);
      const baseDate = new Date((newRecord.dueDate || new Date().toISOString().split('T')[0]) + 'T12:00:00');
      
      const parts = Array.from({ length: count }).map((_, i) => {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(baseDate.getMonth() + i);
        return {
          amount: Number((totalAmount / count).toFixed(2)),
          dueDate: dueDate.toISOString().split('T')[0]
        };
      });

      // Adjust last part for rounding errors
      const sum = parts.reduce((acc, curr) => acc + curr.amount, 0);
      if (sum !== totalAmount) {
        parts[parts.length - 1].amount = Number((parts[parts.length - 1].amount + (totalAmount - sum)).toFixed(2));
      }

      setCustomInstallments(parts);
    } else {
      setCustomInstallments([]);
    }
  }, [newRecord.installmentCount, newRecord.amount, newRecord.dueDate]);

  // Update newRecord type when modal opens or tab changes
  React.useEffect(() => {
    if (editingRecord) {
      setNewRecord({
        ...editingRecord,
        paymentAccount: editingRecord.paymentAccount || 'Nubank',
        installmentCount: editingRecord.installments?.total || 1
      });
    } else {
      // Manual entries are always 'extra' as per user request
      setNewRecord(prev => ({ 
        ...prev, 
        id: undefined, 
        type: 'extra', 
        description: '', 
        amount: 0, 
        status: 'pending', 
        paymentAccount: 'Nubank',
        installmentCount: 1 
      }));
    }
  }, [activeTab, showAddModal, editingRecord]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Initialize current year mensalidades if they don't exist
  React.useEffect(() => {
    // 1. Correct existing mensalidades that might have the wrong amount or wrong day
    const correctedRecords = records.map(r => {
      if (r.type === 'mensalidade') {
        let updated = false;
        const newR = { ...r };
        if (r.amount !== 110) {
          newR.amount = 110;
          updated = true;
        }
        if (r.dueDate.endsWith('-07')) {
          newR.dueDate = r.dueDate.replace('-07', '-08');
          updated = true;
        }
        return updated ? newR : r;
      }
      return r;
    });

    // Check if we need to update due to correction
    const hasWrongData = records.some(r => 
      r.type === 'mensalidade' && (r.amount !== 110 || r.dueDate.endsWith('-07'))
    );
    
    // 2. Add new mensalidades for the selected year if missing
    const hasYearMensalidades = records.some(r => 
      r.type === 'mensalidade' && 
      new Date(r.dueDate).getFullYear() === selectedYear
    );

    if (!hasYearMensalidades) {
      const newMensalidades: FinancialRecord[] = months.map((month, index) => ({
        id: `mensalidade-${selectedYear}-${index + 1}`,
        type: 'mensalidade',
        description: `Mensalidade ${month}`,
        amount: 110,
        dueDate: `${selectedYear}-${String(index + 1).padStart(2, '0')}-08`,
        status: 'pending',
        category: 'Mensalidade'
      }));
      setRecords([...correctedRecords, ...newMensalidades]);
    } else if (hasWrongData) {
      setRecords(correctedRecords);
    }
  }, [selectedYear, records.length]); // Re-run if year changes or if records were cleared or if amount correction is needed

  const stats = useMemo(() => {
    const yearRecords = records.filter(r => new Date(r.dueDate).getFullYear() === selectedYear);
    const pendingCount = yearRecords.filter(r => r.status === 'pending').length;
    const paidCount = yearRecords.filter(r => r.status === 'paid').length;
    return { pendingCount, paidCount };
  }, [records, selectedYear]);

  const { mensalidadesPendentes, mensalidadesPagas, extras, ogaRecords } = useMemo(() => {
    const yearRecords = records
      .filter(r => new Date(r.dueDate).getFullYear() === selectedYear)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    const m = yearRecords.filter(r => r.type === 'mensalidade');
    return {
      mensalidadesPendentes: m.filter(r => r.status === 'pending'),
      mensalidadesPagas: m.filter(r => r.status === 'paid'),
      extras: yearRecords.filter(r => r.type === 'extra'),
      ogaRecords: yearRecords.filter(r => r.type === 'oga')
    };
  }, [records, selectedYear]);

  const toggleStatus = (id: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const isPaying = r.status === 'pending';
        return {
          ...r,
          status: isPaying ? 'paid' : 'pending',
          paymentDate: isPaying ? new Date().toISOString() : undefined
        };
      }
      return r;
    }));
  };

  const handleAddRecord = () => {
    if (!newRecord.description || !newRecord.amount || !newRecord.dueDate) return;
    
    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? { 
        ...r, 
        description: newRecord.description!, 
        amount: Number(newRecord.amount),
        dueDate: newRecord.dueDate!,
        paymentAccount: newRecord.paymentAccount
      } : r));
    } else {
      const count = newRecord.type === 'extra' ? (newRecord.installmentCount || 1) : 1;
      const masterId = Date.now().toString();
      const newRecordsList: FinancialRecord[] = [];

      if (count > 1 && customInstallments.length === count) {
        // Use manually adjusted installments
        customInstallments.forEach((inst, i) => {
          newRecordsList.push({
            id: `${masterId}-${i}`,
            type: newRecord.type as 'mensalidade' | 'extra' | 'oga',
            description: newRecord.description!,
            amount: inst.amount,
            dueDate: inst.dueDate,
            status: 'pending',
            paymentAccount: newRecord.paymentAccount,
            category: newRecord.type === 'mensalidade' ? 'Mensalidade' : (newRecord.type === 'oga' ? 'Ogã' : 'Extra'),
            installments: {
              current: i + 1,
              total: count,
              masterId: masterId
            }
          });
        });
      } else {
        // One-off or simple splitting
        const baseDate = new Date(newRecord.dueDate + 'T12:00:00');
        for (let i = 0; i < count; i++) {
          const dueDate = new Date(baseDate);
          dueDate.setMonth(baseDate.getMonth() + i);

          newRecordsList.push({
            id: `${masterId}-${i}`,
            type: newRecord.type as 'mensalidade' | 'extra' | 'oga',
            description: newRecord.description!,
            amount: Number(newRecord.amount) / count,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'pending',
            paymentAccount: newRecord.paymentAccount,
            category: newRecord.type === 'mensalidade' ? 'Mensalidade' : (newRecord.type === 'oga' ? 'Ogã' : 'Extra'),
            installments: count > 1 ? {
              current: i + 1,
              total: count,
              masterId: masterId
            } : undefined
          });
        }
      }
      setRecords(prev => [...prev, ...newRecordsList]);
    }

    setShowAddModal(false);
    setEditingRecord(null);
  };

  const deleteRecord = (id: string) => {
    setRecordToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRecord = () => {
    if (recordToDeleteId) {
      setRecords(prev => prev.filter(r => r.id !== recordToDeleteId));
      setRecordToDeleteId(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Year Selector & Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-navy rounded-xl text-white">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className={cn("text-lg font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
              Financeiro {selectedYear}
            </h2>
            <p className="text-[10px] font-bold text-brand-copper uppercase tracking-widest">Controle Mensal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={cn(
              "p-2 rounded-xl text-xs font-black bg-transparent border-0 ring-1 ring-gray-200 dark:ring-white/10 outline-none",
              settings.darkMode ? "text-white" : "text-brand-navy"
            )}
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          
          {activeTab === 'extra' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="w-9 h-9 bg-brand-copper text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-copper/20"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Submenu Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
        {(['mensalidade', 'extra', 'oga'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1",
              activeTab === tab
                ? "bg-brand-navy text-white shadow-lg shadow-brand-navy/20"
                : settings.darkMode ? "text-gray-400" : "text-gray-500"
            )}
          >
            {tab === 'mensalidade' && <Calendar className="w-3.5 h-3.5 mb-0.5" />}
            {tab === 'extra' && <Plus className="w-3.5 h-3.5 mb-0.5" />}
            {tab === 'oga' && <DollarSign className="w-3.5 h-3.5 mb-0.5" />}
            {tab === 'mensalidade' ? 'Mensal' : tab === 'extra' ? 'Gastos Adicionais' : 'Ogã'}
          </button>
        ))}
      </div>

      {/* Info Card - Rule */}
      {activeTab === 'mensalidade' && (
        <div className={cn(
          "mb-6 p-4 rounded-[24px] border-l-4 border-l-brand-copper relative overflow-hidden",
          settings.darkMode ? "bg-black/40 border-gray-800" : "bg-brand-copper/5 border-gray-100"
        )}>
          <div className="flex gap-3 relative z-10">
            <AlertCircle className="w-5 h-5 text-brand-copper shrink-0" />
            <div>
              <p className={cn("text-xs font-bold mb-1", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                Vencimento: Dia 08
              </p>
              <p className="text-[10px] text-gray-500 font-medium leading-tight">
                Pague na conta **Caixa Econômica (Mãe Stela)**.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Wallet className="w-12 h-12 text-brand-copper" />
          </div>
        </div>
      )}


      {/* Monthly Grid/List */}
      <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'mensalidade' && (
            <motion.section
              key="mensalidade"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Account Info Card */}
              <div className={cn(
                "p-5 rounded-[32px] border transition-all relative overflow-hidden",
                settings.darkMode ? "bg-black/40 border-gray-800" : "bg-brand-copper/5 border-gray-100 shadow-sm"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center text-[7px] font-black text-gray-300 uppercase tracking-widest">Caixa</div>
                  <div>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5", settings.darkMode ? "text-white" : "text-brand-navy")}>Mensalidade</p>
                    <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>Caixa Econômica</p>
                  </div>
                </div>
                
                <div className={cn(
                  "p-3 rounded-2xl flex items-center justify-between gap-4 mb-3",
                  settings.darkMode ? "bg-white/5" : "bg-white shadow-sm"
                )}>
                  <div className="overflow-hidden">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Chave PIX (CPF)</p>
                    <p className={cn("text-base font-mono font-black tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>33464358810</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard('33464358810', 'caixa')}
                    className="w-8 h-8 bg-brand-copper text-white rounded-lg flex items-center justify-center shadow-lg shadow-brand-copper/20 active:scale-90 transition-all shrink-0"
                  >
                    {copied === 'caixa' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 font-medium px-1">Conta exclusiva para o pagamento das mensalidades.</p>
              </div>

              {/* Pendentes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest leading-none">Para Pagar</p>
                  <span className="text-[9px] font-bold text-brand-copper bg-brand-copper/5 px-2 py-0.5 rounded-full">Dia 08</span>
                </div>
                {mensalidadesPendentes.map((record) => (
                  <motion.div
                    layout
                    key={record.id}
                    className={cn(
                      "p-4 rounded-[28px] border transition-all flex items-center justify-between",
                      settings.darkMode ? "bg-black/40 border-gray-800" : "bg-white border-gray-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 dark:bg-white/5 text-gray-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className={cn("text-xs font-black tracking-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                          {record.description}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Vence em {new Date(record.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <p className={cn("text-[10px] font-black text-brand-copper")}>
                            R$ {record.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleStatus(record.id)}
                        className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all bg-brand-navy text-white"
                      >
                        Pagar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {mensalidadesPendentes.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] flex flex-col items-center justify-center opacity-30 text-center">
                    <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Tudo em dia!</p>
                  </div>
                )}
              </div>

              {/* Pagas */}
              <div className="space-y-3">
                {mensalidadesPagas.length > 0 && (
                  <p className="text-[9px] font-black text-green-500/60 uppercase tracking-widest ml-1">Confirmadas</p>
                )}
                {mensalidadesPagas.map((record) => (
                  <motion.div
                    layout
                    key={record.id}
                    className={cn(
                      "p-4 rounded-[28px] border transition-all flex items-center justify-between",
                      settings.darkMode ? "bg-green-500/5 border-green-500/20" : "bg-green-50 border-green-100"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-500 text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className={cn("text-xs font-black tracking-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                          {record.description}
                        </h3>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-[10px] font-black text-green-600/70")}>
                              R$ {record.amount.toFixed(2)}
                            </p>
                            {record.paymentDate && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-green-300" />
                                <p className="text-[8px] font-bold text-green-600/50 uppercase">
                                  Pago em {new Date(record.paymentDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleStatus(record.id)}
                        className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all bg-green-500 text-white shadow-lg shadow-green-500/20"
                      >
                        Pago
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'extra' && (
            <motion.section
              key="extra"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Account Info Cards - Side by Side */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                {/* Caixa Card */}
                <div className={cn(
                  "p-4 rounded-[32px] border transition-all relative overflow-hidden flex flex-col",
                  settings.darkMode ? "bg-black/40 border-gray-800" : "bg-brand-copper/5 border-gray-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center text-[6px] font-black text-gray-300 uppercase tracking-widest">Caixa</div>
                    <div>
                      <p className={cn("text-[8px] font-black uppercase tracking-widest opacity-40", settings.darkMode ? "text-white" : "text-brand-navy")}>Caixa Econômica</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-2 rounded-xl flex items-center justify-between gap-2 mt-auto",
                    settings.darkMode ? "bg-white/5" : "bg-white shadow-sm"
                  )}>
                    <div className="overflow-hidden min-w-0">
                      <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">PIX (CPF)</p>
                      <p className={cn("text-[11px] font-mono font-black tracking-widest truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>33464358810</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('33464358810', 'caixa-extra')}
                      className="w-6 h-6 bg-brand-copper text-white rounded-lg flex items-center justify-center shadow-lg shadow-brand-copper/20 active:scale-90 transition-all shrink-0"
                    >
                      {copied === 'caixa-extra' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Nubank Card */}
                <div className={cn(
                  "p-4 rounded-[32px] border transition-all relative overflow-hidden flex flex-col",
                  settings.darkMode ? "bg-black/40 border-gray-800" : "bg-[#8A05BE]/5 border-gray-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center text-[6px] font-black text-gray-300 uppercase tracking-widest">Nubank</div>
                    <div>
                      <p className={cn("text-[8px] font-black uppercase tracking-widest opacity-40", settings.darkMode ? "text-white" : "text-brand-navy")}>Nubank</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-2 rounded-xl flex items-center justify-between gap-2 mt-auto",
                    settings.darkMode ? "bg-white/5" : "bg-white shadow-sm"
                  )}>
                    <div className="overflow-hidden min-w-0">
                      <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">PIX (Cel)</p>
                      <p className={cn("text-[11px] font-mono font-black tracking-widest truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>11982350614</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('11982350614', 'nubank-extra')}
                      className="w-6 h-6 bg-[#8A05BE] text-white rounded-lg flex items-center justify-center shadow-lg shadow-[#8A05BE]/20 active:scale-90 transition-all shrink-0"
                    >
                      {copied === 'nubank-extra' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-1 flex justify-between items-center">
                <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                  Gastos Extras
                </h3>
              </div>
              
              <div className="space-y-3">
                {extras.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] flex flex-col items-center justify-center opacity-30 text-center">
                    <Plus className="w-8 h-8 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Nenhum gasto extra<br/>registrado</p>
                  </div>
                ) : (
                  extras.map((record) => (
                    <motion.div
                      layout
                      key={record.id}
                      className={cn(
                        "p-4 rounded-[28px] border transition-all flex items-center justify-between group",
                        record.status === 'paid' 
                          ? (settings.darkMode ? "bg-green-500/5 border-green-500/20" : "bg-green-50 border-green-100") 
                          : (settings.darkMode ? "bg-black/40 border-gray-800" : "bg-white border-gray-100 shadow-sm")
                      )}
                    >
                      {/* Similar record item layout as extra above... reusing common pattern */}
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          record.status === 'paid' ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                        )}>
                          {record.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn("text-xs font-black tracking-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                              {record.description}
                            </h3>
                            {record.installments && (
                              <span className="text-[8px] font-black bg-brand-navy/10 text-brand-navy px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                                {record.installments.current}/{record.installments.total}
                              </span>
                            )}
                            {record.paymentAccount && (
                              <span className={cn(
                                "text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0",
                                record.paymentAccount === 'Nubank' ? "bg-[#8A05BE]/10 text-[#8A05BE]" : "bg-brand-navy/10 text-brand-navy"
                              )}>
                                {record.paymentAccount}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(record.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </p>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <p className={cn("text-[10px] font-black", settings.darkMode ? "text-gray-300" : "text-brand-copper")}>
                                R$ {record.amount.toFixed(2)}
                              </p>
                            </div>
                            {record.paymentDate && (
                              <p className="text-[8px] font-bold text-green-500 uppercase mt-0.5">
                                Pago em {new Date(record.paymentDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRecord(record);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-brand-navy dark:hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteRecord(record.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleStatus(record.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                            record.status === 'paid'
                              ? "bg-green-500 text-white"
                              : "bg-brand-navy text-white"
                          )}
                        >
                          {record.status === 'paid' ? 'Pago' : 'Pagar'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section >
          )}

          {activeTab === 'oga' && (
            <motion.section
              key="oga"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Dashboard de Status - Ogã */}
              <div className="space-y-4">
                <div className={cn(
                  "p-6 rounded-[32px] border transition-all relative overflow-hidden",
                  settings.darkMode ? "bg-brand-navy/20 border-brand-navy/30" : "bg-brand-navy border-brand-navy text-white shadow-xl shadow-brand-navy/20"
                )}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none mb-1">Saldo na Carteira</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/40">R$</span>
                            <input
                              type="number"
                              value={settings.currentCashOnHand || 0}
                              onChange={(e) => setSettings({ 
                                ...settings, 
                                currentCashOnHand: Number(e.target.value),
                                lastCashUpdate: Date.now()
                              })}
                              className="w-24 bg-transparent text-3xl font-black text-white border-none focus:ring-0 p-0 placeholder-white/20"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none mb-1">Pendente no Ciclo</p>
                        <p className="text-2xl font-black text-white">R$ {pendingInCurrentCycle.toFixed(2)}</p>
                        {currentOgaCycle && (
                          <p className="text-[8px] font-bold text-white/40 uppercase mt-1">
                            {currentOgaCycle.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} — {currentOgaCycle.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {walletDeficit > 0 ? (
                      <div className="bg-brand-copper/20 border border-brand-copper/30 rounded-2xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-brand-copper shrink-0" />
                        <div>
                          <p className="text-[11px] font-black uppercase text-brand-copper leading-none mb-1">Atenção: Necessário Saque</p>
                          <p className="text-[10px] font-medium text-white/80 leading-tight">
                            Você precisa de mais <span className="font-bold underline decoration-brand-copper/50 underline-offset-2">R$ {walletDeficit.toFixed(2)}</span> em espécie para cobrir as giras até o dia 10.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <div>
                          <p className="text-[11px] font-black uppercase text-green-400 leading-none mb-1">Tudo em Ordem</p>
                          <p className="text-[10px] font-medium text-white/80 leading-tight">
                            Seu saldo atual cobre todas as giras de desenvolvimento programadas para este ciclo.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-8 -right-8 opacity-10 rotate-12">
                    <Banknote className="w-40 h-40" />
                  </div>
                </div>
              </div>

              {/* Linha do Tempo e Planejamento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-brand-navy/30 dark:text-white/30" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/40 dark:text-white/40">Cronograma de Ciclos</h3>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase italic">Toque para ver detalhes</p>
                </div>
                
                <div className="space-y-3">
                  {ogaCycles.map((cycle, idx) => {
                    const isSelected = selectedCycleIdx === idx;
                    const isCurrent = cycle.isCurrent;
                    const monthName = cycle.start.toLocaleDateString('pt-BR', { month: 'short' });
                    const nextMonthName = cycle.end.toLocaleDateString('pt-BR', { month: 'short' });
                    
                    return (
                      <div key={idx} className="group">
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCycleIdx(isSelected ? -1 : idx)}
                          className={cn(
                            "w-full p-4 rounded-[28px] border transition-all text-left flex items-center gap-4",
                            isSelected
                              ? (settings.darkMode ? "bg-brand-navy/40 border-brand-navy ring-1 ring-brand-navy/30" : "bg-brand-navy/5 border-brand-navy/20")
                              : (settings.darkMode ? "bg-black/40 border-gray-800" : "bg-white border-gray-100 shadow-sm")
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-colors",
                            isSelected 
                              ? "bg-brand-navy text-white border-brand-navy/20" 
                              : settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                          )}>
                            <p className={cn("text-[9px] font-black uppercase leading-none", isSelected ? "text-white" : "text-brand-navy")}>10</p>
                            <p className={cn("text-[10px] font-black uppercase leading-none mt-1", isSelected ? "text-white" : "text-brand-copper")}>{monthName}</p>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={cn("text-xs font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                                Ciclo {monthName} — {nextMonthName}
                              </h4>
                              {isCurrent && (
                                <span className="text-[7px] font-black uppercase bg-brand-copper/10 text-brand-copper px-2 py-0.5 rounded-full ring-1 ring-brand-copper/20">Atual</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <p className={cn("text-[11px] font-black", settings.darkMode ? "text-white/60" : "text-brand-navy/60")}>
                                R$ {cycle.totalAmount.toFixed(2)}
                              </p>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <p className="text-[9px] font-bold uppercase text-gray-400">
                                {cycle.count} Giras de Desenv.
                              </p>
                            </div>
                          </div>
                          
                          <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isSelected ? "rotate-90 text-brand-copper" : "text-gray-300")} />
                        </motion.button>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-brand-navy/5 dark:bg-white/5 rounded-b-[28px] mx-2 -mt-4 pt-6 pb-4 px-2 space-y-2 border-x border-b border-gray-100 dark:border-gray-800"
                            >
                              <div className="space-y-1.5">
                                {cycle.giras.map((gira) => {
                                  const [year, month, day] = gira.date.split('-').map(Number);
                                  const giraEndTime = new Date(year, month - 1, day, 23, 59, 59);
                                  const hasPassed = giraEndTime < new Date();

                                  return (
                                    <div
                                      key={gira.id}
                                      className={cn(
                                        "p-3 rounded-2xl flex items-center justify-between border transition-all",
                                        hasPassed
                                          ? (settings.darkMode ? "bg-green-500/5 border-green-500/10 opacity-40" : "bg-green-50/50 border-green-100 opacity-60")
                                          : (settings.darkMode ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm")
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                          hasPassed ? "bg-green-500 text-white" : "bg-white dark:bg-white/5 text-gray-400"
                                        )}>
                                          {hasPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                          <h4 className={cn("text-[10px] font-black leading-none mb-1", settings.darkMode ? "text-white" : "text-brand-navy")}>
                                            {gira.title}
                                          </h4>
                                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                            {new Date(gira.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className={cn("text-[10px] font-black", hasPassed ? "text-green-600" : "text-brand-copper/80")}>
                                          R$ 16,00
                                        </p>
                                        {hasPassed && <span className="text-[7px] font-black uppercase text-green-500 block leading-none">Concluído</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                                {cycle.giras.length === 0 && (
                                  <div className="p-8 text-center opacity-30">
                                    <p className="text-[9px] font-black uppercase tracking-widest italic">Nenhuma gira para este ciclo</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 p-8 rounded-t-[40px] z-[120] shadow-2xl",
                settings.darkMode ? "bg-[#1A1A1A]" : "bg-white"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={cn("text-xl font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                  {editingRecord ? 'Editar Registro' : 'Novo Registro'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                  }} 
                  className="p-2 rounded-full bg-gray-100 dark:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Conta para Pagamento</label>
                  <div className="flex gap-2">
                    {(['Nubank', 'Caixa Econômica'] as const).map(account => (
                      <button
                        key={account}
                        onClick={() => setNewRecord({ ...newRecord, paymentAccount: account })}
                        className={cn(
                          "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all",
                          newRecord.paymentAccount === account 
                            ? (account === 'Nubank' ? "bg-[#8A05BE] text-white shadow-xl" : "bg-brand-navy text-white shadow-xl")
                            : "bg-gray-100 dark:bg-white/5 text-gray-400"
                        )}
                      >
                        {account}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Descrição</label>
                  <input 
                    type="text"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    className={cn(
                      "w-full bg-gray-50 dark:bg-black/40 border-0 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                      settings.darkMode && "text-white"
                    )}
                    placeholder="Ex: Banho de ervas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Valor Total (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">R$</span>
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={newRecord.amount || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setNewRecord({ ...newRecord, amount: val === '' ? 0 : Number(val) });
                        }}
                        className={cn(
                          "w-full bg-gray-50 dark:bg-black/40 border-0 p-4 pl-10 rounded-2xl text-sm font-black focus:ring-2 focus:ring-brand-copper/20 outline-none",
                          settings.darkMode && "text-white"
                        )}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">1ª Parcela em</label>
                    <input 
                      type="date"
                      value={newRecord.dueDate}
                      onChange={(e) => setNewRecord({ ...newRecord, dueDate: e.target.value })}
                      className={cn(
                        "w-full bg-gray-50 dark:bg-black/40 border-0 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "text-white"
                      )}
                    />
                  </div>
                </div>

                {newRecord.type === 'extra' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">
                        Parcelamento
                      </label>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-1.5 rounded-2xl">
                        <input 
                          type="range"
                          min="1"
                          max="12"
                          value={newRecord.installmentCount || 1}
                          onChange={(e) => setNewRecord({ ...newRecord, installmentCount: Number(e.target.value) })}
                          className="flex-1 accent-brand-navy h-2"
                        />
                        <div className="w-12 text-center">
                          <span className={cn("text-sm font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            {newRecord.installmentCount || 1}x
                          </span>
                        </div>
                      </div>
                      {(newRecord.installmentCount || 1) > 1 && (
                        <p className="text-[9px] font-bold text-gray-400 mt-2 ml-1">
                          Distribuição inicial: <span className="text-brand-copper">R$ {((Number(newRecord.amount) || 0) / (newRecord.installmentCount || 1)).toFixed(2)}</span> p/ parcela.
                        </p>
                      )}
                    </div>

                    {/* Custom Installment Editor */}
                    {(newRecord.installmentCount || 1) > 1 && (
                      <div className="bg-gray-50 dark:bg-black/20 rounded-[32px] p-4 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-navy dark:text-white/40">Detalhamento das Parcelas</h4>
                          <span className={cn(
                            "text-[8px] font-black px-2 py-0.5 rounded-full uppercase",
                            Math.abs(customInstallments.reduce((acc, curr) => acc + curr.amount, 0) - Number(newRecord.amount)) < 0.01
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          )}>
                            Soma: R$ {customInstallments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="max-h-[160px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                          {customInstallments.map((inst, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded-lg bg-brand-navy text-white text-[8px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </div>
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400">R$</span>
                                <input 
                                  type="number"
                                  value={inst.amount}
                                  onChange={(e) => {
                                    const newInsts = [...customInstallments];
                                    newInsts[idx].amount = Number(e.target.value);
                                    setCustomInstallments(newInsts);
                                  }}
                                  className="w-full bg-white dark:bg-white/5 border-0 p-2 pl-7 rounded-xl text-[11px] font-black focus:ring-1 focus:ring-brand-copper outline-none dark:text-white"
                                />
                              </div>
                              <input 
                                type="date"
                                value={inst.dueDate}
                                onChange={(e) => {
                                  const newInsts = [...customInstallments];
                                  newInsts[idx].dueDate = e.target.value;
                                  setCustomInstallments(newInsts);
                                }}
                                className="w-32 bg-white dark:bg-white/5 border-0 p-2 rounded-xl text-[11px] font-bold outline-none dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={handleAddRecord}
                  disabled={!newRecord.description || !newRecord.amount}
                  className="w-full bg-brand-navy text-white text-xs font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingRecord ? 'Salvar Alterações' : 'Salvar Registro'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setRecordToDeleteId(null);
        }}
        onConfirm={confirmDeleteRecord}
        title="Excluir Registro"
        message="Deseja realmente excluir este registro financeiro?"
      />
    </motion.div>
  );
}

