import { WorkedExampleSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MarkdownRenderer } from "../../MarkdownRenderer";
import { PenTool } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface WorkedExampleSlideProps {
  slide: SlideType;
}

export const WorkedExampleSlide = ({ slide }: WorkedExampleSlideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <SlideContainer>
      <div className="h-full flex flex-col gap-8">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <PenTool className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{slide.title}</h2>
        </div>

        <div className="flex-1 min-h-0 relative grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Problem Column */}
           <div className="bg-white dark:bg-zinc-800/50 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700 h-fit lg:sticky lg:top-0">
             <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6 flex items-center gap-2">
               Problem Statement
             </h3>
             <MarkdownRenderer content={slide.problem} className="text-2xl font-medium leading-relaxed" />
           </div>
           
           {/* Steps Column */}
           <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-12">
             <div className="flex items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs py-4 z-10 border-b border-dashed border-zinc-200 dark:border-zinc-800 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Step-by-Step Solution
                </h3>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep(prev => Math.min(prev + 1, slide.steps.length))}
                        disabled={currentStep >= slide.steps.length}
                    >
                        Next Step
                    </Button>
                     <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                            setCurrentStep(slide.steps.length);
                            setShowAnswer(true);
                        }}
                    >
                        Reveal All
                    </Button>
                </div>
             </div>

             {slide.steps.map((step, i) => (
               <div 
                 key={i} 
                 className={`flex gap-5 p-6 rounded-2xl border transition-all duration-500 ${
                   i < currentStep 
                    ? "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700 opacity-100 transform translate-x-0" 
                    : "opacity-30 border-transparent blur-sm transform translate-x-4 pointer-events-none"
                 }`}
               >
                 <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                    i < currentStep
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-zinc-100 text-zinc-400 border-zinc-200"
                 }`}>
                   {i + 1}
                 </span>
                 <div className="pt-0.5 flex-1">
                   <MarkdownRenderer content={step} className="text-lg" />
                 </div>
               </div>
             ))}
             
             {currentStep >= slide.steps.length && (
               <div className="mt-8 p-8 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-fade-in-up">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-blue-800 dark:text-blue-300 mb-4">
                    Final Answer
                 </h4>
                 <MarkdownRenderer content={slide.final_answer} className="text-2xl font-bold text-blue-900 dark:text-blue-100" />
                 {slide.check && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Check:</p>
                        <MarkdownRenderer content={slide.check} className="text-base text-blue-800/80 dark:text-blue-200/80" />
                    </div>
                 )}
               </div>
             )}
             
             {currentStep < slide.steps.length && (
                <div className="py-12 text-center">
                    <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                        Reveal Next Step
                    </Button>
                </div>
             )}
           </div>
        </div>
      </div>
    </SlideContainer>
  );
};
