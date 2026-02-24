/**
 * Mirrors the lesson_type values produced by the Planner Agent.
 */
export enum LessonType {
  INTRODUCTION = "INTRODUCTION",
  PRACTICE = "PRACTICE",
  DEEP_DIVE = "DEEP_DIVE",
  REVIEW = "REVIEW",
  ASSESSMENT = "ASSESSMENT",
  CONSOLIDATION = "CONSOLIDATION",
}

/**
 * Type of assessment question.
 */
export enum QuestionType {
  MCQ = "MCQ", // Multiple-choice with 4 options
  SHORT = "SHORT", // 1-3 sentence answer
  LONG = "LONG", // Paragraph / extended response
  PROBLEM = "PROBLEM", // Mathematical / scientific problem-solving
}

/**
 * Bloom's Taxonomy cognitive level.
 */
export enum BloomsLevel {
  REMEMBER = "REMEMBER",
  UNDERSTAND = "UNDERSTAND",
  APPLY = "APPLY",
  ANALYZE = "ANALYZE",
  EVALUATE = "EVALUATE",
  CREATE = "CREATE",
}

/**
 * Fields present on every slide regardless of type.
 */
export interface BaseSlide {
  slide_number: number;
  /** Short heading shown at the top of the projected slide. Max ~8 words. */
  title: string;
  /**
   * Private delivery script — Markdown.
   * Exact questions to ask, mistakes to watch for, timing hints,
   * differentiation tips, expected student responses, bridge to next slide.
   * NEVER shown to students.
   */
  teacher_notes: string;
  duration_minutes: number;
  teacher_only: boolean;
  /**
   * IDs of the MicroObjectives this slide directly addresses.
   * Must be a subset of the MicroObjective IDs listed in the corresponding PlannedLesson.
   */
  micro_objective_ids: number[];
  /**
   * Optional SEN (Special Educational Needs) adaptation for this specific slide — Markdown.
   * Only populate when this slide requires meaningful adaptation.
   */
  sen_support: string | null;
  /**
   * URL of an image projected on this slide.
   */
  image_url: string | null;
}

// ── Slide models ─────────────────────────────────────────────────────────────

export interface TitleSlide extends BaseSlide {
  slide_type: "TITLE";
  /** Subject area, e.g. 'Mathematics'. */
  subject: string;
  /** Grade / year group, e.g. 'Grade 8'. */
  grade_level: string;
  /** 2-4 bullet points: what students will be able to do by the end. */
  objectives_preview: string[];
}

export interface LearningObjectivesSlide extends BaseSlide {
  slide_type: "LEARNING_OBJECTIVES";
  /** Each objective as a student-facing 'I can...' statement. Markdown + LaTeX supported. */
  objectives: string[];
}

export interface HookSlide extends BaseSlide {
  slide_type: "HOOK";
  /** One compelling question or scenario projected on screen. */
  question: string;
}

export interface PriorKnowledgeSlide extends BaseSlide {
  slide_type: "PRIOR_KNOWLEDGE";
  /** 2-5 short questions — each tests a prerequisite for today's lesson. */
  questions: string[];
  /** Answers matching each question index. Referenced in teacher_notes only. */
  answers: string[];
}

export interface TeachSlide extends BaseSlide {
  slide_type: "TEACH";
  /** Concise explanation — Markdown + LaTeX. */
  content: string;
  /** Important vocabulary or notation introduced on this slide. */
  key_terms: string[];
}

export interface WorkedExampleSlide extends BaseSlide {
  slide_type: "WORKED_EXAMPLE";
  /** Problem statement shown on screen. Markdown + LaTeX. */
  problem: string;
  /** Ordered solution steps. Teacher reveals one at a time while narrating. */
  steps: string[];
  /** Final answer. Markdown + LaTeX. */
  final_answer: string;
  /** Optional verification step, e.g. 'Substitute back: 3(8) = 24 ✓'. */
  check: string | null;
}

export interface GuidedPracticeSlide extends BaseSlide {
  slide_type: "GUIDED_PRACTICE";
  /** Problems shown on screen. Students call out steps; teacher writes them. */
  problems: string[];
  /** Answers per problem — referenced in teacher_notes, not projected. */
  answers: string[];
}

export interface StudentTaskSlide extends BaseSlide {
  slide_type: "STUDENT_TASK";
  /** Highly scaffolded tasks for SEN students. */
  level_0: string[];
  /** Basic / must-do tasks. Every student attempts these. */
  level_1: string[];
  /** Standard tasks. Students who finish Level 1 move here. */
  level_2: string[];
  /** Stretch / extension tasks. For early finishers only. */
  level_3: string[];
  /** Answers keyed by task label. Shown in teacher_notes only. */
  answers: Record<string, string>;
}

export interface WarmUpSlide extends BaseSlide {
  slide_type: "WARM_UP";
  /** Recall questions reviewing prior session content. */
  questions: string[];
  /** Answers matching each question index. */
  answers: string[];
}

