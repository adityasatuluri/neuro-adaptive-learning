"use client"

import type { UserProfile } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsDashboardProps {
  profile: UserProfile
}

export function AnalyticsDashboard({ profile }: AnalyticsDashboardProps) {
  const [selectedGraph, setSelectedGraph] = useState<"performance" | "difficulty" | "progress" | "time">("performance")

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

  const performanceData = profile.progressHistory.slice(-20).map((attempt, idx) => ({
    attempt: idx + 1,
    correct: attempt.correct ? 100 : 0,
    timeSpent: attempt.timeSpent,
  }))

  const difficultyData = [
    { name: "Easy", value: easyCount, fill: "#22c55e" },
    { name: "Medium", value: mediumCount, fill: "#eab308" },
    { name: "Hard", value: hardCount, fill: "#ef4444" },
  ]

  const progressData = profile.progressHistory.slice(-15).map((attempt, idx) => ({
    attempt: idx + 1,
    difficulty: attempt.difficulty === "easy" ? 1 : attempt.difficulty === "medium" ? 2 : 3,
    correct: attempt.correct ? 1 : 0,
  }))

  const timeData = profile.progressHistory.slice(-10).map((attempt, idx) => ({
    attempt: idx + 1,
    timeSpent: attempt.timeSpent,
  }))

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

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Analytics Visualization</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGraph("performance")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedGraph === "performance"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setSelectedGraph("difficulty")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedGraph === "difficulty"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Difficulty
            </button>
            <button
              onClick={() => setSelectedGraph("progress")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedGraph === "progress"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setSelectedGraph("time")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedGraph === "time"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Time
            </button>
          </div>
        </div>

        {selectedGraph === "performance" && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="correct" stroke="#22c55e" name="Correct %" />
              <Line type="monotone" dataKey="timeSpent" stroke="#3b82f6" name="Time (s)" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {selectedGraph === "difficulty" && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={difficultyData} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}

        {selectedGraph === "progress" && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="difficulty" fill="#8b5cf6" name="Difficulty Level" />
              <Bar dataKey="correct" fill="#22c55e" name="Correct" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {selectedGraph === "time" && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="timeSpent" stroke="#f59e0b" name="Time Spent (s)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

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
    </div>
  )
}
