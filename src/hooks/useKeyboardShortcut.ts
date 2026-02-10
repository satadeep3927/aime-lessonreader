import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
}

/**
 * Hook for handling keyboard shortcuts
 */
export const useKeyboardShortcut = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch =
          shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const shiftMatch =
          shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch =
          shortcut.alt === undefined || shortcut.alt === event.altKey;
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
};
