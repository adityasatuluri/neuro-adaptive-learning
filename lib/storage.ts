// LocalStorage management for user data

import type { UserProfile, LearningPath } from "./types"
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
  }
}

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return initializeUserProfile()

  const stored = localStorage.getItem(USER_PROFILE_KEY)
  return stored ? JSON.parse(stored) : initializeUserProfile()
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
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
