// AI-powered tests for question and learning path generation
import { runTestSuite, assert, validators } from "./test-framework"
import { generateQuestionByDifficulty, generateLearningPath, generateQuestionsByBatch } from "./ollama-client"

export async function runAIGenerationTests() {
  return runTestSuite("AI Generation Tests", [
    [
      "Generate easy question",
      async () => {
        const question = await generateQuestionByDifficulty("easy", "basics")
        assert.isNotNull(question, "Question should not be null")
        assert.isTrue(validators.isValidQuestion(question), "Question should be valid")
        assert.equal(question?.difficulty, "easy", "Difficulty should be easy")
      },
    ],

    [
      "Generate medium question",
      async () => {
        const question = await generateQuestionByDifficulty("medium", "functions")
        assert.isNotNull(question, "Question should not be null")
        assert.isTrue(validators.isValidQuestion(question), "Question should be valid")
        assert.equal(question?.difficulty, "medium", "Difficulty should be medium")
      },
    ],

    [
      "Generate hard question",
      async () => {
        const question = await generateQuestionByDifficulty("hard", "algorithms")
        assert.isNotNull(question, "Question should not be null")
        assert.isTrue(validators.isValidQuestion(question), "Question should be valid")
        assert.equal(question?.difficulty, "hard", "Difficulty should be hard")
      },
    ],

    [
      "Generate learning path for beginner",
      async () => {
        const path = await generateLearningPath("beginner", ["loops", "functions"], ["basics"])
        assert.isNotNull(path, "Learning path should not be null")
        assert.isTrue(validators.isValidLearningPath(path), "Learning path should be valid")
        assert.equal(path?.topics.length > 0, true, "Path should have topics")
      },
    ],

    [
      "Generate learning path for intermediate",
      async () => {
        const path = await generateLearningPath("intermediate", ["oop"], ["functions", "loops"])
        assert.isNotNull(path, "Learning path should not be null")
        assert.isTrue(validators.isValidLearningPath(path), "Learning path should be valid")
      },
    ],

    [
      "Generate batch of questions",
      async () => {
        const questions = await generateQuestionsByBatch("easy", 3, "basics")
        assert.equal(questions.length, 3, "Should generate 3 questions")
        questions.forEach((q) => {
          assert.isTrue(validators.isValidQuestion(q), "Each question should be valid")
        })
      },
    ],

    [
      "Question has required fields",
      async () => {
        const question = await generateQuestionByDifficulty("medium")
        assert.isNotNull(question?.title, "Question should have title")
        assert.isNotNull(question?.description, "Question should have description")
        assert.isTrue(Array.isArray(question?.hints), "Question should have hints array")
        assert.isTrue(question?.hints.length > 0, "Question should have at least one hint")
        assert.isTrue(Array.isArray(question?.testCases), "Question should have test cases")
        assert.isTrue(question?.testCases.length > 0, "Question should have at least one test case")
      },
    ],

    [
      "Learning path has focus areas",
      async () => {
        const path = await generateLearningPath("beginner", ["loops"], [])
        assert.isTrue(Array.isArray(path?.focusAreas), "Path should have focus areas")
        assert.isTrue(path?.focusAreas.length > 0, "Path should have at least one focus area")
      },
    ],
  ])
}
