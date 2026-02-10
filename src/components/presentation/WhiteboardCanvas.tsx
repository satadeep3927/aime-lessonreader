import { useRef, useState, useEffect, useCallback } from "react";
import {
  Tldraw,
  Editor,
  TLUiOverrides,
  DefaultColorStyle,
  DefaultSizeStyle,
  createShapeId,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeArrowheadEndStyle,
  DefaultDashStyle,
  GeoShapeGeoStyle,
} from "tldraw";
import "tldraw/tldraw.css";
import { WhiteboardToolbar } from "./whiteboard/WhiteboardToolbar";
import { EmbedDialog } from "./whiteboard/EmbedDialog";

interface WhiteboardCanvasProps {
  slideContent: string;
  slideTitle: string;
  onSave?: (snapshot: any) => void;
  initialData?: any;
}

// Constants for mappings
const colorMap: Record<
  string,
  "black" | "red" | "blue" | "green" | "yellow" | "orange" | "violet" | "white"
> = {
  "#000000": "black",
  "#ef4444": "red",
  "#3b82f6": "blue",
  "#22c55e": "green",
  "#eab308": "yellow",
  "#f97316": "orange",
  "#a855f7": "violet",
  "#ffffff": "white",
};

const sizeMap: Record<number, "s" | "m" | "l" | "xl"> = {
  2: "s",
  4: "m",
  6: "l",
  8: "xl",
};

