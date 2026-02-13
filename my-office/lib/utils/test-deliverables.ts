import { createDeliverable } from '@/lib/types/deliverable';
import type { Deliverable } from '@/lib/types/deliverable';

/**
 * Sample deliverables for testing the UI components
 */
export function getSampleDeliverables(missionId: string): Deliverable[] {
  return [
    // LEO - Code deliverable
    createDeliverable(
      'code',
      'User Authentication Component',
      `import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Login</Button>
    </form>
  );
}`,
      'leo',
      missionId,
      {
        language: 'typescript',
        fileExtension: '.tsx',
        tags: ['react', 'authentication', 'component'],
      }
    ),

    // MOMO - Plan deliverable
    createDeliverable(
      'plan',
      'Feature Implementation Roadmap',
      `# Authentication Feature Implementation Plan

## Phase 1: Core Authentication (Week 1)
- [ ] Design login UI components
- [ ] Implement JWT token management
- [ ] Create authentication context
- [ ] Build login/logout flows

## Phase 2: User Management (Week 2)
- [ ] User profile page
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Session management

## Phase 3: Security Enhancements (Week 3)
- [ ] Two-factor authentication
- [ ] Rate limiting
- [ ] Security audit
- [ ] Penetration testing

## Success Metrics
- Login success rate > 99%
- Average login time < 2s
- Zero security vulnerabilities
- User satisfaction score > 4.5/5`,
      'momo',
      missionId,
      {
        format: 'markdown',
        fileExtension: '.md',
        tags: ['planning', 'roadmap', 'authentication'],
      }
    ),

    // ALEX - Analysis deliverable
    createDeliverable(
      'analysis',
      'Security Audit Report',
      `# Security Analysis Report

## Executive Summary
Comprehensive security audit of the authentication system reveals **3 critical issues** and **5 recommendations** for improvement.

## Critical Findings

### 1. Password Storage (CRITICAL)
- **Issue**: Passwords stored in plain text
- **Risk**: High - Data breach exposure
- **Fix**: Implement bcrypt hashing with salt

### 2. Session Management (HIGH)
- **Issue**: No session timeout
- **Risk**: Medium - Session hijacking
- **Fix**: Implement 30-minute timeout with refresh tokens

### 3. CSRF Protection (MEDIUM)
- **Issue**: Missing CSRF tokens
- **Risk**: Medium - Cross-site request forgery
- **Fix**: Add CSRF token validation

## Recommendations
1. Enable HTTPS for all endpoints
2. Implement rate limiting (5 attempts/minute)
3. Add brute-force protection
4. Log all authentication events
5. Regular security audits (quarterly)

## Compliance
- ✅ GDPR compliant
- ✅ OWASP Top 10 reviewed
- ⚠️ SOC 2 - requires fixes above`,
      'alex',
      missionId,
      {
        format: 'report',
        fileExtension: '.md',
        tags: ['security', 'audit', 'analysis'],
      }
    ),

    // LEO - Another code deliverable
    createDeliverable(
      'code',
      'API Authentication Middleware',
      `import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = verify(token, JWT_SECRET);

    // Attach user info to request
    (request as any).user = payload;

    return null; // Allow request to continue
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 403 }
    );
  }
}`,
      'leo',
      missionId,
      {
        language: 'typescript',
        fileExtension: '.ts',
        tags: ['api', 'middleware', 'authentication', 'security'],
      }
    ),

    // MOMO - Document deliverable
    createDeliverable(
      'document',
      'API Documentation',
      `# Authentication API Documentation

## POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

**Errors:**
- 401: Invalid credentials
- 429: Too many attempts

## POST /api/auth/logout
Invalidate current session.

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response (200):**
\`\`\`json
{
  "message": "Logged out successfully"
}
\`\`\``,
      'momo',
      missionId,
      {
        format: 'markdown',
        fileExtension: '.md',
        tags: ['documentation', 'api', 'authentication'],
      }
    ),
  ];
}
