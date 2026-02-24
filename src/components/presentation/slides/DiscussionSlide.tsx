import { useState } from "react";
import { DiscussionSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MessageCircle, ChevronDown } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const DiscussionSlide = ({ slide }: Props) => {
  const [revealed, setRevealed] = useState(0);

  const total = slide.talking_points.length;

  return (
    <SlideContainer className="relative bg-linear-to-br from-fuchsia-50 via-pink-50 to-rose-50">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-fuchsia-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-60 h-28 rounded-full bg-rose-100/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-fuchsia-400" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-400">
              Discussion
            </p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Prompt */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-fuchsia-200 shadow-lg text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-4">
              Discussion Prompt
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {slide.prompt}
            </p>
          </div>

          {/* Talking points revealed one at a time */}
          {total > 0 && (
            <div className="w-full flex flex-col gap-2">
              {slide.talking_points.slice(0, revealed).map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-fuchsia-50 border border-fuchsia-200 rounded-2xl px-6 py-3"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-fuchsia-200 flex items-center justify-center text-xs font-black text-fuchsia-700 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 leading-snug">
                    {point}
                  </p>
                </div>
              ))}
              {revealed < total && (
                <button
                  onClick={() => setRevealed((r) => r + 1)}
                  className="self-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold text-sm transition-colors mt-1"
                >
                  <ChevronDown className="w-4 h-4" />
                  {revealed === 0 ? "Show Talking Points" : "Next Point"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Spacer for layout balance */}
        <div className="invisible h-12" />
      </div>
    </SlideContainer>
  );
};
