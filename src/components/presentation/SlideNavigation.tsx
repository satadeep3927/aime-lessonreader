import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  currentSlideTitle: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPresentationMode?: () => void;
}

export const SlideNavigation = ({
  currentSlide,
  totalSlides,
  currentSlideTitle,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onPresentationMode,
}: SlideNavigationProps) => {
  return (
    <div className="h-14 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 transition-colors"
          title="Previous (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-sm text-gray-700 dark:text-zinc-300">
          <span className="font-semibold">{currentSlide + 1}</span>
          <span className="text-gray-400 dark:text-zinc-500"> / {totalSlides}</span>
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 transition-colors"
          title="Next (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 dark:text-zinc-300 font-medium truncate max-w-md">
          {currentSlideTitle}
        </span>
        {onPresentationMode && (
          <button
            onClick={onPresentationMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300 transition-colors"
            title="Presentation Mode (F5)"
          >
            <Presentation className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
