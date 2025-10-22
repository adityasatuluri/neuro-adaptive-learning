"use client"

import type { Question } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuestionDisplayProps {
  question: Question
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{question.title}</h2>
          <p className="text-muted-foreground mt-1">{question.topic}</p>
        </div>
        <Badge className={difficultyColors[question.difficulty]}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </Badge>
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
      </div>
    </Card>
  )
}
