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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Current Difficulty</p>
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
        <p className="text-sm text-muted-foreground mb-2">Avg Time per Question</p>
        <p className="text-2xl font-bold text-foreground">{avgMinutes}m</p>
      </Card>
    </div>
  )
}
