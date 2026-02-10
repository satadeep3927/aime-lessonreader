import { useState } from "react";

interface EmbedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

export const EmbedDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: EmbedDialogProps) => {
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Embed Content
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Paste a URL to embed (YouTube, Vimeo, Google Docs, etc.)
        </p>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md mb-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onConfirm(url);
              setUrl("");
            }
            if (e.key === "Escape") onClose();
          }}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(url);
              setUrl("");
            }}
            disabled={!url}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white transition-colors"
          >
            Embed
          </button>
        </div>
      </div>
    </div>
  );
};
