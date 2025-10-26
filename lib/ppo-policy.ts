import type { UserProfile } from "./types"

interface PPOMetrics {
  policyVersion: number
  episodeCount: number
  clipRange: number
  entropyBonus: number
  lastUpdateTime: number
}

const PPO_STORAGE_KEY = "ppo_metrics"

export function calculateStateValue(profile: UserProfile): number {
  const metrics = profile.performanceMetrics
  const accuracy = metrics.accuracy / 100
  const speed = metrics.speed / 100
  const consistency = metrics.consistency / 100
  const confidence = profile.performanceMetrics.confidenceLevel / 100

  return accuracy * 0.4 + speed * 0.2 + consistency * 0.2 + confidence * 0.2
}

export function calculateAdvantage(currentValue: number, nextValue: number, reward: number, gamma = 0.99): number {
  const tdTarget = reward + gamma * nextValue
  return tdTarget - currentValue
}

export function calculatePPOLoss(advantage: number, probabilityRatio: number, clipRange: number): number {
  const clippedRatio = Math.max(Math.min(probabilityRatio, 1 + clipRange), 1 - clipRange)
  return -Math.min(advantage * probabilityRatio, advantage * clippedRatio)
}

export function selectActionWithPPO(profile: UserProfile, availableActions: string[], ppoMetrics: PPOMetrics): string {
  const stateValue = calculateStateValue(profile)

  const actionScores = availableActions.map((action) => {
    let score = 0

    if (action === "upgrade" && stateValue > 0.7) score = 0.8
    else if (action === "downgrade" && stateValue < 0.4) score = 0.8
    else if (action === "maintain") score = 0.6
    else if (action === "focusWeak" && profile.performanceMetrics.accuracy < 70) score = 0.7
    else if (action === "focusStrong" && profile.performanceMetrics.accuracy > 80) score = 0.7

    score += Math.random() * 0.1
    return score
  })

  const maxScore = Math.max(...actionScores)
  const bestActionIndex = actionScores.indexOf(maxScore)

  return availableActions[bestActionIndex]
}

export function updatePPOPolicy(ppoMetrics: PPOMetrics, advantage: number, probabilityRatio: number): PPOMetrics {
  const loss = calculatePPOLoss(advantage, probabilityRatio, ppoMetrics.clipRange)

  const updatedMetrics = { ...ppoMetrics }
  updatedMetrics.episodeCount += 1
  updatedMetrics.lastUpdateTime = Date.now()

  if (updatedMetrics.episodeCount % 100 === 0) {
    updatedMetrics.clipRange = Math.max(0.1, updatedMetrics.clipRange * 0.99)
    updatedMetrics.policyVersion += 1
  }

  return updatedMetrics
}

export function loadPPOMetrics(): PPOMetrics {
  try {
    const stored = localStorage.getItem(PPO_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error loading PPO metrics:", error)
  }

  return {
    policyVersion: 1,
    episodeCount: 0,
    clipRange: 0.2,
    entropyBonus: 0.01,
    lastUpdateTime: Date.now(),
  }
}

export function savePPOMetrics(metrics: PPOMetrics): void {
  try {
    localStorage.setItem(PPO_STORAGE_KEY, JSON.stringify(metrics))
  } catch (error) {
    console.error("[v0] Error saving PPO metrics:", error)
  }
}