export interface DiscussionSlide extends BaseSlide {
  slide_type: "DISCUSSION";
  /** The discussion question shown on screen. Open-ended. Markdown + LaTeX. */
  prompt: string;
  /** Suggested talking points if students are stuck. In teacher_notes only. */
  talking_points: string[];
}

export interface WorkedSolutionSlide extends BaseSlide {
  slide_type: "WORKED_SOLUTION";
  /** The original problem restated on screen. */
  problem: string;
  /** Full worked solution — Markdown + LaTeX. Shown after student attempt. */
  solution: string;
}

export interface MisconceptionItem {
  /** What students commonly write or say (wrong). */
  mistake: string;
  /** The correct approach or answer. */
  correction: string;
  /** One sentence explaining why the mistake happens. */
  explanation: string;
}

export interface MisconceptionSlide extends BaseSlide {
  slide_type: "MISCONCEPTION";
  items: MisconceptionItem[];
}

export interface SelfAssessmentSlide extends BaseSlide {
  slide_type: "SELF_ASSESSMENT";
  /** Objectives shown as 'I can...' statements for students to rate. */
  objectives: string[];
  /** Rating scale shown on screen. */
  scale: string;
}

export interface ConceptMapSlide extends BaseSlide {
  slide_type: "CONCEPT_MAP";
  /** The main topic at the centre of the map. */
  central_concept: string;
  /** Each as 'Topic A → relationship → Topic B'. Frontend renders as visual map. */
  connections: string[];
  /** 1-2 sentences shown below the map tying the connections together. */
  summary_text: string;
}

export interface SynthesisTaskSlide extends BaseSlide {
  slide_type: "SYNTHESIS_TASK";
  /** Scenario setting up the task. Markdown + LaTeX. */
  context: string;
  /** The task instruction. Markdown + LaTeX. */
  task: string;
  /** Full answer — in teacher_notes only, never projected. */
  answer: string;
}

export interface SummarySlide extends BaseSlide {
  slide_type: "SUMMARY";
  /** Bullet points: the most important things students should remember. */
  key_takeaways: string[];
  /** Optional one-liner previewing the next session. */
  next_lesson_preview: string | null;
}

export interface ExitTicketSlide extends BaseSlide {
  slide_type: "EXIT_TICKET";
  /** Short questions shown on screen. Markdown + LaTeX. */
  questions: string[];
  /** Answers per question — in teacher_notes only. Never projected. */
  answers: string[];
  /** e.g. 'If >25% wrong on Q1, revisit tomorrow.' In teacher_notes only. */
  threshold_note: string | null;
}

// ── Assessment-specific slides ───────────────────────────────────────────────

export interface AssessmentInstructionsSlide extends BaseSlide {
  slide_type: "ASSESSMENT_INSTRUCTIONS";
  /** Total time allowed for the assessment. */
  time_minutes: number;
  /** What students may use. Empty list = nothing allowed. */
  allowed_resources: string[];
  /** Bullet-point rules to read aloud. */
  instructions: string[];
}

export interface AssessmentQuestionSlide extends BaseSlide {
  slide_type: "ASSESSMENT_QUESTION";
  question_number: number;
  question_type: QuestionType;
  /** Full question shown on screen. Markdown + LaTeX. */
  question_text: string;
  /** MCQ only — 4 options labelled A/B/C/D. None for all other types. */
  options: string[] | null;
  marks: number;
  blooms_level: BloomsLevel;
}

export interface MarkSchemeSlide extends BaseSlide {
  slide_type: "MARK_SCHEME";
  teacher_only: true;
  question_number: number;
  /** Full correct answer. Markdown + LaTeX. */
  answer: string;
  /** How to award partial marks. */
  partial_credit: string | null;
  marks: number;
}

// ── Discriminated union of all slide types ────────────────────────────────────

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

// ── Top-level output ──────────────────────────────────────────────────────────

/**
 * Complete lesson pack from the Lesson Designer Agent.
 */
export interface LessonPackOutput {
  /** Session number from the pacing plan. Links this pack to its PlannedLesson. */
  session_number: number;
  /** Must match the lesson_type from the corresponding PlannedLesson. */
  lesson_type: LessonType;
  /** Full lesson title. */
  title: string;
  /** Subject area, e.g. 'Mathematics'. */
  subject: string;
  /** Grade / year group, e.g. 'Grade 8'. */
  grade_level: string;
  /** Must equal the sum of all slide duration_minutes. */
  total_duration_minutes: number;
  /** Ordered slide deck. */
  slides: AnySlide[];
  /** Classroom resources referenced in this lesson. */
  resources: string[];
  /** URL for the lesson cover image. */
  cover_image_url: string | null;
  /** 2-3 sentences explaining the AI's choices. */
  ai_rationale: string;

  author?: string; // Optional field for the human author of the lesson pack
}