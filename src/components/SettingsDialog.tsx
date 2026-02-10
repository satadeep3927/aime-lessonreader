import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your lesson reader experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Appearance
            </h3>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as "light" | "dark" | "system")
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              General
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-open">Auto-open last lesson</Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Automatically open the last viewed lesson on startup
                </p>
              </div>
              <Switch
                id="auto-open"
                checked={settings.autoOpenLastLesson}
                onCheckedChange={(checked) =>
                  updateSettings({ autoOpenLastLesson: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebar">Show sidebar by default</Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Display the thumbnail sidebar when opening lessons
                </p>
              </div>
              <Switch
                id="sidebar"
                checked={settings.showSidebarByDefault}
                onCheckedChange={(checked) =>
                  updateSettings({ showSidebarByDefault: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transitions">Enable transitions</Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Smooth animations when switching slides
                </p>
              </div>
              <Switch
                id="transitions"
                checked={settings.enableTransitions}
                onCheckedChange={(checked) =>
                  updateSettings({ enableTransitions: checked })
                }
              />
            </div>
          </div>

          {/* Zoom Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Display
            </h3>

            <div className="space-y-2">
              <Label htmlFor="zoom">Default Zoom Level (%)</Label>
              <input
                id="zoom"
                type="number"
                min="50"
                max="200"
                step="10"
                value={settings.defaultZoom}
                onChange={(e) =>
                  updateSettings({ defaultZoom: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => {
                resetSettings();
                setTheme("system");
              }}
              className="w-full"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
