import { useState } from "react";
import { GuidedPracticeSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const GuidedPracticeSlide = ({ slide }: Props) => {
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const total = slide.problems.length;

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
    <SlideContainer className="relative bg-linear-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-cyan-200/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-32 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500 mb-3">
            Guided Practice
          </p>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Problem card area */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {/* Progress dots */}
          <div
            className={`flex items-center gap-2 ${total <= 1 ? "invisible" : ""}`}
          >
            {slide.problems.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-sky-500"
                    : i < current
                      ? "w-2 bg-sky-300"
                      : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>

          {/* Problem card */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-sky-300 shadow-lg text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-4">
              Problem {current + 1}
              {total > 1 ? ` of ${total}` : ""}
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {slide.problems[current] ?? "—"}
            </p>
          </div>

          {/* Answer */}
          {answer ? (
            revealed ? (
              <div className="w-full bg-sky-50 border border-sky-200 rounded-3xl px-10 py-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-3">
                  Answer
                </p>
                <p className="text-lg font-semibold text-sky-900 leading-relaxed">
                  {answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                Reveal Answer
              </button>
            )
          ) : null}
        </div>

        {/* Navigation */}
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
