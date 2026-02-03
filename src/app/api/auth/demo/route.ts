/**
 * Authentication API - Demo Endpoint
 * Demonstrates the security system
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, validatePassword } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    if (action === 'register') {
      // Validate password
      const validation = validatePassword(password);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Password validation failed', details: validation.errors },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        data: {
          email,
          passwordHash, // In production, store this in database
        },
      });
    }

    if (action === 'login') {
      // In production, fetch user from database
      // For demo, we'll just validate the password format
      const validation = validatePassword(password);
      
      return NextResponse.json({
        success: true,
        message: 'Login endpoint ready',
        passwordValid: validation.valid,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
