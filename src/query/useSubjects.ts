import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { subjectService } from "@/service/subjectService";

export const useSubjects = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.listMySubjects(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};
