import { HookSlide as HookSlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { HelpCircle } from "lucide-react";

interface HookSlideProps {
  slide: HookSlideType;
}

export const HookSlide = ({ slide }: HookSlideProps) => {
  return (
    <SlideContainer>
      <div className="h-full flex flex-col gap-8">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{slide.title}</h2>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight animate-fade-in-up">
             {slide.question}
           </h2>
           
           {slide.image_url && (
             <div className="relative w-full max-h-[50vh] rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700 animate-scale-in">
               <img src={slide.image_url} className="w-full h-full object-contain bg-zinc-50 dark:bg-zinc-800" alt="Thinking prompt" />
             </div>
           )}
        </div>
      </div>
    </SlideContainer>
  );
};
