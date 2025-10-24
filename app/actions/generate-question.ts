"use server"

import { generateQuestionByDifficulty as generateQuestion } from "@/lib/ollama-client"
import type { GeneratedQuestion } from "@/lib/ollama-client"

export async function generateQuestionByDifficulty(
  difficulty: "easy" | "medium" | "hard",
  topic?: string,
  model?: string,
): Promise<GeneratedQuestion | null> {
  return generateQuestion(difficulty, topic, model)
}
