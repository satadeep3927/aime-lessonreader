import { apiClient } from "@/lib/apiClient";
import type {
  AssessmentPackRead,
  AssessmentPackListResponse,
} from "@/types/api";

export const assessmentPackService = {
  /**
   * Get the active assessment pack for a lesson intent (full detail).
   * Returns null if no active pack exists (404).
   */
  async getActiveAssessmentPack(
    intentId: string,
  ): Promise<AssessmentPackRead | null> {
    try {
      const { data } = await apiClient.get<AssessmentPackRead>(
        `/api/v1/assessment-packs/${intentId}/active`,
      );
      return data;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Get a specific assessment pack by UUID (full detail).
   */
  async getAssessmentPackDetail(
    packId: string,
  ): Promise<AssessmentPackRead> {
    const { data } = await apiClient.get<AssessmentPackRead>(
      `/api/v1/assessment-packs/${packId}/detail`,
    );
    return data;
  },

  /**
   * List all assessment pack versions for a lesson intent.
   */
  async listAssessmentPacks(
    intentId: string,
  ): Promise<AssessmentPackListResponse> {
    const { data } = await apiClient.get<AssessmentPackListResponse>(
      `/api/v1/assessment-packs/${intentId}`,
    );
    return data;
  },
};
