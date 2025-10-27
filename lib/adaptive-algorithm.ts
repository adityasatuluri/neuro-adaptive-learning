import type {
  UserProfile,
  Question,
  PerformanceMetrics,
  LearningAnalytics,
} from "./types";
import { getCachedAIQuestions } from "./storage";
import { getCachedCSVQuestions } from "./csv-loader";
import {
  getCurrentState,
  calculateReward,
  selectAction,
  updateQValue,
  loadRLMetrics,
  saveRLMetrics,
  decayExplorationRate,
} from "./reinforcement-learning";
import { addAnsweredQuestion } from "./question-store";
import {
  trackWrongSubmission,
  resetWrongSubmissionStreak,
} from "./wrong-submission-handler";

const SPACED_REPETITION_INTERVALS = [
  { days: 0.5, name: "30 minutes" },
  { days: 1, name: "1 day" },
  { days: 3, name: "3 days" },
  { days: 7, name: "1 week" },
  { days: 14, name: "2 weeks" },
  { days: 30, name: "1 month" },
  { days: 90, name: "3 months" },
];

const DIFFICULTY_THRESHOLDS = {
  easyToMedium: { accuracy: 0.85, speed: 0.8, consistency: 0.75 },
  mediumToHard: { accuracy: 0.8, speed: 0.75, consistency: 0.7 },
  hardToExpert: { accuracy: 0.9, speed: 0.9, consistency: 0.85 },
  downgrade: { accuracy: 0.5, speed: 0.3 },
};

export function calculatePerformanceMomentum(
  profile: UserProfile,
  topicId?: string
): {
  momentum: number;
  trend: "improving" | "declining" | "stable";
  recentAccuracy: number;
  previousAccuracy: number;
} {
  const recentAttempts = profile.progressHistory.slice(-30);
  const topicAttempts = topicId
    ? recentAttempts.filter((p) => {
        const question = profile.progressHistory.find(
          (h) => h.questionId === p.questionId
        );
        return question?.difficulty !== undefined;
      })
    : recentAttempts;

  if (topicAttempts.length < 5) {
    return {
      momentum: 0,
      trend: "stable",
      recentAccuracy: 0,
      previousAccuracy: 0,
    };
  }

  const midpoint = Math.floor(topicAttempts.length / 2);
  const firstHalf = topicAttempts.slice(0, midpoint);
  const secondHalf = topicAttempts.slice(midpoint);

  const firstHalfAccuracy =
    (firstHalf.filter((a) => a.correct).length / firstHalf.length) * 100;
  const secondHalfAccuracy =
    (secondHalf.filter((a) => a.correct).length / secondHalf.length) * 100;

  const momentum = secondHalfAccuracy - firstHalfAccuracy;
  let trend: "improving" | "declining" | "stable" = "stable";

  if (momentum > 10) trend = "improving";
  else if (momentum < -10) trend = "declining";

  return {
    momentum,
    trend,
    recentAccuracy: secondHalfAccuracy,
    previousAccuracy: firstHalfAccuracy,
  };
}

export function calculateStreakMultiplier(profile: UserProfile): number {
  const recentAttempts = profile.progressHistory.slice(-10);
  if (recentAttempts.length === 0) return 1;

  let currentStreak = 0;
  for (let i = recentAttempts.length - 1; i >= 0; i--) {
    if (recentAttempts[i].correct) {
      currentStreak++;
    } else {
      break;
    }
  }

  if (currentStreak >= 5) return 1.3;
  if (currentStreak >= 3) return 1.15;
  if (currentStreak >= 1) return 1.05;

  let losingStreak = 0;
  for (let i = recentAttempts.length - 1; i >= 0; i--) {
    if (!recentAttempts[i].correct) {
      losingStreak++;
    } else {
      break;
    }
  }

  if (losingStreak >= 3) return 0.7;
  if (losingStreak >= 2) return 0.85;

  return 1;
}

