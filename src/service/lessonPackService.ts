import type {
  OpenFileResult,
  RecentLesson,
  VerifyMetaResult,
} from "@/types/lessonPack";
import type { DownloadedLesson } from "@/types/api";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

/**
 * Service layer for Tauri commands
 * All Tauri invoke calls should go through this service
 */

export const lessonPackService = {
  /**
   * Open file dialog and select .aimepack file
   */
  async selectFile(): Promise<string | null> {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "AIME Lesson Pack",
          extensions: ["aimepack"],
        },
      ],
    });

    return selected;
  },

  /**
   * Open and process an .aimepack file
   * Unzips and verifies metadata
   */
  async openLessonPack(filePath: string): Promise<OpenFileResult> {
    return await invoke<OpenFileResult>("open_lesson_pack", { filePath });
  },

  /**
   * Check if app was launched with a file
   */
  async checkLaunchFile(): Promise<string | null> {
    return await invoke<string | null>("check_launch_file");
  },

  /**
   * Verify .meta.json structure
   */
  async verifyMeta(extractedPath: string): Promise<VerifyMetaResult> {
    return await invoke<VerifyMetaResult>("verify_meta", { extractedPath });
  },

  /**
   * Get recent lessons from storage
   */
  async getRecentLessons(): Promise<RecentLesson[]> {
    return await invoke<RecentLesson[]>("get_recent_lessons");
  },

  /**
   * Add lesson to recent history
   */
  async addToRecent(lesson: RecentLesson): Promise<void> {
    await invoke("add_to_recent", { lesson });
  },

  /**
   * Remove lesson from recent history
   */
  async removeFromRecent(filePath: string): Promise<void> {
    await invoke("remove_from_recent", { filePath });
  },

  /**
   * Clear all recent lessons
   */
  async clearRecent(): Promise<void> {
    await invoke("clear_recent");
  },

  /**
   * Cleanup extracted lesson pack
   */
  async cleanupLessonPack(extractedPath: string): Promise<void> {
    await invoke("cleanup_lesson_pack", { extractedPath });
  },

  /**
   * Download .aimepack from S3 URL to local app data dir
   * Returns the local file path
   */
  async downloadAimepack(url: string, intentId: string): Promise<string> {
    return await invoke<string>("download_aimepack", { url, intentId });
  },

  async getDownloadedLessons(): Promise<DownloadedLesson[]> {
    return await invoke<DownloadedLesson[]>("get_downloaded_lessons");
  },

  async addDownloadedLesson(lesson: DownloadedLesson): Promise<void> {
    await invoke("add_downloaded_lesson", { lesson });
  },

  async removeDownloadedLesson(intentId: string): Promise<void> {
    await invoke("remove_downloaded_lesson", { intentId });
  },

  async saveCanvasData(
    extractedPath: string,
    canvasData: unknown,
  ): Promise<void> {
    await invoke("save_canvas_data", { extractedPath, canvasData });
  },

  async saveLessonPack(
    extractedPath: string,
    originalPath: string,
    canvasData: unknown,
  ): Promise<void> {
    await invoke("save_lesson_pack", {
      extractedPath,
      originalPath,
      canvasData,
    });
  },
};
