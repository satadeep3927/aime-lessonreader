import { TeachSlide as TeachSlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MarkdownRenderer } from "../../MarkdownRenderer";
import { BookOpen, ListChecks } from "lucide-react";

interface TeachSlideProps {
  slide: TeachSlideType;
}

export const TeachSlide = ({ slide }: TeachSlideProps) => {
  return (
    <SlideContainer>
      <div className="h-full flex flex-col gap-8">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{slide.title}</h2>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="overflow-y-auto pr-4 custom-scrollbar">
              <MarkdownRenderer content={slide.content} className="text-xl leading-relaxed text-gray-800 dark:text-zinc-200" />
            </div>
            
            <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
              {slide.image_url && (
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <img src={slide.image_url} alt="Slide visual" className="w-full h-full object-contain" />
                </div>
              )}
              
              {slide.key_terms && slide.key_terms.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-900/30 shrink-0">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-500 mb-3 flex items-center gap-2">
                    <ListChecks className="w-5 h-5" /> Key Terms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {slide.key_terms.map((term, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-md text-sm font-medium shadow-sm border border-yellow-100 dark:border-zinc-700 text-gray-700 dark:text-zinc-300">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};