export function calculateTimeBasedDifficultyAdjustment(
  profile: UserProfile,
  topicId?: string
): number {
  const recentAttempts = profile.progressHistory.slice(-20);
  if (recentAttempts.length < 5) return 1;

  const avgTimePerQuestion =
    recentAttempts.reduce((sum, a) => sum + a.timeSpent, 0) /
    recentAttempts.length;
  const estimatedTime = 600;

  if (avgTimePerQuestion > estimatedTime * 2) return 0.8;
  if (avgTimePerQuestion > estimatedTime * 1.5) return 0.9;

  const recentCorrect = recentAttempts.filter((a) => a.correct).length;
  if (
    recentCorrect / recentAttempts.length > 0.8 &&
    avgTimePerQuestion < estimatedTime * 0.7
  ) {
    return 1.2;
  }

  return 1;
}

export function calculateConfidenceBasedAdjustment(
  profile: UserProfile
): number {
  const recentAttempts = profile.progressHistory.slice(-10);
  if (recentAttempts.length === 0) return 1;

  const avgConfidence =
    recentAttempts.reduce((sum, a) => sum + a.confidence, 0) /
    recentAttempts.length;

  if (avgConfidence < 30) return 0.75;
  if (avgConfidence < 50) return 0.9;

  if (avgConfidence > 80) return 1.2;
  if (avgConfidence > 70) return 1.1;

  return 1;
}

export function calculatePerformanceMetrics(
  profile: UserProfile,
  topicId?: string
): PerformanceMetrics {
  const recentAttempts = profile.progressHistory.slice(-50);
  const topicAttempts = topicId
    ? profile.progressHistory.filter((p) => {
        const stats = profile.topicStats.get(topicId);
        return stats !== undefined;
      })
    : recentAttempts;

  if (topicAttempts.length === 0) {
    return {
      accuracy: 0,
      speed: 0,
      consistency: 0,
      learningVelocity: 0,
      confidenceLevel: 50,
      errorPatterns: new Map(),
      conceptMastery: new Map(),
    };
  }

  const correctCount = topicAttempts.filter((a) => a.correct).length;
  const accuracy = (correctCount / topicAttempts.length) * 100;

  const totalTime = topicAttempts.reduce((sum, a) => sum + a.timeSpent, 0);
  const speed = (topicAttempts.length / (totalTime / 3600)) * 100;

  const recentWindows = [];
  for (let i = 0; i < topicAttempts.length; i += 10) {
    const window = topicAttempts.slice(i, i + 10);
    const windowAccuracy =
      (window.filter((a) => a.correct).length / window.length) * 100;
    recentWindows.push(windowAccuracy);
  }
  const avgAccuracy =
    recentWindows.reduce((a, b) => a + b, 0) / recentWindows.length;
  const variance =
    recentWindows.reduce(
      (sum, acc) => sum + Math.pow(acc - avgAccuracy, 2),
      0
    ) / recentWindows.length;
  const consistency = Math.max(0, 100 - Math.sqrt(variance));

  const firstHalf = topicAttempts.slice(
    0,
    Math.floor(topicAttempts.length / 2)
  );
  const secondHalf = topicAttempts.slice(Math.floor(topicAttempts.length / 2));
  const firstHalfAccuracy =
    (firstHalf.filter((a) => a.correct).length / firstHalf.length) * 100;
  const secondHalfAccuracy =
    (secondHalf.filter((a) => a.correct).length / secondHalf.length) * 100;
  const learningVelocity = Math.max(
    -100,
    Math.min(100, secondHalfAccuracy - firstHalfAccuracy)
  );

  const errorPatterns = new Map<string, number>();
  topicAttempts.forEach((attempt) => {
    if (!attempt.correct && attempt.errorType) {
      errorPatterns.set(
        attempt.errorType,
        (errorPatterns.get(attempt.errorType) || 0) + 1
      );
    }
  });

  const conceptMastery = new Map<string, number>();
  topicAttempts.forEach((attempt) => {
    attempt.conceptsInvolved?.forEach((concept) => {
      const current = conceptMastery.get(concept) || { correct: 0, total: 0 };
      current.total += 1;
      if (attempt.correct) current.correct += 1;
      conceptMastery.set(
        concept,
        ((current.correct / current.total) * 100) as any
      );
    });
  });

  return {
    accuracy: Math.min(100, accuracy),
    speed: Math.min(100, speed),
    consistency: Math.min(100, consistency),
    learningVelocity: Math.min(100, Math.max(-100, learningVelocity)),
    confidenceLevel: topicAttempts[topicAttempts.length - 1]?.confidence || 50,
    errorPatterns,
    conceptMastery,
  };
}

