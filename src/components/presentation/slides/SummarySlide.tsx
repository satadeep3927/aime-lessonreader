import { SummarySlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  slide: SlideType;
}

export const SummarySlide = ({ slide }: Props) => {
  return (
    <SlideContainer className="relative bg-linear-to-br from-teal-50 via-emerald-50 to-green-50">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-white/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-500 mb-3">
            Lesson Summary
          </p>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Key takeaways */}
        <div className="w-full max-w-2xl flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 text-center mb-1">
            Key Takeaways
          </p>
          {slide.key_takeaways.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white/75 backdrop-blur-sm rounded-2xl px-6 py-4 border border-teal-200 shadow-sm"
            >
              <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="text-base font-semibold text-zinc-800 leading-snug">
                {point}
              </p>
            </div>
          ))}
        </div>

        {/* Next lesson preview or spacer */}
        {slide.next_lesson_preview ? (
          <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl px-8 py-5 flex items-center gap-5">
            <div className="shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">
                Up Next
              </p>
              <p className="text-sm font-semibold text-white leading-snug">
                {slide.next_lesson_preview}
              </p>
            </div>
          </div>
        ) : (
          <div className="invisible h-14" />
        )}
      </div>
    </SlideContainer>
  );
};
