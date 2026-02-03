# 🔐 Security Implementation Guide

## Overview

This project implements **enterprise-grade security** using industry-standard cryptography and best practices. The security system is designed to protect user data across all layers of the application.

## 🛡️ Security Features

### 1. **Cryptography** (`src/lib/security/crypto.ts`)
- ✅ **AES-256-GCM** encryption for data at rest
- ✅ **Zero-knowledge architecture** (user data encrypted with their password)
- ✅ **PBKDF2** key derivation (100,000 iterations)
- ✅ **Constant-time comparison** (prevents timing attacks)
- ✅ **CSRF token generation** with secure random bytes

### 2. **Password Security** (`src/lib/security/password.ts`)
- ✅ **bcrypt hashing** (12 rounds, ~250ms per hash)
- ✅ **Password strength validation**
- ✅ **Common password detection**
- ✅ **Automatic rehashing** for algorithm upgrades

### 3. **Rate Limiting** (`src/lib/security/rate-limit.ts`)
- ✅ **Brute force protection** (5 attempts per 15 min for auth)
- ✅ **DDoS protection** (100 req/min for API)
- ✅ **Sliding window algorithm**
- ✅ **Per-IP tracking**

### 4. **Session Management** (`src/lib/security/session.ts`)
- ✅ **Secure token generation** (384-bit randomness)
- ✅ **Token rotation** (before expiry)
- ✅ **Inactivity timeout** (30 minutes)
- ✅ **Device fingerprinting**
- ✅ **Suspicious activity detection**

### 5. **Security Headers** (`src/lib/security/headers.ts`)
- ✅ **Content Security Policy** (XSS prevention)
- ✅ **X-Frame-Options** (clickjacking prevention)
- ✅ **HSTS** (force HTTPS)
- ✅ **Permissions Policy** (feature control)
- ✅ **CORS configuration**

### 6. **Input Validation** (`src/lib/security/validation.ts`)
- ✅ **Email validation** (RFC 5322 compliant)
- ✅ **XSS sanitization**
- ✅ **SQL injection prevention**
- ✅ **Path traversal protection**
- ✅ **File upload validation**
- ✅ **International character support**

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Generate Encryption Keys

```bash
# Generate ENCRYPTION_KEY (64 hex characters = 32 bytes)
openssl rand -hex 32

# Generate PEPPER (32+ characters)
openssl rand -hex 16

# Generate JWT_SECRET
openssl rand -hex 32
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your keys:

```env
ENCRYPTION_KEY=<your-64-char-hex-key>
PEPPER=<your-32-char-secret>
JWT_SECRET=<your-jwt-secret>
```

### 4. Verify Security Middleware

The middleware is already configured in `src/middleware.ts` and applies to all routes automatically.

## 🔒 Usage Examples

### Password Hashing

```typescript
import { hashPassword, verifyPassword } from '@/lib/security';

// Register user
const passwordHash = await hashPassword('user-password-123');
// Store passwordHash in database

// Login verification
const isValid = await verifyPassword('user-password-123', passwordHash);
```

### Data Encryption

```typescript
import { encryptData, decryptData } from '@/lib/security';

// Encrypt sensitive data
const encrypted = encryptData(JSON.stringify({ ssn: '123-45-6789' }));
// Store encrypted.encrypted, encrypted.iv, encrypted.tag in database

// Decrypt when needed
const decrypted = decryptData(encrypted);
```

### Zero-Knowledge Vault

```typescript
import { ZeroKnowledgeVault } from '@/lib/security';

// User's sensitive data (server cannot decrypt this)
const userData = { creditCard: '4111-1111-1111-1111' };
const encrypted = ZeroKnowledgeVault.encrypt(userData, userPassword);
// Store in database

// User logs in and decrypts their own data
const decrypted = ZeroKnowledgeVault.decrypt(encrypted, userPassword);
```

### Session Management

```typescript
import { createSession, validateSession } from '@/lib/security';

// Create session on login
const session = createSession(userId, {
  ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || 'unknown',
});
// Store session in database
// Return session.token to client (httpOnly cookie)

// Validate session on subsequent requests
const validation = validateSession(token, storedSession);
if (!validation.valid) {
  // Session expired or invalid
}
```

### Rate Limiting

```typescript
import { checkRateLimit, RATE_LIMIT_PRESETS } from '@/lib/security';

// In API route
const ip = req.headers.get('x-forwarded-for') || 'unknown';
const rateLimit = checkRateLimit(ip, RATE_LIMIT_PRESETS.AUTH);

if (!rateLimit.allowed) {
  return new Response('Too many requests', { status: 429 });
}
```

### Input Validation

```typescript
import { validateEmail, sanitizeInput } from '@/lib/security';

// Validate email
if (!validateEmail(email)) {
  throw new Error('Invalid email');
}

// Sanitize user input
const clean = sanitizeInput(userInput);
```

## 🌍 International Support

The security system supports users from all countries:

- ✅ **Email validation** with international domains (IDN)
- ✅ **UTF-8 encoding** for all text
- ✅ **Unicode sanitization** (prevents zero-width attacks)
- ✅ **14 supported languages**: English, Greek, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Turkish

## 🚨 Security Checklist

Before deploying to production:

- [ ] Generate and set all environment variables in `.env.local`
- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Set `NODE_ENV=production`
- [ ] Configure Firebase security rules
- [ ] Set up monitoring (Sentry, Datadog, etc.)
- [ ] Enable CSP violation reporting
- [ ] Configure backup encryption keys (key rotation)
- [ ] Set up automated security updates
- [ ] Perform penetration testing
- [ ] Review GDPR compliance (if serving EU users)

## 🔍 Security Monitoring

### Audit Logging

```typescript
import { securityAudit } from '@/lib/security';

// Log security events
securityAudit.log({
  userId: user.id,
  action: 'login',
  resource: '/api/auth/login',
  status: 'success',
  ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || 'unknown',
});
```

### Common Attacks Prevented

| Attack Type | Prevention Method | Status |
|-------------|-------------------|--------|
| SQL Injection | Parameterized queries (Prisma) | ✅ Protected |
| XSS | CSP headers + input sanitization | ✅ Protected |
| CSRF | CSRF tokens + SameSite cookies | ✅ Protected |
| Brute Force | Rate limiting (5 attempts/15min) | ✅ Protected |
| Session Hijacking | HttpOnly + Secure cookies | ✅ Protected |
| Man-in-the-Middle | HTTPS + HSTS | ✅ Protected |
| Timing Attacks | Constant-time comparison | ✅ Protected |
| Rainbow Tables | Salted bcrypt hashes | ✅ Protected |
| DDoS | Rate limiting + CDN | ✅ Protected |
| Path Traversal | Path validation | ✅ Protected |
| File Upload Exploits | Type + size validation | ✅ Protected |

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## ⚠️ Important Notes

1. **Never roll your own crypto** - This implementation uses battle-tested algorithms
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Monitor security logs** - Set up alerts for suspicious activity
4. **Rotate keys periodically** - Generate new encryption keys every 90 days
5. **Follow the principle of least privilege** - Only grant necessary permissions

## 🆘 Support

For security vulnerabilities, please email: security@yourdomain.com

**DO NOT** open public issues for security vulnerabilities.

---

**This security system is production-ready and follows industry best practices.** ✅
