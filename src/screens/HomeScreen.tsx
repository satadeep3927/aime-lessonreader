import { useLessonPack } from '@/context/LessonPackContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useClearRecent, useOpenLessonPack } from '@/mutation/useLessonPack';
import { useRecentLessons } from '@/query/useLessonPack';
import { BookOpen, Clock, FolderOpen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeScreen = () => {
  const openLessonPack = useOpenLessonPack();
  const clearRecent = useClearRecent();
  const { data: recentLessons, isLoading: loadingRecent } = useRecentLessons();
  const { setCurrentPack, setCurrentSlide } = useLessonPack();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('Good morning');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcut([
    {
      key: 'o',
      ctrl: true,
      callback: () => {
        openLessonPack.mutate(undefined);
      },
    },
  ]);

  // Navigate to viewer when lesson pack is opened
  useEffect(() => {
    if (openLessonPack.isSuccess && openLessonPack.data.success && openLessonPack.data.lessonPack) {
      setCurrentPack(openLessonPack.data.lessonPack);
      setCurrentSlide(0);
      navigate('/viewer');
    }
  }, [openLessonPack.isSuccess, openLessonPack.data, setCurrentPack, setCurrentSlide, navigate]);

  const handleOpenRecent = (filePath: string) => {
    openLessonPack.mutate(filePath);
  };

  const handleClearRecent = () => {
    if (confirm('Are you sure you want to clear all recent lessons?')) {
      clearRecent.mutate();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto px-12 py-8 max-w-[1400px]">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-zinc-800 dark:text-zinc-100 mb-1">
            {greeting}
          </h1>
        </div>

        {/* New Section - Template Cards */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => openLessonPack.mutate(undefined)}
              disabled={openLessonPack.isPending}
              className="group relative w-[200px] h-[140px] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750"
            >
              <FolderOpen className="w-12 h-12 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {openLessonPack.isPending ? 'Opening...' : 'Open'}
              </span>
            </button>
          </div>

          {openLessonPack.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300">
              {openLessonPack.error.message}
            </div>
          )}
        </div>

        {/* Recent Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">Recent</h2>
            {recentLessons && recentLessons.length > 0 && (
              <button
                onClick={handleClearRecent}
                disabled={clearRecent.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear recent
              </button>
            )}
          </div>

          {loadingRecent ? (
            <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
          ) : recentLessons && recentLessons.length > 0 ? (
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
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
                  className="w-full grid grid-cols-12 gap-4 px-4 py-3 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group text-left items-center"
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {lesson.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                        {lesson.path}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                    {lesson.meta?.subject || '—'}
                  </div>
                  <div className="col-span-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {lesson.meta?.totalSlides || '—'}
                  </div>
                  <div className="col-span-1 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                    {lesson.meta?.estimatedDuration?.replace(/minutes?/, 'min') || '—'}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400">No recent lessons</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                Open a lesson pack to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
