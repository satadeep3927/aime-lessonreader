export interface ReflectionOption {
  key: string;
  text: string;
  recommendation_signal: string;
}

export interface ReflectionQuestion {
  question_number: number;
  category: string;
  question_text: string;
  options: ReflectionOption[];
  why_this_matters?: string;
}

export interface MicroObjectiveDetail {
  id: number;
  code: string;
  name: string;
  bloom_level: string;
  sequence_order: number;
  status: string;
}

export interface LearningObjectiveDetail {
  id: number;
  code: string;
  name: string;
  sequence_order: number;
  micro_objectives: MicroObjectiveDetail[];
}

export interface TeacherReflection {
  id: string;
  lesson_intent_id: string;
  lesson_pack_id: string | null;
  version: number;
  is_active: boolean;
  subject: string | null;
  topic_title: string | null;
  grade_level: string | null;
  questions: ReflectionQuestion[] | null;
  ai_rationale: string | null;
  answers: Record<string, string> | null;
  is_answered: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  objectives: LearningObjectiveDetail[];
}

export type ReflectionVersion = "active" | "latest";
