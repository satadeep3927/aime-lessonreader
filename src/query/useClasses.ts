import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { classService } from "@/service/classService";

export const useClasses = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.listClasses(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
