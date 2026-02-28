-- L.E.A.P Database Indexes
-- Version: 1.0.0
-- Description: Create indexes for performance optimization

-- Users indexes
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Profiles indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_region ON profiles(region);
CREATE INDEX idx_profiles_province ON profiles(province);
CREATE INDEX idx_profiles_municipality ON profiles(municipality);
CREATE INDEX idx_profiles_barangay ON profiles(barangay);
CREATE INDEX idx_profiles_name ON profiles(first_name, last_name);

-- Health records indexes
CREATE INDEX idx_health_records_profile_id ON health_records(profile_id);
CREATE INDEX idx_health_records_type ON health_records(record_type);
CREATE INDEX idx_health_records_date ON health_records(record_date DESC);
CREATE INDEX idx_health_records_created_by ON health_records(created_by);

-- Cases indexes
CREATE INDEX idx_cases_profile_id ON cases(profile_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_number ON cases(case_number);

-- Enrollments indexes
CREATE INDEX idx_enrollments_profile_id ON enrollments(profile_id);
CREATE INDEX idx_enrollments_school_year ON enrollments(school_year);
CREATE INDEX idx_enrollments_status ON enrollments(enrollment_status);

-- Case notes indexes
CREATE INDEX idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX idx_case_notes_created_at ON case_notes(created_at DESC);

-- Documents indexes
CREATE INDEX idx_documents_profile_id ON documents(profile_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
