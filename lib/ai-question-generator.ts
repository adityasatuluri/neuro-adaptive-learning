import { z } from "zod"

const questionSchema = z.object({
  title: z.string(),
  description: z.string(),
  starterCode: z.string(),
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

type GeneratedQuestion = z.infer<typeof questionSchema>

const difficultyPrompts = {
  easy: `Generate a beginner-friendly Python coding question that:
- Focuses on basic syntax and simple concepts
- Takes 2-5 minutes to solve
- Involves simple data types, basic loops, or simple functions
- Has clear, straightforward logic
- Examples: variable assignment, simple arithmetic, basic string operations`,

  medium: `Generate an intermediate Python coding question that:
- Requires understanding of data structures (lists, dicts) or functions
- Takes 5-15 minutes to solve
- Involves some algorithmic thinking
- May require nested loops or multiple conditions
- Examples: list manipulation, dictionary operations, function composition`,

  hard: `Generate an advanced Python coding question that:
- Requires strong algorithmic thinking
- Takes 15-30 minutes to solve
- May involve complex data structures or algorithms
- Requires optimization or multiple approaches
- Examples: binary search, dynamic programming concepts, complex string manipulation`,
}

export async function generateQuestionByDifficulty(
  difficulty: "easy" | "medium" | "hard",
  topic?: string,
): Promise<GeneratedQuestion | null> {
  try {
    const topicContext = topic ? `The question should be about ${topic}.` : ""

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_CLOUD_API}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: `${difficultyPrompts[difficulty]}

${topicContext}

Generate a unique Python coding question with:
1. A clear title
2. Detailed description of what to solve
3. Starter code template
4. Expected output
5. 3-4 helpful hints
6. 2-3 test cases with inputs and expected outputs
7. Relevant tags

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "description": "string",
  "starterCode": "string",
  "expectedOutput": "string",
  "hints": ["string", "string", "string"],
  "testCases": [{"input": "string", "expectedOutput": "string"}],
  "tags": ["string"]
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Groq API error:", response.statusText)
      return null
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] Could not parse JSON from response")
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])
    return questionSchema.parse(parsed)
  } catch (error) {
    console.error("[v0] Error generating question:", error)
    return null
  }
}

export async function generateQuestionsByBatch(
  difficulty: "easy" | "medium" | "hard",
  count = 5,
  topic?: string,
): Promise<GeneratedQuestion[]> {
  const questions: GeneratedQuestion[] = []

  for (let i = 0; i < count; i++) {
    const question = await generateQuestionByDifficulty(difficulty, topic)
    if (question) {
      questions.push(question)
    }
    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return questions
}
