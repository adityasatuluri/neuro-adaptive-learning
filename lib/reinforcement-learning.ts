import type { UserProfile } from "./types"

interface RLMetrics {
  qTable: Map<string, Map<string, number>>
  explorationRate: number
  episodeCount: number
  totalReward: number
  averageReward: number
}

const RL_STORAGE_KEY = "rl_metrics"

export function getCurrentState(profile: UserProfile, topicId: string): string {
  const accuracy = profile.performanceMetrics.accuracy
  const speed = profile.performanceMetrics.speed
  const consistency = profile.performanceMetrics.consistency

  let state = `${topicId}_`

  if (accuracy < 50) state += "low_acc_"
  else if (accuracy < 75) state += "med_acc_"
  else state += "high_acc_"

  if (speed < 40) state += "slow_"
  else if (speed < 70) state += "med_speed_"
  else state += "fast_"

  if (consistency < 50) state += "inconsistent"
  else if (consistency < 75) state += "moderate_consistency"
  else state += "consistent"

  return state
}

export function calculateReward(
  isCorrect: boolean,
  currentAccuracy: number,
  timeSpent: number,
  previousAccuracy: number,
): number {
  let reward = 0

  if (isCorrect) {
    reward += 10
    const accuracyImprovement = currentAccuracy - previousAccuracy
    if (accuracyImprovement > 0) reward += accuracyImprovement / 10
  } else {
    reward -= 5
  }

  const idealTime = 600
  if (timeSpent < idealTime) {
    reward += (idealTime - timeSpent) / 100
  } else {
    reward -= (timeSpent - idealTime) / 200
  }

  return reward
}

export function selectAction(qTable: Map<string, Map<string, number>>, state: string, explorationRate: number): string {
  const actions = ["upgrade", "downgrade", "maintain", "focusWeak", "focusStrong"]

  if (Math.random() < explorationRate) {
    return actions[Math.floor(Math.random() * actions.length)]
  }

  const stateQValues = qTable.get(state) || new Map()
  let bestAction = actions[0]
  let bestValue = stateQValues.get(bestAction) || 0

  for (const action of actions) {
    const value = stateQValues.get(action) || 0
    if (value > bestValue) {
      bestValue = value
      bestAction = action
    }
  }

  return bestAction
}

export function updateQValue(
  qTable: Map<string, Map<string, number>>,
  state: string,
  action: string,
  reward: number,
  nextState: string,
): Map<string, Map<string, number>> {
  const learningRate = 0.1
  const discountFactor = 0.95

  const stateQValues = qTable.get(state) || new Map()
  const nextStateQValues = qTable.get(nextState) || new Map()

  const currentQValue = stateQValues.get(action) || 0
  const maxNextQValue = Math.max(...Array.from(nextStateQValues.values()), 0)

  const newQValue = currentQValue + learningRate * (reward + discountFactor * maxNextQValue - currentQValue)

  stateQValues.set(action, newQValue)
  qTable.set(state, stateQValues)

  return qTable
}

export function loadRLMetrics(): RLMetrics {
  try {
    const stored = localStorage.getItem(RL_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const qTable = new Map(parsed.qTable)
      return {
        ...parsed,
        qTable,
      }
    }
  } catch (error) {
    console.error("[v0] Error loading RL metrics:", error)
  }

  return {
    qTable: new Map(),
    explorationRate: 0.3,
    episodeCount: 0,
    totalReward: 0,
    averageReward: 0,
  }
}

export function saveRLMetrics(metrics: RLMetrics): void {
  try {
    const toStore = {
      ...metrics,
      qTable: Array.from(metrics.qTable.entries()),
    }
    localStorage.setItem(RL_STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error("[v0] Error saving RL metrics:", error)
  }
}

export function decayExplorationRate(episodeCount: number): number {
  const initialRate = 0.3
  const finalRate = 0.01
  const decayRate = 0.995

  return Math.max(finalRate, initialRate * Math.pow(decayRate, episodeCount))
}
