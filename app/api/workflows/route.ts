/**
 * Workflows API Route
 * CRUD operations for learning pathways
 * 
 * @api {GET} /api/workflows List workflows
 * @apiName GetWorkflows
 * @apiGroup Workflows
 * @apiVersion 1.0.0
 * 
 * @apiDescription
 * Retrieves a list of workflows. When Supabase is configured, fetches from database.
 * Otherwise returns built-in template workflows for demo purposes.
 * 
 * **Authentication:** Not currently implemented (demo mode)
 * 
 * @apiQuery {String} [authorId] - Filter by author ID
 * @apiQuery {Boolean} [isTemplate] - Filter templates only
 * @apiQuery {Boolean} [isPublic] - Filter public workflows only
 * 
 * @apiSuccess {Array} workflows Array of workflow objects
 * @apiSuccessExample {json} Success Response:
 *   {
 *     "workflows": [
 *       {
 *         "id": "uuid",
 *         "name": "Math Word Problem Decoder",
 *         "description": "Scaffolded math word problems",
 *         "nodes": [...],
 *         "edges": [...],
 *         "targetGrades": ["4", "5"],
 *         "targetELPALevels": [1, 2, 3],
 *         "category": "numeracy"
 *       }
 *     ]
 *   }
 * 
 * @api {POST} /api/workflows Create workflow
 * @apiName CreateWorkflow
 * @apiGroup Workflows
 * 
 * @apiBody {String} name - Workflow display name
 * @apiBody {String} [description] - Workflow description
 * @apiBody {Array} nodes - Array of node definitions
 * @apiBody {Array} edges - Array of edge connections
 * @apiBody {Array} [targetGrades] - Target grade levels
 * @apiBody {Array} [targetELPALevels] - Target ELPA levels (1-5)
 * @apiBody {String} [category] - Workflow category
 * 
 * @apiSuccess (201) {Object} workflow The created workflow object
 * @apiError (400) ValidationError Invalid workflow data
 * @apiError (500) DatabaseError Failed to save workflow
 */

import { NextResponse } from "next/server"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase"
import { workflowTemplates, createWorkflowFromTemplate } from "@/lib/constants/workflow-templates"
import type { LinguaFlowWorkflow } from "@/lib/types/workflow"

// GET /api/workflows - List workflows
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const authorId = searchParams.get("authorId")
  const isTemplate = searchParams.get("isTemplate")
  const isPublic = searchParams.get("isPublic")

  // Use Supabase if configured
  if (isSupabaseConfigured) {
    const supabase = createServerClient()
    if (supabase) {
      let query = supabase.from("workflows").select("*")
      
      if (authorId) {
        query = query.eq("author_id", authorId)
      }
      if (isTemplate === "true") {
        query = query.eq("is_template", true)
      }
      if (isPublic === "true") {
        query = query.eq("is_public", true)
      }
      
      const { data, error } = await query.order("created_at", { ascending: false })
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      const workflows: LinguaFlowWorkflow[] = (data || []).map((w) => ({
        id: w.id,
        name: w.name,
        description: w.description || "",
        nodes: w.nodes as LinguaFlowWorkflow["nodes"],
        edges: w.edges as LinguaFlowWorkflow["edges"],
        createdBy: w.author_id,
        isTemplate: w.is_template,
        isPublic: w.is_public,
        targetGrades: w.target_grades || [],
        targetELPALevels: w.target_elpa_levels || [],
        category: (w.category as LinguaFlowWorkflow["category"]) || "custom",
        subject: w.subject || undefined,
        tags: w.tags || [],
        createdAt: new Date(w.created_at),
        updatedAt: new Date(w.updated_at),
      }))
      
      return NextResponse.json({ workflows })
    }
  }

  // Return templates as mock workflows when Supabase not configured
  const workflows = workflowTemplates.map((t) => {
    const base = createWorkflowFromTemplate(t, { authorId: "demo-author" })
    return {
      ...base,
      id: t.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as LinguaFlowWorkflow
  })

  return NextResponse.json({ workflows })
}

// POST /api/workflows - Create new workflow
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Use Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("workflows")
          .insert({
            author_id: body.authorId,
            name: body.name,
            description: body.description || null,
            nodes: body.nodes || [],
            edges: body.edges || [],
            target_grades: body.targetGrades || null,
            target_elpa_levels: body.targetElpaLevels || null,
            subject: body.subject || null,
            tags: body.tags || null,
            is_public: body.isPublic || false,
            is_template: body.isTemplate || false,
          })
          .select()
          .single()
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        const workflow: LinguaFlowWorkflow = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          nodes: data.nodes as LinguaFlowWorkflow["nodes"],
          edges: data.edges as LinguaFlowWorkflow["edges"],
          createdBy: data.author_id,
          isTemplate: data.is_template,
          isPublic: data.is_public,
          targetGrades: data.target_grades || [],
          targetELPALevels: data.target_elpa_levels || [],
          category: (data.category as LinguaFlowWorkflow["category"]) || "custom",
          subject: data.subject || undefined,
          tags: data.tags || [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        }
        
        return NextResponse.json({ workflow }, { status: 201 })
      }
    }

    // Return mock response when Supabase not configured
    const workflow: LinguaFlowWorkflow = {
      id: crypto.randomUUID(),
      name: body.name || "Untitled Workflow",
      description: body.description || "",
      nodes: body.nodes || [],
      edges: body.edges || [],
      createdBy: body.authorId || "demo-author",
      isTemplate: body.isTemplate || false,
      isPublic: body.isPublic || false,
      targetGrades: body.targetGrades || [],
      targetELPALevels: body.targetELPALevels || [],
      category: body.category || "custom",
      subject: body.subject,
      tags: body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create workflow"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
