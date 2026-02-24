import { ConceptMapSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";

interface Props {
  slide: SlideType;
}

export const ConceptMapSlide = ({ slide }: Props) => {
  return (
    <SlideContainer className="relative bg-linear-to-br from-cyan-50 via-sky-50 to-blue-50">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-cyan-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500 mb-3">
            Concept Map
          </p>
          <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
        </div>

        {/* Central concept + connections */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {/* Central concept */}
          <div className="bg-cyan-600 text-white rounded-2xl px-8 py-4 shadow-lg text-center">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-200 mb-1">
              Central Concept
            </p>
            <p className="text-xl font-black">{slide.central_concept}</p>
          </div>

          {/* Connector line */}
          <div className="w-0.5 h-4 bg-cyan-300" />

          {/* Connections grid */}
          <div className="w-full grid grid-cols-2 gap-2">
            {slide.connections.map((conn, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/75 backdrop-blur-sm rounded-2xl px-5 py-3 border border-cyan-200 shadow-sm"
              >
                <div className="shrink-0 w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-black text-cyan-700 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-zinc-800 leading-snug">
                  {conn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {slide.summary_text ? (
          <div className="w-full max-w-2xl bg-white/60 border border-cyan-200 rounded-2xl px-7 py-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">
              Summary
            </p>
            <p className="text-sm font-semibold text-zinc-700 leading-relaxed">
              {slide.summary_text}
            </p>
          </div>
        ) : (
          <div className="invisible h-10" />
        )}
      </div>
    </SlideContainer>
  );
};
