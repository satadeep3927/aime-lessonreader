import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { LessonPack } from "@/types/lessonPack";

interface LessonPackContextType {
  currentPack: LessonPack | null;
  setCurrentPack: (pack: LessonPack | null) => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  whiteboardData: Record<number, any>;
  saveWhiteboardData: (slideIndex: number, data: any) => void;
  getWhiteboardData: (slideIndex: number) => any;
  clearWhiteboardData: () => void;
}

const LessonPackContext = createContext<LessonPackContextType | undefined>(
  undefined,
);

export const LessonPackProvider = ({ children }: { children: ReactNode }) => {
  const [currentPack, setCurrentPack] = useState<LessonPack | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [whiteboardData, setWhiteboardData] = useState<Record<number, any>>({});

  const saveWhiteboardData = useCallback((slideIndex: number, data: any) => {
    setWhiteboardData((prev) => ({
      ...prev,
      [slideIndex]: data,
    }));
  }, []);

  const getWhiteboardData = useCallback(
    (slideIndex: number) => {
      return whiteboardData[slideIndex] || null;
    },
    [whiteboardData],
  );

  const clearWhiteboardData = useCallback(() => {
    setWhiteboardData({});
  }, []);

  return (
    <LessonPackContext.Provider
      value={{
        currentPack,
        setCurrentPack,
        currentSlide,
        setCurrentSlide,
        whiteboardData,
        saveWhiteboardData,
        getWhiteboardData,
        clearWhiteboardData,
      }}
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
