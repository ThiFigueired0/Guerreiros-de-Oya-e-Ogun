import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  Settings, X, Loader2, Bookmark, BookOpen, Clock, Check
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
  }, []);

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
        // Swiped up -> user wants to go back? 
        // User said: "deslizar para baixo -> próxima, deslizar para cima -> anterior"
        // In gesture terms: 
        // Swipe Down (offset > 0) -> Next
        // Swipe Up (offset < 0) -> Previous
        changePage(-1);
      } else {
        changePage(1);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      onPanEnd={handlePanEnd}
      onWheel={(e) => {
        // Simple wheel-to-page navigation
        if (Math.abs(e.deltaY) > 50) {
          changePage(e.deltaY > 0 ? 1 : -1);
        }
      }}
      className={cn(
        "fixed inset-0 z-[150] bg-black/95 flex flex-col backdrop-blur-md touch-none",
        isFullScreen ? "p-0" : ""
      )}
    >
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/10 shrink-0 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-4 max-w-[60%]">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-white font-black text-xs sm:text-sm uppercase tracking-widest truncate">{title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-brand-copper font-black uppercase tracking-widest">Leitor Digital</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Pág {pageNumber} de {numPages || '?'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <button 
            onClick={() => setScale(null)} 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
          >
            Ajustar
          </button>
          <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-[10px] font-black text-white/40 w-10 text-center">{Math.round((scale || 1) * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><ZoomIn className="w-4 h-4" /></button>
          </div>
          
          <button onClick={toggleFullScreen} className="p-2 hover:bg-white/10 rounded-xl text-white transition-all">
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button onClick={onClose} className="p-2 bg-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white rounded-xl transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main 
        ref={viewerRef}
        className="flex-1 overflow-hidden bg-[#1a1a1a] flex flex-col items-center justify-center relative"
      >
        <div className="flex items-center justify-center w-full h-full p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-brand-copper animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Preparando páginas...</p>
              </div>
            }
            error={
              <div className="text-white p-10 text-center">
                <p>Falha ao carregar o PDF.</p>
              </div>
            }
          >
            <motion.div 
              key={pageNumber}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white rounded-sm overflow-hidden"
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale || undefined}
                width={!scale ? containerWidth : undefined}
                height={!scale ? containerHeight : undefined}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                loading={null}
              />
            </motion.div>
          </Document>
        </div>
      </main>


      {/* Footer / Controls */}
      <footer className="h-20 shrink-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-6 px-4">
        <div className="flex items-center gap-4">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-20 hover:bg-brand-copper hover:border-brand-copper transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <form onSubmit={handleManualPageChange} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-2xl border border-white/5 shadow-inner">
            <input 
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              className="w-10 bg-transparent text-center text-xs font-black text-white focus:outline-none"
            />
            <span className="text-[10px] font-black text-white/20 uppercase">/</span>
            <span className="text-[10px] font-black text-white/40 w-10 text-center uppercase">{numPages || '??'}</span>
          </form>

          <button 
            disabled={pageNumber >= (numPages || 0)}
            onClick={() => changePage(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-20 hover:bg-brand-copper hover:border-brand-copper transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute right-8 hidden lg:flex flex-col items-end gap-1">
          <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
             <div 
               className="h-full bg-brand-copper transition-all duration-300" 
               style={{ width: `${(pageNumber / (numPages || 1)) * 100}%` }}
             />
          </div>
          <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Progresso: {Math.round((pageNumber / (numPages || 1)) * 100)}%</span>
        </div>
      </footer>
    </motion.div>
  );
}
