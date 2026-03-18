import { apiClient } from "@/lib/apiClient";
import type { TeacherReflection, ReflectionVersion } from "@/types/reflection";

export const reflectionService = {
  async getByIntent(
    lessonIntentId: string,
    version: ReflectionVersion = "active",
  ): Promise<TeacherReflection> {
    const { data } = await apiClient.get<TeacherReflection>(
      `/api/v1/teacher-reflections/by-intent/${lessonIntentId}`,
      { params: { version } },
    );
    return data;
  },

  async submitAnswers(
    reflectionId: string,
    payload: {
      answers: Record<string, string>;
      completed_objective_map?: Record<string, number[]>;
      submissionDeadline?: string;
      pushHomeworkToLms?: boolean;
      pushAssessmentToLms?: boolean;
    },
  ): Promise<TeacherReflection> {
    const { data } = await apiClient.post<TeacherReflection>(
      `/api/v1/teacher-reflections/${reflectionId}/submit-answers`,
      payload,
    );
    return data;
  },
};
