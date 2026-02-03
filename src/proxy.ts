/**
 * Next.js Proxy/Middleware
 * Combines cache control with enterprise security
 */

import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { getSecurityHeaders, getCORSHeaders } from '@/lib/security/headers';
import { checkRateLimit, getClientIdentifier, RATE_LIMIT_PRESETS } from '@/lib/security/rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Cache control (original functionality)
  if (isDevelopment) {
    response.headers.set(
      "Clear-Site-Data",
      '"cache", "storage", "executionContexts"'
    );
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  // 1. Apply security headers to all responses
  const securityHeaders = getSecurityHeaders(isDevelopment);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // 2. CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCORSHeaders(origin || undefined);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
  }
  
  // 3. Rate limiting for sensitive endpoints
  const identifier = getClientIdentifier(request);
  
  // Authentication endpoints
  if (pathname.match(/\/api\/(auth|login|signup|register)/)) {
    const rateLimit = checkRateLimit(identifier, RATE_LIMIT_PRESETS.AUTH);
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: rateLimit.message,
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_PRESETS.AUTH.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_PRESETS.AUTH.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetAt).toISOString());
  }
  
  // API endpoints (general)
  if (pathname.startsWith('/api/') && !pathname.match(/\/api\/(auth|login|signup)/)) {
    const rateLimit = checkRateLimit(identifier, RATE_LIMIT_PRESETS.API);
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: rateLimit.message,
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  }
  
  // 4. Force HTTPS in production
  if (!isDevelopment && request.nextUrl.protocol !== 'https:') {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl);
  }
  
  // 5. Security audit logging
  if (pathname.startsWith('/api/')) {
    console.log('[SECURITY]', {
      method: request.method,
      path: pathname,
      ip: identifier,
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|manifest.json).*)',
    '/api/:path*',
  ],
};
