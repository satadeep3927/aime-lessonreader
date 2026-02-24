import {
  AssessmentQuestionSlide as SlideType,
  QuestionType,
} from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";

interface Props {
  slide: SlideType;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "Multiple Choice",
  SHORT: "Short Answer",
  LONG: "Long Answer",
  PROBLEM: "Problem",
};

const TYPE_COLORS: Record<QuestionType, string> = {
  MCQ: "bg-blue-100 text-blue-700 border-blue-200",
  SHORT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  LONG: "bg-violet-100 text-violet-700 border-violet-200",
  PROBLEM: "bg-orange-100 text-orange-700 border-orange-200",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export const AssessmentQuestionSlide = ({ slide }: Props) => {
  return (
    <SlideContainer className="relative bg-linear-to-br from-slate-50 via-zinc-50 to-white">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-zinc-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-slate-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between w-full max-w-2xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">
              Assessment
            </p>
            <h2 className="text-2xl font-black text-zinc-900">{slide.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${TYPE_COLORS[slide.question_type]}`}
            >
              {TYPE_LABELS[slide.question_type]}
            </span>
            <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-zinc-900 text-white">
              {slide.marks} {slide.marks === 1 ? "mark" : "marks"}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="w-full max-w-2xl flex flex-col gap-5">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border border-zinc-200 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Question {slide.question_number}
            </p>
            <p className="text-xl font-bold text-zinc-900 leading-snug">
              {slide.question_text}
            </p>
          </div>

          {/* MCQ options */}
          {slide.options && slide.options.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {slide.options.map((opt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/70 border border-zinc-200 rounded-2xl px-5 py-3"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-600 mt-0.5">
                    {OPTION_LABELS[i] ?? i + 1}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 leading-snug">
                    {opt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blooms level */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">
            Bloom's Level:
          </span>
          <span className="text-xs font-black px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 uppercase tracking-wider">
            {slide.blooms_level}
          </span>
        </div>
      </div>
    </SlideContainer>
  );
};
