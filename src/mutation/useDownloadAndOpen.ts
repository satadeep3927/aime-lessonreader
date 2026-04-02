import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLessonPack } from "@/context/LessonPackContext";
import { lessonIntentService } from "@/service/lessonIntentService";
import { lessonPackService } from "@/service/lessonPackService";
import { assessmentPackService } from "@/service/assessmentPackService";
import type { DownloadedLesson, LessonIntentRead } from "@/types/api";
import { toast } from "sonner";

export const useDownloadAndOpen = () => {
  const { setCurrentPack } = useLessonPack();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (intent: LessonIntentRead) => {
      // 1. Get pack info from API
      const packInfo = await lessonIntentService.getLessonPack(intent.id);

      if (packInfo.status !== "completed" || !packInfo.lesson_pack?.file_url) {
        const msg =
          packInfo.status === "generating" || packInfo.status === "starting"
            ? "Lesson pack is still being generated, please try again shortly"
            : packInfo.status === "failed"
              ? "Lesson pack generation failed"
              : "Lesson pack not available";
        throw new Error(msg);
      }

      // 2. Download from S3 via Rust → returns local path
      const localPath = await lessonPackService.downloadAimepack(
        packInfo.lesson_pack.file_url,
        intent.id,
      );

      // 3. Persist record to Tauri store
      const record: DownloadedLesson = {
        intent_id: intent.id,
        title: intent.title,
        local_path: localPath,
        downloaded_at: Date.now(),
        cover_image_url: intent.cover_image_url,
        class_name: intent.class_name,
        lesson_type: intent.lesson_type,
        session_number: intent.session_number,
        week_number: intent.week_number,
        scheduled_date: intent.scheduled_date,
        status: intent.status,
        description: intent.description,
        has_assessment: false,
      };

      // 4. Open the downloaded file using existing Tauri command
      const opened = await lessonPackService.openLessonPack(localPath);

      // 5. Bake lesson_intent_id into the .aimepack file permanently by
      //    patching the extracted .meta.json then re-zipping back. This means
      //    every future open (Downloaded tab, recent list, file association)
      //    will find lesson_intent_id already in the file — no side-channel needed.
      if (opened.success && opened.lesson_pack) {
        await lessonPackService.patchAndRezip(
          opened.lesson_pack.extracted_path,
          localPath,
          { lesson_intent_id: intent.id },
        );
        // Reflect the patch in the current in-memory meta too
        opened.lesson_pack.meta = {
          ...opened.lesson_pack.meta,
          lesson_intent_id: intent.id,
        };

        // 6. Try to fetch the active assessment pack and bake it in
        try {
          const assessmentPack =
            await assessmentPackService.getActiveAssessmentPack(intent.id);
          if (assessmentPack) {
            await lessonPackService.patchAndRezip(
              opened.lesson_pack.extracted_path,
              localPath,
              { assessmentPack },
            );
            opened.lesson_pack.meta = {
              ...opened.lesson_pack.meta,
              assessmentPack,
            };
            record.has_assessment = true;
          }
        } catch {
          // Assessment pack not available — continue silently
        }
      }

      // Persist the record (now with has_assessment set correctly)
      await lessonPackService.addDownloadedLesson(record);

      return opened;
    },
    onSuccess: (data) => {
      if (data?.success && data?.lesson_pack) {
        setCurrentPack(data.lesson_pack);
        // Invalidate downloaded lessons so the tab refreshes
        queryClient.invalidateQueries({ queryKey: ["downloadedLessons"] });
        toast.success("Lesson downloaded successfully");
        navigate("/viewer");
      }
    },
  });
};
