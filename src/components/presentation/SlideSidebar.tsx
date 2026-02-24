import { Home } from "lucide-react";
import { SlideThumbnail } from "./SlideThumbnail";
import type { AnySlide } from "@/types/lessonPack";

interface SlideSidebarProps {
  lessonName: string;
  totalSlides: number;
  slides: AnySlide[];
  currentSlide: number;
  onSlideClick: (index: number) => void;
  onBackToHome: () => void;
}

export const SlideSidebar = ({
  lessonName,
  totalSlides,
  slides,
  currentSlide,
  onSlideClick,
  onBackToHome,
}: SlideSidebarProps) => {
  return (
    <div className="w-72 bg-[#fafafa] dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col shrink-0 h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2
          className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate mb-1"
          title={lessonName}
        >
          {lessonName}
        </h2>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
          <span>{totalSlides} slides</span>
        </div>
      </div>

      {/* Slide Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={index}
            index={index}
            slide={slide}
            isActive={index === currentSlide}
            onClick={() => onSlideClick(index)}
          />
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
        <button
          onClick={onBackToHome}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-lg transition-all shadow-sm hover:shadow text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
