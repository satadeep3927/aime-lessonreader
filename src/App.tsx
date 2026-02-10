import { Titlebar } from "@/components/Titlebar";
import { Routes, Route } from "react-router-dom";
import { HomeScreen } from "@/screens/HomeScreen";
import { PresentationViewer } from "@/screens/PresentationViewer";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  useEffect(() => {
    // Signal that the main window is ready to be shown
    invoke("close_splashscreen").catch((e) =>
      console.error("Failed to close splashscreen:", e)
    );
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
