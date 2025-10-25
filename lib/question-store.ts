import type { Question } from "./types"

const ANSWERED_QUESTIONS_KEY = "neuro_answered_questions"
const QUESTION_STORE_VERSION = "v1"

export interface StoredQuestion {
  id: string
  question: Question
  answeredAt: number
  attempts: number
  finalCorrect: boolean
  difficulty: "easy" | "medium" | "hard"
  topic: string
}

export function addAnsweredQuestion(question: Question, attempts: number, finalCorrect: boolean): void {
  if (typeof window === "undefined") return

  const store = getAnsweredQuestions()

  // Check if question already exists
  const existingIndex = store.findIndex((q) => q.id === question.id)

  const storedQuestion: StoredQuestion = {
    id: question.id,
    question,
    answeredAt: Date.now(),
    attempts,
    finalCorrect,
    difficulty: question.difficulty,
    topic: question.topic,
  }

  if (existingIndex >= 0) {
    // Update existing entry
    store[existingIndex] = storedQuestion
  } else {
    // Add new entry
    store.push(storedQuestion)
  }

  // Keep only last 500 answered questions to avoid storage bloat
  if (store.length > 500) {
    store.splice(0, store.length - 500)
  }

  localStorage.setItem(ANSWERED_QUESTIONS_KEY, JSON.stringify(store))
}

export function getAnsweredQuestions(): StoredQuestion[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(ANSWERED_QUESTIONS_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function isQuestionAnswered(questionId: string): boolean {
  const answered = getAnsweredQuestions()
  return answered.some((q) => q.id === questionId)
}

export function getAnsweredQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard"): StoredQuestion[] {
  const answered = getAnsweredQuestions()
  return answered.filter((q) => q.difficulty === difficulty)
}

export function getAnsweredQuestionsByTopic(topic: string): StoredQuestion[] {
  const answered = getAnsweredQuestions()
  return answered.filter((q) => q.topic === topic)
}

export function clearAnsweredQuestions(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ANSWERED_QUESTIONS_KEY)
}

export function getQuestionStoreStats() {
  const answered = getAnsweredQuestions()
  const byDifficulty = {
    easy: answered.filter((q) => q.difficulty === "easy").length,
    medium: answered.filter((q) => q.difficulty === "medium").length,
    hard: answered.filter((q) => q.difficulty === "hard").length,
  }
  const correctCount = answered.filter((q) => q.finalCorrect).length

  return {
    totalAnswered: answered.length,
    byDifficulty,
    correctCount,
    accuracy: answered.length > 0 ? (correctCount / answered.length) * 100 : 0,
  }
}
