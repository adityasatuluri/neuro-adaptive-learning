export type QuestionType = "code-writing" | "code-completion" | "debugging" | "output-prediction"

export interface Question {
  id: string
  topic: string
  subtopic: string
  difficulty: "easy" | "medium" | "hard"
  title: string
  description: string
  type: QuestionType
  starterCode: string
  testCases: TestCase[]
  expectedOutput: string
  hints: string[]
  prerequisites?: string[] // Topic IDs that should be completed first
  estimatedTime: number // in seconds
  tags: string[]
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface UserProgress {
  questionId: string
  attempts: number
  timeSpent: number
  correct: boolean
  submittedCode: string
  timestamp: number
  nextReviewDate?: number // For spaced repetition
  reviewCount: number
  difficulty: "easy" | "medium" | "hard"
}

export interface TopicStats {
  topicId: string
  questionsAttempted: number
  questionsCorrect: number
  averageAccuracy: number
  averageTimePerQuestion: number
  lastAttemptDate: number
  masteryLevel: number // 0-100
}

export interface UserProfile {
  currentDifficulty: "easy" | "medium" | "hard"
  totalQuestionsAttempted: number
  correctAnswers: number
  averageTimePerQuestion: number
  progressHistory: UserProgress[]
  currentLearningPath: string
  topicsCompleted: string[]
  topicStats: Map<string, TopicStats>
  streakCount: number
  lastActivityDate: number
  totalTimeSpent: number
}

export interface LearningPath {
  id: string
  name: string
  description: string
  topics: string[]
  isCustom: boolean
  estimatedHours: number
}

export interface Topic {
  id: string
  name: string
  description: string
  prerequisites: string[]
  subtopics: string[]
  estimatedHours: number
}
