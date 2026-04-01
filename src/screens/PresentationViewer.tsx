import { CompleteLessonSheet } from "@/components/CompleteLessonSheet";
import { ImagePickerDialog } from "@/components/ImagePickerDialog";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLessonPack, revertImageUrls } from "@/context/LessonPackContext";
import { useOnline } from "@/hooks/useOnline";
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

  const handleSaveChanges = useCallback(async () => {
    if (!currentPack || (pendingCanvasData === null && pendingSlides === null)) return;
    setIsSaving(true);
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.failedToSave);
    } finally {
      setIsSaving(false);
    }
  }, [currentPack, pendingCanvasData, pendingSlides, updatePackMeta]);
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
            disabled={(pendingCanvasData === null && pendingSlides === null) || isSaving}
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
    </div>
  );
};
