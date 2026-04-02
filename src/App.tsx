import { Routes, Route } from "react-router-dom";
import { HomeScreen } from "@/screens/HomeScreen";
import { PresentationViewer } from "@/screens/PresentationViewer";
import { LoginScreen } from "@/screens/LoginScreen";
import { AssessmentEditorScreen } from "@/screens/AssessmentEditorScreen";
import { AssessmentViewerScreen } from "@/screens/AssessmentViewerScreen";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/context/LanguageContext";

function App() {
  useEffect(() => {
    // Keep splash screen visible for a minimum detailed time (e.g., 2.5 seconds)
    // to prevent flashing and ensure a smooth experience.
    const minSplashDuration = 2500;

    setTimeout(() => {
      invoke("close_splashscreen").catch((e) =>
        console.error("Failed to close splashscreen:", e),
      );
    }, minSplashDuration);
  }, []);

  return (
    <LanguageProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/viewer" element={<PresentationViewer />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/assessment" element={<AssessmentEditorScreen />} />
          <Route path="/assessment/view" element={<AssessmentViewerScreen />} />
        </Routes>
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    </LanguageProvider>
  );
}

export default App;
