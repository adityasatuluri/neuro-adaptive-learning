// Comprehensive testing framework for Neuro Adaptive Learning
import type { Question, UserProfile, LearningPath } from "./types"

export interface TestResult {
  testName: string
  passed: boolean
  duration: number
  error?: string
  details?: Record<string, any>
}

export interface TestSuite {
  name: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
  timestamp: number
}

export const validators = {
  isValidQuestion: (q: any): q is Question => {
    return (
      q.id &&
      q.topic &&
      q.difficulty &&
      ["easy", "medium", "hard"].includes(q.difficulty) &&
      q.title &&
      q.description &&
      Array.isArray(q.testCases) &&
      q.testCases.length > 0
    )
  },

  isValidLearningPath: (p: any): p is LearningPath => {
    return (
      p.id &&
      p.name &&
      p.description &&
      Array.isArray(p.topics) &&
      p.topics.length > 0 &&
      typeof p.estimatedHours === "number"
    )
  },

  isValidUserProfile: (profile: any): profile is UserProfile => {
    return (
      profile.currentDifficulty &&
      typeof profile.totalQuestionsAttempted === "number" &&
      typeof profile.correctAnswers === "number" &&
      Array.isArray(profile.progressHistory) &&
      profile.performanceMetrics &&
      profile.learningAnalytics
    )
  },

  isValidPerformanceMetrics: (metrics: any) => {
    return (
      typeof metrics.accuracy === "number" &&
      metrics.accuracy >= 0 &&
      metrics.accuracy <= 100 &&
      typeof metrics.speed === "number" &&
      typeof metrics.consistency === "number" &&
      typeof metrics.learningVelocity === "number"
    )
  },
}

export async function runTest(testName: string, testFn: () => Promise<void> | void): Promise<TestResult> {
  const startTime = performance.now()
  try {
    await testFn()
    const duration = performance.now() - startTime
    console.log(`[v0] ✓ ${testName} (${duration.toFixed(2)}ms)`)
    return { testName, passed: true, duration }
  } catch (error) {
    const duration = performance.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[v0] ✗ ${testName}: ${errorMessage}`)
    return { testName, passed: false, duration, error: errorMessage }
  }
}

export async function runTestSuite(suiteName: string, tests: Array<[string, () => Promise<void>]>): Promise<TestSuite> {
  console.log(`\n[v0] Running test suite: ${suiteName}`)
  const results: TestResult[] = []
  const startTime = performance.now()

  for (const [testName, testFn] of tests) {
    const result = await runTest(testName, testFn)
    results.push(result)
  }

  const totalDuration = performance.now() - startTime
  const passedTests = results.filter((r) => r.passed).length
  const failedTests = results.filter((r) => !r.passed).length

  const suite: TestSuite = {
    name: suiteName,
    tests: results,
    totalTests: results.length,
    passedTests,
    failedTests,
    totalDuration,
    timestamp: Date.now(),
  }

  console.log(`[v0] Suite complete: ${passedTests}/${results.length} passed (${totalDuration.toFixed(2)}ms)`)
  return suite
}

export const assert = {
  equal: (actual: any, expected: any, message?: string) => {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`)
    }
  },

  deepEqual: (actual: any, expected: any, message?: string) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Objects not equal: ${JSON.stringify(actual)} vs ${JSON.stringify(expected)}`)
    }
  },

  isTrue: (value: any, message?: string) => {
    if (!value) {
      throw new Error(message || `Expected true, got ${value}`)
    }
  },

  isFalse: (value: any, message?: string) => {
    if (value) {
      throw new Error(message || `Expected false, got ${value}`)
    }
  },

  isNull: (value: any, message?: string) => {
    if (value !== null) {
      throw new Error(message || `Expected null, got ${value}`)
    }
  },

  isNotNull: (value: any, message?: string) => {
    if (value === null) {
      throw new Error(message || `Expected non-null value`)
    }
  },

  throws: async (fn: () => Promise<void> | void, message?: string) => {
    try {
      await fn()
      throw new Error(message || "Expected function to throw")
    } catch (error) {
      // Expected
    }
  },

  inRange: (value: number, min: number, max: number, message?: string) => {
    if (value < min || value > max) {
      throw new Error(message || `Expected ${value} to be between ${min} and ${max}`)
    }
  },
}
