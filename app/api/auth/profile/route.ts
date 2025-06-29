import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db' // Adjust the path to your db.ts file

// Helper function to safely trim strings
function safeTrim(value: any): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null
  return value.trim()
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate phone format (basic validation)
function isValidPhone(phone: string): boolean {
  if (!phone) return true // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Helper function to get user from session
async function getUserFromSession(sessionToken: string) {
  const sessionResult = await client.query(
    `SELECT s.user_id, s.expires_at, u.id, u.name, u.full_name, u.email, u.phone, u.address, u.role, u.created_at
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [sessionToken]
  )

  if (sessionResult.rows.length === 0) {
    return null
  }

  return sessionResult.rows[0]
}

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromSession(sessionToken)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
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
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromSession(sessionToken)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, full_name, email, phone, address } = body

    // Safely trim values
    const trimmedName = safeTrim(name)
    const trimmedFullName = safeTrim(full_name)
    const trimmedEmail = safeTrim(email)
    const trimmedPhone = safeTrim(phone)
    const trimmedAddress = safeTrim(address)

    // Validate required fields
    if (!trimmedName || !trimmedFullName || !trimmedEmail) {
      return NextResponse.json(
        { error: 'Name, full name, and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const emailCheckResult = await client.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [trimmedEmail.toLowerCase(), user.id]
    )

    if (emailCheckResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 409 }
      )
    }

    // Check if username is already taken by another user
    const nameCheckResult = await client.query(
      'SELECT id FROM users WHERE name = $1 AND id != $2',
      [trimmedName, user.id]
    )

    if (nameCheckResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Update user profile
    const updateResult = await client.query(
      `UPDATE users 
       SET name = $1, full_name = $2, email = $3, phone = $4, address = $5
       WHERE id = $6
       RETURNING id, name, full_name, email, phone, address, role, created_at`,
      [
        trimmedName,
        trimmedFullName,
        trimmedEmail.toLowerCase(),
        trimmedPhone,
        trimmedAddress,
        user.id
      ]
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    const updatedUser = updateResult.rows[0]

    // Log the profile update
    console.log(`Profile updated for user ${updatedUser.id} (${updatedUser.email})`)

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Profile update error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'Email or username already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update specific profile fields
export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromSession(sessionToken)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const allowedFields = ['name', 'full_name', 'email', 'phone', 'address']
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    const setParts: string[] = []

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const trimmedValue = safeTrim(value)
        
        // Validate specific fields
        if (key === 'email' && trimmedValue && !isValidEmail(trimmedValue)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          )
        }

        if (key === 'phone' && trimmedValue && !isValidPhone(trimmedValue)) {
          return NextResponse.json(
            { error: 'Invalid phone number format' },
            { status: 400 }
          )
        }

        // Check for duplicates if updating email or name
        if (key === 'email' && trimmedValue) {
          const emailCheck = await client.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [trimmedValue.toLowerCase(), user.id]
          )
          if (emailCheck.rows.length > 0) {
            return NextResponse.json(
              { error: 'Email is already in use' },
              { status: 409 }
            )
          }
        }

        if (key === 'name' && trimmedValue) {
          const nameCheck = await client.query(
            'SELECT id FROM users WHERE name = $1 AND id != $2',
            [trimmedValue, user.id]
          )
          if (nameCheck.rows.length > 0) {
            return NextResponse.json(
              { error: 'Username is already taken' },
              { status: 409 }
            )
          }
        }

        const processedValue = (key === 'email' && trimmedValue) 
          ? trimmedValue.toLowerCase() 
          : trimmedValue

        setParts.push(`${key} = $${paramIndex}`)
        params.push(processedValue)
        paramIndex++
      }
    }

    if (setParts.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    params.push(user.id)

    const query = `
      UPDATE users 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, full_name, email, phone, address, role, created_at
    `

    const updateResult = await client.query(query, params)

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    const updatedUser = updateResult.rows[0]

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Profile patch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}