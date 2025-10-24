// AI-powered test data generator for comprehensive testing
import type { Question, UserProfile, UserProgress } from "./types"

export class TestDataGenerator {
  static generateMockQuestion(overrides?: Partial<Question>): Question {
    const id = overrides?.id || `q-${Math.random().toString(36).substr(2, 9)}`
    return {
      id,
      topic: overrides?.topic || "basics",
      subtopic: overrides?.subtopic || "variables",
      difficulty: overrides?.difficulty || "easy",
      title: overrides?.title || "Sample Question",
      description: overrides?.description || "This is a sample question for testing",
      type: overrides?.type || "code-writing",
      starterCode: overrides?.starterCode || "# Write your code here\n",
      testCases: overrides?.testCases || [
        { input: "5", expectedOutput: "5" },
        { input: "10", expectedOutput: "10" },
      ],
      expectedOutput: overrides?.expectedOutput || "5",
      hints: overrides?.hints || ["Hint 1", "Hint 2"],
      prerequisites: overrides?.prerequisites || [],
      estimatedTime: overrides?.estimatedTime || 300,
      tags: overrides?.tags || ["test", "sample"],
    }
  }

  static generateMockProfile(performanceLevel: "beginner" | "intermediate" | "advanced" = "beginner"): UserProfile {
    const baseProfile: UserProfile = {
      currentDifficulty:
        performanceLevel === "beginner" ? "easy" : performanceLevel === "intermediate" ? "medium" : "hard",
      totalQuestionsAttempted: 0,
      correctAnswers: 0,
      averageTimePerQuestion: 0,
      progressHistory: [],
      currentLearningPath: "python-basics",
      topicsCompleted: [],
      topicStats: new Map(),
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
        estimatedMasteryDate: Date.now(),
        learningStyle: "steady-learner",
      },
      adaptiveLevel: performanceLevel === "beginner" ? 1 : performanceLevel === "intermediate" ? 5 : 9,
      learningStyle: "steady-learner",
      recommendedDailyGoal: 5,
      lastAnalyticsUpdate: Date.now(),
      customLearningPaths: [],
      lastPathGenerationTime: Date.now(),
    }

    // Populate with sample progress based on performance level
    const questionCount = performanceLevel === "beginner" ? 5 : performanceLevel === "intermediate" ? 15 : 30
    const accuracyRate = performanceLevel === "beginner" ? 0.6 : performanceLevel === "intermediate" ? 0.75 : 0.9

    for (let i = 0; i < questionCount; i++) {
      const isCorrect = Math.random() < accuracyRate
      const progress: UserProgress = {
        questionId: `q-${i}`,
        attempts: Math.floor(Math.random() * 3) + 1,
        timeSpent: Math.floor(Math.random() * 600) + 60,
        correct: isCorrect,
        submittedCode: "# sample code",
        timestamp: Date.now() - Math.random() * 86400000,
        reviewCount: Math.floor(Math.random() * 3),
        difficulty: baseProfile.currentDifficulty,
        confidence: Math.floor(Math.random() * 100),
        hintUsed: Math.random() < 0.3,
        hintCount: Math.floor(Math.random() * 3),
        conceptsInvolved: ["variables", "loops", "functions"],
        timeToFirstAttempt: Math.floor(Math.random() * 300),
        attemptSequence: [{ correct: isCorrect, timeSpent: Math.floor(Math.random() * 600) + 60 }],
      }
      baseProfile.progressHistory.push(progress)
    }

    baseProfile.totalQuestionsAttempted = questionCount
    baseProfile.correctAnswers = Math.floor(questionCount * accuracyRate)
    baseProfile.totalTimeSpent = baseProfile.progressHistory.reduce((sum, p) => sum + p.timeSpent, 0)

    return baseProfile
  }

  static generateMockQuestionBatch(count = 5): Question[] {
    const difficulties: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"]
    const topics = ["basics", "loops", "functions", "data-structures", "algorithms"]
    const questions: Question[] = []

    for (let i = 0; i < count; i++) {
      const difficulty = difficulties[i % difficulties.length]
      const topic = topics[Math.floor(Math.random() * topics.length)]

      questions.push(
        this.generateMockQuestion({
          id: `q-batch-${i}`,
          difficulty,
          topic,
          title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Question ${i + 1}`,
        }),
      )
    }

    return questions
  }

  static generateEdgeCaseScenarios() {
    return {
      emptyProfile: this.generateMockProfile("beginner"),
      perfectPerformer: (() => {
        const profile = this.generateMockProfile("advanced")
        profile.progressHistory = profile.progressHistory.map((p) => ({ ...p, correct: true }))
        profile.correctAnswers = profile.totalQuestionsAttempted
        return profile
      })(),
      strugglingLearner: (() => {
        const profile = this.generateMockProfile("beginner")
        profile.progressHistory = profile.progressHistory.map((p) => ({ ...p, correct: false }))
        profile.correctAnswers = 0
        return profile
      })(),
      inconsistentPerformer: (() => {
        const profile = this.generateMockProfile("intermediate")
        profile.progressHistory = profile.progressHistory.map((p, i) => ({
          ...p,
          correct: i % 3 === 0,
        }))
        profile.correctAnswers = Math.floor(profile.totalQuestionsAttempted / 3)
        return profile
      })(),
    }
  }
}
