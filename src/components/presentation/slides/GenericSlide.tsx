import { AnySlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MarkdownRenderer } from "../../MarkdownRenderer";
import {
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  PenTool,
  Target,
} from "lucide-react";

interface GenericSlideProps {
  slide: SlideType;
}

export const GenericSlide = ({ slide }: GenericSlideProps) => {
  const renderIcon = () => {
    switch (slide.slide_type) {
      case "TEACH":
        return (
          <Lightbulb className="w-8 h-8 text-amber-500 dark:text-amber-400" />
        );
      case "HOOK":
        return (
          <HelpCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        );
      case "LEARNING_OBJECTIVES":
        return (
          <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
        );
      case "WORKED_EXAMPLE":
        return <PenTool className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
      default:
        return (
          <CheckCircle2 className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        );
    }
  };

  return (
    <SlideContainer>
      <div className="h-full flex flex-col gap-8">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {renderIcon()}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {slide.title}
          </h2>
        </div>

        <div className="flex-1 min-h-0 relative overflow-y-auto custom-scrollbar">
          {/* Generic Content Renderer */}
          <div className="prose dark:prose-invert max-w-none text-lg">
            {"content" in slide && (
              <MarkdownRenderer content={(slide as any).content} />
            )}

            {"questions" in slide && (
              <div className="space-y-6">
                {(slide as any).questions.map((q: string, i: number) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs"
                  >
                    <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">
                      Question {i + 1}
                    </h4>
                    <MarkdownRenderer content={q} />
                  </div>
                ))}
              </div>
            )}

            {/* Fallback for unknown properties */}
            <pre className="mt-8 text-xs bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 font-mono text-gray-500 overflow-x-auto">
              {JSON.stringify(slide, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};
