import { MarkSchemeSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { ShieldCheck } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const MarkSchemeSlide = ({ slide }: Props) => {
  return (
    <SlideContainer className="relative bg-linear-to-br from-slate-950 via-zinc-900 to-slate-900">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-zinc-800/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Teacher Only
            </span>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">
            Mark Scheme
          </p>
          <h2 className="text-3xl font-black text-white">{slide.title}</h2>
        </div>

        {/* Cards */}
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* Question + marks */}
          <div className="flex items-center justify-between px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-sm font-bold text-zinc-300">
              Question {slide.question_number}
            </span>
            <span className="text-sm font-black text-white px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              {slide.marks} {slide.marks === 1 ? "mark" : "marks"}
            </span>
          </div>

          {/* Answer */}
          <div className="bg-emerald-950/50 border border-emerald-700/40 rounded-3xl px-8 py-7">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">
              Answer
            </p>
            <p className="text-lg font-semibold text-emerald-100 leading-relaxed">
              {slide.answer}
            </p>
          </div>

          {/* Partial credit */}
          {slide.partial_credit && (
            <div className="bg-amber-950/40 border border-amber-700/30 rounded-2xl px-7 py-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">
                Partial Credit
              </p>
              <p className="text-sm font-semibold text-amber-100 leading-relaxed">
                {slide.partial_credit}
              </p>
            </div>
          )}
        </div>

        <div className="invisible h-10" />
      </div>
    </SlideContainer>
  );
};
