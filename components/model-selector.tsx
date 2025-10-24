"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAvailableModels } from "@/lib/ollama-client"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
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

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-3">AI Model</h3>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={isLoading || models.length === 0}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading models..." : "Select a model"} />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {models.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground mt-2">No models available. Ensure Ollama is running.</p>
      )}
    </Card>
  )
}
