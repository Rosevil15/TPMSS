/**
 * Application-wide constants
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  HEALTH_WORKER: 'healthworker',
  SOCIAL_WORKER: 'socialworker',
  SCHOOL: 'school',
  USER: 'user',
} as const;

export const ADMIN_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.HEALTH_WORKER,
  USER_ROLES.SOCIAL_WORKER,
  USER_ROLES.SCHOOL,
];

export const CASE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
} as const;

export const RECORD_TYPES = {
  PRENATAL: 'prenatal',
  POSTNATAL: 'postnatal',
  CHILD: 'child',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
  ADMIN: '/admin',
  USER_HOME: '/home',
} as const;

export const APP_CONFIG = {
  APP_NAME: 'L.E.A.P',
  APP_FULL_NAME: 'Local Education and Assistance Platform',
  VERSION: '1.0.0',
} as const;
