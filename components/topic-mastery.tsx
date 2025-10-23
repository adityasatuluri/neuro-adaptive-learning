"use client"

import type { UserProfile } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { topics } from "@/lib/question-templates"

interface TopicMasteryProps {
  profile: UserProfile
  learningPathTopics: string[]
}

export function TopicMastery({ profile, learningPathTopics }: TopicMasteryProps) {
  const topicStatsMap = profile.topicStats instanceof Map ? profile.topicStats : new Map()

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Topic Mastery</h3>
      <div className="space-y-4">
        {learningPathTopics.map((topicId) => {
          const topicStats = topicStatsMap.get(topicId)
          const topicInfo = topics[topicId as keyof typeof topics]
          const mastery = topicStats?.masteryLevel || 0

          return (
            <div key={topicId}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">{topicInfo?.name || topicId}</span>
                <span className="text-sm font-semibold text-foreground">{Math.round(mastery)}%</span>
              </div>
              <Progress value={mastery} className="h-2" />
              {topicStats && (
                <p className="text-xs text-muted-foreground mt-1">
                  {topicStats.questionsCorrect}/{topicStats.questionsAttempted} correct
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
