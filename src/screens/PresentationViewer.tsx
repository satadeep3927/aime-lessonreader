import {
  CloudSyncDialog,
  getSyncPreference,
  setSyncPreference,
} from "@/components/CloudSyncDialog";
import { CompleteLessonSheet } from "@/components/CompleteLessonSheet";
import { ImagePickerDialog } from "@/components/ImagePickerDialog";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLessonPack, revertImageUrls } from "@/context/LessonPackContext";
import { useOnline } from "@/hooks/useOnline";
import { lessonIntentService } from "@/service/lessonIntentService";
import { lessonPackService } from "@/service/lessonPackService";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  type AnySlide,
  BlockSuiteCanvas,
  EditButton,
  EditView,
  FloatingNavigation,
  LessonProvider,
  LessonWindow,
  NotesPanel,
  PresentButton,
  SlideNavigation,
  SlideSidebar,
  SlideViewer,
} from "@aime.ai/renderer-react";
import "@aime.ai/renderer-react/style.css";
import { CheckCircle, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const PresentationViewer = () => {
  const { currentPack, updatePackMeta } = useLessonPack();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isOnline = useOnline();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingCanvasData, setPendingCanvasData] = useState<unknown>(null);
  const [pendingSlides, setPendingSlides] = useState<AnySlide[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedSlidesSnapshot, setSavedSlidesSnapshot] = useState<
    AnySlide[] | null
  >(null);
  const [savedCanvasSnapshot, setSavedCanvasSnapshot] = useState<
    unknown | null
  >(null);
  const [imagePicker, setImagePicker] = useState<{
    open: boolean;
    resolve: ((url: string | null) => void) | null;
  }>({ open: false, resolve: null });

  useEffect(() => {
    if (!currentPack) {
      navigate("/");
    }
  }, [currentPack, navigate]);

  // Track latest canvas data locally — no Tauri call on every change
  const handleCanvasChange = useCallback((data: unknown) => {
    setPendingCanvasData(data);
  }, []);

  const canSyncToCloud =
    isOnline &&
    isAuthenticated &&
    !!currentPack?.meta.lesson_intent_id;

  const performCloudSync = useCallback(
    async (slides: AnySlide[] | null, canvasData: unknown | null) => {
      if (!currentPack?.meta.lesson_intent_id) return;
      setIsSyncing(true);
      try {
        await lessonIntentService.updateLessonPack(
          currentPack.meta.lesson_intent_id,
          {
            ...(slides !== null && { slides }),
            ...(canvasData !== null && {
              canvas_data:
                canvasData instanceof Uint8Array
                  ? { bytes: Array.from(canvasData) }
                  : { bytes: canvasData },
            }),
          },
        );
        toast.success(t.syncedToCloud);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t.cloudSyncFailed,
        );
      } finally {
        setIsSyncing(false);
        setSyncDialogOpen(false);
        setSavedSlidesSnapshot(null);
        setSavedCanvasSnapshot(null);
      }
    },
    [currentPack, t],
  );

  const handleSyncChoice = useCallback(
    (choice: "sync" | "skip" | "always") => {
      if (choice === "skip") {
        setSyncDialogOpen(false);
        setSavedSlidesSnapshot(null);
        setSavedCanvasSnapshot(null);
        return;
      }
      if (choice === "always") {
        setSyncPreference("always");
      }
      performCloudSync(savedSlidesSnapshot, savedCanvasSnapshot);
    },
    [performCloudSync, savedSlidesSnapshot, savedCanvasSnapshot],
  );

  const handleSaveChanges = useCallback(async () => {
    if (!currentPack || (pendingCanvasData === null && pendingSlides === null))
      return;
    setIsSaving(true);
    // Capture for cloud sync before clearing
    const slidesForSync = pendingSlides;
    const canvasForSync = pendingCanvasData;
    try {
      await lessonPackService.saveLessonPack(
        currentPack.extracted_path,
        currentPack.original_path,
        pendingCanvasData ?? currentPack.meta.canvasData ?? [],
        pendingSlides,
      );
      updatePackMeta({
        ...(pendingCanvasData !== null && {
          canvasData:
            pendingCanvasData instanceof Uint8Array
              ? Array.from(pendingCanvasData)
              : (pendingCanvasData as number[] | undefined),
        }),
        ...(pendingSlides !== null && { slides: pendingSlides }),
      });
      setPendingCanvasData(null);
      setPendingSlides(null);
      toast.success(t.lessonSaved);

      // Cloud sync flow
      if (canSyncToCloud) {
        const pref = getSyncPreference();
        if (pref === "always") {
          performCloudSync(slidesForSync, canvasForSync);
        } else {
          setSavedSlidesSnapshot(slidesForSync);
          setSavedCanvasSnapshot(canvasForSync);
          setSyncDialogOpen(true);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.failedToSave);
    } finally {
      setIsSaving(false);
    }
  }, [
    currentPack,
    pendingCanvasData,
    pendingSlides,
    updatePackMeta,
    canSyncToCloud,
    performCloudSync,
  ]);
  const canCompleteLesson =
    isOnline && isAuthenticated && !!currentPack?.meta.lesson_intent_id;

  if (!currentPack) {
    return null;
  }

  return (
    <div className="flex-1 flex relative [&_blockquote]:text-inherit">
      <LessonProvider
        editCallbacks={{
          onSave(pack) {
            setPendingSlides(
              revertImageUrls(pack.slides, currentPack.extracted_path),
            );
          },
          onSelectImage(resolve) {
            setImagePicker({ open: true, resolve });
          },
        }}
        pack={currentPack.meta}
        labels={t.lessonLabels}
      >
        <SlideNavigation>
          <PresentButton />
          <EditButton />
          <button
            onClick={handleSaveChanges}
            disabled={
              (pendingCanvasData === null && pendingSlides === null) || isSaving
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? t.saving : t.saveChanges}
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            disabled={!canCompleteLesson}
            title={
              !isOnline
                ? t.requiresOnline
                : !isAuthenticated
                  ? t.requiresSignIn
                  : undefined
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {t.completeLesson}
          </button>
        </SlideNavigation>
        <LessonWindow>
          <SlideSidebar onBack={() => navigate("/")} />
          <SlideViewer />
          <BlockSuiteCanvas
            initialData={
              Array.isArray(currentPack.meta.canvasData) &&
              currentPack.meta.canvasData.length > 0
                ? new Uint8Array(currentPack.meta.canvasData)
                : undefined
            }
            onSave={handleCanvasChange}
          />
          <EditView />
        </LessonWindow>
        <FloatingNavigation />
        <NotesPanel />
      </LessonProvider>
      {canCompleteLesson && (
        <CompleteLessonSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          lessonIntentId={currentPack.meta.lesson_intent_id}
        />
      )}
      <ImagePickerDialog
        open={imagePicker.open}
        onOpenChange={(open) => {
          if (!open) {
            setImagePicker({ open: false, resolve: null });
          }
        }}
        extractedPath={currentPack.extracted_path}
        onSelect={(relativePath) => {
          const assetUrl = convertFileSrc(
            `${currentPack.extracted_path.replace(/[\\/]+$/, "")}/${relativePath}`,
          );
          imagePicker.resolve?.(assetUrl);
          setImagePicker({ open: false, resolve: null });
        }}
      />
      <CloudSyncDialog
        open={syncDialogOpen}
        onChoice={handleSyncChoice}
        isSyncing={isSyncing}
        labels={t}
      />
    </div>
  );
};
