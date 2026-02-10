import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, PenTool } from 'lucide-react';

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
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
      {/* Whiteboard mode toggle */}
      <button
        onClick={onToggleWhiteboard}
        className={`p-3 rounded-lg backdrop-blur-sm transition-all shadow-lg ${
          isWhiteboardMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-black/80 hover:bg-black text-white'
        }`}
        title={isWhiteboardMode ? 'Exit Whiteboard Mode' : 'Enter Whiteboard Mode (W)'}
      >
        <PenTool className="w-5 h-5" />
      </button>

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-3 rounded-lg bg-black/80 hover:bg-black text-white backdrop-blur-sm transition-all shadow-lg"
        title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
      >
        {isSidebarCollapsed ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
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
