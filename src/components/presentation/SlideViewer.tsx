import { useEffect, useRef, useState } from 'react';

interface SlideViewerProps {
  slideContent: string;
  slideTitle: string;
  iframeKey: number;
  isFullScreen?: boolean;
  zoom?: number;
}

export const SlideViewer = ({
  slideContent,
  slideTitle,
  iframeKey,
  isFullScreen = false,
  zoom = 100,
}: SlideViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (!isFullScreen && containerRef.current) {
      const updateScale = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          setScale(containerWidth / 1500);
        }
      };
      
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [isFullScreen]);
  
  return (
    <div className={`flex-1 bg-[#f3f3f3] dark:bg-zinc-900 flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-8'} overflow-auto`}>
      {/* Zoom wrapper - scrollable when zoomed beyond 100% */}
      <div 
        className="transition-transform duration-200"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {/* Aspect ratio container - maintains 75:46 (1500:920) to match iframe */}
        <div 
          ref={containerRef}
          className={`aspect-[75/46] bg-white dark:bg-zinc-800 ${isFullScreen ? 'w-screen' : 'w-[min(calc(100vw-400px),calc((100vh-150px)*75/46))]'} ${isFullScreen ? '' : 'rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700'} overflow-hidden relative`}
        >
          <iframe
            key={iframeKey}
            srcDoc={slideContent}
            className="border-0 absolute top-0 left-0"
            style={{
              width: '1500px',
              height: '920px',
              transform: isFullScreen ? `scale(${window.innerWidth / 1500})` : `scale(${scale})`,
              transformOrigin: 'top left',
              colorScheme: 'light',
            }}
            title={slideTitle}
          />
        </div>
      </div>
    </div>
  );
};
