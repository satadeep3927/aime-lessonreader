import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonIntentService } from "@/service/lessonIntentService";

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (intentId: string) =>
      lessonIntentService.completeLessonIntent(intentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonIntents"] });
      queryClient.invalidateQueries({ queryKey: ["downloadedLessons"] });
    },
  });
};
