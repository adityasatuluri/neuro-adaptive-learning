"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  progress?: number
  subtitle?: string
}

export function StatCard({ label, value, icon: Icon, color, progress, subtitle }: StatCardProps) {
  return (
    <Card className="p-6 border-0 bg-gradient-to-br overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <Icon className="w-6 h-6 text-muted-foreground opacity-40 flex-shrink-0" />
        </div>
        {progress !== undefined && <Progress value={progress} className="mt-4" />}
      </div>
    </Card>
  )
}
