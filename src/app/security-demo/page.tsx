/**
 * Security Demo Page
 * Test the security features
 */

'use client';

import React, { useState } from 'react';

export default function SecurityDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>(null);


  const handleRegister = async () => {
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Request failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🔐 Security System Demo
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Test Password Security</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 rounded border border-white/30 focus:outline-none focus:border-purple-400"
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 rounded border border-white/30 focus:outline-none focus:border-purple-400"
                placeholder="Enter password"
              />
            </div>
            
            <button
              onClick={handleRegister}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded font-bold hover:from-purple-700 hover:to-blue-700"
            >
              Test Password Hashing
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Result:</h3>
            <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4">✅ Security Features Active:</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ AES-256-GCM encryption</li>
            <li>✓ bcrypt password hashing (12 rounds)</li>
            <li>✓ Rate limiting (5 attempts per 15 min)</li>
            <li>✓ CSRF protection</li>
            <li>✓ XSS prevention</li>
            <li>✓ SQL injection protection</li>
            <li>✓ Session management</li>
            <li>✓ Security headers (CSP, HSTS, etc.)</li>
            <li>✓ Input validation & sanitization</li>
            <li>✓ International language support</li>
          </ul>
        </div>
        
        <div className="mt-8 text-center text-sm opacity-70">
          <p>All user data is encrypted using industry-standard algorithms</p>
          <p className="mt-2">Zero-knowledge architecture: Server cannot decrypt user vault data</p>
        </div>
      </div>
    </div>
  );
}