export function calculateLearningAnalytics(
  profile: UserProfile
): LearningAnalytics {
  const metrics = calculatePerformanceMetrics(profile);
  const allAttempts = profile.progressHistory;

  let learningStyle: "fast-learner" | "steady-learner" | "struggling" =
    "steady-learner";
  if (metrics.learningVelocity > 20 && metrics.accuracy > 75) {
    learningStyle = "fast-learner";
  } else if (metrics.accuracy < 50) {
    learningStyle = "struggling";
  }

  const allTags = new Map<string, number>();
  allAttempts.forEach((attempt) => {
    const tagKey = attempt.title || "unknown";
    allTags.set(tagKey, (allTags.get(tagKey) || 0) + (attempt.correct ? 1 : 0));
  });

  const tagPerformance = Array.from(profile.topicStats.entries()).map(
    ([topicId, stats]) => ({
      topicId,
      accuracy: stats.averageAccuracy,
    })
  );
  tagPerformance.sort((a, b) => a.accuracy - b.accuracy);

  const weakAreas = tagPerformance
    .slice(0, 3)
    .map((t) => t.topicId)
    .filter(Boolean);
  const strongAreas = tagPerformance
    .slice(-3)
    .map((t) => t.topicId)
    .filter(Boolean);

  const sessions = new Map<string, number>();
  allAttempts.forEach((attempt) => {
    const date = new Date(attempt.timestamp).toDateString();
    sessions.set(date, (sessions.get(date) || 0) + 1);
  });

  const avgSessionDuration =
    allAttempts.length > 0 ? profile.totalTimeSpent / sessions.size : 0;

  const currentTopic = profile.currentLearningPath;
  const topicStats = profile.topicStats.get(currentTopic);
  let estimatedMasteryDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
  if (topicStats && metrics.learningVelocity > 0) {
    const remainingAccuracy = 100 - topicStats.averageAccuracy;
    const daysNeeded = remainingAccuracy / (metrics.learningVelocity || 1);
    estimatedMasteryDate = Date.now() + daysNeeded * 24 * 60 * 60 * 1000;
  }

  return {
    totalSessionTime: profile.totalTimeSpent,
    sessionsCompleted: sessions.size,
    averageSessionDuration: avgSessionDuration,
    peakPerformanceTime: "afternoon",
    weakAreas,
    strongAreas,
    recommendedFocusAreas: weakAreas,
    estimatedMasteryDate,
    learningStyle,
  };
}

export function calculateNextDifficultyWithRL(
  profile: UserProfile,
  topicId: string
): "easy" | "medium" | "hard" {
  const metrics = calculatePerformanceMetrics(profile);
  const recentAttempts = profile.progressHistory.slice(-20);

  if (recentAttempts.length < 5) {
    return "easy";
  }

  const rlMetrics = loadRLMetrics();
  const currentState = getCurrentState(profile, topicId);

  const action = selectAction(
    rlMetrics.qTable,
    currentState,
    rlMetrics.explorationRate
  );

  let nextDifficulty = profile.currentDifficulty;

  if (action === "upgrade") {
    if (profile.currentDifficulty === "easy") nextDifficulty = "medium";
    else if (profile.currentDifficulty === "medium") nextDifficulty = "hard";
  } else if (action === "downgrade") {
    if (profile.currentDifficulty === "hard") nextDifficulty = "medium";
    else if (profile.currentDifficulty === "medium") nextDifficulty = "easy";
  }

  return nextDifficulty;
}

