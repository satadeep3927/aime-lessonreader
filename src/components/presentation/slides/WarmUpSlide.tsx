import { useState } from "react";
import { WarmUpSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { ChevronLeft, ChevronRight, Eye, Flame } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const WarmUpSlide = ({ slide }: Props) => {
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const total = slide.questions.length;

  const goNext = () => {
    if (current < total - 1) {
      setCurrent(current + 1);
      setRevealed(false);
    }
  };
  const goPrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setRevealed(false);
    }
  };

  const answer = slide.answers?.[current];

  return (
    <SlideContainer className="relative bg-linear-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-white/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
              Warm Up
            </p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          <div
            className={`flex items-center gap-2 ${total <= 1 ? "invisible" : ""}`}
          >
            {slide.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-orange-500"
                    : i < current
                      ? "w-2 bg-orange-300"
                      : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>

          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-orange-200 shadow-lg text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
              Question {current + 1}
              {total > 1 ? ` of ${total}` : ""}
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {slide.questions[current] ?? "—"}
            </p>
          </div>

          {answer ? (
            revealed ? (
              <div className="w-full bg-orange-50 border border-orange-200 rounded-3xl px-10 py-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">
                  Answer
                </p>
                <p className="text-lg font-semibold text-orange-900 leading-relaxed">
                  {answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors"
              >
                <Eye className="w-4 h-4" /> Reveal Answer
              </button>
            )
          ) : null}
        </div>

        <div
          className={`flex items-center gap-4 ${total <= 1 ? "invisible" : ""}`}
        >
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-700" />
          </button>
          <span className="text-sm font-semibold text-zinc-500">
            {current + 1} / {total}
          </span>
          <button
            onClick={goNext}
            disabled={current === total - 1}
            className="p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-700" />
          </button>
        </div>
      </div>
    </SlideContainer>
  );
};
