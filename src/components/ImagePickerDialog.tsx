import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lessonPackService } from "@/service/lessonPackService";
import { cn } from "@/lib/utils";
import { fetch } from "@tauri-apps/plugin-http";
import type { BucketImage } from "@/types/images";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const INDEX_URL =
  "https://aime-08-01-2025.s3.eu-west-2.amazonaws.com/generated/images/index.json";
const PAGE_SIZE = 30;

export interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the relative path inside the pack, e.g. "images/abc.jpg" */
  onSelect: (relativePath: string) => void;
  extractedPath: string;
}

export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
  extractedPath,
}: ImagePickerDialogProps) {
  const [tab, setTab] = useState<"library" | "upload">("library");

  // ── Library state ──────────────────────────────────────────────
  const [images, setImages] = useState<BucketImage[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [libLoading, setLibLoading] = useState(false);
  const [libError, setLibError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BucketImage | null>(null);
  const [downloading, setDownloading] = useState(false);

  // ── Upload state ───────────────────────────────────────────────
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLButtonElement>(null);

  // Fetch index once when dialog opens
  useEffect(() => {
    if (!open || images.length > 0) return;
    setLibLoading(true);
    setLibError(null);
    fetch(INDEX_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load image library (${r.status})`);
        return r.json() as Promise<BucketImage[]>;
      })
      .then(setImages)
      .catch((e: Error) => setLibError(e.message))
      .finally(() => setLibLoading(false));
  }, [open, images.length]);

  // Reset transient state on close
  useEffect(() => {
    if (!open) {
      setSelected(null);
      setSearch("");
      setPage(0);
      setDownloading(false);
      setUploadFile(null);
      setUploadError(null);
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered + paginated images
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? images.filter((img) => img.key.toLowerCase().includes(q)) : images;
  }, [images, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset to first page when search changes
  useEffect(() => setPage(0), [search]);

  // ── Library handlers ────────────────────────────────────────────
  const handleSelectLibrary = useCallback(async () => {
    if (!selected) return;
    setDownloading(true);
    setLibError(null);
    try {
      const relativePath = await lessonPackService.downloadImageToPack(
        extractedPath,
        selected.url,
      );
      onSelect(relativePath);
      onOpenChange(false);
    } catch (e) {
      setLibError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [selected, extractedPath, onSelect, onOpenChange]);

  // ── Upload handlers ─────────────────────────────────────────────
  const handleFileChange = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadFile(file);
    setUploadError(null);
    setUploadPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileChange(file);
    },
    [handleFileChange],
  );

  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const buffer = await uploadFile.arrayBuffer();
      const data = Array.from(new Uint8Array(buffer));
      const ext = uploadFile.name.split(".").pop() ?? "jpg";
      const filename = `upload_${Date.now()}.${ext}`;
      const relativePath = await lessonPackService.saveImageToPack(
        extractedPath,
        filename,
        data,
      );
      onSelect(relativePath);
      onOpenChange(false);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [uploadFile, extractedPath, onSelect, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-155 flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
          <DialogTitle>Choose Image</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b px-6 mt-3 shrink-0">
          {(["library", "upload"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 mr-5 transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "library" ? "AIME Library" : "Upload from Computer"}
            </button>
          ))}
        </div>

        {/* ── Library Tab ─── */}
        {tab === "library" && (
          <div className="flex flex-col flex-1 overflow-hidden px-6 pt-4 pb-4 gap-3">
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search images…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {libLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {libError && !libLoading && (
                <p className="text-sm text-destructive px-1">{libError}</p>
              )}
              {!libLoading && !libError && paged.length === 0 && (
                <p className="text-sm text-muted-foreground px-1">No images found.</p>
              )}
              {!libLoading && !libError && paged.length > 0 && (
                <div className="grid grid-cols-5 gap-2 pr-1">
                  {paged.map((img) => (
                    <button
                      key={img.key}
                      onClick={() => setSelected(img)}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected?.key === img.key
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-border",
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.key.split("/").pop()}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination + action */}
            <div className="flex items-center justify-between pt-2 border-t shrink-0">
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1 rounded hover:bg-accent disabled:opacity-40 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm text-muted-foreground min-w-20 text-center">
                  {filtered.length > 0
                    ? `${page + 1} / ${pageCount} · ${filtered.length} images`
                    : "0 results"}
                </span>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1 rounded hover:bg-accent disabled:opacity-40 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <Button
                disabled={!selected || downloading}
                onClick={handleSelectLibrary}
              >
                {downloading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Downloading…
                  </>
                ) : (
                  "Use Image"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Upload Tab ─── */}
        {tab === "upload" && (
          <div className="flex flex-col flex-1 px-6 pb-6 pt-4 gap-4 overflow-hidden">
            {!uploadFile ? (
              <button
                ref={dropZoneRef}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click or drag an image here
                </p>
                <p className="text-xs text-muted-foreground/60">
                  PNG, JPG, GIF, WebP supported
                </p>
              </button>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 overflow-hidden">
                <div className="relative max-h-85 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={uploadPreview!}
                    alt="Preview"
                    className="max-h-85 max-w-full object-contain rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
                      setUploadPreview(null);
                    }}
                    className="absolute top-2 right-2 size-7 bg-background/80 backdrop-blur border rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    aria-label="Remove"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{uploadFile.name}</p>
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-destructive shrink-0">{uploadError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
                // Reset so selecting the same file again fires onChange
                e.target.value = "";
              }}
            />

            {uploadFile && (
              <Button
                className="w-full shrink-0"
                disabled={uploading}
                onClick={handleUpload}
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving to lesson pack…
                  </>
                ) : (
                  "Use this Image"
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
