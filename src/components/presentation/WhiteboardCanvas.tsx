import { useRef, useState } from 'react';
import {
  Tldraw,
  Editor,
  TLUiOverrides,
  DefaultColorStyle,
  DefaultSizeStyle,
} from 'tldraw';
import 'tldraw/tldraw.css';
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
} from 'lucide-react';

interface WhiteboardCanvasProps {
  slideContent: string;
  slideTitle: string;
  onSave?: (snapshot: any) => void;
  initialData?: any;
}

export const WhiteboardCanvas = ({
  slideContent,
  slideTitle,
  onSave,
  initialData,
}: WhiteboardCanvasProps) => {
  const editorRef = useRef<Editor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeColor, setActiveColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);

  // Custom toolbar override to hide default UI
  const overrides: TLUiOverrides = {
    tools(_editor, tools) {
      return tools;
    },
  };

  // Handle editor mount
  const handleMount = (editor: Editor) => {
    editorRef.current = editor;

    // Load initial data if available
    if (initialData) {
      try {
        editor.store.put(initialData);
      } catch (error) {
        console.error('Failed to load whiteboard data:', error);
      }
    }

    // Auto-save on changes
    const cleanupFn = editor.store.listen(() => {
      if (onSave) {
        const snapshot = editor.store.serialize('document');
        onSave(snapshot);
      }
    });

    return () => {
      cleanupFn();
    };
  };

  // Tool handlers
  const setTool = (tool: string) => {
    if (!editorRef.current) return;
    editorRef.current.setCurrentTool(tool);
  };

  const clearCanvas = () => {
    if (!editorRef.current) return;
    const shapes = editorRef.current.getCurrentPageShapes();
    editorRef.current.deleteShapes(shapes.map((s) => s.id));
  };

  const undo = () => {
    if (!editorRef.current) return;
    editorRef.current.undo();
  };

  const redo = () => {
    if (!editorRef.current) return;
    editorRef.current.redo();
  };

  const setColor = (color: string) => {
    if (!editorRef.current) return;
    setActiveColor(color);
    // Map hex colors to TLDraw color names
    const colorMap: Record<string, 'black' | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'violet' | 'white'> = {
      '#000000': 'black',
      '#ef4444': 'red',
      '#3b82f6': 'blue',
      '#22c55e': 'green',
      '#eab308': 'yellow',
      '#f97316': 'orange',
      '#a855f7': 'violet',
      '#ffffff': 'white',
    };
    const tldrawColor = colorMap[color] || 'black';
    editorRef.current.setStyleForSelectedShapes(DefaultColorStyle, tldrawColor);
    editorRef.current.setStyleForNextShapes(DefaultColorStyle, tldrawColor);
  };

  const setStroke = (width: number) => {
    if (!editorRef.current) return;
    setStrokeWidth(width);
    // TLDraw uses size instead of strokeWidth
    const size = width === 2 ? 's' : width === 4 ? 'm' : width === 6 ? 'l' : 'xl';
    editorRef.current.setStyleForSelectedShapes(DefaultSizeStyle, size);
    editorRef.current.setStyleForNextShapes(DefaultSizeStyle, size);
  };

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'White', value: '#ffffff' },
  ];

  const strokeWidths = [
    { name: 'Thin', value: 2 },
    { name: 'Medium', value: 4 },
    { name: 'Thick', value: 6 },
    { name: 'Extra Thick', value: 8 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-100 dark:bg-zinc-900">
      {/* Ribbon Toolbar */}
      <div className="shrink-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1 p-2">
          {/* Draw Tools Group */}
          <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setTool('select')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Select (V)"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('hand')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Pan (H)"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('draw')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Draw (D)"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Eraser (E)"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Shape Tools Group */}
          <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setTool('rectangle')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Rectangle (R)"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('ellipse')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Ellipse (O)"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('text')}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Text (T)"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 mr-2">Color:</span>
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setColor(color.value)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  activeColor === color.value
                    ? 'border-blue-500 scale-110'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 mr-2">Size:</span>
            {strokeWidths.map((width) => (
              <button
                key={width.value}
                onClick={() => setStroke(width.value)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  strokeWidth === width.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                title={width.name}
              >
                {width.name}
              </button>
            ))}
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-1 px-3 border-r border-zinc-200 dark:border-zinc-700">
            <button
              onClick={undo}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Canvas */}
          <div className="flex items-center gap-1 px-3">
            <button
              onClick={clearCanvas}
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

      {/* Canvas Area with Embedded Slide */}
      <div className="flex-1 relative overflow-hidden">
        {/* Embedded Slide (positioned behind canvas) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[1500px] h-[920px] bg-white dark:bg-zinc-800 shadow-2xl rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              srcDoc={slideContent}
              className="w-full h-full border-0"
              title={slideTitle}
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* TLDraw Canvas (transparent, overlays slide) */}
        <div className="absolute inset-0 z-10">
          <Tldraw
            onMount={handleMount}
            overrides={overrides}
            hideUi={true}
            inferDarkMode={false}
          />
        </div>
      </div>
    </div>
  );
};
