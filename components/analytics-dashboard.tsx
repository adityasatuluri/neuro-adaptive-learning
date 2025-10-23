"use client"

import type { UserProfile } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalyticsDashboardProps {
  profile: UserProfile
}

export function AnalyticsDashboard({ profile }: AnalyticsDashboardProps) {
  const successRate =
    profile.totalQuestionsAttempted > 0 ? (profile.correctAnswers / profile.totalQuestionsAttempted) * 100 : 0

  const avgTimeSeconds = Math.round(profile.averageTimePerQuestion)
  const avgTimeMinutes = Math.round(avgTimeSeconds / 60)

  const totalHours = Math.round(profile.totalTimeSpent / 3600)
  const totalMinutes = Math.round((profile.totalTimeSpent % 3600) / 60)

  const recentAttempts = profile.progressHistory.slice(-10)
  const recentSuccessRate =
    recentAttempts.length > 0 ? (recentAttempts.filter((a) => a.correct).length / recentAttempts.length) * 100 : 0

  const easyCount = profile.progressHistory.filter((p) => p.difficulty === "easy").length
  const mediumCount = profile.progressHistory.filter((p) => p.difficulty === "medium").length
  const hardCount = profile.progressHistory.filter((p) => p.difficulty === "hard").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overall Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Overall Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-sm font-semibold text-foreground">{successRate.toFixed(1)}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Recent (Last 10)</span>
                <span className="text-sm font-semibold text-foreground">{recentSuccessRate.toFixed(1)}%</span>
              </div>
              <Progress value={recentSuccessRate} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Time Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Time Analytics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Time Spent</span>
              <span className="font-semibold text-foreground">
                {totalHours}h {totalMinutes}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Time per Question</span>
              <span className="font-semibold text-foreground">{avgTimeMinutes}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions Attempted</span>
              <span className="font-semibold text-foreground">{profile.totalQuestionsAttempted}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Difficulty Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{easyCount}</div>
            <p className="text-sm text-muted-foreground mt-1">Easy</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${profile.totalQuestionsAttempted > 0 ? (easyCount / profile.totalQuestionsAttempted) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{mediumCount}</div>
            <p className="text-sm text-muted-foreground mt-1">Medium</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${profile.totalQuestionsAttempted > 0 ? (mediumCount / profile.totalQuestionsAttempted) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{hardCount}</div>
            <p className="text-sm text-muted-foreground mt-1">Hard</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${profile.totalQuestionsAttempted > 0 ? (hardCount / profile.totalQuestionsAttempted) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            recentAttempts
              .slice()
              .reverse()
              .map((attempt, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${attempt.correct ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-sm text-foreground">Question {attempt.questionId.slice(-2)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{attempt.timeSpent}s</span>
                    <span className="text-xs font-semibold capitalize text-foreground">{attempt.difficulty}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  )
}
