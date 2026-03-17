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
