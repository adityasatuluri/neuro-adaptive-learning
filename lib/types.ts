// Data models for the Neuro Adaptive Learning System

export interface Question {
  id: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
  title: string
  description: string
  starterCode: string
  testCases: TestCase[]
  expectedOutput: string
  hints: string[]
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface UserProgress {
  questionId: string
  attempts: number
  timeSpent: number // in seconds
  correct: boolean
  submittedCode: string
  timestamp: number
}

export interface UserProfile {
  currentDifficulty: "easy" | "medium" | "hard"
  totalQuestionsAttempted: number
  correctAnswers: number
  averageTimePerQuestion: number
  progressHistory: UserProgress[]
  currentLearningPath: string
  topicsCompleted: string[]
}

export interface LearningPath {
  id: string
  name: string
  description: string
  topics: string[]
  isCustom: boolean
}
