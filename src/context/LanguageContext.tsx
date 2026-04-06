import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "fr";

export interface LessonLabels {
  present: string;
  exit: string;
  exportLesson: string;
  completeLesson: string;
  back: string;
  edit: string;
  editDone: string;
  editCancel: string;
  editSlides: string;
  allSlides: string;
  dragToReorder: string;
  clickToEdit: string;
  slides: string;
}

export interface Translations {
  // Greetings
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  // Header actions
  openLesson: string;
  opening: string;
  signOut: string;
  signIn: string;
  // Tabs
  tabScheduled: string;
  tabRecent: string;
  tabDownloaded: string;
  // Sign-in nudge
  seeScheduledLessons: string;
  signInToSync: string;
  // Filters
  allClasses: string;
  allSubjects: string;
  allTerms: string;
  searchPlaceholder: string;
  // Recent
  clearRecent: string;
  clearRecentConfirm: string;
  clearRecentTitle: string;
  clearRecentOk: string;
  cancel: string;
  // General
  loading: string;
  // Empty states
  noScheduledLessons: string;
  noRecentLessons: string;
  noRecentLessonsHint: string;
  noDownloadedLessons: string;
  noDownloadedLessonsHint: string;
  clearDownloads: string;
  clearDownloadsConfirm: string;
  clearDownloadsTitle: string;
  clearDownloadsOk: string;
  // Pagination
  previous: string;
  next: string;
  page: string;
  // Table headers
  colName: string;
  colSubject: string;
  colSlides: string;
  colDuration: string;
  // Card / row
  open: string;
  openingLesson: string;
  session: string;
  week: string;
  editAssessment: string;
  viewAssessment: string;
  // Lesson status labels
  statusPlanned: string;
  statusContentGenerated: string;
  statusDelivered: string;
  statusSkipped: string;
  // PresentationViewer
  saveChanges: string;
  saving: string;
  lessonSaved: string;
  failedToSave: string;
  completeLesson: string;
  completing: string;
  lessonCompleted: string;
  failedToComplete: string;
  requiresOnline: string;
  requiresSignIn: string;
  // Cloud Sync
  syncToCloud: string;
  syncToCloudTitle: string;
  syncToCloudDesc: string;
  syncing: string;
  alwaysSync: string;
  skipSync: string;
  syncedToCloud: string;
  cloudSyncFailed: string;
  // CompleteLessonSheet
  completeLessonTitle: string;
  completeLessonDesc: string;
  failedToLoadReflection: string;
  reflectionQuestionsTitle: string;
  learningObjectivesTitle: string;
  noMicroObjectives: string;
  lmsIntegrationTitle: string;
  pushHomework: string;
  pushAssessment: string;
  submissionDeadline: string;
  submitReflection: string;
  lessonCompletedSuccess: string;
  lessonCompletedDesc: string;
  submissionFailed: string;
  submissionFailedDesc: string;
  alreadyAnswered: string;
  // LessonProvider i18n labels
  lessonLabels: LessonLabels;
}

