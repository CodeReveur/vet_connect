import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db'
import { sendVerificationLinkEmail } from '@/lib/mail';

// Helper function to create verification token
function createVerificationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Send verification link (POST /api/auth/verify-link)
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]
    const verificationToken = createVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $1, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      ['verify_' + verificationToken, user.id, expiresAt]
    )

    // In production, send email here
    const verificationLink = `${process.env.PUBLIC_URL}/verify-email?token=${verificationToken}`
    console.log(`Verification link for ${email}: ${verificationLink}`)
    await sendVerificationLinkEmail(email, verificationLink, userResult.rows[0].full_name )

    return NextResponse.json(
      { 
        message: 'Verification link sent',
        // Remove this in production
        debug_link: process.env.NODE_ENV === 'development' ? verificationLink : undefined
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Send verification link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify token from link (GET /api/auth/verify-link?token=xxx)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Check if token is valid
    const sessionResult = await client.query(
      `SELECT user_id FROM sessions 
       WHERE token = $1 AND expires_at > NOW()`,
      ['verify_' + token]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    const userId = sessionResult.rows[0].user_id

    // Delete verification token
    await client.query(
      'DELETE FROM sessions WHERE token = $1',
      ['verify_' + token]
    )

    // Create session for auto-login
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const sessionToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $1, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      [sessionToken, userId, expiresAt]
    )

    // Get user data
    const userData = await client.query(
      'SELECT id, name, full_name, email, role FROM users WHERE id = $1',
      [userId]
    )

    const response = NextResponse.json(
      { 
        message: 'Email verified successfully',
        user: userData.rows[0],
        redirect: userData.rows[0].role === 'vet' ? '/dashboard' : '/dashboard'
      },
      { status: 200 }
    )

    // Set session cookie
    response.cookies.set({
      name: 'session-token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Verify link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}