export const WhiteboardCanvas = ({
  slideContent,
  slideTitle,
  onSave,
  initialData,
}: WhiteboardCanvasProps) => {
  const editorRef = useRef<Editor | null>(null);
  const slideOverlayRef = useRef<HTMLDivElement>(null);
  const [slideShapeId, setSlideShapeId] = useState<string | null>(null);

  // State
  const [activeColor, setActiveColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [currentTool, setCurrentTool] = useState("select");

  // Arrow styles
  const [arrowStart, setArrowStart] = useState<
    "none" | "arrow" | "bar" | "dot" | "diamond" | "triangle"
  >("none");
  const [arrowEnd, setArrowEnd] = useState<
    "none" | "arrow" | "bar" | "dot" | "diamond" | "triangle"
  >("arrow");
  const [arrowLineStyle, setArrowLineStyle] = useState<
    "draw" | "solid" | "dashed" | "dotted"
  >("solid");

  // --- Handlers ---

  const handleSetTool = useCallback(
    (tool: string) => {
      if (!editorRef.current) return;
      const editor = editorRef.current;

      setCurrentTool(tool);

      try {
        editor.cancel(); // Cancel current interaction

        let tldrawTool = tool;
        const geoTools = [
          "rectangle",
          "ellipse",
          "triangle",
          "diamond",
          "pentagon",
        ];

        if (geoTools.includes(tool)) {
          tldrawTool = "geo";
        }

        editor.setCurrentTool(tldrawTool);

        // Apply styles
        if (!["select", "hand", "eraser"].includes(tool)) {
          const tldrawColor = colorMap[activeColor] || "black";
          const size = sizeMap[strokeWidth] || "m";

          editor.setStyleForNextShapes(DefaultColorStyle, tldrawColor);
          editor.setStyleForNextShapes(DefaultSizeStyle, size);

          if (tool === "arrow" || tool === "line") {
            editor.setStyleForNextShapes(
              ArrowShapeArrowheadStartStyle,
              arrowStart,
            );
            editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, arrowEnd);
            editor.setStyleForNextShapes(DefaultDashStyle, arrowLineStyle);
          }

          if (tldrawTool === "geo") {
            const geoStyle = (tool === "ellipse" ? "ellipse" : tool) as any;
            editor.setStyleForNextShapes(
              GeoShapeGeoStyle,
              geoStyle === "rectangle" || geoStyle === "ellipse"
                ? geoStyle
                : "rectangle",
            );
          }
        }
      } catch (error) {
        console.error("Error setting tool:", error);
      }
    },
    [activeColor, strokeWidth, arrowStart, arrowEnd, arrowLineStyle],
  );

  const handleSetColor = useCallback((color: string) => {
    if (!editorRef.current) return;
    setActiveColor(color);
    const tldrawColor = colorMap[color] || "black";
    editorRef.current.setStyleForSelectedShapes(DefaultColorStyle, tldrawColor);
    editorRef.current.setStyleForNextShapes(DefaultColorStyle, tldrawColor);
  }, []);

  const handleSetStroke = useCallback((width: number) => {
    if (!editorRef.current) return;
    setStrokeWidth(width);
    const size = sizeMap[width] || "m";
    editorRef.current.setStyleForSelectedShapes(DefaultSizeStyle, size);
    editorRef.current.setStyleForNextShapes(DefaultSizeStyle, size);
  }, []);

  const handleSetArrowStyle = useCallback((start: any, end: any) => {
    if (!editorRef.current) return;
    setArrowStart(start);
    setArrowEnd(end);
    editorRef.current.setStyleForNextShapes(
      ArrowShapeArrowheadStartStyle,
      start,
    );
    editorRef.current.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, end);
  }, []);

  const handleSetArrowLine = useCallback((style: any) => {
    if (!editorRef.current) return;
    setArrowLineStyle(style);
    editorRef.current.setStyleForNextShapes(DefaultDashStyle, style);
  }, []);

  const handleUndo = useCallback(() => editorRef.current?.undo(), []);
  const handleRedo = useCallback(() => editorRef.current?.redo(), []);
  const handleClear = useCallback(() => {
    if (!editorRef.current) return;
    const shapes = editorRef.current.getCurrentPageShapes();
    editorRef.current.deleteShapes(shapes.map((s) => s.id));
  }, []);

  const handleAddEmbed = useCallback((url: string) => {
    if (!editorRef.current || !url) return;
    const embedId = createShapeId();
    editorRef.current.createShape({
      id: embedId,
      type: "embed",
      x: 200,
      y: 200,
      props: { w: 640, h: 360, url },
    });
    setShowEmbedDialog(false);
  }, []);

  // --- Effects ---

  // Update slide overlay position
  useEffect(() => {
    // Only run if we have required refs and ID
    if (!slideShapeId) return;

    const updateOverlay = () => {
      const editor = editorRef.current;
      const overlay = slideOverlayRef.current;

      if (!editor || !overlay) return;

      // Get the ghost shape
      const shape = editor.getShape(slideShapeId as any);
      if (!shape) return;

      const pagePoint = { x: shape.x, y: shape.y };
      const screenPoint = editor.pageToScreen(pagePoint);

      const container = overlay.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const x = screenPoint.x - containerRect.left;
      const y = screenPoint.y - containerRect.top;
      const zoom = editor.getZoomLevel();

      // Batch DOM updates
      overlay.style.transformOrigin = "0 0";
      overlay.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
      overlay.style.width = "1500px";
      overlay.style.height = "920px";
      overlay.style.left = "0px";
      overlay.style.top = "0px";
    };

    const dispose = editorRef.current?.store.listen(() => {
      updateOverlay();
    });

    window.addEventListener("resize", updateOverlay);

    // Initial call
    updateOverlay();

    return () => {
      window.removeEventListener("resize", updateOverlay);
      dispose && dispose();
    };
  }, [slideShapeId]);

  // Handle Mount
  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      if (initialData) {
        try {
          editor.store.put(initialData);
          // Recover the slide shape ID which is stable
          const slideId = createShapeId("slide");
          // Check if the shape actually exists in the restored data
          if (editor.getShape(slideId)) {
            setSlideShapeId(slideId);
            // Ensure camera is centered on restore
            setTimeout(() => {
              editor.zoomToFit({ animation: { duration: 300 } });
            }, 100);
          } else {
            console.warn(
              "Slide ghost shape not found in restored data, recreating...",
            );
            // Create slide ghost shape
            editor.createShape({
              id: slideId,
              type: "geo",
              x: 0,
              y: 0,
              opacity: 0,
              props: {
                w: 1500,
                h: 920,
                geo: "rectangle",
                color: "grey",
                fill: "none",
                dash: "dotted",
                size: "s",
              },
            });
            setSlideShapeId(slideId);
          }
        } catch (error) {
          console.error("Failed to load whiteboard data:", error);
        }
      } else {
        // Create slide ghost shape
        const slideId = createShapeId("slide");
        editor.createShape({
          id: slideId,
          type: "geo",
          x: 0,
          y: 0,
          opacity: 0,
          props: {
            w: 1500,
            h: 920,
            geo: "rectangle",
            color: "grey",
            fill: "none",
            dash: "dotted",
            size: "s",
          },
        });
        setSlideShapeId(slideId);

        // Center camera
        setTimeout(() => {
          editor.zoomToFit({ animation: { duration: 300 } });
          editor.setCamera(editor.getCamera());
        }, 100);
      }

      const cleanupFn = editor.store.listen(() => {
        if (onSave) {
          const snapshot = editor.store.serialize("document");
          onSave(snapshot);
        }
      });

      return () => cleanupFn();
    },
    [initialData, onSave],
  );

  // Overrides
  const overrides: TLUiOverrides = {
    tools(_editor, tools) {
      return tools;
    },
    actions(_editor, actions) {
      return actions;
    },
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-100 dark:bg-zinc-900">
      <WhiteboardToolbar
        currentTool={currentTool}
        onToolChange={handleSetTool}
        activeColor={activeColor}
        onColorChange={handleSetColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={handleSetStroke}
        arrowStart={arrowStart}
        arrowEnd={arrowEnd}
        arrowLineStyle={arrowLineStyle}
        onArrowStyleChange={handleSetArrowStyle}
        onArrowLineChange={handleSetArrowLine}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onEmbed={() => setShowEmbedDialog(true)}
        slideTitle={slideTitle}
      />

      <div className="flex-1 relative overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        {/* Slide Overlay */}
        <div
          ref={slideOverlayRef}
          className="absolute pointer-events-none"
          style={{
            transformOrigin: "top left",
            zIndex: 1,
            willChange: "transform",
          }}
        >
          <iframe
            srcDoc={slideContent}
            style={{
              width: "100%",
              height: "100%",
              border: 0,
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
            title={slideTitle}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        {/* TLDraw Canvas */}
        <div className="absolute inset-0 z-10 tldraw-transparent-bg">
          <Tldraw
            onMount={handleMount}
            overrides={overrides}
            hideUi={true}
            inferDarkMode={false}
          />
          <style>{`
            .tldraw-transparent-bg {
                --color-background: transparent;
            }
            .tldraw-transparent-bg .tl-canvas {
                background: transparent !important;
            }
            .tldraw-transparent-bg .tl-background {
                background: transparent !important;
            }
            .tldraw-transparent-bg .tl-grid {
                opacity: 0.2;
            }
          `}</style>
        </div>
      </div>

      <EmbedDialog
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        onConfirm={handleAddEmbed}
      />
    </div>
  );
};
