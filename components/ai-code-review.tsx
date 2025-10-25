"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import type { CodeValidationResult } from "@/lib/ai-code-reviewer"

interface AICodeReviewProps {
  validation: CodeValidationResult | null
  isLoading: boolean
  onValidate?: () => void
}

export function AICodeReview({ validation, isLoading, onValidate }: AICodeReviewProps) {
  if (!validation) {
    return null
  }

  return (
    <Card className={`p-4 border-2 ${validation.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center gap-3 mb-2">
        {validation.passed ? (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600" />
        )}
        <h4 className={`font-semibold text-lg ${validation.passed ? "text-green-800" : "text-red-800"}`}>
          {validation.passed ? "Code Passed!" : "Code Failed"}
        </h4>
      </div>
      <p className={`text-sm ${validation.passed ? "text-green-700" : "text-red-700"}`}>{validation.message}</p>
    </Card>
  )
}
