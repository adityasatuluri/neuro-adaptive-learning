// Integration tests for complete learning flow
import { runTestSuite, assert, validators } from "./test-framework"
import { generatePersonalizedLearningPath, updateLearningPathBasedOnProgress } from "./dynamic-learning-paths"
import { calculatePerformanceMetrics, updateUserProfile } from "./adaptive-algorithm"
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

export async function runIntegrationTests() {
  return runTestSuite("Integration Tests", [
    [
      "Generate personalized learning path",
      async () => {
        const profile = createMockProfile()
        profile.learningAnalytics.weakAreas = ["loops", "functions"]
        profile.learningAnalytics.strongAreas = ["basics"]
        const path = await generatePersonalizedLearningPath(profile)
        assert.isNotNull(path, "Should generate learning path")
        assert.isTrue(validators.isValidLearningPath(path), "Path should be valid")
      },
    ],

    [
      "Update learning path based on progress",
      async () => {
        const profile = createMockProfile()
        profile.learningAnalytics.weakAreas = ["loops"]
        const path = await generatePersonalizedLearningPath(profile)
        if (path) {
          const updated = updateLearningPathBasedOnProgress(profile, path)
          assert.isTrue(validators.isValidLearningPath(updated), "Updated path should be valid")
        }
      },
    ],

    [
      "Complete learning flow: question -> answer -> metrics",
      () => {
        const profile = createMockProfile()
        const question = createMockQuestion()

        // Simulate multiple attempts
        let updated = profile
        for (let i = 0; i < 5; i++) {
          updated = updateUserProfile(updated, question, true, 120, "x = 5", 80)
        }

        const metrics = calculatePerformanceMetrics(updated)
        assert.isTrue(validators.isValidPerformanceMetrics(metrics), "Metrics should be valid")
        assert.isTrue(metrics.accuracy > 0, "Accuracy should be calculated")
      },
    ],

    [
      "Profile updates correctly after multiple questions",
      () => {
        const profile = createMockProfile()
        const q1 = createMockQuestion()
        const q2 = { ...createMockQuestion(), id: "q2", topic: "loops" }

        let updated = profile
        updated = updateUserProfile(updated, q1, true, 120, "code", 80)
        updated = updateUserProfile(updated, q2, true, 150, "code", 75)

        assert.equal(updated.totalQuestionsAttempted, 2, "Should track 2 attempts")
        assert.equal(updated.correctAnswers, 2, "Should track 2 correct answers")
        assert.isTrue(updated.topicStats.size > 0, "Should track topic stats")
      },
    ],
  ])
}
