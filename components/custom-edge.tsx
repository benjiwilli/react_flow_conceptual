"use client"

import type React from "react"

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "reactflow"

export default function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="nodrag nopan absolute -translate-x-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium pointer-events-auto"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
