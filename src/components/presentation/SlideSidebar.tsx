import { Home } from "lucide-react";
import { SlideThumbnail } from "./SlideThumbnail";
import type { LessonPackSlide } from "@/types/lessonPack";

interface SlideSidebarProps {
  lessonName: string;
  totalSlides: number;
  slides: LessonPackSlide[];
  thumbnailContents: Map<number, string>;
  currentSlide: number;
  onSlideClick: (index: number) => void;
  onBackToHome: () => void;
}

export const SlideSidebar = ({
  lessonName,
  totalSlides,
  slides,
  thumbnailContents,
  currentSlide,
  onSlideClick,
  onBackToHome,
}: SlideSidebarProps) => {
  return (
    <div className="w-72 bg-[#fafafa] dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <h2
          className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate"
          title={lessonName}
        >
          {lessonName}
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          {totalSlides} slides
        </p>
      </div>

      {/* Slide Thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {slides.map((slide, index) => {
          const thumbnailHtml = thumbnailContents.get(index) || "";

          return (
            <SlideThumbnail
              key={slide.id}
              index={index}
              title={slide.title}
              htmlContent={thumbnailHtml}
              isActive={index === currentSlide}
              onClick={() => onSlideClick(index)}
            />
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-700">
        <button
          onClick={onBackToHome}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-600 rounded transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </div>
    </div>
  );
};
