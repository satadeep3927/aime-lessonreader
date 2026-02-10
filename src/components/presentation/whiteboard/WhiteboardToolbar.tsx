import React, { useRef, useEffect } from "react";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  MousePointer2,
  Trash2,
  Undo,
  Redo,
  Move,
  ArrowRight,
  Minus,
  StickyNote,
  Highlighter,
  Youtube,
} from "lucide-react";

const ToolButton = ({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition-colors ${
      active
        ? "bg-blue-500 text-white"
        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
    }`}
    title={title}
  >
    {icon}
  </button>
);

interface WhiteboardToolbarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  arrowStart: "none" | "arrow" | "bar" | "dot" | "diamond" | "triangle";
  arrowEnd: "none" | "arrow" | "bar" | "dot" | "diamond" | "triangle";
  arrowLineStyle: "draw" | "solid" | "dashed" | "dotted";
  onArrowStyleChange: (start: any, end: any) => void;
  onArrowLineChange: (style: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onEmbed: () => void;
  slideTitle: string;
}

export const WhiteboardToolbar = ({
  currentTool,
  onToolChange,
  activeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  arrowStart,
  arrowEnd,
  arrowLineStyle,
  onArrowStyleChange,
  onArrowLineChange,
  onUndo,
  onRedo,
  onClear,
  onEmbed,
  slideTitle,
}: WhiteboardToolbarProps) => {
  const ribbonRef = useRef<HTMLDivElement>(null);

  // Enable wheel scrolling on ribbon
  useEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        ribbon.scrollLeft += e.deltaY;
      }
    };

    ribbon.addEventListener("wheel", handleWheel, { passive: false });
    return () => ribbon.removeEventListener("wheel", handleWheel);
  }, []);

  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Orange", value: "#f97316" },
    { name: "Purple", value: "#a855f7" },
    { name: "White", value: "#ffffff" },
  ];

  const strokeWidths = [
    { name: "Thin", value: 2 },
    { name: "Medium", value: 4 },
    { name: "Thick", value: 6 },
    { name: "Extra Thick", value: 8 },
  ];

  return (
    <div
      ref={ribbonRef}
      className="shrink-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto scrollbar-hide w-full"
      style={{
        scrollbarWidth: "none" /* Firefox */,
        msOverflowStyle: "none" /* IE/Edge */,
      }}
    >
      <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
      <div className="flex items-center gap-1 p-2 min-w-max">
        {/* Draw Tools Group */}
        <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <ToolButton
            active={currentTool === "select"}
            onClick={() => onToolChange("select")}
            icon={<MousePointer2 className="w-4 h-4" />}
            title="Select (V)"
          />
          <ToolButton
            active={currentTool === "hand"}
            onClick={() => onToolChange("hand")}
            icon={<Move className="w-4 h-4" />}
            title="Pan Canvas (H)"
          />
          <ToolButton
            active={currentTool === "draw"}
            onClick={() => onToolChange("draw")}
            icon={<Pencil className="w-4 h-4" />}
            title="Draw (D)"
          />
          <ToolButton
            active={currentTool === "highlight"}
            onClick={() => onToolChange("highlight")}
            icon={<Highlighter className="w-4 h-4" />}
            title="Highlighter"
          />
          <ToolButton
            active={currentTool === "eraser"}
            onClick={() => onToolChange("eraser")}
            icon={<Eraser className="w-4 h-4" />}
            title="Eraser (E)"
          />
        </div>

        {/* Shape & Annotation Tools Group */}
        <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <ToolButton
            active={currentTool === "rectangle"}
            onClick={() => onToolChange("rectangle")}
            icon={<Square className="w-4 h-4" />}
            title="Rectangle (R)"
          />
          <ToolButton
            active={currentTool === "ellipse"}
            onClick={() => onToolChange("ellipse")}
            icon={<Circle className="w-4 h-4" />}
            title="Ellipse (O)"
          />
          <ToolButton
            active={currentTool === "arrow"}
            onClick={() => onToolChange("arrow")}
            icon={<ArrowRight className="w-4 h-4" />}
            title="Arrow (A)"
          />
          <ToolButton
            active={currentTool === "line"}
            onClick={() => onToolChange("line")}
            icon={<Minus className="w-4 h-4" />}
            title="Line (L)"
          />
          <ToolButton
            active={currentTool === "text"}
            onClick={() => onToolChange("text")}
            icon={<Type className="w-4 h-4" />}
            title="Text (T)"
          />
          <ToolButton
            active={currentTool === "note"}
            onClick={() => onToolChange("note")}
            icon={<StickyNote className="w-4 h-4" />}
            title="Sticky Note (N)"
          />
        </div>

        {/* Embed Tool */}
        <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onEmbed}
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Embed (YouTube, URLs)"
          >
            <Youtube className="w-4 h-4" />
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 mr-2">
            Color:
          </span>
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`w-6 h-6 rounded border-2 transition-all ${
                activeColor === color.value
                  ? "border-blue-500 scale-110"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        {/* Stroke Width */}
        <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 mr-2">
            Size:
          </span>
          {strokeWidths.map((width) => (
            <button
              key={width.value}
              onClick={() => onStrokeWidthChange(width.value)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                strokeWidth === width.value
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              title={width.name}
            >
              {width.name}
            </button>
          ))}
        </div>

        {/* Arrow Customization */}
        <div className="flex items-center gap-2 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Arrow:
          </span>
          <div className="flex gap-1">
            <select
              value={arrowStart}
              onChange={(e) => onArrowStyleChange(e.target.value, arrowEnd)}
              className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600"
              title="Start"
            >
              {["none", "arrow", "bar", "dot", "diamond", "triangle"].map(
                (opt) => (
                  <option key={opt} value={opt}>
                    Start: {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ),
              )}
            </select>
            <select
              value={arrowEnd}
              onChange={(e) => onArrowStyleChange(arrowStart, e.target.value)}
              className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600"
              title="End"
            >
              {["none", "arrow", "bar", "dot", "diamond", "triangle"].map(
                (opt) => (
                  <option key={opt} value={opt}>
                    End: {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ),
              )}
            </select>
            <select
              value={arrowLineStyle}
              onChange={(e) => onArrowLineChange(e.target.value)}
              className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600"
              title="Line Style"
            >
              <option value="solid">Solid</option>
              <option value="draw">Hand-Drawn</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onUndo}
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Canvas */}
        <div className="flex items-center gap-1 px-3">
          <button
            onClick={onClear}
            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Info */}
        <div className="ml-auto px-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">{slideTitle}</span>
        </div>
      </div>
    </div>
  );
};
