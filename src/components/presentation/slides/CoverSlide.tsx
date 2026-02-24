import { TitleSlide } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { CheckCircle2, BookOpen } from "lucide-react";

interface TitleSlideProps {
  slide: TitleSlide;
}

export const CoverSlide = ({ slide }: TitleSlideProps) => {
  return (
    <SlideContainer className="bg-linear-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900">
      <div className="h-full flex flex-col items-center justify-center text-center max-w-5xl mx-auto space-y-12">
        
        {/* Header Badges */}
        <div className="flex items-center gap-3 animate-fade-in-down">
          <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide border border-blue-200 dark:border-blue-800">
            {slide.subject.toUpperCase()}
          </span>
          <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-semibold tracking-wide border border-zinc-200 dark:border-zinc-700">
            {slide.grade_level}
          </span>
        </div>

        {/* Main Title */}
        <div className="space-y-6 max-w-4xl animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            {slide.title}
          </h1>
          <div className="h-1 w-24 bg-blue-500 rounded-full mx-auto" />
        </div>

        {/* Cover Image */}
        {slide.image_url && (
            <div className="relative w-full max-w-2xl aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                    src={slide.image_url} 
                    alt="Lesson Cover" 
                    className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            </div>
        )}

        {/* Objectives Preview */}
        {slide.objectives_preview && slide.objectives_preview.length > 0 && (
          <div className="w-full max-w-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs rounded-2xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-xl animate-fade-in-up delay-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6 text-center">
              In this lesson
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {slide.objectives_preview.map((obj, i) => (
                <div key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-snug">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SlideContainer>
  );
};
