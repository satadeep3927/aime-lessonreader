import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { LessonPack } from "@/types/lessonPack";
import { convertFileSrc } from "@tauri-apps/api/core";

interface LessonPackContextType {
  currentPack: LessonPack | null;
  setCurrentPack: (pack: LessonPack | null) => void;
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
        image_url: slide.image_url
          ? convertFileSrc(`${base}/${slide.image_url}`)
          : null,
      })),
    },
  };
}

export const LessonPackProvider = ({ children }: { children: ReactNode }) => {
  const [currentPack, setCurrentPackRaw] = useState<LessonPack | null>(null);

  const setCurrentPack = useCallback((pack: LessonPack | null) => {
    setCurrentPackRaw(pack ? resolveImageUrls(pack) : null);
  }, []);

  return (
    <LessonPackContext.Provider value={{ currentPack, setCurrentPack }}>
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
