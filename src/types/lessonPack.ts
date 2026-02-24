export enum LessonType {
  INTRODUCTION = "INTRODUCTION",
  PRACTICE = "PRACTICE",
  DEEP_DIVE = "DEEP_DIVE",
  REVIEW = "REVIEW",
  ASSESSMENT = "ASSESSMENT",
  CONSOLIDATION = "CONSOLIDATION",
}

export enum QuestionType {
  MCQ = "MCQ",
  SHORT = "SHORT",
  LONG = "LONG",
  PROBLEM = "PROBLEM",
}

export enum BloomsLevel {
  REMEMBER = "REMEMBER",
  UNDERSTAND = "UNDERSTAND",
  APPLY = "APPLY",
  ANALYZE = "ANALYZE",
  EVALUATE = "EVALUATE",
  CREATE = "CREATE",
}

export interface BaseSlide {
  slide_number: number;
  title: string;
  teacher_notes: string;
  duration_minutes: number;
  teacher_only: boolean;
  micro_objective_ids: number[];
  sen_support: string | null;
  image_url: string | null;
}

export interface TitleSlide extends BaseSlide {
  slide_type: "TITLE";
  subject: string;
  grade_level: string;
  objectives_preview: string[];
}

export interface LearningObjectivesSlide extends BaseSlide {
  slide_type: "LEARNING_OBJECTIVES";
  objectives: string[];
}

export interface HookSlide extends BaseSlide {
  slide_type: "HOOK";
  question: string;
}

export interface PriorKnowledgeSlide extends BaseSlide {
  slide_type: "PRIOR_KNOWLEDGE";
  questions: string[];
  answers: string[];
}

export interface TeachSlide extends BaseSlide {
  slide_type: "TEACH";
  content: string;
  key_terms: string[];
}

export interface WorkedExampleSlide extends BaseSlide {
  slide_type: "WORKED_EXAMPLE";
  problem: string;
  steps: string[];
  final_answer: string;
  check: string | null;
}

export interface GuidedPracticeSlide extends BaseSlide {
  slide_type: "GUIDED_PRACTICE";
  problems: string[];
  answers: string[];
}

export interface StudentTaskSlide extends BaseSlide {
  slide_type: "STUDENT_TASK";
  level_0: string[];
  level_1: string[];
  level_2: string[];
  level_3: string[];
  answers: Record<string, string>;
}

export interface WarmUpSlide extends BaseSlide {
  slide_type: "WARM_UP";
  questions: string[];
  answers: string[];
}

export interface DiscussionSlide extends BaseSlide {
  slide_type: "DISCUSSION";
  prompt: string;
  talking_points: string[];
}

export interface WorkedSolutionSlide extends BaseSlide {
  slide_type: "WORKED_SOLUTION";
  problem: string;
  solution: string;
}

export interface MisconceptionItem {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface MisconceptionSlide extends BaseSlide {
  slide_type: "MISCONCEPTION";
  items: MisconceptionItem[];
}

export interface SelfAssessmentSlide extends BaseSlide {
  slide_type: "SELF_ASSESSMENT";
  objectives: string[];
  scale: string;
}

export interface ConceptMapSlide extends BaseSlide {
  slide_type: "CONCEPT_MAP";
  central_concept: string;
  connections: string[];
  summary_text: string;
}

export interface SynthesisTaskSlide extends BaseSlide {
  slide_type: "SYNTHESIS_TASK";
  context: string;
  task: string;
  answer: string;
}

export interface SummarySlide extends BaseSlide {
  slide_type: "SUMMARY";
  key_takeaways: string[];
  next_lesson_preview: string | null;
}

export interface ExitTicketSlide extends BaseSlide {
  slide_type: "EXIT_TICKET";
  questions: string[];
  answers: string[];
  threshold_note: string | null;
}

export interface AssessmentInstructionsSlide extends BaseSlide {
  slide_type: "ASSESSMENT_INSTRUCTIONS";
  time_minutes: number;
  allowed_resources: string[];
  instructions: string[];
}

export interface AssessmentQuestionSlide extends BaseSlide {
  slide_type: "ASSESSMENT_QUESTION";
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  marks: number;
  blooms_level: BloomsLevel;
}

export interface MarkSchemeSlide extends BaseSlide {
  slide_type: "MARK_SCHEME";
  teacher_only: true;
  question_number: number;
  answer: string;
  partial_credit: string | null;
  marks: number;
}

export type AnySlide =
  | TitleSlide
  | LearningObjectivesSlide
  | HookSlide
  | PriorKnowledgeSlide
  | TeachSlide
  | WorkedExampleSlide
  | GuidedPracticeSlide
  | StudentTaskSlide
  | WarmUpSlide
  | DiscussionSlide
  | WorkedSolutionSlide
  | MisconceptionSlide
  | SelfAssessmentSlide
  | ConceptMapSlide
  | SynthesisTaskSlide
  | SummarySlide
  | ExitTicketSlide
  | AssessmentInstructionsSlide
  | AssessmentQuestionSlide
  | MarkSchemeSlide;

export interface LessonPackOutput {
  session_number: number;
  lesson_type: LessonType;
  title: string;
  subject: string;
  grade_level: string;
  total_duration_minutes: number;
  slides: AnySlide[];
  resources: string[];
  cover_image_url: string | null;
  ai_rationale: string;
  author?: string; // Optional field for the human author of the lesson pack
}

export interface LessonPack {
  extractedPath: string;
  meta: LessonPackOutput;
}

export interface OpenFileResult {
  status: "success" | "error";
  data: LessonPack | null;
  error?: string;
}

export interface RecentLesson {
  path: string;
  name: string;
  lastOpened: string;
  meta?: LessonPackOutput;
}

export interface VerifyMetaResult {
  isValid: boolean;
  errors?: string[];
}
