import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { academicTermService } from "@/service/academicTermService";

export const useAcademicTerms = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["academicTerms"],
    queryFn: () => academicTermService.listTerms(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};
