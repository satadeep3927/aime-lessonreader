import { apiClient } from "@/lib/apiClient";
import type { ClassRead } from "@/types/api";

export const classService = {
  async listClasses(): Promise<ClassRead[]> {
    const { data } = await apiClient.get<ClassRead[]>("/api/v1/classes");
    return data;
  },
};
