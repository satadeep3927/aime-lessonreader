import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { AuthProvider } from "@/context/AuthContext";
import { LessonPackProvider } from "@/context/LessonPackContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Only route requests to our API through Tauri's native HTTP client (bypasses CORS).
// All other fetch calls (localhost dev, tauri://, wasm, lazy chunks, etc.) must
// keep using the real browser fetch, otherwise Tauri's permission scope will block
// them and the webview crashes before React even mounts.
const _nativeFetch = window.fetch.bind(window);
const API_ORIGIN = "https://staging-api.aime52.ai";
window.fetch = (input, init?) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;
  if (url.startsWith(API_ORIGIN)) {
    return tauriFetch(
      input as Parameters<typeof tauriFetch>[0],
      init,
    ) as unknown as Promise<Response>;
  }
  return _nativeFetch(input, init);
};
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./main.css";

// Disable context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  return false;
});

// Disable Ctrl+R
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "r") {
    e.preventDefault();
    return false;
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LessonPackProvider>
            <App />
          </LessonPackProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
