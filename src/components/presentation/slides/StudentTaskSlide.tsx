import { useState } from "react";
import { StudentTaskSlide as SlideType } from "@/types/lessonPack";
import { SlideContainer } from "./SlideContainer";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Props {
  slide: SlideType;
}

const LEVELS = [
  {
    key: "level_0" as const,
    label: "Foundation",
    accentBorder: "border-emerald-300",
    accentText: "text-emerald-600",
    dotActive: "bg-emerald-500",
    dotDone: "bg-emerald-300",
    revealBtn: "bg-emerald-500 hover:bg-emerald-600",
    answerBg: "bg-emerald-50 border-emerald-200",
    answerText: "text-emerald-900",
    answerLabel: "text-emerald-500",
    tabActive: "bg-emerald-500 text-white shadow-sm",
  },
  {
    key: "level_1" as const,
    label: "Core",
    accentBorder: "border-blue-300",
    accentText: "text-blue-600",
    dotActive: "bg-blue-500",
    dotDone: "bg-blue-300",
    revealBtn: "bg-blue-500 hover:bg-blue-600",
    answerBg: "bg-blue-50 border-blue-200",
    answerText: "text-blue-900",
    answerLabel: "text-blue-500",
    tabActive: "bg-blue-500 text-white shadow-sm",
  },
  {
    key: "level_2" as const,
    label: "Extended",
    accentBorder: "border-violet-300",
    accentText: "text-violet-600",
    dotActive: "bg-violet-500",
    dotDone: "bg-violet-300",
    revealBtn: "bg-violet-500 hover:bg-violet-600",
    answerBg: "bg-violet-50 border-violet-200",
    answerText: "text-violet-900",
    answerLabel: "text-violet-500",
    tabActive: "bg-violet-500 text-white shadow-sm",
  },
  {
    key: "level_3" as const,
    label: "Challenge",
    accentBorder: "border-rose-300",
    accentText: "text-rose-600",
    dotActive: "bg-rose-500",
    dotDone: "bg-rose-300",
    revealBtn: "bg-rose-500 hover:bg-rose-600",
    answerBg: "bg-rose-50 border-rose-200",
    answerText: "text-rose-900",
    answerLabel: "text-rose-500",
    tabActive: "bg-rose-500 text-white shadow-sm",
  },
];

export const StudentTaskSlide = ({ slide }: Props) => {
  const [activeLevel, setActiveLevel] = useState(() => {
    for (let i = 0; i < LEVELS.length; i++) {
      if ((slide[LEVELS[i].key] ?? []).length > 0) return i;
    }
    return 0;
  });
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const level = LEVELS[activeLevel];
  const tasks: string[] = slide[level.key] ?? [];
  const total = tasks.length;

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

  const switchLevel = (i: number) => {
    setActiveLevel(i);
    setCurrent(0);
    setRevealed(false);
  };

  const answerKey = `${level.key}-${current}`;
  const answer = slide.answers?.[answerKey] ?? slide.answers?.[String(current)];

  return (
    <SlideContainer className="relative bg-linear-to-br from-slate-50 via-zinc-100 to-slate-50">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-white/60 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Title + level tabs */}
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-3">
              Student Task
            </p>
            <h2 className="text-3xl font-black text-zinc-900">{slide.title}</h2>
          </div>

          {/* Level tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/70 backdrop-blur-sm border border-zinc-200 rounded-2xl shadow-sm">
            {LEVELS.map((l, i) => {
              const levelTasks = slide[l.key] ?? [];
              if (levelTasks.length === 0) return null;
              return (
                <button
                  key={i}
                  onClick={() => switchLevel(i)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeLevel === i
                      ? l.tabActive
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-white/80"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task card area */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {/* Progress dots — always rendered to avoid layout shift */}
          <div
            className={`flex items-center gap-2 ${total <= 1 ? "invisible" : ""}`}
          >
            {tasks.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? `w-6 ${level.dotActive}`
                    : i < current
                      ? `w-2 ${level.dotDone}`
                      : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>

          {/* Task card */}
          <div
            className={`w-full bg-white/80 backdrop-blur-sm rounded-3xl px-10 py-8 border ${level.accentBorder} shadow-lg text-center`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-widest ${level.accentText} mb-4`}
            >
              Task {current + 1}
              {total > 1 ? ` of ${total}` : ""}
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-snug">
              {tasks[current] ?? "—"}
            </p>
          </div>

          {/* Answer */}
          {answer ? (
            revealed ? (
              <div
                className={`w-full rounded-3xl px-10 py-6 border text-center ${level.answerBg}`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${level.answerLabel}`}
                >
                  Answer
                </p>
                <p
                  className={`text-lg font-semibold leading-relaxed ${level.answerText}`}
                >
                  {answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl ${level.revealBtn} text-white font-bold text-sm transition-colors`}
              >
                <Eye className="w-4 h-4" />
                Reveal Answer
              </button>
            )
          ) : null}
        </div>

        {/* Navigation — always rendered to keep justify-between balanced */}
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
