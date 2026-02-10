import { Titlebar } from "@/components/Titlebar";
import { Routes, Route } from "react-router-dom";
import { HomeScreen } from "@/screens/HomeScreen";
import { PresentationViewer } from "@/screens/PresentationViewer";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950">
      <Titlebar />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/viewer" element={<PresentationViewer />} />
      </Routes>
    </div>
  );
}

export default App;
