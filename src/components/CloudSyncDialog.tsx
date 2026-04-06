import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

const SYNC_PREF_KEY = "aime_cloud_sync";

export type SyncPreference = "ask" | "always" | "never";

export function getSyncPreference(): SyncPreference {
  const stored = localStorage.getItem(SYNC_PREF_KEY);
  if (stored === "always" || stored === "never") return stored;
  return "ask";
}

export function setSyncPreference(pref: SyncPreference) {
  localStorage.setItem(SYNC_PREF_KEY, pref);
}

interface CloudSyncDialogProps {
  open: boolean;
  onChoice: (choice: "sync" | "skip" | "always") => void;
  isSyncing: boolean;
  labels: {
    syncToCloud: string;
    syncToCloudTitle: string;
    syncToCloudDesc: string;
    syncing: string;
    alwaysSync: string;
    skipSync: string;
  };
}

export function CloudSyncDialog({
  open,
  onChoice,
  isSyncing,
  labels,
}: CloudSyncDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            {labels.syncToCloudTitle}
          </DialogTitle>
          <DialogDescription>
            {labels.syncToCloudDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => onChoice("sync")}
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {labels.syncing}
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                {labels.syncToCloud}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onChoice("always")}
            disabled={isSyncing}
            className="w-full"
          >
            <Cloud className="w-4 h-4 mr-2" />
            {labels.alwaysSync}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onChoice("skip")}
            disabled={isSyncing}
            className="w-full"
          >
            <CloudOff className="w-4 h-4 mr-2" />
            {labels.skipSync}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
