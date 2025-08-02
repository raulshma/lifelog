// Common utility helper functions

// Generate a random string
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format date to ISO string
export function formatDate(date: Date): string {
  return date.toISOString();
}

// Parse environment variable as integer
export function parseEnvInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Parse environment variable as boolean
export function parseEnvBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Sanitize string for logging (remove sensitive data)
export function sanitizeForLog(obj: any): any {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLog);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Create pagination metadata
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}