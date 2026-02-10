import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Settings {
  autoOpenLastLesson: boolean;
  defaultZoom: number;
  showSidebarByDefault: boolean;
  enableTransitions: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  autoOpenLastLesson: false,
  defaultZoom: 100,
  showSidebarByDefault: true,
  enableTransitions: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem("app-settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};
