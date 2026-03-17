import type { LessonPackOutput } from "@aime.ai/renderer-react";

export interface LessonPack {
  extracted_path: string;
  original_path: string;
  meta: LessonPackOutput;
}

export interface OpenFileResult {
  success: boolean;
  lesson_pack?: LessonPack;
  error?: string;
}

export interface RecentLesson {
  path: string;
  name: string;
  last_opened: number;
  meta?: LessonPackOutput;
}

export interface VerifyMetaResult {
  valid: boolean;
  errors?: string[];
}
