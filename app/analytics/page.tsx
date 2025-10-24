"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { TopicMastery } from "@/components/topic-mastery"
import { getUserProfile, getCurrentLearningPath } from "@/lib/storage"
import type { UserProfile } from "@/lib/types"
import Link from "next/link"

export default function AnalyticsPage() {
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

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Learning Analytics</h1>
            <p className="text-muted-foreground">Track your progress with customizable visualizations</p>
          </div>
          <Link href="/">
            <Button>Back to Learning</Button>
          </Link>
        </div>

        {/* Main Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AnalyticsDashboard profile={profile} />
          </div>

          {/* Sidebar */}
          <div>
            <TopicMastery profile={profile} learningPathTopics={currentPath.topics} />
          </div>
        </div>
      </div>
    </main>
  )
}
