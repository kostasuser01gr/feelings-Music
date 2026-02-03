/**
 * Session Management Module
 * Secure session handling with token rotation
 */

import { generateSessionToken, validateSessionToken } from './crypto';

export interface Session {
  id: string;
  userId: string;
  token: string; // Only returned on creation
  tokenHash: string; // Stored in DB
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export interface SessionMetadata {
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  // Session duration
  EXPIRY_DAYS: 7,
  
  // Inactivity timeout (30 minutes)
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,
  
  // Rotation threshold (4 days before expiry)
  ROTATION_THRESHOLD_DAYS: 4,
  
  // Maximum sessions per user
  MAX_SESSIONS_PER_USER: 5,
} as const;

/**
 * Parse User-Agent header for device info
 */
function parseUserAgent(userAgent: string): SessionMetadata['deviceInfo'] {
  const ua = userAgent.toLowerCase();
  
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';
  
  // Browser detection
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // OS detection
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Device detection
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }
  
  return { browser, os, device };
}

/**
 * Extract session metadata from request
 */
export function extractSessionMetadata(req: Request): SessionMetadata {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const deviceInfo = parseUserAgent(userAgent);
  
  return {
    ipAddress,
    userAgent,
    deviceInfo,
  };
}

/**
 * Create new session
 */
export function createSession(
  userId: string,
  metadata: SessionMetadata
): Omit<Session, 'id' | 'lastActivityAt'> {
  const { token, hash, expiresAt } = generateSessionToken(SESSION_CONFIG.EXPIRY_DAYS);
  
  return {
    userId,
    token, // Return to client
    tokenHash: hash, // Store in DB
    createdAt: new Date(),
    expiresAt,
    ...metadata,
  };
}

/**
 * Validate session token
 */
export function validateSession(token: string, session: Session): {
  valid: boolean;
  reason?: string;
  shouldRotate?: boolean;
} {
  // Check if session expired
  if (new Date() > session.expiresAt) {
    return { valid: false, reason: 'Session expired' };
  }
  
  // Check inactivity timeout
  const inactiveMs = Date.now() - session.lastActivityAt.getTime();
  if (inactiveMs > SESSION_CONFIG.INACTIVITY_TIMEOUT_MS) {
    return { valid: false, reason: 'Session inactive' };
  }
  
  // Validate token hash
  if (!validateSessionToken(token, session.tokenHash)) {
    return { valid: false, reason: 'Invalid token' };
  }
  
  // Check if session should be rotated
  const daysUntilExpiry = (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const shouldRotate = daysUntilExpiry < SESSION_CONFIG.ROTATION_THRESHOLD_DAYS;
  
  return { valid: true, shouldRotate };
}

/**
 * Rotate session token (for security)
 */
export function rotateSessionToken(): {
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const { token, hash, expiresAt } = generateSessionToken(SESSION_CONFIG.EXPIRY_DAYS);
  
  return {
    token,
    tokenHash: hash,
    expiresAt,
  };
}

/**
 * Session cookie configuration
 */
export function getSessionCookieOptions(secure: boolean = true) {
  return {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure, // HTTPS only in production
    sameSite: 'lax' as const, // CSRF protection
    maxAge: SESSION_CONFIG.EXPIRY_DAYS * 24 * 60 * 60, // seconds
    path: '/',
  };
}

/**
 * Session security audit log entry
 */
export interface SessionAuditLog {
  sessionId: string;
  userId: string;
  action: 'created' | 'validated' | 'rotated' | 'invalidated' | 'expired';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  reason?: string;
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  session: Session,
  action: SessionAuditLog['action'],
  reason?: string
): SessionAuditLog {
  return {
    sessionId: session.id,
    userId: session.userId,
    action,
    timestamp: new Date(),
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    reason,
  };
}

/**
 * Detect suspicious session activity
 */
export function detectSuspiciousActivity(
  currentSession: Session,
  newRequest: SessionMetadata
): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  // IP address changed
  if (currentSession.ipAddress !== newRequest.ipAddress) {
    reasons.push('IP address changed');
  }
  
  // User agent changed significantly
  if (currentSession.userAgent !== newRequest.userAgent) {
    const currentDevice = currentSession.deviceInfo?.device || 'Unknown';
    const newDevice = newRequest.deviceInfo?.device || 'Unknown';
    
    if (currentDevice !== newDevice) {
      reasons.push('Device type changed');
    }
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Revoke all user sessions (logout from all devices)
 */
export interface RevokeAllSessionsResult {
  revokedCount: number;
  timestamp: Date;
}

/**
 * Session cleanup (remove expired sessions)
 */
export function isExpiredSession(session: Session): boolean {
  const now = new Date();
  
  // Check expiry date
  if (now > session.expiresAt) {
    return true;
  }
  
  // Check inactivity
  const inactiveMs = now.getTime() - session.lastActivityAt.getTime();
  if (inactiveMs > SESSION_CONFIG.INACTIVITY_TIMEOUT_MS) {
    return true;
  }
  
  return false;
}
