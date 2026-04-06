import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getEnv, setEnv, verifyPassphrase, type AppEnv } from "@/lib/env";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function EnvSwitcherDialog() {
  const [open, setOpen] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [currentEnv] = useState<AppEnv>(getEnv);

  // Listen for Ctrl/Cmd + Alt + S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPassphrase(passphrase)) {
      toast.error("Invalid passphrase");
      setPassphrase("");
      return;
    }
    const target: AppEnv = currentEnv === "prod" ? "staging" : "prod";
    localStorage.clear(); // Clear cache to avoid mismatched data between envs
    setEnv(target);
    toast.success(
      target === "staging"
        ? "Switched to Staging environment"
        : "Switched to Production environment",
      {
        description:
          target === "staging"
            ? "API requests now go to staging-api.aime52.ai"
            : "API requests now go to api.aime52.ai",
      },
    );
    window.location.reload();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPassphrase("");
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Switch Environment</DialogTitle>
          <DialogDescription>
            Currently on{" "}
            <span
              className={`font-semibold ${currentEnv === "staging" ? "text-amber-600" : "text-primary"}`}
            >
              {currentEnv === "staging" ? "Staging" : "Production"}
            </span>
            . Enter the passphrase to switch to{" "}
            <span className="font-semibold">
              {currentEnv === "staging" ? "Production" : "Staging"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Enter passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoFocus
            className="mb-4"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!passphrase.trim()}>
              Switch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
