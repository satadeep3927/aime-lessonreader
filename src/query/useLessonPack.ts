import { useQuery } from "@tanstack/react-query";
import { lessonPackService } from "@/service/lessonPackService";

/**
 * Query hook for recent lessons
 */
export const useRecentLessons = () => {
  return useQuery({
    queryKey: ["recentLessons"],
    queryFn: () => lessonPackService.getRecentLessons(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Query hook for verifying meta.json
 */
export const useVerifyMeta = (extractedPath: string | null) => {
  return useQuery({
    queryKey: ["verifyMeta", extractedPath],
    queryFn: () => lessonPackService.verifyMeta(extractedPath!),
    enabled: !!extractedPath, // Only run when extractedPath is available
  });
};
