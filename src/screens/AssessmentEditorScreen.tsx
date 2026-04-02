import { useLessonPack } from "@/context/LessonPackContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAssessmentPack } from "@/lib/assessmentPack";
import { lessonPackService } from "@/service/lessonPackService";
import type {
  AssessmentPackRead,
  AssessmentQuestionRead,
  HomeworkTaskRead,
} from "@/types/api";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AssessmentEditorScreen = () => {
  const { currentPack, updatePackMeta } = useLessonPack();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [pack, setPack] = useState<AssessmentPackRead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [expandedQ, setExpandedQ] = useState<Set<number>>(new Set());

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

  const toggleQuestion = (idx: number) => {
    setExpandedQ((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const updateQuestion = (
    idx: number,
    field: keyof AssessmentQuestionRead,
    value: unknown,
  ) => {
    if (!pack?.questions) return;
    const updated = [...pack.questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setPack({ ...pack, questions: updated });
    setIsDirty(true);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    if (!pack?.questions) return;
    const updated = [...pack.questions];
    const opts = [...(updated[qIdx].options ?? [])];
    opts[oIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setPack({ ...pack, questions: updated });
    setIsDirty(true);
  };

  const updateHomeworkTask = (
    idx: number,
    field: keyof HomeworkTaskRead,
    value: unknown,
  ) => {
    if (!pack?.homework?.tasks) return;
    const tasks = [...pack.homework.tasks];
    tasks[idx] = { ...tasks[idx], [field]: value };
    setPack({
      ...pack,
      homework: { ...pack.homework, tasks },
    });
    setIsDirty(true);
  };

  const handleSave = useCallback(async () => {
    if (!currentPack || !pack) return;
    setIsSaving(true);
    try {
      await lessonPackService.patchAndRezip(
        currentPack.extracted_path,
        currentPack.original_path,
        { assessmentPack: pack },
      );
      updatePackMeta({ assessmentPack: pack } as Partial<
        typeof currentPack.meta
      >);
      setIsDirty(false);
      toast.success("Assessment saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save assessment",
      );
    } finally {
      setIsSaving(false);
    }
  }, [currentPack, pack, updatePackMeta]);

  if (!pack) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 bg-white border-b border-zinc-200">
        <Button variant="ghost" size="icon" onClick={() => navigate("/viewer")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-zinc-900 truncate">
            {pack.title ?? "Assessment Pack"}
          </h1>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {pack.subject && <span>{pack.subject}</span>}
            {pack.grade_level && <span>Grade {pack.grade_level}</span>}
            {pack.total_marks != null && <span>{pack.total_marks} marks</span>}
            {pack.estimated_time_minutes != null && (
              <span>{pack.estimated_time_minutes} min</span>
            )}
            {pack.assessment_type && (
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {pack.assessment_type}
              </span>
            )}
          </div>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || isSaving} size="sm">
          <Save className="w-4 h-4" />
          {isSaving ? t.saving : t.saveChanges}
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-6 py-6 space-y-6">
          {/* Questions section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-zinc-900">
                Questions ({pack.questions?.length ?? 0})
              </h2>
            </div>
            <div className="space-y-3">
              {pack.questions?.map((q, idx) => (
                <Collapsible
                  key={idx}
                  open={expandedQ.has(idx)}
                  onOpenChange={() => toggleQuestion(idx)}
                  className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
                >
                  {/* Question header - always visible */}
                  <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-50 transition-colors">
                    {expandedQ.has(idx) ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-zinc-600 shrink-0">
                      Q{q.question_number}
                    </span>
                    <span className="text-sm text-zinc-800 flex-1 truncate">
                      {q.question_text.slice(0, 100)}
                      {q.question_text.length > 100 ? "…" : ""}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0">
                      {q.marks} mark{q.marks !== 1 ? "s" : ""} ·{" "}
                      {q.question_type}
                    </span>
                  </CollapsibleTrigger>

                  {/* Expanded editor */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 pt-3">
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1">
                          Question Text
                        </Label>
                        <Textarea
                          value={q.question_text}
                          onChange={(e) =>
                            updateQuestion(idx, "question_text", e.target.value)
                          }
                          rows={3}
                          className="resize-y"
                        />
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label className="text-xs font-medium text-zinc-500 mb-1">
                            Question Type
                          </Label>
                          <Input
                            value={q.question_type}
                            onChange={(e) =>
                              updateQuestion(
                                idx,
                                "question_type",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs font-medium text-zinc-500 mb-1">
                            Marks
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            value={q.marks}
                            onChange={(e) =>
                              updateQuestion(
                                idx,
                                "marks",
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Options for MCQ */}
                      {q.options && q.options.length > 0 && (
                        <div>
                          <Label className="text-xs font-medium text-zinc-500 mb-1">
                            Options
                          </Label>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center gap-2"
                              >
                                <span className="text-xs text-zinc-400 w-6 text-center">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <Input
                                  value={opt}
                                  onChange={(e) =>
                                    updateOption(idx, oIdx, e.target.value)
                                  }
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answer */}
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1">
                          Answer
                        </Label>
                        <Textarea
                          value={q.answer ?? ""}
                          onChange={(e) =>
                            updateQuestion(
                              idx,
                              "answer",
                              e.target.value || null,
                            )
                          }
                          rows={2}
                          className="resize-y"
                        />
                      </div>

                      {/* Bloom level & rationale (optional) */}
                      {(q.bloom_level || q.rationale) && (
                        <div className="flex gap-3 text-xs text-zinc-500">
                          {q.bloom_level && (
                            <span className="px-2 py-0.5 rounded bg-zinc-100">
                              {q.bloom_level}
                            </span>
                          )}
                          {q.rationale && (
                            <span className="italic">{q.rationale}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </section>

          {/* Homework section */}
          {pack.homework && (
            <section>
              <Separator className="mb-6" />
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-zinc-900">
                  Homework
                  {pack.homework.total_marks > 0 &&
                    ` (${pack.homework.total_marks} marks)`}
                </h2>
              </div>

              {/* Homework description card */}
              {(pack.homework.title ||
                (pack.homework.student_instructions &&
                  pack.homework.student_instructions.length > 0) ||
                pack.homework.submission_note) && (
                <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3 mb-3">
                  {pack.homework.title && (
                    <p className="text-sm font-medium text-zinc-800">
                      {pack.homework.title}
                    </p>
                  )}
                  {pack.homework.student_instructions &&
                    pack.homework.student_instructions.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1">
                          Student Instructions
                        </Label>
                        <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
                          {pack.homework.student_instructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {pack.homework.submission_note && (
                    <div>
                      <Label className="text-xs font-medium text-zinc-500 mb-1">
                        Submission Note
                      </Label>
                      <p className="text-sm text-zinc-600 italic">
                        {pack.homework.submission_note}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Homework tasks as collapsibles */}
              {pack.homework.tasks && pack.homework.tasks.length > 0 && (
                <div className="space-y-3">
                  {pack.homework.tasks.map((task, idx) => (
                    <Collapsible
                      key={idx}
                      className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
                    >
                      <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 transition-transform [[data-state=open]>&]:rotate-90" />
                        <span className="text-sm font-medium text-zinc-600 shrink-0">
                          Task {task.task_number}
                        </span>
                        <span className="text-sm text-zinc-800 flex-1 truncate">
                          {task.task_text.slice(0, 100)}
                          {task.task_text.length > 100 ? "…" : ""}
                        </span>
                        <span className="text-xs text-zinc-400 shrink-0">
                          {task.marks} mark{task.marks !== 1 ? "s" : ""}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 pt-3">
                          <div className="flex gap-3">
                            <div className="w-24">
                              <Label className="text-xs font-medium text-zinc-500 mb-1">
                                Marks
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={task.marks}
                                onChange={(e) =>
                                  updateHomeworkTask(
                                    idx,
                                    "marks",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-zinc-500 mb-1">
                              Task Text
                            </Label>
                            <Textarea
                              value={task.task_text}
                              onChange={(e) =>
                                updateHomeworkTask(
                                  idx,
                                  "task_text",
                                  e.target.value,
                                )
                              }
                              rows={2}
                              className="resize-y"
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
