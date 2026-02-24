import { LearningObjectivesSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MarkdownRenderer } from "../../MarkdownRenderer";
import { Target } from "lucide-react";

interface LearningObjectivesSlideProps {
  slide: SlideType;
}

export const LearningObjectivesSlide = ({ slide }: LearningObjectivesSlideProps) => {
  return (
    <SlideContainer>
      <div className="h-full flex flex-col gap-8">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{slide.title}</h2>
        </div>

        <div className="flex-1 min-h-0 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {slide.objectives.map((obj, i) => (
              <div 
                key={i} 
                className="flex gap-4 items-start p-6 bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm animate-fade-in-right"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-lg border border-green-200 dark:border-green-800">
                  {i + 1}
                </span>
                <div className="pt-1 flex-1">
                  <MarkdownRenderer content={obj} className="text-2xl font-medium text-gray-800 dark:text-zinc-100 leading-snug" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};
