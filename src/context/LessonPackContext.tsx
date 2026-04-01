import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { LessonPack } from "@/types/lessonPack";
import { convertFileSrc } from "@tauri-apps/api/core";

interface LessonPackContextType {
  currentPack: LessonPack | null;
  setCurrentPack: (pack: LessonPack | null) => void;
  updatePackMeta: (patch: Partial<LessonPack["meta"]>) => void;
}

const LessonPackContext = createContext<LessonPackContextType | undefined>(
  undefined,
);

function resolveImageUrls(pack: LessonPack): LessonPack {
  const base = pack.extracted_path.replace(/[\\/]+$/, "");
  return {
    ...pack,
    meta: {
      ...pack.meta,
      slides: pack.meta.slides.map((slide) => ({
        ...slide,
        image_url:
          slide.image_url && !slide.image_url.startsWith("http")
            ? convertFileSrc(`${base}/${slide.image_url}`)
            : slide.image_url,
      })),
    },
  };
}

/**
 * Reverse of resolveImageUrls — strips the Tauri asset:// prefix from
 * image_url fields so the original relative paths are restored before saving.
 */
export function revertImageUrls(
  slides: LessonPack["meta"]["slides"],
  extractedPath: string,
): LessonPack["meta"]["slides"] {
  const base = extractedPath.replace(/[\\/]+$/, "");
  const resolvedBase = convertFileSrc(`${base}/`);
  return slides.map((slide) => ({
    ...slide,
    image_url:
      slide.image_url && slide.image_url.startsWith(resolvedBase)
        ? decodeURIComponent(slide.image_url.slice(resolvedBase.length))
        : slide.image_url,
  }));
}

export const LessonPackProvider = ({ children }: { children: ReactNode }) => {
  const [currentPack, setCurrentPackRaw] = useState<LessonPack | null>(null);

  const setCurrentPack = useCallback((pack: LessonPack | null) => {
    setCurrentPackRaw(pack ? resolveImageUrls(pack) : null);
  }, []);

  const updatePackMeta = useCallback((patch: Partial<LessonPack["meta"]>) => {
    setCurrentPackRaw((prev) =>
      prev ? { ...prev, meta: { ...prev.meta, ...patch } } : prev,
    );
  }, []);

  return (
    <LessonPackContext.Provider
      value={{ currentPack, setCurrentPack, updatePackMeta }}
    >
      {children}
    </LessonPackContext.Provider>
  );
};

export const useLessonPack = () => {
  const context = useContext(LessonPackContext);
  if (!context) {
    throw new Error("useLessonPack must be used within LessonPackProvider");
  }
  return context;
};
