-- ============================================================================
-- LinguaFlow Row Level Security Policies
-- Ensures teachers can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Teacher Profiles Policies
-- ============================================================================

-- Teachers can view their own profile
CREATE POLICY "Teachers can view own profile"
  ON teacher_profiles FOR SELECT
  USING (auth.uid() = id);

-- Teachers can update their own profile
CREATE POLICY "Teachers can update own profile"
  ON teacher_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during registration
CREATE POLICY "Enable insert for authenticated users only"
  ON teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Students Policies
-- ============================================================================

-- Teachers can view their own students
CREATE POLICY "Teachers can view their students"
  ON students FOR SELECT
  USING (teacher_id = auth.uid());

-- Teachers can insert students
CREATE POLICY "Teachers can insert students"
  ON students FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- Teachers can update their students
CREATE POLICY "Teachers can update their students"
  ON students FOR UPDATE
  USING (teacher_id = auth.uid());

-- Teachers can delete their students
CREATE POLICY "Teachers can delete their students"
  ON students FOR DELETE
  USING (teacher_id = auth.uid());

-- ============================================================================
-- Classrooms Policies
-- ============================================================================

-- Teachers can view their classrooms
CREATE POLICY "Teachers can view their classrooms"
  ON classrooms FOR SELECT
  USING (teacher_id = auth.uid());

-- Teachers can manage their classrooms
CREATE POLICY "Teachers can manage their classrooms"
  ON classrooms FOR ALL
  USING (teacher_id = auth.uid());

-- ============================================================================
-- Classroom Students Policies
-- ============================================================================

-- Teachers can view classroom enrollments for their classrooms
CREATE POLICY "Teachers can view classroom enrollments"
  ON classroom_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = classroom_students.classroom_id
      AND classrooms.teacher_id = auth.uid()
    )
  );

-- Teachers can manage classroom enrollments
CREATE POLICY "Teachers can manage classroom enrollments"
  ON classroom_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = classroom_students.classroom_id
      AND classrooms.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- Workflows Policies
-- ============================================================================

-- Authors can view their own workflows
CREATE POLICY "Authors can view their workflows"
  ON workflows FOR SELECT
  USING (author_id = auth.uid());

-- Public workflows are visible to all authenticated users
CREATE POLICY "Public workflows are visible"
  ON workflows FOR SELECT
  USING (is_public = true);

-- Template workflows are visible to all authenticated users
CREATE POLICY "Templates are visible"
  ON workflows FOR SELECT
  USING (is_template = true);

-- Authors can manage their workflows
CREATE POLICY "Authors can manage their workflows"
  ON workflows FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their workflows"
  ON workflows FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their workflows"
  ON workflows FOR DELETE
  USING (author_id = auth.uid());

-- ============================================================================
-- Learning Sessions Policies
-- ============================================================================

-- Teachers can view sessions for their students
CREATE POLICY "Teachers can view student sessions"
  ON learning_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = learning_sessions.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- Teachers can manage sessions for their students
CREATE POLICY "Teachers can manage student sessions"
  ON learning_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = learning_sessions.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- Progress Records Policies
-- ============================================================================

-- Teachers can view progress for their students
CREATE POLICY "Teachers can view student progress"
  ON progress_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = progress_records.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- Teachers can insert progress for their students
CREATE POLICY "Teachers can insert student progress"
  ON progress_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = progress_records.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- Vocabulary Progress Policies
-- ============================================================================

-- Teachers can view vocabulary progress for their students
CREATE POLICY "Teachers can view vocabulary progress"
  ON vocabulary_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = vocabulary_progress.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- Teachers can manage vocabulary progress
CREATE POLICY "Teachers can manage vocabulary progress"
  ON vocabulary_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = vocabulary_progress.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- Assessment Results Policies
-- ============================================================================

-- Teachers can view assessments for their students
CREATE POLICY "Teachers can view assessments"
  ON assessment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = assessment_results.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- Teachers can manage assessments for their students
CREATE POLICY "Teachers can manage assessments"
  ON assessment_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = assessment_results.student_id
      AND students.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- Workflow Assignments Policies
-- ============================================================================

-- Teachers can view assignments they created
CREATE POLICY "Teachers can view their assignments"
  ON workflow_assignments FOR SELECT
  USING (assigned_by = auth.uid());

-- Teachers can manage their assignments
CREATE POLICY "Teachers can manage their assignments"
  ON workflow_assignments FOR ALL
  USING (assigned_by = auth.uid());

-- ============================================================================
-- Teacher Favorites Policies
-- ============================================================================

-- Teachers can view their favorites
CREATE POLICY "Teachers can view their favorites"
  ON teacher_favorites FOR SELECT
  USING (teacher_id = auth.uid());

-- Teachers can manage their favorites
CREATE POLICY "Teachers can manage their favorites"
  ON teacher_favorites FOR ALL
  USING (teacher_id = auth.uid());

-- ============================================================================
-- Grant permissions to authenticated users
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
