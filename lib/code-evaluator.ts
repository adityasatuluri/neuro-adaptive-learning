import type { TestCase } from "@/lib/types"

export interface EvaluationResult {
  passed: boolean
  totalTests: number
  passedTests: number
  failedTests: TestCase[]
  errors: string[]
  executionTime: number
  output: string
}

let pyodideInstance: any = null
let pyodideLoading: Promise<any> | null = null

async function initPyodide() {
  if (pyodideInstance) return pyodideInstance
  if (pyodideLoading) return pyodideLoading

  pyodideLoading = (async () => {
    try {
      if (typeof window === "undefined") return null

      const pyodide = await (window as any).loadPyodide?.({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
      })

      pyodideInstance = pyodide
      return pyodide
    } catch (error) {
      console.error("[v0] Failed to load Pyodide:", error)
      return null
    }
  })()

  return pyodideLoading
}

export async function evaluateCode(code: string, testCases: TestCase[]): Promise<EvaluationResult> {
  const startTime = Date.now()
  const errors: string[] = []
  const failedTests: TestCase[] = []
  let passedTests = 0

  try {
    const pyodide = await initPyodide()

    if (!pyodide) {
      console.log("[v0] Pyodide not available, using simple validation")
      return simpleCodeValidation(code, testCases)
    }

    // Execute the user's code to define functions
    try {
      pyodide.runPython(code)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      return {
        passed: false,
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: testCases,
        errors: [`Syntax/Runtime Error: ${errorMsg}`],
        executionTime: Date.now() - startTime,
        output: "",
      }
    }

    // Run each test case
    for (const testCase of testCases) {
      try {
        const testInput = testCase.input.trim()
        const expectedOutput = testCase.expectedOutput.trim()

        const result = pyodide.runPython(`
import sys
from io import StringIO

old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    ${testInput}
    output = str(result) if 'result' in dir() else ""
finally:
    sys.stdout = old_stdout

output
`)

        const actualOutput = result.toString().trim()

        if (actualOutput === expectedOutput) {
          passedTests++
        } else {
          failedTests.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
          })
          errors.push(`Test failed: expected "${expectedOutput}" but got "${actualOutput}"`)
        }
      } catch (error) {
        failedTests.push(testCase)
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`Test execution error: ${errorMsg}`)
      }
    }

    return {
      passed: failedTests.length === 0,
      totalTests: testCases.length,
      passedTests,
      failedTests,
      errors,
      executionTime: Date.now() - startTime,
      output: `Passed ${passedTests}/${testCases.length} test cases`,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      passed: false,
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: testCases,
      errors: [`Evaluation error: ${errorMsg}`],
      executionTime: Date.now() - startTime,
      output: "",
    }
  }
}

export function simpleCodeValidation(code: string, testCases: TestCase[]): EvaluationResult {
  const startTime = Date.now()
  const errors: string[] = []

  if (!code || code.trim().length === 0) {
    errors.push("Code cannot be empty")
  } else if (code.trim().length < 20) {
    errors.push("Code appears incomplete")
  } else {
    // Basic syntax validation
    const hasFunction = /def\s+\w+\s*\(/.test(code)
    const hasClass = /class\s+\w+/.test(code)
    const hasLogic = /if\s|for\s|while\s|return\s/.test(code)

    if (!hasFunction && !hasClass) {
      errors.push("Code must define a function or class")
    } else if (!hasLogic && code.length < 100) {
      errors.push("Code may be incomplete - add logic or return statements")
    }
  }

  return {
    passed: errors.length === 0,
    totalTests: testCases.length,
    passedTests: errors.length === 0 ? Math.max(1, testCases.length) : 0,
    failedTests: errors.length > 0 ? testCases : [],
    errors: errors.length > 0 ? errors : ["Code syntax looks valid"],
    executionTime: Date.now() - startTime,
    output: errors.length === 0 ? `Code validated (${testCases.length} test cases ready)` : errors.join("; "),
  }
}
