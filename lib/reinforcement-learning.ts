import type { UserProfile } from "./types"

export interface QTableState {
  difficulty: "easy" | "medium" | "hard"
  topicId: string
  performanceLevel: "low" | "medium" | "high"
}

export interface QTableEntry {
  upgradeAction: number
  maintainAction: number
  downgradeAction: number
  focusWeakAction: number
  focusStrongAction: number
}

export interface RLMetrics {
  qTable: Map<string, QTableEntry>
  episodeCount: number
  totalReward: number
  averageReward: number
  explorationRate: number
}

const RL_STORAGE_KEY = "neuro_rl_q_table"
const RL_METRICS_KEY = "neuro_rl_metrics"

// Initialize Q-table with default values
function initializeQTable(): Map<string, QTableEntry> {
  return new Map()
}

// Convert state to hash for Q-table lookup
export function stateToHash(state: QTableState): string {
  return `${state.difficulty}_${state.topicId}_${state.performanceLevel}`
}

// Get current state from user profile
export function getCurrentState(profile: UserProfile, topicId: string): QTableState {
  const accuracy = profile.performanceMetrics.accuracy
  let performanceLevel: "low" | "medium" | "high" = "medium"

  if (accuracy < 50) performanceLevel = "low"
  else if (accuracy > 75) performanceLevel = "high"

  return {
    difficulty: profile.currentDifficulty,
    topicId,
    performanceLevel,
  }
}

// Calculate reward based on performance
export function calculateReward(
  isCorrect: boolean,
  accuracy: number,
  timeSpent: number,
  previousAccuracy: number,
): number {
  let reward = 0

  // Correctness reward
  if (isCorrect) {
    reward += 10
  } else {
    reward -= 5
  }

  // Accuracy improvement reward
  const accuracyImprovement = accuracy - previousAccuracy
  reward += accuracyImprovement * 0.5

  // Speed reward (ideal time: 600 seconds = 10 minutes)
  const idealTime = 600
  if (timeSpent < idealTime) {
    reward += 5
  } else if (timeSpent > idealTime * 2) {
    reward -= 3
  }

  // Consistency bonus
  if (accuracy > 80) {
    reward += 3
  }

  return reward
}

// Select action using epsilon-greedy strategy
export function selectAction(
  qTable: Map<string, QTableEntry>,
  state: QTableState,
  explorationRate: number,
): "upgrade" | "maintain" | "downgrade" | "focusWeak" | "focusStrong" {
  const stateHash = stateToHash(state)
  const entry = qTable.get(stateHash)

  // Exploration: random action
  if (Math.random() < explorationRate) {
    const actions = ["upgrade", "maintain", "downgrade", "focusWeak", "focusStrong"] as const
    return actions[Math.floor(Math.random() * actions.length)]
  }

  // Exploitation: best action
  if (!entry) {
    return "maintain"
  }

  const actions = [
    { name: "upgrade" as const, value: entry.upgradeAction },
    { name: "maintain" as const, value: entry.maintainAction },
    { name: "downgrade" as const, value: entry.downgradeAction },
    { name: "focusWeak" as const, value: entry.focusWeakAction },
    { name: "focusStrong" as const, value: entry.focusStrongAction },
  ]

  return actions.reduce((best, current) => (current.value > best.value ? current : best)).name
}

// Update Q-value using Q-learning formula
export function updateQValue(
  qTable: Map<string, QTableEntry>,
  state: QTableState,
  action: "upgrade" | "maintain" | "downgrade" | "focusWeak" | "focusStrong",
  reward: number,
  nextState: QTableState,
  learningRate = 0.1,
  discountFactor = 0.9,
): Map<string, QTableEntry> {
  const stateHash = stateToHash(state)
  const nextStateHash = stateToHash(nextState)

  // Get or create Q-table entry
  let entry = qTable.get(stateHash)
  if (!entry) {
    entry = {
      upgradeAction: 0,
      maintainAction: 0,
      downgradeAction: 0,
      focusWeakAction: 0,
      focusStrongAction: 0,
    }
  }

  // Get next state's max Q-value
  const nextEntry = qTable.get(nextStateHash)
  const maxNextQValue = nextEntry
    ? Math.max(
        nextEntry.upgradeAction,
        nextEntry.maintainAction,
        nextEntry.downgradeAction,
        nextEntry.focusWeakAction,
        nextEntry.focusStrongAction,
      )
    : 0

  // Q-learning update: Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
  const currentQValue = entry[`${action}Action` as keyof QTableEntry] as number
  const newQValue = currentQValue + learningRate * (reward + discountFactor * maxNextQValue - currentQValue)

  entry[`${action}Action` as keyof QTableEntry] = newQValue

  qTable.set(stateHash, entry)
  return qTable
}

// Load Q-table from storage
export function loadQTable(): Map<string, QTableEntry> {
  if (typeof window === "undefined") return initializeQTable()

  const stored = localStorage.getItem(RL_STORAGE_KEY)
  if (!stored) return initializeQTable()

  try {
    const data = JSON.parse(stored)
    return new Map(Object.entries(data) as [string, QTableEntry][])
  } catch {
    return initializeQTable()
  }
}

// Save Q-table to storage
export function saveQTable(qTable: Map<string, QTableEntry>): void {
  if (typeof window === "undefined") return

  const data = Object.fromEntries(qTable)
  localStorage.setItem(RL_STORAGE_KEY, JSON.stringify(data))
}

// Load RL metrics
export function loadRLMetrics(): RLMetrics {
  if (typeof window === "undefined") {
    return {
      qTable: initializeQTable(),
      episodeCount: 0,
      totalReward: 0,
      averageReward: 0,
      explorationRate: 0.1,
    }
  }

  const stored = localStorage.getItem(RL_METRICS_KEY)
  if (!stored) {
    return {
      qTable: loadQTable(),
      episodeCount: 0,
      totalReward: 0,
      averageReward: 0,
      explorationRate: 0.1,
    }
  }

  try {
    const data = JSON.parse(stored)
    return {
      ...data,
      qTable: loadQTable(),
    }
  } catch {
    return {
      qTable: loadQTable(),
      episodeCount: 0,
      totalReward: 0,
      averageReward: 0,
      explorationRate: 0.1,
    }
  }
}

// Save RL metrics
export function saveRLMetrics(metrics: RLMetrics): void {
  if (typeof window === "undefined") return

  const { qTable, ...rest } = metrics
  localStorage.setItem(RL_METRICS_KEY, JSON.stringify(rest))
  saveQTable(qTable)
}

// Decay exploration rate over time
export function decayExplorationRate(episodeCount: number, initialRate = 0.1): number {
  return initialRate * Math.exp(-0.001 * episodeCount)
}

// Clear all RL data
export function clearRLData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(RL_STORAGE_KEY)
  localStorage.removeItem(RL_METRICS_KEY)
}
