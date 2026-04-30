import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  Settings, X, Loader2, Bookmark, BookOpen, Clock, Check, Edit3, Moon, Sun, Monitor, Search, LayoutPanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker path for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFReaderProps {
  pdfUrl: string;
  initialPage?: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
  title: string;
  totalPages?: number;
}

type ReadingTheme = 'light' | 'sepia' | 'dark';

export function PDFReader({ pdfUrl, initialPage = 1, onPageChange, onClose, title, totalPages: initialTotalPages }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(initialTotalPages || 0);
  const [pageNumber, setPageNumber] = useState<number>(Math.max(1, initialPage));
  const [scale, setScale] = useState<number | null>(null); // null means auto-fit
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement>(null);
  const [inputPage, setInputPage] = useState(String(initialPage));

  // Improvements State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [theme, setTheme] = useState<ReadingTheme>('light');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);

  useEffect(() => {
    if (!viewerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Leave some padding for best fit
        setContainerWidth(entry.contentRect.width - 48);
        setContainerHeight(entry.contentRect.height - 48);
      }
    });

    observer.observe(viewerRef.current);
    return () => observer.disconnect();
  }, [isFocusMode, isNotesOpen]);

  useEffect(() => {
    setInputPage(String(pageNumber));
    onPageChange(pageNumber);
  }, [pageNumber]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const next = prevPageNumber + offset;
      return Math.min(Math.max(1, next), numPages || 1);
    });
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, (prev || 1.0) + delta), 3.0));
  };

  const handleManualPageChange = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputPage);
    if (!isNaN(val) && val >= 1 && val <= (numPages || 1000)) {
      setPageNumber(val);
    } else {
      setInputPage(String(pageNumber));
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handlePanEnd = (_e: any, info: any) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset < 0) {
        // Swipe up -> Next Page
        changePage(1);
      } else {
        // Swipe down -> Prev Page
        changePage(-1);
      }
    }
  };

  const toggleBookmark = () => {
    setBookmarkedPages(prev => 
      prev.includes(pageNumber) 
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const themeFilter = 
    theme === 'dark' ? 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.1)' : 
    theme === 'sepia' ? 'sepia(0.4) brightness(0.95)' : 
    'none';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      onPanEnd={handlePanEnd}
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > 50) {
          changePage(e.deltaY > 0 ? 1 : -1);
        }
      }}
      className={cn(
        "fixed inset-0 z-[150] flex flex-col backdrop-blur-md touch-none transition-colors duration-500 overflow-hidden",
        isFullScreen ? "p-0" : "",
        theme === 'dark' ? "bg-black" : theme === 'sepia' ? "bg-[#f4ecd8]" : "bg-black/95",
        isFocusMode ? "cursor-none" : ""
      )}
      onMouseMove={() => {
        if (isFocusMode) setIsFocusMode(false);
      }}
    >
      {/* Header */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={cn(
              "h-16 flex items-center justify-between px-4 sm:px-8 border-b shrink-0 absolute top-0 left-0 right-0 z-10 transition-colors duration-500",
              theme === 'dark' ? "bg-[#111] border-white/5" : theme === 'sepia' ? "bg-[#efe5cd] border-black/10" : "bg-black/80 border-white/10 backdrop-blur-xl"
            )}
          >
            <div className="flex items-center gap-4 max-w-[50%]">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
              >
                <ChevronLeft className={cn("w-5 h-5 group-hover:-translate-x-0.5 transition-transform", theme === 'light' ? "text-white" : "text-brand-navy")} />
              </button>
              <div>
                <h1 className={cn("font-black text-xs sm:text-sm uppercase tracking-widest truncate", theme === 'light' ? "text-white" : "text-brand-navy")}>{title}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-brand-copper font-black uppercase tracking-widest">Leitor Digital</span>
                  <div className={cn("w-1 h-1 rounded-full", theme === 'light' ? "bg-white/20" : "bg-brand-navy/20")} />
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest", theme === 'light' ? "text-white/40" : "text-brand-navy/60")}>Pág {pageNumber} de {numPages || '?'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <div className={cn("hidden lg:flex items-center gap-1 p-1 rounded-xl border", theme === 'light' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                <button onClick={() => setTheme('light')} className={cn("p-1.5 rounded-lg transition-all", theme === 'light' ? "bg-white/20 text-white" : "text-brand-navy/40 hover:text-brand-navy")}><Sun className="w-4 h-4" /></button>
                <button onClick={() => setTheme('sepia')} className={cn("p-1.5 rounded-lg transition-all", theme === 'sepia' ? "bg-white/50 text-brand-navy shadow-sm" : theme === 'light' ? "text-white/40 hover:text-white" : "text-brand-navy/40 hover:text-brand-navy")}><BookOpen className="w-4 h-4" /></button>
                <button onClick={() => setTheme('dark')} className={cn("p-1.5 rounded-lg transition-all", theme === 'dark' ? "bg-black/40 text-brand-gold shadow-sm" : "text-white/40 hover:text-white")}><Moon className="w-4 h-4" /></button>
              </div>

              <button 
                onClick={toggleBookmark}
                className={cn("p-2 rounded-xl transition-all", bookmarkedPages.includes(pageNumber) ? "text-brand-copper bg-brand-copper/10" : theme === 'light' ? "text-white hover:bg-white/10" : "text-brand-navy hover:bg-black/5")}
              >
                <Bookmark className={cn("w-4 h-4", bookmarkedPages.includes(pageNumber) ? "fill-brand-copper" : "")} />
              </button>

              <button 
                onClick={() => setIsNotesOpen(!isNotesOpen)} 
                className={cn("p-2 rounded-xl transition-all hidden sm:flex", isNotesOpen ? "bg-brand-copper/20 text-brand-copper" : theme === 'light' ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-navy")}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button onClick={() => setScale(null)} className={cn("hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", theme === 'light' ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white" : "bg-black/5 hover:bg-black/10 border border-black/10 text-brand-navy/60 hover:text-brand-navy")}>
                Ajustar
              </button>

              <div className={cn("hidden sm:flex items-center gap-1 p-1 rounded-xl border", theme === 'light' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                <button onClick={() => handleZoom(-0.1)} className={cn("p-1.5 rounded-lg transition-all", theme === 'light' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-brand-navy/60 hover:text-brand-navy hover:bg-black/5")}><ZoomOut className="w-4 h-4" /></button>
                <span className={cn("text-[10px] font-black w-10 text-center", theme === 'light' ? "text-white/40" : "text-brand-navy/60")}>{Math.round((scale || 1) * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className={cn("p-1.5 rounded-lg transition-all", theme === 'light' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-brand-navy/60 hover:text-brand-navy hover:bg-black/5")}><ZoomIn className="w-4 h-4" /></button>
              </div>
              
              <button onClick={toggleFullScreen} className={cn("p-2 rounded-xl transition-all", theme === 'light' ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-navy")}>
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button onClick={onClose} className="p-2 bg-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white rounded-xl transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Viewport */}
        <main 
          ref={viewerRef}
          className={cn(
            "flex-1 overflow-auto flex flex-col items-center justify-center relative transition-all duration-300",
            !isFocusMode ? "pt-16 pb-20" : ""
          )}
          onClick={() => setIsFocusMode(!isFocusMode)}
        >
          <div className="flex items-center justify-center min-w-full min-h-full p-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-brand-copper animate-spin" />
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'light' ? "text-white/40" : "text-brand-navy/40")}>Preparando páginas...</p>
                </div>
              }
              error={
                <div className="text-white p-10 text-center">
                  <p>Falha ao carregar o PDF.</p>
                </div>
              }
            >
              <div style={{ filter: themeFilter }} className="transition-all duration-500">
                <motion.div 
                  key={pageNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-white overflow-hidden relative"
                >
                  {bookmarkedPages.includes(pageNumber) && (
                    <Bookmark className="absolute top-0 right-8 w-8 h-12 text-brand-copper fill-brand-copper z-50 drop-shadow-md" />
                  )}
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale || undefined}
                    width={!scale ? containerWidth : undefined}
                    height={!scale ? containerHeight : undefined}
                    renderAnnotationLayer={true}
                    renderTextLayer={true}
                    loading={null}
                    className="transition-transform duration-200"
                  />
                </motion.div>
              </div>
            </Document>
          </div>
        </main>

        {/* Quick Notes Sidebar */}
        <AnimatePresence>
          {isNotesOpen && !isFocusMode && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={cn(
                "border-l shrink-0 flex flex-col pt-16 pb-20 absolute right-0 top-0 bottom-0 z-0",
                theme === 'light' ? "bg-[#111] border-white/10" : theme === 'sepia' ? "bg-[#efe5cd] border-black/10" : "bg-black/90 border-white/5"
              )}
            >
              <div className="p-4 flex-1 flex flex-col h-full overflow-hidden w-[320px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'light' ? "text-white" : "text-brand-navy")}>Notas Rápidas</h3>
                  <button onClick={() => setIsNotesOpen(false)} className={theme === 'light' ? "text-white/40 hover:text-white" : "text-brand-navy/50 hover:text-brand-navy"}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Seus pensamentos e anotações sobre este livro..."
                  className={cn(
                    "flex-1 w-full rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-copper/30 transition-all text-sm",
                    theme === 'light' 
                      ? "bg-white/5 text-white placeholder:text-white/20 border border-white/10" 
                      : theme === 'sepia' 
                        ? "bg-white/50 text-brand-navy placeholder:text-brand-navy/30 border border-black/5" 
                        : "bg-black text-brand-gold placeholder:text-brand-gold/30 border border-white/5"
                  )}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Controls */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.footer 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className={cn(
              "h-20 shrink-0 border-t flex flex-col justify-center px-4 absolute bottom-0 left-0 right-0 z-10 transition-colors duration-500",
              theme === 'dark' ? "bg-[#111] border-white/5" : theme === 'sepia' ? "bg-[#efe5cd] border-black/10" : "bg-black/80 border-white/10 backdrop-blur-2xl"
            )}
          >
            <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
              <button 
                disabled={pageNumber <= 1}
                onClick={() => changePage(-1)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full border disabled:opacity-20 transition-all",
                  theme === 'light' ? "bg-white/5 border-white/10 text-white hover:bg-brand-copper hover:border-brand-copper" : "bg-black/5 border-black/10 text-brand-navy hover:bg-brand-copper hover:border-brand-copper hover:text-white"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 flex flex-col gap-2">
                <input 
                  type="range" 
                  min={1} 
                  max={numPages || 1} 
                  value={pageNumber} 
                  onChange={(e) => setPageNumber(parseInt(e.target.value))}
                  className="w-full accent-brand-copper h-1 bg-white/10 rounded-full appearance-none outline-none"
                  style={{
                    background: `linear-gradient(to right, #b8860b 0%, #b8860b ${(pageNumber / (numPages || 1)) * 100}%, ${theme === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${(pageNumber / (numPages || 1)) * 100}%, ${theme === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`
                  }}
                />
                <div className="flex justify-between items-center px-1">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", theme === 'light' ? "text-white/40" : "text-brand-navy/60")}>1</span>
                  <form onSubmit={handleManualPageChange} className="flex items-center gap-1">
                    <input 
                      type="text"
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      className={cn("w-8 text-center text-xs font-black focus:outline-none rounded -mt-1", theme === 'light' ? "bg-transparent text-white" : "bg-transparent text-brand-navy")}
                    />
                    <span className={cn("text-[9px] font-black uppercase", theme === 'light' ? "text-white/40" : "text-brand-navy/60")}>/ {numPages || '??'}</span>
                  </form>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", theme === 'light' ? "text-white/40" : "text-brand-navy/60")}>{numPages || '?'}</span>
                </div>
              </div>

              <button 
                disabled={pageNumber >= (numPages || 0)}
                onClick={() => changePage(1)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full border disabled:opacity-20 transition-all",
                  theme === 'light' ? "bg-white/5 border-white/10 text-white hover:bg-brand-copper hover:border-brand-copper" : "bg-black/5 border-black/10 text-brand-navy hover:bg-brand-copper hover:border-brand-copper hover:text-white"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
