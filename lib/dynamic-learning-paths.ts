import type { UserProfile, LearningPath } from "./types";
import { generateLearningPath } from "./ollama-client";

export async function generatePersonalizedLearningPath(
  profile: UserProfile
): Promise<LearningPath | null> {
  // Determine user level based on current difficulty and accuracy
  let userLevel: "beginner" | "intermediate" | "advanced" = "beginner";
  if (
    profile.currentDifficulty === "medium" &&
    profile.performanceMetrics.accuracy > 70
  ) {
    userLevel = "intermediate";
  } else if (
    profile.currentDifficulty === "hard" &&
    profile.performanceMetrics.accuracy > 75
  ) {
    userLevel = "advanced";
  }

  // Get weak and strong areas from analytics
  const weakAreas = profile.learningAnalytics.weakAreas || [];
  const strongAreas = profile.learningAnalytics.strongAreas || [];

  console.log(
    " Generating personalized learning path for",
    userLevel,
    "learner"
  );
  console.log(" Weak areas:", weakAreas);
  console.log(" Strong areas:", strongAreas);

  const generatedPath = await generateLearningPath(
    userLevel,
    weakAreas,
    strongAreas
  );

  if (!generatedPath) {
    console.error(" Failed to generate learning path");
    return null;
  }

  // Convert generated path to LearningPath format
  const customPath: LearningPath = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: generatedPath.name,
    description: generatedPath.description,
    topics: generatedPath.topics,
    isCustom: true,
    estimatedHours: generatedPath.estimatedHours,
  };

  return customPath;
}

export function updateLearningPathBasedOnProgress(
  profile: UserProfile,
  currentPath: LearningPath
): LearningPath {
  // Reorder topics based on mastery levels
  const topicsWithMastery = currentPath.topics.map((topic) => ({
    topic,
    mastery: profile.topicStats.get(topic)?.masteryLevel || 0,
  }));

  // Sort: incomplete topics first, then by mastery level
  topicsWithMastery.sort((a, b) => {
    const aCompleted = profile.topicsCompleted.includes(a.topic);
    const bCompleted = profile.topicsCompleted.includes(b.topic);

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    return a.mastery - b.mastery;
  });

  return {
    ...currentPath,
    topics: topicsWithMastery.map((t) => t.topic),
  };
}

export function shouldRegenerateLearningPath(
  profile: UserProfile,
  lastPathGenerationTime: number
): boolean {
  // Regenerate path if:
  // 1. More than 7 days have passed
  // 2. User has completed a topic
  // 3. User's accuracy has changed significantly (>15%)

  const daysSinceGeneration =
    (Date.now() - lastPathGenerationTime) / (1000 * 60 * 60 * 24);

  if (daysSinceGeneration > 7) {
    console.log(" Regenerating path: 7+ days have passed");
    return true;
  }

  if (profile.topicsCompleted.length > 0) {
    console.log(" Regenerating path: topics completed");
    return true;
  }

  return false;
}
