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
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Record State
  const [newRecord, setNewRecord] = useState<Partial<FinancialRecord>>({
    type: 'mensalidade',
    description: 'Mensalidade Abril',
    amount: 100,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isStatusMatch = r.status === activeTab;
      const isSearchMatch = r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return isStatusMatch && isSearchMatch;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [records, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const pendingAmount = records.filter(r => r.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
    const paidAmount = records.filter(r => r.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    return { pendingAmount, paidAmount };
  }, [records]);

  const handleAddRecord = () => {
    if (!newRecord.description || !newRecord.amount || !newRecord.dueDate) return;
    
    const record: FinancialRecord = {
      id: Date.now().toString(),
      type: newRecord.type as 'mensalidade' | 'extra',
      description: newRecord.description,
      amount: Number(newRecord.amount),
      dueDate: newRecord.dueDate,
      status: 'pending',
      category: newRecord.type === 'mensalidade' ? 'Mensalidade' : 'Extra'
    };

    setRecords([...records, record]);
    setShowAddModal(false);
    setNewRecord({
      type: 'mensalidade',
      description: '',
      amount: 100,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

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

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={cn(
          "p-4 rounded-[24px] border transition-all",
          settings.darkMode ? "bg-black/40 border-gray-800" : "bg-white border-gray-100 shadow-sm"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <TrendingDown className="w-3 h-3 text-red-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Em Aberto</span>
          </div>
          <p className={cn("text-lg font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
            R$ {stats.pendingAmount.toFixed(2)}
          </p>
        </div>

        <div className={cn(
          "p-4 rounded-[24px] border transition-all",
          settings.darkMode ? "bg-black/40 border-gray-800" : "bg-white border-gray-100 shadow-sm"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pagas</span>
          </div>
          <p className={cn("text-lg font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
            R$ {stats.paidAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center justify-between mb-6">
        <div className={cn(
          "flex p-1 rounded-2xl",
          settings.darkMode ? "bg-black/40" : "bg-gray-100"
        )}>
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'pending' 
                ? "bg-brand-navy text-white shadow-lg" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            Abertas
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'paid' 
                ? "bg-brand-navy text-white shadow-lg" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            Pagas
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 bg-brand-copper text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-copper/30"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 overflow-y-auto pb-8 scrollbar-hide">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-30">
            <DollarSign className="w-12 h-12 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-center">
              Nenhum registro encontrado
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <motion.div
              layout
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "p-4 rounded-[24px] border transition-all group relative",
                settings.darkMode ? "bg-black/40 border-gray-800" : "bg-white border-gray-100 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  record.status === 'paid' ? "bg-green-500/10" : "bg-brand-copper/10"
                )}>
                  {record.type === 'mensalidade' ? (
                    <CalendarDays className={cn("w-6 h-6", record.status === 'paid' ? "text-green-500" : "text-brand-copper")} />
                  ) : (
                    <CreditCard className={cn("w-6 h-6", record.status === 'paid' ? "text-green-500" : "text-brand-copper")} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn("font-bold text-sm truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      {record.description}
                    </p>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                      record.type === 'mensalidade' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {record.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      <Clock className="w-3 h-3" />
                      {new Date(record.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className={cn("text-[11px] font-black", settings.darkMode ? "text-gray-300" : "text-brand-navy")}>
                      R$ {record.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(record.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      record.status === 'paid' 
                        ? "bg-green-500 text-white" 
                        : (settings.darkMode ? "bg-white/5 text-gray-500 hover:bg-white/10" : "bg-gray-50 text-gray-400 hover:bg-gray-100")
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                      settings.darkMode ? "hover:bg-red-500/20 text-gray-500" : "hover:bg-red-50 text-gray-400"
                    )}
                  >
                    <Trash2 className="w-4 h-4 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              <div className="flex justify-between items-center mb-8">
                <h2 className={cn("text-xl font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                  Novo Registro
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-gray-100 dark:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  {(['mensalidade', 'extra'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewRecord({ ...newRecord, type, description: type === 'mensalidade' ? 'Mensalidade ' + new Date().toLocaleString('pt-BR', { month: 'long' }) : '' })}
                      className={cn(
                        "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                        newRecord.type === type 
                          ? "bg-brand-navy text-white shadow-xl" 
                          : "bg-gray-100 dark:bg-black/40 text-gray-400"
                      )}
                    >
                      {type}
                    </button>
                  ))}
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
                    placeholder="Ex: Mensalidade Maio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Valor (R$)</label>
                    <input 
                      type="number"
                      value={newRecord.amount}
                      onChange={(e) => setNewRecord({ ...newRecord, amount: Number(e.target.value) })}
                      className={cn(
                        "w-full bg-gray-50 dark:bg-black/40 border-0 p-4 rounded-2xl text-sm font-black focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "text-white"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Data Combinada</label>
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

                <button 
                  onClick={handleAddRecord}
                  disabled={!newRecord.description || !newRecord.amount}
                  className="w-full bg-brand-navy text-white text-xs font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
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
