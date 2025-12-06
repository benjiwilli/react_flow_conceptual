-- ============================================================================
-- LinguaFlow Database Schema
-- Supabase PostgreSQL Database Setup
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users & Authentication (extends Supabase auth.users)
-- ============================================================================

-- Teacher profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  school_name TEXT,
  school_district TEXT,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'specialist')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Students
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  student_number TEXT, -- School student ID
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 12),
  elpa_level INTEGER NOT NULL CHECK (elpa_level >= 1 AND elpa_level <= 5),
  native_language TEXT NOT NULL DEFAULT 'mandarin',
  secondary_languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  accessibility_needs JSONB DEFAULT '{}',
  learning_preferences JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_students_grade ON students(grade_level);
CREATE INDEX idx_students_elpa ON students(elpa_level);

-- ============================================================================
-- Classrooms
-- ============================================================================

CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  grade_level INTEGER CHECK (grade_level >= 0 AND grade_level <= 12),
  subject TEXT,
  academic_year TEXT, -- e.g., "2024-2025"
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);

-- Classroom-Student relationship (many-to-many)
CREATE TABLE IF NOT EXISTS classroom_students (
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (classroom_id, student_id)
);

CREATE INDEX idx_classroom_students_classroom ON classroom_students(classroom_id);
CREATE INDEX idx_classroom_students_student ON classroom_students(student_id);

-- ============================================================================
-- Workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('literacy', 'numeracy', 'vocabulary', 'assessment', 'speaking', 'custom')),
  grade_level INTEGER CHECK (grade_level >= 0 AND grade_level <= 12),
  elpa_levels INTEGER[] DEFAULT '{1,2,3,4,5}',
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES workflows(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflows_author ON workflows(author_id);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_template ON workflows(is_template);
CREATE INDEX idx_workflows_public ON workflows(is_public);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);

-- ============================================================================
-- Learning Sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  current_node_id TEXT,
  execution_state JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_sessions_workflow ON learning_sessions(workflow_id);
CREATE INDEX idx_sessions_classroom ON learning_sessions(classroom_id);
CREATE INDEX idx_sessions_status ON learning_sessions(status);
CREATE INDEX idx_sessions_started ON learning_sessions(started_at);

-- ============================================================================
-- Progress Records
-- ============================================================================

CREATE TABLE IF NOT EXISTS progress_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  score DECIMAL(5,2),
  time_spent_seconds INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  is_correct BOOLEAN,
  feedback_given TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_progress_session ON progress_records(session_id);
CREATE INDEX idx_progress_student ON progress_records(student_id);
CREATE INDEX idx_progress_node ON progress_records(node_id);
CREATE INDEX idx_progress_recorded ON progress_records(recorded_at);

-- ============================================================================
-- Vocabulary Progress
-- ============================================================================

CREATE TABLE IF NOT EXISTS vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  l1_translation TEXT,
  exposure_count INTEGER DEFAULT 1,
  correct_uses INTEGER DEFAULT 0,
  mastery_level TEXT DEFAULT 'introduced' CHECK (mastery_level IN ('introduced', 'practicing', 'mastered')),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, word)
);

CREATE INDEX idx_vocab_student ON vocabulary_progress(student_id);
CREATE INDEX idx_vocab_mastery ON vocabulary_progress(mastery_level);

-- ============================================================================
-- Assessment Results
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('comprehension', 'vocabulary', 'speaking', 'writing', 'numeracy')),
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN max_score > 0 THEN (score / max_score) * 100 ELSE 0 END) STORED,
  questions_data JSONB DEFAULT '[]',
  feedback TEXT,
  elpa_level_at_time INTEGER,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_student ON assessment_results(student_id);
CREATE INDEX idx_assessments_type ON assessment_results(assessment_type);
CREATE INDEX idx_assessments_date ON assessment_results(assessed_at);

-- ============================================================================
-- Workflow Assignments
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES teacher_profiles(id),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CHECK (classroom_id IS NOT NULL OR student_id IS NOT NULL)
);

CREATE INDEX idx_assignments_workflow ON workflow_assignments(workflow_id);
CREATE INDEX idx_assignments_classroom ON workflow_assignments(classroom_id);
CREATE INDEX idx_assignments_student ON workflow_assignments(student_id);

-- ============================================================================
-- Teacher Favorites
-- ============================================================================

CREATE TABLE IF NOT EXISTS teacher_favorites (
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (teacher_id, workflow_id)
);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON classrooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sessions_updated_at
  BEFORE UPDATE ON learning_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