export function calculateNextDifficulty(
  profile: UserProfile
): "easy" | "medium" | "hard" {
  const metrics = calculatePerformanceMetrics(profile);
  const recentAttempts = profile.progressHistory.slice(-20);

  if (recentAttempts.length < 5) {
    return "easy";
  }

  const currentDifficulty = profile.currentDifficulty;

  const accuracyScore = metrics.accuracy / 100;
  const speedScore = metrics.speed / 100;
  const consistencyScore = metrics.consistency / 100;
  const velocityScore = Math.max(0, metrics.learningVelocity / 100);

  const baseScore =
    accuracyScore * 0.4 +
    speedScore * 0.2 +
    consistencyScore * 0.25 +
    velocityScore * 0.15;

  const streakMultiplier = calculateStreakMultiplier(profile);
  const timeMultiplier = calculateTimeBasedDifficultyAdjustment(profile);
  const confidenceMultiplier = calculateConfidenceBasedAdjustment(profile);

  const adjustedScore =
    baseScore * streakMultiplier * timeMultiplier * confidenceMultiplier;

  console.log(
    "[v0] Difficulty calculation - Base:",
    baseScore.toFixed(2),
    "Streak:",
    streakMultiplier.toFixed(2),
    "Time:",
    timeMultiplier.toFixed(2),
    "Confidence:",
    confidenceMultiplier.toFixed(2),
    "Final:",
    adjustedScore.toFixed(2)
  );

  if (currentDifficulty === "easy") {
    if (adjustedScore >= 0.8) return "medium";
  } else if (currentDifficulty === "medium") {
    if (adjustedScore >= 0.85) return "hard";
    if (adjustedScore < 0.55) return "easy";
  } else if (currentDifficulty === "hard") {
    if (adjustedScore < 0.6) return "medium";
  }

  return currentDifficulty;
}

