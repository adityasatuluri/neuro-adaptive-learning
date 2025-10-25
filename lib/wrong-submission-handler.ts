export interface WrongSubmissionContext {
  questionId: string
  attempts: number
  lastErrorType?: string
  consecutiveWrongs: number
  timeSpentTotal: number
  hints: string[]
}

const WRONG_SUBMISSION_KEY = "neuro_wrong_submissions"

export function trackWrongSubmission(
  questionId: string,
  errorType: string,
  timeSpent: number,
  hint?: string,
): WrongSubmissionContext {
  if (typeof window === "undefined")
    return { questionId, attempts: 0, consecutiveWrongs: 0, timeSpentTotal: 0, hints: [] }

  const store = getWrongSubmissionContexts()
  let context = store.find((c) => c.questionId === questionId)

  if (!context) {
    context = {
      questionId,
      attempts: 0,
      lastErrorType: errorType,
      consecutiveWrongs: 0,
      timeSpentTotal: 0,
      hints: [],
    }
  }

  context.attempts += 1
  context.consecutiveWrongs += 1
  context.lastErrorType = errorType
  context.timeSpentTotal += timeSpent
  if (hint) {
    context.hints.push(hint)
  }

  const existingIndex = store.findIndex((c) => c.questionId === questionId)
  if (existingIndex >= 0) {
    store[existingIndex] = context
  } else {
    store.push(context)
  }

  localStorage.setItem(WRONG_SUBMISSION_KEY, JSON.stringify(store))
  return context
}

export function resetWrongSubmissionStreak(questionId: string): void {
  if (typeof window === "undefined") return

  const store = getWrongSubmissionContexts()
  const context = store.find((c) => c.questionId === questionId)
  if (context) {
    context.consecutiveWrongs = 0
  }
  localStorage.setItem(WRONG_SUBMISSION_KEY, JSON.stringify(store))
}

export function getWrongSubmissionContexts(): WrongSubmissionContext[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(WRONG_SUBMISSION_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function getWrongSubmissionContext(questionId: string): WrongSubmissionContext | undefined {
  const contexts = getWrongSubmissionContexts()
  return contexts.find((c) => c.questionId === questionId)
}

export function shouldProvideHint(questionId: string): boolean {
  const context = getWrongSubmissionContext(questionId)
  if (!context) return false

  // Provide hint after 2 consecutive wrong attempts
  return context.consecutiveWrongs >= 2
}

export function shouldDowngradeDifficulty(questionId: string): boolean {
  const context = getWrongSubmissionContext(questionId)
  if (!context) return false

  // Downgrade after 4 consecutive wrong attempts
  return context.consecutiveWrongs >= 4
}

export function shouldSkipQuestion(questionId: string): boolean {
  const context = getWrongSubmissionContext(questionId)
  if (!context) return false

  // Skip after 5 consecutive wrong attempts
  return context.consecutiveWrongs >= 5
}

export function getAdaptiveMessage(questionId: string): string {
  const context = getWrongSubmissionContext(questionId)
  if (!context) return ""

  if (context.consecutiveWrongs === 1) {
    return "Not quite right. Try again!"
  } else if (context.consecutiveWrongs === 2) {
    return "Still not right. Here's a hint: Check your logic flow."
  } else if (context.consecutiveWrongs === 3) {
    return "Let's try a different approach. Consider breaking down the problem."
  } else if (context.consecutiveWrongs === 4) {
    return "This is challenging. Would you like to try an easier problem?"
  } else {
    return "Let's move on to another problem and come back to this later."
  }
}

export function clearWrongSubmissions(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(WRONG_SUBMISSION_KEY)
}
