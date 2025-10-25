import type { UserProfile, LearningPath, TopicStats } from "./types";
import { predefinedLearningPaths } from "./question-templates";
import { getCachedCSVQuestions, loadCSVDataset } from "./csv-loader";
import { createSeedUserProfile } from "./seed-data";

const USER_PROFILE_KEY = "neuro_user_profile";
const LEARNING_PATH_KEY = "neuro_learning_path";
const AI_QUESTIONS_CACHE_KEY = "neuro_ai_questions_cache";

export function initializeUserProfile(): UserProfile {
  const hasExistingProfile =
    typeof window !== "undefined" && localStorage.getItem(USER_PROFILE_KEY);

  if (!hasExistingProfile && typeof window !== "undefined") {
    // First time user - use seed data to show pre-populated progress
    return createSeedUserProfile();
  }

  return {
    currentDifficulty: "easy",
    totalQuestionsAttempted: 0,
    correctAnswers: 0,
    averageTimePerQuestion: 0,
    progressHistory: [],
    currentLearningPath: "path-beginner",
    topicsCompleted: [],
    topicStats: new Map<string, TopicStats>(),
    streakCount: 0,
    lastActivityDate: Date.now(),
    totalTimeSpent: 0,
    performanceMetrics: {
      accuracy: 0,
      speed: 0,
      consistency: 0,
      learningVelocity: 0,
      confidenceLevel: 50,
      errorPatterns: new Map(),
      conceptMastery: new Map(),
    },
    learningAnalytics: {
      totalSessionTime: 0,
      sessionsCompleted: 0,
      averageSessionDuration: 0,
      peakPerformanceTime: "afternoon",
      weakAreas: [],
      strongAreas: [],
      recommendedFocusAreas: [],
      estimatedMasteryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      learningStyle: "steady-learner",
    },
    adaptiveLevel: 1,
    learningStyle: "steady-learner",
    recommendedDailyGoal: 5,
    lastAnalyticsUpdate: Date.now(),
    customLearningPaths: [],
    lastPathGenerationTime: Date.now(),
  };
}

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return initializeUserProfile();

  const stored = localStorage.getItem(USER_PROFILE_KEY);
  if (!stored) return initializeUserProfile();

  const parsed = JSON.parse(stored);
  if (
    parsed.topicStats &&
    typeof parsed.topicStats === "object" &&
    !(parsed.topicStats instanceof Map)
  ) {
    const topicStatsMap = new Map<string, TopicStats>();
    Object.entries(parsed.topicStats).forEach(([key, value]) => {
      topicStatsMap.set(key, value as TopicStats);
    });
    parsed.topicStats = topicStatsMap;
  }
  return parsed;
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  const serializable = {
    ...profile,
    topicStats: Object.fromEntries(profile.topicStats),
  };
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(serializable));
}

export function getCurrentLearningPath(): LearningPath {
  if (typeof window === "undefined") return predefinedLearningPaths[0];

  const profile = getUserProfile();
  return (
    predefinedLearningPaths.find((p) => p.id === profile.currentLearningPath) ||
    predefinedLearningPaths[0]
  );
}

export function setCurrentLearningPath(pathId: string): void {
  const profile = getUserProfile();
  profile.currentLearningPath = pathId;
  saveUserProfile(profile);
}

export function resetUserProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_PROFILE_KEY);
  localStorage.removeItem(LEARNING_PATH_KEY);
  localStorage.removeItem(AI_QUESTIONS_CACHE_KEY);
  localStorage.removeItem("neuro_rl_qtable");
  localStorage.removeItem("neuro_rl_metrics");
  localStorage.removeItem("leetcode_csv_dataset_cache");
  localStorage.removeItem("neuro_answered_questions");
  localStorage.removeItem("neuro_wrong_submissions");
  localStorage.removeItem("neuro_ppo_metrics");
  localStorage.removeItem("neuro_ppo_policy");
}

export function cacheAIQuestion(question: any): void {
  if (typeof window === "undefined") return;

  const cache = localStorage.getItem(AI_QUESTIONS_CACHE_KEY);
  const questions = cache ? JSON.parse(cache) : {};

  const difficulty = question.difficulty || "medium";
  if (!questions[difficulty]) {
    questions[difficulty] = [];
  }

  questions[difficulty].push({
    ...question,
    id:
      question.id ||
      `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    topic: question.topic || "ai-generated",
    subtopic: question.subtopic || "ai-generated",
    type: question.type || "code-writing",
    prerequisites: question.prerequisites || [],
    estimatedTime: question.estimatedTime || 600,
    difficulty: question.difficulty,
  });

  localStorage.setItem(AI_QUESTIONS_CACHE_KEY, JSON.stringify(questions));
}

export function getCachedAIQuestions(
  difficulty: "easy" | "medium" | "hard"
): any[] {
  if (typeof window === "undefined") return [];

  const cache = localStorage.getItem(AI_QUESTIONS_CACHE_KEY);
  if (!cache) return [];

  const questions = JSON.parse(cache);
  return questions[difficulty] || [];
}

export function clearOldAIQuestionCache(): void {
  if (typeof window === "undefined") return;

  const cache = localStorage.getItem(AI_QUESTIONS_CACHE_KEY);
  if (!cache) return;

  const questions = JSON.parse(cache);
  // Keep only last 20 questions per difficulty
  Object.keys(questions).forEach((difficulty) => {
    if (questions[difficulty].length > 20) {
      questions[difficulty] = questions[difficulty].slice(-20);
    }
  });

  localStorage.setItem(AI_QUESTIONS_CACHE_KEY, JSON.stringify(questions));
}

export function getAllAvailableQuestions(): any[] {
  if (typeof window === "undefined") return [];

  const templateQuestions = localStorage.getItem("template_questions_cache")
    ? JSON.parse(localStorage.getItem("template_questions_cache") || "[]")
    : [];

  const csvQuestions = getCachedCSVQuestions();
  const aiQuestions = localStorage.getItem(AI_QUESTIONS_CACHE_KEY)
    ? JSON.parse(localStorage.getItem(AI_QUESTIONS_CACHE_KEY) || "{}")
    : {};

  // Flatten AI questions from difficulty-based structure
  const flatAIQuestions = Object.values(aiQuestions).flat();

  return [...templateQuestions, ...csvQuestions, ...flatAIQuestions];
}

export function initializeQuestionCache(): void {
  if (typeof window === "undefined") return;

  const cached = localStorage.getItem(CSV_CACHE_KEY);
  if (!cached) {
    loadCSVDataset().then((questions) => {
      if (questions.length > 0) {
        const cacheData = {
          version: "v1",
          timestamp: Date.now(),
          questions,
        };
        localStorage.setItem(CSV_CACHE_KEY, JSON.stringify(cacheData));
        console.log(` Cached ${questions.length} CSV questions`);
      }
    });
  }
}

const CSV_CACHE_KEY = "leetcode_csv_dataset_cache";

export { loadCSVDataset };
