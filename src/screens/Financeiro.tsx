import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, DollarSign, CheckCircle2, AlertCircle, 
  Trash2, ArrowUpRight, TrendingDown, Clock, ChevronRight, X, Save,
  CalendarDays, Wallet, CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { AppSettings, FinancialRecord } from '../types';

export default function Financeiro() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: [],
    eventNames: [],
    pushNotifications: false
  });

  const [records, setRecords] = useStorage<FinancialRecord[]>('templo_finance', []);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'mensalidade' | 'extra' | 'oga'>('mensalidade');
  const [showAddModal, setShowAddModal ] = useState(false);
  
  // New Record State for Extra expenses
  const [newRecord, setNewRecord] = useState<Partial<FinancialRecord> & { installmentCount?: number }>({
    type: activeTab,
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
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
    // Manual entries are always 'extra' as per user request
    setNewRecord(prev => ({ ...prev, type: 'extra' }));
  }, [activeTab, showAddModal]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Initialize current year mensalidades if they don't exist
  React.useEffect(() => {
    // 1. Correct existing mensalidades that might have the wrong amount
    const correctedRecords = records.map(r => {
      if (r.type === 'mensalidade' && r.amount !== 110) {
        return { ...r, amount: 110 };
      }
      return r;
    });

    // Check if we need to update due to correction
    const hasWrongAmount = records.some(r => r.type === 'mensalidade' && r.amount !== 110);
    
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
    } else if (hasWrongAmount) {
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
    setRecords(records.map(r => {
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
    
    const count = newRecord.type === 'extra' ? (newRecord.installmentCount || 1) : 1;
    const masterId = Date.now().toString();
    const newRecords: FinancialRecord[] = [];

    if (count > 1 && customInstallments.length === count) {
      // Use manually adjusted installments
      customInstallments.forEach((inst, i) => {
        newRecords.push({
          id: `${masterId}-${i}`,
          type: newRecord.type as 'mensalidade' | 'extra' | 'oga',
          description: newRecord.description!,
          amount: inst.amount,
          dueDate: inst.dueDate,
          status: 'pending',
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

        newRecords.push({
          id: `${masterId}-${i}`,
          type: newRecord.type as 'mensalidade' | 'extra' | 'oga',
          description: newRecord.description!,
          amount: Number(newRecord.amount) / count,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'pending',
          category: newRecord.type === 'mensalidade' ? 'Mensalidade' : (newRecord.type === 'oga' ? 'Ogã' : 'Extra'),
          installments: count > 1 ? {
            current: i + 1,
            total: count,
            masterId: masterId
          } : undefined
        });
      }
    }

    setRecords([...records, ...newRecords]);
    setShowAddModal(false);
    setNewRecord({
      type: 'extra',
      description: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      installmentCount: 1
    });
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setRecords(records.filter(r => r.id !== id));
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
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 bg-brand-copper text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-copper/20"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
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
                            Vence em {new Date(record.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
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
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(record.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
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
                        <button 
                          onClick={() => deleteRecord(record.id)}
                          className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              className="space-y-4"
            >
              <div className={cn(
                "p-6 rounded-[32px] border transition-all text-center relative overflow-hidden",
                settings.darkMode ? "bg-black/40 border-gray-800" : "bg-brand-navy/5 border-gray-100"
              )}>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-brand-navy/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h3 className={cn("text-sm font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    Pagamento de Curimba
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium max-w-[200px] mx-auto mt-1">
                    Controle específico para os Ogãs responsáveis pela curimba do Templo.
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-5 rotate-12">
                  <DollarSign className="w-24 h-24 text-brand-navy" />
                </div>
              </div>
              
              <div className="space-y-3">
                {ogaRecords.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] flex flex-col items-center justify-center opacity-30 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight italic">
                      Aguardando registros<br/>específicos do sistema
                    </p>
                  </div>
                ) : (
                  ogaRecords.map((record) => (
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
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          record.status === 'paid' ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                        )}>
                          {record.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                        </div>
                        
                        <div className="min-w-0">
                          <h3 className={cn("text-xs font-black tracking-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            {record.description}
                          </h3>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(record.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
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
                  Novo Registro
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-gray-100 dark:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Tipo</label>
                  <div className="flex gap-2">
                    {(['extra'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewRecord({ ...newRecord, type: type as 'extra' | 'mensalidade' })}
                        className={cn(
                          "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                          newRecord.type === type 
                            ? "bg-brand-navy text-white shadow-xl" 
                            : "bg-gray-100 dark:bg-white/5 text-gray-400"
                        )}
                      >
                        {type === 'extra' ? 'Gasto Adicional' : 'Mensalidade'}
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
                  Salvar Registro
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

