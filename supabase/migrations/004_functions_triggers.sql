-- L.E.A.P Functions and Triggers
-- Version: 1.0.0
-- Description: Database functions and automated triggers

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_notes_updated_at
  BEFORE UPDATE ON case_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CASE NUMBER GENERATION
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS case_number_seq;

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number = 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('case_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_case_number_trigger
  BEFORE INSERT ON cases
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

-- =====================================================
-- AUDIT LOGGING
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    (SELECT id FROM users WHERE auth_id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_cases
  AFTER INSERT OR UPDATE OR DELETE ON cases
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_health_records
  AFTER INSERT OR UPDATE OR DELETE ON health_records
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- =====================================================
-- VIEWS
-- =====================================================

CREATE OR REPLACE VIEW active_cases_view AS
SELECT 
  c.*,
  p.first_name,
  p.last_name,
  p.region,
  p.province,
  p.municipality,
  u.email as assigned_to_email
FROM cases c
JOIN profiles p ON c.profile_id = p.id
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.status IN ('open', 'in_progress');

CREATE OR REPLACE VIEW health_statistics_view AS
SELECT 
  p.region,
  p.province,
  p.municipality,
  hr.record_type,
  COUNT(*) as record_count,
  DATE_TRUNC('month', hr.record_date) as month
FROM health_records hr
JOIN profiles p ON hr.profile_id = p.id
GROUP BY p.region, p.province, p.municipality, hr.record_type, DATE_TRUNC('month', hr.record_date);
