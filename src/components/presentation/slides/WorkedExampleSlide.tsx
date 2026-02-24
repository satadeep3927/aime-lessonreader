import { WorkedExampleSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { MarkdownRenderer } from "../../MarkdownRenderer";
import { ChevronRight, ChevronsRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface WorkedExampleSlideProps {
  slide: SlideType;
}

export const WorkedExampleSlide = ({ slide }: WorkedExampleSlideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const done = currentStep >= slide.steps.length;

  return (
    <SlideContainer className="relative flex">
      {/* Left: problem */}
      <div className="w-2/5 h-full flex flex-col justify-center px-10 py-10 gap-6 bg-linear-to-br from-slate-900 via-zinc-800 to-slate-900">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-3">
            Worked Example
          </p>
          <h2 className="text-2xl font-black text-white leading-tight mb-6">
            {slide.title}
          </h2>
          <div className="h-px bg-zinc-700 mb-6" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Problem
          </p>
          <MarkdownRenderer
            content={slide.problem}
            className="text-lg font-medium text-zinc-200 leading-relaxed"
          />
        </div>

        {/* Step counter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {slide.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentStep ? "w-6 bg-blue-400" : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right: steps */}
      <div className="w-3/5 h-full flex flex-col bg-linear-to-br from-slate-50 via-blue-50/30 to-white">
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8 pb-4 border-b border-zinc-200 shrink-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            Step-by-Step Solution
          </p>
          <div className="flex gap-2">
            {!done && (
              <button
                onClick={() =>
                  setCurrentStep((p) => Math.min(p + 1, slide.steps.length))
                }
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Next Step
              </button>
            )}
            {!done && (
              <button
                onClick={() => setCurrentStep(slide.steps.length)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-600 text-xs font-bold transition-colors"
              >
                <ChevronsRight className="w-3.5 h-3.5" /> Reveal All
              </button>
            )}
          </div>
        </div>

        {/* Steps list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-10 py-6 space-y-3">
          {slide.steps.map((step, i) => (
            <div
              key={i}
              className={`flex gap-4 p-5 rounded-2xl border transition-all duration-400 ${
                i < currentStep
                  ? "bg-white border-zinc-200 shadow-sm opacity-100"
                  : "bg-white/60 border-zinc-200 opacity-60 pointer-events-none select-none"
              }`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                  i < currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                {i + 1}
              </span>
              <MarkdownRenderer
                content={step}
                className="text-base font-semibold text-zinc-800 pt-0.5"
              />
            </div>
          ))}

          {/* Final answer */}
          {done && (
            <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-xs font-black uppercase tracking-widest text-green-600">
                  Final Answer
                </p>
              </div>
              <MarkdownRenderer
                content={slide.final_answer}
                className="text-xl font-bold text-green-900"
              />
              {slide.check && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs font-bold text-green-600 mb-1">
                    Check:
                  </p>
                  <MarkdownRenderer
                    content={slide.check}
                    className="text-sm text-green-800"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SlideContainer>
  );
};
