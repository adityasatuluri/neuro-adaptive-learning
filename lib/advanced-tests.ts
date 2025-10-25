// Advanced tests for code validation and reinforcement learning
import { runTestSuite, assert } from "./test-framework"
import { validateCodeWithAI } from "./ai-code-reviewer"
import { updateQValue, selectAction, calculateReward } from "./reinforcement-learning"
import { TestDataGenerator } from "./test-data-generator"

export async function runCodeValidationTests() {
  return runTestSuite("Code Validation Tests", [
    [
      "Validate correct solution",
      async () => {
        const code = `
def add(a, b):
    return a + b
`
        const result = await validateCodeWithAI(code, "python")
        assert.isTrue(result.isCorrect, "Correct code should pass validation")
        assert.equal(result.score, 100, "Correct code should have 100 score")
      },
    ],

    [
      "Validate incorrect solution",
      async () => {
        const code = `
def add(a, b):
    return a - b
`
        const result = await validateCodeWithAI(code, "python")
        assert.isFalse(result.isCorrect, "Incorrect code should fail validation")
        assert.isTrue(result.score < 100, "Incorrect code should have < 100 score")
      },
    ],

    [
      "Validate partial solution",
      async () => {
        const code = `
def add(a, b):
    return a + b
    # Missing edge case handling
`
        const result = await validateCodeWithAI(code, "python")
        assert.isTrue(result.feedback, "Should provide feedback for partial solution")
        assert.inRange(result.score, 50, 99, "Partial solution should have 50-99 score")
      },
    ],

    [
      "Validate code with syntax error",
      async () => {
        const code = `
def add(a, b)
    return a + b
`
        const result = await validateCodeWithAI(code, "python")
        assert.isFalse(result.isCorrect, "Code with syntax error should fail")
        assert.isTrue(result.error, "Should report syntax error")
      },
    ],

    [
      "Validate code efficiency",
      async () => {
        const inefficientCode = `
def find_max(arr):
    max_val = arr[0]
    for i in range(len(arr)):
        for j in range(len(arr)):
            if arr[j] > max_val:
                max_val = arr[j]
    return max_val
`
        const result = await validateCodeWithAI(inefficientCode, "python")
        assert.isTrue(result.suggestions, "Should provide optimization suggestions")
        assert.isTrue(result.suggestions.includes("efficiency"), "Should mention efficiency")
      },
    ],

    [
      "Validate code readability",
      async () => {
        const poorReadabilityCode = `
def f(x):
    a=x*2
    b=a+1
    c=b*3
    return c
`
        const result = await validateCodeWithAI(poorReadabilityCode, "python")
        assert.isTrue(result.suggestions, "Should provide readability suggestions")
      },
    ],
  ])
}

