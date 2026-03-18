import { useLessonPack } from "@/context/LessonPackContext";
import { useAuth } from "@/context/AuthContext";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useClearRecent, useOpenLessonPack } from "@/mutation/useLessonPack";
import { useLogout } from "@/mutation/useAuth";
import { useRecentLessons } from "@/query/useLessonPack";
import { useLessonIntents } from "@/query/useLessonIntents";
import { useClasses } from "@/query/useClasses";
import { useSubjects } from "@/query/useSubjects";
import { useAcademicTerms } from "@/query/useAcademicTerms";
import { useDownloadedLessons } from "@/query/useDownloadedLessons";
import { LessonIntentCard } from "@/components/LessonIntentCard";
import { RecentLessonRow } from "@/components/RecentLessonRow";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderOpen,
  Globe,
  HardDrive,
  Hash,
  LogIn,
  LogOut,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { lessonPackService } from "@/service/lessonPackService";
import { confirm as tauriConfirm } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { SafeImage } from "@/components/SafeImage";
import type { DownloadedLesson } from "@/types/api";

type Tab = "scheduled" | "recent" | "downloaded";

const STATUS_STYLES: Record<string, string> = {
  planned: "bg-amber-100 text-amber-700",
  content_generated: "bg-primary/10 text-primary",
  delivered: "bg-green-100 text-green-700",
  skipped: "bg-zinc-100 text-zinc-500",
};

