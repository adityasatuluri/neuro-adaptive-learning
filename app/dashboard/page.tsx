"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getUserProfile, getCurrentLearningPath } from "@/lib/storage"
import { topics } from "@/lib/question-templates"
import type { UserProfile } from "@/lib/types"

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)
  }, [])

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const currentPath = getCurrentLearningPath()
  const successRate =
    profile.totalQuestionsAttempted > 0 ? (profile.correctAnswers / profile.totalQuestionsAttempted) * 100 : 0

  const topicsWithStats = currentPath.topics.map((topicId) => {
    const topicStats = profile.topicStats.get(topicId)
    const topicInfo = topics[topicId as keyof typeof topics]
    return {
      id: topicId,
      name: topicInfo?.name || topicId,
      stats: topicStats,
    }
  })

  const completedTopics = topicsWithStats.filter((t) => t.stats && t.stats.masteryLevel >= 80).length
  const totalTopics = topicsWithStats.length

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Learning Dashboard</h1>
            <p className="text-muted-foreground">Your personalized learning journey</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button>Back to Learning</Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline">View Analytics</Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Learning Path</p>
            <p className="text-2xl font-bold text-foreground">{currentPath.name}</p>
            <p className="text-xs text-muted-foreground mt-2">{currentPath.estimatedHours}h estimated</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
            <p className="text-2xl font-bold text-foreground">
              {completedTopics}/{totalTopics}
            </p>
            <Progress value={(completedTopics / totalTopics) * 100} className="mt-2" />
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
            <p className="text-2xl font-bold text-foreground">{successRate.toFixed(1)}%</p>
            <Progress value={successRate} className="mt-2" />
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Current Level</p>
            <p className="text-2xl font-bold text-foreground capitalize">{profile.currentDifficulty}</p>
            <p className="text-xs text-muted-foreground mt-2">{profile.totalQuestionsAttempted} questions</p>
          </Card>
        </div>

        {/* Topic Progress */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Topic Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicsWithStats.map((topic) => {
              const mastery = topic.stats?.masteryLevel || 0
              const isCompleted = mastery >= 80

              return (
                <div key={topic.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{topic.name}</h3>
                      {topic.stats && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {topic.stats.questionsCorrect}/{topic.stats.questionsAttempted} correct
                        </p>
                      )}
                    </div>
                    {isCompleted && <span className="text-xs font-semibold text-green-600">Mastered</span>}
                  </div>

                  <Progress value={mastery} className="h-2 mb-2" />

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Mastery: {Math.round(mastery)}%</span>
                    {topic.stats && <span>Avg: {Math.round(topic.stats.averageTimePerQuestion)}s</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Learning Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Learning Insights</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions Attempted</span>
                <span className="font-semibold text-foreground">{profile.totalQuestionsAttempted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correct Answers</span>
                <span className="font-semibold text-foreground">{profile.correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Time per Question</span>
                <span className="font-semibold text-foreground">
                  {Math.round(profile.averageTimePerQuestion / 60)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Time Spent</span>
                <span className="font-semibold text-foreground">{Math.round(profile.totalTimeSpent / 3600)}h</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
            <div className="space-y-3 text-sm">
              {completedTopics === totalTopics ? (
                <p className="text-muted-foreground">
                  Congratulations! You've mastered all topics in this path. Consider starting a new learning path.
                </p>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Focus on topics with lower mastery levels to improve your overall progress.
                  </p>
                  <div className="mt-4">
                    {topicsWithStats
                      .filter((t) => !t.stats || t.stats.masteryLevel < 80)
                      .slice(0, 3)
                      .map((topic) => (
                        <div key={topic.id} className="text-xs text-foreground mb-2">
                          • {topic.name} ({Math.round(topic.stats?.masteryLevel || 0)}%)
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
