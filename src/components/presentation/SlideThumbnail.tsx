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
      className={w-full text-left p-3 rounded-lg transition-all flex items-center gap-3  border}
    >
      <div
        className={w-8 h-8 rounded-full flex items-center justify-center shrink-0 }
      >
        <span className="text-xs font-semibold">{index + 1}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={\	ext-sm font-medium truncate \\}>
          {slide.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-zinc-500">
          {getSlideIcon(slide.slide_type)}
          <span className="capitalize text-[10px] tracking-wide font-medium">{slide.slide_type.replace(/_/g, " ")}</span>
        </div>
      </div>
    </button>
  );
};
