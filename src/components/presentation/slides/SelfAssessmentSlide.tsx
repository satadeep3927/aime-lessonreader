import { useState } from "react";
import { SelfAssessmentSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";

interface Props {
  slide: SlideType;
}

const RATINGS = [
  {
    label: "Not yet",
    color: "bg-red-100 border-red-300 text-red-700",
    dot: "bg-red-400",
  },
  {
    label: "Getting there",
    color: "bg-amber-100 border-amber-300 text-amber-700",
    dot: "bg-amber-400",
  },
  {
    label: "Got it!",
    color: "bg-green-100 border-green-300 text-green-700",
    dot: "bg-green-500",
  },
];

export const SelfAssessmentSlide = ({ slide }: Props) => {
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const setRating = (i: number, r: number) =>
    setRatings((prev) => ({ ...prev, [i]: r }));

  return (
    <SlideContainer className="relative bg-linear-to-br from-lime-50 via-green-50 to-emerald-50">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-lime-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-600 mb-3">
            Self Assessment
          </p>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
          {slide.scale && (
            <p className="mt-2 text-xs font-semibold text-zinc-400">
              {slide.scale}
            </p>
          )}
        </div>

        {/* Objectives */}
        <div className="w-full max-w-2xl flex flex-col gap-3">
          {slide.objectives.map((obj, i) => {
            const rating = ratings[i];
            return (
              <div
                key={i}
                className="bg-white/75 backdrop-blur-sm rounded-2xl px-6 py-4 border border-lime-200 shadow-sm flex items-center gap-4"
              >
                <p className="flex-1 text-sm font-semibold text-zinc-800 leading-snug">
                  {obj}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {RATINGS.map((r, ri) => (
                    <button
                      key={ri}
                      onClick={() => setRating(i, ri)}
                      title={r.label}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        rating === ri
                          ? `${r.dot} border-transparent scale-110`
                          : "bg-white border-zinc-200 hover:border-zinc-300"
                      }`}
                    />
                  ))}
                </div>
                {rating !== undefined && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${RATINGS[rating].color} shrink-0`}
                  >
                    {RATINGS[rating].label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          {RATINGS.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${r.dot}`} />
              <span className="text-xs font-semibold text-zinc-500">
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SlideContainer>
  );
};
