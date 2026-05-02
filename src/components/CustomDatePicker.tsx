import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  darkMode?: boolean;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const DAYS_OF_WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export function CustomDatePicker({ isOpen, onClose, value, onChange, darkMode }: CustomDatePickerProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      // Important to use local timezone equivalent time so day is correct
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date();
  });
  
  const [view, setView] = useState<'days' | 'years'>('days');
  const [yearScrollRef, setYearScrollRef] = useState<HTMLDivElement | null>(null);

  // Sync internal state when opened
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const [year, month, day] = value.split('-');
        setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
      } else {
        setCurrentDate(new Date());
      }
      setView('days');
    }
  }, [isOpen, value]);

  // Scroll to current year when switching to years view
  useEffect(() => {
    if (view === 'years' && yearScrollRef) {
      const selectedYearEl = yearScrollRef.querySelector('.selected-year') as HTMLElement;
      if (selectedYearEl) {
        selectedYearEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [view, yearScrollRef]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(year, month, day);
    setCurrentDate(newDate);
    // Format to YYYY-MM-DD local time
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    onClose();
  };

  const handleSelectYear = (selectedYear: number) => {
    setCurrentDate(new Date(selectedYear, month, currentDate.getDate()));
    setView('days');
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksBefore = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Generate years list (e.g., 100 years back to 10 years future)
  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: 110 }, (_, i) => currentYear - 100 + i);

  // Formatted selected value
  const selectedDateObj = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }, [value]);

  const displayFormat = useMemo(() => {
    if (!selectedDateObj) return "Selecione a data";
    const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    let text = formatter.format(selectedDateObj);
    text = text.replace('.', ''); // remove trailing dot
    // capitalize first letter appropriately
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, [selectedDateObj]);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "w-full max-w-[320px] rounded-[24px] overflow-hidden shadow-2xl pointer-events-auto flex flex-col",
                darkMode ? "bg-[#1E1E1E]" : "bg-white"
              )}
            >
              {/* Header */}
              <div className={cn(
                "p-6 flex flex-col",
                darkMode ? "bg-white/5" : "bg-brand-navy"
              )}>
                <button 
                  onClick={() => setView(view === 'years' ? 'days' : 'years')}
                  className={cn(
                    "text-sm font-bold text-left mb-1 w-max transition-colors",
                    darkMode ? "text-gray-400 hover:text-white" : "text-white/70 hover:text-white"
                  )}
                >
                  {selectedDateObj ? selectedDateObj.getFullYear() : currentYear}
                </button>
                <div className={cn("text-[28px] font-black tracking-tight", darkMode ? "text-white" : "text-white")}>
                  {displayFormat}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 relative min-h-[280px] flex flex-col">
                {view === 'days' ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={handlePrevMonth}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                        )}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setView('years')}
                        className={cn(
                          "font-bold text-sm transition-colors",
                          darkMode ? "text-white hover:text-brand-copper" : "text-brand-navy hover:text-brand-copper"
                        )}
                      >
                        {MONTHS[month]} de {year}
                      </button>
                      <button 
                        onClick={handleNextMonth}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                        )}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS_OF_WEEK.map((d, i) => (
                        <div key={i} className={cn(
                          "text-center text-[10px] font-black uppercase tracking-wider",
                          darkMode ? "text-gray-500" : "text-gray-400"
                        )}>
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {blanksBefore.map((_, i) => (
                        <div key={`blank-${i}`} className="h-10 border border-transparent" />
                      ))}
                      {daysArray.map((day) => {
                        const isSelected = selectedDateObj?.getDate() === day && selectedDateObj?.getMonth() === month && selectedDateObj?.getFullYear() === year;
                        const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                        
                        return (
                          <button
                            key={day}
                            onClick={() => handleSelectDay(day)}
                            className={cn(
                              "h-10 w-full flex items-center justify-center rounded-full text-sm font-medium transition-all",
                              isSelected 
                                ? "bg-brand-copper text-white shadow-md shadow-brand-copper/20 font-bold" 
                                : isToday
                                  ? darkMode ? "text-brand-copper font-bold" : "text-brand-copper font-bold"
                                  : darkMode 
                                    ? "text-gray-300 hover:bg-white/10" 
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    ref={setYearScrollRef}
                    className="absolute inset-0 overflow-y-auto grid grid-cols-3 gap-2 p-4 max-h-[320px] scrollbar-hide"
                  >
                    {yearsArray.map((y) => {
                      const isSelectedYear = selectedDateObj ? selectedDateObj.getFullYear() === y : currentYear === y;
                      return (
                        <button
                          key={y}
                          onClick={() => handleSelectYear(y)}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold transition-all",
                            isSelectedYear 
                              ? "bg-brand-copper text-white shadow-md shadow-brand-copper/20 selected-year" 
                              : darkMode
                                ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-brand-navy"
                          )}
                        >
                          {y}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
              
              {/* Footer Actions */}
              <div className={cn(
                "p-4 pt-2 flex justify-end gap-2",
              )}>
                <button 
                  onClick={onClose}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
                    darkMode ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-brand-navy hover:bg-gray-50"
                  )}
                >
                  Cancelar
                </button>
              </div>

            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
