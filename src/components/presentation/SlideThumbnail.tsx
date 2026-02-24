import {
  FileText,
  HelpCircle,
  Lightbulb,
  List,
  PenTool,
  Target,
} from "lucide-react";
import { AnySlide } from "@/types/lessonPack";

interface SlideThumbnailProps {
  slide: AnySlide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const getSlideIcon = (type: string) => {
  switch (type) {
    case "TITLE":
    case "SUMMARY":
      return <FileText className="w-4 h-4" />;
    case "HOOK":
    case "PRIOR_KNOWLEDGE":
      return <HelpCircle className="w-4 h-4" />;
    case "TEACH":
    case "CONCEPT_MAP":
      return <Lightbulb className="w-4 h-4" />;
    case "WORKED_EXAMPLE":
    case "GUIDED_PRACTICE":
    case "STUDENT_TASK":
      return <PenTool className="w-4 h-4" />;
    case "ASSESSMENT_QUESTION":
    case "EXIT_TICKET":
      return <Target className="w-4 h-4" />;
    default:
      return <List className="w-4 h-4" />;
  }
};

export const SlideThumbnail = ({
  slide,
  index,
  isActive,
  onClick,
}: SlideThumbnailProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 border ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
          : "bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-gray-700 dark:text-zinc-300"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isActive
            ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
            : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400"
        }`}
      >
        <span className="text-xs font-semibold">{index + 1}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${isActive ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-zinc-100"}`}
        >
          {slide.title}
        </p>
        <div
          className={`flex items-center gap-1.5 mt-0.5 text-xs ${isActive ? "text-blue-700/70 dark:text-blue-300/70" : "text-gray-500 dark:text-zinc-500"}`}
        >
          {getSlideIcon(slide.slide_type)}
          <span className="capitalize text-[10px] tracking-wide font-medium">
            {slide.slide_type.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </button>
  );
};
