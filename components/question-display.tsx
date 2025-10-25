"use client"

import { useState } from "react"
import type { Question } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface QuestionDisplayProps {
  question: Question
  onSolutionView?: () => void
}

export function QuestionDisplay({ question, onSolutionView }: QuestionDisplayProps) {
  const [showSolution, setShowSolution] = useState(false)

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  const typeLabels = {
    "code-writing": "Write Code",
    "code-completion": "Complete Code",
    debugging: "Debug Code",
    "output-prediction": "Predict Output",
  }

  const handleViewSolution = () => {
    setShowSolution(true)
    onSolutionView?.()
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{question.title}</h2>
          <div className="flex gap-2 mt-2">
            <p className="text-sm text-muted-foreground">{question.topic}</p>
            {question.subtopic && <p className="text-sm text-muted-foreground">• {question.subtopic}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={difficultyColors[question.difficulty]}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline">{typeLabels[question.type]}</Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Description</h3>
          <p className="text-foreground">{question.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-2">Test Cases</h3>
          <div className="space-y-2">
            {question.testCases.map((tc, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-md font-mono text-sm">
                <p className="text-muted-foreground">Input: {tc.input}</p>
                <p className="text-muted-foreground">Expected: {tc.expectedOutput}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-2">Hints</h3>
          <ul className="space-y-1">
            {question.hints.map((hint, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start">
                <span className="mr-2">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>

        {showSolution && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">Solution</h3>
            <pre className="bg-white p-3 rounded border border-blue-100 overflow-x-auto text-sm font-mono text-foreground">
              {question.starterCode}
            </pre>
            <p className="text-xs text-blue-700 mt-2">
              ⚠️ Viewing the solution will negatively impact your progress score for this question.
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Estimated Time</p>
            <p className="text-sm font-semibold text-foreground">{question.estimatedTime}s</p>
          </div>
          {question.tags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tags</p>
              <div className="flex gap-1 flex-wrap">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {!showSolution && (
          <Button
            onClick={handleViewSolution}
            variant="outline"
            className="w-full mt-4 text-amber-600 border-amber-200 hover:bg-amber-50 bg-transparent"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Solution
          </Button>
        )}
      </div>
    </Card>
  )
}
