// Validation schemas for testing and data integrity
import { z } from "zod"

export const QuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  subtopic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["code-writing", "code-completion", "debugging", "output-prediction"]),
  starterCode: z.string(),
  testCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
    }),
  ),
  expectedOutput: z.string(),
  hints: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
  estimatedTime: z.number().positive(),
  tags: z.array(z.string()),
})

export const PerformanceMetricsSchema = z.object({
  accuracy: z.number().min(0).max(100),
  speed: z.number().min(0),
  consistency: z.number().min(0).max(100),
  learningVelocity: z.number().min(-100).max(100),
  confidenceLevel: z.number().min(0).max(100),
  errorPatterns: z.map(z.string(), z.number()),
  conceptMastery: z.map(z.string(), z.number()),
})

export const LearningAnalyticsSchema = z.object({
  totalSessionTime: z.number().min(0),
  sessionsCompleted: z.number().min(0),
  averageSessionDuration: z.number().min(0),
  peakPerformanceTime: z.string(),
  weakAreas: z.array(z.string()),
  strongAreas: z.array(z.string()),
  recommendedFocusAreas: z.array(z.string()),
  estimatedMasteryDate: z.number(),
  learningStyle: z.enum(["fast-learner", "steady-learner", "struggling"]),
})

export const UserProfileSchema = z.object({
  currentDifficulty: z.enum(["easy", "medium", "hard"]),
  totalQuestionsAttempted: z.number().min(0),
  correctAnswers: z.number().min(0),
  averageTimePerQuestion: z.number().min(0),
  progressHistory: z.array(z.any()),
  currentLearningPath: z.string(),
  topicsCompleted: z.array(z.string()),
  topicStats: z.map(z.string(), z.any()),
  streakCount: z.number().min(0),
  lastActivityDate: z.number(),
  totalTimeSpent: z.number().min(0),
  performanceMetrics: PerformanceMetricsSchema,
  learningAnalytics: LearningAnalyticsSchema,
  adaptiveLevel: z.number().min(1).max(10),
  learningStyle: z.enum(["fast-learner", "steady-learner", "struggling"]),
  recommendedDailyGoal: z.number().min(1),
  lastAnalyticsUpdate: z.number(),
  customLearningPaths: z.array(z.any()),
  lastPathGenerationTime: z.number(),
})

export function validateQuestion(data: unknown) {
  return QuestionSchema.safeParse(data)
}

export function validatePerformanceMetrics(data: unknown) {
  return PerformanceMetricsSchema.safeParse(data)
}

export function validateUserProfile(data: unknown) {
  return UserProfileSchema.safeParse(data)
}
