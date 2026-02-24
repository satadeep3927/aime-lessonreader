import { useState } from "react";
import { MisconceptionSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  slide: SlideType;
}

export const MisconceptionSlide = ({ slide }: Props) => {
  const [current, setCurrent] = useState(0);
  // 0 = mistake shown, 1 = correction shown, 2 = explanation shown
  const [stage, setStage] = useState(0);

  const total = slide.items.length;
  const item = slide.items[current];

  const goNext = () => {
    if (current < total - 1) {
      setCurrent(current + 1);
      setStage(0);
    }
  };

  const goPrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setStage(0);
    }
  };

  return (
    <SlideContainer className="relative bg-linear-to-br from-red-50 via-orange-50 to-rose-50">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-red-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-56 h-28 rounded-full bg-rose-100/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-400 mb-3">
            Common Misconceptions
          </p>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Cards */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div
            className={`flex items-center gap-2 ${total <= 1 ? "invisible" : ""}`}
          >
            {slide.items.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-rose-500"
                    : i < current
                      ? "w-2 bg-rose-300"
                      : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>

          {/* Mistake card — always visible */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-8 py-6 border border-red-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-red-400">
                Misconception {current + 1}
                {total > 1 ? ` of ${total}` : ""}
              </p>
            </div>
            <p className="text-xl font-bold text-zinc-900 leading-snug">
              {item.mistake}
            </p>
          </div>

          {/* Correction card */}
          {stage >= 1 && (
            <div className="w-full bg-green-50 border border-green-200 rounded-3xl px-8 py-6 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-green-500">
                  Correction
                </p>
              </div>
              <p className="text-lg font-semibold text-green-900 leading-snug">
                {item.correction}
              </p>
            </div>
          )}

          {/* Explanation card */}
          {stage >= 2 && (
            <div className="w-full bg-sky-50 border border-sky-200 rounded-3xl px-8 py-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-sky-400 mb-2">
                Why?
              </p>
              <p className="text-base font-medium text-sky-900 leading-relaxed">
                {item.explanation}
              </p>
            </div>
          )}

          {/* Reveal button */}
          {stage < 2 && (
            <button
              onClick={() => setStage((s) => s + 1)}
              className={`mt-1 px-6 py-3 rounded-xl font-bold text-sm text-white transition-colors ${
                stage === 0
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-sky-500 hover:bg-sky-600"
              }`}
            >
              {stage === 0 ? "Show Correction" : "Show Explanation"}
            </button>
          )}
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
