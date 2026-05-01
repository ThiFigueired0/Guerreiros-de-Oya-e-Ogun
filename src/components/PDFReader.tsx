import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, Outline, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Settings,
  X,
  Loader2,
  Bookmark,
  BookOpen,
  Clock,
  Check,
  Edit3,
  Moon,
  Sun,
  Monitor,
  Search,
  LayoutPanelLeft,
  List,
  Highlighter,
  Trash,
  BookmarkPlus,
  Layers,
  MoreVertical,
  RotateCcw,
  Volume2,
  VolumeX,
  LayoutGrid,
  Play,
  Pause,
  Square,
  Eraser
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useStorage } from "../hooks/useStorage";
import { AppSettings } from "../types";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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

interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
interface Highlight {
  id: string;
  page: number;
  color: string;
  rects: HighlightRect[];
}

export function PDFReader({
  pdfUrl,
  initialPage = 1,
  onPageChange,
  onClose,
  title,
  totalPages: initialTotalPages,
}: PDFReaderProps) {
  const [settings] = useStorage<AppSettings>("templo_settings", {
    darkMode: false,
    eventCategories: [],
    eventNames: [],
    pushNotifications: false,
  });

  const [numPages, setNumPages] = useState<number>(initialTotalPages || 0);
  const [pageNumber, setPageNumber] = useState<number>(
    Math.max(1, initialPage),
  );
  const pageNumberRef = useRef(pageNumber);

  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  const [scale, setScale] = useState<number | null>(null); // null means auto-fit
  const [pdfPageWidth, setPdfPageWidth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement>(null);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [inputPage, setInputPage] = useState(String(initialPage));

  // Improvements State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "search" | "bookmarks" | "notes" | "outline" | "thumbnails" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [pageDirection, setPageDirection] = useState(1);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const parsedPdfRef = useRef<any>(null);
  
  const textRenderer = useCallback(
    ({ str }: { str: string }) => {
      if (!searchText || !searchResults.includes(pageNumber) || !str) return str;
      const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedSearchText})`, "gi");
      return str.replace(
        regex,
        '<mark style="background-color: rgba(184, 134, 11, 0.4); color: transparent; border-radius: 4px;">$1</mark>'
      );
    },
    [searchText, searchResults, pageNumber]
  );

  interface SpanInfo {
    span: HTMLElement;
    start: number;
    end: number;
    originalHTML: string;
    originalText: string;
  }

  const [hasOutline, setHasOutline] = useState<boolean | null>(null);

  const speechStateRef = useRef({
    speaking: false,
    chunks: [] as { text: string; offset: number }[],
    chunkIndex: 0,
    spanData: [] as SpanInfo[],
    lastHighlightedSpans: [] as SpanInfo[],
    simulationInterval: null as any,
    receivedRealBoundary: false,
  });

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const state = speechStateRef.current;
    if (state.simulationInterval) {
      clearTimeout(state.simulationInterval);
      state.simulationInterval = null;
    }
    state.lastHighlightedSpans.forEach((s) => {
      if (s.span) {
        s.span.innerHTML = s.originalHTML;
      }
    });
    state.speaking = false;
    state.chunks = [];
    state.chunkIndex = 0;
    state.spanData = [];
    state.lastHighlightedSpans = [];
    state.receivedRealBoundary = false;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  useEffect(() => {
    stopSpeech();
    // Cache voices early
    window.speechSynthesis.getVoices();
  }, [pageNumber]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      stopSpeech();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  const speakNextChunk = () => {
    const state = speechStateRef.current;
    if (!state.speaking || state.chunkIndex >= state.chunks.length) {
      stopSpeech();
      return;
    }

    const chunk = state.chunks[state.chunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.lang = "pt-BR";
    utterance.rate = 1.0;
    utterance.volume = 1;

    // Try to find a good Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    let ptVoice = voices.find(v => v.lang === "pt-BR" && v.localService);
    if (!ptVoice) ptVoice = voices.find(v => v.lang.startsWith("pt-BR"));
    if (!ptVoice) ptVoice = voices.find(v => v.lang.startsWith("pt"));
    
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => {
      const state = speechStateRef.current;
      if (state.speaking) {
        state.chunkIndex++;
        setTimeout(speakNextChunk, 50);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech chunk error", e);
      if (speechStateRef.current.speaking) {
        stopSpeech();
      }
    };

    const stateRef = speechStateRef.current;
    if (stateRef.simulationInterval) {
      clearTimeout(stateRef.simulationInterval);
      stateRef.simulationInterval = null;
    }
    stateRef.receivedRealBoundary = false;

    // Remove previous highlights
    stateRef.lastHighlightedSpans.forEach((spanInfo) => {
      if (spanInfo.span) {
        spanInfo.span.innerHTML = spanInfo.originalHTML;
      }
    });
    stateRef.lastHighlightedSpans = [];

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = async () => {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não suporta leitura em voz alta.");
      return;
    }

    if (isSpeaking || speechStateRef.current.speaking) {
      stopSpeech();
      return;
    }

    setIsSpeaking(true);
    speechStateRef.current.speaking = true;

    // First try DOM extraction for instant text
    let text = "";
    let spanData: SpanInfo[] = [];
    const textLayer = viewerRef.current?.querySelector(".react-pdf__Page__textContent") || document.querySelector(".react-pdf__Page__textContent");
    
    if (textLayer) {
      const spans = textLayer.querySelectorAll("span");
      if (spans.length > 0) {
        let currentOffset = 0;
        Array.from(spans).forEach((span) => {
          const sText = span.textContent || "";
          if (sText) {
            spanData.push({
              span: span as HTMLElement,
              start: currentOffset,
              end: currentOffset + sText.length,
              originalHTML: span.innerHTML,
              originalText: sText,
            });
            // Try to preserve some semantic structure if the span text doesn't end with punctuation
            const separator = sText.endsWith("-") ? "" : " ";
            text += sText + separator;
            currentOffset += sText.length + separator.length;
          }
        });
        // De-hyphenate: remove hyphens at the end of lines/spans that were likely for wrapping
        // This regex looks for words split by a hyphen and whitespace/newline
        text = text.replace(/(\w+)-\s+(\w+)/g, "$1$2");
        text = text.replace(/\s+$/, "");
      } else {
        // @ts-expect-error InnerText may not exist in some types
        text = textLayer.innerText || textLayer.textContent || "";
        text = text.replace(/(\w+)-\n\s*(\w+)/g, "$1$2");
      }
    }

    // If DOM extraction failed, use the cached pdf object
    if (!text && parsedPdfRef.current) {
      // Sync unlock required for Safari/iOS
      const initUtterance = new SpeechSynthesisUtterance("Carregando leitura");
      initUtterance.volume = 0.5;
      initUtterance.lang = "pt-BR";
      window.speechSynthesis.speak(initUtterance);

      try {
        const page = await parsedPdfRef.current.getPage(pageNumber);
        const textContent = await page.getTextContent();
        text = textContent.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        // Apply same de-hyphenation to static extraction if needed
        text = text.replace(/(\w+)-\s+(\w+)/g, "$1$2");
      } catch (err) {
        console.error("Error reading pdf text for speech", err);
        stopSpeech();
        return;
      }
    }

    if (!text || text.trim() === "") {
      stopSpeech();
      return;
    }

    if (!speechStateRef.current.speaking) return; // user cancelled while loading

    // Chunk text by sentence boundaries (periods, exclamation, question marks)
    // We group multiple sentences into larger chunks to let the native engine handle pauses naturally.
    const chunks = text.match(/[^.!?\n]+([.!?\n]|$)/g) || [text];
    const finalChunks: { text: string; offset: number }[] = [];
    let searchStartIndex = 0;

    chunks.forEach((chunk) => {
      let chunkStart = text.indexOf(chunk, searchStartIndex);
      if (chunkStart === -1) chunkStart = searchStartIndex;

      // Use a larger chunk size (1000) for better natural prosody
      if (chunk.length <= 1000) {
        const str = chunk.trim();
        if (str) {
          const strOffset = text.indexOf(str, chunkStart);
          finalChunks.push({
            text: str,
            offset: strOffset !== -1 ? strOffset : chunkStart,
          });
        }
        searchStartIndex = chunkStart + chunk.length;
      } else {
        // split by other punctuation or spaces if still too long (fall back for very long paragraphs)
        const subChunks = chunk.match(/[^,;:-]+[,;:-]*/g) || [chunk];
        let currentString = "";
        let currentSubOffset = chunkStart;
        
        subChunks.forEach((sub) => {
          if ((currentString + sub).length > 1000) {
            if (currentString.trim()) {
              const str = currentString.trim();
              const strOffset = text.indexOf(str, currentSubOffset);
              finalChunks.push({
                text: str,
                offset: strOffset !== -1 ? strOffset : currentSubOffset,
              });
              currentSubOffset += currentString.length;
            }
            currentString = sub;
          } else {
            currentString += sub;
          }
        });
        if (currentString.trim()) {
          const str = currentString.trim();
          const strOffset = text.indexOf(str, currentSubOffset);
          finalChunks.push({
            text: str,
            offset: strOffset !== -1 ? strOffset : currentSubOffset,
          });
          searchStartIndex = strOffset + str.length;
        }
      }
    });

    if (finalChunks.length === 0) {
      stopSpeech();
      return;
    }

    speechStateRef.current.chunks = finalChunks;
    speechStateRef.current.chunkIndex = 0;
    speechStateRef.current.spanData = spanData;

    // Replace any currently playing utterance (like "Carregando")
    window.speechSynthesis.cancel();

    speakNextChunk();
  };

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectionRects, setSelectionRects] = useState<DOMRect[] | null>(null);
  const [activeSelectionPercentRects, setActiveSelectionPercentRects] =
    useState<HighlightRect[] | null>(null);
  const [selectionPopupPos, setSelectionPopupPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [highlightPopupPos, setHighlightPopupPos] = useState<{
    x: number;
    y: number;
    page: number;
  } | null>(null);

  const [activeHighlightColor, setActiveHighlightColor] = useState<
    string | null
  >(null);
  const [isEraserActive, setIsEraserActive] = useState(false);

  const [isPainting, setIsPainting] = useState(false);
  const paintHighlightIdRef = useRef<string | null>(null);
  const paintStartIndexRef = useRef<number | null>(null);
  const textItemsBoundsRef = useRef<{ rect: DOMRect; text: string }[]>([]);

  const findSnappedIndex = (clientX: number, clientY: number): number | null => {
    if (textItemsBoundsRef.current.length === 0) return null;

    let closestCandidateIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < textItemsBoundsRef.current.length; i++) {
      const item = textItemsBoundsRef.current[i];
      let dx = 0;
      let dy = 0;

      if (clientX < item.rect.left) {
        dx = item.rect.left - clientX;
      } else if (clientX > item.rect.right) {
        dx = clientX - item.rect.right;
      }

      if (clientY < item.rect.top) {
        dy = item.rect.top - clientY;
      } else if (clientY > item.rect.bottom) {
        dy = clientY - item.rect.bottom;
      }

      // Weight Y heavily so precision matches the horizontal line we are closest to
      const distance = (dx * dx) + (dy * dy * 25);

      if (distance < minDistance) {
        minDistance = distance;
        closestCandidateIndex = i;
      }
    }

    // Allow a generous maximum distance for fat finger leeway (~40px vertically or ~200px horizontally)
    if (closestCandidateIndex === -1 || minDistance > 50000) {
      return null;
    }

    return closestCandidateIndex;
  };

  const getRectsForRange = (
    startIndex: number, 
    endIndex: number, 
    pageRect: DOMRect,
    allHighlights: Highlight[],
    currentHighlightId: string
  ): HighlightRect[] => {
    const minIdx = Math.min(startIndex, endIndex);
    const maxIdx = Math.max(startIndex, endIndex);
    const rects: HighlightRect[] = [];
    
    const currentPageHighlights = allHighlights.filter(h => h.page === pageNumberRef.current && h.id !== currentHighlightId);

    for (let i = minIdx; i <= maxIdx; i++) {
      const item = textItemsBoundsRef.current[i];
      if (!item) continue;
      
      // Filter out overly large rects that might be background containers
      if (item.rect.width > pageRect.width * 0.9 || item.rect.height > pageRect.height * 0.9) continue;

      const x = ((item.rect.left - pageRect.left) / pageRect.width) * 100;
      const y = ((item.rect.top - pageRect.top) / pageRect.height) * 100;
      const width = (item.rect.width / pageRect.width) * 100;
      const height = (item.rect.height / pageRect.height) * 100;

      // Check if this rect overlaps heavily with any existing highlight on this page
      const overlaps = currentPageHighlights.some(h => {
        return h.rects.some(r => {
          // Compare using center points to avoid tiny floating point overlaps
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          return (
            centerX >= r.x &&
            centerX <= r.x + r.width &&
            centerY >= r.y &&
            centerY <= r.y + r.height
          );
        });
      });

      if (!overlaps) {
        rects.push({ x, y, width, height });
      }
    }
    return rects;
  };

  const updateTextItemBounds = useCallback(() => {
    const textLayer = viewerRef.current?.querySelector(".react-pdf__Page__textContent");
    if (textLayer) {
      const spans = Array.from(textLayer.children).filter(el => el.tagName === "SPAN");

      spans.forEach(span => {
        if (span.querySelector(".pdf-word") || span.classList.contains("pdf-word-processed")) return;
        span.classList.add("pdf-word-processed");

        // Iterate backwards or make a copy of childNodes because we are modifying the DOM
        const childNodes = Array.from(span.childNodes);
        
        childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || "";
            if (!text.trim()) return;
            const words = text.split(/(\s+)/);
            
            const fragment = document.createDocumentFragment();
            words.forEach(word => {
              if (word.trim()) {
                const wordSpan = document.createElement('span');
                wordSpan.textContent = word;
                wordSpan.className = "pdf-word";
                fragment.appendChild(wordSpan);
              } else if (word) {
                fragment.appendChild(document.createTextNode(word));
              }
            });
            node.parentNode?.replaceChild(fragment, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            el.classList.add("pdf-word");
          }
        });
      });

      const wordSpans = textLayer.querySelectorAll(".pdf-word");
      
      textItemsBoundsRef.current = Array.from(wordSpans).map(span => ({
        rect: span.getBoundingClientRect(),
        text: span.textContent || ""
      })).filter(item => item.rect.width > 0 && item.rect.height > 0);
    }
  }, []);

  const startPainting = (e: React.TouchEvent) => {
    if (!activeHighlightColor) return;
    
    const touch = e.touches[0];
    const pageNode = document.querySelector(".react-pdf__Page") as HTMLElement;
    if (!pageNode) return;

    const pageRect = pageNode.getBoundingClientRect();
    const x = touch.clientX;
    const y = touch.clientY;

    if (x < pageRect.left || x > pageRect.right || y < pageRect.top || y > pageRect.bottom) return;

    const snappedIndex = findSnappedIndex(x, y);
    if (snappedIndex === null) return;

    setIsPainting(true);
    const id = Math.random().toString(36).substring(2, 9);
    paintHighlightIdRef.current = id;
    paintStartIndexRef.current = snappedIndex;

    setHighlights((prev) => {
      const rects = getRectsForRange(snappedIndex, snappedIndex, pageRect, prev, id);
      
      return [
        ...prev,
        {
          id,
          page: pageNumberRef.current,
          color: activeHighlightColor,
          rects,
        },
      ];
    });
  };

  const handlePaintMove = (e: React.TouchEvent) => {
    if (!isPainting || !paintHighlightIdRef.current || !activeHighlightColor || paintStartIndexRef.current === null) return;

    const touch = e.touches[0];
    const pageNode = document.querySelector(".react-pdf__Page") as HTMLElement;
    if (!pageNode) return;

    const pageRect = pageNode.getBoundingClientRect();
    const x = touch.clientX;
    const y = touch.clientY;

    const snappedIndex = findSnappedIndex(x, y);
    if (snappedIndex === null) return;


    setHighlights((prev) => {
      const hIdx = prev.findIndex((h) => h.id === paintHighlightIdRef.current);
      if (hIdx === -1) return prev;
      
      const rects = getRectsForRange(paintStartIndexRef.current!, snappedIndex, pageRect, prev, paintHighlightIdRef.current!);

      const currentHighlight = prev[hIdx];
      // Optimize by checking if rect length changed or we could just update it.
      // Easiest is to always update tracking precisely.
      const newHighlights = [...prev];
      newHighlights[hIdx] = {
        ...currentHighlight,
        rects,
      };
      return newHighlights;
    });
  };

  const effectiveScale = scale ?? (pdfPageWidth && containerWidth ? containerWidth / pdfPageWidth : 1);

  const handleTopBarColorClick = (color: string) => {
    setIsEraserActive(false);
    if (activeHighlightColor === color) {
      setActiveHighlightColor(null);
      setIsPainting(false);
    } else {
      setActiveHighlightColor(color);
      // When a color is selected, we clear any active selection to avoid confusion
      window.getSelection()?.removeAllRanges();
      setSelectionRects(null);
      setActiveSelectionPercentRects(null);
      setSelectionPopupPos(null);
      setActiveHighlightId(null);
      setHighlightPopupPos(null);
    }
  };

  const handleTopBarEraserClick = () => {
    setActiveHighlightColor(null);
    if (isEraserActive) {
      setIsEraserActive(false);
      setIsPainting(false);
    } else {
      setIsEraserActive(true);
      window.getSelection()?.removeAllRanges();
      setSelectionRects(null);
      setActiveSelectionPercentRects(null);
      setSelectionPopupPos(null);
      setActiveHighlightId(null);
      setHighlightPopupPos(null);
    }
  };

  const addHighlight = (color: string, rectsToUse?: DOMRect[]) => {
    const rectsTarget = rectsToUse || selectionRects;
    if (!rectsTarget || rectsTarget.length === 0) return;

    // Find the page container
    const pageNode = document.querySelector(".react-pdf__Page") as HTMLElement;
    if (!pageNode) return;

    const pageRect = pageNode.getBoundingClientRect();

    const rects: HighlightRect[] = rectsTarget.map((r) => ({
      x: ((r.left - pageRect.left) / pageRect.width) * 100,
      y: ((r.top - pageRect.top) / pageRect.height) * 100,
      width: (r.width / pageRect.width) * 100,
      height: (r.height / pageRect.height) * 100,
    }));

    setHighlights((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        page: pageNumberRef.current,
        color,
        rects,
      },
    ]);

    window.getSelection()?.removeAllRanges();
    setSelectionPopupPos(null);
    setSelectionRects(null);
    setActiveSelectionPercentRects(null);
  };

  const usingTouchRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = () => {
      usingTouchRef.current = true;
    };
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      // Check if the selection is inside the pdf container
      const range = sel.getRangeAt(0);
      const isInsideViewer = viewerRef.current?.contains(range.startContainer);
      if (!isInsideViewer) return;

      const rects = Array.from(range.getClientRects());
      if (rects.length > 0) {
        setSelectionRects(rects);

        const pageNode = document.querySelector(
          ".react-pdf__Page",
        ) as HTMLElement;
        if (pageNode) {
          const pageRect = pageNode.getBoundingClientRect();
          const mappedRects: HighlightRect[] = rects.map((r) => ({
            x: ((r.left - pageRect.left) / pageRect.width) * 100,
            y: ((r.top - pageRect.top) / pageRect.height) * 100,
            width: (r.width / pageRect.width) * 100,
            height: (r.height / pageRect.height) * 100,
          }));
          setActiveSelectionPercentRects(mappedRects);

          const firstRect = rects[0];
          setSelectionPopupPos({
            x:
              ((firstRect.left + firstRect.width / 2 - pageRect.left) /
                pageRect.width) *
              100,
            y: ((firstRect.top - pageRect.top - 50) / pageRect.height) * 100,
          });
        }
        return;
      }
    }
    setSelectionPopupPos(null);
    setSelectionRects(null);
    setActiveSelectionPercentRects(null);
  };

  const selectionRectsRef = useRef(selectionRects);

  useEffect(() => {
    selectionRectsRef.current = selectionRects;
  }, [selectionRects]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;

    const node = viewerRef.current;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Leave some padding for best fit
        setContainerWidth(entry.contentRect.width - 48);
        setContainerHeight(entry.contentRect.height - 48);
        // Update text bounds when container size changes
        setTimeout(updateTextItemBounds, 500);
      }
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [isFocusMode, activeSidebarTab]);

  useEffect(() => {
    setInputPage(String(pageNumber));
    onPageChange(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    const timer = setTimeout(updateTextItemBounds, 500);
    return () => clearTimeout(timer);
  }, [pageNumber, scale, updateTextItemBounds]);

  function onDocumentLoadSuccess(pdf: any) {
    setNumPages(pdf.numPages);
    parsedPdfRef.current = pdf;
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setPageDirection(offset > 0 ? 1 : -1);
    setPageNumber((prevPageNumber) => {
      const next = prevPageNumber + offset;
      return Math.min(Math.max(1, next), numPages || 1);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        changePage(-1);
      } else if (e.key === "ArrowRight") {
        changePage(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages]);

  const goToPage = (page: number) => {
    if (page === pageNumber) return;
    setPageDirection(page > pageNumber ? 1 : -1);
    setPageNumber(page);
  };

  const handlePageSelect = (page: number) => {
    goToPage(page);
    if (window.innerWidth < 1024) {
      setActiveSidebarTab(null);
    }
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const pdf = await pdfjs.getDocument(pdfUrl).promise;
      const results: number[] = [];
      const numPagesToSearch = pdf.numPages;

      for (let i = 1; i <= numPagesToSearch; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");
        if (text.toLowerCase().includes(query.toLowerCase())) {
          results.push(i);
        }
      }
      setSearchResults(results);
      if (results.length > 0) {
        setCurrentSearchIndex(0);
        handlePageSelect(results[0]);
      }
    } catch (err) {
      console.error("PDF Search Error:", err);
    }
    setIsSearching(false);
  };

  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIdx);
    handlePageSelect(searchResults[nextIdx]);
  };

  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIdx =
      (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIdx);
    handlePageSelect(searchResults[prevIdx]);
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setCurrentSearchIndex(0);
    if (window.innerWidth < 1024) {
      setActiveSidebarTab(null);
    }
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const base = prev ?? effectiveScale;
      const newScale = Math.round((base + delta) * 10) / 10;
      return Math.min(Math.max(0.1, newScale), 5.0);
    });
  };

  const handleManualPageChange = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputPage);
    if (!isNaN(val) && val >= 1 && val <= (numPages || 1000)) {
      setPageDirection(val > pageNumber ? 1 : -1);
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

  const [touchStartPos, setTouchStartPos] = useState<{x: number, y: number, time: number} | null>(null);

  const handleTouchStartRaw = (e: React.TouchEvent) => {
    if (activeHighlightColor) {
      // Prevent default to avoid scrolling while painting
      // Note: passive: false is required in the actual listener, but onTouchStart prop is usually passive by default
      startPainting(e);
      return;
    }

    if (e.touches.length === 1) {
      setTouchStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      });
    } else {
      setTouchStartPos(null);
    }
  };

  const handleTouchEndRaw = (e: React.TouchEvent) => {
    if (isPainting) {
      setIsPainting(false);
      paintHighlightIdRef.current = null;
      return;
    }

    if (!touchStartPos) return;

    const touchEndPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    const deltaX = touchEndPos.x - touchStartPos.x;
    const deltaY = touchEndPos.y - touchStartPos.y;
    const deltaTime = touchEndPos.time - touchStartPos.time;
    
    setTouchStartPos(null);

    const baseScale = scale ?? effectiveScale;
    if (baseScale > effectiveScale + 0.05) {
      return; // Zoomed in, do not hijack swipe
    }

    const canScrollX = viewerRef.current
      ? viewerRef.current.scrollWidth > viewerRef.current.clientWidth + 2
      : false;

    if (canScrollX) return; // if document can scroll horizontally naturally, do not swipe

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
      if (deltaX < 0) {
        changePage(1); // Swipe left -> Next Page
      } else {
        changePage(-1); // Swipe right -> Prev Page
      }
    }
  };

  const toggleBookmark = () => {
    setBookmarkedPages((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber],
    );
  };

  const themeFilter = "none";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      onTouchStart={handleTouchStartRaw}
      onTouchEnd={handleTouchEndRaw}
      onWheel={(e) => {
        // Prevent default scrolling to handle custom gesture if needed?
        // No, let's just make sure we only change page if we aren't zooming.
        if (
          e.ctrlKey ||
          e.metaKey ||
          window.getSelection()?.toString().trim().length
        )
          return;

        if (wheelTimeout.current) return;

        const canScrollX = viewerRef.current
          ? viewerRef.current.scrollWidth > viewerRef.current.clientWidth
          : false;
        const canScrollY = viewerRef.current
          ? viewerRef.current.scrollHeight > viewerRef.current.clientHeight
          : false;

        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          if (!canScrollX && Math.abs(e.deltaX) > 20) {
            changePage(e.deltaX > 0 ? 1 : -1);
            wheelTimeout.current = setTimeout(() => {
              wheelTimeout.current = null;
            }, 500);
          }
        } else {
          if (!canScrollY && Math.abs(e.deltaY) > 20) {
            changePage(e.deltaY > 0 ? 1 : -1);
            wheelTimeout.current = setTimeout(() => {
              wheelTimeout.current = null;
            }, 500);
          }
        }
      }}
      className={cn(
        "fixed inset-0 z-[150] flex flex-col backdrop-blur-md touch-pan-y transition-colors duration-500 overflow-hidden",
        isFullScreen ? "p-0" : "",
        settings.darkMode ? "bg-[#050B14]" : "bg-[#f4f5f0]",
        isFocusMode ? "cursor-none" : "",
      )}
    >
      {/* Header */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={cn(
              "h-20 flex items-center justify-between px-4 sm:px-6 shrink-0 absolute top-0 left-0 right-0 z-40 transition-colors duration-500",
              settings.darkMode ? "bg-[#050B14]/90 border-b border-white/10" : "bg-[#F9F9F9]/95 border-b border-gray-200 shadow-sm"
            )}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Reading Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-navy/5 z-50">
              <div 
                className="h-full bg-brand-copper transition-all duration-300"
                style={{ width: `${(pageNumber / (numPages || 1)) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
              <button
                onClick={onClose}
                className={cn(
                  "p-3 rounded-2xl transition-all shadow-sm active:scale-95 shrink-0",
                  settings.darkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-brand-navy text-white hover:bg-brand-navy/90"
                )}
              >
                <ChevronLeft className="w-5 h-5 ml-[-2px]" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className={cn(
                  "font-sans text-lg sm:text-xl font-black uppercase tracking-tight truncate",
                  settings.darkMode ? "text-white" : "text-brand-navy"
                )}>
                  {title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-brand-copper font-bold uppercase tracking-widest hidden sm:inline-block">
                    Leitor Digital
                  </span>
                  <div className="w-1 h-1 rounded-full hidden sm:block bg-brand-copper/50" />
                  <span className="text-[10px] text-brand-copper font-bold uppercase tracking-widest truncate">
                    {bookmarkedPages.includes(pageNumber) ? "Página Salva • " : ""}
                    Pág {pageNumber} de {numPages || "?"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0 py-2">
              <button
                onClick={() =>
                  setActiveSidebarTab(
                    activeSidebarTab === "search" ? null : "search",
                  )
                }
                className={cn(
                  "p-2 rounded-xl transition-all flex items-center gap-2 shrink-0 md:hidden",
                  activeSidebarTab === "search"
                    ? "bg-brand-copper/10 text-brand-copper"
                    : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                )}
                title="Buscar no documento"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                  className={cn(
                    "p-2 rounded-xl transition-all flex shrink-0 items-center gap-2",
                    isMoreOptionsOpen
                      ? settings.darkMode ? "bg-white/20 text-white" : "bg-brand-navy/10 text-brand-navy"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy"
                  )}
                  title="Mais Opções"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className={cn(
                "items-center gap-1 sm:gap-2",
                isMoreOptionsOpen ? "absolute md:relative top-[75px] md:top-auto right-4 md:right-auto flex flex-col md:flex-row p-2 md:p-0 rounded-2xl border md:border-none shadow-xl md:shadow-none z-50 animate-in fade-in zoom-in-95 md:animate-none" : "hidden md:flex",
                settings.darkMode ? "bg-[#0A192F] md:bg-transparent border-white/10" : "bg-white md:bg-transparent border-brand-navy/10"
              )}>
                <button
                  onClick={toggleSpeech}
                  className={cn(
                    "p-2 rounded-xl transition-all flex shrink-0 items-center gap-2",
                    isSpeaking
                      ? "text-brand-copper bg-brand-copper/10 animate-pulse"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5 mx-auto md:mx-0" /> : <Volume2 className="w-5 h-5 mx-auto md:mx-0" />}
                </button>
                <button
                  onClick={() => {
                    setActiveSidebarTab(activeSidebarTab === "outline" ? null : "outline");
                    if (window.innerWidth < 1024) setIsMoreOptionsOpen(false);
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all flex shrink-0 items-center gap-2",
                    activeSidebarTab === "outline"
                      ? "text-brand-copper bg-brand-copper/10"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title="Índice / Sumário"
                >
                  <List className="w-5 h-5 mx-auto md:mx-0" />
                </button>
                <button
                  onClick={() => {
                    setActiveSidebarTab(activeSidebarTab === "thumbnails" ? null : "thumbnails");
                    if (window.innerWidth < 1024) setIsMoreOptionsOpen(false);
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all flex shrink-0 items-center gap-2",
                    activeSidebarTab === "thumbnails"
                      ? "text-brand-copper bg-brand-copper/10"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title="Miniaturas da página"
                >
                  <LayoutGrid className="w-5 h-5 mx-auto md:mx-0" />
                </button>

                <button
                  onClick={toggleBookmark}
                  className={cn(
                    "p-2 rounded-xl transition-all flex shrink-0 items-center gap-2",
                    bookmarkedPages.includes(pageNumber)
                      ? "text-brand-copper bg-brand-copper/10"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title="Salvar Página"
                >
                  <Bookmark
                    className={cn(
                      "w-5 h-5",
                      bookmarkedPages.includes(pageNumber)
                        ? "fill-brand-copper"
                        : "",
                    )}
                  />
                </button>

                <div className={cn("w-px h-6 mx-2 hidden md:block", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />

                <button
                  onClick={() =>
                    setActiveSidebarTab(
                      activeSidebarTab === "search" ? null : "search",
                    )
                  }
                  className={cn(
                    "p-2 rounded-xl transition-all items-center gap-2 shrink-0 hidden md:flex",
                    activeSidebarTab === "search"
                      ? "bg-brand-copper/10 text-brand-copper"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title="Buscar no documento"
                >
                  <Search className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setActiveSidebarTab(
                      activeSidebarTab === "bookmarks" ? null : "bookmarks",
                    )
                  }
                  className={cn(
                    "p-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
                    activeSidebarTab === "bookmarks"
                      ? "bg-brand-copper/10 text-brand-copper"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title="Marcadores"
                >
                  <Layers className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setActiveSidebarTab(
                      activeSidebarTab === "notes" ? null : "notes",
                    )
                  }
                  className={cn(
                    "p-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
                    activeSidebarTab === "notes"
                      ? "bg-brand-copper/10 text-brand-copper"
                      : settings.darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy",
                  )}
                  title="Notas Rápidas e Grifos"
                >
                  <Edit3 className="w-5 h-5" />
                </button>

                <div className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-xl shrink-0 border", settings.darkMode ? "border-white/10" : "border-brand-navy/10")}>
                  <button
                    onClick={() => handleTopBarColorClick("rgba(252, 211, 77, 0.4)")}
                    className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-300 border shadow-sm transition-transform hover:scale-110", activeHighlightColor === "rgba(252, 211, 77, 0.4)" ? "ring-2 ring-amber-500 scale-110" : "border-black/10")}
                    title="Grifar (Amarelo)"
                  />
                  <button
                    onClick={() => handleTopBarColorClick("rgba(134, 239, 172, 0.4)")}
                    className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-300 border shadow-sm transition-transform hover:scale-110", activeHighlightColor === "rgba(134, 239, 172, 0.4)" ? "ring-2 ring-green-500 scale-110" : "border-black/10")}
                    title="Grifar (Verde)"
                  />
                  <button
                    onClick={() => handleTopBarColorClick("rgba(249, 168, 212, 0.4)")}
                    className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-300 border shadow-sm transition-transform hover:scale-110", activeHighlightColor === "rgba(249, 168, 212, 0.4)" ? "ring-2 ring-pink-500 scale-110" : "border-black/10")}
                    title="Grifar (Rosa)"
                  />
                  <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-0.5" />
                  <button
                    onClick={handleTopBarEraserClick}
                    className={cn("w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-110", 
                      isEraserActive ? "bg-red-100 border-red-300 text-red-500 scale-110 ring-2 ring-red-400" : "bg-gray-100 border-black/10 text-gray-500",
                      settings.darkMode && !isEraserActive && "bg-white/10 border-white/10 text-white/60"
                    )}
                    title="Apagar Grifo"
                  >
                    <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className={cn("w-px h-6 mx-2 hidden sm:block", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />

                <button
                  onClick={toggleFullScreen}
                  className={cn(
                    "p-2 rounded-xl transition-all hidden sm:flex shrink-0",
                    settings.darkMode ? "text-white/60 hover:text-white hover:bg-white/10" : "text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5"
                  )}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className={cn("w-px h-6 mx-2", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />

              <button
                onClick={onClose}
                className="p-2 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-xl transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Floating Mini Player for Speech */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] px-4 md:px-6 py-3 rounded-2xl bg-brand-navy shadow-2xl border border-white/10 flex items-center justify-between gap-4 md:gap-6 w-[calc(100vw-2rem)] md:w-auto md:min-w-[300px]"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold truncate">Lendo agora</span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={isPaused ? { height: 4 } : { height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-1 bg-brand-copper rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-white truncate">Página {pageNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
              <button
                onClick={isPaused ? resumeSpeech : pauseSpeech}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
              </button>
              <button
                onClick={stopSpeech}
                className="w-10 h-10 rounded-full bg-brand-copper hover:bg-brand-copper-dark flex items-center justify-center transition-colors text-white shadow-lg"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="flex-1 flex overflow-hidden relative"
        onContextMenu={(e) => e.preventDefault()}
      >

        {/* Main Viewport */}
        <main
          ref={viewerRef}
          className={cn(
            "flex-1 overflow-auto relative transition-all duration-300",
            !isFocusMode ? "pt-16 pb-20 lg:pb-0" : "",
            "bg-[#0A192F]",
            (activeHighlightColor || isEraserActive) && "no-select touch-none",
            activeHighlightColor && "cursor-crosshair",
            isEraserActive && "cursor-alias"
          )}
          onTouchMove={activeHighlightColor ? handlePaintMove : undefined}
          onClick={() => {
            if (activeHighlightColor || isEraserActive) return;
            if (window.getSelection()?.toString().trim().length) return;
            if (activeHighlightId) {
              setActiveHighlightId(null);
              setHighlightPopupPos(null);
              return;
            }
            setIsFocusMode(!isFocusMode);
          }}
        >
          <div className="w-max min-w-full h-max min-h-full p-4 flex items-center justify-center">
            <div className="w-fit">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-brand-copper animate-spin" />
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      "text-white/40",
                    )}
                  >
                    Preparando páginas...
                  </p>
                </div>
              }
              error={
                <div className="text-white p-10 text-center">
                  <p>Falha ao carregar o PDF.</p>
                </div>
              }
            >
              <div
                style={{ filter: themeFilter, perspective: "2000px" }}
                className="transition-none"
              >
                <AnimatePresence mode="wait" custom={pageDirection}>
                  <motion.div
                    key={pageNumber}
                    custom={pageDirection}
                    variants={{
                      initial: (dir: number) => ({
                        opacity: 0,
                        rotateY: dir > 0 ? 90 : -90,
                        x: dir > 0 ? 20 : -20,
                      }),
                      animate: { opacity: 1, rotateY: 0, x: 0 },
                      exit: (dir: number) => ({
                        opacity: 0,
                        rotateY: dir > 0 ? -90 : 90,
                        x: dir > 0 ? -20 : 20,
                      }),
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-white overflow-hidden relative"
                    style={{
                      transformOrigin:
                        pageDirection > 0 ? "right center" : "left center",
                    }}
                  >
                    {bookmarkedPages.includes(pageNumber) && (
                      <Bookmark className="absolute top-0 right-8 w-8 h-12 text-brand-copper fill-brand-copper z-50 drop-shadow-md" />
                    )}
                    <Page
                      pageNumber={pageNumber}
                      scale={scale || undefined}
                      width={!scale ? containerWidth : undefined}
                      height={!scale ? containerHeight : undefined}
                      onLoadSuccess={(page) => {
                        if (page.originalWidth) {
                          setPdfPageWidth(page.originalWidth);
                        }
                        // Small delay to ensure text layer is rendered
                        setTimeout(updateTextItemBounds, 500);
                      }}
                      renderAnnotationLayer={true}
                      renderTextLayer={true}
                      customTextRenderer={textRenderer}
                      className={activeHighlightColor || isEraserActive ? "no-select" : ""}
                      loading={null}
                    />
                    {highlights
                      .filter((h) => h.page === pageNumber)
                      .map((h) => (
                        <div
                          key={h.id}
                          className="absolute inset-0 pointer-events-none"
                        >
                          {h.rects.map((r, i) => (
                            <div
                              key={i}
                              title={isEraserActive ? "Apagar" : "Clique para selecionar"}
                              className={cn(
                                "absolute mix-blend-multiply z-40 pointer-events-auto transition-colors",
                                isEraserActive ? "cursor-alias" : "cursor-pointer",
                                activeHighlightId === h.id ? "ring-2 ring-red-400 outline-none" : ""
                              )}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                if (isEraserActive) {
                                  setHighlights(prev => prev.filter(x => x.id !== h.id));
                                  setActiveHighlightId(null);
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (isEraserActive && e.buttons === 1) { // Left mouse button down
                                  setHighlights(prev => prev.filter(x => x.id !== h.id));
                                  setActiveHighlightId(null);
                                }
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (activeHighlightColor) return;
                                if (isEraserActive) {
                                  setHighlights(prev => prev.filter(x => x.id !== h.id));
                                  setActiveHighlightId(null);
                                  return;
                                }
                                const pageRect = (e.currentTarget.closest(".react-pdf__Page") as HTMLElement)?.getBoundingClientRect();
                                if (!pageRect) return;
                                
                                setActiveHighlightId(h.id === activeHighlightId ? null : h.id);
                                if (h.id !== activeHighlightId) {
                                  setHighlightPopupPos({
                                    x: ((e.clientX - pageRect.left) / pageRect.width) * 100,
                                    y: ((e.clientY - pageRect.top) / pageRect.height) * 100,
                                    page: pageNumber
                                  });
                                } else {
                                  setHighlightPopupPos(null);
                                }
                              }}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (activeHighlightColor || isEraserActive) return;
                                const touch = e.changedTouches[0];
                                const pageRect = (e.currentTarget.closest(".react-pdf__Page") as HTMLElement)?.getBoundingClientRect();
                                if (!pageRect || !touch) return;
                                
                                setActiveHighlightId(h.id === activeHighlightId ? null : h.id);
                                if (h.id !== activeHighlightId) {
                                  setHighlightPopupPos({
                                    x: ((touch.clientX - pageRect.left) / pageRect.width) * 100,
                                    y: ((touch.clientY - pageRect.top) / pageRect.height) * 100,
                                    page: pageNumber
                                  });
                                } else {
                                  setHighlightPopupPos(null);
                                }
                              }}
                              style={{
                                left: `${r.x}%`,
                                top: `${r.y}%`,
                                width: `${r.width}%`,
                                height: `${r.height}%`,
                                backgroundColor: h.color,
                              }}
                            ></div>
                          ))}
                        </div>
                      ))}

                    {/* Active transparent browser selection render overlay */}
                    {activeSelectionPercentRects && (
                      <div className="absolute inset-0 pointer-events-none z-30">
                        {activeSelectionPercentRects.map((r, i) => (
                          <div
                            key={`acts-${i}`}
                            className="absolute mix-blend-multiply pointer-events-none"
                            style={{
                              left: `${r.x}%`,
                              top: `${r.y}%`,
                              width: `${r.width}%`,
                              height: `${r.height}%`,
                              backgroundColor: "rgba(56, 189, 248, 0.4)",
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Highlight Delete Popup */}
                    <AnimatePresence>
                      {activeHighlightId && highlightPopupPos && highlightPopupPos.page === pageNumber && !activeHighlightColor && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute z-[200] flex items-center gap-2 p-1.5 bg-[#050B14]/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 pointer-events-auto"
                          style={{
                            left: `${highlightPopupPos.x}%`,
                            top: `calc(${highlightPopupPos.y}% - 48px)`,
                            transform: "translateX(-50%)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setHighlights((prev) => prev.filter((x) => x.id !== activeHighlightId));
                              setActiveHighlightId(null);
                              setHighlightPopupPos(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">Remover</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selection Popup */}
                    <AnimatePresence>
                      {selectionPopupPos && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute z-[200] flex items-center gap-2 p-2 bg-[#050B14]/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 pointer-events-auto"
                          style={{
                            left: `${selectionPopupPos.x}%`,
                            top: `${selectionPopupPos.y}%`,
                            transform: "translateX(-50%)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                            <Highlighter className="w-4 h-4 text-white/50" />
                          </div>
                          <button
                            onPointerDown={(e) => {
                              e.preventDefault();
                              addHighlight("rgba(252, 211, 77, 0.4)");
                            }}
                            className="w-6 h-6 rounded-full bg-amber-300 border border-black/10 hover:scale-110 transition-transform shadow-sm"
                          />
                          <button
                            onPointerDown={(e) => {
                              e.preventDefault();
                              addHighlight("rgba(134, 239, 172, 0.4)");
                            }}
                            className="w-6 h-6 rounded-full bg-green-300 border border-black/10 hover:scale-110 transition-transform shadow-sm"
                          />
                          <button
                            onPointerDown={(e) => {
                              e.preventDefault();
                              addHighlight("rgba(147, 197, 253, 0.4)");
                            }}
                            className="w-6 h-6 rounded-full bg-blue-300 border border-black/10 hover:scale-110 transition-transform shadow-sm"
                          />
                          <button
                            onPointerDown={(e) => {
                              e.preventDefault();
                              addHighlight("rgba(249, 168, 212, 0.4)");
                            }}
                            className="w-6 h-6 rounded-full bg-pink-300 border border-black/10 hover:scale-110 transition-transform shadow-sm"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Document>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {searchResults.length > 0 && searchText && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className={cn(
                "absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full shadow-2xl z-40 transition-all",
                "bg-[#001F3F] border border-white/10 text-white",
                !isFocusMode ? "bottom-24" : "bottom-6",
              )}
            >
              <span className="text-xs font-bold whitespace-nowrap">
                {currentSearchIndex + 1} de {searchResults.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevSearchResult}
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    "hover:bg-white/10",
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSearchResult}
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    "hover:bg-white/10",
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className={cn("w-px h-4", "bg-white/20")} />
              <button
                onClick={clearSearch}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  "hover:bg-white/10",
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {activeSidebarTab && !isFocusMode && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "flex flex-col absolute right-4 top-[96px] bottom-[100px] z-30 transition-colors duration-500 overflow-hidden rounded-3xl shadow-2xl border w-[320px] max-w-[calc(100vw-32px)]",
                settings.darkMode ? "bg-[#0A192F]/95 border-white/10 backdrop-blur-2xl" : "bg-white/95 border-[#001F3F]/10 backdrop-blur-2xl",
              )}
            >
              <div className="p-4 flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h3
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      settings.darkMode ? "text-white" : "text-brand-navy",
                    )}
                  >
                    {activeSidebarTab === "notes"
                      ? "Notas Rápidas"
                      : activeSidebarTab === "search"
                        ? "Busca"
                        : activeSidebarTab === "outline"
                          ? "Índice / Sumário"
                          : activeSidebarTab === "thumbnails"
                            ? "Miniaturas"
                            : "Marcadores"}
                  </h3>
                  <button
                    onClick={() => setActiveSidebarTab(null)}
                    className={settings.darkMode ? "text-white/40 hover:text-white" : "text-brand-navy/40 hover:text-brand-navy"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeSidebarTab === "notes" && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Seus pensamentos e anotações sobre este livro..."
                    className={cn(
                      "flex-1 w-full rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-copper/30 transition-all text-sm pointer-events-auto",
                      settings.darkMode ? "bg-white/5 text-white placeholder:text-white/20 border border-white/10 focus:bg-white/10" : "bg-brand-navy/5 text-brand-navy placeholder:text-brand-navy/40 border border-brand-navy/10 focus:bg-brand-navy/10",
                    )}
                  />
                )}

                {activeSidebarTab === "outline" && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pointer-events-auto">
                    <Document file={pdfUrl} loading={<div className="text-center py-4 text-sm opacity-50">Carregando sumário...</div>}>
                      <Outline 
                        onItemClick={({ pageNumber }) => {
                          if (pageNumber) handlePageSelect(typeof pageNumber === 'string' ? parseInt(pageNumber, 10) : pageNumber);
                        }}
                        onLoadSuccess={(outline) => {
                          setHasOutline(outline && outline.length > 0);
                        }}
                        onLoadError={() => setHasOutline(false)}
                        className={cn(
                          "custom-pdf-outline text-sm overflow-hidden",
                          settings.darkMode ? "text-white/80" : "text-brand-navy/80"
                        )}
                      />
                      {hasOutline === false && (
                        <div className="text-center py-8 px-4">
                          <List className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          <p className="text-xs opacity-50 font-bold">Este PDF não possui um sumário interno configurado.</p>
                        </div>
                      )}
                    </Document>
                  </div>
                )}

                {activeSidebarTab === "thumbnails" && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pointer-events-auto">
                    <Document file={pdfUrl} loading={<div className="text-center py-4 text-sm opacity-50">Carregando miniaturas...</div>}>
                      <div className="grid grid-cols-3 gap-2 pb-4">
                        {Array.from({ length: numPages || 0 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageSelect(i + 1)}
                            className={cn(
                              "relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all flex flex-col items-center justify-center bg-white",
                              pageNumber === i + 1 
                                ? "border-brand-copper shadow-lg scale-[1.02] z-10" 
                                : settings.darkMode ? "border-white/10 hover:border-white/30" : "border-brand-navy/10 hover:border-brand-navy/30"
                            )}
                          >
                            <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none bg-white">
                              <Page 
                                pageNumber={i + 1} 
                                width={100} 
                                renderTextLayer={false} 
                                renderAnnotationLayer={false}
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center font-medium backdrop-blur-sm">
                              {i + 1}
                            </div>
                          </button>
                        ))}
                      </div>
                    </Document>
                  </div>
                )}

                {activeSidebarTab === "search" && (
                  <div className="flex-1 flex flex-col pointer-events-auto overflow-hidden">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        executeSearch(searchText);
                      }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border transition-all mb-4 shrink-0",
                        settings.darkMode ? "bg-white/5 border-white/10" : "bg-brand-navy/5 border-brand-navy/10",
                      )}
                    >
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Buscar no texto..."
                        className={cn(
                          "flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-1 min-w-0",
                          settings.darkMode ? "text-white placeholder:text-white/30" : "text-brand-navy placeholder:text-brand-navy/40",
                        )}
                      />
                      <button
                        type="submit"
                        disabled={isSearching || !searchText.trim()}
                        className="p-2 bg-brand-copper hover:bg-brand-gold transition-colors text-white rounded-lg disabled:opacity-50 shrink-0"
                      >
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </form>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {searchResults.length > 0
                        ? searchResults.map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => {
                                handlePageSelect(pageNum);
                                setCurrentSearchIndex(
                                  searchResults.indexOf(pageNum),
                                );
                              }}
                              className={cn(
                                "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group",
                                pageNumber === pageNum
                                  ? settings.darkMode ? "border-brand-copper bg-brand-copper/10" : "border-brand-copper bg-brand-copper/5"
                                  : settings.darkMode ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" : "bg-brand-navy/5 border-brand-navy/10 hover:bg-brand-navy/10 hover:border-brand-navy/20",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  settings.darkMode ? "text-white" : "text-brand-navy",
                                )}
                              >
                                Página {pageNum}
                              </span>
                              <ChevronRight
                                className={cn(
                                  "w-4 h-4 opacity-0 group-hover:opacity-100 transition-all",
                                  settings.darkMode ? "text-white/40" : "text-brand-navy/40",
                                )}
                              />
                            </button>
                          ))
                        : searchText &&
                          !isSearching && (
                            <p
                              className={cn(
                                "text-xs text-center p-4",
                                settings.darkMode ? "text-white/40" : "text-brand-navy/40",
                              )}
                            >
                              Nenhum resultado encontrado.
                            </p>
                          )}
                    </div>
                  </div>
                )}

                {activeSidebarTab === "bookmarks" && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pointer-events-auto pr-2 space-y-2">
                    {bookmarkedPages.length > 0 ? (
                      [...bookmarkedPages]
                        .sort((a, b) => a - b)
                        .map((pageNum) => (
                          <div
                            key={pageNum}
                            className={cn(
                              "w-full p-2 pl-3 rounded-xl border flex items-center justify-between group transition-colors",
                              pageNumber === pageNum
                                ? settings.darkMode ? "border-brand-copper bg-brand-copper/10" : "border-brand-copper bg-brand-copper/5"
                                : settings.darkMode ? "bg-white/5 border-white/10" : "bg-brand-navy/5 border-brand-navy/10",
                            )}
                          >
                            <button
                              onClick={() => handlePageSelect(pageNum)}
                              className="flex-1 flex items-center gap-2 text-left min-w-0"
                            >
                              <Bookmark className="w-3.5 h-3.5 shrink-0 text-brand-copper fill-brand-copper" />
                              <span
                                className={cn(
                                  "text-sm font-medium truncate",
                                  settings.darkMode ? "text-white" : "text-brand-navy",
                                )}
                              >
                                Página {pageNum}
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                setBookmarkedPages((prev) =>
                                  prev.filter((p) => p !== pageNum),
                                )
                              }
                              className={cn(
                                "p-1.5 opacity-0 group-hover:opacity-100 rounded-lg transition-all shrink-0",
                                "hover:bg-brand-red/20 text-brand-red",
                              )}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p
                        className={cn(
                          "text-xs text-center p-4 leading-relaxed",
                          settings.darkMode ? "text-white/40" : "text-brand-navy/40",
                        )}
                      >
                        Nenhum marcador adicionado.
                        <br />
                        <br />
                        Use o ícone de marcador no menu superior para salvar
                        páginas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Controls */}
      <AnimatePresence>
        {!isFocusMode && (
          <>
            <motion.footer
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-0 right-0 px-6 z-40 transition-all duration-500 pointer-events-none flex justify-between items-end"
            >
              {/* Invisible Left Spacer */}
              <div className="w-[120px] hidden sm:block"></div>

              {/* Center Pagination */}
              <div className={cn(
                "flex items-center justify-between p-1 rounded-full pointer-events-auto border shadow-lg backdrop-blur-xl hover:-translate-y-1 transition-transform",
                settings.darkMode ? "bg-white/10 border-white/20 text-white" : "bg-white/80 border-[#001F3F]/10 text-brand-navy"
              )}>
                {/* Left Action Box */}
                <button
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100",
                    settings.darkMode ? "hover:bg-white/20" : "hover:bg-brand-navy/10"
                  )}
                >
                  <ChevronLeft className="w-4 h-4 ml-[-1px]" />
                </button>

                {/* Center Text & Input */}
                <div className="flex-1 flex items-baseline justify-center mx-2 gap-1">
                  <form
                    onSubmit={handleManualPageChange}
                    className="flex items-baseline justify-center gap-1"
                  >
                    <input
                      type="text"
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      onBlur={handleManualPageChange}
                      className={cn(
                        "w-6 text-right text-xs font-black bg-transparent focus:outline-none transition-colors",
                        settings.darkMode ? "text-white" : "text-brand-navy"
                      )}
                    />
                    <span className={cn(
                      "text-[10px] font-bold",
                      settings.darkMode ? "text-white/50" : "text-brand-navy/50"
                    )}>
                      / {numPages || "?"}
                    </span>
                  </form>
                </div>

                {/* Right Button */}
                <button
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= (numPages || 1)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100",
                    settings.darkMode ? "hover:bg-white/20" : "hover:bg-brand-navy/10"
                  )}
                >
                  <ChevronRight className="w-4 h-4 ml-[1px]" />
                </button>
              </div>

              {/* Right Zoom Controls */}
              <div className={cn(
                "flex items-center gap-1 p-1 rounded-xl border shadow-lg backdrop-blur-xl pointer-events-auto hover:-translate-y-1 transition-transform",
                settings.darkMode ? "bg-white/10 border-white/20 text-white/60" : "bg-white/80 border-[#001F3F]/10 text-brand-navy/60"
              )}>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className={cn("p-1.5 rounded-lg transition-all", settings.darkMode ? "hover:text-white hover:bg-white/20" : "hover:text-brand-navy hover:bg-brand-navy/10")}
                >
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className={cn("text-[10px] sm:text-[11px] font-black w-7 sm:w-9 text-center", settings.darkMode ? "text-white" : "text-brand-navy")}>
                  {Math.round(effectiveScale * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(0.1)}
                  className={cn("p-1.5 rounded-lg transition-all", settings.darkMode ? "hover:text-white hover:bg-white/20" : "hover:text-brand-navy hover:bg-brand-navy/10")}
                >
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className={cn("w-px h-4 mx-1", settings.darkMode ? "bg-white/20" : "bg-brand-navy/20")} />
                <button
                  onClick={() => setScale(null)}
                  title="Redefinir Zoom"
                  className={cn("p-1.5 rounded-lg transition-all", settings.darkMode ? "hover:text-white hover:bg-white/20" : "hover:text-brand-navy hover:bg-brand-navy/10")}
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.footer>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
