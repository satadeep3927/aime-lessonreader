import { TeachSlide as TeachSlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MarkdownRenderer } from "../../MarkdownRenderer";
import { resolveImagePath } from "@/lib/utils";

interface TeachSlideProps {
  slide: TeachSlideType;
  extractedPath: string;
}

export const TeachSlide = ({ slide, extractedPath }: TeachSlideProps) => {
  const resolvedImageUrl = resolveImagePath(slide.image_url, extractedPath);
  return (
    <SlideContainer className="relative flex">
      {/* Subtle background when no image */}
      {!resolvedImageUrl && (
        <>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
        </>
      )}

      {/* Left: content */}
      <div
        className={`relative z-10 flex flex-col justify-center px-12 py-10 gap-6 bg-linear-to-br from-slate-50 via-blue-50/40 to-white ${
          resolvedImageUrl ? "w-1/2" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="shrink-0">
          <div className="w-10 h-1 bg-blue-500 rounded-full mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
            Lesson Content
          </p>
          <h2 className="text-3xl font-black text-zinc-900 leading-tight">
            {slide.title}
          </h2>
        </div>

        {/* Content */}
        <div className="overflow-y-auto">
          <MarkdownRenderer
            content={slide.content}
            className="text-xl leading-relaxed text-zinc-700 w-full"
          />
        </div>

        {/* Key terms */}
        {slide.key_terms && slide.key_terms.length > 0 && (
          <div className="shrink-0 pt-4 border-t border-blue-100">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              Key Terms
            </p>
            <div className="flex flex-wrap gap-2">
              {slide.key_terms.map((term, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-blue-50 rounded-lg text-sm font-semibold text-blue-700 border border-blue-100"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: full-height image */}
      {resolvedImageUrl && (
        <div className="w-1/2 h-full shrink-0">
          <img
            src={resolvedImageUrl}
            alt="Slide visual"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </SlideContainer>
  );
};
