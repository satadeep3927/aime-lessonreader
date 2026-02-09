import { createContext, useContext, useState, ReactNode } from 'react';
import type { LessonPack } from '@/types/lessonPack';

interface LessonPackContextType {
  currentPack: LessonPack | null;
  setCurrentPack: (pack: LessonPack | null) => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}

const LessonPackContext = createContext<LessonPackContextType | undefined>(undefined);

export const LessonPackProvider = ({ children }: { children: ReactNode }) => {
  const [currentPack, setCurrentPack] = useState<LessonPack | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <LessonPackContext.Provider
      value={{
        currentPack,
        setCurrentPack,
        currentSlide,
        setCurrentSlide,
      }}
    >
      {children}
    </LessonPackContext.Provider>
  );
};

export const useLessonPack = () => {
  const context = useContext(LessonPackContext);
  if (!context) {
    throw new Error('useLessonPack must be used within LessonPackProvider');
  }
  return context;
};
