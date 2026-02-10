import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import {
  Minus,
  Square,
  X,
  Copy,
  Hash,
  List,
  BookOpen,
  Keyboard,
  Info,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLessonPack } from "@/context/LessonPackContext";
import { usePresentation } from "@/context/PresentationContext";
import { useTheme } from "@/context/ThemeContext";
import { useOpenLessonPack } from "@/mutation/useLessonPack";
import { SettingsDialog } from "@/components/SettingsDialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoImage from "@/assets/images/logo-taskbar.png";

const appWindow = getCurrentWindow();

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string>("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [goToSlideOpen, setGoToSlideOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [slideNumber, setSlideNumber] = useState("");
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentPack,
    currentSlide,
    setCurrentPack,
    setCurrentSlide,
    clearWhiteboardData,
  } = useLessonPack();
  const {
    isSidebarCollapsed,
    isNotesPanelVisible,
    isWhiteboardMode,
    toggleSidebar,
    toggleNotesPanel,
    toggleWhiteboardMode,
    setIsWhiteboardMode,
    zoomIn,
    zoomOut,
    resetZoom,
  } = usePresentation();
  const { setTheme } = useTheme();
  const { mutate: openLessonPack } = useOpenLessonPack();

  const isViewerPage = location.pathname === "/viewer";

  useEffect(() => {
    // Get the current platform
    const p = platform();
    setCurrentPlatform(p);

    // Check if window is maximized
    appWindow.isMaximized().then(setIsMaximized);

    // Listen for maximize/unmaximize events
    const unlistenResized = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });

    return () => {
      unlistenResized.then((unlisten) => unlisten());
    };
  }, []);

  const handleMinimize = () => {
    appWindow.minimize();
  };

  const handleMaximize = () => {
    appWindow.toggleMaximize();
  };

  const handleClose = () => {
    appWindow.close();
  };

  const handleNewWindow = async () => {
    try {
      await invoke("create_new_window");
    } catch (error) {
      console.error("Failed to create new window:", error);
    }
  };

  const handleOpenLesson = () => {
    openLessonPack(undefined);
  };

  const handleGoHome = () => {
    setIsWhiteboardMode(false);
    navigate("/");
  };

  const handleCloseLesson = () => {
    setIsWhiteboardMode(false);
    clearWhiteboardData();
    setCurrentPack(null);
    setCurrentSlide(0);
    navigate("/");
  };

  const handleFullScreen = async () => {
    const isFullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFullscreen);
  };

  // Navigation functions (only work when on viewer page)
  const handleNextSlide = () => {
    if (currentPack && isViewerPage) {
      const nextSlide = Math.min(
        currentSlide + 1,
        currentPack.meta.slides.length - 1,
      );
      setCurrentSlide(nextSlide);
    }
  };

  const handlePrevSlide = () => {
    if (isViewerPage) {
      const prevSlide = Math.max(currentSlide - 1, 0);
      setCurrentSlide(prevSlide);
    }
  };

  const handleFirstSlide = () => {
    if (isViewerPage) {
      setCurrentSlide(0);
    }
  };

  const handleLastSlide = () => {
    if (currentPack && isViewerPage) {
      setCurrentSlide(currentPack.meta.slides.length - 1);
    }
  };

  // View menu handlers
  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleResetZoom = () => {
    resetZoom();
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleToggleNotesPanel = () => {
    toggleNotesPanel();
  };

  const handlePresentationMode = async () => {
    const appWindow = getCurrentWindow();
    const isFullscreen = await appWindow.isFullscreen();

    if (!isFullscreen) {
      await appWindow.setFullscreen(true);
    }
  };

  const handleLightMode = () => {
    setTheme("light");
  };

  const handleDarkMode = () => {
    setTheme("dark");
  };

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleGoToSlide = () => {
    setGoToSlideOpen(true);
  };

  const handleTableOfContents = () => {
    setTocOpen(true);
  };

  const handleGoToSlideSubmit = () => {
    const slideNum = parseInt(slideNumber);
    if (!isNaN(slideNum) && currentPack) {
      const slideIndex = slideNum - 1; // Convert to 0-based index
      if (slideIndex >= 0 && slideIndex < currentPack.meta.slides.length) {
        setCurrentSlide(slideIndex);
        setGoToSlideOpen(false);
        setSlideNumber("");
      }
    }
  };

  const handleJumpToSlide = (index: number) => {
    setCurrentSlide(index);
    setTocOpen(false);
  };

  const handleUserGuide = () => {
    setUserGuideOpen(true);
  };

  const handleKeyboardShortcuts = () => {
    setShortcutsOpen(true);
  };

  const handleAbout = () => {
    setAboutOpen(true);
  };

  const handleProperties = () => {
    setPropertiesOpen(true);
  };

  // Determine OS-specific styles
  const isMac = currentPlatform === "macos";
  const isWindows = currentPlatform === "windows";

  return (
    <div
      className={`flex items-center select-none h-9 ${
        isMac
          ? "bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
          : isWindows
            ? "bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800"
            : "bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700"
      }`}
    >
      {/* Logo on the left */}
      <div className="flex items-center pl-3 pr-2">
        <img src={logoImage} alt="AIME Logo" className="h-5 w-5" />
      </div>

      {/* macOS window controls */}
      {isMac && (
        <div className="flex items-center gap-2 pr-3">
          <button
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            aria-label="Close"
          />
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            aria-label="Minimize"
          />
          <button
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            aria-label="Maximize"
          />
        </div>
      )}

      {/* Draggable area with menu */}
      <div
        data-tauri-drag-region
        className={`flex-1 flex items-center ${isMac ? "justify-center" : ""}`}
      >
        <Menubar className="border-0 shadow-none bg-transparent h-8">
          <MenubarMenu>
            <MenubarTrigger>Home</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleGoHome}>
                Go to Home <MenubarShortcut>Esc</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleGoHome}>Recent Lessons</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleSettings}>Settings</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleNewWindow}>
                New Window <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleOpenLesson}>
                Open Lesson... <MenubarShortcut>Ctrl+O</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleGoHome}>Open Recent</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleCloseLesson} disabled={!currentPack}>
                Close Lesson <MenubarShortcut>Ctrl+W</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleProperties} disabled={!currentPack}>
                Properties
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleClose} variant="destructive">
                Exit <MenubarShortcut>Alt+F4</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleResetZoom} disabled={!isViewerPage}>
                Fit to Window <MenubarShortcut>Ctrl+0</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleResetZoom} disabled={!isViewerPage}>
                Actual Size <MenubarShortcut>Ctrl+1</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleZoomIn} disabled={!isViewerPage}>
                Zoom In <MenubarShortcut>Ctrl++</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleZoomOut} disabled={!isViewerPage}>
                Zoom Out <MenubarShortcut>Ctrl+-</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleFullScreen}>
                Full Screen <MenubarShortcut>F11</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                onClick={handlePresentationMode}
                disabled={!isViewerPage}
              >
                Presentation Mode <MenubarShortcut>F5</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                onClick={handleToggleSidebar}
                disabled={!isViewerPage}
              >
                {isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
              </MenubarItem>
              <MenubarItem
                onClick={handleToggleNotesPanel}
                disabled={!isViewerPage}
              >
                {isNotesPanelVisible ? "Hide Notes Panel" : "Show Notes Panel"}
              </MenubarItem>
              <MenubarItem
                onClick={toggleWhiteboardMode}
                disabled={!isViewerPage}
              >
                {isWhiteboardMode
                  ? "Exit Whiteboard Mode"
                  : "Enter Whiteboard Mode"}{" "}
                <MenubarShortcut>W</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleLightMode}>Light Mode</MenubarItem>
              <MenubarItem onClick={handleDarkMode}>Dark Mode</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Navigate</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleNextSlide} disabled={!isViewerPage}>
                Next Slide <MenubarShortcut>→</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handlePrevSlide} disabled={!isViewerPage}>
                Previous Slide <MenubarShortcut>←</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleFirstSlide} disabled={!isViewerPage}>
                First Slide <MenubarShortcut>Home</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleLastSlide} disabled={!isViewerPage}>
                Last Slide <MenubarShortcut>End</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleGoToSlide} disabled={!isViewerPage}>
                Go to Slide... <MenubarShortcut>Ctrl+G</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                onClick={handleTableOfContents}
                disabled={!isViewerPage}
              >
                Table of Contents <MenubarShortcut>Ctrl+T</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleUserGuide}>User Guide</MenubarItem>
              <MenubarItem onClick={handleKeyboardShortcuts}>
                Keyboard Shortcuts <MenubarShortcut>Ctrl+?</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleAbout}>
                About Lesson Reader
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* Windows/Linux window controls on the right */}
      {!isMac && (
        <div className="flex items-center h-full">
          <button
            onClick={handleMinimize}
            className={`h-full px-4 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${
              isWindows
                ? "text-zinc-700 dark:text-zinc-300"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
            aria-label="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className={`h-full px-4 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${
              isWindows
                ? "text-zinc-700 dark:text-zinc-300"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
            aria-label="Maximize"
          >
            {isMaximized ? (
              <Copy className="w-3.5 h-3.5" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleClose}
            className={`h-full px-4 hover:bg-red-600 hover:text-white transition-colors ${
              isWindows
                ? "text-zinc-700 dark:text-zinc-300"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Go to Slide Dialog */}
      <Dialog open={goToSlideOpen} onOpenChange={setGoToSlideOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Go to Slide
            </DialogTitle>
            <DialogDescription>
              Enter a slide number to jump to (1-
              {currentPack?.meta.slides.length || 0})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slide-number">Slide Number</Label>
              <Input
                id="slide-number"
                type="number"
                min="1"
                max={currentPack?.meta.slides.length || 1}
                value={slideNumber}
                onChange={(e) => setSlideNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGoToSlideSubmit();
                  }
                }}
                placeholder={`1-${currentPack?.meta.slides.length || 0}`}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoToSlideOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoToSlideSubmit}>Go</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Guide Dialog */}
      <Dialog open={userGuideOpen} onOpenChange={setUserGuideOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              User Guide
            </DialogTitle>
            <DialogDescription>
              Learn how to use AIME Lesson Reader effectively
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
                  Getting Started
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Open a lesson pack (.aimepack file) using{" "}
                  <strong>File → Open Lesson</strong> or by pressing{" "}
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">
                    Ctrl+O
                  </kbd>
                  .
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
                  Navigation
                </h3>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                  <li>
                    Use arrow keys or click thumbnails to navigate between
                    slides
                  </li>
                  <li>
                    Press <strong>Home</strong> to go to the first slide,{" "}
                    <strong>End</strong> for the last
                  </li>
                  <li>
                    Use <strong>Navigate → Go to Slide</strong> to jump to a
                    specific slide number
                  </li>
                  <li>
                    Access <strong>Table of Contents</strong> for an overview of
                    all slides
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
                  Presentation Mode
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">
                    F5
                  </kbd>{" "}
                  to enter presentation mode (fullscreen). Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">
                    Esc
                  </kbd>{" "}
                  to exit.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
                  Viewing Options
                </h3>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                  <li>
                    <strong>Zoom:</strong> Use Ctrl++ and Ctrl+- to zoom in/out
                  </li>
                  <li>
                    <strong>Sidebar:</strong> Toggle the thumbnail sidebar for
                    more viewing space
                  </li>
                  <li>
                    <strong>Notes Panel:</strong> View presenter notes for
                    teaching guidance
                  </li>
                  <li>
                    <strong>Theme:</strong> Switch between light and dark modes
                    in the View menu
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
                  Settings
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Access <strong>Home → Settings</strong> to customize default
                  zoom, sidebar visibility, and other preferences.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Quick reference for all available keyboard shortcuts
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <section>
                <h3 className="font-semibold text-base mb-3 text-zinc-900 dark:text-zinc-100">
                  General
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Open Lesson
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl+O
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Close Lesson
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl+W
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Go to Home
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Esc
                    </kbd>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3 text-zinc-900 dark:text-zinc-100">
                  Navigation
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Next Slide
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      →
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Previous Slide
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      ←
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      First Slide
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Home
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Last Slide
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      End
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Go to Slide
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl+G
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Table of Contents
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl+T
                    </kbd>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3 text-zinc-900 dark:text-zinc-100">
                  View
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Zoom In
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl++
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Zoom Out
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl+-
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Reset Zoom
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      Ctrl+0
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Full Screen
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      F11
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Presentation Mode
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                      F5
                    </kbd>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About AIME Lesson Reader
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <img src={logoImage} alt="AIME Logo" className="h-20 w-20" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                AIME Lesson Reader
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Version 1.0.0
              </p>
            </div>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p className="text-center">
                A modern desktop application for viewing and presenting
                interactive educational lessons.
              </p>
              <p className="text-center">
                Built with React, TypeScript, and Tauri.
              </p>
            </div>
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <p>© 2026 AIME Education. All rights reserved.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Properties Dialog */}
      <Dialog open={propertiesOpen} onOpenChange={setPropertiesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Lesson Properties
            </DialogTitle>
            <DialogDescription>
              Information about the current lesson pack
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                    Lesson Name
                  </Label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {currentPack?.meta.name || "N/A"}
                  </p>
                </div>

                {currentPack?.meta.description && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Description
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.description}
                    </p>
                  </div>
                )}

                {currentPack?.meta.creator && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Creator
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.creator}
                    </p>
                  </div>
                )}

                {currentPack?.meta.subject && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Subject
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.subject}
                    </p>
                  </div>
                )}

                {currentPack?.meta.topic && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Topic
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.topic}
                    </p>
                  </div>
                )}

                {currentPack?.meta.gradeLevel && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Grade Level
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.gradeLevel}
                    </p>
                  </div>
                )}

                {currentPack?.meta.estimatedDuration && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Estimated Duration
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.estimatedDuration}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                    Total Slides
                  </Label>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {currentPack?.meta.totalSlides ||
                      currentPack?.meta.slides.length ||
                      0}
                  </p>
                </div>

                {currentPack?.meta.version && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Version
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.version}
                    </p>
                  </div>
                )}

                {currentPack?.meta.packFormat && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Pack Format
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {currentPack.meta.packFormat} v
                      {currentPack.meta.packFormatVersion || "1.0"}
                    </p>
                  </div>
                )}

                {currentPack?.meta.creationDate && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Created
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {new Date(
                        currentPack.meta.creationDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {currentPack?.meta.lastModified && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Last Modified
                    </Label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {new Date(
                        currentPack.meta.lastModified,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {currentPack?.meta.tags && currentPack.meta.tags.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {currentPack.meta.tags.map(
                        (tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                    File Location
                  </Label>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 break-all font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                    {currentPack?.extractedPath || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setPropertiesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table of Contents Dialog */}
      <Dialog open={tocOpen} onOpenChange={setTocOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Table of Contents
            </DialogTitle>
            <DialogDescription>
              {currentPack?.meta.name} - {currentPack?.meta.slides.length}{" "}
              slides
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-1">
              {currentPack?.meta.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => handleJumpToSlide(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentSlide
                      ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-semibold ${
                        index === currentSlide
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium ${
                          index === currentSlide
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {slide.title}
                      </div>
                      {slide.description && (
                        <div
                          className={`text-sm mt-1 ${
                            index === currentSlide
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {slide.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
