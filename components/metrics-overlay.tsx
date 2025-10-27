"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserProfile } from "@/lib/types"
import { loadRLMetrics } from "@/lib/reinforcement-learning"
import { loadPPOMetrics } from "@/lib/ppo-policy"
import { TrendingUp, Target, Brain, Activity } from "lucide-react"

interface MetricsOverlayProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
}

export function MetricsOverlay({ isOpen, onClose, profile }: MetricsOverlayProps) {
  const rlMetrics = loadRLMetrics()
  const ppoMetrics = loadPPOMetrics()

  const performanceMetrics = profile?.performanceMetrics || {
    accuracy: 0,
    speed: 0,
    consistency: 0,
    learningVelocity: 0,
  }

  const learningAnalytics = profile?.learningAnalytics || {
    learningStyle: "Adaptive",
    sessionsCompleted: 0,
    totalSessionTime: 0,
    averageSessionDuration: 0,
    estimatedMasteryDate: Date.now(),
    peakPerformanceTime: "N/A",
    weakAreas: [],
    strongAreas: [],
  }

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (ms: number | null | undefined) => {
    if (!ms || ms === 0) return "0s"
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">System Metrics & RL/PPO Analytics</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-blue-600">{(performanceMetrics.accuracy ?? 0).toFixed(1)}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Speed</div>
                <div className="text-2xl font-bold text-green-600">{(performanceMetrics.speed ?? 0).toFixed(1)}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Consistency</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(performanceMetrics.consistency ?? 0).toFixed(1)}%
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Learning Velocity</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(performanceMetrics.learningVelocity ?? 0).toFixed(1)}%
                </div>
              </Card>
            </div>
          </div>

          {/* Reinforcement Learning Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              Reinforcement Learning (Q-Learning)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Episodes</div>
                <div className="text-2xl font-bold">{rlMetrics?.episodeCount ?? 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Exploration Rate</div>
                <div className="text-2xl font-bold">{((rlMetrics?.explorationRate ?? 0) * 100).toFixed(2)}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Average Reward</div>
                <div className="text-2xl font-bold">{(rlMetrics?.averageReward ?? 0).toFixed(2)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Reward</div>
                <div className="text-2xl font-bold">{(rlMetrics?.totalReward ?? 0).toFixed(2)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Q-Table States</div>
                <div className="text-2xl font-bold">{rlMetrics?.qTable?.size ?? 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Learning Rate</div>
                <div className="text-2xl font-bold">0.10</div>
              </Card>
            </div>
          </div>

          {/* PPO Policy Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-500" />
              Proximal Policy Optimization (PPO)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Policy Version</div>
                <div className="text-2xl font-bold">{ppoMetrics?.policyVersion ?? 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Episodes Trained</div>
                <div className="text-2xl font-bold">{ppoMetrics?.episodeCount ?? 0}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Clip Range</div>
                <div className="text-2xl font-bold">{(ppoMetrics?.clipRange ?? 0).toFixed(3)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Entropy Bonus</div>
                <div className="text-2xl font-bold">{(ppoMetrics?.entropyBonus ?? 0).toFixed(4)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Last Update</div>
                <div className="text-xs font-semibold">{formatDate(ppoMetrics?.lastUpdateTime)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Discount Factor</div>
                <div className="text-2xl font-bold">0.99</div>
              </Card>
            </div>
          </div>

          {/* Learning Analytics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Learning Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Learning Style</div>
                <Badge variant="outline" className="text-base py-1 px-3">
                  {learningAnalytics.learningStyle}
                </Badge>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Sessions Completed</div>
                <div className="text-2xl font-bold">{learningAnalytics.sessionsCompleted}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Total Session Time</div>
                <div className="text-lg font-bold">{formatTime(learningAnalytics.totalSessionTime)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Avg Session Duration</div>
                <div className="text-lg font-bold">{formatTime(learningAnalytics.averageSessionDuration)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Estimated Mastery Date</div>
                <div className="text-sm font-semibold">{formatDate(learningAnalytics.estimatedMasteryDate)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Peak Performance Time</div>
                <Badge variant="secondary">{learningAnalytics.peakPerformanceTime}</Badge>
              </Card>
            </div>
          </div>

          {/* Weak & Strong Areas - Fixed to display all topics properly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3 text-red-600">Weak Areas</h4>
              <div className="space-y-2 flex flex-wrap gap-2">
                {learningAnalytics.weakAreas && learningAnalytics.weakAreas.length > 0 ? (
                  learningAnalytics.weakAreas.map((area) => (
                    <Badge key={area} variant="destructive">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No weak areas identified</p>
                )}
              </div>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold mb-3 text-green-600">Strong Areas</h4>
              <div className="space-y-2 flex flex-wrap gap-2">
                {learningAnalytics.strongAreas && learningAnalytics.strongAreas.length > 0 ? (
                  learningAnalytics.strongAreas.map((area) => (
                    <Badge key={area} variant="default">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No strong areas identified yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Progress Summary */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <h4 className="font-semibold mb-3">Progress Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Attempts</div>
                <div className="text-xl font-bold">{profile?.totalQuestionsAttempted ?? 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Correct Answers</div>
                <div className="text-xl font-bold text-green-600">{profile?.correctAnswers ?? 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Success Rate</div>
                <div className="text-xl font-bold">
                  {(profile?.totalQuestionsAttempted ?? 0) > 0
                    ? (((profile?.correctAnswers ?? 0) / (profile?.totalQuestionsAttempted ?? 1)) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Current Streak</div>
                <div className="text-xl font-bold text-orange-600">{profile?.streakCount ?? 0}</div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
