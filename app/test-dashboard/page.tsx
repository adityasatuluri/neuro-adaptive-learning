// Test dashboard to run and visualize all tests
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TestSuite } from "@/lib/test-framework"

export default function TestDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  const runAllTests = async () => {
    setIsRunning(true)
    setError(null)
    setTestSuites([])

    try {
      const { runAIGenerationTests } = await import("@/lib/ai-tests")
      const { runAlgorithmTests } = await import("@/lib/algorithm-tests")
      const { runIntegrationTests } = await import("@/lib/integration-tests")
      const { runPerformanceTests } = await import("@/lib/performance-tests")

      console.log("[v0] Starting comprehensive test execution...")

      const aiTests = await runAIGenerationTests()
      const algorithmTests = await runAlgorithmTests()
      const integrationTests = await runIntegrationTests()
      const performanceTests = await runPerformanceTests()

      setTestSuites([aiTests, algorithmTests, integrationTests, performanceTests])
      setActiveTab("summary")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      console.error("[v0] Test execution error:", err)
    } finally {
      setIsRunning(false)
    }
  }

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0)
  const passedTests = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0)
  const failedTests = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0)
  const totalDuration = testSuites.reduce((sum, suite) => sum + suite.totalDuration, 0)
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Test Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive testing for Neuro Adaptive Learning with Ollama AI</p>
        </div>

        <div className="mb-8">
          <Button onClick={runAllTests} disabled={isRunning} size="lg" className="w-full">
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {testSuites.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalTests}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{passedTests}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{failedTests}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{passRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalDuration.toFixed(0)}ms</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Test Suites Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testSuites.map((suite) => (
                      <div key={suite.name} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <p className="font-semibold">{suite.name}</p>
                          <p className="text-sm text-muted-foreground">{suite.totalDuration.toFixed(2)}ms</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {suite.passedTests}/{suite.totalTests}
                            </p>
                            <p className={`text-xs ${suite.failedTests === 0 ? "text-green-600" : "text-red-600"}`}>
                              {suite.failedTests === 0 ? "All Passed" : `${suite.failedTests} Failed`}
                            </p>
                          </div>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600"
                              style={{ width: `${(suite.passedTests / suite.totalTests) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {testSuites.map((suite) => (
                <Card key={suite.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{suite.name}</span>
                      <span className={suite.failedTests === 0 ? "text-green-600" : "text-red-600"}>
                        {suite.passedTests}/{suite.totalTests}
                      </span>
                    </CardTitle>
                    <CardDescription>Duration: {suite.totalDuration.toFixed(2)}ms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suite.tests.map((test) => (
                        <div key={test.testName} className="flex items-start gap-3 p-3 bg-muted rounded">
                          <div className={`mt-1 font-bold ${test.passed ? "text-green-600" : "text-red-600"}`}>
                            {test.passed ? "✓" : "✗"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{test.testName}</p>
                            {test.error && <p className="text-sm text-red-600 mt-1">{test.error}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{test.duration.toFixed(2)}ms</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Execution Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Success Rate by Suite</p>
                      {testSuites.map((suite) => (
                        <div key={suite.name} className="flex items-center justify-between mb-3">
                          <span className="text-sm">{suite.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${(suite.passedTests / suite.totalTests) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-12 text-right">
                              {((suite.passedTests / suite.totalTests) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Performance Metrics</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Test Duration</p>
                          <p className="text-lg font-bold">{(totalDuration / totalTests).toFixed(2)}ms</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Duration</p>
                          <p className="text-lg font-bold">{totalDuration.toFixed(0)}ms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}
