export type QuestionType = "code-writing" | "code-completion" | "debugging" | "output-prediction"

export interface Question {
  id: string
  topic: string
  subtopic: string
  difficulty: "easy" | "medium" | "hard"
  title: string
  description: string
  type: QuestionType
  starterCode: string
  solutionCode?: string
  testCases: TestCase[]
  expectedOutput: string
  hints: string[]
  prerequisites?: string[] // Topic IDs that should be completed first
  estimatedTime: number // in seconds
  tags: string[]
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface PerformanceMetrics {
  accuracy: number // 0-100
  speed: number // questions per hour
  consistency: number // 0-100, how consistent performance is
  learningVelocity: number // how fast user is improving
  confidenceLevel: number // 0-100, user's confidence
  errorPatterns: Map<string, number> // tracks common mistakes
  conceptMastery: Map<string, number> // mastery per concept
}

export interface LearningAnalytics {
  totalSessionTime: number
  sessionsCompleted: number
  averageSessionDuration: number
  peakPerformanceTime: string // time of day when user performs best
  weakAreas: string[] // topics/concepts needing improvement
  strongAreas: string[] // topics/concepts user excels at
  recommendedFocusAreas: string[]
  estimatedMasteryDate: number // when user will master current topic
  learningStyle: "fast-learner" | "steady-learner" | "struggling" // adaptive classification
}

export interface UserProgress {
  questionId: string
  attempts: number
  timeSpent: number
  correct: boolean
  submittedCode: string
  timestamp: number
  nextReviewDate?: number
  reviewCount: number
  difficulty: "easy" | "medium" | "hard"
  confidence: number // 0-100, user's confidence before attempt
  hintUsed: boolean
  hintCount: number
  conceptsInvolved: string[] // which concepts this question tests
  errorType?: string // type of error made (syntax, logic, edge-case, etc.)
  timeToFirstAttempt: number // time before first submission
  attemptSequence: Array<{ correct: boolean; timeSpent: number }> // all attempts
  solutionViewed: boolean
  solutionViewedAt?: number
}

export interface TopicStats {
  topicId: string
  questionsAttempted: number
  questionsCorrect: number
  averageAccuracy: number
  averageTimePerQuestion: number
  lastAttemptDate: number
  masteryLevel: number
  conceptBreakdown: Map<string, { attempted: number; correct: number }> // per-concept stats
  difficultyProgression: { easy: number; medium: number; hard: number } // questions per difficulty
  consistencyScore: number // 0-100, how consistent performance is
  improvementRate: number // percentage improvement over time
  estimatedTimeToMastery: number // milliseconds until mastery
  weakConcepts: string[]
  strongConcepts: string[]
}

export interface UserProfile {
  currentDifficulty: "easy" | "medium" | "hard"
  totalQuestionsAttempted: number
  correctAnswers: number
  averageTimePerQuestion: number
  progressHistory: UserProgress[]
  currentLearningPath: string
  topicsCompleted: string[]
  topicStats: Map<string, TopicStats>
  streakCount: number
  lastActivityDate: number
  totalTimeSpent: number
  performanceMetrics: PerformanceMetrics
  learningAnalytics: LearningAnalytics
  adaptiveLevel: number // 1-10, overall adaptive difficulty level
  learningStyle: "fast-learner" | "steady-learner" | "struggling"
  recommendedDailyGoal: number // questions per day
  lastAnalyticsUpdate: number
  customLearningPaths: LearningPath[]
  lastPathGenerationTime: number
}

export interface LearningPath {
  id: string
  name: string
  description: string
  topics: string[]
  isCustom: boolean
  estimatedHours: number
}

export interface Topic {
  id: string
  name: string
  description: string
  prerequisites: string[]
  subtopics: string[]
  estimatedHours: number
}
