import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db'

// Helper function to generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (POST /api/auth/verify-email)
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
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in sessions table (prefixed with 'otp_')
    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $1, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      ['otp_' + otp, user.id, expiresAt]
    )

    // In production, send OTP via email/SMS here
    console.log(`OTP for ${email}: ${otp}`)

    return NextResponse.json(
      { 
        message: 'Verification code sent',
        // Remove this in production - only for testing
        debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify OTP (PUT /api/auth/verify-email)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Get user
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = userResult.rows[0].id

    // Verify OTP
    const sessionResult = await client.query(
      `SELECT token FROM sessions 
       WHERE user_id = $1 AND token = $2 AND expires_at > NOW()`,
      [userId, 'otp_' + otp]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark user as verified (you might want to add a verified column)
    // For now, we'll just delete the OTP and create a session
    await client.query(
      'DELETE FROM sessions WHERE user_id = $1 AND token LIKE $2',
      [userId, 'otp_%']
    )

    // Create a new session token
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
        user: userData.rows[0]
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
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Resend OTP (GET /api/auth/verify-email?email=xxx)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Just call the POST method internally
    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' }
    }))

  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}