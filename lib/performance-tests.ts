// Performance and stress tests
import { runTestSuite, assert } from "./test-framework";
import { TestDataGenerator } from "./test-data-generator";
import {
  calculatePerformanceMetrics,
  updateUserProfile,
} from "./adaptive-algorithm";

export async function runPerformanceTests() {
  return runTestSuite("Performance Tests", [
    [
      "Handle 100 question attempts efficiently",
      () => {
        const profile = TestDataGenerator.generateMockProfile("intermediate");
        const startTime = performance.now();

        for (let i = 0; i < 100; i++) {
          const question = TestDataGenerator.generateMockQuestion();
          updateUserProfile(
            profile,
            question,
            Math.random() > 0.3,
            120,
            "code",
            70
          );
        }

        const duration = performance.now() - startTime;
        console.log(` Processed 100 questions in ${duration.toFixed(2)}ms`);
        assert.isTrue(
          duration < 5000,
          "Should process 100 questions in under 5 seconds"
        );
      },
    ],

    [
      "Calculate metrics for large profile",
      () => {
        const profile = TestDataGenerator.generateMockProfile("advanced");
        const startTime = performance.now();

        const metrics = calculatePerformanceMetrics(profile);

        const duration = performance.now() - startTime;
        console.log(` Calculated metrics in ${duration.toFixed(2)}ms`);
        assert.isTrue(
          duration < 1000,
          "Should calculate metrics in under 1 second"
        );
      },
    ],

    [
      "Generate batch of 10 mock questions",
      () => {
        const startTime = performance.now();
        const questions = TestDataGenerator.generateMockQuestionBatch(10);
        const duration = performance.now() - startTime;

        assert.equal(questions.length, 10, "Should generate 10 questions");
        console.log(` Generated 10 questions in ${duration.toFixed(2)}ms`);
      },
    ],
  ]);
}
