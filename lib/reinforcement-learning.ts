import type { UserProfile } from "./types"

interface RLMetrics {
  qTable: Record<string, Record<string, number>>
  explorationRate: number
  episodeCount: number
  totalReward: number
  averageReward: number
  lastUpdateTime: number
  convergenceScore: number
}

const RL_STORAGE_KEY = "rl_metrics"

export function getCurrentState(profile: UserProfile, topicId: string): string {
  const metrics = profile.performanceMetrics
  const recentAttempts = profile.progressHistory.slice(-10)

  const accuracy = metrics.accuracy
  const consistency = metrics.consistency
  const velocity = metrics.learningVelocity

  let recentCorrect = 0
  if (recentAttempts.length >= 3) {
    recentCorrect = recentAttempts.slice(-3).filter(a => a.correct).length
  }

  const difficulty = profile.currentDifficulty

  let state = `${topicId}_${difficulty}_`

  if (accuracy < 40) state += "vlow_"
  else if (accuracy < 60) state += "low_"
  else if (accuracy < 75) state += "med_"
  else if (accuracy < 90) state += "high_"
  else state += "vhigh_"

  if (velocity < -10) state += "declining_"
  else if (velocity < 5) state += "stable_"
  else if (velocity < 15) state += "improving_"
  else state += "surging_"

  if (consistency < 40) state += "unstable_"
  else if (consistency < 70) state += "moderate_"
  else state += "stable_"

  state += `r${recentCorrect}`

  return state
}

export function calculateReward(
  isCorrect: boolean,
  currentAccuracy: number,
  timeSpent: number,
  previousAccuracy: number,
  difficulty: "easy" | "medium" | "hard",
  consistency: number
): number {
  let reward = 0

  const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2

  if (isCorrect) {
    reward += 20 * difficultyMultiplier

    const accuracyImprovement = currentAccuracy - previousAccuracy
    if (accuracyImprovement > 0) {
      reward += accuracyImprovement * 0.5
    }

    if (currentAccuracy >= 85 && difficulty !== "hard") {
      reward += 10
    }
  } else {
    reward -= 10

    if (currentAccuracy < 50) {
      reward -= 5
    }

    if (difficulty === "hard" && previousAccuracy < 70) {
      reward += 3
    }
  }

  const targetTime = difficulty === "easy" ? 300 : difficulty === "medium" ? 600 : 900
  const timeRatio = timeSpent / targetTime

  if (isCorrect) {
    if (timeRatio < 0.7) {
      reward += 5
    } else if (timeRatio > 2) {
      reward -= 3
    }
  }

  if (consistency > 75) {
    reward += 2
  } else if (consistency < 40) {
    reward -= 2
  }

  return reward
}

export function selectAction(qTable: Record<string, Record<string, number>>, state: string, explorationRate: number): string {
  const actions = ["upgrade", "downgrade", "maintain", "focusWeak", "reviewPrevious"]

  if (Math.random() < explorationRate) {
    return actions[Math.floor(Math.random() * actions.length)]
  }

  const stateQValues = qTable[state] || {}
  let bestAction = actions[0]
  let bestValue = stateQValues[bestAction] || 0

  for (const action of actions) {
    const value = stateQValues[action] || 0
    if (value > bestValue) {
      bestValue = value
      bestAction = action
    }
  }

  return bestAction
}

export function updateQValue(
  qTable: Record<string, Record<string, number>>,
  state: string,
  action: string,
  reward: number,
  nextState: string,
  episodeCount: number
): Record<string, Record<string, number>> {
  const learningRate = Math.max(0.05, 0.2 * Math.pow(0.9995, episodeCount))
  const discountFactor = 0.95

  const stateQValues = qTable[state] || {}
  const nextStateQValues = qTable[nextState] || {}

  const currentQValue = stateQValues[action] || 0
  const nextQValues = Object.values(nextStateQValues)
  const maxNextQValue = nextQValues.length > 0 ? Math.max(...nextQValues) : 0

  const newQValue = currentQValue + learningRate * (reward + discountFactor * maxNextQValue - currentQValue)

  if (!qTable[state]) qTable[state] = {}
  qTable[state][action] = newQValue

  return qTable
}

export function loadRLMetrics(): RLMetrics {
  try {
    const stored = localStorage.getItem(RL_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed
    }
  } catch (error) {
    console.error("[RL] Error loading metrics:", error)
  }

  return {
    qTable: {},
    explorationRate: 0.3,
    episodeCount: 0,
    totalReward: 0,
    averageReward: 0,
    lastUpdateTime: Date.now(),
    convergenceScore: 0
  }
}

export function saveRLMetrics(metrics: RLMetrics): void {
  try {
    localStorage.setItem(RL_STORAGE_KEY, JSON.stringify(metrics))
  } catch (error) {
    console.error("[RL] Error saving metrics:", error)
  }
}

export function decayExplorationRate(episodeCount: number): number {
  const initialRate = 0.3
  const finalRate = 0.05
  const decayRate = 0.998

  return Math.max(finalRate, initialRate * Math.pow(decayRate, episodeCount))
}

export function calculateConvergenceScore(qTable: Record<string, Record<string, number>>): number {
  const states = Object.keys(qTable)
  if (states.length < 10) return 0

  let totalVariance = 0
  let stateCount = 0

  for (const state of states) {
    const qValues = Object.values(qTable[state])
    if (qValues.length < 2) continue

    const mean = qValues.reduce((a, b) => a + b, 0) / qValues.length
    const variance = qValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / qValues.length

    totalVariance += variance
    stateCount++
  }

  if (stateCount === 0) return 0

  const avgVariance = totalVariance / stateCount
  return Math.min(100, Math.max(0, 100 - avgVariance))
}

export function getRLInsights(metrics: RLMetrics): {
  isConverged: boolean
  explorationLevel: "high" | "medium" | "low"
  performanceTrend: "improving" | "stable" | "declining"
  statesExplored: number
} {
  const statesExplored = Object.keys(metrics.qTable).length

  let explorationLevel: "high" | "medium" | "low" = "medium"
  if (metrics.explorationRate > 0.2) explorationLevel = "high"
  else if (metrics.explorationRate < 0.1) explorationLevel = "low"

  const isConverged = metrics.convergenceScore > 70 && metrics.episodeCount > 100

  let performanceTrend: "improving" | "stable" | "declining" = "stable"
  if (metrics.averageReward > 10) performanceTrend = "improving"
  else if (metrics.averageReward < -5) performanceTrend = "declining"

  return {
    isConverged,
    explorationLevel,
    performanceTrend,
    statesExplored
  }
}
