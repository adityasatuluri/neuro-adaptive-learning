"use client"

import { useState, useEffect } from "react"
import { QuestionDisplay } from "@/components/question-display"
import { AdvancedCodeEditor } from "@/components/advanced-code-editor"
import { ProgressStats } from "@/components/progress-stats"
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
import {
  updateUserProfile,
  selectNextQuestion,
  selectRandomQuestionSameDifficulty,
  calculateAdaptiveMaxProblems,
} from "@/lib/adaptive-algorithm"
import { generateQuestionByDifficulty } from "@/app/actions/generate-question"
import type { Question, UserProfile } from "@/lib/types"
import { AICodeReview } from "@/components/ai-code-review"
import { validateCodeWithAI } from "@/lib/ai-code-reviewer"
import type { CodeValidationResult } from "@/lib/ai-code-reviewer"
import { Pause, Play } from "lucide-react"

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-oss:120b-cloud")
  const [codeValidation, setCodeValidation] = useState<CodeValidationResult | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedTime, setPausedTime] = useState<number>(0)
  const [totalPausedDuration, setTotalPausedDuration] = useState<number>(0)
  const [questionsInSession, setQuestionsInSession] = useState(0)
  const [maxProblemsPerSession, setMaxProblemsPerSession] = useState(10)
  const [solutionViewed, setSolutionViewed] = useState(false)

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)

    initializeQuestionCache()

    loadCSVDataset().catch((error) => {
      console.error("[v0] Error loading CSV dataset:", error)
    })

    generateInitialQuestion(userProfile)
    const adaptiveMax = calculateAdaptiveMaxProblems(userProfile)
    setMaxProblemsPerSession(adaptiveMax)
  }, [])

  const generateInitialQuestion = async (userProfile: UserProfile) => {
    setIsGeneratingQuestion(true)
    try {
      console.log("[v0] Generating initial AI question on app start...")
      const currentPath = getCurrentLearningPath()
      const topic = currentPath.topics[0]

      const generatedQuestion = await generateQuestionByDifficulty(userProfile.currentDifficulty, topic, selectedModel)

      if (generatedQuestion) {
        const aiQuestion = {
          ...generatedQuestion,
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          difficulty: userProfile.currentDifficulty,
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
        setSolutionViewed(false)
        console.log("[v0] Initial AI question generated successfully")
      } else {
        console.warn("[v0] Failed to generate initial question, falling back to templates")
        loadNextQuestion(userProfile)
      }
    } catch (error) {
      console.error("[v0] Error generating initial question:", error)
      loadNextQuestion(userProfile)
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

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
    setIsPaused(false)
    setPausedTime(0)
    setSolutionViewed(false)
  }

  const generateNextAIQuestion = async (userProfile: UserProfile) => {
    setIsGeneratingQuestion(true)
    try {
      console.log("[v0] Generating next AI question after successful validation...")
      const currentPath = getCurrentLearningPath()
      const topic = currentPath.topics[0]

      const generatedQuestion = await generateQuestionByDifficulty(userProfile.currentDifficulty, topic, selectedModel)

      if (generatedQuestion) {
        const aiQuestion = {
          ...generatedQuestion,
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          difficulty: userProfile.currentDifficulty,
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
        setSolutionViewed(false)
        console.log("[v0] Next AI question generated successfully")
      } else {
        console.warn("[v0] Failed to generate next question, falling back to templates")
        loadNextQuestion(userProfile)
      }
    } catch (error) {
      console.error("[v0] Error generating next question:", error)
      loadNextQuestion(userProfile)
    } finally {
      setIsGeneratingQuestion(false)
    }
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
      setIsPaused(false)
      setPausedTime(0)
      setSolutionViewed(false)
    }
  }

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume: add paused duration to total
      const pauseDuration = Date.now() - pausedTime
      setTotalPausedDuration(totalPausedDuration + pauseDuration)
      setIsPaused(false)
      setPausedTime(0)
    } else {
      // Pause: record pause start time
      setIsPaused(true)
      setPausedTime(Date.now())
    }
  }

  const handleSolutionView = () => {
    setSolutionViewed(true)
    console.log("[v0] Solution viewed - will impact progress")
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
          const totalTime = Date.now() - startTime
          const timeSpent = Math.round((totalTime - totalPausedDuration) / 1000)
          const updatedProfile = updateUserProfile(
            profile,
            currentQuestion,
            true,
            timeSpent,
            code,
            50,
            undefined,
            [],
            solutionViewed,
          )
          setProfile(updatedProfile)
          saveUserProfile(updatedProfile)

          const adaptiveMax = calculateAdaptiveMaxProblems(updatedProfile)
          setMaxProblemsPerSession(adaptiveMax)
          setQuestionsInSession(questionsInSession + 1)

          setFeedback({
            type: "success",
            message: `Correct! Time: ${timeSpent}s. Difficulty: ${updatedProfile.currentDifficulty}${solutionViewed ? " (Solution viewed - progress reduced)" : ""}`,
          })

          setTimeout(() => {
            generateNextAIQuestion(updatedProfile)
            setTotalPausedDuration(0)
          }, 2000)
        } else {
          const totalTime = Date.now() - startTime
          const timeSpent = Math.round((totalTime - totalPausedDuration) / 1000)
          const updatedProfile = updateUserProfile(
            profile,
            currentQuestion,
            false,
            timeSpent,
            code,
            50,
            undefined,
            [],
            solutionViewed,
          )
          setProfile(updatedProfile)
          saveUserProfile(updatedProfile)

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
        setSolutionViewed(false)
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
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Questions: {questionsInSession}/{maxProblemsPerSession}
            </p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="mb-8">
          <ProgressStats profile={profile} />
        </div>

        {isPaused && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <Card className="p-8 text-center max-w-md">
              <h2 className="text-3xl font-bold text-foreground mb-4">Take a Break</h2>
              <p className="text-muted-foreground mb-6">
                You've paused your coding session. Take a moment to rest and come back when you're ready!
              </p>
              <Button
                onClick={handlePauseResume}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Coding
              </Button>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 ${isPaused ? "opacity-50 pointer-events-none" : ""}`}
        >
          {/* Question Section */}
          <div className="lg:col-span-2">
            <QuestionDisplay question={currentQuestion} onSolutionView={handleSolutionView} />
            <div className="mt-6">
              <AdvancedCodeEditor
                initialCode={currentQuestion.starterCode}
                onSubmit={handleSubmitCode}
                onReload={handleReloadQuestion}
                isLoading={isSubmitting}
                testCases={currentQuestion.testCases}
                language="python"
                isValidating={isValidatingCode}
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
              onClick={handlePauseResume}
              className={`w-full ${
                isPaused
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              }`}
              size="lg"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Take a Break
                </>
              )}
            </Button>

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
