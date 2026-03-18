import type { LessonIntentRead, LessonIntentStatus } from "@/types/api";
import { SafeImage } from "@/components/SafeImage";
import { useDownloadAndOpen } from "@/mutation/useDownloadAndOpen";
import { BookOpen, Calendar, Hash, Users } from "lucide-react";

const STATUS_STYLES: Record<LessonIntentStatus, string> = {
  planned: "bg-amber-100 text-amber-700",
  content_generated: "bg-primary/10 text-primary",
  delivered: "bg-green-100 text-green-700",
  skipped: "bg-zinc-100 text-zinc-500",
};

const STATUS_LABELS: Record<LessonIntentStatus, string> = {
  planned: "Planned",
  content_generated: "Content Ready",
  delivered: "Delivered",
  skipped: "Skipped",
};

interface LessonIntentCardProps {
  intent: LessonIntentRead;
}

export function LessonIntentCard({ intent }: LessonIntentCardProps) {
  const downloadAndOpen = useDownloadAndOpen();

  return (
  <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-shadow">
    {/* Cover */}
    <div className="relative h-40 bg-zinc-100">
      {intent.cover_image_url ? (
        <SafeImage
          src={intent.cover_image_url}
          alt={intent.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-zinc-300" />
        </div>
      )}
    </div>

    {/* Body */}
    <div className="p-4 flex flex-col flex-1 gap-2.5">
      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {intent.lesson_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
            {intent.lesson_type}
          </span>
        )}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[intent.status]}`}
        >
          {STATUS_LABELS[intent.status]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2">
        {intent.title}
      </h3>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          Session {intent.session_number}
        </span>
        {intent.week_number != null && <span>Week {intent.week_number}</span>}
        {intent.scheduled_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(intent.scheduled_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
        {intent.class_name && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {intent.class_name}
          </span>
        )}
      </div>

      {/* Description */}
      {intent.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
          {intent.description}
        </p>
      )}

      <div className="flex-1" />

      {downloadAndOpen.isError && (
        <p className="text-xs text-red-600 mb-1 text-center">
          {downloadAndOpen.error instanceof Error
            ? downloadAndOpen.error.message
            : "Download failed"}
        </p>
      )}
      <button
        onClick={() => downloadAndOpen.mutate(intent)}
        disabled={downloadAndOpen.isPending}
        className="w-full mt-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        {downloadAndOpen.isPending ? "Downloading…" : "Download & Open"}
      </button>
    </div>
  </div>
  );
}
