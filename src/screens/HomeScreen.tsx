import { useLessonPack } from "@/context/LessonPackContext";
import { useAuth } from "@/context/AuthContext";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useClearRecent, useOpenLessonPack } from "@/mutation/useLessonPack";
import { useLogout } from "@/mutation/useAuth";
import { useRecentLessons } from "@/query/useLessonPack";
import { useLessonIntents } from "@/query/useLessonIntents";
import {
  BookOpen,
  Calendar,
  Clock,
  FolderOpen,
  LogIn,
  LogOut,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lessonPackService } from "@/service/lessonPackService";
import { confirm as tauriConfirm } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import type { LessonIntentFilters, LessonIntentStatus } from "@/types/api";

const STATUS_OPTIONS: { label: string; value: LessonIntentStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Planned", value: "planned" },
  { label: "Content Generated", value: "content_generated" },
  { label: "Delivered", value: "delivered" },
  { label: "Skipped", value: "skipped" },
];

export const HomeScreen = () => {
  const openLessonPack = useOpenLessonPack();
  const clearRecent = useClearRecent();
  const { data: recentLessons, isLoading: loadingRecent } = useRecentLessons();
  const { setCurrentPack } = useLessonPack();
  const { isAuthenticated, user } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good morning");
  const [intentFilters, setIntentFilters] = useState<LessonIntentFilters>({});
  const [statusFilter, setStatusFilter] = useState<LessonIntentStatus | "">("content_generated");
  const [searchFilter, setSearchFilter] = useState("");

  const { data: lessonIntents, isLoading: loadingIntents } = useLessonIntents(
    intentFilters,
  );

  // Sync status filter into query params
  useEffect(() => {
    setIntentFilters((prev) => ({
      ...prev,
      status: statusFilter || undefined,
    }));
  }, [statusFilter]);

  const filteredIntents = lessonIntents?.filter((intent) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      intent.title.toLowerCase().includes(q) ||
      intent.class_name?.toLowerCase().includes(q)
    );
  });

  // Handle file-association launch.
  // close_splashscreen emits "launch-file-opened" after React is ready;
  // we also do a one-time checkLaunchFile() as a fallback for cold-launch races.
  useEffect(() => {
    let disposed = false;

    const tryOpen = (path: string | null | undefined) => {
      if (!disposed && path) openLessonPack.mutate(path);
    };

    let unlistenFn: (() => void) | null = null;

    listen<string>("launch-file-opened", ({ payload }) => {
      tryOpen(payload);
    }).then((ul) => {
      unlistenFn = ul;
    });

    // Fallback: path may already be stored if RunEvent::Opened fired early.
    lessonPackService
      .checkLaunchFile()
      .then((v) => {
        tryOpen(v);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      unlistenFn?.();
    };
  }, []);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcut([
    {
      key: "o",
      ctrl: true,
      callback: () => {
        openLessonPack.mutate(undefined);
      },
    },
  ]);

  // Navigate to viewer when lesson pack is opened
  useEffect(() => {
    if (
      openLessonPack.isSuccess &&
      openLessonPack.data?.success &&
      openLessonPack.data?.lesson_pack
    ) {
      setCurrentPack(openLessonPack.data.lesson_pack);
      navigate("/viewer");
    }
  }, [openLessonPack.isSuccess, openLessonPack.data, setCurrentPack, navigate]);

  const handleOpenRecent = (filePath: string) => {
    openLessonPack.mutate(filePath);
  };

  const handleClearRecent = async () => {
    const shouldClear = await tauriConfirm(
      "Are you sure you want to clear all recent lessons?",
      {
        title: "Clear Recent Lessons",
        kind: "warning",
        okLabel: "Clear",
        cancelLabel: "Cancel",
      },
    );

    if (shouldClear) {
      clearRecent.mutate();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 ">
      <div className="mx-auto px-12 py-8 max-w-350">
        {/* Greeting Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-light text-zinc-800  mb-1">
              {isAuthenticated && user ? `${greeting}, ${user.name.split(" ")[0]}` : greeting}
            </h1>
            {isAuthenticated && user && (
              <p className="text-sm text-zinc-500 ">{user.email}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-zinc-500  hover:text-zinc-800  transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 text-sm text-blue-600  hover:text-blue-700  transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* New Section - Template Cards */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => openLessonPack.mutate(undefined)}
              disabled={openLessonPack.isPending}
              className="group relative w-50 h-35 rounded-lg border-2 border-dashed border-zinc-300  hover:border-blue-500  transition-all flex flex-col items-center justify-center gap-2 bg-white  hover:bg-zinc-50 "
            >
              <FolderOpen className="w-12 h-12 text-zinc-400  group-hover:text-blue-500  transition-colors" />
              <span className="text-sm font-medium text-zinc-600  group-hover:text-blue-600 ">
                {openLessonPack.isPending ? "Opening..." : "Open"}
              </span>
            </button>
          </div>

          {openLessonPack.isError && (
            <div className="p-3 bg-red-50  border border-red-200  rounded text-sm text-red-800 ">
              <strong>Error:</strong> {openLessonPack.error.message}
            </div>
          )}
          {openLessonPack.isSuccess && !openLessonPack.data?.success && (
            <div className="p-3 bg-red-50  border border-red-200  rounded text-sm text-red-800 ">
              <strong>Failed to open lesson:</strong>{" "}
              {openLessonPack.data?.error ?? "Unknown error"}
            </div>
          )}
        </div>

        {/* Scheduled Lessons section — only when authenticated */}
        {isAuthenticated && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-800  flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Lessons
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search…"
                  className="text-sm px-3 py-1.5 rounded border border-zinc-200  bg-white  text-zinc-800  placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as LessonIntentStatus | "")
                  }
                  className="text-sm px-3 py-1.5 rounded border border-zinc-200  bg-white  text-zinc-800  focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingIntents ? (
              <div className="text-zinc-500  text-sm">Loading…</div>
            ) : filteredIntents && filteredIntents.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-600  border-b border-zinc-200 ">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Class</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Session</div>
                </div>
                {filteredIntents.map((intent) => (
                  <div
                    key={intent.id}
                    className="w-full grid grid-cols-12 gap-4 px-4 py-3 rounded hover:bg-zinc-100  transition-colors text-left items-center"
                  >
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-linear-to-br from-violet-500 to-violet-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-zinc-900  truncate text-sm">
                        {intent.title}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-zinc-600  truncate">
                      {intent.class_name ?? "—"}
                    </div>
                    <div className="col-span-2 text-sm text-zinc-600 ">
                      {intent.scheduled_date
                        ? new Date(intent.scheduled_date).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          intent.status === "delivered"
                            ? "bg-green-100 text-green-700  "
                            : intent.status === "content_generated"
                              ? "bg-blue-100 text-blue-700  "
                              : intent.status === "skipped"
                                ? "bg-zinc-100 text-zinc-500  "
                                : "bg-amber-100 text-amber-700  "
                        }`}
                      >
                        {intent.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-zinc-600 ">
                      #{intent.session_number}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-zinc-300  mx-auto mb-2" />
                <p className="text-zinc-500  text-sm">No scheduled lessons found</p>
              </div>
            )}
          </div>
        )}

        {/* Sign-in nudge for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mb-12 p-4 rounded-lg border border-zinc-200  bg-white  flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800 ">See your scheduled lessons</p>
              <p className="text-xs text-zinc-500  mt-0.5">Sign in to sync with your AIME account</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded transition-colors font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
          </div>
        )}

        {/* Recent Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-800 ">
              Recent
            </h2>
            {recentLessons && recentLessons.length > 0 && (
              <button
                onClick={handleClearRecent}
                disabled={clearRecent.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600  hover:text-red-600  hover:bg-red-50  rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear recent
              </button>
            )}
          </div>

          {loadingRecent ? (
            <div className="text-zinc-500 ">Loading...</div>
          ) : recentLessons && recentLessons.length > 0 ? (
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-600  border-b border-zinc-200 ">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Subject</div>
                <div className="col-span-2">Slides</div>
                <div className="col-span-1">Duration</div>
              </div>

              {/* Lesson Rows */}
              {recentLessons.map((lesson) => (
                <button
                  key={lesson.path}
                  onClick={() => handleOpenRecent(lesson.path)}
                  className="w-full grid grid-cols-12 gap-4 px-4 py-3 rounded hover:bg-zinc-100  transition-colors group text-left items-center"
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-linear-to-br from-blue-500 to-blue-600   flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-zinc-900  group-hover:text-blue-600  truncate">
                        {lesson.name}
                      </div>
                      <div className="text-xs text-zinc-500  truncate">
                        {lesson.path}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-zinc-600  truncate">
                    {lesson.meta?.subject || "—"}
                  </div>
                  <div className="col-span-2 text-sm text-zinc-600 ">
                    {lesson.meta?.slides?.length || "—"}
                  </div>
                  <div className="col-span-1 text-sm text-zinc-600  truncate">
                    {lesson.meta?.total_duration_minutes
                      ? `${lesson.meta.total_duration_minutes} min`
                      : "—"}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-zinc-300  mx-auto mb-3" />
              <p className="text-zinc-500 ">
                No recent lessons
              </p>
              <p className="text-sm text-zinc-400  mt-1">
                Open a lesson pack to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
