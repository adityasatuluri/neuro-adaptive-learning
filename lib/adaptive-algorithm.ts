// Adaptive difficulty algorithm

import type { UserProfile, Question } from "./types"

export function calculateNextDifficulty(profile: UserProfile): "easy" | "medium" | "hard" {
  const recentAttempts = profile.progressHistory.slice(-5)

  if (recentAttempts.length === 0) {
    return "easy"
  }

  const correctCount = recentAttempts.filter((a) => a.correct).length
  const correctRate = correctCount / recentAttempts.length
  const avgTime = recentAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / recentAttempts.length

  // Difficulty progression logic
  if (profile.currentDifficulty === "easy") {
    if (correctRate >= 0.8 && avgTime < 300) {
      return "medium"
    }
  } else if (profile.currentDifficulty === "medium") {
    if (correctRate >= 0.8 && avgTime < 600) {
      return "hard"
    } else if (correctRate < 0.5) {
      return "easy"
    }
  } else if (profile.currentDifficulty === "hard") {
    if (correctRate < 0.5) {
      return "medium"
    }
  }

  return profile.currentDifficulty
}

export function selectNextQuestion(questions: Question[], profile: UserProfile, currentTopic: string): Question | null {
  const availableQuestions = questions.filter(
    (q) =>
      q.topic === currentTopic &&
      q.difficulty === profile.currentDifficulty &&
      !profile.progressHistory.some((p) => p.questionId === q.id),
  )

  if (availableQuestions.length === 0) {
    // Fallback: return any question from the topic not yet attempted
    return (
      questions.find((q) => q.topic === currentTopic && !profile.progressHistory.some((p) => p.questionId === q.id)) ||
      null
    )
  }

  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
}

export function updateUserProfile(
  profile: UserProfile,
  questionId: string,
  isCorrect: boolean,
  timeSpent: number,
  submittedCode: string,
): UserProfile {
  const updatedProfile = { ...profile }

  updatedProfile.progressHistory.push({
    questionId,
    attempts: 1,
    timeSpent,
    correct: isCorrect,
    submittedCode,
    timestamp: Date.now(),
  })

  updatedProfile.totalQuestionsAttempted += 1
  if (isCorrect) {
    updatedProfile.correctAnswers += 1
  }

  updatedProfile.averageTimePerQuestion =
    updatedProfile.progressHistory.reduce((sum, p) => sum + p.timeSpent, 0) / updatedProfile.progressHistory.length

  updatedProfile.currentDifficulty = calculateNextDifficulty(updatedProfile)

  return updatedProfile
}