export function calculateNextReviewDate(
  reviewCount: number,
  metrics?: PerformanceMetrics
): number {
  const baseInterval =
    SPACED_REPETITION_INTERVALS[
      Math.min(reviewCount, SPACED_REPETITION_INTERVALS.length - 1)
    ];

  let multiplier = 1;
  if (metrics) {
    if (metrics.accuracy > 90) multiplier = 1.5;
    if (metrics.accuracy < 60) multiplier = 0.5;
  }

  const days = baseInterval.days * multiplier;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

export function selectNextQuestion(
  questions: Question[],
  profile: UserProfile,
  currentTopic: string
): Question | null {
  const now = Date.now();
  const metrics = calculatePerformanceMetrics(profile, currentTopic);

  const csvQuestions = getCachedCSVQuestions();

  const allQuestions = [
    ...questions,
    ...csvQuestions,
    ...getCachedAIQuestions(profile.currentDifficulty),
  ];

  const dueForReview = profile.progressHistory.filter(
    (p) =>
      p.nextReviewDate &&
      p.nextReviewDate <= now &&
      allQuestions.find((q) => q.id === p.questionId)?.topic === currentTopic
  );

  if (dueForReview.length > 0) {
    const sorted = dueForReview.sort((a, b) => {
      const aConceptMastery =
        Array.from(metrics.conceptMastery.values()).reduce((a, b) => a + b, 0) /
          metrics.conceptMastery.size || 0;
      const bConceptMastery =
        Array.from(metrics.conceptMastery.values()).reduce((a, b) => a + b, 0) /
          metrics.conceptMastery.size || 0;
      return aConceptMastery - bConceptMastery;
    });
    const questionId = sorted[0].questionId;
    const question = allQuestions.find((q) => q.id === questionId);
    if (question) return question;
  }

  const weakConcepts = Array.from(metrics.conceptMastery.entries())
    .filter(([_, mastery]) => mastery < 70)
    .map(([concept]) => concept);

  if (weakConcepts.length > 0) {
    const targetedQuestions = allQuestions.filter(
      (q) =>
        q.topic === currentTopic &&
        q.difficulty === profile.currentDifficulty &&
        !profile.progressHistory.some((p) => p.questionId === q.id) &&
        q.tags?.some((tag) => weakConcepts.includes(tag))
    );
    if (targetedQuestions.length > 0) {
      return targetedQuestions[
        Math.floor(Math.random() * targetedQuestions.length)
      ];
    }
  }

  const availableQuestions = allQuestions.filter(
    (q) =>
      q.topic === currentTopic &&
      q.difficulty === profile.currentDifficulty &&
      !profile.progressHistory.some((p) => p.questionId === q.id)
  );

  if (availableQuestions.length > 0) {
    return availableQuestions[
      Math.floor(Math.random() * availableQuestions.length)
    ];
  }

  return (
    allQuestions.find(
      (q) =>
        q.topic === currentTopic &&
        !profile.progressHistory.some((p) => p.questionId === q.id)
    ) || null
  );
}

export function selectRandomQuestionSameDifficulty(
  questions: Question[],
  profile: UserProfile,
  currentTopic: string,
  excludeQuestionId: string
): Question | null {
  const csvQuestions = getCachedCSVQuestions();

  const allQuestions = [
    ...questions,
    ...csvQuestions,
    ...getCachedAIQuestions(profile.currentDifficulty),
  ];

  const availableQuestions = allQuestions.filter(
    (q) =>
      q.topic === currentTopic &&
      q.difficulty === profile.currentDifficulty &&
      q.id !== excludeQuestionId
  );

  if (availableQuestions.length > 0) {
    return availableQuestions[
      Math.floor(Math.random() * availableQuestions.length)
    ];
  }

  return null;
}

export function updateUserProfile(
  profile: UserProfile,
  question: Question,
  isCorrect: boolean,
  timeSpent: number,
  submittedCode: string,
  confidence = 50,
  errorType?: string,
  conceptsInvolved: string[] = [],
  solutionViewed = false,
  title?: string
): UserProfile {
  const updatedProfile = { ...profile };

  const existingProgress = updatedProfile.progressHistory.find(
    (p) => p.questionId === question.id
  );

  if (isCorrect) {
    addAnsweredQuestion(question, existingProgress?.attempts || 1, true);
    resetWrongSubmissionStreak(question.id);

    if (existingProgress) {
      existingProgress.attempts += 1;
      existingProgress.timeSpent = (existingProgress.timeSpent + timeSpent) / 2;
      existingProgress.correct = isCorrect;
      existingProgress.submittedCode = submittedCode;
      existingProgress.timestamp = Date.now();
      existingProgress.reviewCount += 1;
      existingProgress.confidence = confidence;
      existingProgress.conceptsInvolved = conceptsInvolved;
      existingProgress.solutionViewed = solutionViewed;
      existingProgress.title = title || existingProgress.title;
      if (solutionViewed) {
        existingProgress.solutionViewedAt = Date.now();
      }
      const metrics = calculatePerformanceMetrics(updatedProfile);
      existingProgress.nextReviewDate = calculateNextReviewDate(
        existingProgress.reviewCount,
        metrics
      );
    } else {
      updatedProfile.progressHistory.push({
        questionId: question.id,
        title: title || question.title,
        attempts: 1,
        timeSpent,
        correct: isCorrect,
        submittedCode,
        timestamp: Date.now(),
        nextReviewDate: calculateNextReviewDate(0),
        reviewCount: 0,
        difficulty: question.difficulty,
        confidence,
        hintUsed: false,
        hintCount: 0,
        conceptsInvolved,
        timeToFirstAttempt: timeSpent,
        attemptSequence: [{ correct: isCorrect, timeSpent }],
        solutionViewed,
        solutionViewedAt: solutionViewed ? Date.now() : undefined,
      });
    }

    updatedProfile.totalQuestionsAttempted += 1;
    updatedProfile.correctAnswers += 1;
    updatedProfile.totalTimeSpent += timeSpent;

    const topicId = question.topic;
    const topicStats = updatedProfile.topicStats.get(topicId) || {
      topicId,
      questionsAttempted: 0,
      questionsCorrect: 0,
      averageAccuracy: 0,
      averageTimePerQuestion: 0,
      lastAttemptDate: Date.now(),
      masteryLevel: 0,
      conceptBreakdown: new Map(),
      difficultyProgression: { easy: 0, medium: 0, hard: 0 },
      consistencyScore: 0,
      improvementRate: 0,
      estimatedTimeToMastery: 30 * 24 * 60 * 60 * 1000,
      weakConcepts: [],
      strongConcepts: [],
    };

    topicStats.questionsAttempted += 1;
    topicStats.questionsCorrect += 1;
    topicStats.averageAccuracy =
      (topicStats.questionsCorrect / topicStats.questionsAttempted) * 100;
    topicStats.averageTimePerQuestion =
      (topicStats.averageTimePerQuestion * (topicStats.questionsAttempted - 1) +
        timeSpent) /
      topicStats.questionsAttempted;
    topicStats.lastAttemptDate = Date.now();
    topicStats.masteryLevel = Math.min(100, topicStats.averageAccuracy * 1.2);
    topicStats.difficultyProgression[question.difficulty] += 1;

    conceptsInvolved.forEach((concept) => {
      const current = topicStats.conceptBreakdown.get(concept) || {
        attempted: 0,
        correct: 0,
      };
      current.attempted += 1;
      current.correct += 1;
      topicStats.conceptBreakdown.set(concept, current);
    });

    updatedProfile.topicStats.set(topicId, topicStats);

    updatedProfile.currentDifficulty = calculateNextDifficulty(updatedProfile);
    updatedProfile.performanceMetrics =
      calculatePerformanceMetrics(updatedProfile);
    updatedProfile.learningAnalytics =
      calculateLearningAnalytics(updatedProfile);
    updatedProfile.lastAnalyticsUpdate = Date.now();
  } else {
    trackWrongSubmission(question.id, errorType || "unknown", timeSpent);

    updatedProfile.totalQuestionsAttempted += 1;
    updatedProfile.totalTimeSpent += timeSpent;

    if (existingProgress) {
      existingProgress.attempts += 1;
      existingProgress.attemptSequence.push({ correct: false, timeSpent });
      existingProgress.errorType = errorType;
      existingProgress.timestamp = Date.now();
      existingProgress.solutionViewed = solutionViewed;
      existingProgress.title = title || existingProgress.title;
      if (solutionViewed) {
        existingProgress.solutionViewedAt = Date.now();
      }
    } else {
      updatedProfile.progressHistory.push({
        questionId: question.id,
        title: title || question.title,
        attempts: 1,
        timeSpent,
        correct: false,
        submittedCode,
        timestamp: Date.now(),
        reviewCount: 0,
        difficulty: question.difficulty,
        confidence,
        hintUsed: false,
        hintCount: 0,
        conceptsInvolved,
        errorType,
        timeToFirstAttempt: timeSpent,
        attemptSequence: [{ correct: false, timeSpent }],
        solutionViewed,
        solutionViewedAt: solutionViewed ? Date.now() : undefined,
      });
    }

    const topicId = question.topic;
    const topicStats = updatedProfile.topicStats.get(topicId) || {
      topicId,
      questionsAttempted: 0,
      questionsCorrect: 0,
      averageAccuracy: 0,
      averageTimePerQuestion: 0,
      lastAttemptDate: Date.now(),
      masteryLevel: 0,
      conceptBreakdown: new Map(),
      difficultyProgression: { easy: 0, medium: 0, hard: 0 },
      consistencyScore: 0,
      improvementRate: 0,
      estimatedTimeToMastery: 30 * 24 * 60 * 60 * 1000,
      weakConcepts: [],
      strongConcepts: [],
    };

    topicStats.questionsAttempted += 1;
    topicStats.averageAccuracy =
      (topicStats.questionsCorrect / topicStats.questionsAttempted) * 100;
    topicStats.averageTimePerQuestion =
      (topicStats.averageTimePerQuestion * (topicStats.questionsAttempted - 1) +
        timeSpent) /
      topicStats.questionsAttempted;
    topicStats.lastAttemptDate = Date.now();
    topicStats.masteryLevel = Math.min(100, topicStats.averageAccuracy * 1.2);
    topicStats.difficultyProgression[question.difficulty] += 1;

    updatedProfile.topicStats.set(topicId, topicStats);

    updatedProfile.currentDifficulty = calculateNextDifficulty(updatedProfile);
    updatedProfile.performanceMetrics =
      calculatePerformanceMetrics(updatedProfile);
    updatedProfile.learningAnalytics =
      calculateLearningAnalytics(updatedProfile);
    updatedProfile.lastAnalyticsUpdate = Date.now();
  }

  const lastActivityDate = updatedProfile.lastActivityDate;
  const today = new Date().toDateString();
  const lastActivityDay = new Date(lastActivityDate).toDateString();

  if (today !== lastActivityDay) {
    if (
      new Date(lastActivityDate).getTime() + 24 * 60 * 60 * 1000 >
      Date.now()
    ) {
      updatedProfile.streakCount += 1;
    } else {
      updatedProfile.streakCount = 1;
    }
  }
  updatedProfile.lastActivityDate = Date.now();

  return updatedProfile;
}

export function updateUserProfileWithRL(
  profile: UserProfile,
  question: Question,
  isCorrect: boolean,
  timeSpent: number,
  submittedCode: string,
  confidence = 50,
  errorType?: string,
  conceptsInvolved: string[] = [],
  topicId = "default"
): UserProfile {
  const updatedProfile = updateUserProfile(
    profile,
    question,
    isCorrect,
    timeSpent,
    submittedCode,
    confidence,
    errorType,
    conceptsInvolved
  );

  const rlMetrics = loadRLMetrics();
  const currentState = getCurrentState(profile, topicId);
  const nextState = getCurrentState(updatedProfile, topicId);

  const previousAccuracy = profile.performanceMetrics.accuracy;
  const reward = calculateReward(
    isCorrect,
    updatedProfile.performanceMetrics.accuracy,
    timeSpent,
    previousAccuracy,
    profile.currentDifficulty,
    updatedProfile.performanceMetrics.consistency
  );

  const action = selectAction(
    rlMetrics.qTable,
    currentState,
    rlMetrics.explorationRate
  );
  rlMetrics.qTable = updateQValue(
    rlMetrics.qTable,
    currentState,
    action,
    reward,
    nextState,
    rlMetrics.episodeCount
  );

  rlMetrics.episodeCount += 1;
  rlMetrics.totalReward += reward;
  rlMetrics.averageReward = rlMetrics.totalReward / rlMetrics.episodeCount;
  rlMetrics.explorationRate = decayExplorationRate(rlMetrics.episodeCount);
  rlMetrics.lastUpdateTime = Date.now();

  if (rlMetrics.episodeCount % 20 === 0) {
    const { calculateConvergenceScore } = require('./reinforcement-learning');
    rlMetrics.convergenceScore = calculateConvergenceScore(rlMetrics.qTable);
  }

  saveRLMetrics(rlMetrics);

  return updatedProfile;
}

export function getTopicMastery(profile: UserProfile, topicId: string): number {
  return profile.topicStats.get(topicId)?.masteryLevel || 0;
}

export function getRecommendedNextTopic(
  profile: UserProfile,
  availableTopics: string[]
): string {
  const incompleteTopic = availableTopics.find(
    (t) => !profile.topicsCompleted.includes(t)
  );

  if (!incompleteTopic) {
    return availableTopics[0];
  }

  return availableTopics.reduce((prev, current) => {
    const prevMastery = getTopicMastery(profile, prev);
    const currentMastery = getTopicMastery(profile, current);
    return currentMastery < prevMastery ? current : prev;
  });
}

export function calculateAdaptiveMaxProblems(profile: UserProfile): number {
  const recentAttempts = profile.progressHistory.slice(-20);

  if (recentAttempts.length === 0) {
    return profile.currentDifficulty === "easy"
      ? 10
      : profile.currentDifficulty === "medium"
      ? 15
      : 20;
  }

  const correctCount = recentAttempts.filter((p) => p.correct).length;
  const accuracy = (correctCount / recentAttempts.length) * 100;

  const baseMax =
    profile.currentDifficulty === "easy"
      ? 10
      : profile.currentDifficulty === "medium"
      ? 15
      : 20;

  if (accuracy >= 85) {
    return Math.ceil(baseMax * 1.3);
  } else if (accuracy >= 70) {
    return Math.ceil(baseMax * 1.1);
  } else if (accuracy >= 50) {
    return baseMax;
  } else {
    return Math.ceil(baseMax * 0.7);
  }
}
