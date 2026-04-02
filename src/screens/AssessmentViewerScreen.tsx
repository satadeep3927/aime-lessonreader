import { useLessonPack } from "@/context/LessonPackContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getAssessmentPack } from "@/lib/assessmentPack";
import type { AssessmentPackRead } from "@/types/api";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ClipboardList,
  Clock,
  GraduationCap,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";

export const AssessmentViewerScreen = () => {
  const { currentPack } = useLessonPack();
  const navigate = useNavigate();

  const [pack, setPack] = useState<AssessmentPackRead | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!currentPack) {
      navigate("/");
      return;
    }
    const ap = getAssessmentPack(
      currentPack.meta as unknown as Record<string, unknown>,
    );
    if (!ap) {
      navigate("/viewer");
      return;
    }
    setPack(ap);
  }, [currentPack, navigate]);

  if (!pack) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 bg-white border-b border-zinc-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/viewer")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-zinc-900 truncate">
            {pack.title ?? "Assessment"}
          </h1>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {pack.subject && <span>{pack.subject}</span>}
            {pack.grade_level && <span>Grade {pack.grade_level}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-answers" className="text-sm text-zinc-600">
            Show Answers
          </Label>
          <Switch
            id="show-answers"
            checked={showAnswers}
            onCheckedChange={setShowAnswers}
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
            {pack.total_marks != null && (
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-zinc-400" />
                {pack.total_marks} marks
              </span>
            )}
            {pack.estimated_time_minutes != null && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                {pack.estimated_time_minutes} minutes
              </span>
            )}
            {pack.assessment_type && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-zinc-400" />
                {pack.assessment_type}
              </span>
            )}
          </div>

          {/* Questions */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-zinc-900">Questions</h2>
            </div>
            <div className="space-y-5">
              {pack.questions?.map((q) => (
                <div
                  key={q.question_number}
                  className="border border-zinc-200 rounded-xl p-5 whitespace-pre-line"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                      {q.question_number}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-zinc-800 leading-relaxed">
                        <Markdown>{q.question_text}</Markdown>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        <span>
                          {q.marks} mark{q.marks !== 1 ? "s" : ""}
                        </span>
                        <span>·</span>
                        <span>{q.question_type}</span>
                        {q.bloom_level && (
                          <>
                            <span>·</span>
                            <span>{q.bloom_level}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="ml-11 space-y-2 mb-3">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            showAnswers && q.answer === opt
                              ? "bg-green-50 border border-green-200 text-green-800"
                              : "bg-zinc-50 border border-zinc-100 text-zinc-700"
                          }`}
                        >
                          <span className="text-xs font-medium text-zinc-400 w-5">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div className="flex-1 text-left">
                            <Markdown>{opt}</Markdown>
                          </div>
                          {showAnswers && q.answer === opt && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer reveal */}
                  {showAnswers && q.answer && (
                    <div className="ml-11 mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs font-medium text-green-700 mb-1">
                        Answer
                      </p>
                      <div className="text-sm text-green-800">
                        <Markdown>{q.answer}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Homework */}
          {pack.homework && (
            <section>
              <Separator className="mb-6" />
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-zinc-900">
                  Homework
                  {pack.homework.total_marks > 0 &&
                    ` — ${pack.homework.total_marks} marks`}
                </h2>
              </div>
              <div className="border border-zinc-200 rounded-xl p-5 space-y-4">
                {pack.homework.title && (
                  <p className="font-medium text-zinc-800">
                    {pack.homework.title}
                  </p>
                )}
                {pack.homework.student_instructions &&
                  pack.homework.student_instructions.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
                      {pack.homework.student_instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  )}
                {pack.homework.tasks && pack.homework.tasks.length > 0 && (
                  <div className="space-y-3">
                    {pack.homework.tasks.map((task) => (
                      <div
                        key={task.task_number}
                        className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50"
                      >
                        <span className="shrink-0 text-xs font-medium text-zinc-400 mt-0.5">
                          {task.task_number}.
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-zinc-700">
                            <Markdown>{task.task_text}</Markdown>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            {task.marks} mark{task.marks !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pack.homework.submission_note && (
                  <p className="text-xs text-zinc-500 italic border-t border-zinc-100 pt-3">
                    {pack.homework.submission_note}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
