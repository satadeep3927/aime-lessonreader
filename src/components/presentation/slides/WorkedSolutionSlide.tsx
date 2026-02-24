import { WorkedSolutionSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";

interface Props {
  slide: SlideType;
}

export const WorkedSolutionSlide = ({ slide }: Props) => {
  return (
    <SlideContainer className="relative flex">
      {/* Left panel — problem */}
      <div className="w-2/5 shrink-0 flex flex-col justify-center px-10 py-10 bg-linear-to-br from-slate-900 via-zinc-800 to-slate-900">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-4">
          Problem
        </p>
        <h2 className="text-2xl font-black text-white leading-snug mb-6">
          {slide.title}
        </h2>
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
          <p className="text-base font-semibold text-zinc-200 leading-relaxed">
            {slide.problem}
          </p>
        </div>
      </div>

      {/* Right panel — solution */}
      <div className="flex-1 flex flex-col justify-center px-10 py-10 bg-linear-to-br from-slate-50 via-green-50/40 to-white overflow-y-auto">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-green-500 mb-4">
          Full Solution
        </p>
        <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-3xl px-8 py-7 shadow-lg">
          <p className="text-base font-semibold text-zinc-800 leading-relaxed whitespace-pre-wrap">
            {slide.solution}
          </p>
        </div>
      </div>
    </SlideContainer>
  );
};
