# RLAIEVAL Testing Guide

## Overview

This guide provides comprehensive instructions on how to conduct unit tests, integration tests, and performance tests for the RLAIEVAL system. The project includes a custom test framework (`test-framework.ts`) that provides utilities for running tests, assertions, and validation.

## Test Framework Architecture

### Core Components

1. **test-framework.ts** - Base testing utilities

   - `runTest()` - Execute individual tests with timing
   - `runTestSuite()` - Execute multiple tests and generate reports
   - `assert` - Assertion library with multiple validators
   - `validators` - Data validation helpers

2. **algorithm-tests.ts** - Adaptive algorithm tests
3. **integration-tests.ts** - End-to-end learning flow tests
4. **performance-tests.ts** - Performance and stress tests
5. **ai-tests.ts** - AI generation tests
6. **test-data-generator.ts** - Mock data generation

---

## 1. Unit Testing

### 1.1 Algorithm Correctness Tests

**Location:** `lib/algorithm-tests.ts`

#### Test Categories

**A. Performance Metrics Calculation**
\`\`\`typescript
// Test: Calculate performance metrics for empty profile

- Verify accuracy = 0 for new users
- Verify speed = 0 for new users
- Verify consistency = 0 for new users
- Verify learningVelocity = 0 for new users
  \`\`\`

**B. User Profile Updates**
\`\`\`typescript
// Test: Update profile with correct answer

- Increment correctAnswers by 1
- Increment totalQuestionsAttempted by 1
- Update progressHistory with new entry
- Recalculate performance metrics

// Test: Update profile with incorrect answer

- Keep correctAnswers unchanged
- Increment totalQuestionsAttempted by 1
- Update progressHistory with failure entry
- Adjust difficulty if needed
  \`\`\`

**C. Streak Calculations**
\`\`\`typescript
// Test: Winning streak multiplier

- 5 consecutive correct answers → multiplier > 1
- Verify multiplier increases with streak length
- Test streak reset on incorrect answer

// Test: Losing streak multiplier

- 3 consecutive incorrect answers → multiplier < 1
- Verify multiplier decreases with streak length
  \`\`\`

**D. Difficulty Progression**
\`\`\`typescript
// Test: Easy to Medium progression

- Accuracy ≥ 80% → suggest medium difficulty
- Verify after 10 correct answers

// Test: Maintain difficulty

- Inconsistent performance (50% accuracy) → stay at current level
- Verify after 10 mixed attempts

// Test: Regression to easier difficulty

- Accuracy < 60% → suggest easier difficulty
- Verify after 10 incorrect answers
  \`\`\`

#### Running Algorithm Tests

\`\`\`typescript
import { runAlgorithmTests } from "@/lib/algorithm-tests"

// In your test runner or page component
const results = await runAlgorithmTests()
console.log(`Passed: ${results.passedTests}/${results.totalTests}`)
\`\`\`

### 1.2 Data Persistence Tests

**Location:** `lib/storage.ts`

#### Test Cases

\`\`\`typescript
// Test: Save user profile to localStorage

- Verify profile is stored
- Verify data can be retrieved
- Verify data integrity after retrieval

// Test: Update existing profile

- Modify profile data
- Save to localStorage
- Verify changes persisted

// Test: Clear user data

- Save profile
- Clear data
- Verify localStorage is empty

// Test: Handle corrupted data

- Store invalid JSON
- Attempt to retrieve
- Verify graceful error handling
  \`\`\`

### 1.3 Question Selection Logic Tests

**Location:** `lib/adaptive-algorithm.ts` - `selectNextQuestion()`

#### Test Cases

\`\`\`typescript
// Test: Select question by difficulty

- Easy profile → select easy questions
- Medium profile → select medium questions
- Hard profile → select hard questions

// Test: Select question by weak areas

- Profile has weak areas → prioritize weak area questions
- Verify weak area questions appear first

// Test: Avoid repeated questions

- Select question
- Verify same question not selected immediately
- Verify question pool rotation

// Test: Balance between weak and strong areas

- 70% weak area questions
- 30% strong area questions
- Verify ratio maintained
  \`\`\`

### 1.4 Reinforcement Learning Tests

**Location:** `lib/reinforcement-learning.ts`

#### Test Cases

\`\`\`typescript
// Test: Q-value initialization

- New state → Q-value = 0
- Verify all actions initialized

// Test: Q-value updates

- Correct answer → Q-value increases
- Incorrect answer → Q-value decreases
- Verify update formula: Q = Q + α(r + γ\*maxQ' - Q)

// Test: Exploration vs Exploitation

- ε-greedy strategy with ε=0.1
- 90% exploitation, 10% exploration
- Verify action selection distribution

// Test: Reward calculation

- Correct + fast → high reward
- Correct + slow → medium reward
- Incorrect → negative reward
  \`\`\`

---

## 2. Integration Testing

### 2.1 End-to-End Learning Flow

**Location:** `lib/integration-tests.ts`

#### Test Scenario: Complete Learning Session

\`\`\`typescript
// Step 1: Generate personalized learning path

- Input: User profile with weak areas
- Output: Valid learning path
- Verify: Path focuses on weak areas

// Step 2: Generate question from path

- Input: Learning path
- Output: Question matching path difficulty
- Verify: Question topic in path

// Step 3: User submits answer

- Input: User code, test cases
- Output: Validation result
- Verify: Correct/incorrect determination

// Step 4: Update user profile

- Input: Validation result, time spent
- Output: Updated profile
- Verify: Metrics recalculated

// Step 5: Update learning path

- Input: Updated profile
- Output: Adjusted learning path
- Verify: Path reflects new performance
  \`\`\`

#### Running Integration Tests

\`\`\`typescript
import { runIntegrationTests } from "@/lib/integration-tests"

const results = await runIntegrationTests()
console.log(`Integration tests: ${results.passedTests}/${results.totalTests}`)
\`\`\`

### 2.2 Question Generation Pipeline

**Location:** `lib/ai-tests.ts`

#### Test Cases

\`\`\`typescript
// Test: Generate easy question

- Verify difficulty = "easy"
- Verify question has all required fields
- Verify test cases are valid

// Test: Generate medium question

- Verify difficulty = "medium"
- Verify complexity > easy questions
- Verify hints provided

// Test: Generate hard question

- Verify difficulty = "hard"
- Verify advanced concepts
- Verify multiple test cases

// Test: Generate batch of questions

- Generate 10 questions
- Verify all are valid
- Verify variety in topics
  \`\`\`

### 2.3 Code Validation Workflow

**Location:** `lib/ai-code-reviewer.ts`

#### Test Cases

\`\`\`typescript
// Test: Validate correct code

- Input: Correct solution
- Output: { isCorrect: true, score: 100 }
- Verify: All test cases pass

// Test: Validate incorrect code

- Input: Wrong solution
- Output: { isCorrect: false, score: < 100 }
- Verify: Specific test case failures identified

// Test: Validate partial solution

- Input: Partially correct code
- Output: { isCorrect: false, score: 50-99 }
- Verify: Feedback on failing test cases

// Test: Code review feedback

- Input: Correct but inefficient code
- Output: Feedback on optimization
- Verify: Suggestions provided
  \`\`\`

### 2.4 Analytics Calculation

**Location:** `lib/adaptive-algorithm.ts`

#### Test Cases

\`\`\`typescript
// Test: Calculate accuracy

- 8 correct out of 10 attempts → 80% accuracy
- Verify formula: (correctAnswers / totalAttempts) \* 100

// Test: Calculate speed

- Average time per question
- Verify: Faster = higher speed score

// Test: Calculate consistency

- Variance in performance
- Verify: Low variance = high consistency

// Test: Calculate learning velocity

- Rate of improvement over time
- Verify: Positive trend = positive velocity
  \`\`\`

---

## 3. Performance Testing

### 3.1 Question Loading Performance

**Location:** `lib/performance-tests.ts`

#### Benchmarks

\`\`\`typescript
// Test: Load 100 questions

- Target: < 5 seconds
- Measure: Time to load and parse
- Verify: No memory leaks

// Test: Load 1000 questions

- Target: < 30 seconds
- Measure: Memory usage
- Verify: Graceful degradation

// Test: Search questions by topic

- Target: < 500ms for 1000 questions
- Measure: Search algorithm efficiency
- Verify: Correct results returned
  \`\`\`

### 3.2 Metric Calculation Efficiency

**Location:** `lib/performance-tests.ts`

#### Benchmarks

\`\`\`typescript
// Test: Calculate metrics for profile with 100 attempts

- Target: < 100ms
- Measure: Calculation time
- Verify: Accurate results

// Test: Calculate metrics for profile with 1000 attempts

- Target: < 1000ms
- Measure: Scaling behavior
- Verify: O(n) or better complexity

// Test: Update profile with new attempt

- Target: < 50ms
- Measure: Update time
- Verify: Real-time responsiveness
  \`\`\`

### 3.3 RL Update Performance

**Location:** `lib/reinforcement-learning.ts`

#### Benchmarks

\`\`\`typescript
// Test: Update Q-values for 100 state-action pairs

- Target: < 100ms
- Measure: Update time
- Verify: No blocking operations

// Test: Select action from 1000 possible actions

- Target: < 50ms
- Measure: Selection time
- Verify: ε-greedy efficiency

// Test: Batch update 100 Q-values

- Target: < 200ms
- Measure: Batch operation time
- Verify: Vectorized operations
  \`\`\`

### 3.4 UI Responsiveness

**Location:** `components/advanced-code-editor.tsx`

#### Benchmarks

\`\`\`typescript
// Test: Render code editor with 1000 lines

- Target: < 500ms
- Measure: Render time
- Verify: Smooth scrolling

// Test: Syntax highlighting for large code

- Target: < 200ms
- Measure: Highlighting time
- Verify: No UI freezing

// Test: Update progress stats

- Target: < 100ms
- Measure: Update time
- Verify: Smooth animation
  \`\`\`

---

## 4. Running All Tests

### 4.1 Test Runner Setup

Create a test runner page at `app/test-runner/page.tsx`:

\`\`\`typescript
"use client"

import { useState } from "react"
import { runAlgorithmTests } from "@/lib/algorithm-tests"
import { runIntegrationTests } from "@/lib/integration-tests"
import { runPerformanceTests } from "@/lib/performance-tests"
import { runAIGenerationTests } from "@/lib/ai-tests"

export default function TestRunner() {
const [results, setResults] = useState<any>(null)
const [loading, setLoading] = useState(false)

const runAllTests = async () => {
setLoading(true)
try {
const algorithmResults = await runAlgorithmTests()
const integrationResults = await runIntegrationTests()
const performanceResults = await runPerformanceTests()
const aiResults = await runAIGenerationTests()

      setResults({
        algorithm: algorithmResults,
        integration: integrationResults,
        performance: performanceResults,
        ai: aiResults,
      })
    } catch (error) {
      console.error("Test error:", error)
    } finally {
      setLoading(false)
    }

}

return (
<div className="p-8">
<h1 className="text-3xl font-bold mb-4">RLAIEVAL Test Runner</h1>
<button
        onClick={runAllTests}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
{loading ? "Running Tests..." : "Run All Tests"}
</button>

      {results && (
        <div className="mt-8 space-y-4">
          {Object.entries(results).map(([name, suite]: [string, any]) => (
            <div key={name} className="border p-4 rounded">
              <h2 className="text-xl font-bold">{name}</h2>
              <p>Passed: {suite.passedTests}/{suite.totalTests}</p>
              <p>Duration: {suite.totalDuration.toFixed(2)}ms</p>
            </div>
          ))}
        </div>
      )}
    </div>

)
}
\`\`\`

### 4.2 Continuous Integration

Add to `package.json`:

\`\`\`json
{
"scripts": {
"test": "node scripts/run-tests.js",
"test:unit": "node scripts/run-unit-tests.js",
"test:integration": "node scripts/run-integration-tests.js",
"test:performance": "node scripts/run-performance-tests.js"
}
}
\`\`\`

---

## 5. Test Data Generation

### 5.1 Using TestDataGenerator

\`\`\`typescript
import { TestDataGenerator } from "@/lib/test-data-generator"

// Generate single mock question
const question = TestDataGenerator.generateMockQuestion({
difficulty: "medium",
topic: "loops"
})

// Generate mock profile
const profile = TestDataGenerator.generateMockProfile("intermediate")

// Generate batch of questions
const questions = TestDataGenerator.generateMockQuestionBatch(10)

// Generate edge case scenarios
const scenarios = TestDataGenerator.generateEdgeCaseScenarios()
// Returns: emptyProfile, perfectPerformer, strugglingLearner, inconsistentPerformer
\`\`\`

### 5.2 Edge Case Testing

\`\`\`typescript
// Test with perfect performer
const perfectProfile = scenarios.perfectPerformer
const metrics = calculatePerformanceMetrics(perfectProfile)
assert.equal(metrics.accuracy, 100)

// Test with struggling learner
const strugglingProfile = scenarios.strugglingLearner
const metrics2 = calculatePerformanceMetrics(strugglingProfile)
assert.equal(metrics2.accuracy, 0)

// Test with inconsistent performer
const inconsistentProfile = scenarios.inconsistentPerformer
const metrics3 = calculatePerformanceMetrics(inconsistentProfile)
assert.inRange(metrics3.accuracy, 20, 40)
\`\`\`

---

## 6. Debugging Tests

### 6.1 Enable Debug Logging

\`\`\`typescript
// In test files, use console.log with prefix
console.log(" Profile accuracy:", profile.performanceMetrics.accuracy)
console.log(" Selected question:", question.id)
console.log(" Q-value update:", { oldQ, newQ, reward })
\`\`\`

### 6.2 Inspect Test Results

\`\`\`typescript
// Print detailed test results
const suite = await runAlgorithmTests()
suite.tests.forEach(test => {
console.log(` ${test.testName}: ${test.passed ? "✓" : "✗"}`)
if (test.error) console.log(` Error: ${test.error}`)
if (test.details) console.log(` Details:`, test.details)
})
\`\`\`

---

## 7. Performance Benchmarking

### 7.1 Measure Execution Time

\`\`\`typescript
const startTime = performance.now()
// ... operation ...
const duration = performance.now() - startTime
console.log(` Operation took ${duration.toFixed(2)}ms`)
\`\`\`

### 7.2 Memory Profiling

\`\`\`typescript
// Check memory usage (Node.js)
if (typeof process !== 'undefined') {
const memUsage = process.memoryUsage()
console.log(` Memory: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`)
}
\`\`\`

---

## 8. Test Coverage Goals

| Category      | Target Coverage | Current |
| ------------- | --------------- | ------- |
| Algorithm     | 95%             | -       |
| Integration   | 85%             | -       |
| Performance   | 80%             | -       |
| AI Generation | 90%             | -       |
| **Overall**   | **90%**         | -       |

---

## 9. Troubleshooting

### Issue: Tests timeout

**Solution:** Increase timeout in test runner, check for blocking operations

### Issue: Flaky tests

**Solution:** Use fixed random seeds, avoid time-dependent assertions

### Issue: Memory leaks

**Solution:** Clear test data after each test, use `beforeEach`/`afterEach` hooks

### Issue: AI generation tests fail

**Solution:** Verify Ollama is running, check model availability

---

## 10. Best Practices

1. **Isolate tests** - Each test should be independent
2. **Use descriptive names** - Test names should explain what's being tested
3. **Test edge cases** - Empty data, extreme values, invalid inputs
4. **Mock external dependencies** - Don't rely on external APIs in unit tests
5. **Keep tests fast** - Unit tests should complete in milliseconds
6. **Document assumptions** - Explain why tests are written a certain way
7. **Review test coverage** - Regularly check which code paths are tested
8. **Update tests with code** - Keep tests in sync with implementation changes

---

## 11. Continuous Improvement

- Run tests before each commit
- Monitor test execution time trends
- Identify and fix flaky tests immediately
- Expand test coverage for new features
- Review test results in CI/CD pipeline
- Document test failures and resolutions
  \`\`\`

Now let me create an additional file with specific test examples for code validation and RL updates:
