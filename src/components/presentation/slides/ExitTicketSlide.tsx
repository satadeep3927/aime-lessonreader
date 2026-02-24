import { useState } from "react";
import { ExitTicketSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { ChevronLeft, ChevronRight, Eye, TicketIcon } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const ExitTicketSlide = ({ slide }: Props) => {
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
    <SlideContainer className="relative bg-linear-to-br from-indigo-50 via-violet-50 to-purple-50">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-white/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <TicketIcon className="w-4 h-4 text-indigo-400" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400">
              Exit Ticket
            </p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Question card area */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {/* Progress dots */}
          <div
            className={`flex items-center gap-2 ${total <= 1 ? "invisible" : ""}`}
          >
            {slide.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-indigo-500"
                    : i < current
                      ? "w-2 bg-indigo-300"
                      : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>

          {/* Question card */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-indigo-200 shadow-lg text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">
              Question {current + 1}
              {total > 1 ? ` of ${total}` : ""}
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {slide.questions[current] ?? "—"}
            </p>
          </div>

          {/* Answer */}
          {answer ? (
            revealed ? (
              <div className="w-full bg-indigo-50 border border-indigo-200 rounded-3xl px-10 py-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
                  Answer
                </p>
                <p className="text-lg font-semibold text-indigo-900 leading-relaxed">
                  {answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                Reveal Answer
              </button>
            )
          ) : null}
        </div>

        {/* Bottom: threshold note or navigation */}
        <div className="flex flex-col items-center gap-4 w-full">
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

          {/* Threshold note */}
          {slide.threshold_note ? (
            <p className="text-xs font-semibold text-indigo-400 text-center max-w-md">
              {slide.threshold_note}
            </p>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </div>
    </SlideContainer>
  );
};
