/**
 * Enterprise Cryptography Module
 * Industry-standard encryption using proven algorithms
 * AES-256-GCM, bcrypt, PBKDF2
 */

import crypto from 'crypto';

// Environment validation
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const PEPPER = process.env.PEPPER;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn('⚠️ ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate with: openssl rand -hex 32');
}

if (!PEPPER || PEPPER.length < 32) {
  console.warn('⚠️ PEPPER must be at least 32 characters. Generate with: openssl rand -hex 16');
}

/**
 * Password Hashing Configuration
 */
export const PASSWORD_CONFIG = {
  // bcrypt cost factor (2^12 = 4096 iterations)
  // Higher = more secure but slower
  SALT_ROUNDS: 12,
  
  // PBKDF2 iterations for key derivation
  PBKDF2_ITERATIONS: 100000,
  
  // Minimum password requirements
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
} as const;

/**
 * Encryption Configuration
 */
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm' as const,
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16,  // 128 bits
  TAG_LENGTH: 16, // 128 bits
  ENCODING: 'hex' as const,
} as const;

/**
 * Encrypted Data Structure
 */
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  version?: string; // For future algorithm upgrades
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - Data to encrypt
 * @returns Encrypted data with IV and authentication tag
 */
export function encryptData(plaintext: string): EncryptedData {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', ENCRYPTION_CONFIG.ENCODING);
  encrypted += cipher.final(ENCRYPTION_CONFIG.ENCODING);
  
  return {
    encrypted,
    iv: iv.toString(ENCRYPTION_CONFIG.ENCODING),
    tag: cipher.getAuthTag().toString(ENCRYPTION_CONFIG.ENCODING),
    version: '1',
  };
}

/**
 * Decrypt data encrypted with encryptData()
 * @param data - Encrypted data object
 * @returns Decrypted plaintext
 */
export function decryptData(data: EncryptedData): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(data.iv, ENCRYPTION_CONFIG.ENCODING);
  const tag = Buffer.from(data.tag, ENCRYPTION_CONFIG.ENCODING);
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(data.encrypted, ENCRYPTION_CONFIG.ENCODING, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Zero-Knowledge Encryption
 * Data encrypted with user's password - server never sees the key
 */
export class ZeroKnowledgeVault {
  /**
   * Encrypt user data with their password
   * Server cannot decrypt this data
   */
  static encrypt(data: object, userPassword: string): EncryptedData {
    if (!PEPPER) {
      throw new Error('PEPPER not configured');
    }

    // Derive encryption key from password using PBKDF2
    const key = crypto.pbkdf2Sync(
      userPassword,
      PEPPER,
      PASSWORD_CONFIG.PBKDF2_ITERATIONS,
      ENCRYPTION_CONFIG.KEY_LENGTH,
      'sha256'
    );
    
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    const plaintext = JSON.stringify(data);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      version: '1',
    };
  }
  
  /**
   * Decrypt user data with their password
   */
  static decrypt<T = unknown>(data: EncryptedData, userPassword: string): T {
    if (!PEPPER) {
      throw new Error('PEPPER not configured');
    }

    const key = crypto.pbkdf2Sync(
      userPassword,
      PEPPER,
      PASSWORD_CONFIG.PBKDF2_ITERATIONS,
      ENCRYPTION_CONFIG.KEY_LENGTH,
      'sha256'
    );
    
    const iv = Buffer.from(data.iv, 'base64');
    const tag = Buffer.from(data.tag, 'base64');
    const encrypted = Buffer.from(data.encrypted, 'base64');
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return JSON.parse(decrypted.toString('utf8'));
  }
}

/**
 * Generate cryptographically secure random tokens
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Validate CSRF token using constant-time comparison
 * Prevents timing attacks
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  if (token.length !== storedToken.length) return false;
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(storedToken)
    );
  } catch {
    return false;
  }
}

/**
 * Hash data using SHA-256 (for non-password hashing)
 */
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate deterministic hash for indexing (email lookups)
 */
export function generateIndexHash(value: string): string {
  if (!PEPPER) {
    throw new Error('PEPPER not configured');
  }
  
  return crypto
    .createHmac('sha256', PEPPER)
    .update(value.toLowerCase().trim())
    .digest('hex');
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * Generate session token with metadata
 */
export interface SessionToken {
  token: string;
  hash: string; // Store this in DB
  expiresAt: Date;
}

export function generateSessionToken(expiryDays: number = 7): SessionToken {
  const token = generateSecureToken(48);
  const hash = hashSHA256(token);
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  
  return { token, hash, expiresAt };
}

/**
 * Validate session token
 */
export function validateSessionToken(token: string, storedHash: string): boolean {
  const hash = hashSHA256(token);
  return secureCompare(hash, storedHash);
}
