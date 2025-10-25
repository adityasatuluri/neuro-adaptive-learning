"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { evaluateCode, simpleCodeValidation } from "@/lib/code-evaluator";
import type { TestCase } from "@/lib/types";

interface CodeEditorProps {
  initialCode: string;
  onSubmit: (code: string, isCorrect: boolean) => void;
  onReload?: () => void;
  isLoading?: boolean;
  testCases?: TestCase[];
}

export function CodeEditor({
  initialCode,
  onSubmit,
  onReload,
  isLoading = false,
  testCases = [],
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [charCount, setCharCount] = useState(initialCode.length);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  useEffect(() => {
    setCode(initialCode);
    setCharCount(initialCode.length);
    setEvaluationResult(null);
  }, [initialCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    setCharCount(newCode.length);
  };

  const handleResetCode = () => {
    setCode(initialCode);
    setCharCount(initialCode.length);
    setEvaluationResult(null);
  };

  const handleRunCode = async () => {
    setIsEvaluating(true);
    try {
      let result;
      if (testCases.length > 0) {
        result = await evaluateCode(code, testCases);
      } else {
        result = simpleCodeValidation(code, testCases);
      }

      setEvaluationResult(result);

      // If all tests pass, submit the solution
      if (result.passed) {
        onSubmit(code, true);
      }
    } catch (error) {
      console.error(" Code evaluation error:", error);
      setEvaluationResult({
        passed: false,
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: testCases,
        errors: ["Failed to evaluate code. Please try again."],
        executionTime: 0,
        output: "",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const passPercentage = evaluationResult
    ? Math.round(
        (evaluationResult.passedTests / evaluationResult.totalTests) * 100
      )
    : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground">
            Python Code Editor
          </label>
          <span className="text-xs text-muted-foreground">
            {charCount} characters
          </span>
        </div>
        <textarea
          value={code}
          onChange={handleCodeChange}
          className="w-full h-64 p-3 font-mono text-sm bg-background text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your Python code here..."
          spellCheck="false"
        />
      </Card>

      {evaluationResult && (
        <Card
          className={`p-4 border-2 ${
            evaluationResult.passed
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evaluationResult.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h4
                  className={`font-semibold text-lg ${
                    evaluationResult.passed ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {evaluationResult.passed
                    ? "All Tests Passed!"
                    : "Tests Failed"}
                </h4>
              </div>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  evaluationResult.passed
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {evaluationResult.passedTests}/{evaluationResult.totalTests}{" "}
                passed
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  evaluationResult.passed ? "bg-green-600" : "bg-red-600"
                }`}
                style={{ width: `${passPercentage}%` }}
              />
            </div>

            {evaluationResult.errors.length > 0 && (
              <div className="space-y-2">
                {evaluationResult.errors.map((error: string, idx: number) => (
                  <div
                    key={idx}
                    className={`text-sm p-2 rounded flex items-start gap-2 ${
                      evaluationResult.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className="mt-0.5">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Execution time: {evaluationResult.executionTime}ms
            </p>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleRunCode}
          disabled={isEvaluating || isLoading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          size="lg"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {isEvaluating ? "Validating..." : "Validate Code"}
        </Button>
        <Button
          onClick={handleResetCode}
          variant="outline"
          size="lg"
          title="Reset code to starter template"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      {onReload && (
        <Button
          onClick={onReload}
          variant="outline"
          className="w-full bg-transparent"
          title="Load a different question of same difficulty"
        >
          Reload Question
        </Button>
      )}
    </div>
  );
}
