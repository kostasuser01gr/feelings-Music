/**
 * Rate Limiting Module
 * Protection against brute force, DDoS, and API abuse
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

export interface RateLimitRecord {
  count: number;
  resetAt: number;
  blocked: boolean;
}

/**
 * In-memory rate limit store
 * In production, use Redis for distributed systems
 */
class RateLimitStore {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
  
  get(key: string): RateLimitRecord | undefined {
    return this.store.get(key);
  }
  
  set(key: string, record: RateLimitRecord): void {
    this.store.set(key, record);
  }
  
  delete(key: string): void {
    this.store.delete(key);
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }
  
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

const globalStore = new RateLimitStore();

/**
 * Rate limiting presets
 */
export const RATE_LIMIT_PRESETS = {
  // Authentication endpoints (strict)
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  
  // API endpoints (moderate)
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many API requests. Please slow down.',
  },
  
  // Public endpoints (lenient)
  PUBLIC: {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please try again later.',
  },
  
  // Password reset (very strict)
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset attempts. Please try again in 1 hour.',
  },
  
  // File upload (strict)
  UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many upload requests. Please wait before uploading again.',
  },
} as const;

/**
 * Check rate limit for a key (e.g., IP address, user ID)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number; message?: string } {
  const now = Date.now();
  const record = globalStore.get(key);
  
  // No record or expired - allow and create new record
  if (!record || now > record.resetAt) {
    globalStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
      blocked: false,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }
  
  // Already blocked
  if (record.blocked) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      message: config.message || 'Rate limit exceeded',
    };
  }
  
  // Increment count
  record.count++;
  
  // Check if limit exceeded
  if (record.count > config.maxRequests) {
    record.blocked = true;
    globalStore.set(key, record);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      message: config.message || 'Rate limit exceeded',
    };
  }
  
  // Update record
  globalStore.set(key, record);
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Reset rate limit for a key (admin use)
 */
export function resetRateLimit(key: string): void {
  globalStore.delete(key);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (behind proxy)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return (req: Request): Response | null => {
    const identifier = getClientIdentifier(req);
    const result = checkRateLimit(identifier, config);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: result.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
          },
        }
      );
    }
    
    // Add rate limit headers to response
    return null; // Continue to handler
  };
}

/**
 * Sliding window rate limiter (more accurate)
 */
export class SlidingWindowRateLimiter {
  private timestamps = new Map<string, number[]>();
  
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.timestamps.get(key) || [];
    
    // Remove expired timestamps
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    // Check if limit exceeded
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.timestamps.set(key, validTimestamps);
    
    return true;
  }
  
  reset(key: string): void {
    this.timestamps.delete(key);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.timestamps.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < 60000);
      if (validTimestamps.length === 0) {
        this.timestamps.delete(key);
      } else {
        this.timestamps.set(key, validTimestamps);
      }
    }
  }
}
