"use client"

import { useState } from "react"
import type { Question } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ChevronDown, ChevronUp } from "lucide-react"

interface QuestionDisplayProps {
  question: Question
  onSolutionView?: () => void
}

export function QuestionDisplay({ question, onSolutionView }: QuestionDisplayProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    testCases: true,
    hints: false,
  })

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    hard: "bg-red-100 text-red-800 border-red-300",
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <Card className="p-6 space-y-6 border-0 bg-card">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-3">{question.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge className={`${difficultyColors[question.difficulty]} border`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline">{typeLabels[question.type]}</Badge>
            {question.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {question.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium">Topic:</span> {question.topic}
            {question.subtopic && ` • ${question.subtopic}`}
          </p>
          <p>
            <span className="font-medium">Estimated Time:</span> {question.estimatedTime}s
          </p>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="space-y-4">
        {/* Description */}
        <div>
          <button
            onClick={() => toggleSection("description")}
            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold text-foreground">Description</h3>
            {expandedSections.description ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {expandedSections.description && <p className="text-foreground px-3 py-2">{question.description}</p>}
        </div>

        {/* Test Cases */}
        <div>
          <button
            onClick={() => toggleSection("testCases")}
            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold text-foreground">Test Cases ({question.testCases.length})</h3>
            {expandedSections.testCases ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {expandedSections.testCases && (
            <div className="space-y-2 px-3 py-2">
              {question.testCases.map((tc, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-md font-mono text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Input:</span> {tc.input}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Expected:</span> {tc.expectedOutput}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hints */}
        {question.hints.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("hints")}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <h3 className="font-semibold text-foreground">Hints ({question.hints.length})</h3>
              {expandedSections.hints ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.hints && (
              <ul className="space-y-2 px-3 py-2">
                {question.hints.map((hint, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Solution */}
      {showSolution && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Solution</h3>
          <pre className="bg-white dark:bg-slate-900 p-4 rounded border border-blue-100 dark:border-blue-800 overflow-x-auto text-sm font-mono text-foreground">
            {question.solutionCode || question.starterCode}
          </pre>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            ⚠️ Viewing the solution will negatively impact your progress score for this question.
          </p>
        </div>
      )}

      {/* Action Button */}
      {!showSolution && (
        <Button
          onClick={handleViewSolution}
          variant="outline"
          className="w-full text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 bg-transparent"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Solution
        </Button>
      )}
    </Card>
  )
}
