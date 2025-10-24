"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { evaluateCode, simpleCodeValidation } from "@/lib/code-evaluator";
import { highlightCode } from "@/lib/syntax-highlighter";
import type { TestCase } from "@/lib/types";

interface AdvancedCodeEditorProps {
  initialCode: string;
  onSubmit: (code: string, isCorrect: boolean) => void;
  onReload?: () => void;
  isLoading?: boolean;
  testCases?: TestCase[];
  language?: "python" | "javascript" | "java" | "cpp";
}

export function AdvancedCodeEditor({
  initialCode,
  onSubmit,
  onReload,
  isLoading = false,
  testCases = [],
  language = "python",
}: AdvancedCodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [charCount, setCharCount] = useState(initialCode.length);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCode(initialCode);
    setCharCount(initialCode.length);
    setEvaluationResult(null);
    updateHighlight(initialCode);
  }, [initialCode]);

  const updateHighlight = (newCode: string) => {
    if (highlightRef.current) {
      const highlighted = highlightCode(newCode, language);
      highlightRef.current.innerHTML = highlighted;
    }
  };

  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    setCharCount(newCode.length);
    updateHighlight(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = code.substring(start, end);

      if (start !== end) {
        const beforeSelection = code.substring(0, start);
        const afterSelection = code.substring(end);
        const indentedText = selectedText
          .split("\n")
          .map((line) => "    " + line)
          .join("\n");
        const newCode = beforeSelection + indentedText + afterSelection;
        setCode(newCode);
        setCharCount(newCode.length);
        updateHighlight(newCode);

        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedText.length;
        }, 0);
      } else {
        const newCode = code.substring(0, start) + "    " + code.substring(end);
        setCode(newCode);
        setCharCount(newCode.length);
        updateHighlight(newCode);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    } else if (
      e.key === "Backspace" &&
      code[textareaRef.current?.selectionStart - 1] === " "
    ) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const precedingSpaces = code.substring(Math.max(0, start - 4), start);

      if (precedingSpaces === "    ") {
        e.preventDefault();
        const newCode = code.substring(0, start - 4) + code.substring(start);
        setCode(newCode);
        setCharCount(newCode.length);
        updateHighlight(newCode);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 4;
        }, 0);
      }
    }
  };

  const handleResetCode = () => {
    setCode(initialCode);
    setCharCount(initialCode.length);
    setEvaluationResult(null);
    updateHighlight(initialCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      if (result.passed) {
        onSubmit(code, true);
      }
    } catch (error) {
      console.error("[v0] Code evaluation error:", error);
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

  const lineCount = code.split("\n").length;

  return (
    <div className="space-y-4">
      <Card className="p-0 bg-muted overflow-hidden border border-border">
        <div className="flex justify-between items-center p-4 bg-background border-b border-border">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              {language.charAt(0).toUpperCase() + language.slice(1)} Code Editor
            </label>
            <span className="text-xs text-muted-foreground">
              ({charCount} characters)
            </span>
          </div>
          <Button
            onClick={handleCopyCode}
            variant="ghost"
            size="sm"
            className="text-xs"
            title="Copy code to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div
          ref={containerRef}
          className="relative bg-background overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r border-border text-right pr-2 py-3 text-xs text-muted-foreground font-mono select-none overflow-hidden pointer-events-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className="h-6 leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          <pre className="absolute left-12 top-0 bottom-0 right-0 p-3 m-0 text-sm font-mono text-foreground pointer-events-none overflow-hidden">
            <code
              ref={highlightRef}
              className="syntax-highlight"
              style={{
                color: "inherit",
                backgroundColor: "transparent",
              }}
            >
              {code}
            </code>
          </pre>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="relative left-12 w-[calc(100%-3rem)] h-64 p-3 font-mono text-sm bg-transparent text-foreground border-0 focus:outline-none focus:ring-0 resize-none"
            placeholder="Write your code here..."
            spellCheck="false"
            style={{
              color: "transparent",
              caretColor: "#00b4ff", // bright cyan or any accent color
              backgroundColor: "transparent",
            }}
          />
        </div>
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
          <Play className="w-4 h-4 mr-2" />
          {isEvaluating ? "Running..." : "Run & Test"}
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
