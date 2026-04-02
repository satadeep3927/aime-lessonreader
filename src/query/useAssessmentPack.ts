import { useQuery } from "@tanstack/react-query";
import { assessmentPackService } from "@/service/assessmentPackService";

export const useActiveAssessmentPack = (intentId: string | undefined) => {
  return useQuery({
    queryKey: ["activeAssessmentPack", intentId],
    queryFn: () => assessmentPackService.getActiveAssessmentPack(intentId!),
    enabled: !!intentId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAssessmentPackList = (intentId: string | undefined) => {
  return useQuery({
    queryKey: ["assessmentPackList", intentId],
    queryFn: () => assessmentPackService.listAssessmentPacks(intentId!),
    enabled: !!intentId,
    staleTime: 1000 * 60 * 5,
  });
};
