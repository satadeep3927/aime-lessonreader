import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reflectionService } from "@/service/reflectionService";
import type { ReflectionVersion, TeacherReflection } from "@/types/reflection";

const KEY = "teacher-reflections";

export const useReflectionByIntent = (
  lessonIntentId: string | null,
  version: ReflectionVersion = "active",
  enabled = true,
) =>
  useQuery<TeacherReflection>({
    queryKey: [KEY, "by-intent", lessonIntentId, version],
    queryFn: () => reflectionService.getByIntent(lessonIntentId!, version),
    enabled: !!lessonIntentId && enabled,
    staleTime: 2 * 60 * 1000,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404)
        return false;
      return count < 2;
    },
  });

export const useSubmitReflectionAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TeacherReflection,
    Error,
    {
      reflectionId: string;
      answers: Record<string, string>;
      completed_objective_map?: Record<string, number[]>;
      submissionDeadline?: string;
      pushHomeworkToLms?: boolean;
      pushAssessmentToLms?: boolean;
    }
  >({
    mutationFn: ({ reflectionId, ...rest }) =>
      reflectionService.submitAnswers(reflectionId, rest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [KEY, "by-intent", data.lesson_intent_id],
      });
      queryClient.invalidateQueries({ queryKey: ["lessonIntents"] });
    },
  });
};
