"use client"

import type { UserProfile } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { TrendingUp, Zap, Target, Clock } from "lucide-react"

interface DashboardHeaderProps {
  profile: UserProfile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const successRate =
    profile.totalQuestionsAttempted > 0
      ? ((profile.correctAnswers / profile.totalQuestionsAttempted) * 100).toFixed(1)
      : 0

  const stats = [
    {
      label: "Current Level",
      value: profile.currentDifficulty.charAt(0).toUpperCase() + profile.currentDifficulty.slice(1),
      icon: Target,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Attempts",
      value: profile.totalQuestionsAttempted,
      icon: Zap,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Avg Time",
      value: profile.averageTimePerQuestion > 0 ? `${Math.round(profile.averageTimePerQuestion)}s` : "—",
      icon: Clock,
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-foreground mb-2">Neuro Adaptive System</h1>
        <p className="text-lg text-muted-foreground">Master Python through adaptive coding challenges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 border-0 bg-gradient-to-br overflow-hidden relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-6 h-6 text-muted-foreground opacity-40" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
