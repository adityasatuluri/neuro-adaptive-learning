"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OllamaSetupPage() {
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [models, setModels] = useState<string[]>([])

  const checkOllamaConnection = async () => {
    setStatus("checking")
    setMessage("Checking Ollama connection...")

    try {
      const baseUrl = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434"

      // Check if Ollama is running
      const versionResponse = await fetch(`${baseUrl}/api/version`)
      if (!versionResponse.ok) {
        throw new Error("Ollama server not responding")
      }

      const versionData = await versionResponse.json()
      console.log("[v0] Ollama version:", versionData)

      // Get available models
      const tagsResponse = await fetch(`${baseUrl}/api/tags`)
      if (!tagsResponse.ok) {
        throw new Error("Could not fetch models")
      }

      const tagsData = await tagsResponse.json()
      const modelNames = (tagsData.models || []).map((m: any) => m.name)
      setModels(modelNames)

      if (modelNames.length === 0) {
        setStatus("error")
        setMessage("Ollama is running but no models are loaded. Run: ollama pull mistral")
        return
      }

      setStatus("success")
      setMessage(`Ollama is running! Found ${modelNames.length} model(s).`)
    } catch (error) {
      setStatus("error")
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}. Make sure Ollama is running on http://localhost:11434`,
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Ollama Setup & Diagnostics</CardTitle>
            <CardDescription>Check your Ollama connection and model availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Setup Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                <li>Install Ollama from https://ollama.ai</li>
                <li>Run: ollama pull mistral (or your preferred model)</li>
                <li>Start Ollama: ollama serve</li>
                <li>Ollama will run on http://localhost:11434</li>
              </ol>
            </div>

            <Button onClick={checkOllamaConnection} disabled={status === "checking"} className="w-full">
              {status === "checking" ? "Checking..." : "Check Ollama Connection"}
            </Button>

            {message && (
              <Alert className={status === "success" ? "bg-green-900 border-green-700" : "bg-red-900 border-red-700"}>
                <AlertDescription className={status === "success" ? "text-green-200" : "text-red-200"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {models.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Available Models:</h3>
                <div className="space-y-1">
                  {models.map((model) => (
                    <div key={model} className="text-sm text-slate-300 bg-slate-700 p-2 rounded">
                      {model}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-700 p-4 rounded space-y-2">
              <h3 className="font-semibold text-white text-sm">Environment Variables:</h3>
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-400">OLLAMA_BASE_URL:</span>{" "}
                  {process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434"}
                </div>
                <div>
                  <span className="text-slate-400">OLLAMA_MODEL:</span>{" "}
                  {process.env.NEXT_PUBLIC_OLLAMA_MODEL || "mistral"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
