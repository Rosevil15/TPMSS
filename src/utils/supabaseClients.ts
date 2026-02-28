/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from '../config/env';
import { logger } from './logger';

// Validate environment variables on initialization
try {
  validateEnv();
} catch (error) {
  logger.error('Failed to initialize Supabase client', error);
  throw error;
}

export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});