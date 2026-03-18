import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useReflectionByIntent,
  useSubmitReflectionAnswers,
} from "@/query/useReflection";
import { useLanguage } from "@/context/LanguageContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

interface CompleteLessonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonIntentId: string;
}

const formSchema = z.object({
  answers: z.record(z.string(), z.string().min(1)),
  completed_objective_map: z.record(z.string(), z.array(z.number())),
  pushHomeworkToLms: z.boolean(),
  pushAssessmentToLms: z.boolean(),
  submissionDeadline: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CompleteLessonSheet({
  open,
  onOpenChange,
  lessonIntentId,
}: CompleteLessonSheetProps) {
  const { t } = useLanguage();
  const [openObjectives, setOpenObjectives] = useState<Set<number>>(new Set());

  const getDefault48HoursLater = () => {
    const d = new Date();
    d.setHours(d.getHours() + 48);
    return d;
  };

  const {
    data: reflection,
    isLoading,
    isError,
    error,
  } = useReflectionByIntent(lessonIntentId, "active", open);

  const submitMutation = useSubmitReflectionAnswers();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      answers: {},
      completed_objective_map: {},
      pushHomeworkToLms: false,
      pushAssessmentToLms: false,
      submissionDeadline: undefined,
    },
    mode: "onChange",
  });

  const pushHomeworkToLms = useWatch({
    control: form.control,
    name: "pushHomeworkToLms",
    defaultValue: false,
  });
  const pushAssessmentToLms = useWatch({
    control: form.control,
    name: "pushAssessmentToLms",
    defaultValue: false,
  });

  useEffect(() => {
    if (reflection && !reflection.is_answered) {
      const defaultAnswers: Record<string, string> = {};
      reflection.questions?.forEach((q) => {
        defaultAnswers[q.question_number.toString()] = "";
      });

      const defaultObjectiveMap: Record<string, number[]> = {};
      reflection.objectives?.forEach((obj) => {
        defaultObjectiveMap[obj.id.toString()] = obj.micro_objectives.map(
          (m) => m.id,
        );
      });

      form.reset({
        answers: defaultAnswers,
        completed_objective_map: defaultObjectiveMap,
        pushHomeworkToLms: false,
        pushAssessmentToLms: false,
        submissionDeadline: undefined,
      });
    }
  }, [reflection, form]);

  const toggleObjective = (id: number) => {
    setOpenObjectives((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!reflection) return;
    try {
      await submitMutation.mutateAsync({
        reflectionId: reflection.id,
        answers: data.answers,
        completed_objective_map: data.completed_objective_map,
        submissionDeadline: data.submissionDeadline?.toISOString(),
        pushHomeworkToLms: data.pushHomeworkToLms,
        pushAssessmentToLms: data.pushAssessmentToLms,
      });
      toast.success(t.lessonCompletedSuccess, {
        description: t.lessonCompletedDesc,
      });
      onOpenChange(false);
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error(t.submissionFailed, { description: t.submissionFailedDesc });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl w-full p-0 flex flex-col h-full overflow-auto max-h-full"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>{t.completeLessonTitle}</SheetTitle>
          <SheetDescription>{t.completeLessonDesc}</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 flex-1">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-sm text-zinc-500">
              {error?.message ?? t.failedToLoadReflection}
            </p>
          </div>
        )}

        {reflection && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-auto min-h-0"
            >
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-8 py-6">
                  {/* Already answered banner */}
                  {reflection.is_answered && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {t.alreadyAnswered}
                    </div>
                  )}

                  {/* Reflection Questions */}
                  {reflection.questions && reflection.questions.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-semibold">
                        {t.reflectionQuestionsTitle}
                      </h3>
                      {reflection.questions.map((question) => (
                        <FormField
                          key={question.question_number}
                          control={form.control}
                          name={`answers.${question.question_number}`}
                          render={({ field }) => (
                            <FormItem className="space-y-3 p-4 border rounded-lg bg-zinc-50/50">
                              <FormLabel className="text-sm font-medium leading-relaxed block">
                                {question.question_number}.{" "}
                                {question.question_text}
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  value={
                                    reflection.is_answered && reflection.answers
                                      ? reflection.answers[
                                          question.question_number.toString()
                                        ]
                                      : field.value
                                  }
                                  onValueChange={field.onChange}
                                  className="space-y-1"
                                  disabled={reflection.is_answered}
                                >
                                  {question.options.map((option) => (
                                    <div
                                      key={option.key}
                                      className="flex items-center gap-3 p-2.5 rounded-md hover:bg-zinc-100 transition-colors"
                                    >
                                      <RadioGroupItem
                                        value={option.key}
                                        id={`q${question.question_number}-${option.key}`}
                                        disabled={reflection.is_answered}
                                      />
                                      <Label
                                        htmlFor={`q${question.question_number}-${option.key}`}
                                        className="font-normal text-sm cursor-pointer leading-relaxed flex-1"
                                      >
                                        <span className="font-semibold">
                                          {option.key}.
                                        </span>{" "}
                                        {option.text}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              {question.why_this_matters && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <p className="text-xs text-zinc-500 italic leading-relaxed">
                                    💡 {question.why_this_matters}
                                  </p>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {reflection.objectives &&
                    reflection.objectives.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold">
                            {t.learningObjectivesTitle}
                          </h3>
                          {reflection.objectives.map((objective) => (
                            <Collapsible
                              key={objective.id}
                              open={openObjectives.has(objective.id)}
                              onOpenChange={() => toggleObjective(objective.id)}
                            >
                              <div className="border rounded-lg overflow-hidden">
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-zinc-50 transition-colors text-left">
                                  <p className="text-sm font-medium pr-3 flex-1">
                                    {objective.name}
                                  </p>
                                  <ChevronDown
                                    className={`h-4 w-4 shrink-0 transition-transform duration-200 text-zinc-400 ${
                                      openObjectives.has(objective.id)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 pt-2 space-y-2 bg-zinc-50/50">
                                    {objective.micro_objectives.length > 0 ? (
                                      objective.micro_objectives.map(
                                        (micro) => (
                                          <FormField
                                            key={micro.id}
                                            control={form.control}
                                            name="completed_objective_map"
                                            render={({ field }) => {
                                              const key =
                                                objective.id.toString();
                                              const current =
                                                field.value?.[key] ?? [];
                                              const checked = current.includes(
                                                micro.id,
                                              );
                                              return (
                                                <FormItem className="flex items-start gap-3 p-3 bg-white rounded-md border hover:border-zinc-300 transition-colors">
                                                  <FormControl>
                                                    <Checkbox
                                                      checked={checked}
                                                      disabled={
                                                        reflection.is_answered
                                                      }
                                                      className="mt-0.5"
                                                      onCheckedChange={(v) => {
                                                        field.onChange({
                                                          ...field.value,
                                                          [key]: v
                                                            ? [
                                                                ...current,
                                                                micro.id,
                                                              ]
                                                            : current.filter(
                                                                (id) =>
                                                                  id !==
                                                                  micro.id,
                                                              ),
                                                        });
                                                      }}
                                                    />
                                                  </FormControl>
                                                  <FormLabel className="text-sm font-normal cursor-pointer leading-relaxed">
                                                    {micro.name}
                                                  </FormLabel>
                                                </FormItem>
                                              );
                                            }}
                                          />
                                        ),
                                      )
                                    ) : (
                                      <p className="text-xs text-zinc-400 p-2">
                                        {t.noMicroObjectives}
                                      </p>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </>
                    )}

                  {/* LMS Integration */}
                  {!reflection.is_answered && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">
                          {t.lmsIntegrationTitle}
                        </h3>
                        <div className="space-y-3 p-4 border rounded-lg bg-zinc-50/50">
                          <FormField
                            control={form.control}
                            name="pushHomeworkToLms"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (
                                        checked &&
                                        !form.getValues("submissionDeadline") &&
                                        !form.getValues("pushAssessmentToLms")
                                      ) {
                                        form.setValue(
                                          "submissionDeadline",
                                          getDefault48HoursLater(),
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  {t.pushHomework}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pushAssessmentToLms"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (
                                        checked &&
                                        !form.getValues("submissionDeadline") &&
                                        !form.getValues("pushHomeworkToLms")
                                      ) {
                                        form.setValue(
                                          "submissionDeadline",
                                          getDefault48HoursLater(),
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  {t.pushAssessment}
                                </FormLabel>
                              </FormItem>
                            )}
                          />

                          {(pushHomeworkToLms || pushAssessmentToLms) && (
                            <FormField
                              control={form.control}
                              name="submissionDeadline"
                              render={({ field }) => (
                                <FormItem className="pt-3 border-t space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    {t.submissionDeadline}
                                  </FormLabel>
                                  <FormControl>
                                    <input
                                      type="datetime-local"
                                      className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 bg-white w-full focus:outline-none focus:ring-1 focus:ring-primary"
                                      value={
                                        field.value
                                          ? new Date(
                                              field.value.getTime() -
                                                field.value.getTimezoneOffset() *
                                                  60000,
                                            )
                                              .toISOString()
                                              .slice(0, 16)
                                          : ""
                                      }
                                      min={new Date(
                                        Date.now() -
                                          new Date().getTimezoneOffset() *
                                            60000,
                                      )
                                        .toISOString()
                                        .slice(0, 16)}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value
                                            ? new Date(e.target.value)
                                            : undefined,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>

              {!reflection.is_answered && (
                <SheetFooter className="border-t px-6 py-4 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={submitMutation.isPending}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !form.formState.isValid || submitMutation.isPending
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t.submitReflection}
                  </Button>
                </SheetFooter>
              )}
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
