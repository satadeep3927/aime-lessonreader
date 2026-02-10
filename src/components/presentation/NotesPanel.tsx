import { StickyNote } from "lucide-react";

interface NotesPanelProps {
  currentSlide: number;
  slideTitle: string;
  notes: string;
}

export const NotesPanel = ({
  currentSlide,
  slideTitle,
  notes,
}: NotesPanelProps) => {
  return (
    <div className="h-48 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 flex flex-col">
      {/* Notes Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
        <StickyNote className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
          Notes - Slide {currentSlide + 1}
        </h3>
        <span className="text-xs text-gray-500 dark:text-zinc-400 truncate ml-2">
          {slideTitle}
        </span>
      </div>

      {/* Notes Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {notes ? (
          <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">
            {notes}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
              No notes available for this slide
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
