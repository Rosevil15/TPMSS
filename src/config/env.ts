/**
 * Environment configuration with validation
 */

interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate environment on load
export const validateEnv = (): void => {
  try {
    const { supabase } = env;
    
    if (!supabase.url.startsWith('https://')) {
      throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL');
    }
    
    if (supabase.anonKey.length < 20) {
      throw new Error('VITE_SUPABASE_ANON_KEY appears to be invalid');
    }
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
};
