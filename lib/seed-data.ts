import type { UserProfile } from "./types"

export function createSeedUserProfile(): UserProfile {
  const now = Date.now()

  return {
    currentDifficulty: "easy",
    totalQuestionsAttempted: 0,
    correctAnswers: 0,
    averageTimePerQuestion: 0,
    progressHistory: [],
    currentLearningPath: "path-beginner",
    topicsCompleted: [],
    topicStats: new Map(),
    streakCount: 0,
    lastActivityDate: now,
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
      estimatedMasteryDate: now + 30 * 24 * 60 * 60 * 1000,
      learningStyle: "steady-learner",
    },
    adaptiveLevel: 1,
    learningStyle: "steady-learner",
    recommendedDailyGoal: 5,
    lastAnalyticsUpdate: now,
    customLearningPaths: [],
    lastPathGenerationTime: now,
  }
}
