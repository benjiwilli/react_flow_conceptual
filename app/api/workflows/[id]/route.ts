/**
 * Individual Workflow API Route
 * Get, update, or delete a specific workflow
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"
import type { VerbaPathWorkflow } from "@/lib/types/workflow"

// GET /api/workflows/[id] - Get a single workflow
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const workflow: VerbaPathWorkflow = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        nodes: data.nodes as VerbaPathWorkflow["nodes"],
        edges: data.edges as VerbaPathWorkflow["edges"],
        targetGrades: data.target_grades || [],
        targetELPALevels: data.target_elpa_levels || [],
        curriculumOutcomes: [],
        estimatedDuration: 0,
        createdBy: data.author_id || "unknown",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isTemplate: data.is_template,
        category: "custom",
      }

      return NextResponse.json({ workflow })
    }
  }

  return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
}

// PUT /api/workflows/[id] - Update a workflow
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("workflows")
          .update({
            name: body.name,
            description: body.description,
            nodes: body.nodes,
            edges: body.edges,
            target_grades: body.targetGrades,
            target_elpa_levels: body.targetElpaLevels,
            subject: body.subject,
            tags: body.tags,
            is_public: body.isPublic,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const workflow: VerbaPathWorkflow = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          nodes: data.nodes as VerbaPathWorkflow["nodes"],
          edges: data.edges as VerbaPathWorkflow["edges"],
          targetGrades: data.target_grades || [],
          targetELPALevels: data.target_elpa_levels || [],
          curriculumOutcomes: [],
          estimatedDuration: 0,
          createdBy: data.author_id || "unknown",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          isTemplate: data.is_template,
          category: "custom",
        }

        return NextResponse.json({ workflow })
      }
    }

    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update workflow" },
      { status: 500 }
    )
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      const { error } = await supabase
        .from("workflows")
        .delete()
        .eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
}
