import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { lessonIntentService } from "@/service/lessonIntentService";
import type { LessonIntentFilters } from "@/types/api";

/**
 * Query hook for lesson intents.
 * Only fetches when the user is authenticated.
 * Accepts filter params that are included in the query key for automatic refetch.
 */
export const useLessonIntents = (filters: LessonIntentFilters = {}) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["lessonIntents", filters],
    queryFn: () => lessonIntentService.getLessonIntents(filters),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
