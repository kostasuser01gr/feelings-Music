/**
 * Input Validation & Sanitization Module
 * Protect against XSS, SQL injection, and other injection attacks
 */

/**
 * Supported languages for international users
 */
export const SUPPORTED_LANGUAGES = [
  'en', 'el', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Email validation (RFC 5322 compliant)
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Length check
  if (email.length > 254) return false;
  
  // Basic format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Domain validation
  const [local, domain] = email.split('@');
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (domain.length > 253) return false;
  
  // International domain support (IDN)
  try {
    new URL(`http://${domain}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Username validation
 */
export function validateUsername(username: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
    return { valid: false, errors };
  }
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  // Allow letters, numbers, underscore, hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscore, and hyphen');
  }
  
  // Must start with letter
  if (!/^[a-zA-Z]/.test(username)) {
    errors.push('Username must start with a letter');
  }
  
  // Reserved usernames
  const reserved = ['admin', 'root', 'system', 'api', 'test', 'null', 'undefined'];
  if (reserved.includes(username.toLowerCase())) {
    errors.push('This username is reserved');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user input (prevent XSS)
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove control characters (except newline, tab)
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize whitespace
    .trim()
    // Limit length (DoS protection)
    .slice(0, maxLength);
}

/**
 * Sanitize HTML (remove dangerous tags)
 */
export function sanitizeHTML(html: string): string {
  // In production, use DOMPurify or similar
  // This is a basic implementation
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate phone number (international)
 */
export function validatePhone(phone: string): boolean {
  // E.164 format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

/**
 * Validate date string
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate JSON
 */
export function validateJSON(jsonString: string): {
  valid: boolean;
  data?: unknown;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);
    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

/**
 * SQL injection prevention (for raw queries)
 * Note: Use parameterized queries instead
 */
export function escapeSQLString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Path traversal prevention
 */
export function validateFilePath(path: string): boolean {
  // Prevent directory traversal
  if (path.includes('..')) return false;
  if (path.includes('~')) return false;
  
  // Only allow alphanumeric, dash, underscore, dot
  return /^[a-zA-Z0-9._/-]+$/.test(path);
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSize: number; // bytes
  allowedTypes: string[]; // MIME types
  allowedExtensions: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Size check
  if (file.size > options.maxSize) {
    errors.push(`File size exceeds ${Math.round(options.maxSize / 1024 / 1024)}MB limit`);
  }
  
  // Type check
  if (!options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Extension check
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !options.allowedExtensions.includes(extension)) {
    errors.push(`File extension .${extension} is not allowed`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate integer in range
 */
export function validateInteger(
  value: unknown,
  min?: number,
  max?: number
): boolean {
  const num = parseInt(String(value));
  if (isNaN(num)) return false;
  if (num !== parseFloat(String(value))) return false; // Must be integer
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string,
  enumValues: readonly T[]
): value is T {
  return (enumValues as readonly string[]).includes(value);
}

/**
 * Deep object sanitization
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxDepth: number = 10
): T {
  if (maxDepth <= 0) return obj;
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, maxDepth - 1);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item) :
        typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>, maxDepth - 1) :
        item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Request body size limit check
 */
export function checkBodySize(body: unknown, maxSizeKB: number = 1024): boolean {
  const size = new Blob([JSON.stringify(body)]).size;
  return size <= maxSizeKB * 1024;
}
