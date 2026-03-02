import { HookSlide as HookSlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { resolveImagePath } from "@/lib/utils";

interface HookSlideProps {
  slide: HookSlideType;
  extractedPath: string;
}

export const HookSlide = ({ slide, extractedPath }: HookSlideProps) => {
  const resolvedImageUrl = resolveImagePath(slide.image_url, extractedPath);
  return (
    <SlideContainer className="relative flex">
      {/* Left: content */}
      <div
        className={`relative z-10 flex flex-col justify-center px-16 py-12 bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-50 ${
          resolvedImageUrl ? "w-1/2" : "w-full items-center text-center"
        }`}
      >
        {/* Decorative blobs — only shown when no image */}
        {!resolvedImageUrl && (
          <>
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-purple-200/50 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-15 -left-15 w-64 h-64 rounded-full bg-fuchsia-200/50 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-violet-200/40 blur-2xl pointer-events-none" />
          </>
        )}

        {/* Decorative accent */}
        <div className="w-12 h-1.5 bg-purple-500 rounded-full mb-8" />

        {/* Slide label */}
        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-400 mb-4">
          Think About It
        </p>

        {/* Title */}
        <h2 className="text-2xl font-bold text-zinc-400 mb-5 leading-snug">
          {slide.title}
        </h2>

        {/* Question — the hero text */}
        <p
          className={`font-black text-zinc-900 leading-tight tracking-tight ${
            resolvedImageUrl ? "text-4xl" : "text-5xl max-w-3xl"
          }`}
        >
          {slide.question}
        </p>

        {/* Bottom decorative circles */}
        <div
          className={`absolute bottom-8 flex gap-2 opacity-30 ${resolvedImageUrl ? "left-16" : "left-1/2 -translate-x-1/2"}`}
        >
          <div className="w-3 h-3 rounded-full bg-purple-400" />
          <div className="w-3 h-3 rounded-full bg-fuchsia-400" />
          <div className="w-3 h-3 rounded-full bg-violet-400" />
        </div>
      </div>

      {/* Right: full-height image */}
      {resolvedImageUrl && (
        <div className="w-1/2 h-full shrink-0">
          <img
            src={resolvedImageUrl}
            alt="Thinking prompt"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </SlideContainer>
  );
};
