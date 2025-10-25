"use client"

import type { UserProfile } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { TrendingUp, Zap, Target } from "lucide-react"

interface HeaderSectionProps {
  profile: UserProfile
}

export function HeaderSection({ profile }: HeaderSectionProps) {
  const successRate =
    profile.totalQuestionsAttempted > 0
      ? ((profile.correctAnswers / profile.totalQuestionsAttempted) * 100).toFixed(1)
      : 0

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2">Neuro Adaptive System</h1>
        <p className="text-muted-foreground">Master Python through adaptive coding challenges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Level</p>
              <p className="text-2xl font-bold text-foreground capitalize">{profile.currentDifficulty}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-foreground">{successRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
              <p className="text-2xl font-bold text-foreground">{profile.totalQuestionsAttempted}</p>
            </div>
            <Zap className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>
    </div>
  )
}
