// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserAuthResponse {
  id: number;
  email: string;
  username: string;
  name: string;
  role_name: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserAuthResponse;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ─── Lesson Intents ──────────────────────────────────────────────────────────

export type LessonIntentStatus =
  | "planned"
  | "content_generated"
  | "delivered"
  | "skipped";

export interface LessonIntentRead {
  id: string;
  teacher_id: number | null;
  class_id: number;
  class_name: string | null;
  subject_id: number;
  academic_term_id: number;
  session_number: number;
  week_number: number | null;
  scheduled_date: string | null;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  lesson_type: string | null;
  learning_objective_micro_map: Record<string, unknown>;
  topic_id: number | null;
  status: LessonIntentStatus;
  manually_edited: boolean;
  locked_from_regeneration: boolean;
  ai_rationale: string | null;
  recommendation?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonIntentFilters {
  class_ids?: number[];
  subject_id?: number;
  academic_term_id?: number;
  status?: LessonIntentStatus;
  skip?: number;
  limit?: number;
}

// ─── Lesson Pack (server) ────────────────────────────────────────────────────

export interface LessonPackServerRead {
  id: string;
  lesson_intent_id: string;
  version: number;
  is_active: boolean;
  status: string;
  title: string | null;
  lesson_type: string | null;
  subject: string | null;
  grade_level: string | null;
  total_duration_minutes: number | null;
  slides: unknown[] | null;
  resources: unknown[] | null;
  ai_rationale: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export type LessonPackEnsureStatus = "completed" | "generating" | "starting" | "failed";

export interface LessonPackEnsureResponse {
  status: LessonPackEnsureStatus;
  message: string;
  lesson_pack: LessonPackServerRead | null;
  workflow_handle_id: string | null;
}

export interface DownloadedLesson {
  intent_id: string;
  title: string;
  local_path: string;
  downloaded_at: number;
  intent: LessonIntentRead;
}

// ─── Lesson Pack (Server) ───────────────────────────────────────────────────

export interface LessonPackServerRead {
  id: string;
  intent_id: string;
  file_url: string;
  version: number;
}

export interface LessonPackEnsureResponse {
  status: "completed" | "generating" | "starting" | "failed";
  lesson_pack: LessonPackServerRead | null;
}

// ─── Downloaded Lessons ──────────────────────────────────────────────────────

export interface DownloadedLesson {
  intent_id: string;
  title: string;
  local_path: string;
  downloaded_at: number;
  cover_image_url: string | null;
  class_name: string | null;
  lesson_type: string | null;
  session_number: number;
  week_number: number | null;
  scheduled_date: string | null;
  status: LessonIntentStatus;
  description: string | null;
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export interface ClassRead {
  id: number;
  name: string;
  subject_id: number;
  subject_name: string | null;
}

// ─── Subjects ────────────────────────────────────────────────────────────────

export interface SubjectRead {
  id: number;
  name: string;
}

// ─── Academic Terms ───────────────────────────────────────────────────────────

export interface AcademicTermRead {
  id: number;
  name: string;
  academic_year: string;
}
