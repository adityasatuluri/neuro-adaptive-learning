// Handles local Ollama API calls for question and learning path generation
// Updated to support model selection with grok-oss:120b-cloud as default

import { z } from "zod"

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud"

const DEFAULT_MODELS = ["gpt-oss:120b-cloud", "mistral", "neural-chat", "llama2", "codellama", "dolphin-mixtral"]

export async function getAvailableModels(): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const tagsResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!tagsResponse.ok) {
      console.warn("[v0] Failed to fetch available models from Ollama, using defaults")
      return DEFAULT_MODELS
    }

    const tagsData = await tagsResponse.json()
    const models = tagsData.models || []
    const modelNames = models.map((m: any) => m.name)

    // Return fetched models if available, otherwise return defaults
    return modelNames.length > 0 ? modelNames : DEFAULT_MODELS
  } catch (error) {
    console.warn("[v0] Error fetching models from Ollama, using defaults:", error)
    return DEFAULT_MODELS
  }
}

const questionSchema = z.object({
  title: z.string(),
  description: z.string(),
  starterCode: z.string(),
  solutionCode: z.string(),
  expectedOutput: z.string(),
  hints: z.array(z.string()),
  testCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
    }),
  ),
  tags: z.array(z.string()),
})

export type GeneratedQuestion = z.infer<typeof questionSchema>

const learningPathSchema = z.object({
  name: z.string(),
  description: z.string(),
  topics: z.array(z.string()),
  estimatedHours: z.number(),
  focusAreas: z.array(z.string()),
})

export type GeneratedLearningPath = z.infer<typeof learningPathSchema>

async function checkAndLoadModel(model: string): Promise<boolean> {
  try {
    console.log("[v0] Checking available models...")
    const tagsResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    })

    if (!tagsResponse.ok) {
      console.error("[v0] Failed to fetch available models")
      return false
    }

    const tagsData = await tagsResponse.json()
    const models = tagsData.models || []
    console.log(
      "[v0] Available models:",
      models.map((m: any) => m.name),
    )

    // Check if our model is available
    const modelExists = models.some((m: any) => m.name.includes(model))

    if (!modelExists) {
      console.warn(
        `[v0] Model '${model}' not found. Available models:`,
        models.map((m: any) => m.name),
      )
      if (models.length > 0) {
        console.log(`[v0] Using first available model: ${models[0].name}`)
      }
      return false
    }

    console.log(`[v0] Model '${model}' is available`)
    return true
  } catch (error) {
    console.error("[v0] Error checking models:", error)
    return false
  }
}

