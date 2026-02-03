/**
 * Password Security Module
 * Uses bcrypt for hashing (industry standard)
 */

import bcrypt from 'bcryptjs';
import { PASSWORD_CONFIG } from './crypto';

/**
 * Password validation rules
 */
export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: PASSWORD_CONFIG.MIN_LENGTH,
  maxLength: PASSWORD_CONFIG.MAX_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Validate password against requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters`);
  }
  
  if (password.length > requirements.maxLength) {
    errors.push(`Password must be less than ${requirements.maxLength} characters`);
  }
  
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if password is in common password list
 * In production, check against haveibeenpwned.com API
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  '111111', 'password1', '123456789', 'letmein', 'welcome',
  'monkey', 'dragon', 'master', 'sunshine', 'princess',
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Calculate password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Length bonus
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  
  // Complexity bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 10;
  
  // Penalties
  if (isCommonPassword(password)) {
    score -= 50;
    feedback.push('This is a commonly used password');
  }
  
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated characters');
  }
  
  if (/^[0-9]+$/.test(password)) {
    score -= 20;
    feedback.push('Avoid using only numbers');
  }
  
  // Cap score
  score = Math.max(0, Math.min(100, score));
  
  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  if (score < 40) {
    level = 'weak';
    feedback.push('Consider using a stronger password');
  } else if (score < 60) {
    level = 'fair';
    feedback.push('Add more character variety');
  } else if (score < 75) {
    level = 'good';
  } else if (score < 90) {
    level = 'strong';
  } else {
    level = 'very-strong';
  }
  
  return { score, level, feedback };
}

/**
 * Hash password using bcrypt
 * Time complexity: ~250ms on modern hardware (intentionally slow)
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate before hashing
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
  }
  
  if (isCommonPassword(password)) {
    throw new Error('This password is too common. Please choose a different password.');
  }
  
  return bcrypt.hash(password, PASSWORD_CONFIG.SALT_ROUNDS);
}

/**
 * Verify password against hash
 * Uses constant-time comparison internally
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if password hash needs rehashing (algorithm upgrade)
 */
export function needsRehash(hash: string): boolean {
  try {
    const rounds = bcrypt.getRounds(hash);
    return rounds < PASSWORD_CONFIG.SALT_ROUNDS;
  } catch {
    return true;
  }
}

/**
 * Generate temporary password for password reset
 */
export function generateTemporaryPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
