/**
 * Core type definitions for L.E.A.P application
 */

export type UserRole = 'admin' | 'healthworker' | 'socialworker' | 'school' | 'user';

export interface User {
  id: string;
  auth_id: string;
  email: string;
  role: UserRole;
  active: boolean;
  privacy_agreement: boolean;
  privacy_agreed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_number?: string;
  address?: string;
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  profile_id: string;
  record_type: 'prenatal' | 'postnatal' | 'child';
  record_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CaseRecord {
  id: string;
  profile_id: string;
  case_type: string;
  status: 'open' | 'in_progress' | 'closed';
  description: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LocationData {
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
}
