import { apiClient } from "@/lib/apiClient";
import type { AcademicTermRead } from "@/types/api";

export const academicTermService = {
  async listTerms(): Promise<AcademicTermRead[]> {
    const { data } = await apiClient.get<AcademicTermRead[]>("/api/v1/academic-terms");
    return data;
  },
};
