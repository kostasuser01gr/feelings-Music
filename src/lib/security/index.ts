/**
 * Security Module - Central Export
 * Enterprise-grade security system
 */

// Cryptography
export * from './crypto';

// Password management
export * from './password';

// Rate limiting
export * from './rate-limit';

// Session management
export * from './session';

// Security headers
export * from './headers';

// Input validation
export * from './validation';

/**
 * Security utilities
 */
export const SecurityUtils = {
  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  
  /**
   * Check if HTTPS is enabled
   */
  isSecureConnection(req: Request): boolean {
    return req.url.startsWith('https://') ||
           req.headers.get('x-forwarded-proto') === 'https';
  },
  
  /**
   * Get environment variables with validation
   */
  getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  },
  
  /**
   * Mask sensitive data for logging
   */
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : local[0] + '*';
    
    return `${maskedLocal}@${domain}`;
  },
  
  /**
   * Mask credit card number
   */
  maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '****';
    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  },
  
  /**
   * Mask IP address (GDPR compliance)
   */
  maskIPAddress(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    // IPv6
    const ipv6Parts = ip.split(':');
    if (ipv6Parts.length >= 4) {
      return `${ipv6Parts[0]}:${ipv6Parts[1]}:xxxx:xxxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  },
};

/**
 * Security audit logger
 */
export class SecurityAuditLogger {
  private logs: SecurityAuditLog[] = [];
  
  log(event: Omit<SecurityAuditLog, 'timestamp' | 'id'>): void {
    const log: SecurityAuditLog = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    this.logs.push(log);
    
    // In production, send to logging service
    if (SecurityUtils.isProduction()) {
      this.sendToLoggingService(log);
    } else {
      console.log('[SECURITY AUDIT]', log);
    }
  }
  
  private sendToLoggingService(_log: SecurityAuditLog): void {
    // TODO: Implement logging service integration
    // Examples: Datadog, Sentry, CloudWatch, etc.
  }
  
  getLogs(filter?: Partial<SecurityAuditLog>): SecurityAuditLog[] {
    if (!filter) return this.logs;
    
    return this.logs.filter(log =>
      Object.entries(filter).every(([key, value]) =>
        log[key as keyof SecurityAuditLog] === value
      )
    );
  }
}

export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'blocked';
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

/**
 * Global security audit logger instance
 */
export const securityAudit = new SecurityAuditLogger();
