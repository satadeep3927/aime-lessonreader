import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonPackService } from "@/service/lessonPackService";
import type { RecentLesson, OpenFileResult } from "@/types/lessonPack";

/**
 * Mutation hook for opening lesson pack
 */
export const useOpenLessonPack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filePath?: string) => {
      // If no filePath provided, open file dialog
      const selectedPath = filePath || (await lessonPackService.selectFile());

      if (!selectedPath) {
        throw new Error("No file selected");
      }

      return lessonPackService.openLessonPack(selectedPath);
    },
    onSuccess: async (result: OpenFileResult) => {
      if (result.success && result.lesson_pack) {
        // Add to recent lessons
        const recentLesson: RecentLesson = {
          path: result.lesson_pack.original_path,
          name: result.lesson_pack.meta.title,
          last_opened: Date.now(),
          meta: result.lesson_pack.meta,
        };

        await lessonPackService.addToRecent(recentLesson);

        // Invalidate recent lessons query to refetch
        queryClient.invalidateQueries({ queryKey: ["recentLessons"] });
      }
    },
  });
};

/**
 * Mutation hook for adding to recent lessons
 */
export const useAddToRecent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lesson: RecentLesson) => lessonPackService.addToRecent(lesson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentLessons"] });
    },
  });
};

/**
 * Mutation hook for removing from recent lessons
 */
export const useRemoveFromRecent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filePath: string) =>
      lessonPackService.removeFromRecent(filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentLessons"] });
    },
  });
};

/**
 * Mutation hook for clearing all recent lessons
 */
export const useClearRecent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lessonPackService.clearRecent(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentLessons"] });
    },
  });
};

/**
 * Mutation hook for clearing all downloaded lessons
 */
export const useClearDownloads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lessonPackService.clearDownloads(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloadedLessons"] });
    },
  });
};

/**
 * Mutation hook for cleanup
 */
export const useCleanupLessonPack = () => {
  return useMutation({
    mutationFn: (extractedPath: string) =>
      lessonPackService.cleanupLessonPack(extractedPath),
  });
};
