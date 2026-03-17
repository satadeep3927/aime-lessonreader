import { LessonPackProvider } from "@/context/LessonPackContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
        <LessonPackProvider>
          <App />
        </LessonPackProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
