import type { RecentLesson } from "@/types/lessonPack";
import { BookOpen } from "lucide-react";

interface RecentLessonRowProps {
  lesson: RecentLesson;
  onClick: (path: string) => void;
}

export const RecentLessonRow = ({ lesson, onClick }: RecentLessonRowProps) => (
  <button
    onClick={() => onClick(lesson.path)}
    className="w-full grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-zinc-100 transition-colors group text-left items-center"
  >
    <div className="col-span-6 flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
        <BookOpen className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-zinc-900 group-hover:text-primary truncate text-sm">
          {lesson.name}
        </div>
        <div className="text-xs text-zinc-400 truncate">{lesson.path}</div>
      </div>
    </div>
    <div className="col-span-3 text-sm text-zinc-500 truncate">
      {lesson.meta?.subject || "—"}
    </div>
    <div className="col-span-2 text-sm text-zinc-500">
      {lesson.meta?.slides?.length || "—"}
    </div>
    <div className="col-span-1 text-sm text-zinc-500 truncate">
      {lesson.meta?.total_duration_minutes
        ? `${lesson.meta.total_duration_minutes}m`
        : "—"}
    </div>
  </button>
);
