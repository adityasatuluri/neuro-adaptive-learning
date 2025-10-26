"use client"

import { useState } from "react"
import type { UserProgress } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react"

interface QuestionHistoryProps {
  progressHistory: UserProgress[]
  onSelectQuestion?: (progress: UserProgress) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function QuestionHistory({ progressHistory, onSelectQuestion, isOpen, onOpenChange }: QuestionHistoryProps) {
  const [selectedProgress, setSelectedProgress] = useState<UserProgress | null>(null)

  const sortedHistory = [...progressHistory].sort((a, b) => b.timestamp - a.timestamp)

  const handleSelectQuestion = (progress: UserProgress) => {
    setSelectedProgress(progress)
    onSelectQuestion?.(progress)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Question History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {sortedHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No questions attempted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map((progress, index) => (
                <Card
                  key={`${progress.questionId}-${progress.timestamp}`}
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectQuestion(progress)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {progress.correct ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <Badge className={getDifficultyColor(progress.difficulty)}>{progress.difficulty}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(progress.timestamp)}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">Question #{index + 1}</p>
                      <p className="text-sm font-medium text-foreground truncate">{progress.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{Math.round(progress.timeSpent)}s</span>
                        </div>
                        <span>Attempts: {progress.attempts}</span>
                        {progress.solutionViewed && <span className="text-orange-600">Solution viewed</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
