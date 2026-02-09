import { useState, useEffect } from 'react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { convertFileSrc } from '@tauri-apps/api/core';

export const useSlideLoader = (slidePath: string, baseDir: string) => {
  const [slideContent, setSlideContent] = useState<string>('');

  useEffect(() => {
    const loadSlide = async () => {
      try {
        const htmlContent = await readTextFile(slidePath);
        const baseUrl = convertFileSrc(baseDir + '/').replace(/\/$/, '');
        const processedHtml = htmlContent
          .replace(/href="(?!http|https|\/\/|#)([^"]+)"/g, `href="${baseUrl}/$1"`)
          .replace(/src="(?!http|https|\/\/|data:)([^"]+)"/g, `src="${baseUrl}/$1"`);

        setSlideContent(processedHtml);
      } catch (error) {
        console.error('Failed to load slide:', error);
        setSlideContent('<html><body><h1>Error loading slide</h1></body></html>');
      }
    };

    loadSlide();
  }, [slidePath, baseDir]);

  return slideContent;
};
