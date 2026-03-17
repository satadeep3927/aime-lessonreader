import { useQuery } from "@tanstack/react-query";
import { lessonPackService } from "@/service/lessonPackService";

export const useDownloadedLessons = () =>
  useQuery({
    queryKey: ["downloadedLessons"],
    queryFn: () => lessonPackService.getDownloadedLessons(),
    staleTime: 0,
  });