function DownloadedLessonCard({
  lesson,
  onOpen,
  isOpening,
}: {
  lesson: DownloadedLesson;
  onOpen: (path: string) => void;
  isOpening: boolean;
}) {
  const { t } = useLanguage();
  const statusLabels: Record<string, string> = {
    planned: t.statusPlanned,
    content_generated: t.statusContentGenerated,
    delivered: t.statusDelivered,
    skipped: t.statusSkipped,
  };
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-zinc-100">
        {lesson.cover_image_url ? (
          <SafeImage
            src={lesson.cover_image_url}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-zinc-300" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {lesson.lesson_type && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
              {lesson.lesson_type}
            </span>
          )}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[lesson.status] ?? "bg-zinc-100 text-zinc-600"}`}
          >
            {statusLabels[lesson.status] ?? lesson.status}
          </span>
        </div>
        <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2">
          {lesson.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {t.session} {lesson.session_number}
          </span>
          {lesson.week_number != null && (
            <span>
              {t.week} {lesson.week_number}
            </span>
          )}
          {lesson.scheduled_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(lesson.scheduled_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {lesson.class_name && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {lesson.class_name}
            </span>
          )}
        </div>
        {lesson.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {lesson.description}
          </p>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onOpen(lesson.local_path)}
          disabled={isOpening}
          className="w-full mt-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isOpening ? t.openingLesson : t.open}
        </button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export const HomeScreen = () => {
  const openLessonPack = useOpenLessonPack();
  const clearRecent = useClearRecent();
  const { data: recentLessons, isLoading: loadingRecent } = useRecentLessons();
  const { setCurrentPack } = useLessonPack();
  const { isAuthenticated, user } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("recent");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;

  // API filter state
  const [classId, setClassId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [termId, setTermId] = useState<number | "">("");
  const [searchFilter, setSearchFilter] = useState("");
  const [page, setPage] = useState(1);

  // Filter dropdown data
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const { data: academicTerms } = useAcademicTerms();

  // Build filters — status hardcoded to content_generated per product requirement
  const intentFilters = {
    status: "content_generated" as const,
    ...(classId !== "" ? { class_ids: [classId as number] } : {}),
    ...(subjectId !== "" ? { subject_id: subjectId as number } : {}),
    ...(termId !== "" ? { academic_term_id: termId as number } : {}),
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data: lessonIntents, isLoading: loadingIntents } =
    useLessonIntents(intentFilters);
  const { data: downloadedLessons, isLoading: loadingDownloaded } =
    useDownloadedLessons();

  // Client-side title/class search (no API support for free-text)
  const filteredIntents = lessonIntents?.filter((intent) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      intent.title.toLowerCase().includes(q) ||
      intent.class_name?.toLowerCase().includes(q)
    );
  });

  const hasPrevPage = page > 1;
  const hasNextPage = (lessonIntents?.length ?? 0) === PAGE_SIZE;

  const handleClassChange = (val: string) => {
    setClassId(val === "" ? "" : Number(val));
    setPage(1);
  };
  const handleSubjectChange = (val: string) => {
    setSubjectId(val === "" ? "" : Number(val));
    setPage(1);
  };
  const handleTermChange = (val: string) => {
    setTermId(val === "" ? "" : Number(val));
    setPage(1);
  };

  // Switch to scheduled tab when user logs in
  useEffect(() => {
    if (isAuthenticated) setActiveTab("scheduled");
  }, [isAuthenticated]);

  // File-association launch handling
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
    lessonPackService
      .checkLaunchFile()
      .then((v) => tryOpen(v))
      .catch(() => {});
    return () => {
      disposed = true;
      unlistenFn?.();
    };
  }, []);

  useKeyboardShortcut([
    { key: "o", ctrl: true, callback: () => openLessonPack.mutate(undefined) },
  ]);

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

  const handleOpenRecent = (filePath: string) =>
    openLessonPack.mutate(filePath);

  const handleClearRecent = async () => {
    const ok = await tauriConfirm(t.clearRecentConfirm, {
      title: t.clearRecentTitle,
      kind: "warning",
      okLabel: t.clearRecentOk,
      cancelLabel: t.cancel,
    });
    if (ok) clearRecent.mutate();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    ...(isAuthenticated
      ? [
          {
            id: "scheduled" as Tab,
            label: t.tabScheduled,
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            id: "downloaded" as Tab,
            label: t.tabDownloaded,
            icon: <HardDrive className="w-4 h-4" />,
          },
        ]
      : []),
    { id: "recent", label: t.tabRecent, icon: <Clock className="w-4 h-4" /> },
  ];

  const selectCls =
    "text-sm px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50">
      {/* Fixed top bar */}
      <div className="shrink-0 px-12 pt-8 bg-zinc-50">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light text-zinc-800 mb-1">
              {isAuthenticated && user
                ? `${greeting}, ${user.name.split(" ")[0]}`
                : greeting}
            </h1>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 hover:border-primary hover:text-primary transition-colors shadow-xs"
              title={
                language === "en" ? "Switch to French" : "Passer en anglais"
              }
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "FR" : "EN"}
            </button>
            <button
              onClick={() => openLessonPack.mutate(undefined)}
              disabled={openLessonPack.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:border-primary hover:text-primary transition-colors shadow-xs"
            >
              <FolderOpen className="w-4 h-4" />
              {openLessonPack.isPending ? t.opening : t.openLesson}
            </button>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t.signOut}
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                {t.signIn}
              </button>
            )}
          </div>
        </div>

        {/* Error states */}
        {openLessonPack.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Error:</strong> {openLessonPack.error.message}
          </div>
        )}
        {openLessonPack.isSuccess && !openLessonPack.data?.success && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Failed to open lesson:</strong>{" "}
            {openLessonPack.data?.error ?? "Unknown error"}
          </div>
        )}

        {/* Sign-in nudge */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-lg border border-zinc-200 bg-white flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {t.seeScheduledLessons}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{t.signInToSync}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm text-white bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              <LogIn className="w-4 h-4" />
              {t.signIn}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-200">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab-level toolbar */}
          {activeTab === "scheduled" && isAuthenticated && (
            <div className="flex items-center gap-2 pb-1">
              {/* Class filter */}
              <select
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className={selectCls}
              >
                <option value="">{t.allClasses}</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Subject filter */}
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className={selectCls}
              >
                <option value="">{t.allSubjects}</option>
                {subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Term filter */}
              <select
                value={termId}
                onChange={(e) => handleTermChange(e.target.value)}
                className={selectCls}
              >
                <option value="">{t.allTerms}</option>
                {academicTerms?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.academic_year})
                  </option>
                ))}
              </select>

              {/* Search (client-side, current page only) */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="text-sm pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary w-40"
                />
              </div>
            </div>
          )}

          {activeTab === "recent" &&
            recentLessons &&
            recentLessons.length > 0 && (
              <button
                onClick={handleClearRecent}
                disabled={clearRecent.isPending}
                className="flex items-center gap-1.5 pb-1 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t.clearRecent}
              </button>
            )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-12 py-6">
        {/* Scheduled tab */}
        {activeTab === "scheduled" && (
          <>
            {loadingIntents ? (
              <div className="text-zinc-500 text-sm">{t.loading}</div>
            ) : filteredIntents && filteredIntents.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredIntents.map((intent) => (
                    <LessonIntentCard key={intent.id} intent={intent} />
                  ))}
                </div>

                {/* Pagination */}
                {(hasPrevPage || hasNextPage) && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!hasPrevPage}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t.previous}
                    </button>
                    <span className="text-sm text-zinc-500">
                      {t.page} {page}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNextPage}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {t.next}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">{t.noScheduledLessons}</p>
              </div>
            )}
          </>
        )}

        {/* Recent tab */}
        {activeTab === "recent" && (
          <>
            {loadingRecent ? (
              <div className="text-zinc-500 text-sm">{t.loading}</div>
            ) : recentLessons && recentLessons.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-200">
                  <div className="col-span-6">{t.colName}</div>
                  <div className="col-span-3">{t.colSubject}</div>
                  <div className="col-span-2">{t.colSlides}</div>
                  <div className="col-span-1">{t.colDuration}</div>
                </div>
                {recentLessons.map((lesson) => (
                  <RecentLessonRow
                    key={lesson.path}
                    lesson={lesson}
                    onClick={handleOpenRecent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">{t.noRecentLessons}</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {t.noRecentLessonsHint}
                </p>
              </div>
            )}
          </>
        )}
        {/* Downloaded tab */}
        {activeTab === "downloaded" && (
          <>
            {loadingDownloaded ? (
              <div className="text-zinc-500 text-sm">{t.loading}</div>
            ) : downloadedLessons && downloadedLessons.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {downloadedLessons.map((lesson) => (
                  <DownloadedLessonCard
                    key={lesson.intent_id}
                    lesson={lesson}
                    onOpen={(path) => openLessonPack.mutate(path)}
                    isOpening={openLessonPack.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <HardDrive className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">{t.noDownloadedLessons}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {t.noDownloadedLessonsHint}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
