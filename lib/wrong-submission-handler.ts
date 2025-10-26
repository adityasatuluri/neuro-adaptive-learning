interface WrongSubmissionTracker {
  questionId: string
  attempts: number
  lastAttemptTime: number
  errorTypes: string[]
}

const WRONG_SUBMISSION_KEY = "wrong_submissions"

export function trackWrongSubmission(questionId: string, errorType: string, timeSpent: number): void {
  try {
    const stored = localStorage.getItem(WRONG_SUBMISSION_KEY)
    const submissions: WrongSubmissionTracker[] = stored ? JSON.parse(stored) : []

    const existing = submissions.find((s) => s.questionId === questionId)

    if (existing) {
      existing.attempts += 1
      existing.lastAttemptTime = Date.now()
      existing.errorTypes.push(errorType)
    } else {
      submissions.push({
        questionId,
        attempts: 1,
        lastAttemptTime: Date.now(),
        errorTypes: [errorType],
      })
    }

    localStorage.setItem(WRONG_SUBMISSION_KEY, JSON.stringify(submissions))
  } catch (error) {
    console.error("[v0] Error tracking wrong submission:", error)
  }
}

export function getWrongSubmissionCount(questionId: string): number {
  try {
    const stored = localStorage.getItem(WRONG_SUBMISSION_KEY)
    const submissions: WrongSubmissionTracker[] = stored ? JSON.parse(stored) : []
    const tracker = submissions.find((s) => s.questionId === questionId)
    return tracker?.attempts || 0
  } catch (error) {
    console.error("[v0] Error getting wrong submission count:", error)
    return 0
  }
}

export function resetWrongSubmissionStreak(questionId: string): void {
  try {
    const stored = localStorage.getItem(WRONG_SUBMISSION_KEY)
    const submissions: WrongSubmissionTracker[] = stored ? JSON.parse(stored) : []

    const index = submissions.findIndex((s) => s.questionId === questionId)
    if (index >= 0) {
      submissions.splice(index, 1)
    }

    localStorage.setItem(WRONG_SUBMISSION_KEY, JSON.stringify(submissions))
  } catch (error) {
    console.error("[v0] Error resetting wrong submission streak:", error)
  }
}

export function getWrongSubmissionStats(questionId: string): WrongSubmissionTracker | null {
  try {
    const stored = localStorage.getItem(WRONG_SUBMISSION_KEY)
    const submissions: WrongSubmissionTracker[] = stored ? JSON.parse(stored) : []
    return submissions.find((s) => s.questionId === questionId) || null
  } catch (error) {
    console.error("[v0] Error getting wrong submission stats:", error)
    return null
  }
}

export function clearWrongSubmissions(): void {
  try {
    localStorage.removeItem(WRONG_SUBMISSION_KEY)
  } catch (error) {
    console.error("[v0] Error clearing wrong submissions:", error)
  }
}
