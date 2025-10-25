"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Pause, Play, RotateCcw, Trash2, History } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HeaderWithActionsProps {
  onGenerate: () => void
  onPauseResume: () => void
  onReload: () => void
  onResetProgress: () => void
  onViewHistory: () => void
  isGenerating: boolean
  isPaused: boolean
}

export function HeaderWithActions({
  onGenerate,
  onPauseResume,
  onReload,
  onResetProgress,
  onViewHistory,
  isGenerating,
  isPaused,
}: HeaderWithActionsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Neuro Adaptive System</h1>
          <p className="text-muted-foreground mt-1">Master Python through adaptive coding challenges</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            title="Generate new question"
          >
            <Sparkles className="w-5 h-5" />
          </Button>

          <Button
            onClick={onPauseResume}
            size="icon"
            className={`border-0 text-white ${
              isPaused
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            }`}
            title={isPaused ? "Resume coding" : "Take a break"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>

          <Button onClick={onReload} size="icon" variant="outline" className="bg-transparent" title="Reload question">
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            onClick={onViewHistory}
            size="icon"
            variant="outline"
            className="bg-transparent"
            title="View question history"
          >
            <History className="w-5 h-5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                title="Reset all progress"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your progress, including completed questions, difficulty level, and
                  statistics. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onResetProgress} className="bg-red-600 hover:bg-red-700">
                  Reset Progress
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
