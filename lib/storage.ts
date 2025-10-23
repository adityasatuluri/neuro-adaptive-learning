import type { UserProfile, LearningPath, TopicStats } from "./types"
import { predefinedLearningPaths } from "./question-templates"

const USER_PROFILE_KEY = "neuro_user_profile"
const LEARNING_PATH_KEY = "neuro_learning_path"

export function initializeUserProfile(): UserProfile {
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
  }
}

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return initializeUserProfile()

  const stored = localStorage.getItem(USER_PROFILE_KEY)
  if (!stored) return initializeUserProfile()

  const parsed = JSON.parse(stored)
  if (parsed.topicStats && typeof parsed.topicStats === "object" && !(parsed.topicStats instanceof Map)) {
    const topicStatsMap = new Map<string, TopicStats>()
    Object.entries(parsed.topicStats).forEach(([key, value]) => {
      topicStatsMap.set(key, value as TopicStats)
    })
    parsed.topicStats = topicStatsMap
  }
  return parsed
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  const serializable = {
    ...profile,
    topicStats: Object.fromEntries(profile.topicStats),
  }
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(serializable))
}

export function getCurrentLearningPath(): LearningPath {
  if (typeof window === "undefined") return predefinedLearningPaths[0]

  const profile = getUserProfile()
  return predefinedLearningPaths.find((p) => p.id === profile.currentLearningPath) || predefinedLearningPaths[0]
}

export function setCurrentLearningPath(pathId: string): void {
  const profile = getUserProfile()
  profile.currentLearningPath = pathId
  saveUserProfile(profile)
}

export function resetUserProgress(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(USER_PROFILE_KEY)
}
