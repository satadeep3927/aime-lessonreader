interface SlideThumbnailProps {
  index: number;
  title: string;
  htmlContent: string;
  isActive: boolean;
  onClick: () => void;
}

export const SlideThumbnail = ({
  index,
  title,
  htmlContent,
  isActive,
  onClick,
}: SlideThumbnailProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2 rounded transition-all ${
        isActive
          ? 'bg-blue-500 dark:bg-blue-600 ring-2 ring-blue-400 dark:ring-blue-500 shadow-md'
          : 'bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border border-gray-200 dark:border-zinc-600'
      }`}
    >
      {/* Slide preview iframe */}
      <div className="aspect-video bg-white dark:bg-zinc-800 rounded overflow-hidden relative mb-2 shadow-sm border border-gray-100 dark:border-zinc-600">
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-0 pointer-events-none absolute top-0 left-0"
          style={{
            transform: 'scale(0.2)',
            transformOrigin: 'top left',
            width: '500%',
            height: '500%',
          }}
          title={`Thumbnail ${index + 1}`}
          scrolling="no"
        />
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium ${
            isActive ? 'text-white' : 'text-gray-500 dark:text-zinc-400'
          }`}
        >
          {index + 1}
        </span>
        <p
          className={`text-xs truncate flex-1 ${
            isActive ? 'text-white font-medium' : 'text-gray-700 dark:text-zinc-300'
          }`}
        >
          {title}
        </p>
      </div>
    </button>
  );
};
