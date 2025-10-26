import type { Question } from "./types"

interface AnsweredQuestion {
  questionId: string
  question: Question
  attempts: number
  correct: boolean
  timestamp: number
}

const QUESTION_STORE_KEY = "answered_questions"
const MAX_STORED_QUESTIONS = 500

export function addAnsweredQuestion(question: Question, attempts: number, correct: boolean): void {
  try {
    const stored = localStorage.getItem(QUESTION_STORE_KEY)
    const questions: AnsweredQuestion[] = stored ? JSON.parse(stored) : []

    const existingIndex = questions.findIndex((q) => q.questionId === question.id)

    if (existingIndex >= 0) {
      questions[existingIndex] = {
        questionId: question.id,
        question,
        attempts,
        correct,
        timestamp: Date.now(),
      }
    } else {
      questions.push({
        questionId: question.id,
        question,
        attempts,
        correct,
        timestamp: Date.now(),
      })
    }

    if (questions.length > MAX_STORED_QUESTIONS) {
      questions.shift()
    }

    localStorage.setItem(QUESTION_STORE_KEY, JSON.stringify(questions))
  } catch (error) {
    console.error("[v0] Error adding answered question:", error)
  }
}

export function getAnsweredQuestions(): AnsweredQuestion[] {
  try {
    const stored = localStorage.getItem(QUESTION_STORE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("[v0] Error getting answered questions:", error)
    return []
  }
}

export function isQuestionAnswered(questionId: string): boolean {
  const answered = getAnsweredQuestions()
  return answered.some((q) => q.questionId === questionId)
}

export function getAnsweredQuestionStats(questionId: string): AnsweredQuestion | null {
  const answered = getAnsweredQuestions()
  return answered.find((q) => q.questionId === questionId) || null
}

export function clearAnsweredQuestions(): void {
  try {
    localStorage.removeItem(QUESTION_STORE_KEY)
  } catch (error) {
    console.error("[v0] Error clearing answered questions:", error)
  }
}
