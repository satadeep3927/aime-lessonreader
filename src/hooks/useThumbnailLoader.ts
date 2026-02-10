import { useState, useEffect } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import type { LessonPackSlide } from "@/types/lessonPack";

export const useThumbnailLoader = (
  slides: LessonPackSlide[] | undefined,
  extractedPath: string | undefined,
  baseDir: string,
) => {
  const [thumbnailContents, setThumbnailContents] = useState<
    Map<number, string>
  >(new Map());

  useEffect(() => {
    if (!slides || !extractedPath) return;

    const loadThumbnails = async () => {
      const newThumbnails = new Map<number, string>();
      const baseUrl = convertFileSrc(baseDir + "/").replace(/\/$/, "");

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const thumbPath = `${extractedPath}/${slide.file}`.replace(/\\/g, "/");

        try {
          const htmlContent = await readTextFile(thumbPath);
          const processedHtml = htmlContent
            .replace(
              /href="(?!http|https|\/\/|#)([^"]+)"/g,
              `href="${baseUrl}/$1"`,
            )
            .replace(
              /src="(?!http|https|\/\/|data:)([^"]+)"/g,
              `src="${baseUrl}/$1"`,
            );

          newThumbnails.set(i, processedHtml);
        } catch (error) {
          console.error(`Failed to load thumbnail ${i}:`, error);
          newThumbnails.set(i, "<html><body></body></html>");
        }
      }

      setThumbnailContents(newThumbnails);
    };

    loadThumbnails();
  }, [slides, extractedPath, baseDir]);

  return thumbnailContents;
};
