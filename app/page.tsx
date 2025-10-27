"use client"

import { useState, useEffect } from "react"
import { QuestionDisplay } from "@/components/question-display"
import { AdvancedCodeEditor } from "@/components/advanced-code-editor"
import { SidebarPanel } from "@/components/sidebar-panel"
import { HeaderWithActions } from "@/components/header-with-actions"
import { Card } from "@/components/ui/card"
import { questionTemplates } from "@/lib/question-templates"
import { useToast } from "@/hooks/use-toast"
import {
  getUserProfile,
  saveUserProfile,
  getCurrentLearningPath,
  cacheAIQuestion,
  clearOldAIQuestionCache,
  initializeQuestionCache,
  loadCSVDataset,
  getAllAvailableQuestions,
} from "@/lib/storage"
import { updateUserProfile, selectNextQuestion } from "@/lib/adaptive-algorithm"
import { generateQuestionByDifficulty } from "@/app/actions/generate-question"
import type { Question, UserProfile } from "@/lib/types"
import { AICodeReview } from "@/components/ai-code-review"
import { validateCodeWithAI } from "@/lib/ai-code-reviewer"
import type { CodeValidationResult } from "@/lib/ai-code-reviewer"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-oss:120b-cloud")
  const [codeValidation, setCodeValidation] = useState<CodeValidationResult | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedTime, setPausedTime] = useState<number>(0)
  const [totalPausedDuration, setTotalPausedDuration] = useState<number>(0)
  const [solutionViewed, setSolutionViewed] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [currentTimer, setCurrentTimer] = useState<number>(0)

  useEffect(() => {
    if (isPaused || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime - totalPausedDuration
      setCurrentTimer(elapsed)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, isPaused, totalPausedDuration])

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)

    initializeQuestionCache()

    loadCSVDataset().catch((error) => {
      console.error("[v0] Error loading CSV dataset:", error)
    })

    generateInitialQuestion(userProfile)
  }, [])

  const generateInitialQuestion = async (userProfile: UserProfile) => {
    setIsGeneratingQuestion(true)
    try {
      console.log("[v0] Generating initial AI question on app start...")
      const currentPath = getCurrentLearningPath()
      const topic = currentPath.topics[0]

      const generatedQuestion = await generateQuestionByDifficulty(
        userProfile.currentDifficulty,
        topic,
        "html-model:latest",
      )

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

    let nextQuestion = selectNextQuestion(questionTemplates, userProfile, topic)

    if (!nextQuestion) {
      // Try to get from all available questions (includes CSV and cached AI questions)
      const allQuestions = getAllAvailableQuestions()
      if (allQuestions.length > 0) {
        nextQuestion = selectNextQuestion(allQuestions, userProfile, topic)
      }
    }

    if (!nextQuestion) {
      // Last resort: reset profile and try again
      const resetProfile = { ...userProfile, progressHistory: [] }
      setProfile(resetProfile)
      saveUserProfile(resetProfile)
      const retryQuestion = selectNextQuestion(questionTemplates, resetProfile, topic)
      setCurrentQuestion(retryQuestion)
    } else {
      setCurrentQuestion(nextQuestion)
    }

    setStartTime(Date.now())
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

      const generatedQuestion = await generateQuestionByDifficulty(
        userProfile.currentDifficulty,
        topic,
        "html-model:latest",
      )

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

    setStartTime(Date.now())
    setIsPaused(false)
    setPausedTime(0)
    setSolutionViewed(false)
    setCodeValidation(null)
    setTotalPausedDuration(0)
    setCurrentTimer(0)

    toast({
      title: "Question Reset",
      description: "Your progress on this question has been reset. Good luck!",
    })

    console.log("[v0] Question progress reset - timer restarted, code editor cleared")
  }

  const handleResetAllProgress = () => {
    const newProfile: UserProfile = {
      currentDifficulty: "easy",
      totalQuestionsAttempted: 0,
      correctAnswers: 0,
      averageTimePerQuestion: 0,
      progressHistory: [],
      currentLearningPath: "path-beginner",
      topicsCompleted: [],
      topicStats: new Map(),
      streakCount: 0,
      lastActivityDate: Date.now(),
      totalTimeSpent: 0,
      performanceMetrics: {
        accuracy: 0,
        speed: 0,
        consistency: 0,
        learningVelocity: 0,
        confidenceLevel: 50,
        errorPatterns: new Map(),
        conceptMastery: new Map(),
      },
      learningAnalytics: {
        totalSessionTime: 0,
        sessionsCompleted: 0,
        averageSessionDuration: 0,
        peakPerformanceTime: "afternoon",
        weakAreas: [],
        strongAreas: [],
        recommendedFocusAreas: [],
        estimatedMasteryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        learningStyle: "steady-learner",
      },
      adaptiveLevel: 1,
      learningStyle: "steady-learner",
      recommendedDailyGoal: 5,
      lastAnalyticsUpdate: Date.now(),
      customLearningPaths: [],
      lastPathGenerationTime: Date.now(),
    }

    setProfile(newProfile)
    saveUserProfile(newProfile)
    setCodeValidation(null)
    setTotalPausedDuration(0)
    setSolutionViewed(false)
    setIsPaused(false)
    setCurrentTimer(0)

    toast({
      title: "Progress Reset",
      description: "All your progress has been cleared. Starting fresh!",
      variant: "destructive",
    })

    console.log("[v0] All user progress has been reset")

    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  const handlePauseResume = () => {
    if (isPaused) {
      const pauseDuration = Date.now() - pausedTime
      setTotalPausedDuration(totalPausedDuration + pauseDuration)
      setIsPaused(false)
      setPausedTime(0)
      toast({
        title: "Session Resumed",
        description: "Welcome back! Continue coding.",
      })
    } else {
      setIsPaused(true)
      setPausedTime(Date.now())
      toast({
        title: "Session Paused",
        description: "Take your time. Your progress is saved.",
      })
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
            currentQuestion.title,
          )
          setProfile(updatedProfile)
          saveUserProfile(updatedProfile)

          toast({
            title: "Correct!",
            description: `Time: ${timeSpent}s. Difficulty: ${
              updatedProfile.currentDifficulty
            }${solutionViewed ? " (Solution viewed - progress reduced)" : ""}`,
          })

          setTimeout(() => {
            generateNextAIQuestion(updatedProfile)
            setTotalPausedDuration(0)
            setCurrentTimer(0)
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
            currentQuestion.title,
          )
          setProfile(updatedProfile)
          saveUserProfile(updatedProfile)

          toast({
            title: "Incorrect",
            description: "Code validation failed. Try again!",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Validation Error",
          description: "Failed to validate code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error validating code:", error)
      toast({
        title: "Error",
        description: "Error validating code. Check your connection.",
        variant: "destructive",
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

      const generatedQuestion = await generateQuestionByDifficulty(
        profile.currentDifficulty,
        topic,
        "html-model:latest",
      )

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
        setCodeValidation(null)
        setCurrentTimer(0)
        toast({
          title: "Question Generated",
          description: "New question loaded successfully!",
        })
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate question. Please ensure Ollama is running locally.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error generating question:", error)
      toast({
        title: "Error",
        description: "Error generating question. Check Ollama connection.",
        variant: "destructive",
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

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <HeaderWithActions
          onGenerate={handleGenerateQuestion}
          onPauseResume={handlePauseResume}
          onReload={handleReloadQuestion}
          onResetProgress={handleResetAllProgress}
          isGenerating={isGeneratingQuestion}
          isPaused={isPaused}
          progressHistory={profile.progressHistory}
        />

        {isPaused && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <Card className="p-8 text-center max-w-md relative">
              <Button
                onClick={handlePauseResume}
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4"
                title="Close"
              >
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-3xl font-bold text-foreground mb-4">Take a Break</h2>
              <p className="text-muted-foreground mb-6">
                You've paused your coding session. Take a moment to rest and come back when you're ready!
              </p>
              <Button onClick={handlePauseResume} className="w-full">
                Resume Coding
              </Button>
            </Card>
          </div>
        )}

        <div className="flex gap-6">
          <SidebarPanel
            profile={profile}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            currentTimer={currentTimer}
            isPaused={isPaused}
          />

          {/* Main Content: Two columns */}
          <div className={`flex-1 space-y-6 ${isPaused ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question Column */}
              <div className="space-y-4">
                <QuestionDisplay question={currentQuestion} onSolutionView={handleSolutionView} />
              </div>

              {/* Editor Column */}
              <div className="space-y-4">
                <AdvancedCodeEditor
                  initialCode={currentQuestion.starterCode}
                  onSubmit={handleSubmitCode}
                  onReload={handleReloadQuestion}
                  isLoading={isSubmitting}
                  testCases={currentQuestion.testCases}
                  language="python"
                  isValidating={isValidatingCode}
                />
                {codeValidation && (
                  <div className="mt-4">
                    <AICodeReview validation={codeValidation} isLoading={isValidatingCode} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
