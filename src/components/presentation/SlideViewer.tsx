// src/components/presentation/SlideViewer.tsx
import { useRef, useState, useEffect } from "react";
import { AnySlide } from "@/types/lessonPack";
import { useLessonPack } from "@/context/LessonPackContext";
import { CoverSlide } from "./slides/CoverSlide";
import { TeachSlide } from "./slides/TeachSlide";
import { HookSlide } from "./slides/HookSlide";
import { WorkedExampleSlide } from "./slides/WorkedExampleSlide";
import { LearningObjectivesSlide } from "./slides/LearningObjectivesSlide";
import { PriorKnowledgeSlide } from "./slides/PriorKnowledgeSlide";
import { StudentTaskSlide } from "./slides/StudentTaskSlide";
import { GuidedPracticeSlide } from "./slides/GuidedPracticeSlide";
import { MisconceptionSlide } from "./slides/MisconceptionSlide";
import { SummarySlide } from "./slides/SummarySlide";
import { ExitTicketSlide } from "./slides/ExitTicketSlide";
import { WarmUpSlide } from "./slides/WarmUpSlide";
import { DiscussionSlide } from "./slides/DiscussionSlide";
import { WorkedSolutionSlide } from "./slides/WorkedSolutionSlide";
import { SelfAssessmentSlide } from "./slides/SelfAssessmentSlide";
import { ConceptMapSlide } from "./slides/ConceptMapSlide";
import { SynthesisTaskSlide } from "./slides/SynthesisTaskSlide";
import { AssessmentInstructionsSlide } from "./slides/AssessmentInstructionsSlide";
import { AssessmentQuestionSlide } from "./slides/AssessmentQuestionSlide";
import { MarkSchemeSlide } from "./slides/MarkSchemeSlide";
import { GenericSlide } from "./slides/GenericSlide";

interface SlideViewerProps {
  slide: AnySlide;
  isFullScreen?: boolean;
  zoom?: number;
  embedded?: boolean;
}

export const SlideViewer = ({
  slide,
  isFullScreen: _isFullScreen = false, // handled automatically by ResizeObserver
  zoom = 100,
  embedded = false,
}: SlideViewerProps) => {
  const { currentPack } = useLessonPack();
  const extractedPath = currentPack?.extracted_path || "";

  // Helper to render content based on slide type
  const renderSlideContent = () => {
    switch (slide.slide_type) {
      case "TITLE":
        return <CoverSlide slide={slide} extractedPath={extractedPath} />;
      case "TEACH":
        return <TeachSlide slide={slide} extractedPath={extractedPath} />;
      case "HOOK":
        return <HookSlide slide={slide} extractedPath={extractedPath} />;
      case "WORKED_EXAMPLE":
        return <WorkedExampleSlide slide={slide} />;
      case "LEARNING_OBJECTIVES":
        return <LearningObjectivesSlide slide={slide} />;
      case "PRIOR_KNOWLEDGE":
        return <PriorKnowledgeSlide slide={slide} />;
      case "STUDENT_TASK":
        return <StudentTaskSlide slide={slide} />;
      case "GUIDED_PRACTICE":
        return <GuidedPracticeSlide slide={slide} />;
      case "MISCONCEPTION":
        return <MisconceptionSlide slide={slide} />;
      case "SUMMARY":
        return <SummarySlide slide={slide} />;
      case "EXIT_TICKET":
        return <ExitTicketSlide slide={slide} />;
      case "WARM_UP":
        return <WarmUpSlide slide={slide} />;
      case "DISCUSSION":
        return <DiscussionSlide slide={slide} />;
      case "WORKED_SOLUTION":
        return <WorkedSolutionSlide slide={slide} />;
      case "SELF_ASSESSMENT":
        return <SelfAssessmentSlide slide={slide} />;
      case "CONCEPT_MAP":
        return <ConceptMapSlide slide={slide} />;
      case "SYNTHESIS_TASK":
        return <SynthesisTaskSlide slide={slide} />;
      case "ASSESSMENT_INSTRUCTIONS":
        return <AssessmentInstructionsSlide slide={slide} />;
      case "ASSESSMENT_QUESTION":
        return <AssessmentQuestionSlide slide={slide} />;
      case "MARK_SCHEME":
        return <MarkSchemeSlide slide={slide} />;
      default:
        // Use generic slide for unimplemented types so the app doesn't break
        return <GenericSlide slide={slide} />;
    }
  };

  // Fixed virtual resolution — the slide always renders at this size.
  // A ResizeObserver scales the whole thing to fit the container, so
  // the layout is 100% stable regardless of window size.
  const SLIDE_W = 1280;
  const SLIDE_H = 720;

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setAutoScale(Math.min(width / SLIDE_W, height / SLIDE_H));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const finalScale = autoScale * (zoom / 100);

  if (embedded) {
    return (
      <div className="w-full h-full bg-white dark:bg-zinc-900 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
          {renderSlideContent()}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden bg-[#f3f3f3] dark:bg-zinc-950"
    >
      {/* Wrapper sized to the visual footprint of the scaled slide so flex centering works */}
      <div
        style={{
          width: SLIDE_W * finalScale,
          height: SLIDE_H * finalScale,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          key={slide.slide_number}
          className="bg-white overflow-hidden relative shadow-2xl"
          style={{
            width: SLIDE_W,
            height: SLIDE_H,
            transform: `scale(${finalScale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {renderSlideContent()}
        </div>
      </div>
    </div>
  );
};
