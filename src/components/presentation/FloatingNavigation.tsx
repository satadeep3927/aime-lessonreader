import { useState, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  PenTool,
  GripHorizontal,
} from "lucide-react";

interface FloatingNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isWhiteboardMode: boolean;
  onToggleWhiteboard: () => void;
}

export const FloatingNavigation = ({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  onExit,
  canGoPrevious,
  canGoNext,
  isSidebarCollapsed,
  onToggleSidebar,
  isWhiteboardMode,
  onToggleWhiteboard,
}: FloatingNavigationProps) => {
  // null = use default CSS bottom-center position
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{
    mx: number;
    my: number;
    ex: number;
    ey: number;
  } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest<HTMLElement>(
      "[data-floating]",
    )!;
    const rect = el.getBoundingClientRect();
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      ex: rect.left,
      ey: rect.top,
    };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = ev.clientX - dragStart.current.mx;
      const dy = ev.clientY - dragStart.current.my;
      setPos({
        x: Math.max(
          0,
          Math.min(window.innerWidth - rect.width, dragStart.current.ex + dx),
        ),
        y: Math.max(
          0,
          Math.min(window.innerHeight - rect.height, dragStart.current.ey + dy),
        ),
      });
    };

    const onUp = () => {
      dragStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const style: React.CSSProperties = pos
    ? {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        bottom: "auto",
        transform: "none",
      }
    : {};

  return (
    <div
      data-floating
      style={style}
      className={`z-50 flex items-center gap-3 ${pos ? "" : "fixed bottom-8 left-1/2 -translate-x-1/2"}`}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className="p-3 rounded-lg bg-black/80 text-white/50 hover:text-white backdrop-blur-sm shadow-lg cursor-grab active:cursor-grabbing transition-colors"
        title="Drag to move"
      >
        <GripHorizontal className="w-5 h-5" />
      </div>

      {/* Whiteboard mode toggle */}
      <button
        onClick={onToggleWhiteboard}
        className={`p-3 rounded-lg backdrop-blur-sm transition-all shadow-lg ${
          isWhiteboardMode
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-black/80 hover:bg-black text-white"
        }`}
        title={
          isWhiteboardMode
            ? "Exit Whiteboard Mode"
            : "Enter Whiteboard Mode (W)"
        }
      >
        <PenTool className="w-5 h-5" />
      </button>

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-3 rounded-lg bg-black/80 hover:bg-black text-white backdrop-blur-sm transition-all shadow-lg"
        title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
      >
        {isSidebarCollapsed ? (
          <Maximize2 className="w-5 h-5" />
        ) : (
          <Minimize2 className="w-5 h-5" />
        )}
      </button>

      {/* Navigation controls */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-black/80 backdrop-blur-sm shadow-lg">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="p-2 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
          title="Previous (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-sm text-white font-medium px-3">
          <span>{currentSlide + 1}</span>
          <span className="text-white/60"> / {totalSlides}</span>
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-2 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
          title="Next (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="p-3 rounded-lg bg-black/80 hover:bg-black text-white backdrop-blur-sm transition-all shadow-lg"
        title="Exit Presentation (Esc)"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