async function callOllama(prompt: string, model: string = OLLAMA_MODEL, maxRetries = 3): Promise<string | null> {
  // First check if model is available
  await checkAndLoadModel(model)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Ollama attempt ${attempt}/${maxRetries} with model: ${model}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
          num_predict: 2000,
          top_p: 0.9,
          top_k: 40,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`[v0] Ollama API error: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)

        if (attempt < maxRetries) {
          const delay = 1000 * attempt
          console.log(`[v0] Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
        continue
      }

      const data = await response.json()
      console.log("[v0] Ollama response received successfully")
      return data.response || null
    } catch (error) {
      console.error(`[v0] Ollama call error (attempt ${attempt}):`, error)
      if (attempt < maxRetries) {
        const delay = 1000 * attempt
        console.log(`[v0] Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error("[v0] All Ollama attempts failed")
  return null
}

function extractJsonFromResponse(content: string): string | null {
  const jsonStart = content.indexOf("{")
  const jsonEnd = content.lastIndexOf("}")

  if (jsonStart === -1 || jsonEnd === -1) {
    console.warn("[v0] No JSON found in response")
    return null
  }

  return content.substring(jsonStart, jsonEnd + 1)
}

function sanitizeJsonString(str: string): string {
  return str
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"\s*:\s*/g, '": ')
    .replace(/,\s*/g, ", ")
    .replace(/:\s*"/g, ': "')
}

export async function generateAdaptiveQuestion(
  userProfile: any,
  difficulty: "easy" | "medium" | "hard",
  topic?: string,
  model: string = OLLAMA_MODEL,
): Promise<GeneratedQuestion | null> {
  const recentAttempts = userProfile.progressHistory.slice(-10)
  const recentAccuracy =
    recentAttempts.length > 0 ? (recentAttempts.filter((a: any) => a.correct).length / recentAttempts.length) * 100 : 0

  let adaptiveGuidance = ""

  // If accuracy >= 80%, increase complexity
  if (recentAccuracy >= 80) {
    adaptiveGuidance = "This should be a challenging problem that requires advanced thinking and optimization."
  }
  // If accuracy < 60%, revisit weaker areas
  else if (recentAccuracy < 60) {
    adaptiveGuidance = "This should focus on fundamental concepts and be easier to build confidence."
  }
  // Otherwise, maintain current difficulty
  else {
    adaptiveGuidance = "This should be a balanced problem that reinforces current skills."
  }

  // Identify weak concepts from error patterns
  const errorPatterns = userProfile.performanceMetrics?.errorPatterns || new Map()
  const weakConcepts = Array.from(errorPatterns.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0])

  const weakConceptsText =
    weakConcepts.length > 0
      ? `Incorporate these concepts that the user struggles with: ${weakConcepts.join(", ")}.`
      : ""

  const difficultyGuides = {
    easy: "beginner-friendly, 2-5 minutes, basic syntax, simple concepts",
    medium: "intermediate, 5-15 minutes, data structures, some algorithmic thinking",
    hard: "advanced, 15-30 minutes, complex algorithms, optimization required",
  }

  const topicContext = topic ? `Focus on the topic: ${topic}.` : ""

  const prompt = `Generate a unique Python coding question that is ${difficultyGuides[difficulty]}.
${topicContext}
${adaptiveGuidance}
${weakConceptsText}

Create a question with:
1. A clear, engaging title
2. Detailed description of what to solve
3. Starter code template (incomplete, for the user to fill in)
4. Complete solution code (the full working solution)
5. Expected output
6. 3-4 helpful hints
7. 2-3 test cases with inputs and expected outputs
8. Relevant tags

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "title": "string",
  "description": "string",
  "starterCode": "string",
  "solutionCode": "string",
  "expectedOutput": "string",
  "hints": ["string", "string", "string"],
  "testCases": [{"input": "string", "expectedOutput": "string"}],
  "tags": ["string"]
}`

  const response = await callOllama(prompt, model)
  if (!response) {
    console.error("[v0] No response from Ollama for adaptive question generation")
    return null
  }

  const jsonStr = extractJsonFromResponse(response)
  if (!jsonStr) {
    console.error("[v0] Could not extract JSON from response")
    return null
  }

  try {
    const sanitized = sanitizeJsonString(jsonStr)
    console.log("[v0] Sanitized JSON:", sanitized.substring(0, 100) + "...")
    const parsed = JSON.parse(sanitized)
    const validated = questionSchema.parse(parsed)
    console.log("[v0] Adaptive question generated successfully")
    return validated
  } catch (error) {
    console.error("[v0] Adaptive question parsing error:", error)
    return null
  }
}

export async function generateQuestionByDifficulty(
  difficulty: "easy" | "medium" | "hard",
  topic?: string,
  model: string = OLLAMA_MODEL,
): Promise<GeneratedQuestion | null> {
  const difficultyGuides = {
    easy: "beginner-friendly, 2-5 minutes, basic syntax, simple concepts",
    medium: "intermediate, 5-15 minutes, data structures, some algorithmic thinking",
    hard: "advanced, 15-30 minutes, complex algorithms, optimization required",
  }

  const topicContext = topic ? `Focus on the topic: ${topic}.` : ""

  const prompt = `Generate a unique Python coding question that is ${difficultyGuides[difficulty]}.
${topicContext}

Create a question with:
1. A clear, engaging title
2. Detailed description of what to solve
3. Starter code template (incomplete, for the user to fill in)
4. Complete solution code (the full working solution)
5. Expected output
6. 3-4 helpful hints
7. 2-3 test cases with inputs and expected outputs
8. Relevant tags

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "title": "string",
  "description": "string",
  "starterCode": "string",
  "solutionCode": "string",
  "expectedOutput": "string",
  "hints": ["string", "string", "string"],
  "testCases": [{"input": "string", "expectedOutput": "string"}],
  "tags": ["string"]
}`

  const response = await callOllama(prompt, model)
  if (!response) {
    console.error("[v0] No response from Ollama for question generation")
    return null
  }

  const jsonStr = extractJsonFromResponse(response)
  if (!jsonStr) {
    console.error("[v0] Could not extract JSON from response")
    return null
  }

  try {
    const sanitized = sanitizeJsonString(jsonStr)
    console.log("[v0] Sanitized JSON:", sanitized.substring(0, 100) + "...")
    const parsed = JSON.parse(sanitized)
    const validated = questionSchema.parse(parsed)
    console.log("[v0] Question generated successfully")
    return validated
  } catch (error) {
    console.error("[v0] Question parsing error:", error)
    return null
  }
}

export async function generateLearningPath(
  userLevel: "beginner" | "intermediate" | "advanced",
  weakAreas: string[],
  strongAreas: string[],
  model: string = OLLAMA_MODEL,
): Promise<GeneratedLearningPath | null> {
  const weakAreasText = weakAreas.length > 0 ? `Weak areas to focus on: ${weakAreas.join(", ")}` : ""
  const strongAreasText = strongAreas.length > 0 ? `Strong areas to build upon: ${strongAreas.join(", ")}` : ""

  const prompt = `Create a personalized Python learning path for a ${userLevel} learner.
${weakAreasText}
${strongAreasText}

Design a learning path with:
1. A descriptive name
2. A clear description of the learning journey
3. A sequence of 5-8 topics to master (from basics to advanced)
4. Estimated hours to complete
5. Focus areas that address weak points

Available topics: basics, control-flow, loops, functions, lists, dictionaries, strings, file-io, oop, error-handling, algorithms, data-structures

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "name": "string",
  "description": "string",
  "topics": ["string"],
  "estimatedHours": number,
  "focusAreas": ["string"]
}`

  const response = await callOllama(prompt, model)
  if (!response) {
    console.error("[v0] No response from Ollama for learning path generation")
    return null
  }

  const jsonStr = extractJsonFromResponse(response)
  if (!jsonStr) {
    console.error("[v0] Could not extract JSON from response")
    return null
  }

  try {
    const sanitized = sanitizeJsonString(jsonStr)
    console.log("[v0] Sanitized JSON:", sanitized.substring(0, 100) + "...")
    const parsed = JSON.parse(sanitized)
    const validated = learningPathSchema.parse(parsed)
    console.log("[v0] Learning path generated successfully")
    return validated
  } catch (error) {
    console.error("[v0] Learning path parsing error:", error)
    return null
  }
}

export async function generateQuestionsByBatch(
  difficulty: "easy" | "medium" | "hard",
  count = 5,
  topic?: string,
  model: string = OLLAMA_MODEL,
): Promise<GeneratedQuestion[]> {
  const questions: GeneratedQuestion[] = []

  for (let i = 0; i < count; i++) {
    console.log(`[v0] Generating question ${i + 1}/${count}...`)
    const question = await generateQuestionByDifficulty(difficulty, topic, model)
    if (question) {
      questions.push(question)
    }
    // Add delay to avoid overwhelming local Ollama
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(`[v0] Batch generation complete: ${questions.length}/${count} questions generated`)
  return questions
}
