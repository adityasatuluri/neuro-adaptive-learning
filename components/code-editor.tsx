"use client"

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

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-3 font-mono text-sm bg-background text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your Python code here..."
        />
      </Card>
      <Button onClick={() => onSubmit(code)} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Submitting..." : "Submit Solution"}
      </Button>
    </div>
  )
}
