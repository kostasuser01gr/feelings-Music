/**
 * Security Headers Module
 * HTTP security headers to protect against common attacks
 */

/**
 * Content Security Policy (CSP)
 * Prevents XSS, clickjacking, and other code injection attacks
 */
export function getContentSecurityPolicy(isDevelopment: boolean = false): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      isDevelopment ? "'unsafe-eval'" : '', // For Next.js dev mode
      "'unsafe-inline'", // TODO: Remove in production, use nonce
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 images
      'blob:', // For generated images
      'https:', // External images
    ],
    'font-src': [
      "'self'",
      'data:',
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com', // OpenAI API
      'https://*.firebase.com', // Firebase
      'https://*.firebaseio.com',
      'https://*.googleapis.com',
      isDevelopment ? 'ws://localhost:*' : '', // WebSocket for dev
      isDevelopment ? 'http://localhost:*' : '',
    ].filter(Boolean),
    'media-src': [
      "'self'",
      'blob:',
      'data:',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"], // Prevents embedding in iframes
    'upgrade-insecure-requests': isDevelopment ? [] : [''], // Force HTTPS in production
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) return '';
      return `${key} ${values.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Permissions Policy (formerly Feature Policy)
 * Control which browser features can be used
 */
export function getPermissionsPolicy(): string {
  const policies = {
    camera: ['self'], // Allow camera for this origin
    microphone: ['self'], // Allow microphone for this origin
    geolocation: [], // Disable geolocation
    'payment': [], // Disable payment
    usb: [], // Disable USB
    magnetometer: [], // Disable magnetometer
    gyroscope: [], // Disable gyroscope
    accelerometer: [], // Disable accelerometer
    'ambient-light-sensor': [], // Disable ambient light sensor
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) return `${key}=()`;
      return `${key}=(${values.join(' ')})`;
    })
    .join(', ');
}

/**
 * All security headers
 */
export function getSecurityHeaders(isDevelopment: boolean = false) {
  return {
    // Content Security Policy
    'Content-Security-Policy': getContentSecurityPolicy(isDevelopment),
    
    // Permissions Policy
    'Permissions-Policy': getPermissionsPolicy(),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS Protection (legacy, but still useful)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy (privacy)
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Force HTTPS (production only)
    ...(isDevelopment ? {} : {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
    
    // Prevent DNS prefetching (privacy)
    'X-DNS-Prefetch-Control': 'off',
    
    // Disable client-side caching of sensitive content
    'Cache-Control': 'no-store, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * CORS configuration
 */
export function getCORSHeaders(origin?: string) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    // Add production domains here
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Apply security headers to Response
 */
export function applySecurityHeaders(
  response: Response,
  isDevelopment: boolean = false
): Response {
  const headers = new Headers(response.headers);
  
  const securityHeaders = getSecurityHeaders(isDevelopment);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Nonce generator for CSP (production use)
 */
export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}

/**
 * CSP violation reporting endpoint handler
 */
export interface CSPViolation {
  documentUri: string;
  violatedDirective: string;
  effectiveDirective: string;
  originalPolicy: string;
  blockedUri: string;
  statusCode: number;
  timestamp: Date;
}

export function parseCSPViolationReport(report: unknown): CSPViolation {
  const cspReport = (report as Record<string, unknown>)['csp-report'] || report;
  const cspObj = cspReport as Record<string, string>;
  
  return {
    documentUri: cspObj['document-uri'] || '',
    violatedDirective: cspObj['violated-directive'] || '',
    effectiveDirective: cspObj['effective-directive'] || '',
    originalPolicy: cspObj['original-policy'] || '',
    blockedUri: cspObj['blocked-uri'] || '',
    statusCode: cspReport['status-code'] || 0,
    timestamp: new Date(),
  };
}
