// Tests for adaptive algorithm functionality
import { runTestSuite, assert } from "./test-framework"
import {
  calculatePerformanceMetrics,
  calculateNextDifficulty,
  calculateStreakMultiplier,
  calculatePerformanceMomentum,
  updateUserProfile,
} from "./adaptive-algorithm"
import type { UserProfile, Question } from "./types"

function createMockProfile(): UserProfile {
  return {
    currentDifficulty: "easy",
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
    adaptiveLevel: 1,
    learningStyle: "steady-learner",
    recommendedDailyGoal: 5,
    lastAnalyticsUpdate: Date.now(),
    customLearningPaths: [],
    lastPathGenerationTime: Date.now(),
  }
}

function createMockQuestion(): Question {
  return {
    id: "q1",
    topic: "basics",
    subtopic: "variables",
    difficulty: "easy",
    title: "Variable Assignment",
    description: "Assign a value to a variable",
    type: "code-writing",
    starterCode: "x = ",
    testCases: [{ input: "", expectedOutput: "5" }],
    expectedOutput: "5",
    hints: ["Use the = operator"],
    estimatedTime: 300,
    tags: ["variables", "basics"],
  }
}

export async function runAlgorithmTests() {
  return runTestSuite("Adaptive Algorithm Tests", [
    [
      "Calculate performance metrics for empty profile",
      () => {
        const profile = createMockProfile()
        const metrics = calculatePerformanceMetrics(profile)
        assert.equal(metrics.accuracy, 0, "Empty profile should have 0 accuracy")
        assert.equal(metrics.speed, 0, "Empty profile should have 0 speed")
      },
    ],

    [
      "Update profile with correct answer",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        const updated = updateUserProfile(profile, question, true, 120, "x = 5", 80)
        assert.equal(updated.correctAnswers, 1, "Should increment correct answers")
        assert.equal(updated.totalQuestionsAttempted, 1, "Should increment total attempts")
      },
    ],

    [
      "Update profile with incorrect answer",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        const updated = updateUserProfile(profile, question, false, 180, "x = 10", 30)
        assert.equal(updated.correctAnswers, 0, "Should not increment correct answers")
        assert.equal(updated.totalQuestionsAttempted, 1, "Should increment total attempts")
      },
    ],

    [
      "Calculate streak multiplier for winning streak",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        let updated = profile
        for (let i = 0; i < 5; i++) {
          updated = updateUserProfile(updated, question, true, 120, "code", 80)
        }
        const multiplier = calculateStreakMultiplier(updated)
        assert.isTrue(multiplier > 1, "Winning streak should increase multiplier")
      },
    ],

    [
      "Calculate streak multiplier for losing streak",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        let updated = profile
        for (let i = 0; i < 3; i++) {
          updated = updateUserProfile(updated, question, false, 180, "code", 30)
        }
        const multiplier = calculateStreakMultiplier(updated)
        assert.isTrue(multiplier < 1, "Losing streak should decrease multiplier")
      },
    ],

    [
      "Calculate performance momentum",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        let updated = profile
        for (let i = 0; i < 10; i++) {
          updated = updateUserProfile(updated, question, i < 5 ? false : true, 120, "code", 50)
        }
        const momentum = calculatePerformanceMomentum(updated)
        assert.isTrue(momentum.trend === "improving", "Should detect improving trend")
      },
    ],

    [
      "Difficulty progression from easy to medium",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        let updated = profile
        for (let i = 0; i < 10; i++) {
          updated = updateUserProfile(updated, question, true, 120, "code", 90)
        }
        const nextDifficulty = calculateNextDifficulty(updated)
        assert.equal(nextDifficulty, "medium", "Should progress to medium difficulty")
      },
    ],

    [
      "Maintain difficulty with inconsistent performance",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()
        let updated = profile
        for (let i = 0; i < 10; i++) {
          updated = updateUserProfile(updated, question, i % 2 === 0, 120, "code", 50)
        }
        const nextDifficulty = calculateNextDifficulty(updated)
        assert.equal(nextDifficulty, "easy", "Should maintain easy difficulty")
      },
    ],
  ])
}
