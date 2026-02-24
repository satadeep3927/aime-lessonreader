// src/components/presentation/SlideViewer.tsx
import { AnySlide } from "@/types/lessonPack";
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
  isFullScreen = false,
  zoom = 100,
  embedded = false,
}: SlideViewerProps) => {
  // Helper to render content based on slide type
  const renderSlideContent = () => {
    switch (slide.slide_type) {
      case "TITLE":
        return <CoverSlide slide={slide} />;
      case "TEACH":
        return <TeachSlide slide={slide} />;
      case "HOOK":
        return <HookSlide slide={slide} />;
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

  const scale = () => {
    return isFullScreen ? "scale(1)" : `scale(${zoom / 100})`;
  };

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
    <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#f3f3f3] dark:bg-zinc-950">
      <div
        className="h-full aspect-video max-w-full bg-white transition-transform duration-200 origin-center overflow-hidden relative shadow-2xl"
        style={{ transform: scale() }}
      >
        {renderSlideContent()}
      </div>
    </div>
  );
};
