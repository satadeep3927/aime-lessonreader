import { createContext, useContext, useState, ReactNode } from 'react';

interface PresentationContextType {
  isPresentationMode: boolean;
  isSidebarCollapsed: boolean;
  isNotesPanelVisible: boolean;
  zoom: number;
  setIsPresentationMode: (value: boolean) => void;
  setIsSidebarCollapsed: (value: boolean) => void;
  setIsNotesPanelVisible: (value: boolean) => void;
  setZoom: (value: number) => void;
  togglePresentationMode: () => void;
  toggleSidebar: () => void;
  toggleNotesPanel: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const PresentationProvider = ({ children }: { children: ReactNode }) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotesPanelVisible, setIsNotesPanelVisible] = useState(false);
  const [zoom, setZoom] = useState(100);

  const togglePresentationMode = () => {
    setIsPresentationMode((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleNotesPanel = () => {
    setIsNotesPanelVisible((prev) => !prev);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  return (
    <PresentationContext.Provider
      value={{
        isPresentationMode,
        isSidebarCollapsed,
        isNotesPanelVisible,
        zoom,
        setIsPresentationMode,
        setIsSidebarCollapsed,
        setIsNotesPanelVisible,
        setZoom,
        togglePresentationMode,
        toggleSidebar,
        toggleNotesPanel,
        zoomIn,
        zoomOut,
        resetZoom,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within PresentationProvider');
  }
  return context;
};
