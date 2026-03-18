import { apiClient } from "@/lib/apiClient";
import type {
  LessonIntentFilters,
  LessonIntentRead,
  LessonPackEnsureResponse,
} from "@/types/api";

export const lessonIntentService = {
  async getLessonIntents(
    filters: LessonIntentFilters = {},
  ): Promise<LessonIntentRead[]> {
    const params = new URLSearchParams();

    if (filters.class_ids?.length) {
      filters.class_ids.forEach((id) => params.append("class_ids", String(id)));
    }
    if (filters.subject_id != null) {
      params.set("subject_id", String(filters.subject_id));
    }
    if (filters.academic_term_id != null) {
      params.set("academic_term_id", String(filters.academic_term_id));
    }
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.skip != null) {
      params.set("skip", String(filters.skip));
    }
    if (filters.limit != null) {
      params.set("limit", String(filters.limit));
    }

    const { data } = await apiClient.get<LessonIntentRead[]>(
      "/api/v1/lesson-intents",
      { params },
    );
    return data;
  },

  async getLessonPack(
    intentId: string,
  ): Promise<import("@/types/api").LessonPackEnsureResponse> {
    const { data } = await apiClient.get(
      `/api/v1/lesson-intents/${intentId}/pack`,
    );
    return data;
  },

  async completeLessonIntent(intentId: string): Promise<void> {
    await apiClient.patch(`/api/v1/lesson-intents/${intentId}`, {
      status: "delivered",
    });
  },
};
