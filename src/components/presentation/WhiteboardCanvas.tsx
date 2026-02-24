import { useRef, useState, useEffect, useCallback } from "react";
import {
  Tldraw,
  Editor,
  TLUiOverrides,
  createShapeId,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeArrowheadEndStyle,
  DefaultColorStyle,
  DefaultSizeStyle,
  GeoShapeGeoStyle,
} from "tldraw";
import "tldraw/tldraw.css";
import { WhiteboardToolbar } from "./whiteboard/WhiteboardToolbar";
import { EmbedDialog } from "./whiteboard/EmbedDialog";
import { AnySlide } from "@/types/lessonPack";
import { SlideViewer } from "./SlideViewer";

interface WhiteboardCanvasProps {
  slide: AnySlide;
  onSave?: (snapshot: any) => void;
  initialData?: any;
}

// Map hex color to nearest tldraw color name
const hexToTldrawColor = (hex: string): string => {
  const map: Record<string, string> = {
    "#000000": "black",
    "#ef4444": "red",
    "#f97316": "orange",
    "#eab308": "yellow",
    "#22c55e": "green",
    "#3b82f6": "blue",
    "#8b5cf6": "violet",
    "#ec4899": "light-red",
  };
  return map[hex.toLowerCase()] ?? "black";
};

export const WhiteboardCanvas = ({
  slide,
  onSave,
  initialData,
}: WhiteboardCanvasProps) => {
  const editorRef = useRef<Editor | null>(null);
  const slideOverlayRef = useRef<HTMLDivElement>(null);
  const [slideShapeId, setSlideShapeId] = useState<string | null>(null);

  const [activeColor, setActiveColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [currentTool, setCurrentTool] = useState("select");

  const [arrowStart, setArrowStart] = useState<
    "none" | "arrow" | "bar" | "dot" | "diamond" | "triangle"
  >("none");
  const [arrowEnd, setArrowEnd] = useState<
    "none" | "arrow" | "bar" | "dot" | "diamond" | "triangle"
  >("arrow");
  const [arrowLineStyle, setArrowLineStyle] = useState<
    "draw" | "solid" | "dashed" | "dotted"
  >("solid");

  const handleSetColor = useCallback((color: string) => {
    setActiveColor(color);
    if (!editorRef.current) return;
    editorRef.current.setStyleForNextShapes(
      DefaultColorStyle,
      hexToTldrawColor(color) as any,
    );
  }, []);

  const handleSetTool = useCallback((tool: string) => {
    if (!editorRef.current) return;
    setCurrentTool(tool);
    editorRef.current.cancel();
    const geoTools = ["rectangle", "ellipse", "triangle", "diamond"];
    if (geoTools.includes(tool)) {
      editorRef.current.setCurrentTool("geo");
      editorRef.current.setStyleForNextShapes(GeoShapeGeoStyle, tool as any);
    } else {
      editorRef.current.setCurrentTool(tool);
    }
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
    setArrowLineStyle(style);
  }, []);

  const handleSetStroke = useCallback((width: number) => {
    setStrokeWidth(width);
    if (!editorRef.current) return;
    const sizeMap: Record<number, string> = {
      2: "s",
      4: "m",
      8: "l",
      16: "xl",
    };
    const closest = Object.keys(sizeMap)
      .map(Number)
      .reduce((prev, curr) =>
        Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev,
      );
    editorRef.current.setStyleForNextShapes(
      DefaultSizeStyle,
      sizeMap[closest] as any,
    );
  }, []);

  const handleUndo = useCallback(() => editorRef.current?.undo(), []);
  const handleRedo = useCallback(() => editorRef.current?.redo(), []);

  const handleClear = useCallback(() => {
    if (!editorRef.current) return;
    const shapes = editorRef.current.getCurrentPageShapes();
    editorRef.current.deleteShapes(shapes.map((s) => s.id));
  }, []);

  const handleAddEmbed = useCallback((_url: string) => {
    setShowEmbedDialog(false);
  }, []);

  // Keep slide overlay synced with the tldraw viewport
  useEffect(() => {
    if (!slideShapeId) return;

    const updateOverlay = () => {
      const editor = editorRef.current;
      const overlay = slideOverlayRef.current;
      if (!editor || !overlay) return;

      const shape = editor.getShape(slideShapeId as any);
      if (!shape) return;

      const screenPoint = editor.pageToScreen({ x: shape.x, y: shape.y });
      const container = overlay.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const x = screenPoint.x - containerRect.left;
      const y = screenPoint.y - containerRect.top;
      const zoom = editor.getZoomLevel();

      overlay.style.transformOrigin = "0 0";
      overlay.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
      overlay.style.width = "1500px";
      overlay.style.height = "920px";
      overlay.style.left = "0px";
      overlay.style.top = "0px";
    };

    const dispose = editorRef.current?.store.listen(updateOverlay);
    window.addEventListener("resize", updateOverlay);
    updateOverlay();

    return () => {
      window.removeEventListener("resize", updateOverlay);
      dispose?.();
    };
  }, [slideShapeId]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      const slideId = createShapeId("slide");

      const initShape = () => {
        editor.createShape({
          id: slideId,
          type: "geo",
          x: 0,
          y: 0,
          opacity: 0,
          props: { w: 1500, h: 920, geo: "rectangle" },
        });
        setSlideShapeId(slideId);
        setTimeout(
          () => editor.zoomToFit({ animation: { duration: 300 } }),
          100,
        );
      };

      if (initialData) {
        try {
          editor.store.put(initialData);
          if (editor.getShape(slideId)) {
            setSlideShapeId(slideId);
            setTimeout(
              () => editor.zoomToFit({ animation: { duration: 300 } }),
              100,
            );
          } else {
            initShape();
          }
        } catch (e) {
          console.error(e);
          initShape();
        }
      } else {
        initShape();
      }

      const cleanupFn = editor.store.listen(() => {
        if (onSave) onSave(editor.store.serialize("document"));
      });
      return () => cleanupFn();
    },
    [initialData, onSave],
  );

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
        slideTitle={slide.title}
      />

      <div className="flex-1 relative overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        {/* Slide rendered as background behind tldraw canvas */}
        <div
          ref={slideOverlayRef}
          className="absolute pointer-events-none"
          style={{
            transformOrigin: "top left",
            zIndex: 1,
            willChange: "transform",
          }}
        >
          <div className="w-full h-full bg-white shadow-lg overflow-hidden">
            <SlideViewer slide={slide} embedded={true} />
          </div>
        </div>

        {/* TLDraw drawing layer — transparent background */}
        <div className="absolute inset-0 z-10">
          <Tldraw
            onMount={handleMount}
            overrides={overrides}
            hideUi={true}
            inferDarkMode={false}
          />
          <style>{`
            .tl-background { background: transparent !important; }
            .tl-canvas { background: transparent !important; }
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
