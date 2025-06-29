import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db' // Adjust the path to your db.ts file

// Helper function to hash the password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// Simple function to create a session token
function createSessionToken(): string {
  // Create a random token using crypto
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Hash the provided password
    const hashedPassword = await hashPassword(password)

    // Check if user exists and password matches
    const result = await client.query(
      `SELECT id, name, full_name, email, phone, address, role, created_at, password 
       FROM users 
       WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Verify password
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create a simple session token
    const sessionToken = createSessionToken()
    const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 7 days from now

    // Store session in database
    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $1, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      [sessionToken, user.id, expiresAt]
    )

    // Update last login timestamp
    await client.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userWithoutPassword
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
    console.error('Login error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check if user is logged in
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Check session in database
    const sessionResult = await client.query(
      `SELECT s.user_id, s.expires_at, u.id, u.name, u.full_name, u.email, u.phone, u.address, u.role, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [sessionToken]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    const user = sessionResult.rows[0]

    return NextResponse.json(
      { 
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          created_at: user.created_at
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value

    if (sessionToken) {
      // Delete session from database
      await client.query(
        'DELETE FROM sessions WHERE token = $1',
        [sessionToken]
      )
    }

    // Clear cookie
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    response.cookies.delete('session-token')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}