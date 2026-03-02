import { TitleSlide } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { CheckCircle2 } from "lucide-react";
import { resolveImagePath } from "@/lib/utils";

interface TitleSlideProps {
  slide: TitleSlide;
  extractedPath: string;
}

export const CoverSlide = ({ slide, extractedPath }: TitleSlideProps) => {
  const resolvedImageUrl = resolveImagePath(slide.image_url, extractedPath);
  return (
    <SlideContainer className="relative">
      {/* Background: image fills the whole slide or gradient fallback */}
      <div className="absolute inset-0">
        {resolvedImageUrl ? (
          <>
            <img
              src={resolvedImageUrl}
              alt=""
              className="w-full h-full object-cover blur-md"
            />
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-indigo-50 opacity-60" />
          </>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-50 via-white to-indigo-50" />
        )}
      </div>

      {/* Content layer */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-16 py-10 gap-8">
        {/* Subject / Grade badges */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide border border-blue-200">
            {slide.subject.toUpperCase()}
          </span>
          <span className="px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-sm font-semibold tracking-wide border border-zinc-200">
            {slide.grade_level}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
            {slide.title}
          </h1>
          <div className="h-1 w-24 bg-blue-500 rounded-full mx-auto" />
        </div>

        {/* Objectives preview */}
        {slide.objectives_preview && slide.objectives_preview.length > 0 && (
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-zinc-200 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              In this lesson
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              {slide.objectives_preview.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-snug">
                    {obj}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SlideContainer>
  );
};