const translations: Record<Language, Translations> = {
  en: {
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    openLesson: "Open lesson",
    opening: "Opening…",
    signOut: "Sign out",
    signIn: "Sign in",
    tabScheduled: "Scheduled",
    tabRecent: "Recent",
    tabDownloaded: "Downloaded",
    seeScheduledLessons: "See your scheduled lessons",
    signInToSync: "Sign in to sync with your AIME account",
    allClasses: "All classes",
    allSubjects: "All subjects",
    allTerms: "All terms",
    searchPlaceholder: "Search…",
    clearRecent: "Clear",
    clearRecentConfirm: "Are you sure you want to clear all recent lessons?",
    clearRecentTitle: "Clear Recent Lessons",
    clearRecentOk: "Clear",
    cancel: "Cancel",
    loading: "Loading…",
    noScheduledLessons: "No scheduled lessons found",
    noRecentLessons: "No recent lessons",
    noRecentLessonsHint: "Open a lesson pack to get started",
    noDownloadedLessons: "No downloaded lessons",
    noDownloadedLessonsHint:
      'Use "Download & Open" on a scheduled lesson to save it offline',
    clearDownloads: "Clear downloads",
    clearDownloadsConfirm:
      "This will delete all downloaded lesson files and cannot be undone. Continue?",
    clearDownloadsTitle: "Clear Downloads",
    clearDownloadsOk: "Delete all",
    previous: "Previous",
    next: "Next",
    page: "Page",
    colName: "Name",
    colSubject: "Subject",
    colSlides: "Slides",
    colDuration: "Duration",
    open: "Open",
    openingLesson: "Opening…",
    session: "Session",
    week: "Week",
    editAssessment: "Edit Assessment",
    viewAssessment: "View Assessment",
    statusPlanned: "Planned",
    statusContentGenerated: "Content Ready",
    statusDelivered: "Delivered",
    statusSkipped: "Skipped",
    saveChanges: "Save changes",
    saving: "Saving…",
    lessonSaved: "Lesson saved",
    failedToSave: "Failed to save lesson pack",
    completeLesson: "Complete Lesson",
    completing: "Completing…",
    lessonCompleted: "Lesson marked as complete",
    failedToComplete: "Failed to complete lesson",
    requiresOnline: "Requires internet connection",
    requiresSignIn: "Sign in to use this feature",
    syncToCloud: "Sync to Cloud",
    syncToCloudTitle: "Sync to Cloud?",
    syncToCloudDesc: "Your changes have been saved locally. Would you like to sync them to the cloud so they're available on all your devices?",
    syncing: "Syncing…",
    alwaysSync: "Always Sync",
    skipSync: "Skip",
    syncedToCloud: "Synced to cloud",
    cloudSyncFailed: "Cloud sync failed",
    completeLessonTitle: "Complete Lesson",
    completeLessonDesc:
      "Answer reflection questions and mark learning objectives before completing the lesson.",
    failedToLoadReflection: "Failed to load reflection questions.",
    reflectionQuestionsTitle: "Reflection Questions",
    learningObjectivesTitle: "Learning Objectives",
    noMicroObjectives: "No sub-objectives defined.",
    lmsIntegrationTitle: "LMS Integration",
    pushHomework: "Push homework to LMS",
    pushAssessment: "Push assessment to LMS",
    submissionDeadline: "Submission Deadline",
    submitReflection: "Submit & Complete Lesson",
    lessonCompletedSuccess: "Lesson completed!",
    lessonCompletedDesc:
      "Your reflection has been saved and the lesson is marked as delivered.",
    submissionFailed: "Submission failed",
    submissionFailedDesc: "Please try again.",
    alreadyAnswered: "This reflection has already been submitted.",
    lessonLabels: {
      present: "Present",
      exit: "Exit",
      exportLesson: "Export Lesson",
      completeLesson: "Complete Lesson",
      back: "Back",
      edit: "Edit",
      editDone: "Done",
      editCancel: "Cancel",
      editSlides: "Edit Slides",
      allSlides: "All Slides",
      dragToReorder: "Drag to reorder",
      clickToEdit: "Click to edit",
      slides: "Slides",
    },
  },
  fr: {
    goodMorning: "Bonjour",
    goodAfternoon: "Bon après-midi",
    goodEvening: "Bonsoir",
    openLesson: "Ouvrir une leçon",
    opening: "Ouverture…",
    signOut: "Se déconnecter",
    signIn: "Se connecter",
    tabScheduled: "Planifié",
    tabRecent: "Récent",
    tabDownloaded: "Téléchargé",
    seeScheduledLessons: "Voir vos leçons planifiées",
    signInToSync: "Connectez-vous pour synchroniser avec votre compte AIME",
    allClasses: "Toutes les classes",
    allSubjects: "Toutes les matières",
    allTerms: "Toutes les périodes",
    searchPlaceholder: "Rechercher…",
    clearRecent: "Effacer",
    clearRecentConfirm:
      "Voulez-vous vraiment effacer toutes les leçons récentes ?",
    clearRecentTitle: "Effacer les leçons récentes",
    clearRecentOk: "Effacer",
    cancel: "Annuler",
    loading: "Chargement…",
    noScheduledLessons: "Aucune leçon planifiée trouvée",
    noRecentLessons: "Aucune leçon récente",
    noRecentLessonsHint: "Ouvrez un pack de leçons pour commencer",
    noDownloadedLessons: "Aucune leçon téléchargée",
    noDownloadedLessonsHint:
      "Utilisez « Télécharger et ouvrir » sur une leçon planifiée pour la sauvegarder hors ligne",
    clearDownloads: "Effacer les téléchargements",
    clearDownloadsConfirm:
      "Cela supprimera tous les fichiers de leçons téléchargés et ne peut pas être annulé. Continuer ?",
    clearDownloadsTitle: "Effacer les téléchargements",
    clearDownloadsOk: "Tout supprimer",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    colName: "Nom",
    colSubject: "Matière",
    colSlides: "Diapositives",
    colDuration: "Durée",
    open: "Ouvrir",
    openingLesson: "Ouverture…",
    session: "Session",
    week: "Semaine",
    editAssessment: "Modifier l'évaluation",
    viewAssessment: "Voir l'évaluation",
    statusPlanned: "Planifiée",
    statusContentGenerated: "Contenu prêt",
    statusDelivered: "Dispensée",
    statusSkipped: "Ignorée",
    saveChanges: "Enregistrer",
    saving: "Enregistrement…",
    lessonSaved: "Leçon enregistrée",
    failedToSave: "Échec de l'enregistrement",
    completeLesson: "Terminer la leçon",
    completing: "En cours…",
    lessonCompleted: "Leçon marquée comme terminée",
    failedToComplete: "Échec de la finalisation de la leçon",
    requiresOnline: "Connexion internet requise",
    requiresSignIn: "Connectez-vous pour utiliser cette fonctionnalité",
    syncToCloud: "Synchroniser",
    syncToCloudTitle: "Synchroniser vers le cloud ?",
    syncToCloudDesc: "Vos modifications ont été enregistrées localement. Souhaitez-vous les synchroniser vers le cloud pour y accéder sur tous vos appareils ?",
    syncing: "Synchronisation…",
    alwaysSync: "Toujours synchroniser",
    skipSync: "Ignorer",
    syncedToCloud: "Synchronisé avec le cloud",
    cloudSyncFailed: "Échec de la synchronisation",
    completeLessonTitle: "Terminer la leçon",
    completeLessonDesc:
      "Répondez aux questions de réflexion et marquez les objectifs avant de terminer.",
    failedToLoadReflection: "Impossible de charger les questions de réflexion.",
    reflectionQuestionsTitle: "Questions de réflexion",
    learningObjectivesTitle: "Objectifs d’apprentissage",
    noMicroObjectives: "Aucun sous-objectif défini.",
    lmsIntegrationTitle: "Intégration LMS",
    pushHomework: "Envoyer les devoirs au LMS",
    pushAssessment: "Envoyer l’évaluation au LMS",
    submissionDeadline: "Date limite de soumission",

    submitReflection: "Soumettre et terminer la leçon",
    lessonCompletedSuccess: "Leçon terminée !",
    lessonCompletedDesc:
      "Votre réflexion a été enregistrée et la leçon est marquée comme dispensée.",
    submissionFailed: "Échec de la soumission",
    submissionFailedDesc: "Veuillez réessayer.",
    alreadyAnswered: "Cette réflexion a déjà été soumise.",
    lessonLabels: {
      present: "Présenter",
      exit: "Quitter",
      exportLesson: "Exporter la leçon",
      completeLesson: "Terminer la leçon",
      back: "Retour",
      edit: "Modifier",
      editDone: "Terminer",
      editCancel: "Annuler",
      editSlides: "Modifier les diapositives",
      allSlides: "Toutes les diapositives",
      dragToReorder: "Glisser pour réorganiser",
      clickToEdit: "Cliquer pour modifier",
      slides: "Diapositives",
    },
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "aime_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "fr" ? "fr" : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
