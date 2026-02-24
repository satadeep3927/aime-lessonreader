import { AssessmentInstructionsSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { Clock, BookOpen } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const AssessmentInstructionsSlide = ({ slide }: Props) => {
  return (
    <SlideContainer className="relative bg-linear-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-slate-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
              Assessment
            </p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Content grid */}
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* Time + resources row */}
          <div className="flex gap-3">
            {/* Time */}
            <div className="flex items-center gap-3 bg-blue-600 text-white rounded-2xl px-6 py-4 shadow-lg">
              <Clock className="w-5 h-5 text-blue-200" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-200">
                  Time
                </p>
                <p className="text-xl font-black">{slide.time_minutes} min</p>
              </div>
            </div>

            {/* Allowed resources */}
            {slide.allowed_resources.length > 0 && (
              <div className="flex-1 bg-white/75 border border-blue-200 rounded-2xl px-5 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">
                  Allowed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {slide.allowed_resources.map((r, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-2.5 py-1"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-8 py-6 border border-blue-200 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">
              Instructions
            </p>
            <ol className="flex flex-col gap-3">
              {slide.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black text-blue-700 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 leading-snug">
                    {inst}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="invisible h-10" />
      </div>
    </SlideContainer>
  );
};
