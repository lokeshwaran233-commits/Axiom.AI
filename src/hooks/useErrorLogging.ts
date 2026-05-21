// Required environment variables:
// - VITE_SUPABASE_URL: Supabase project URL
// - VITE_SUPABASE_ANON_KEY: Supabase anonymous key
import { useCallback } from 'react';

interface ErrorLogEntry {
  timestamp: string;
  boundary: string;
  message: string;
  stack?: string;
  url: string;
}

const errorBuffer: ErrorLogEntry[] = [];
const MAX_BUFFER = 100;

export function useErrorLogging() {
  const logError = useCallback((boundary: string, error: Error) => {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      boundary,
      message: error.message,
      stack: error.stack,
      url: window.location.href,
    };

    errorBuffer.push(entry);
    if (errorBuffer.length > MAX_BUFFER) {
      errorBuffer.shift();
    }

    if (import.meta.env.VITE_SUPABASE_URL) {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          action: 'error_boundary_triggered',
          resource_type: 'error',
          details: {
            boundary,
            message: error.message,
            stack: error.stack?.substring(0, 500),
          },
        }),
      }).catch(() => {});
    }
  }, []);

  const getErrorHistory = useCallback(() => [...errorBuffer], []);

  const clearErrorHistory = useCallback(() => {
    errorBuffer.length = 0;
  }, []);

  return { logError, getErrorHistory, clearErrorHistory };
}
