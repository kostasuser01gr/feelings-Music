/**
 * Security Dashboard
 * Visual demonstration of all security features
 */

'use client';

import React from 'react';

export default function SecurityDashboard() {
  const features = [
    {
      category: 'Cryptography',
      icon: '🔐',
      items: [
        { name: 'AES-256-GCM', description: 'Military-grade encryption for data at rest', status: 'active' },
        { name: 'bcrypt', description: '12-round password hashing (~250ms per hash)', status: 'active' },
        { name: 'PBKDF2', description: '100,000 iterations for key derivation', status: 'active' },
        { name: 'Zero-Knowledge Vault', description: 'User data encrypted with their password', status: 'active' },
      ],
    },
    {
      category: 'Attack Prevention',
      icon: '🛡️',
      items: [
        { name: 'SQL Injection', description: 'Parameterized queries (Prisma ORM)', status: 'protected' },
        { name: 'XSS', description: 'CSP headers + input sanitization', status: 'protected' },
        { name: 'CSRF', description: 'Token validation + SameSite cookies', status: 'protected' },
        { name: 'Brute Force', description: '5 attempts per 15 minutes', status: 'protected' },
        { name: 'DDoS', description: '100 requests per minute rate limiting', status: 'protected' },
        { name: 'Session Hijacking', description: 'HttpOnly + Secure cookies', status: 'protected' },
        { name: 'Man-in-the-Middle', description: 'HTTPS + HSTS enforcement', status: 'protected' },
        { name: 'Timing Attacks', description: 'Constant-time comparison', status: 'protected' },
      ],
    },
    {
      category: 'Session & Authentication',
      icon: '🔑',
      items: [
        { name: 'Token Rotation', description: 'Auto-rotation 4 days before expiry', status: 'active' },
        { name: 'Inactivity Timeout', description: '30 minutes auto-logout', status: 'active' },
        { name: 'Device Fingerprinting', description: 'Browser, OS, IP tracking', status: 'active' },
        { name: 'Suspicious Activity Detection', description: 'IP/device change alerts', status: 'active' },
      ],
    },
    {
      category: 'Data Protection',
      icon: '🔒',
      items: [
        { name: 'Input Validation', description: 'Email, URL, phone, file validation', status: 'active' },
        { name: 'Sanitization', description: 'XSS, Unicode, control char removal', status: 'active' },
        { name: 'Content Security Policy', description: 'Script, style, frame controls', status: 'active' },
        { name: 'Permissions Policy', description: 'Camera, mic, geolocation controls', status: 'active' },
      ],
    },
    {
      category: 'International Support',
      icon: '🌍',
      items: [
        { name: 'Languages', description: '14 languages supported (EN, EL, ES, FR, DE, IT, PT, RU, ZH, JA, KO, AR, HI, TR)', status: 'active' },
        { name: 'Unicode Support', description: 'Full UTF-8 encoding for all text', status: 'active' },
        { name: 'International Domains', description: 'IDN email validation', status: 'active' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Enterprise Security System
          </h1>
          <p className="text-xl opacity-90">
            Military-grade protection for your personal information
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Attack Vectors Blocked', value: '11+', icon: '🛡️' },
            { label: 'Encryption Strength', value: '256-bit', icon: '🔐' },
            { label: 'Hash Iterations', value: '100K+', icon: '🔑' },
            { label: 'Languages Supported', value: '14', icon: '🌍' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-8">
          {features.map((section, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-4xl">{section.icon}</span>
                {section.category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, i) => (
                  <div key={i} className="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'active' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.status === 'active' ? '✓ ACTIVE' : '✓ PROTECTED'}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Security Guarantee */}
        <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-8 border border-purple-400/30">
          <h3 className="text-2xl font-bold mb-4 text-center">🏆 Security Guarantee</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">♾️</div>
              <h4 className="font-bold mb-1">Mathematically Proven</h4>
              <p className="text-sm opacity-80">AES-256 would take billions of years to crack</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🔬</div>
              <h4 className="font-bold mb-1">Battle-Tested</h4>
              <p className="text-sm opacity-80">Used by governments, banks, and Fortune 500</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📜</div>
              <h4 className="font-bold mb-1">Compliance Ready</h4>
              <p className="text-sm opacity-80">GDPR, CCPA, SOC 2 compliant architecture</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <a
            href="/security-demo"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            🧪 Test Security Features
          </a>
          
          <p className="text-sm opacity-70 max-w-2xl mx-auto mt-4">
            Your passwords, personal data, and sensitive information are protected using the same encryption standards trusted by the NSA, NATO, and major financial institutions worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
