import { useLessonPack } from '@/context/LessonPackContext';
import { usePresentation } from '@/context/PresentationContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useSlideLoader } from '@/hooks/useSlideLoader';
import { useThumbnailLoader } from '@/hooks/useThumbnailLoader';
import { SlideNavigation } from '@/components/presentation/SlideNavigation';
import { SlideSidebar } from '@/components/presentation/SlideSidebar';
import { SlideViewer } from '@/components/presentation/SlideViewer';
import { FloatingNavigation } from '@/components/presentation/FloatingNavigation';
import { NotesPanel } from '@/components/presentation/NotesPanel';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const PresentationViewer = () => {
  const { currentPack, currentSlide, setCurrentSlide } = useLessonPack();
  const { isPresentationMode, setIsPresentationMode, isSidebarCollapsed, setIsSidebarCollapsed, isNotesPanelVisible, zoom } = usePresentation();
  const navigate = useNavigate();
  const [iframeKey, setIframeKey] = useState(0);

  // Redirect if no pack is loaded
  useEffect(() => {
    if (!currentPack) {
      navigate("/");
    }
  }, [currentPack, navigate]);

  // Navigation functions
  const goToNextSlide = () => {
    if (currentPack && currentSlide < currentPack.meta.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setIframeKey((prev) => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setIframeKey((prev) => prev + 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIframeKey((prev) => prev + 1);
  };

  const togglePresentationMode = async () => {
    const appWindow = getCurrentWindow();
    
    if (!isPresentationMode) {
      // Enter fullscreen
      await appWindow.setFullscreen(true);
      setIsPresentationMode(true);
      setIsSidebarCollapsed(true);
    } else {
      // Exit fullscreen
      await appWindow.setFullscreen(false);
      setIsPresentationMode(false);
      setIsSidebarCollapsed(false);
    }
  };

  const exitPresentationMode = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.setFullscreen(false);
    setIsPresentationMode(false);
    setIsSidebarCollapsed(false);
  };

  const toggleFullScreen = async () => {
    const appWindow = getCurrentWindow();
    const isFullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFullscreen);
  };

  // Keyboard navigation
  useKeyboardShortcut([
    {
      key: 'ArrowLeft',
      callback: () => goToPrevSlide(),
    },
    {
      key: 'ArrowRight',
      callback: () => goToNextSlide(),
    },
    {
      key: 'Home',
      callback: () => setCurrentSlide(0),
    },
    {
      key: 'End',
      callback: () =>
        setCurrentSlide((currentPack?.meta.slides.length || 1) - 1),
    },
    {
      key: 'Escape',
      callback: () =>
        isPresentationMode ? exitPresentationMode() : navigate('/'),
    },
    {
      key: 'F5',
      callback: () => togglePresentationMode(),
    },
    {
      key: 'F11',
      callback: () => toggleFullScreen(),
    },
  ]);

  if (!currentPack) {
    return null;
  }

  const currentSlideData = currentPack.meta.slides[currentSlide];
  const slidePath = `${currentPack.extractedPath}/${currentSlideData.file}`.replace(
    /\\/g,
    '/'
  );
  const baseDir = currentPack.extractedPath.replace(/\\/g, '/');

  // Load slide and thumbnail contents
  const slideContent = useSlideLoader(slidePath, baseDir);
  const thumbnailContents = useThumbnailLoader(
    currentPack.meta.slides,
    currentPack.extractedPath,
    baseDir
  );

  return (
    <div className={`flex-1 flex overflow-hidden relative ${isPresentationMode ? 'bg-black' : 'bg-[#f3f3f3] dark:bg-zinc-900'}`}>
      {/* Sidebar - collapsible */}
      {!isSidebarCollapsed && (
        <SlideSidebar
          lessonName={currentPack.meta.name}
          totalSlides={currentPack.meta.totalSlides}
          slides={currentPack.meta.slides}
          thumbnailContents={thumbnailContents}
          currentSlide={currentSlide}
          onSlideClick={goToSlide}
          onBackToHome={() => navigate('/')}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Top navigation - hidden in presentation mode */}
        {!isPresentationMode && (
          <SlideNavigation
            currentSlide={currentSlide}
            totalSlides={currentPack.meta.totalSlides}
            currentSlideTitle={currentSlideData.title}
            onPrevious={goToPrevSlide}
            onNext={goToNextSlide}
            canGoPrevious={currentSlide > 0}
            canGoNext={currentSlide < currentPack.meta.slides.length - 1}
            onPresentationMode={togglePresentationMode}
          />
        )}

        <SlideViewer
          slideContent={slideContent}
          slideTitle={currentSlideData.title}
          iframeKey={iframeKey}
          isFullScreen={isPresentationMode}
          zoom={zoom}
        />

        {/* Notes Panel - shown when enabled and not in presentation mode */}
        {!isPresentationMode && isNotesPanelVisible && (
          <NotesPanel
            currentSlide={currentSlide}
            slideTitle={currentSlideData.title}
            notes={currentSlideData.notes || ''}
          />
        )}

        {/* Floating navigation - shown in presentation mode */}
        {isPresentationMode && (
          <FloatingNavigation
            currentSlide={currentSlide}
            totalSlides={currentPack.meta.totalSlides}
            onPrevious={goToPrevSlide}
            onNext={goToNextSlide}
            onExit={exitPresentationMode}
            canGoPrevious={currentSlide > 0}
            canGoNext={currentSlide < currentPack.meta.slides.length - 1}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}
      </div>
    </div>
  );
};