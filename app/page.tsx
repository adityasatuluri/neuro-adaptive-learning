"use client"

import { useState, useEffect } from "react"
import { QuestionDisplay } from "@/components/question-display"
import { AdvancedCodeEditor } from "@/components/advanced-code-editor"
import { ProgressStats } from "@/components/progress-stats"
import { TopicMastery } from "@/components/topic-mastery"
import { ModelSelector } from "@/components/model-selector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { questionTemplates } from "@/lib/question-templates"
import {
  getUserProfile,
  saveUserProfile,
  getCurrentLearningPath,
  cacheAIQuestion,
  clearOldAIQuestionCache,
  initializeQuestionCache,
  loadCSVDataset,
  resetUserProgress,
} from "@/lib/storage"
import { updateUserProfile, selectNextQuestion, selectRandomQuestionSameDifficulty } from "@/lib/adaptive-algorithm"
import { generateQuestionByDifficulty } from "@/app/actions/generate-question"
import type { Question, UserProfile } from "@/lib/types"
import { AICodeReview } from "@/components/ai-code-review"
import { validateCodeWithAI } from "@/lib/ai-code-reviewer"
import type { CodeValidationResult } from "@/lib/ai-code-reviewer"

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [selectedModel, setSelectedModel] = useState("grok-oss:120b-cloud")
  const [codeValidation, setCodeValidation] = useState<CodeValidationResult | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)

    initializeQuestionCache()

    loadCSVDataset().catch((error) => {
      console.error("[v0] Error loading CSV dataset:", error)
    })

    loadNextQuestion(userProfile)
  }, [])

  const loadNextQuestion = (userProfile: UserProfile) => {
    const currentPath = getCurrentLearningPath()
    const topicIndex = currentPath.topics.findIndex((t) => !userProfile.topicsCompleted.includes(t))
    const topic = topicIndex >= 0 ? currentPath.topics[topicIndex] : currentPath.topics[0]

    const nextQuestion = selectNextQuestion(questionTemplates, userProfile, topic)

    if (!nextQuestion) {
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

  const handleReloadQuestion = () => {
    if (!profile || !currentQuestion) return

    const currentPath = getCurrentLearningPath()
    const topic = currentQuestion.topic

    const newQuestion = selectRandomQuestionSameDifficulty(questionTemplates, profile, topic, currentQuestion.id)

    if (newQuestion) {
      setCurrentQuestion(newQuestion)
      setStartTime(Date.now())
      setFeedback(null)
    }
  }

  const handleSubmitCode = async (code: string) => {
    if (!currentQuestion || !profile) return

    setIsValidatingCode(true)
    try {
      console.log("[v0] Validating code with AI...")
      const validation = await validateCodeWithAI(
        code,
        currentQuestion.description,
        currentQuestion.expectedOutput,
        selectedModel,
      )

      if (validation) {
        setCodeValidation(validation)
        console.log("[v0] Validation result:", validation.passed)

        if (validation.passed) {
          const timeSpent = Math.round((Date.now() - startTime) / 1000)
          const updatedProfile = updateUserProfile(profile, currentQuestion, true, timeSpent, code)
          setProfile(updatedProfile)
          saveUserProfile(updatedProfile)

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
            message: "Code validation failed. Try again!",
          })
        }
      } else {
        setFeedback({
          type: "error",
          message: "Failed to validate code. Please try again.",
        })
      }
    } catch (error) {
      console.error("[v0] Error validating code:", error)
      setFeedback({
        type: "error",
        message: "Error validating code. Check your connection.",
      })
    } finally {
      setIsValidatingCode(false)
    }
  }

  const handleGenerateQuestion = async () => {
    if (!profile) return

    setIsGeneratingQuestion(true)
    try {
      const currentPath = getCurrentLearningPath()
      const topic = currentPath.topics[0]

      const generatedQuestion = await generateQuestionByDifficulty(profile.currentDifficulty, topic, selectedModel)

      if (generatedQuestion) {
        const aiQuestion = {
          ...generatedQuestion,
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          difficulty: profile.currentDifficulty,
          topic: topic,
          subtopic: "ai-generated",
          type: "code-writing" as const,
          prerequisites: [],
          estimatedTime: 600,
        }

        cacheAIQuestion(aiQuestion)
        clearOldAIQuestionCache()

        setCurrentQuestion(aiQuestion)
        setStartTime(Date.now())
        setFeedback({
          type: "success",
          message: "Question generated successfully!",
        })

        setTimeout(() => {
          setFeedback(null)
        }, 2000)
      } else {
        setFeedback({
          type: "error",
          message: "Failed to generate question. Please ensure Ollama is running locally.",
        })
      }
    } catch (error) {
      console.error("[v0] Error generating question:", error)
      setFeedback({
        type: "error",
        message: "Error generating question. Check Ollama connection.",
      })
    } finally {
      setIsGeneratingQuestion(false)
    }
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Neuro Adaptive System</h1>
            <p className="text-muted-foreground">Master Python through adaptive coding challenges</p>
          </div>
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
              <AdvancedCodeEditor
                initialCode={currentQuestion.starterCode}
                onSubmit={handleSubmitCode}
                onReload={handleReloadQuestion}
                isLoading={isSubmitting}
                testCases={currentQuestion.testCases}
                language="python"
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

            <div className="mt-6">
              <AICodeReview validation={codeValidation} isLoading={isValidatingCode} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Model Selector */}
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />

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

            <Button
              onClick={handleGenerateQuestion}
              disabled={isGeneratingQuestion}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGeneratingQuestion ? "Generating..." : "Generate Question"}
            </Button>

            <Button
              onClick={() => {
                if (confirm("Reset all progress?")) {
                  resetUserProgress()
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
