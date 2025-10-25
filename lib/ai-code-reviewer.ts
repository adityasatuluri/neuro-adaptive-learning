import { z } from "zod";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud";

const codeValidationSchema = z.object({
  passed: z.boolean(),
  message: z.string(),
});

export type CodeValidationResult = z.infer<typeof codeValidationSchema>;

async function callOllama(
  prompt: string,
  model: string = OLLAMA_MODEL
): Promise<string | null> {
  try {
    console.log("[v0] Calling Ollama for code validation with model:", model);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.3,
        num_predict: 500,
        top_p: 0.9,
        top_k: 40,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        "[v0] Ollama API error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    console.log("[v0] Ollama validation response received");
    return data.response || null;
  } catch (error) {
    console.error("[v0] Error calling Ollama for validation:", error);
    return null;
  }
}

function extractJsonFromResponse(content: string): string | null {
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    console.warn("[v0] No JSON found in validation response");
    return null;
  }

  return content.substring(jsonStart, jsonEnd + 1);
}

export async function validateCodeWithAI(
  code: string,
  problemDescription: string,
  expectedOutput: string,
  model: string = OLLAMA_MODEL
): Promise<CodeValidationResult | null> {
  try {
    const prompt = `You are a code validator. Check if the submitted code correctly solves the problem.

PROBLEM:
${problemDescription}

EXPECTED OUTPUT:
${expectedOutput}

SUBMITTED CODE:
\`\`\`python
${code}
\`\`\`

Respond with ONLY a JSON object (no markdown, no extra text, no code blocks):
{"passed": true/false, "message": "brief message"}

Rules:
- If code logic is correct and solves the problem, mark as passed
- Accept code even with minor style differences
- Accept alternative correct approaches
- Only fail if logic is fundamentally wrong`;

    const response = await callOllama(prompt, model);
    if (!response) {
      console.error("[v0] No response from Ollama for validation");
      return null;
    }

    const jsonStr = extractJsonFromResponse(response);
    if (!jsonStr) {
      console.error("[v0] Could not extract JSON from validation response");
      return null;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      const validated = codeValidationSchema.parse(parsed);
      console.log(
        "[v0] Code validation completed:",
        validated.passed ? "PASSED" : "FAILED"
      );
      return validated;
    } catch (error) {
      console.error("[v0] Validation parsing error:", error);
      return null;
    }
  } catch (error) {
    console.error("[v0] Error validating code with AI:", error);
    return null;
  }
}
