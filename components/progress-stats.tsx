"use client"

import type { UserProfile } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressStatsProps {
  profile: UserProfile
}

export function ProgressStats({ profile }: ProgressStatsProps) {
  const successRate =
    profile.totalQuestionsAttempted > 0 ? (profile.correctAnswers / profile.totalQuestionsAttempted) * 100 : 0

  const avgMinutes = Math.round(profile.averageTimePerQuestion / 60)
  const totalHours = Math.round(profile.totalTimeSpent / 3600)

  // Calculate progress to next difficulty level based on accuracy and attempts
  const getProgressToNextDifficulty = () => {
    const recentAttempts = profile.progressHistory.slice(-20)

    if (recentAttempts.length === 0) {
      return { progress: 0, questionsNeeded: 10, questionsCompleted: 0, nextLevel: "medium" }
    }

    const correctCount = recentAttempts.filter((p) => p.correct).length
    const accuracy = (correctCount / recentAttempts.length) * 100

    if (profile.currentDifficulty === "easy") {
      // Need 80%+ accuracy on 10 easy questions to progress to medium
      const questionsNeeded = 10
      const questionsCompleted = Math.min(recentAttempts.length, questionsNeeded)
      const accuracyProgress = accuracy >= 80 ? 100 : (accuracy / 80) * 50
      const volumeProgress = (questionsCompleted / questionsNeeded) * 50
      const progress = Math.min(100, accuracyProgress + volumeProgress)

      return {
        progress,
        questionsNeeded,
        questionsCompleted,
        nextLevel: "medium",
      }
    } else if (profile.currentDifficulty === "medium") {
      // Need 75%+ accuracy on 15 medium questions to progress to hard
      const questionsNeeded = 15
      const questionsCompleted = Math.min(recentAttempts.length, questionsNeeded)
      const accuracyProgress = accuracy >= 75 ? 100 : (accuracy / 75) * 50
      const volumeProgress = (questionsCompleted / questionsNeeded) * 50
      const progress = Math.min(100, accuracyProgress + volumeProgress)

      return {
        progress,
        questionsNeeded,
        questionsCompleted,
        nextLevel: "hard",
      }
    } else {
      // Hard level - show mastery progress
      const questionsNeeded = 20
      const questionsCompleted = Math.min(recentAttempts.length, questionsNeeded)
      const accuracyProgress = accuracy >= 85 ? 100 : (accuracy / 85) * 100
      const progress = Math.min(100, accuracyProgress)

      return {
        progress,
        questionsNeeded,
        questionsCompleted,
        nextLevel: "expert",
      }
    }
  }

  const difficultyProgress = getProgressToNextDifficulty()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Current Level</p>
        <p className="text-2xl font-bold text-foreground capitalize">{profile.currentDifficulty}</p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Questions Attempted</p>
        <p className="text-2xl font-bold text-foreground">{profile.totalQuestionsAttempted}</p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
        <p className="text-2xl font-bold text-foreground">{successRate.toFixed(1)}%</p>
        <Progress value={successRate} className="mt-2" />
      </Card>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Avg Time</p>
        <p className="text-2xl font-bold text-foreground">{avgMinutes}m</p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Total Time</p>
        <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <p className="text-sm text-muted-foreground mb-2">Progress to {difficultyProgress.nextLevel}</p>
        <p className="text-2xl font-bold text-foreground">{Math.round(difficultyProgress.progress)}%</p>
        <Progress value={difficultyProgress.progress} className="mt-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {difficultyProgress.questionsCompleted}/{difficultyProgress.questionsNeeded}
        </p>
      </Card>
    </div>
  )
}
