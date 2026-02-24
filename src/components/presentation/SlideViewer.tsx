// src/components/presentation/SlideViewer.tsx
import { AnySlide } from "@/types/lessonPack";
import { CoverSlide } from "./slides/CoverSlide";
import { TeachSlide } from "./slides/TeachSlide";
import { HookSlide } from "./slides/HookSlide";
import { WorkedExampleSlide } from "./slides/WorkedExampleSlide";
import { LearningObjectivesSlide } from "./slides/LearningObjectivesSlide";
import { GenericSlide } from "./slides/GenericSlide";

interface SlideViewerProps {
  slide: AnySlide;
  isFullScreen?: boolean;
  zoom?: number;
  embedded?: boolean;
}

export const SlideViewer = ({
  slide,
  isFullScreen = false,
  zoom = 100,
  embedded = false,
}: SlideViewerProps) => {
  // Helper to render content based on slide type
  const renderSlideContent = () => {
    switch (slide.slide_type) {
      case "TITLE":
        return <CoverSlide slide={slide} />;
      case "TEACH":
        return <TeachSlide slide={slide} />;
      case "HOOK":
        return <HookSlide slide={slide} />;
      case "WORKED_EXAMPLE":
        return <WorkedExampleSlide slide={slide} />;
      case "LEARNING_OBJECTIVES":
        return <LearningObjectivesSlide slide={slide} />;
      default:
        // Use generic slide for unimplemented types so the app doesn't break
        return <GenericSlide slide={slide} />;
    }
  };

  const scale = () => {
    return isFullScreen ? "scale(1)" : `scale(${zoom / 100})`;
  };

  if (embedded) {
    return (
      <div className="w-full h-full bg-white dark:bg-zinc-900 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
          {renderSlideContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f3f3f3] dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
      <div
        className="transition-transform duration-200 origin-center"
        style={{ transform: scale() }}
      >
        <div className="aspect-video w-7xl bg-white dark:bg-zinc-900 shadow-2xl rounded-xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            {renderSlideContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
