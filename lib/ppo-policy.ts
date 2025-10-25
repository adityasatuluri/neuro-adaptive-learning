// This implements a lightweight PPO-like approach for adaptive difficulty selection
import type { UserProfile } from "./types"

export interface PolicyState {
  difficulty: "easy" | "medium" | "hard"
  accuracy: number
  speed: number
  consistency: number
  confidence: number
}

export interface PolicyAction {
  action: "upgrade" | "maintain" | "downgrade" | "skip" | "hint"
  probability: number
  expectedValue: number
}

export interface PPOMetrics {
  policyVersion: number
  episodeCount: number
  totalAdvantage: number
  averageAdvantage: number
  clipRange: number
  entropyBonus: number
  lastUpdateTime: number
}

const PPO_METRICS_KEY = "neuro_ppo_metrics"
const PPO_POLICY_KEY = "neuro_ppo_policy"
const CLIP_RANGE = 0.2 // PPO clip range
const ENTROPY_COEFFICIENT = 0.01 // Entropy bonus for exploration

export function initializePPOMetrics(): PPOMetrics {
  return {
    policyVersion: 1,
    episodeCount: 0,
    totalAdvantage: 0,
    averageAdvantage: 0,
    clipRange: CLIP_RANGE,
    entropyBonus: ENTROPY_COEFFICIENT,
    lastUpdateTime: Date.now(),
  }
}

export function loadPPOMetrics(): PPOMetrics {
  if (typeof window === "undefined") return initializePPOMetrics()

  const stored = localStorage.getItem(PPO_METRICS_KEY)
  if (!stored) return initializePPOMetrics()

  try {
    return JSON.parse(stored)
  } catch {
    return initializePPOMetrics()
  }
}

export function savePPOMetrics(metrics: PPOMetrics): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PPO_METRICS_KEY, JSON.stringify(metrics))
}

export function calculateStateValue(state: PolicyState): number {
  // Value function: estimate expected return from this state
  const accuracyValue = state.accuracy * 0.4
  const speedValue = Math.min(state.speed, 100) * 0.2
  const consistencyValue = state.consistency * 0.25
  const confidenceValue = state.confidence * 0.15

  return (accuracyValue + speedValue + consistencyValue + confidenceValue) / 100
}

export function calculateAdvantage(reward: number, stateValue: number, nextStateValue: number, gamma = 0.99): number {
  // Advantage = reward + gamma * V(s') - V(s)
  return reward + gamma * nextStateValue - stateValue
}

export function selectPPOAction(state: PolicyState, advantage: number, metrics: PPOMetrics): PolicyAction {
  // Determine action based on state and advantage
  const actions: PolicyAction[] = []

  // Upgrade action: when advantage is high and accuracy is good
  if (state.accuracy > 75 && advantage > 0.5) {
    actions.push({
      action: "upgrade",
      probability: Math.min(0.9, 0.5 + advantage * 0.2),
      expectedValue: advantage,
    })
  }

  // Maintain action: baseline action
  actions.push({
    action: "maintain",
    probability: 0.3 + Math.max(0, -advantage * 0.1),
    expectedValue: 0,
  })

  // Downgrade action: when accuracy is low or advantage is negative
  if (state.accuracy < 50 || advantage < -0.3) {
    actions.push({
      action: "downgrade",
      probability: Math.min(0.8, Math.max(0.1, -advantage * 0.3)),
      expectedValue: advantage,
    })
  }

  // Hint action: when struggling
  if (state.accuracy < 60 && state.confidence < 40) {
    actions.push({
      action: "hint",
      probability: 0.4,
      expectedValue: 0.2,
    })
  }

  // Skip action: when very stuck
  if (state.accuracy < 30 && advantage < -0.5) {
    actions.push({
      action: "skip",
      probability: 0.3,
      expectedValue: 0.1,
    })
  }

  // Normalize probabilities
  const totalProb = actions.reduce((sum, a) => sum + a.probability, 0)
  actions.forEach((a) => (a.probability = a.probability / totalProb))

  // Select action with highest probability
  return actions.reduce((best, current) => (current.probability > best.probability ? current : best))
}

export function updatePPOPolicy(
  profile: UserProfile,
  action: PolicyAction,
  reward: number,
  oldProbability: number,
): void {
  const metrics = loadPPOMetrics()

  // Calculate advantage
  const state: PolicyState = {
    difficulty: profile.currentDifficulty,
    accuracy: profile.performanceMetrics.accuracy,
    speed: profile.performanceMetrics.speed,
    consistency: profile.performanceMetrics.consistency,
    confidence: profile.performanceMetrics.confidenceLevel,
  }

  const stateValue = calculateStateValue(state)
  const advantage = reward - stateValue

  // PPO clipped objective
  const ratio = action.probability / Math.max(oldProbability, 0.001)
  const clipped = Math.max(
    ratio * advantage,
    Math.max(1 - metrics.clipRange, Math.min(1 + metrics.clipRange, ratio)) * advantage,
  )

  // Update metrics
  metrics.episodeCount += 1
  metrics.totalAdvantage += advantage
  metrics.averageAdvantage = metrics.totalAdvantage / metrics.episodeCount

  // Decay clip range over time for more aggressive updates
  metrics.clipRange = CLIP_RANGE * Math.exp(-0.0001 * metrics.episodeCount)

  // Update policy version periodically
  if (metrics.episodeCount % 100 === 0) {
    metrics.policyVersion += 1
  }

  metrics.lastUpdateTime = Date.now()
  savePPOMetrics(metrics)
}

export function getPPOStats() {
  const metrics = loadPPOMetrics()
  return {
    policyVersion: metrics.policyVersion,
    episodeCount: metrics.episodeCount,
    averageAdvantage: metrics.averageAdvantage.toFixed(3),
    clipRange: metrics.clipRange.toFixed(4),
    lastUpdate: new Date(metrics.lastUpdateTime).toLocaleString(),
  }
}

export function clearPPOPolicy(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(PPO_METRICS_KEY)
  localStorage.removeItem(PPO_POLICY_KEY)
}
