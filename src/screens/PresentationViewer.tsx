import { useLessonPack } from "@/context/LessonPackContext";
import {
  BlockSuiteCanvas,
  FloatingNavigation,
  LessonProvider,
  LessonWindow,
  NotesPanel,
  PresentButton,
  SlideNavigation,
  SlideSidebar,
  SlideViewer,
} from "@aime.ai/renderer-react";
import "@aime.ai/renderer-react/style.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PresentationViewer = () => {
  const { currentPack } = useLessonPack();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentPack) {
      navigate("/");
    }
  }, [currentPack, navigate]);

  if (!currentPack) {
    return null;
  }

  console.log("Loaded lesson pack:", currentPack);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <LessonProvider pack={currentPack.meta}>
        <SlideNavigation>
          <PresentButton />
        </SlideNavigation>
        <LessonWindow>
          <SlideSidebar onBack={() => navigate("/")} />
          <SlideViewer />
          <BlockSuiteCanvas />
        </LessonWindow>
        <FloatingNavigation />
        <NotesPanel />
      </LessonProvider>
    </div>
  );
};
