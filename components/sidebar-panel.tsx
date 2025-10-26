"use client"

import type { UserProfile } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Zap, Target, Clock, ChevronLeft, ChevronRight, Timer } from "lucide-react"
import { useState, useEffect } from "react"
import { getAvailableModels } from "@/lib/ollama-client"
import { Button } from "@/components/ui/button"

interface SidebarPanelProps {
  profile: UserProfile
  selectedModel: string
  onModelChange: (model: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  currentTimer: number
  isPaused: boolean
}

export function SidebarPanel({
  profile,
  selectedModel,
  onModelChange,
  isCollapsed,
  onToggleCollapse,
  currentTimer,
  isPaused,
}: SidebarPanelProps) {
  const [models, setModels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true)
      try {
        const availableModels = await getAvailableModels()
        setModels(availableModels)
      } catch (error) {
        console.error("[v0] Error fetching models:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  const successRate =
    profile.totalQuestionsAttempted > 0
      ? ((profile.correctAnswers / profile.totalQuestionsAttempted) * 100).toFixed(1)
      : 0

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const currentTimerDisplay = formatTime(Math.floor(currentTimer / 1000))
  const totalTimeDisplay = formatTime(Math.floor(profile.totalTimeSpent))

  const metrics = [
    {
      label: "Level",
      value: profile.currentDifficulty.charAt(0).toUpperCase() + profile.currentDifficulty.slice(1),
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Success",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Attempts",
      value: profile.totalQuestionsAttempted,
      icon: Zap,
      color: "text-purple-500",
    },
    {
      label: "Avg Time",
      value: profile.averageTimePerQuestion > 0 ? `${Math.round(profile.averageTimePerQuestion)}s` : "—",
      icon: Clock,
      color: "text-orange-500",
    },
  ]

  return (
    <aside
      className={`bg-card border-r border-border rounded-lg p-4 space-y-6 h-fit sticky top-4 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between">
        {!isCollapsed && <h3 className="text-sm font-semibold text-foreground">Menu</h3>}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto h-8 w-8 p-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-foreground">Current Session</span>
            </div>
            <p className={`text-2xl font-bold ${isPaused ? "text-orange-600" : "text-blue-600"}`}>
              {currentTimerDisplay}
            </p>
            {isPaused && <p className="text-xs text-orange-600 mt-1">⏸ Paused</p>}
          </div>

          {/* AI Model Selector */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">AI Model</h3>
            <Select value={selectedModel} onValueChange={onModelChange} disabled={isLoading}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder={isLoading ? "Loading..." : "Select model"} />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Your Metrics</h3>
            <div className="space-y-2">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between p-3 bg-background rounded-md border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                  </div>
                )
              })}

              <div className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-muted-foreground">Total Time</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{totalTimeDisplay}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {isCollapsed && (
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center" title="Level">
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center" title="Success">
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center" title="Attempts">
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="w-8 h-8 rounded-md bg-orange-500/20 flex items-center justify-center" title="Avg Time">
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="w-8 h-8 rounded-md bg-indigo-500/20 flex items-center justify-center" title="Total Time">
            <Timer className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
      )}
    </aside>
  )
}
