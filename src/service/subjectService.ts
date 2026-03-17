import { apiClient } from "@/lib/apiClient";
import type { SubjectRead } from "@/types/api";

export const subjectService = {
  async listMySubjects(): Promise<SubjectRead[]> {
    const { data } = await apiClient.get<SubjectRead[]>("/api/v1/subjects/my");
    return data;
  },
};
