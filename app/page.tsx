"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { QuestionDisplay } from "@/components/question-display"
import { CodeEditor } from "@/components/code-editor"
import { ProgressStats } from "@/components/progress-stats"
import { TopicMastery } from "@/components/topic-mastery"
import { LearningPathSelector } from "@/components/learning-path-selector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { questionTemplates, predefinedLearningPaths } from "@/lib/question-templates"
import { getUserProfile, saveUserProfile, getCurrentLearningPath, setCurrentLearningPath } from "@/lib/storage"
import { updateUserProfile, selectNextQuestion } from "@/lib/adaptive-algorithm"
import type { Question, UserProfile } from "@/lib/types"

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showPathSelector, setShowPathSelector] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  // Initialize user profile and load first question
  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)
    loadNextQuestion(userProfile)
  }, [])

  const loadNextQuestion = (userProfile: UserProfile) => {
    const currentPath = getCurrentLearningPath()
    const topicIndex = currentPath.topics.findIndex((t) => !userProfile.topicsCompleted.includes(t))
    const topic = topicIndex >= 0 ? currentPath.topics[topicIndex] : currentPath.topics[0]

    const nextQuestion = selectNextQuestion(questionTemplates, userProfile, topic)

    if (!nextQuestion) {
      // Reset progress history to allow re-attempting questions
      const resetProfile = { ...userProfile, progressHistory: [] }
      setProfile(resetProfile)
      saveUserProfile(resetProfile)
      const retryQuestion = selectNextQuestion(questionTemplates, resetProfile, topic)
      setCurrentQuestion(retryQuestion)
    } else {
      setCurrentQuestion(nextQuestion)
    }

    setStartTime(Date.now())
    setFeedback(null)
  }

  const handleSubmitCode = async (code: string) => {
    if (!currentQuestion || !profile) return

    setIsSubmitting(true)

    // Simulate code execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    const isCorrect = code.includes("def") && code.trim().length > 20

    const updatedProfile = updateUserProfile(profile, currentQuestion, isCorrect, timeSpent, code)

    setProfile(updatedProfile)
    saveUserProfile(updatedProfile)

    if (isCorrect) {
      setFeedback({
        type: "success",
        message: `Correct! Time: ${timeSpent}s. Difficulty: ${updatedProfile.currentDifficulty}`,
      })
      setTimeout(() => {
        loadNextQuestion(updatedProfile)
      }, 2000)
    } else {
      setFeedback({
        type: "error",
        message: "Not quite right. Try again or check the hints!",
      })
    }

    setIsSubmitting(false)
  }

  const handlePathChange = (pathId: string) => {
    setCurrentLearningPath(pathId)
    if (profile) {
      const updatedProfile = { ...profile, currentLearningPath: pathId }
      setProfile(updatedProfile)
      saveUserProfile(updatedProfile)
      loadNextQuestion(updatedProfile)
    }
    setShowPathSelector(false)
  }

  if (!profile || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Neuro Adaptive Learning</h1>
            <p className="text-muted-foreground">
              Master Python through personalized, adaptive coding challenges • Path: {currentPath.name}
            </p>
          </div>
          <Link href="/analytics">
            <Button variant="outline">View Analytics</Button>
          </Link>
        </div>

        {/* Progress Stats */}
        <div className="mb-8">
          <ProgressStats profile={profile} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Question Section */}
          <div className="lg:col-span-2">
            <QuestionDisplay question={currentQuestion} />
            <div className="mt-6">
              <CodeEditor
                initialCode={currentQuestion.starterCode}
                onSubmit={handleSubmitCode}
                isLoading={isSubmitting}
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <Card
                className={`mt-4 p-4 ${
                  feedback.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <p className="font-semibold">{feedback.message}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topic Mastery */}
            <TopicMastery profile={profile} learningPathTopics={currentPath.topics} />

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-semibold text-foreground">
                    {profile.totalQuestionsAttempted > 0
                      ? ((profile.correctAnswers / profile.totalQuestionsAttempted) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-semibold text-foreground capitalize">{profile.currentDifficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-semibold text-foreground">
                    {profile.progressHistory.filter((p) => p.correct).length}
                  </span>
                </div>
              </div>
            </Card>

            <Button onClick={() => setShowPathSelector(!showPathSelector)} variant="outline" className="w-full">
              {showPathSelector ? "Hide Paths" : "Change Learning Path"}
            </Button>

            {showPathSelector && (
              <LearningPathSelector
                paths={predefinedLearningPaths}
                currentPathId={profile.currentLearningPath}
                onSelectPath={handlePathChange}
              />
            )}

            <Button
              onClick={() => {
                if (confirm("Reset all progress?")) {
                  localStorage.removeItem("neuro_user_profile")
                  window.location.reload()
                }
              }}
              variant="outline"
              className="w-full text-destructive"
            >
              Reset Progress
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
