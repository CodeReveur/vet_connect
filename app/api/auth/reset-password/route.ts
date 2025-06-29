import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/mail';

// Helper function to create a simple reset token
function createResetToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Send reset link (POST /api/auth/reset-password)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userResult = await client.query(
      'SELECT id, email, full_name FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If the email exists, a reset link has been sent' },
        { status: 200 }
      )
    }

    const user = userResult.rows[0]
    const resetToken = createResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in sessions table (reusing it for simplicity)
    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $1, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      ['reset_' + resetToken, user.id, expiresAt]
    )

    const resetLink = `${process.env.PUBLIC_URL}/reset-password?token=${resetToken}`;
    // In production, send email here
    console.log(`Reset link: ${resetLink}`);
    await sendPasswordResetEmail(email, resetLink, user.full_name);

    return NextResponse.json(
      { message: 'If the email exists, a reset link has been sent' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify reset token and update password (PUT /api/auth/reset-password)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Check if token is valid
    const sessionResult = await client.query(
      `SELECT user_id FROM sessions 
       WHERE token = $1 AND expires_at > NOW()`,
      ['reset_' + token]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const userId = sessionResult.rows[0].user_id

    // Hash the new password
    const textEncoder = new TextEncoder();
    const encoded = textEncoder.encode(newPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Update password
    await client.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    )

    // Delete the reset token
    await client.query(
      'DELETE FROM sessions WHERE token = $1',
      ['reset_' + token]
    )

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}