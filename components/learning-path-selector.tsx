"use client"

import type { LearningPath } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LearningPathSelectorProps {
  paths: LearningPath[]
  currentPathId: string
  onSelectPath: (pathId: string) => void
}

export function LearningPathSelector({ paths, currentPathId, onSelectPath }: LearningPathSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Learning Paths</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map((path) => (
          <Card
            key={path.id}
            className={`p-4 cursor-pointer transition-all ${
              currentPathId === path.id
                ? "border-primary border-2 bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <h3 className="font-semibold text-foreground mb-2">{path.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {path.topics.map((topic) => (
                <span key={topic} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {topic}
                </span>
              ))}
            </div>
            <Button
              onClick={() => onSelectPath(path.id)}
              variant={currentPathId === path.id ? "default" : "outline"}
              className="w-full"
              size="sm"
            >
              {currentPathId === path.id ? "Current Path" : "Select Path"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
