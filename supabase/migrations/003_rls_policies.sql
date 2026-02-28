-- L.E.A.P Row Level Security Policies
-- Version: 1.0.0
-- Description: Enable RLS and create security policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own privacy agreement"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker', 'socialworker', 'school')
    )
  );

CREATE POLICY "Staff can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker', 'socialworker', 'school')
    )
  );

CREATE POLICY "Staff can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker', 'socialworker', 'school')
    )
  );

-- =====================================================
-- HEALTH RECORDS POLICIES
-- =====================================================

CREATE POLICY "Users can view own health records"
  ON health_records FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Health workers can view all health records"
  ON health_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker')
    )
  );

CREATE POLICY "Health workers can create health records"
  ON health_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker')
    )
  );

CREATE POLICY "Health workers can update health records"
  ON health_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker')
    )
  );

-- =====================================================
-- CASES POLICIES
-- =====================================================

CREATE POLICY "Staff can view cases"
  ON cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'socialworker', 'healthworker')
    )
  );

CREATE POLICY "Staff can create cases"
  ON cases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'socialworker', 'healthworker')
    )
  );

CREATE POLICY "Staff can update cases"
  ON cases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'socialworker', 'healthworker')
    )
  );

-- =====================================================
-- ENROLLMENTS POLICIES
-- =====================================================

CREATE POLICY "School staff can view enrollments"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'school')
    )
  );

CREATE POLICY "School staff can create enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'school')
    )
  );

CREATE POLICY "School staff can update enrollments"
  ON enrollments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'school')
    )
  );

-- =====================================================
-- CASE NOTES POLICIES
-- =====================================================

CREATE POLICY "Staff can view case notes"
  ON case_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'socialworker', 'healthworker')
    )
  );

CREATE POLICY "Staff can create case notes"
  ON case_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'socialworker', 'healthworker')
    )
  );

-- =====================================================
-- DOCUMENTS POLICIES
-- =====================================================

CREATE POLICY "Staff can view documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker', 'socialworker', 'school')
    )
  );

CREATE POLICY "Staff can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'healthworker', 'socialworker', 'school')
    )
  );

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );
