// Types for .aimepack files and metadata

export interface LessonPackSlide {
  id: number;
  file: string;
  title: string;
  description: string;
  notes?: string;
}

export interface LessonPackResource {
  type: 'stylesheet' | 'script' | 'directory' | 'image' | 'other';
  file?: string;
  path?: string;
  description: string;
}

export interface LessonPackFeatures {
  mathJax?: boolean;
  interactiveVisuals?: boolean;
  splitLayout?: boolean;
  [key: string]: boolean | undefined;
}

export interface LessonPackMeta {
  name: string;
  version: string;
  creator: string;
  description: string;
  subject?: string;
  topic?: string;
  creationDate: string;
  lastModified: string;
  totalSlides: number;
  estimatedDuration?: string;
  gradeLevel?: string;
  slides: LessonPackSlide[];
  resources: LessonPackResource[];
  features?: LessonPackFeatures;
  tags?: string[];
  packFormat: string;
  packFormatVersion: string;
}

export interface LessonPack {
  meta: LessonPackMeta;
  extractedPath: string;
  originalPath: string;
}

export interface RecentLesson {
  path: string;
  name: string;
  lastOpened: number;
  meta?: LessonPackMeta;
}

export interface OpenFileResult {
  success: boolean;
  lessonPack?: LessonPack;
  error?: string;
}

export interface VerifyMetaResult {
  valid: boolean;
  meta?: LessonPackMeta;
  errors?: string[];
}
