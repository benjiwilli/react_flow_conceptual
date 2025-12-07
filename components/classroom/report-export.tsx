"use client"

/**
 * Report Export Component
 * Export classroom analytics and student progress reports
 */

import * as React from "react"
import { Download, FileText, FileSpreadsheet, Printer, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ELPALevel } from "@/lib/types/student"

// ============================================================================
// Types
// ============================================================================

interface ClassMetrics {
  totalStudents: number
  activeStudents: number
  completionRate: number
  averageScore: number
  averageTimeMinutes: number
  strugglingCount: number
  elpaDistribution: Record<ELPALevel, number>
  topChallenges: { topic: string; count: number; percentage: number }[]
  vocabularyMastery: { word: string; masteryRate: number }[]
  recentTrends: {
    scoreChange: number
    completionChange: number
    timeChange: number
  }
}

interface StudentData {
  id: string
  name: string
  elpaLevel: ELPALevel
  completionRate: number
  averageScore: number
  timeSpent: number
  strengths: string[]
  challenges: string[]
}

interface ReportExportProps {
  classroomName: string
  metrics: ClassMetrics
  students?: StudentData[]
  dateRange?: { start: Date; end: Date }
}

// ============================================================================
// Export Functions
// ============================================================================

function generateCSV(
  classroomName: string,
  metrics: ClassMetrics,
  students: StudentData[]
): string {
  const lines: string[] = []
  
  // Header
  lines.push(`"${classroomName} - Progress Report"`)
  lines.push(`"Generated: ${new Date().toLocaleDateString()}"`)
  lines.push("")
  
  // Class Summary
  lines.push('"Class Summary"')
  lines.push(`"Total Students","${metrics.totalStudents}"`)
  lines.push(`"Active Students","${metrics.activeStudents}"`)
  lines.push(`"Completion Rate","${Math.round(metrics.completionRate)}%"`)
  lines.push(`"Average Score","${Math.round(metrics.averageScore)}%"`)
  lines.push(`"Average Time","${metrics.averageTimeMinutes} minutes"`)
  lines.push("")
  
  // ELPA Distribution
  lines.push('"ELPA Distribution"')
  lines.push('"Level","Count"')
  for (let level = 1; level <= 5; level++) {
    const count = metrics.elpaDistribution[level as ELPALevel] || 0
    lines.push(`"Level ${level}","${count}"`)
  }
  lines.push("")
  
  // Top Challenges
  if (metrics.topChallenges.length > 0) {
    lines.push('"Learning Challenges"')
    lines.push('"Topic","Students Affected","Percentage"')
    metrics.topChallenges.forEach((c) => {
      lines.push(`"${c.topic}","${c.count}","${c.percentage}%"`)
    })
    lines.push("")
  }
  
  // Vocabulary Mastery
  if (metrics.vocabularyMastery.length > 0) {
    lines.push('"Vocabulary Mastery"')
    lines.push('"Word","Mastery Rate"')
    metrics.vocabularyMastery.forEach((v) => {
      lines.push(`"${v.word}","${v.masteryRate}%"`)
    })
    lines.push("")
  }
  
  // Student Data
  if (students.length > 0) {
    lines.push('"Individual Student Progress"')
    lines.push('"Name","ELPA Level","Completion","Score","Time (min)","Strengths","Challenges"')
    students.forEach((s) => {
      lines.push(
        `"${s.name}","${s.elpaLevel}","${s.completionRate}%","${s.averageScore}%","${s.timeSpent}","${s.strengths.join("; ")}","${s.challenges.join("; ")}"`
      )
    })
  }
  
  return lines.join("\n")
}

function generatePrintableHTML(
  classroomName: string,
  metrics: ClassMetrics,
  students: StudentData[]
): string {
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${classroomName} - Progress Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1e40af; margin-bottom: 8px; }
    h2 { color: #374151; margin-top: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .subtitle { color: #6b7280; margin-bottom: 24px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .metric-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: 700; color: #1e40af; }
    .metric-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #3b82f6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${classroomName}</h1>
  <p class="subtitle">Progress Report - Generated ${date}</p>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value">${metrics.activeStudents}/${metrics.totalStudents}</div>
      <div class="metric-label">Students Active</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${Math.round(metrics.completionRate)}%</div>
      <div class="metric-label">Completion Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${Math.round(metrics.averageScore)}%</div>
      <div class="metric-label">Average Score</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.averageTimeMinutes}</div>
      <div class="metric-label">Avg. Minutes</div>
    </div>
  </div>
  
  <h2>ELPA Level Distribution</h2>
  <table>
    <tr>
      <th>Level</th>
      <th>Students</th>
      <th>Distribution</th>
    </tr>
    ${[1, 2, 3, 4, 5]
      .map((level) => {
        const count = metrics.elpaDistribution[level as ELPALevel] || 0
        const pct = metrics.totalStudents > 0 ? Math.round((count / metrics.totalStudents) * 100) : 0
        return `
      <tr>
        <td>Level ${level}</td>
        <td>${count}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${pct}%"></div>
          </div>
        </td>
      </tr>`
      })
      .join("")}
  </table>
  
  ${
    metrics.topChallenges.length > 0
      ? `
  <h2>Learning Challenges</h2>
  <table>
    <tr><th>Topic</th><th>Students</th><th>%</th></tr>
    ${metrics.topChallenges
      .map((c) => `<tr><td>${c.topic}</td><td>${c.count}</td><td>${c.percentage}%</td></tr>`)
      .join("")}
  </table>`
      : ""
  }
  
  ${
    students.length > 0
      ? `
  <h2>Individual Progress</h2>
  <table>
    <tr><th>Student</th><th>ELPA</th><th>Completion</th><th>Score</th><th>Time</th></tr>
    ${students
      .map(
        (s) =>
          `<tr><td>${s.name}</td><td>${s.elpaLevel}</td><td>${s.completionRate}%</td><td>${s.averageScore}%</td><td>${s.timeSpent}m</td></tr>`
      )
      .join("")}
  </table>`
      : ""
  }
  
  <p style="margin-top: 32px; color: #9ca3af; font-size: 12px;">
    Generated by VerbaPath ESL Learning Platform
  </p>
</body>
</html>`
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// Main Component
// ============================================================================

export function ReportExport({
  classroomName,
  metrics,
  students = [],
}: ReportExportProps) {
  const [exporting, setExporting] = React.useState<string | null>(null)

  const handleExportCSV = async () => {
    setExporting("csv")
    try {
      const csv = generateCSV(classroomName, metrics, students)
      const filename = `${classroomName.replace(/\s+/g, "_")}_report_${new Date().toISOString().split("T")[0]}.csv`
      downloadFile(csv, filename, "text/csv;charset=utf-8;")
    } finally {
      setTimeout(() => setExporting(null), 1000)
    }
  }

  const handleExportPDF = async () => {
    setExporting("pdf")
    try {
      const html = generatePrintableHTML(classroomName, metrics, students)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        // Give time for styles to load, then trigger print
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    } finally {
      setTimeout(() => setExporting(null), 1000)
    }
  }

  const handlePrint = () => {
    setExporting("print")
    try {
      const html = generatePrintableHTML(classroomName, metrics, students)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    } finally {
      setTimeout(() => setExporting(null), 1000)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV} disabled={exporting === "csv"}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {exporting === "csv" ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Exported!
            </>
          ) : (
            "Export as CSV"
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={exporting === "pdf"}>
          <FileText className="h-4 w-4 mr-2" />
          {exporting === "pdf" ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Opening...
            </>
          ) : (
            "Export as PDF"
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint} disabled={exporting === "print"}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
