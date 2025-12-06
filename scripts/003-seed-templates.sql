-- ============================================================================
-- LinguaFlow Seed Data
-- Initial workflow templates and reference data
-- ============================================================================

-- ============================================================================
-- Insert Workflow Templates
-- ============================================================================

-- Math Word Problem Decoder Template
INSERT INTO workflows (
  id,
  author_id,
  name,
  description,
  category,
  grade_level,
  elpa_levels,
  is_template,
  is_public,
  tags,
  nodes,
  edges
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000', -- System user
  'Math Word Problem Decoder',
  'Helps ESL students decode and solve math word problems with language scaffolding. Includes vocabulary support, L1 bridges, and visual representations.',
  'numeracy',
  4,
  '{1,2,3,4}',
  true,
  true,
  '{"math", "word-problems", "scaffolding", "vocabulary"}',
  '[
    {"id": "node-1", "type": "student-profile", "position": {"x": 100, "y": 200}, "data": {"label": "Student Profile", "nodeType": "student-profile", "category": "learning", "config": {}}},
    {"id": "node-2", "type": "word-problem-decoder", "position": {"x": 350, "y": 200}, "data": {"label": "Generate Problem", "nodeType": "word-problem-decoder", "category": "numeracy", "config": {"problemType": "subtraction", "numberRange": [1, 100]}}},
    {"id": "node-3", "type": "vocabulary-builder", "position": {"x": 600, "y": 100}, "data": {"label": "Key Vocabulary", "nodeType": "vocabulary-builder", "category": "learning", "config": {"maxWords": 5, "includeL1": true}}},
    {"id": "node-4", "type": "l1-bridge", "position": {"x": 600, "y": 300}, "data": {"label": "L1 Support", "nodeType": "l1-bridge", "category": "scaffolding", "config": {"bridgeType": "key-terms-only"}}},
    {"id": "node-5", "type": "scaffolded-content", "position": {"x": 850, "y": 200}, "data": {"label": "Scaffolded Solution", "nodeType": "scaffolded-content", "category": "scaffolding", "config": {"scaffoldingType": "step-by-step"}}},
    {"id": "node-6", "type": "human-input", "position": {"x": 1100, "y": 200}, "data": {"label": "Student Answer", "nodeType": "human-input", "category": "interaction", "config": {"inputType": "number", "prompt": "What is your answer?"}}},
    {"id": "node-7", "type": "feedback", "position": {"x": 1350, "y": 200}, "data": {"label": "Feedback", "nodeType": "feedback", "category": "output", "config": {"feedbackStyle": "encouraging"}}}
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "node-1", "target": "node-2"},
    {"id": "e2-3", "source": "node-2", "target": "node-3"},
    {"id": "e2-4", "source": "node-2", "target": "node-4"},
    {"id": "e3-5", "source": "node-3", "target": "node-5"},
    {"id": "e4-5", "source": "node-4", "target": "node-5"},
    {"id": "e5-6", "source": "node-5", "target": "node-6"},
    {"id": "e6-7", "source": "node-6", "target": "node-7"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Vocabulary Builder Template
INSERT INTO workflows (
  id,
  author_id,
  name,
  description,
  category,
  grade_level,
  elpa_levels,
  is_template,
  is_public,
  tags,
  nodes,
  edges
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  '00000000-0000-0000-0000-000000000000',
  'Vocabulary Builder',
  'Interactive vocabulary learning with multi-modal support including definitions, L1 translations, images, and practice exercises.',
  'vocabulary',
  3,
  '{1,2,3,4,5}',
  true,
  true,
  '{"vocabulary", "l1-support", "practice", "assessment"}',
  '[
    {"id": "node-1", "type": "student-profile", "position": {"x": 100, "y": 200}, "data": {"label": "Student Profile", "nodeType": "student-profile", "category": "learning", "config": {}}},
    {"id": "node-2", "type": "content-generator", "position": {"x": 350, "y": 200}, "data": {"label": "Generate Passage", "nodeType": "content-generator", "category": "learning", "config": {"contentType": "passage", "length": "medium"}}},
    {"id": "node-3", "type": "vocabulary-builder", "position": {"x": 600, "y": 200}, "data": {"label": "Extract Vocabulary", "nodeType": "vocabulary-builder", "category": "learning", "config": {"maxWords": 8, "includeL1": true}}},
    {"id": "node-4", "type": "comprehension-check", "position": {"x": 850, "y": 200}, "data": {"label": "Vocabulary Quiz", "nodeType": "comprehension-check", "category": "interaction", "config": {"questionCount": 5, "passThreshold": 70}}},
    {"id": "node-5", "type": "celebration", "position": {"x": 1100, "y": 200}, "data": {"label": "Celebrate!", "nodeType": "celebration", "category": "output", "config": {"celebrationType": "confetti"}}}
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "node-1", "target": "node-2"},
    {"id": "e2-3", "source": "node-2", "target": "node-3"},
    {"id": "e3-4", "source": "node-3", "target": "node-4"},
    {"id": "e4-5", "source": "node-4", "target": "node-5"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Reading Comprehension Template
INSERT INTO workflows (
  id,
  author_id,
  name,
  description,
  category,
  grade_level,
  elpa_levels,
  is_template,
  is_public,
  tags,
  nodes,
  edges
) VALUES (
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  '00000000-0000-0000-0000-000000000000',
  'Reading Comprehension Pathway',
  'Guided reading comprehension with pre-reading vocabulary, during-reading checks, and post-reading assessment. Adapts to ELPA level.',
  'literacy',
  5,
  '{2,3,4,5}',
  true,
  true,
  '{"reading", "comprehension", "scaffolding", "assessment"}',
  '[
    {"id": "node-1", "type": "student-profile", "position": {"x": 100, "y": 200}, "data": {"label": "Student Profile", "nodeType": "student-profile", "category": "learning", "config": {}}},
    {"id": "node-2", "type": "curriculum-selector", "position": {"x": 350, "y": 200}, "data": {"label": "Select Outcome", "nodeType": "curriculum-selector", "category": "learning", "config": {"subjectArea": "ela"}}},
    {"id": "node-3", "type": "content-generator", "position": {"x": 600, "y": 200}, "data": {"label": "Generate Passage", "nodeType": "content-generator", "category": "learning", "config": {"contentType": "passage"}}},
    {"id": "node-4", "type": "scaffolded-content", "position": {"x": 850, "y": 200}, "data": {"label": "Add Scaffolds", "nodeType": "scaffolded-content", "category": "scaffolding", "config": {"scaffoldingType": "adaptive"}}},
    {"id": "node-5", "type": "comprehension-check", "position": {"x": 1100, "y": 200}, "data": {"label": "Check Understanding", "nodeType": "comprehension-check", "category": "interaction", "config": {"questionCount": 5}}},
    {"id": "node-6", "type": "feedback", "position": {"x": 1350, "y": 200}, "data": {"label": "Provide Feedback", "nodeType": "feedback", "category": "output", "config": {"feedbackStyle": "encouraging"}}},
    {"id": "node-7", "type": "progress-tracker", "position": {"x": 1600, "y": 200}, "data": {"label": "Track Progress", "nodeType": "progress-tracker", "category": "output", "config": {}}}
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "node-1", "target": "node-2"},
    {"id": "e2-3", "source": "node-2", "target": "node-3"},
    {"id": "e3-4", "source": "node-3", "target": "node-4"},
    {"id": "e4-5", "source": "node-4", "target": "node-5"},
    {"id": "e5-6", "source": "node-5", "target": "node-6"},
    {"id": "e6-7", "source": "node-6", "target": "node-7"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Speaking Practice Template
INSERT INTO workflows (
  id,
  author_id,
  name,
  description,
  category,
  grade_level,
  elpa_levels,
  is_template,
  is_public,
  tags,
  nodes,
  edges
) VALUES (
  'd4e5f6a7-b8c9-0123-defa-456789012345',
  '00000000-0000-0000-0000-000000000000',
  'Speaking Practice',
  'Oral language development with pronunciation feedback, voice recording, and model responses. Great for developing fluency.',
  'speaking',
  3,
  '{1,2,3,4}',
  true,
  true,
  '{"speaking", "pronunciation", "voice", "fluency"}',
  '[
    {"id": "node-1", "type": "student-profile", "position": {"x": 100, "y": 200}, "data": {"label": "Student Profile", "nodeType": "student-profile", "category": "learning", "config": {}}},
    {"id": "node-2", "type": "ai-model", "position": {"x": 350, "y": 200}, "data": {"label": "Generate Prompt", "nodeType": "ai-model", "category": "ai", "config": {"model": "gpt-4o-mini"}}},
    {"id": "node-3", "type": "human-input", "position": {"x": 600, "y": 200}, "data": {"label": "Voice Recording", "nodeType": "human-input", "category": "interaction", "config": {"inputType": "voice"}}},
    {"id": "node-4", "type": "feedback", "position": {"x": 850, "y": 200}, "data": {"label": "Feedback", "nodeType": "feedback", "category": "output", "config": {"feedbackStyle": "encouraging"}}}
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "node-1", "target": "node-2"},
    {"id": "e2-3", "source": "node-2", "target": "node-3"},
    {"id": "e3-4", "source": "node-3", "target": "node-4"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Writing Scaffold Template
INSERT INTO workflows (
  id,
  author_id,
  name,
  description,
  category,
  grade_level,
  elpa_levels,
  is_template,
  is_public,
  tags,
  nodes,
  edges
) VALUES (
  'e5f6a7b8-c9d0-1234-efab-567890123456',
  '00000000-0000-0000-0000-000000000000',
  'Writing Scaffold',
  'Guided writing with sentence frames, word banks, and structured support. Helps students build writing skills step by step.',
  'literacy',
  4,
  '{1,2,3,4}',
  true,
  true,
  '{"writing", "scaffolding", "sentence-frames", "word-banks"}',
  '[
    {"id": "node-1", "type": "student-profile", "position": {"x": 100, "y": 200}, "data": {"label": "Student Profile", "nodeType": "student-profile", "category": "learning", "config": {}}},
    {"id": "node-2", "type": "curriculum-selector", "position": {"x": 350, "y": 200}, "data": {"label": "Writing Topic", "nodeType": "curriculum-selector", "category": "learning", "config": {"subjectArea": "ela", "strand": "writing"}}},
    {"id": "node-3", "type": "scaffolded-content", "position": {"x": 600, "y": 100}, "data": {"label": "Sentence Frames", "nodeType": "scaffolded-content", "category": "scaffolding", "config": {"scaffoldingType": "sentence-frames"}}},
    {"id": "node-4", "type": "vocabulary-builder", "position": {"x": 600, "y": 300}, "data": {"label": "Word Bank", "nodeType": "vocabulary-builder", "category": "learning", "config": {"maxWords": 15}}},
    {"id": "node-5", "type": "human-input", "position": {"x": 850, "y": 200}, "data": {"label": "Write Response", "nodeType": "human-input", "category": "interaction", "config": {"inputType": "text"}}},
    {"id": "node-6", "type": "feedback", "position": {"x": 1100, "y": 200}, "data": {"label": "Writing Feedback", "nodeType": "feedback", "category": "output", "config": {"feedbackStyle": "encouraging"}}}
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "node-1", "target": "node-2"},
    {"id": "e2-3", "source": "node-2", "target": "node-3"},
    {"id": "e2-4", "source": "node-2", "target": "node-4"},
    {"id": "e3-5", "source": "node-3", "target": "node-5"},
    {"id": "e4-5", "source": "node-4", "target": "node-5"},
    {"id": "e5-6", "source": "node-5", "target": "node-6"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert Demo Data (Optional - for development)
-- ============================================================================

-- Note: In production, remove or comment out this section
-- This creates a demo teacher and students for testing

-- Demo teacher (requires auth.users entry first in Supabase)
-- INSERT INTO teacher_profiles (id, first_name, last_name, email, school_name)
-- VALUES (
--   'demo-teacher-uuid', -- Replace with actual auth.users id
--   'Demo',
--   'Teacher',
--   'demo@linguaflow.dev',
--   'LinguaFlow Demo School'
-- ) ON CONFLICT DO NOTHING;