export async function runRLUpdateTests() {
  return runTestSuite("Reinforcement Learning Update Tests", [
    [
      "Update Q-value with positive reward",
      () => {
        const state = "easy-variables"
        const action = "select-question"
        const reward = 10
        const alpha = 0.1
        const gamma = 0.9

        const oldQ = 5
        const maxNextQ = 8

        const newQ = updateQValue(oldQ, reward, maxNextQ, alpha, gamma)
        const expectedQ = oldQ + alpha * (reward + gamma * maxNextQ - oldQ)

        assert.equal(newQ, expectedQ, "Q-value should update correctly")
        assert.isTrue(newQ > oldQ, "Q-value should increase with positive reward")
      },
    ],

    [
      "Update Q-value with negative reward",
      () => {
        const oldQ = 5
        const reward = -5
        const maxNextQ = 3
        const alpha = 0.1
        const gamma = 0.9

        const newQ = updateQValue(oldQ, reward, maxNextQ, alpha, gamma)

        assert.isTrue(newQ < oldQ, "Q-value should decrease with negative reward")
      },
    ],

    [
      "Select action with exploitation",
      () => {
        const qValues = {
          easy: 10,
          medium: 5,
          hard: 3,
        }
        const epsilon = 0.0 // Pure exploitation

        const action = selectAction(qValues, epsilon)

        assert.equal(action, "easy", "Should select action with highest Q-value")
      },
    ],

    [
      "Select action with exploration",
      () => {
        const qValues = {
          easy: 10,
          medium: 5,
          hard: 3,
        }
        const epsilon = 1.0 // Pure exploration

        const action = selectAction(qValues, epsilon)

        assert.isTrue(Object.keys(qValues).includes(action), "Should select valid action")
        // With pure exploration, any action is possible
      },
    ],

    [
      "Calculate reward for correct fast answer",
      () => {
        const isCorrect = true
        const timeSpent = 60 // seconds
        const estimatedTime = 300 // seconds
        const confidence = 90

        const reward = calculateReward(isCorrect, timeSpent, estimatedTime, confidence)

        assert.isTrue(reward > 0, "Correct fast answer should have positive reward")
        assert.isTrue(reward > 5, "Correct fast answer should have high reward")
      },
    ],

    [
      "Calculate reward for correct slow answer",
      () => {
        const isCorrect = true
        const timeSpent = 600 // seconds
        const estimatedTime = 300 // seconds
        const confidence = 50

        const reward = calculateReward(isCorrect, timeSpent, estimatedTime, confidence)

        assert.isTrue(reward > 0, "Correct slow answer should have positive reward")
        assert.isTrue(reward < 5, "Correct slow answer should have lower reward than fast")
      },
    ],

    [
      "Calculate reward for incorrect answer",
      () => {
        const isCorrect = false
        const timeSpent = 120
        const estimatedTime = 300
        const confidence = 80

        const reward = calculateReward(isCorrect, timeSpent, estimatedTime, confidence)

        assert.isTrue(reward < 0, "Incorrect answer should have negative reward")
      },
    ],

    [
      "Batch Q-value updates",
      () => {
        const updates = [
          { state: "s1", action: "a1", reward: 10, maxNextQ: 8 },
          { state: "s2", action: "a2", reward: -5, maxNextQ: 3 },
          { state: "s3", action: "a3", reward: 5, maxNextQ: 6 },
        ]

        const qValues: Record<string, number> = {
          "s1-a1": 5,
          "s2-a2": 4,
          "s3-a3": 3,
        }

        const alpha = 0.1
        const gamma = 0.9

        updates.forEach((update) => {
          const key = `${update.state}-${update.action}`
          qValues[key] = updateQValue(qValues[key], update.reward, update.maxNextQ, alpha, gamma)
        })

        assert.isTrue(qValues["s1-a1"] > 5, "First Q-value should increase")
        assert.isTrue(qValues["s2-a2"] < 4, "Second Q-value should decrease")
        assert.isTrue(qValues["s3-a3"] > 3, "Third Q-value should increase")
      },
    ],

    [
      "Epsilon decay over time",
      () => {
        const initialEpsilon = 1.0
        const finalEpsilon = 0.01
        const episodes = 1000

        let epsilon = initialEpsilon
        for (let i = 0; i < episodes; i++) {
          epsilon = initialEpsilon * Math.exp(-i / (episodes / 5))
        }

        assert.isTrue(epsilon < initialEpsilon, "Epsilon should decrease")
        assert.isTrue(epsilon > finalEpsilon, "Epsilon should not go below final value")
      },
    ],
  ])
}

export async function runAdvancedIntegrationTests() {
  return runTestSuite("Advanced Integration Tests", [
    [
      "Complete RL learning cycle",
      async () => {
        const profile = TestDataGenerator.generateMockProfile("beginner")
        const question = TestDataGenerator.generateMockQuestion()

        // Step 1: Validate code
        const code = "x = 5"
        const validationResult = await validateCodeWithAI(code, "python")
        assert.isNotNull(validationResult, "Should validate code")

        // Step 2: Calculate reward
        const reward = calculateReward(validationResult.isCorrect, 120, 300, 80)
        assert.isTrue(typeof reward === "number", "Should calculate reward")

        // Step 3: Update Q-value
        const oldQ = 5
        const newQ = updateQValue(oldQ, reward, 8, 0.1, 0.9)
        assert.isTrue(typeof newQ === "number", "Should update Q-value")

        // Step 4: Select next action
        const qValues = { easy: newQ, medium: 3, hard: 1 }
        const nextAction = selectAction(qValues, 0.1)
        assert.isTrue(Object.keys(qValues).includes(nextAction), "Should select valid action")
      },
    ],

    [
      "Adaptive difficulty with RL",
      () => {
        const profile = TestDataGenerator.generateMockProfile("beginner")
        let currentDifficulty = "easy"

        // Simulate 20 attempts with improving performance
        for (let i = 0; i < 20; i++) {
          const isCorrect = i > 10 // Improve after 10 attempts
          const reward = calculateReward(isCorrect, 120, 300, 50 + i * 2)

          // Update Q-values for difficulty selection
          const qValues = {
            easy: 5 + (isCorrect ? 1 : -1),
            medium: 3 + (isCorrect ? 2 : -2),
            hard: 1,
          }

          // Select next difficulty
          currentDifficulty = selectAction(qValues, 0.1)
        }

        assert.isTrue(["easy", "medium", "hard"].includes(currentDifficulty), "Should select valid difficulty")
      },
    ],
  ])
}
