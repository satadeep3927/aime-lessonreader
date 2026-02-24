import { useState } from "react";
import { SynthesisTaskSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { Eye, Lightbulb } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const SynthesisTaskSlide = ({ slide }: Props) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <SlideContainer className="relative bg-linear-to-br from-purple-50 via-violet-50 to-indigo-50">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-white/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">
              Synthesis Task
            </p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Content */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-4">
          {/* Context */}
          {slide.context && (
            <div className="w-full bg-purple-50 border border-purple-200 rounded-2xl px-7 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
                Context
              </p>
              <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
                {slide.context}
              </p>
            </div>
          )}

          {/* Task card */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-purple-300 shadow-lg text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">
              Your Task
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {slide.task}
            </p>
          </div>

          {/* Answer reveal */}
          {slide.answer ? (
            revealed ? (
              <div className="w-full bg-green-50 border border-green-200 rounded-3xl px-10 py-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-3">
                  Model Answer
                </p>
                <p className="text-base font-semibold text-green-900 leading-relaxed">
                  {slide.answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition-colors"
              >
                <Eye className="w-4 h-4" /> Reveal Model Answer
              </button>
            )
          ) : null}
        </div>

        <div className="invisible h-12" />
      </div>
    </SlideContainer>
  );
};
