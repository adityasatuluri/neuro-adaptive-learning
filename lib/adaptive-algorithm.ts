import type { UserProfile, Question } from "./types"

// Spaced repetition intervals (in days)
const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30]

export function calculateNextDifficulty(profile: UserProfile): "easy" | "medium" | "hard" {
  const recentAttempts = profile.progressHistory.slice(-10)

  if (recentAttempts.length === 0) {
    return "easy"
  }

  const correctCount = recentAttempts.filter((a) => a.correct).length
  const correctRate = correctCount / recentAttempts.length
  const avgTime = recentAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / recentAttempts.length

  // More sophisticated difficulty progression
  if (profile.currentDifficulty === "easy") {
    if (correctRate >= 0.85 && avgTime < 300) {
      return "medium"
    }
  } else if (profile.currentDifficulty === "medium") {
    if (correctRate >= 0.85 && avgTime < 600) {
      return "hard"
    } else if (correctRate < 0.6) {
      return "easy"
    }
  } else if (profile.currentDifficulty === "hard") {
    if (correctRate < 0.6) {
      return "medium"
    }
  }

  return profile.currentDifficulty
}

export function calculateNextReviewDate(reviewCount: number): number {
  const intervalDays = SPACED_REPETITION_INTERVALS[Math.min(reviewCount, SPACED_REPETITION_INTERVALS.length - 1)]
  return Date.now() + intervalDays * 24 * 60 * 60 * 1000
}

export function selectNextQuestion(questions: Question[], profile: UserProfile, currentTopic: string): Question | null {
  const now = Date.now()

  // First, prioritize questions due for spaced repetition review
  const dueForReview = profile.progressHistory.filter(
    (p) =>
      p.nextReviewDate &&
      p.nextReviewDate <= now &&
      questions.find((q) => q.id === p.questionId)?.topic === currentTopic,
  )

  if (dueForReview.length > 0) {
    const questionId = dueForReview[0].questionId
    const question = questions.find((q) => q.id === questionId)
    if (question) return question
  }

  // Then, find new questions at current difficulty
  const availableQuestions = questions.filter(
    (q) =>
      q.topic === currentTopic &&
      q.difficulty === profile.currentDifficulty &&
      !profile.progressHistory.some((p) => p.questionId === q.id),
  )

  if (availableQuestions.length > 0) {
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
  }

  // Fallback: return any question from the topic not yet attempted
  return (
    questions.find((q) => q.topic === currentTopic && !profile.progressHistory.some((p) => p.questionId === q.id)) ||
    null
  )
}

export function updateUserProfile(
  profile: UserProfile,
  question: Question,
  isCorrect: boolean,
  timeSpent: number,
  submittedCode: string,
): UserProfile {
  const updatedProfile = { ...profile }

  // Update progress history
  const existingProgress = updatedProfile.progressHistory.find((p) => p.questionId === question.id)

  if (existingProgress) {
    existingProgress.attempts += 1
    existingProgress.timeSpent = (existingProgress.timeSpent + timeSpent) / 2 // Average time
    existingProgress.correct = isCorrect
    existingProgress.submittedCode = submittedCode
    existingProgress.timestamp = Date.now()
    existingProgress.reviewCount += 1
    existingProgress.nextReviewDate = calculateNextReviewDate(existingProgress.reviewCount)
  } else {
    updatedProfile.progressHistory.push({
      questionId: question.id,
      attempts: 1,
      timeSpent,
      correct: isCorrect,
      submittedCode,
      timestamp: Date.now(),
      nextReviewDate: calculateNextReviewDate(0),
      reviewCount: 0,
      difficulty: question.difficulty,
    })
  }

  // Update overall stats
  updatedProfile.totalQuestionsAttempted += 1
  if (isCorrect) {
    updatedProfile.correctAnswers += 1
  }

  updatedProfile.totalTimeSpent += timeSpent
  updatedProfile.averageTimePerQuestion =
    updatedProfile.progressHistory.reduce((sum, p) => sum + p.timeSpent, 0) / updatedProfile.progressHistory.length

  // Update topic stats
  const topicId = question.topic
  const topicStats = updatedProfile.topicStats.get(topicId) || {
    topicId,
    questionsAttempted: 0,
    questionsCorrect: 0,
    averageAccuracy: 0,
    averageTimePerQuestion: 0,
    lastAttemptDate: Date.now(),
    masteryLevel: 0,
  }

  topicStats.questionsAttempted += 1
  if (isCorrect) {
    topicStats.questionsCorrect += 1
  }
  topicStats.averageAccuracy = (topicStats.questionsCorrect / topicStats.questionsAttempted) * 100
  topicStats.averageTimePerQuestion =
    (topicStats.averageTimePerQuestion * (topicStats.questionsAttempted - 1) + timeSpent) /
    topicStats.questionsAttempted
  topicStats.lastAttemptDate = Date.now()
  topicStats.masteryLevel = Math.min(100, topicStats.averageAccuracy * 1.2)

  updatedProfile.topicStats.set(topicId, topicStats)

  // Update streak
  const lastActivityDate = updatedProfile.lastActivityDate
  const today = new Date().toDateString()
  const lastActivityDay = new Date(lastActivityDate).toDateString()

  if (today === lastActivityDay) {
    // Same day, streak continues
  } else if (new Date(lastActivityDate).getTime() + 24 * 60 * 60 * 1000 > Date.now()) {
    // Within 24 hours, streak continues
  } else {
    // More than 24 hours, reset streak
    updatedProfile.streakCount = 1
  }
  updatedProfile.lastActivityDate = Date.now()

  // Update difficulty
  updatedProfile.currentDifficulty = calculateNextDifficulty(updatedProfile)

  return updatedProfile
}

export function getTopicMastery(profile: UserProfile, topicId: string): number {
  return profile.topicStats.get(topicId)?.masteryLevel || 0
}

export function getRecommendedNextTopic(profile: UserProfile, availableTopics: string[]): string {
  // Recommend topic with lowest mastery that hasn't been completed
  const incompleteTopic = availableTopics.find((t) => !profile.topicsCompleted.includes(t))

  if (!incompleteTopic) {
    return availableTopics[0]
  }

  return availableTopics.reduce((prev, current) => {
    const prevMastery = getTopicMastery(profile, prev)
    const currentMastery = getTopicMastery(profile, current)
    return currentMastery < prevMastery ? current : prev
  })
}
