import { useState } from "react";
import { PriorKnowledgeSlide as PriorKnowledgeSlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Props {
  slide: PriorKnowledgeSlideType;
}

export const PriorKnowledgeSlide = ({ slide }: Props) => {
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

  return (
    <SlideContainer className="relative bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Decorative blobs */}
      <div className="absolute -top-15 -right-15 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500 mb-3">
            Prior Knowledge Check
          </p>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Question card */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {slide.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-amber-500"
                    : i < current
                      ? "w-2 bg-amber-300"
                      : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>

          {/* Question */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-amber-200 shadow-lg text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
              Question {current + 1} of {total}
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {slide.questions[current]}
            </p>
          </div>

          {/* Answer */}
          {revealed ? (
            <div className="w-full bg-green-50 border border-green-200 rounded-3xl px-10 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-3">
                Answer
              </p>
              <p className="text-lg font-semibold text-green-800 leading-relaxed">
                {slide.answers[current] ?? "—"}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors"
            >
              <Eye className="w-4 h-4" />
              Reveal Answer
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
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
