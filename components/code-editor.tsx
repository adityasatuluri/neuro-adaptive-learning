"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CodeEditorProps {
  initialCode: string
  onSubmit: (code: string) => void
  isLoading?: boolean
}

export function CodeEditor({ initialCode, onSubmit, isLoading = false }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [charCount, setCharCount] = useState(initialCode.length)

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    setCharCount(newCode.length)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground">Python Code Editor</label>
          <span className="text-xs text-muted-foreground">{charCount} characters</span>
        </div>
        <textarea
          value={code}
          onChange={handleCodeChange}
          className="w-full h-64 p-3 font-mono text-sm bg-background text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your Python code here..."
          spellCheck="false"
        />
      </Card>
      <Button onClick={() => onSubmit(code)} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Submitting..." : "Submit Solution"}
      </Button>
    </div>
  )
}
